/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import useAxiosInstance from '../../../utils/axiosInstance';
import { useKeycloak } from '../../../utils/keycloak';

// Config
import config from '../../../config';

// Components/Pages
import LoadingSpinner from '../../../components/LoadingSpinner';
import Pagination from '../../../components/Pagination';
import TaskListCard from './TaskListCard';

const TasksTab = ({ taskStatus, filtersToApply, targetTaskCount = 0 }) => {
  dayjs.extend(relativeTime);
  dayjs.extend(utc);
  const keycloak = useKeycloak();

  const apiClient = useAxiosInstance(keycloak, config.taskApiUrl);
  const refDataClient = useAxiosInstance(keycloak, config.refdataApiUrl);
  const source = axios.CancelToken.source();

  const [activePage, setActivePage] = useState(0);
  const [targetTasks, setTargetTasks] = useState([]);
  const [refDataAirlineCodes, setRefDataAirlineCodes] = useState([]);

  const [isLoading, setLoading] = useState(true);
  const [refreshTaskList, setRefreshTaskList] = useState(false);

  // PAGINATION SETTINGS
  const index = activePage - 1;
  const itemsPerPage = 100;
  const offset = index * itemsPerPage < 0 ? 0 : index * itemsPerPage;
  const totalPages = Math.ceil(targetTaskCount / itemsPerPage);

  // TEMP VALUES FOR TESTING UNTIL API ACTIVE
  const tempData = {
    data: [
      // paste data from the relevant fixture here for testing this page
    ],
  };

  const getTaskList = async () => {
    setLoading(true);
    let response;
    const tab = taskStatus === 'inProgress' ? 'IN_PROGRESS' : taskStatus.toUpperCase();
    const sortParams = taskStatus === 'new' || taskStatus === 'inProgress'
      ? [
        {
          field: 'ARRIVAL_TIME',
          order: 'ASC',
        },
        {
          field: 'THREAT_LEVEL',
          order: 'DESC',
        },
      ]
      : null;
    try {
      response = await apiClient.post('/targeting-tasks/pages', {
        status: tab,
        filterParams: filtersToApply,
        sortParams,
        pageParams: {
          limit: itemsPerPage,
          offset,
        },
      });
      setTargetTasks(response.data);
    } catch (e) {
      // until API is ready we set the temp data in the catch
      // this will be changed to the error handling
      response = tempData;
      setTargetTasks(response.data);
    } finally {
      setLoading(false);
      setRefreshTaskList(false);
    }
  };

  const getAirlineCodes = async () => {
    let response;
    try {
      response = await refDataClient.get('/v2/entities/carrierlist', {
        params: {
          mode: 'dataOnly',
        },
      });
      setRefDataAirlineCodes(response.data.data);
    } catch (e) {
      setRefDataAirlineCodes([]);
    }
  };

  useEffect(() => {
    setRefreshTaskList(true);
  }, [filtersToApply]);

  useEffect(() => {
    if (refreshTaskList === true) {
      getTaskList();
      return () => {
        source.cancel('Cancelling request');
      };
    }
  }, [refreshTaskList]);

  useEffect(() => {
    getAirlineCodes();
    return () => {
      source.cancel('Cancelling request');
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (targetTasks.length === 0) {
    return <p className="govuk-body-l">There are no {taskStatus} tasks</p>;
  }

  return (
    <>
      <Pagination
        totalItems={targetTaskCount}
        itemsPerPage={itemsPerPage}
        activePage={activePage}
        totalPages={totalPages}
      />

      {targetTasks.map((targetTask) => {
        return (
          <TaskListCard key={targetTask.id} targetTask={targetTask} airlineCodes={refDataAirlineCodes} />
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

export default TasksTab;
