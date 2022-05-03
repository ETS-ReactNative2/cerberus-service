import React from 'react';
import { Link } from 'react-router-dom';

import { INDIVIDUAL_ICON } from '../../../constants';

// Utils
import { BaggageUtil, DateTimeUtil, IndicatorsUtil, BookingUtil, DocumentUtil, PersonUtil, MovementUtil } from '../utils';
import calculateTimeDifference from '../../../utils/calculateDatetimeDifference';

const renderModeSection = (targetTask) => {
  return (
    <div className="govuk-grid-column-one-quarter govuk-!-padding-left-9">
      <i className={`icon-position--left ${INDIVIDUAL_ICON}`} />
      <p className="govuk-body-s content-line-one govuk-!-margin-bottom-0 govuk-!-padding-left-1">{MovementUtil.description(targetTask)}</p>
      <span className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-padding-left-1">
        <span className="govuk-font-weight-bold">{MovementUtil.movementType(targetTask)} {MovementUtil.status(targetTask)}</span>
      </span>
    </div>
  );
};

const renderVoyageSection = (targetTask, airlineCodes) => {
  const journey = MovementUtil.movementJourney(targetTask);
  const flight = MovementUtil.movementFlight(targetTask);
  const departureTime = MovementUtil.departureTime(journey);
  const arrivalTime = MovementUtil.arrivalTime(journey);
  const dateTimeList = DateTimeUtil.toList(departureTime, arrivalTime);
  return (
    <div className="govuk-grid-column-three-quarters govuk-!-padding-right-7 align-right">
      <i className="c-icon-aircraft" />
      <p className="content-line-one govuk-!-padding-right-2">
        {`${MovementUtil.airlineName(MovementUtil.airlineOperator(flight), airlineCodes)}, flight ${MovementUtil.flightNumber(flight)}, 
        ${calculateTimeDifference(dateTimeList, 'arrival')}`}
      </p>
      <p className="govuk-body-s content-line-two govuk-!-padding-right-2">
        <span className="govuk-!-font-weight-bold">{MovementUtil.flightNumber(flight)}</span>
        <span className="dot" />
        {`${MovementUtil.formatDepartureTime(journey)}`}
        <span className="dot" />
        <span className="govuk-!-font-weight-bold">{MovementUtil.departureLoc(journey)}</span> &#8594;
        <span className="govuk-!-font-weight-bold"> {MovementUtil.arrivalLoc(journey)}</span>
        <span className="dot" />
        {MovementUtil.formatArrivalTime(journey)}
      </p>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const buildTaskTitleSection = (targetTask) => {
  return (
    <></>
  );
};

const buildVoyageSection = (targetTask, airlineCodes) => {
  return (
    <section className="task-list--voyage-section">
      <div>
        <div className="govuk-grid-row grid-background--greyed">
          {renderModeSection(targetTask)}
          {renderVoyageSection(targetTask, airlineCodes)}
        </div>
      </div>
    </section>
  );
};

const buildMovementInfoSection = (targetTask) => {
  const person = PersonUtil.get(targetTask);
  const baggage = BaggageUtil.get(targetTask);
  const booking = BookingUtil.get(targetTask);
  const journey = MovementUtil.movementJourney(targetTask);
  const flight = MovementUtil.movementFlight(targetTask);
  const document = DocumentUtil.get(person);
  const otherPersons = PersonUtil.getOthers(targetTask);
  return (
    <section className="task-list--movement-info-section">
      <div className="govuk-grid-row">
        <div className="govuk-grid-item">
          <div>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
              {MovementUtil.movementType(targetTask)}
            </h3>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <li className="govuk-!-font-weight-bold">{PersonUtil.lastname(person)}, </li>
              <li className="govuk-!-font-weight-regular">{PersonUtil.firstname(person)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <li className="govuk-!-font-weight-regular">{PersonUtil.gender(person)}, </li>
              <li className="govuk-!-font-weight-regular">{PersonUtil.dob(person)}, </li>
              <li className="govuk-!-font-weight-regular">{PersonUtil.nationality(person)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{BaggageUtil.checked(baggage)}, </li>
              <li className="govuk-!-font-weight-regular">{BaggageUtil.weight(baggage)} </li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{BookingUtil.toCheckInText(booking)}, </li>
              <li className="govuk-!-font-weight-regular">{MovementUtil.seatNumber(flight)} </li>
            </ul>
          </div>
        </div>

        <div className="govuk-grid-item vertical-dotted-line">
          <div>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
              Document
            </h3>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <li className="govuk-!-font-weight-bold">{DocumentUtil.docIdentification(document)} ({PersonUtil.nationality(person)})</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{DocumentUtil.docValidity(booking)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{DocumentUtil.docExpiry(booking)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{DocumentUtil.docCountry(booking)}</li>
            </ul>
          </div>
        </div>

        <div className="govuk-grid-item vertical-dotted-line">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Booking
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-bold">{BookingUtil.bookingRef(booking)}</li>
          </ul>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-regular">{BookingUtil.toBookingText(booking)}</li>
          </ul>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
            <li className="govuk-!-font-weight-regular">{BookingUtil.bookedPrior(BookingUtil.bookedAt(booking), MovementUtil.departureTime(journey))}</li>
          </ul>
        </div>

        <div className="govuk-grid-item vertical-dotted-line">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Co-travellers
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            {PersonUtil.toOthers(otherPersons)}
          </ul>
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Route
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-regular">{MovementUtil.convertMovementRoute(MovementUtil.movementRoute(journey))}</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

const buildTargetIndicatorsSection = (targetTask) => {
  const targetingIndicators = IndicatorsUtil.getIndicators(IndicatorsUtil.getRisks(targetTask));
  return (
    <section className="task-list--target-indicator-section">
      <div className="govuk-grid-row">
        <div className="govuk-grid-item">
          <div className="govuk-grid-column">
            <ul className="govuk-list task-labels govuk-!-margin-top-2">
              <li className="task-labels-item">
                <strong className="govuk-!-font-weight-bold govuk-!-font-size-16">
                  Risk Score: {targetingIndicators.score}
                </strong>
              </li>
            </ul>
          </div>
          <div className="govuk-grid-column">
            <ul className="govuk-list task-labels govuk-!-margin-top-0">
              <li className="task-labels-item">
                {IndicatorsUtil.format(targetingIndicators)}
              </li>
            </ul>
          </div>
        </div>
        <div className="govuk-grid-item task-link-container">
          <div>
            <Link
              className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
              to={`/tasks/${targetTask.id}`}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { buildTaskTitleSection, buildVoyageSection, buildMovementInfoSection, buildTargetIndicatorsSection };
