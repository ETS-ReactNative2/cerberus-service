import React, { Fragment } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as pluralise from 'pluralise';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import Accordion from '../../govuk/Accordion';
import TaskSummary from './TaskSummary';
import { formatField } from '../../utils/formatField';
import RoRoAccompaniedTaskVersion from './TaskVersionsMode/RoRoAccompaniedMode';
import RoRoUnaccompaniedTaskVersion from './TaskVersionsMode/RoRoUnaccompaniedMode';
import RoRoTouristTaskVersion from './TaskVersionsMode/RoRoTouristMode';
// config
import { RORO_TOURIST, LONG_DATE_FORMAT, RORO_TOURIST_CAR_ICON,
  RORO_TOURIST_SINGLE_ICON, RORO_TOURIST_GROUP_ICON, RORO_ACCOMPANIED_FREIGHT, RORO_UNACCOMPANIED_FREIGHT } from '../../constants';
// utils
import getMovementModeIcon from '../../utils/getVehicleModeIcon';
import { modifyRoRoPassengersTaskDetails } from '../../utils/roroDataUtil';
import { capitalizeFirstLetter } from '../../utils/stringConversion';

let threatLevel;

const isLatest = (index) => {
  return index === 0 ? '(latest)' : '';
};

const renderFieldSetContents = (contents) => contents.map(({ fieldName, content, type }) => {
  if (!type.includes('HIDDEN')) {
    return (
      <div className="govuk-summary-list__row" key={uuidv4()}>
        <dt className="govuk-summary-list__key">{type.includes('CHANGED') ? <span className="task-versions--highlight">{fieldName}</span> : fieldName}</dt>
        <dd className="govuk-summary-list__value">{formatField(type, content)}</dd>
      </div>
    );
  }
});

const renderChildSets = (childSets) => {
  return childSets.map((child) => {
    if (child.hasChildSet) {
      return (
        <div key={uuidv4()} className="govuk-!-margin-bottom-6">
          {renderFieldSetContents(child.contents)}
          {renderChildSets(child.childSets)}
        </div>
      );
    }
    return (
      <Fragment key={uuidv4()}>
        {renderFieldSetContents(child.contents)}
      </Fragment>
    );
  });
};

const renderFieldSets = (fieldSet) => {
  if (fieldSet.hasChildSet) {
    return (
      <Fragment key={uuidv4()}>
        {renderFieldSetContents(fieldSet.contents)}
        {renderChildSets(fieldSet.childSets)}
      </Fragment>
    );
  }
  return renderFieldSetContents(fieldSet.contents);
};

const stripOutSectionsByMovementMode = (version, movementMode) => {
  if (movementMode.toUpperCase() === RORO_TOURIST.toUpperCase()) {
    const vehicle = {
      registrationNumber: version.find(({ propName }) => propName === 'vehicle').contents.find(({ propName }) => propName === 'registrationNumber').content,
    };
    const passengers = version.find(({ propName }) => propName === 'passengers').childSets;
    const movementModeIcon = getMovementModeIcon(movementMode, vehicle, passengers);
    if (movementModeIcon === RORO_TOURIST_CAR_ICON) {
      return version.filter(({ propName }) => propName !== 'haulier' && propName !== 'account' && propName !== 'goods');
    }
    if (movementModeIcon === RORO_TOURIST_SINGLE_ICON) {
      return version.filter(({ propName }) => propName !== 'haulier' && propName !== 'account' && propName !== 'goods' && propName !== 'vehicle' && propName !== 'driver');
    }
    if (movementModeIcon === RORO_TOURIST_GROUP_ICON) {
      return version.filter(({ propName }) => propName !== 'haulier' && propName !== 'account' && propName !== 'goods' && propName !== 'vehicle' && propName !== 'driver');
    }
  }
  return version;
};

