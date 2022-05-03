import React from 'react';
import { buildVoyageSection, buildMovementInfoSection, buildTargetIndicatorsSection } from './TaskListSectionBuilder';

const TaskListCard = ({ targetTask, airlineCodes }) => {
  return (
    <div className="govuk-task-list-card">
      <div className="card-container">
        {buildVoyageSection(targetTask, airlineCodes)}
        {buildMovementInfoSection(targetTask)}
        {buildTargetIndicatorsSection(targetTask)}
      </div>
    </div>
  );
};

export default TaskListCard;
