import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import useAxiosInstance from '../utils/axiosInstance';
import { useKeycloak } from '../utils/keycloak';

// Config
import config from '../config';

const ClaimUnclaimTask = ({ assignee, currentUser, businessKey, source, buttonType }) => {
  const keycloak = useKeycloak();
  const apiClient = useAxiosInstance(keycloak, config.taskApiUrl);

  const history = useHistory();
  const isAssignedTo = assignee === currentUser ? 'you' : assignee;
  const [isAssignmentInProgress, setIsAssignmentInProgress] = useState(false);
  const [isAlreadyAssignedWarning, setAlreadyAssignedWarning] = useState(false);

  const CommonText = () => {
    return buttonType === 'textLink' ? 'Task not assigned' : null;
  };

  const CommonButton = (p) => {
    const linkClass = buttonType === 'textLink' ? 'link-button govuk-!-font-size-19' : 'link-button govuk-!-font-weight-bold govuk-button';
    return (
      isAssignmentInProgress
        ? <span className="govuk-body">Please wait...</span>
        : <button className={linkClass} type="button" {...p} />
    );
  };

  const handleClaim = async () => {
    try {
      setIsAssignmentInProgress(true);
      await apiClient.post(`/targeting-tasks/${businessKey}/claim`, {
        userId: currentUser,
      });
      if (history.location.pathname !== `/airpax/tasks/${businessKey}`) {
        history.push(source);
      } else {
        history.go(0);
      }
    } catch {
      console.log('claimTask post fails as already assigned');
      setAlreadyAssignedWarning(true);
    } finally {
      setIsAssignmentInProgress(false);
    }
  };

  const handleUnclaim = async () => {
    try {
      setIsAssignmentInProgress(true);
      await apiClient.post(`/targeting-tasks/${businessKey}/unclaim`, {
        userId: currentUser,
      });
      history.push(
        { pathname: '/airpax/tasks' },
      );
      window.scrollTo(0, 0);
    } catch {
      console.log('unclaim post fails');
      setIsAssignmentInProgress(false);
    } finally {
      setIsAssignmentInProgress(false);
    }
  };

  if (isAlreadyAssignedWarning) {
    return (
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          {`Task already assigned to ${assignee}`}
        </strong>
      </div>
    );
  }
  if (!assignee && !isAlreadyAssignedWarning) {
    return (
      <>
        <span className="govuk-body task-list--assignee">
          <CommonText />&nbsp;
        </span>
        <CommonButton onClick={handleClaim}>Claim</CommonButton>
      </>
    );
  }
  return (
    <>
      <span className="govuk-body task-list--assignee">
        {`Assigned to ${isAssignedTo}`}&nbsp;
      </span>
      <CommonButton onClick={handleUnclaim}>Unclaim task</CommonButton>
    </>
  );
};

export default ClaimUnclaimTask;