const renderSelectorsSection = (version) => {
  const selectors = version.find(({ propName }) => propName === 'selectors');
  threatLevel = null;
  if (selectors.childSets.length > 0) {
    const selector = selectors.childSets[0].contents.find(({ propName }) => propName === 'category');
    threatLevel = `${capitalizeFirstLetter(selector.propName)} ${selector.content}`;
    return (
      <div className={selectors.propName}>
        <h2 className="govuk-heading-m">{selectors.fieldSetName}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-9">
          {renderFieldSets(selectors)}
        </dl>
      </div>
    );
  }
};

const renderRulesSection = (version) => {
  const field = version.find(({ propName }) => propName === 'rules');
  if (field.childSets.length > 0) {
    const firstRule = field.childSets[0];
    const otherRules = field.childSets.slice(1);
    threatLevel = threatLevel || firstRule.contents.find((item) => item.propName === 'rulePriority')?.content;
    return (
      <div className="govuk-rules-section">
        <div>
          <h2 className="govuk-heading-m rules-header">{field.fieldSetName}</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-quarter">
              <h4 className="govuk-heading-s">Rule name</h4>
              <p>{firstRule.contents.find((item) => item.propName === 'name').content}</p>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <h4 className="govuk-heading-s">Threat</h4>
              <p className="govuk-body govuk-tag govuk-tag--positiveTarget">
                {firstRule.contents.find((item) => item.propName === 'rulePriority').content}
              </p>
            </div>

            <div className="govuk-grid-column-one-quarter">
              <h4 className="govuk-heading-s">Rule verison</h4>
              <p>{firstRule.contents.find((item) => item.propName === 'ruleVersion').content}</p>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <h4 className="govuk-heading-s">Abuse Type</h4>
              <p>{firstRule.contents.find((item) => item.propName === 'abuseType').content}</p>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-three-quarters">
              <h4 className="govuk-heading-s">Description</h4>
              <p>{firstRule.contents.find((item) => item.propName === 'description').content}</p>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <h4 className="govuk-heading-s">Agency</h4>
              <p>{firstRule.contents.find((item) => item.propName === 'agencyCode').content}</p>
            </div>
          </div>
        </div>

        { otherRules.length > 0 && (
        <div>
          <h2 className="govuk-heading-m other-rules-header">Other rule matches ({otherRules.length})</h2>
          {otherRules.map((rule, index) => (
            <div key={index}>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-quarter">
                  <h4 className="govuk-heading-s">Rule name</h4>
                  <p>{rule.contents.find((item) => item.propName === 'name').content}</p>
                </div>
                <div className="govuk-grid-column-one-quarter">
                  <h4 className="govuk-heading-s">Threat</h4>
                  <p className="govuk-body govuk-tag govuk-tag--positiveTarget">
                    {rule.contents.find((item) => item.propName === 'rulePriority').content}
                  </p>
                </div>

                <div className="govuk-grid-column-one-quarter">
                  <h4 className="govuk-heading-s">Rule verison</h4>
                  <p>{rule.contents.find((item) => item.propName === 'ruleVersion').content}</p>
                </div>
                <div className="govuk-grid-column-one-quarter">
                  <h4 className="govuk-heading-s">Abuse Type</h4>
                  <p>{rule.contents.find((item) => item.propName === 'abuseType').content}</p>
                </div>
              </div>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">View further details</span>
                </summary>
                <div className="govuk-details__text" style={{ overflow: 'hidden' }}>
                  <div className="govuk-grid-column-three-quarters">
                    <h4 className="govuk-heading-s">Description</h4>
                    <p>{rule.contents.find((item) => item.propName === 'description').content}</p>
                  </div>
                  <div className="govuk-grid-column-one-quarter">
                    <h4 className="govuk-heading-s">Agency</h4>
                    <p>{rule.contents.find((item) => item.propName === 'agencyCode').content}</p>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  }
};

/**
 * This will handle portions of the movement data and apply the neccessary changes
 * before they are rendered.
 */
const renderSectionsBasedOnTIS = (movementMode, taskSummaryBasedOnTIS, version) => {
  const vehicle = {
    registrationNumber: version.find(({ propName }) => propName === 'vehicle')?.contents.find(({ propName }) => propName === 'registrationNumber')?.content,
  };
  const passengers = version.find(({ propName }) => propName === 'passengers').childSets;
  const movementModeIcon = getMovementModeIcon(movementMode, vehicle, passengers);
  return (
    <>
      <div>
        <TaskSummary movementMode={movementMode} taskSummaryData={taskSummaryBasedOnTIS} />
      </div>
      {movementMode === RORO_ACCOMPANIED_FREIGHT && (
      <RoRoAccompaniedTaskVersion
        version={version}
        movementMode={movementMode}
        taskSummaryData={taskSummaryBasedOnTIS}
      />
      )}
      {movementMode === RORO_UNACCOMPANIED_FREIGHT && (
      <RoRoUnaccompaniedTaskVersion
        version={version}
        movementMode={movementMode}
        taskSummaryData={taskSummaryBasedOnTIS}
      />
      )}
      {movementMode === RORO_TOURIST && (
      <RoRoTouristTaskVersion
        version={version}
        movementMode={movementMode}
        movementModeIcon={movementModeIcon}
        taskSummaryData={taskSummaryBasedOnTIS}
      />
      )}
      <div className="">
        {renderSelectorsSection(version)}
      </div>
      <div>
        {renderRulesSection(version)}
      </div>
    </>
  );
};

const renderHighestThreatLevel = (version) => {
  let threatsArray = [];
  const childSets = version.find(({ propName }) => propName === 'selectors').childSets;
  if (childSets && childSets.length) {
    childSets.map((set) => {
      set.contents.map((c) => {
        if (c.propName === 'category') threatsArray.push(c.content);
      });
    });
  }

  return threatsArray.length ? `CATEGORY ${threatsArray.sort()[0]}` : threatLevel;
};

const TaskVersions = ({ taskSummaryBasedOnTIS, taskVersions, businessKey, taskVersionDifferencesCounts, movementMode }) => {
  dayjs.extend(utc);
  /*
   * There can be multiple versions of the data
   * We need to display each version
   * We currently get the data as an array of unnamed objects
   * That contain an array of unnamed objects
   * There is a plan to name the objects in the future
   * But for now we have to find the relevant object by looking at the propName
   */
  return (
    <Accordion
      className="task-versions"
      id={`task-versions-${businessKey}`}
      items={
        /* the task data is provided in an array,
         * there is only ever one item in the array
         */
        taskVersions.map((version, index) => {
          const booking = version.find((fieldset) => fieldset.propName === 'booking') || null;
          const bookingDate = booking?.contents.find((field) => field.propName === 'dateBooked').content || null;
          const versionNumber = taskVersions.length - index;
          const regexToReplace = /\s/g;
          const formattedMovementMode = movementMode.replace(regexToReplace, '_').toUpperCase();
          const modifiedVersion = modifyRoRoPassengersTaskDetails(_.cloneDeep(version)); // Added our driver details into passengers array (similar to task list page)
          const filteredVersion = stripOutSectionsByMovementMode(modifiedVersion, formattedMovementMode);
          const detailSectionTest = renderSectionsBasedOnTIS(formattedMovementMode, taskSummaryBasedOnTIS, filteredVersion);
          return {
            expanded: index === 0,
            heading: `Version ${versionNumber} ${isLatest(index)}`,
            summary: (
              <>
                <div className="task-versions--left">
                  <div className="govuk-caption-m">{dayjs.utc(bookingDate ? bookingDate.split(',')[0] : null).format(LONG_DATE_FORMAT)}</div>
                </div>
                <div className="task-versions--right">
                  <ul className="govuk-list">
                    <li>{pluralise.withCount(taskVersionDifferencesCounts[index], '% change', '% changes', 'No changes')} in this version</li>
                    {threatLevel ? <li>Highest threat level is <span className="govuk-body govuk-tag govuk-tag--positiveTarget">{renderHighestThreatLevel(version)}</span></li> : <li>No rule matches</li>}
                  </ul>
                </div>
              </>
            ),
            children: detailSectionTest,
          };
        })
      }
    />
  );
};

export default TaskVersions;
