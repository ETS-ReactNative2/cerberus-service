import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LONG_DATE_FORMAT } from '../../constants';

import '../__assets__/TaskDetailsPage.scss';

const TaskSummary = ({ taskSummaryData }) => {
  dayjs.extend(utc);
  const roroData = taskSummaryData.roro.details;

  return (
    <section className="card">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-m">
            {roroData.vehicle && 'Vehicle'}
            {(roroData.vehicle && roroData.vehicle?.trailer?.regNumber) && ' with '}
            {roroData?.vehicle?.trailer?.regNumber && 'Trailer'}
          </span>
          <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
            {roroData.vehicle && roroData.vehicle.registrationNumber}
            {(roroData.vehicle?.registrationNumber && roroData.vehicle?.trailer?.regNumber) && <span className="govuk-!-font-weight-regular"> with </span>}
            {roroData.vehicle?.trailer?.regNumber && roroData.vehicle.trailer.regNumber}
            {roroData.driver?.name && <span className="govuk-!-font-weight-regular"> driven by </span>}
            {roroData.driver?.name && roroData.driver.name}
          </h3>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <dl className="mode-details">
            <dt>Ferry</dt>
            <dd>{roroData.vessel?.company && `${roroData.vessel?.company} voyage of `}{roroData.vessel.name}</dd>
            <dt>Departure</dt>
            <dd>{roroData.departureLocation && `${roroData.departureLocation}, `}{!roroData.departureTime ? 'unknown' : dayjs.utc(roroData.departureTime).format(LONG_DATE_FORMAT)}</dd>
            <dt>Arrival</dt>
            {/* <dd>{roroData.arrivalLocation && `${roroData.arrivalLocation}, `}{!roroData.eta ? 'unknown' : dayjs.utc(roroData.eta).format(LONG_DATE_FORMAT)}</dd> */}
            <dd>{roroData.arrivalLocation && `${roroData.arrivalLocation}, `}{!roroData.eta ? 'unknown' : new Date(roroData.eta).toUTCString()}</dd>
          </dl>
        </div>
        <div className="govuk-grid-column-one-half">
          <dl className="mode-details">
            <dt>Account</dt>
            <dd>{!roroData.account?.name ? 'unknown' : roroData.account.name}{dayjs.utc(roroData.bookingDateTime).isValid() && <span className="govuk-!-font-weight-regular">, booked on {dayjs.utc(roroData.bookingDateTime).format(LONG_DATE_FORMAT)}</span>}</dd>
            <dt>Haulier</dt>
            <dd>{!roroData.haulier?.name ? 'unknown' : roroData.haulier.name}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default TaskSummary;
