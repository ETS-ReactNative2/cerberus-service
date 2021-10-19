// Third party imports
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useInterval } from 'react-use';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import * as pluralise from 'pluralise';
import qs from 'qs';
// Config
import { SHORT_DATE_FORMAT, LONG_DATE_FORMAT, TARGETER_GROUP, TASK_STATUS_COMPLETED, TASK_STATUS_IN_PROGRESS, TASK_STATUS_NEW, TASK_STATUS_TARGET_ISSUED } from '../../constants';
import config from '../../config';
// Utils
import useAxiosInstance from '../../utils/axiosInstance';
import { useKeycloak } from '../../utils/keycloak';
// Components/Pages
import ClaimButton from '../../components/ClaimTaskButton';
import ErrorSummary from '../../govuk/ErrorSummary';
import LoadingSpinner from '../../forms/LoadingSpinner';
import Pagination from '../../components/Pagination';
import Tabs from '../../govuk/Tabs';
import TaskListFilters from './TaskListFilters';
// Styling
import '../__assets__/TaskListPage.scss';

const TasksTab = ({ taskStatus, filtersToApply, setError }) => {
  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  const keycloak = useKeycloak();
  const location = useLocation();
  const camundaClient = useAxiosInstance(keycloak, config.camundaApiUrl);
  const source = axios.CancelToken.source();

  const [activePage, setActivePage] = useState(0);
  const [targetTasks, setTargetTasks] = useState([]);
  const [targetTaskCount, setTargetTaskCount] = useState(0);
  const [authorisedGroup, setAuthorisedGroup] = useState();

  const [isLoading, setLoading] = useState(true);

  // PAGINATION SETTINGS
  const index = activePage - 1;
  const itemsPerPage = 100;
  const offset = index * itemsPerPage;
  const totalPages = Math.ceil(targetTaskCount / itemsPerPage);

  // STATUS SETTINGS
  const currentUser = keycloak.tokenParsed.email;
  const activeTab = taskStatus;
  const targetStatus = {
    new: {
      url: '/task',
      variableUrl: '/variable-instance',
      statusRules: {
        processVariables: `processState_neq_Complete,${filtersToApply}`,
        unassigned: true,
        sortBy: 'dueDate',
        sortOrder: 'asc',
      },
    },
    inProgress: {
      url: '/task',
      variableUrl: '/variable-instance',
      statusRules: {
        variables: `processState_neq_Complete,${filtersToApply}`,
        assigned: true,
      },
    },
    issued: {
      url: '/process-instance',
      variableUrl: '/variable-instance',
      statusRules: {
        variables: `processState_eq_Issued,${filtersToApply}`,
      },
    },
    complete: {
      url: '/history/process-instance',
      variableUrl: '/history/variable-instance',
      statusRules: {
        variables: `processState_eq_Complete,${filtersToApply}`,
        processDefinitionKey: 'assignTarget',
      },
    },
  };

  const formatTargetRisk = (target) => {
    if (target.risks) {
      const topRisk = target.risks[0].contents
        ? `SELECTOR: ${target.risks[0].contents.groupReference}, ${target.risks[0].contents.category}, ${target.risks[0].contents.threatType}`
        : `${target.risks[0].name}, ${target.risks[0].rulePriority}, ${target.risks[0].abuseType}`;
      const count = target.risks.length - 1;
      return `${topRisk} and ${pluralise.withCount(count, '% other rule', '% other rules')}`;
    }
    return 0;
  };

  const loadTasks = async () => {
    if (camundaClient) {
      try {
        setLoading(true);
        /*
        * For pagination rules we need to get a count of total tasks that match the criteria for that status
        * the same criteria is then used to create the target summary below
        */
        const getTargetTaskCount = await camundaClient.get(
          `${targetStatus[activeTab].url}/count`,
          { params: targetStatus[activeTab].statusRules },
        );
        setTargetTaskCount(getTargetTaskCount.data.count);

        /*
        * To provide a user with a summary and the ability to claim/unclaim (when correct conditions are met)
        * We need to get the targets that match the criteria for that status
        * then use the processInstanceIds (when the url is /tasks) or the ids (when the url is /process-instance) from the targetTaskList data to get the targetTaskSummary data
        */
        const targetTaskList = await camundaClient.get(
          targetStatus[activeTab].url,
          { params: { ...targetStatus[activeTab].statusRules, firstResult: offset, maxResults: itemsPerPage } },
        );
        const processInstanceIds = _.uniq(targetTaskList.data.map(({ processInstanceId, id }) => processInstanceId || id)).join(',');
        const targetTaskListItems = await camundaClient.get(
          targetStatus[activeTab].variableUrl,
          { params: { variableName: 'taskSummaryBasedOnTIS', processInstanceIdIn: processInstanceIds, deserializeValues: false } },
        );
        const targetTaskListData = targetTaskListItems.data.map((task) => {
          return {
            processInstanceId: task.processInstanceId,
            ...JSON.parse(task.value),
          };
        });

        /*
        * If the targetStatus is 'new' or 'in progress' we must include the task id and assignee
        * so we can show/hide claim details AND allow tasks to be claimed/unclaimed
        */
        let parsedTargetTaskListData;
        if (activeTab === TASK_STATUS_NEW || activeTab === TASK_STATUS_IN_PROGRESS) {
          const mergedTargetData = targetTaskListData.map((task) => {
            const matchedTargetTask = targetTaskList.data.find((v) => task.processInstanceId === v.processInstanceId);
            return {
              ...task,
              ...matchedTargetTask,
            };
          });
          parsedTargetTaskListData = mergedTargetData;
        } else {
          parsedTargetTaskListData = targetTaskListData;
        }

        /*
         * We initially grab the tasks from camunda in a sorted order (by 'due' asc)
         * However after using the tasks data to query the variable endpoint we lose the
         * sorting we had before. As a result, the amalgamation of /tasks and /variable api calls
         * is sorted by the 'due' property to ensure the task list is in asc order
        */
        setTargetTasks(parsedTargetTaskListData.sort((a, b) => {
          const dateA = new Date(a.due);
          const dateB = new Date(b.due);
          return (a.due === null) - (b.due === null) || +(dateA > dateB) || -(dateA < dateB);
        }));
      } catch (e) {
        setError(e.message);
        setTargetTasks([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const { page } = qs.parse(location.search, { ignoreQueryPrefix: true });
    const newActivePage = parseInt(page || 1, 10);
    setActivePage(newActivePage);
  }, [location.search]);

  useEffect(() => {
    const isTargeter = (keycloak.tokenParsed.groups).indexOf(TARGETER_GROUP) > -1;
    if (!isTargeter) {
      setLoading(false);
      setAuthorisedGroup(false);
    }
    if (activePage > 0 && isTargeter) {
      setAuthorisedGroup(true);
      loadTasks();
      return () => {
        source.cancel('Cancelling request');
      };
    }
  }, [activePage, filtersToApply]);

  useInterval(() => {
    const isTargeter = (keycloak.tokenParsed.groups).indexOf(TARGETER_GROUP) > -1;
    if (isTargeter) {
      setLoading(true);
      loadTasks();
      return () => {
        source.cancel('Cancelling request');
      };
    }
  }, 60000);

  return (
    <>
      {isLoading && <LoadingSpinner><br /><br /><br /></LoadingSpinner>}
      {!isLoading && !authorisedGroup && (
        <p>You are not authorised to view these tasks.</p>
      )}
      {!isLoading && authorisedGroup && targetTasks.length === 0 && (
        <p className="govuk-body-l">No tasks available</p>
      )}
      {/* The count tasks below will be moved to the tab names in a future story */}
      <p className="govuk-body-s">{targetTaskCount} tasks</p>
      {!isLoading && authorisedGroup && targetTasks.length > 0 && targetTasks.map((target) => {
        const passengers = target.roro.details.passengers;
        const escapedBusinessKey = encodeURIComponent(target.parentBusinessKey.businessKey);
        return (
          <section className="task-list--item" key={target.parentBusinessKey.businessKey}>
            <div className="govuk-grid-row title-container">
              <div className="govuk-grid-column-three-quarters heading-container">
                <h3 className="govuk-heading-m task-heading">
                  <Link
                    className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold task-list--businessKey"
                    to={`/tasks/${escapedBusinessKey}`}
                  >
                    {escapedBusinessKey}
                  </Link>
                </h3>
                <h4 className="govuk-heading-m govuk-!-font-weight-regular task-heading">
                  {target.roro.details.movementStatus}
                </h4>
              </div>
              <div className="govuk-grid-column-one-quarter govuk-!-font-size-19">
                { (activeTab === TASK_STATUS_NEW || activeTab === TASK_STATUS_IN_PROGRESS || currentUser === target.assignee)
                  && (
                  <ClaimButton
                    className="govuk-!-font-weight-bold"
                    assignee={target.assignee}
                    taskId={target.id}
                    setError={setError}
                    businessKey={escapedBusinessKey}
                  />
                  )}
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <p className="govuk-body task-risk-statement">{formatTargetRisk(target)}</p>
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <ul className="govuk-list govuk-body-s content-line-one">
                  <li>{target.roro.details.vessel.company && `${target.roro.details.vessel.company} voyage of `}{target.roro.details.vessel.name}</li>
                  <li>arrival {!target.roro.details.eta ? 'unknown' : dayjs.utc(target.roro.details.eta).fromNow() }</li>
                </ul>
                <ul className="govuk-list content-line-two govuk-!-margin-bottom-4">
                  <li className="govuk-!-font-weight-bold">{target.roro.details.departureLocation || 'unknown'}</li>
                  <li>{!target.roro.details.departureTime ? 'unknown' : dayjs.utc(target.roro.details.departureTime).format(LONG_DATE_FORMAT)}</li>
                  <li className="govuk-!-font-weight-bold">{target.roro.details.arrivalLocation || 'unknown'}</li>
                  <li>{!target.roro.details.eta ? 'unknown' : dayjs.utc(target.roro.details.eta).format(LONG_DATE_FORMAT)}</li>
                </ul>
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-quarter">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Driver details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.driver ? (
                    <>
                      {target.roro.details.driver.firstName && <li className="govuk-!-font-weight-bold">{target.roro.details.driver.firstName}</li>}
                      {target.roro.details.driver.middleName && <li className="govuk-!-font-weight-bold">{target.roro.details.driver.middleName}</li>}
                      {target.roro.details.driver.lastName && <li className="govuk-!-font-weight-bold">{target.roro.details.driver.lastName}</li>}
                      {target.roro.details.driver.dob && <li>DOB: {target.roro.details.driver.dob}</li>}
                      <li>{pluralise.withCount(target.aggregateDriverTrips || '?', '% trip', '% trips')}</li>
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Passenger details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.passengers ? (
                    <>
                      <li className="govuk-!-font-weight-bold">{pluralise.withCount(passengers.length, '% passenger', '% passengers')}</li>
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>

              <div className="govuk-grid-column-one-quarter">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Vehicle details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.vehicle ? (
                    <>
                      {target.roro.details.vehicle.registrationNumber && <li className="govuk-!-font-weight-bold">{target.roro.details.vehicle.registrationNumber}</li>}
                      {target.roro.details.vehicle.colour && <li>{target.roro.details.vehicle.colour}</li>}
                      {target.roro.details.vehicle.make && <li>{target.roro.details.vehicle.make}</li>}
                      {target.roro.details.vehicle.model && <li>{target.roro.details.vehicle.model}</li>}
                      <li>{pluralise.withCount(target.aggregateVehicleTrips || 0, '% trip', '% trips')}</li>
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">No vehicle</li>)}
                </ul>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Trailer details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.vehicle.trailer ? (
                    <>
                      {target.roro.details.vehicle.trailer.regNumber && <li className="govuk-!-font-weight-bold">{target.roro.details.vehicle.trailer.regNumber}</li>}
                      {target.roro.details.vehicle.trailerType && <li>{target.roro.details.vehicle.trailerType}</li>}
                      <li>{pluralise.withCount(target.aggregateTrailerTrips || 0, '% trip', '% trips')}</li>
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">No trailer</li>)}
                </ul>
              </div>

              <div className="govuk-grid-column-one-quarter">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Haulier details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.haulier?.name ? (
                    <>
                      {target.roro.details.haulier.name && <li className="govuk-!-font-weight-bold">{target.roro.details.haulier.name}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Account details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.account ? (
                    <>
                      {target.roro.details.account.name && <li className="govuk-!-font-weight-bold">{target.roro.details.account.name}</li>}
                      {target.roro.details.bookingDateTime && <li>Booked on {dayjs.utc(target.roro.details.bookingDateTime).format(SHORT_DATE_FORMAT)}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>
              <div className="govuk-grid-column-one-quarter">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Goods details
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {target.roro.details.load.manifestedLoad ? (
                    <>
                      {target.roro.details.load.manifestedLoad && <li className="govuk-!-font-weight-bold">{target.roro.details.load.manifestedLoad}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <ul className="govuk-list task-labels govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                  <li className="task-labels-item">
                    <strong className="govuk-tag govuk-tag--positiveTarget">
                      {target.matchedSelectors?.[0]?.priority || 'Unknown'}
                    </strong>
                  </li>
                  <li className="task-labels-item">
                    {target.matchedSelectors?.[0]?.threatType || 'Unknown'}
                  </li>
                </ul>
              </div>
            </div>
          </section>
        );
      })}

      <Pagination
        totalItems={targetTaskCount}
        itemsPerPage={itemsPerPage}
        activePage={activePage}
        totalPages={totalPages}
      />
    </>
  );
};

const TaskListPage = () => {
  const [error, setError] = useState(null);
  const history = useHistory();
  const [filterList, setFilterList] = useState([]);
  const [filtersToApply, setFiltersToApply] = useState('');

  const applyFilters = (filtersSelected) => {
    if (filtersSelected) {
      setFiltersToApply(`movementMode_eq_${filtersSelected}`);
    }
  };

  const clearFilters = () => {
    setFiltersToApply('');
  };

  /* We currently only have RoRo cases
   * and there are 3 options
   * that must be specified as below
   * to be able to make the API call successfully
   * so they are hardcoded for this implementation
  */
  const createFilterList = () => {
    setFilterList([
      {
        name: 'roro-unaccompanied-freight',
        code: 'roro-unaccompanied-freight',
        label: 'RoRo unaccompanied freight',
        checked: false,
      },
      {
        name: 'roro-accompanied-freight',
        code: 'roro-accompanied-freight',
        label: 'RoRo accompanied freight',
        checked: false,
      },
      {
        name: 'roro-tourist',
        code: 'roro-tourist',
        label: 'RoRo tourist',
        checked: false,
      },
    ]);
  };

  useEffect(() => {
    applyFilters(localStorage.getItem('filtersSelected') || '');
    createFilterList();
  }, []);

  return (
    <>
      <h1 className="govuk-heading-xl">Task management</h1>

      {error && (
        <ErrorSummary
          title="There is a problem"
          errorList={[
            { children: error },
          ]}
        />
      )}

      <div className="govuk-grid-row">
        <section className="govuk-grid-column-one-quarter">
          <TaskListFilters
            filterList={filterList}
            filterName="roroMode"
            filterType="filterTypeSelect"
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
          />
        </section>

        <section className="govuk-grid-column-three-quarters">
          <Tabs
            title="Title"
            id="tasks"
            onTabClick={() => { history.push(); }}
            items={[
              {
                id: 'new',
                label: 'New',
                panel: (
                  <>
                    <h2 className="govuk-heading-l">New tasks</h2>
                    <TasksTab taskStatus={TASK_STATUS_NEW} filtersToApply={filtersToApply} setError={setError} />
                  </>
                ),
              },
              {
                id: 'in-progress',
                label: 'In progress',
                panel: (
                  <>
                    <h2 className="govuk-heading-l">In progress tasks</h2>
                    <TasksTab taskStatus={TASK_STATUS_IN_PROGRESS} filtersToApply={filtersToApply} setError={setError} />
                  </>
                ),
              },
              {
                id: 'target-issued',
                label: 'Target issued',
                panel: (
                  <>
                    <h2 className="govuk-heading-l">Target issued tasks</h2>
                    <TasksTab taskStatus={TASK_STATUS_TARGET_ISSUED} filtersToApply={filtersToApply} setError={setError} />
                  </>
                ),
              },
              {
                id: 'complete',
                label: 'Complete',
                panel: (
                  <>
                    <h2 className="govuk-heading-l">Completed tasks</h2>
                    <TasksTab taskStatus={TASK_STATUS_COMPLETED} filtersToApply={filtersToApply} setError={setError} />
                  </>
                ),
              },
            ]}
          />
        </section>
      </div>
    </>
  );
};

export default TaskListPage;
