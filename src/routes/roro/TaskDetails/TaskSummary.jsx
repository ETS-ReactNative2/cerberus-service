import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { LONG_DATE_FORMAT, RORO_TOURIST, INDIVIDUAL_ICON, GROUP_ICON } from '../../../constants';
import getMovementModeIcon from '../../../utils/getVehicleModeIcon';
import { modifyRoRoPassengersTaskList, hasVehicle, hasTrailer, hasDriver, filterKnownPassengers } from '../../../utils/roroDataUtil';
import { formatMovementModeIconText } from '../../../utils/stringConversion';

import '../__assets__/TaskDetailsPage.scss';

const getCaptionText = (movementModeIcon) => {
  if (movementModeIcon === INDIVIDUAL_ICON) {
    return 'Single passenger';
  }
  if (movementModeIcon === GROUP_ICON) {
    return 'Group';
  }
};

const getSummaryFirstHalf = (movementMode, roroData) => {
  const actualPassengers = filterKnownPassengers(roroData.passengers);
  const movementModeIcon = getMovementModeIcon(movementMode, roroData.vehicle, actualPassengers);
  if (movementMode === RORO_TOURIST) {
    if (movementModeIcon === INDIVIDUAL_ICON || movementModeIcon === GROUP_ICON) {
      const captionText = getCaptionText(movementModeIcon);
      return (
        <li>
          <span className="govuk-caption-m">{captionText}</span>
          <h3 className="govuk-heading-s">
            {actualPassengers.length === 1 && <span className="govuk-!-font-weight-bold">1 foot passenger</span>}
            {actualPassengers.length > 1 && <span className="govuk-!-font-weight-bold">{actualPassengers.length} foot passengers</span>}
          </h3>
        </li>
      );
    }
  }
  return (
    <li>
      <span className="govuk-caption-m">
        {formatMovementModeIconText(roroData, movementMode)}
      </span>
      <h3 className="govuk-heading-s">
        {hasVehicle(roroData.vehicle.registrationNumber) ? roroData.vehicle.registrationNumber : ''}
        {(hasVehicle(roroData.vehicle?.registrationNumber) && hasTrailer(roroData.vehicle?.trailer?.regNumber)) ? <span className="govuk-!-font-weight-regular"> with </span> : ''}
        {hasTrailer(roroData.vehicle?.trailer?.regNumber) ? roroData.vehicle.trailer.regNumber : ''}
        {hasVehicle(roroData.vehicle.registrationNumber) && hasDriver(roroData.driver?.name) ? <span className="govuk-!-font-weight-regular"> driven by </span> : ''}
        {hasVehicle(roroData.vehicle.registrationNumber) && hasDriver(roroData.driver?.name) ? roroData.driver.name : ''}
      </h3>
    </li>
  );
};

const TaskSummary = ({ movementMode, taskSummaryData }) => {
  dayjs.extend(utc);
  dayjs.extend(relativeTime);
  const roroData = modifyRoRoPassengersTaskList({ ...taskSummaryData.roro.details });

  return (
    <section className="card">
      <div>
        <div className="govuk-grid-row grid-background--greyed">
          <div className="govuk-grid-column-one-half">
            <div className="summary-data-list">
              <i className={`icon-position--left align-middle ${getMovementModeIcon(movementMode, roroData.vehicle, roroData.passengers)}`} />
              <div className="first-half">
                <ul>
                  {getSummaryFirstHalf(movementMode, roroData)}
                </ul>
              </div>
            </div>
          </div>
          <div className="govuk-grid-column-one-half align-right">
            <div className="summary-data-list">
              <i className="c-icon-ship align-middle" />
              <div className="second-half">
                <ul>
                  <li><span>{roroData.vessel?.company && `${roroData.vessel?.company} voyage of `}{roroData.vessel.name}</span></li>
                  <li>
                    <span>{!roroData.departureTime ? 'unknown' : dayjs.utc(roroData.departureTime).local().format(LONG_DATE_FORMAT)}{' '}
                      <span className="dot" />  <span className="font__bold">{roroData.departureLocation && `${roroData.departureLocation} `}</span><span className="right-arrow font__bold">&#8594;</span>
                    </span> <span className="font__bold">{roroData.arrivalLocation && `${roroData.arrivalLocation} `} </span>{'  '}
                    <span className="dot" />  {!roroData.eta ? 'unknown' : dayjs.utc(roroData.eta).local().format(LONG_DATE_FORMAT)}
                  </li>
                  <li><span>Arrival {!roroData.eta ? 'unknown' : (dayjs.utc(roroData.eta).fromNow())}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskSummary;
