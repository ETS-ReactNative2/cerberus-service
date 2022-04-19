import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Config
import config from '../../../config';
// Utils
import useAxiosInstance from '../../../utils/axiosInstance';
import { useKeycloak } from '../../../utils/keycloak';
// Components/Pages
import ActivityLog from '../../../components/ActivityLog';
import LoadingSpinner from '../../../components/LoadingSpinner';

const TaskDetailsPage = () => {
  const { businessKey } = useParams();
  const keycloak = useKeycloak();
  const apiClient = useAxiosInstance(keycloak, config.taskApiUrl);
  const currentUser = keycloak.tokenParsed.email;
  const [assignee, setAssignee] = useState();
  const [taskData, setTaskData] = useState();
  const [isLoading, setLoading] = useState(true);

  // TEMP VALUES FOR TESTING
  const tempData = {
    data: {
      id: 'DEV-20220414-001',
      status: 'NEW',
      assignee: null,
      notes: [
        {
          content: 'task created',
          timestamp: '2022-04-14T08:18:09.888175Z',
          userId: 'rules-based-targeting',
        },
        {
          content: 'a note that existed previously',
          timestamp: '2021-10-01T01:15:35Z',
          userId: 'jane.doe@digital.homeoffice.gov.uk',
        },
        {
          content: "joe's test note",
          timestamp: '2021-12-11T05:10:59Z',
          userId: 'joe.bloggs@digital.homeoffice.gov.uk',
        },
        {
          content: 'really long note more words more words more words more words more words more words more words more words more words more words more words more words more words more words more words more words more words more words more words  more words  more words  more word',
          timestamp: '2021-10-01T01:15:35Z',
          userId: 'jane.doe@digital.homeoffice.gov.uk',
        },
        {
          content: "joe's test note",
          timestamp: '2021-12-11T05:10:59Z',
          userId: 'joe.bloggs@digital.homeoffice.gov.uk',
        },
      ],
    },
  };

  const getTaskData = async () => {
    let response;
    try {
      response = await apiClient.get(`/targeting-tasks/${businessKey}`);
      setTaskData(response.data);
    } catch {
      // until API is ready we set the temp data in the catch
      // this will be changed to the error handling
      response = tempData;
      setTaskData(response.data);
    }
  };

  useEffect(() => {
    if (taskData) {
      setAssignee(taskData.assignee);
      setLoading(false);
    }
  }, [taskData, setAssignee, setLoading]);

  useEffect(() => {
    getTaskData();
  }, [businessKey]);

  // TEMP NOTES FORM FOR TESTING
  const AddANoteForm = () => {
    return (
      <div>
        Add a new note
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner><br /><br /><br /></LoadingSpinner>;
  }

  return (
    <>
      <div className="govuk-grid-row govuk-task-detail-header govuk-!-padding-bottom-9">
        <div className="govuk-grid-column-one-half">
          <span className="govuk-caption-xl">{businessKey}</span>
          <h3 className="govuk-heading-xl govuk-!-margin-bottom-0">Overview</h3>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          Versions go here
        </div>
        <div className="govuk-grid-column-one-third">
          {currentUser === assignee && <AddANoteForm />}
          <ActivityLog
            activityLog={taskData?.notes}
          />
        </div>
      </div>

    </>
  );
};

export default TaskDetailsPage;
