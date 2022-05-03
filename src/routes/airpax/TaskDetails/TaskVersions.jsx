import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as pluralise from 'pluralise';
// Config
import { LONG_DATE_FORMAT } from '../../../constants';
// Components/govuk
import Accordion from '../../../govuk/Accordion';
import Booking from './builder/Booking';

const renderDetailsOverview = (version) => {
  return (
    <>
      <div className="govuk-task-details-grid">
        <div className="govuk-grid-column-one-third" />
        <div className="govuk-grid-column-one-third vertical-dotted-line">
          <div className="govuk-task-details-col-2">
            <Booking version={version} />
          </div>
        </div>
        <div className="govuk-grid-column-one-third vertical-dotted-line" />
      </div>
    </>
  );
};

const TaskVersions = ({ taskVersions, businessKey, taskVersionDifferencesCounts }) => {
  dayjs.extend(utc);
  return (
    <Accordion
      className="task-versions"
      id={`task-versions-${businessKey}`}
      items={
        taskVersions.map((version, index) => {
          const threatLevel = version.risks.highestThreatLevel;
          const sections = renderDetailsOverview(version);
          return {
            expanded: index === 0,
            heading: `Version ${version.number}${index === 0 ? ' (latest)' : ''}`,
            summary: (
              <>
                <div className="task-versions--left">
                  <div className="govuk-caption-m">{dayjs.utc(version.createdAt).format(LONG_DATE_FORMAT)}</div>
                </div>
                <div className="task-versions--right">
                  <ul className="govuk-list">
                    { taskVersionDifferencesCounts
                      ? <li>{pluralise.withCount(taskVersionDifferencesCounts[index], '% change', '% changes', 'No changes')} in this version</li>
                      : <li>No changes in this version</li> }
                    {threatLevel?.type === 'RULE' && <li>Highest threat level is <span className="govuk-body govuk-tag govuk-tag--positiveTarget">{threatLevel.value}</span></li>}
                    {threatLevel?.type === 'SELECTOR' && <li>Highest threat level is <span className="govuk-body govuk-tag govuk-tag--positiveTarget">Category {threatLevel.value}</span></li>}
                    {!threatLevel && <li>No rule matches</li>}
                  </ul>
                </div>
              </>
            ),
            children: sections,
          };
        })
      }
    />

  );
};

export default TaskVersions;
