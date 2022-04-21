import React from 'react';
import { buildVoyageSection, buildMovementInfoSection, buildTargetIndicatorsSection } from './airpax/TaskListSectionBuilder';

const TaskListCard = ({ targetTask }) => {
  return (
    <div className="govuk-task-list-card">
      <div className="card-container">
        {buildVoyageSection(targetTask)}
        {buildMovementInfoSection(targetTask)}
        {buildTargetIndicatorsSection(targetTask)}
      </div>
    </div>
  );
};

export default TaskListCard;
