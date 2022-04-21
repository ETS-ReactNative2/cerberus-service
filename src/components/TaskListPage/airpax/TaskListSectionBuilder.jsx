/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import airlines from 'airline-codes';
import ct from 'countries-and-timezones';
import { ZonedDateTime } from '@js-joda/core';
import dayjs from 'dayjs';
import * as pluralise from 'pluralise';

import { MOVEMENT_DESCRIPTION_INDIVIDUAL, MOVEMENT_DESCRIPTION_GROUP, INDIVIDUAL_ICON, LONG_DATE_FORMAT, UNKNOWN_TEXT,
  MOVEMENT_MODE_AIR_PASSENGER, MOVEMENT_MODE_AIR_CREW, SHORT_DATE_FORMAT_ALT,
  STANDARD_HOUR_MINUTE_FORMAT } from '../../../constants';

import calculateTimeDifference from '../../../utils/calculateDatetimeDifference';
import formatGender from '../../../utils/genderFormatter';
import { formatField } from '../../../utils/formatField';

require('@js-joda/timezone');

const getFormattedDate = (date, dateFormat) => {
  return dayjs.utc(date).local().format(dateFormat);
};

const toDateTimeList = (dateOne, dateTwo) => {
  return [dateOne, dateTwo];
};

const formatTargetIndicators = (targetingIndicators) => {
  if (targetingIndicators.indicators?.length > 0) {
    const threatIndicatorList = targetingIndicators.indicators.map((threatIndicator) => {
      return threatIndicator.description;
    });
    return (
      <ul className="govuk-list item-list--bulleted">
        <li className="govuk-!-font-weight-bold govuk-!-font-size-16">{`${pluralise.withCount(threatIndicatorList.length, '% indicator', '% indicators')}`}</li>
        {threatIndicatorList.map((threat) => {
          return <li key={threat} className="threat-indicator-bullet govuk-!-font-size-16">{threat}</li>;
        })}
      </ul>
    );
  }
};

const getRisk = (targetTask) => {
  return targetTask.risks;
};

const hasRisk = (targetTask) => {
  return !!targetTask?.risks;
};

const hasTargetingIndicators = (risks) => {
  return !!risks.targetingIndicators;
};

const getTargetingIndicators = (risks) => {
  return hasTargetingIndicators(risks) && risks.targetingIndicators;
};

const hasOtherPersons = (targetTask) => {
  return !!targetTask?.movement?.otherPersons.length;
};

const getOthetherPersons = (targetTask) => {
  return targetTask.movement.otherPersons;
};

const getRoute = (journey) => {
  return journey?.route;
};

const toRoute = (route) => {
  if (!route) {
    return UNKNOWN_TEXT;
  }
  return route.map((r, index) => {
    return (<span key={index}>{r} {index < route.length - 1 && <>&#8594;</>} </span>);
  });
};

const getBookedAt = (booking) => {
  return booking.bookedAt;
};

const getBookedPriorToDeparture = (bookedAt, departureTime) => {
  const dateTimeList = toDateTimeList(bookedAt, departureTime);
  return calculateTimeDifference(dateTimeList);
};

const toBookingDateText = (booking) => {
  if (!booking?.bookedAt) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(booking.bookedAt, SHORT_DATE_FORMAT_ALT);
};

const getBookingReference = (booking) => {
  if (!booking?.reference) {
    return UNKNOWN_TEXT;
  }
  return booking.reference;
};

const toCheckInTimeText = (booking) => {
  const checkinPrefix = 'Check-in';
  if (!booking.checkInAt) {
    return `${checkinPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${checkinPrefix} ${getFormattedDate(booking.checkInAt, STANDARD_HOUR_MINUTE_FORMAT)}`;
};

const getBooking = (targetTask) => {
  return targetTask.movement.booking;
};

const hasBooking = (targetTask) => {
  return !!targetTask.movement.booking;
};

// TODO finish implementation once data flows through
const getDocumentCountryOfIssue = (document) => {
  const countryOfIssuePrefix = 'Issued by';
  if (!document) {
    return `${countryOfIssuePrefix} ${UNKNOWN_TEXT}`;
  }
  return `${countryOfIssuePrefix} ${UNKNOWN_TEXT}`;
};

// TODO finish implementation once data flows through
const getDocumentIdentification = (document) => {
  if (!document) {
    return UNKNOWN_TEXT;
  }
  return UNKNOWN_TEXT;
};

// TODO finish implementation once data flows through
const getDocumentValidity = (document) => {
  const validityPrefix = 'Valid from';
  if (!document) {
    return `${validityPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${validityPrefix} ${UNKNOWN_TEXT}`;
};

// TODO finish implementation once data flows through
const getDocumentExpiry = (document) => {
  const expiryPrefix = 'Expires';
  if (!document) {
    return `${expiryPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${expiryPrefix} ${UNKNOWN_TEXT}`;
};

const getDocument = (person) => {
  return person.document;
};

const hasDocument = (person) => {
  return !!person?.document;
};

const getSeatNumber = (flight) => {
  const seatPrefix = 'seat';
  if (!flight?.seatNumber) {
    return `${seatPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${seatPrefix} ${flight.seatNumber}`;
};

const getFlight = (targetTask) => {
  return targetTask.movement.flight;
};

const hasFlight = (targetTask) => {
  return !!targetTask.movement.flight;
};

const getJourney = (targetTask) => {
  return targetTask.movement.journey;
};

const hasJourney = (targetTask) => {
  return !!targetTask?.movement?.journey;
};

const getDepartureTime = (journey) => {
  return journey?.departure?.time;
};

const getArrivalTime = (journey) => {
  return journey?.arrival?.time;
};

const getBaggageWeight = (baggage) => {
  return formatField('WEIGHT', baggage.weight);
};

const getBaggage = (targetTask) => {
  return targetTask.movement.baggage;
};

const hasBaggage = (targetTask) => {
  return !!targetTask.movement.baggage;
};

const getCheckedBags = (baggage) => {
  let checkedBags;
  if (baggage.numberOfCheckedBags === 0) {
    checkedBags = 'No checked bags';
  }
  if (baggage.numberOfCheckedBags >= 1) {
    checkedBags = `${baggage.numberOfCheckedBags} checked bag(s)`;
  }
  return checkedBags;
};

const getNationality = (person) => {
  if (!person?.nationality) {
    return UNKNOWN_TEXT;
  }
  return person.nationality;
};

const getDateOfBirth = (person) => {
  if (!person?.dateOfBirth) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(person.dateOfBirth, SHORT_DATE_FORMAT_ALT);
};

const getPerson = (targetTask) => {
  return targetTask.movement.person;
};

const hasPerson = (targetTask) => {
  return !!targetTask?.movement?.person;
};

const getGender = (person) => {
  return formatGender(person.gender);
};

const getLastName = (person, capitalize = true) => {
  if (!person?.name?.last) {
    return capitalize ? UNKNOWN_TEXT.toUpperCase() : UNKNOWN_TEXT;
  }
  return capitalize ? person.name.last.toUpperCase() : person.name.last;
};

const getFirstName = (person) => {
  if (!person?.name?.first) {
    return UNKNOWN_TEXT;
  }
  return person.name.first;
};

const toCoTravellers = (otherPersons) => {
  if (!otherPersons) {
    return <li className="govuk-!-font-weight-bold">None</li>;
  }
  const maxToDisplay = 4;
  const remaining = otherPersons.length > maxToDisplay ? otherPersons.length - maxToDisplay : 0;
  const coTravellersJsx = otherPersons.map((person, index) => {
    if (index < maxToDisplay) {
      return (
        <li key={index} className="govuk-!-font-weight-bold">
          {getLastName(person)}, {getFirstName(person)}{(index !== maxToDisplay - 1)
              && (index !== otherPersons.length - 1) ? ',' : ''} {(remaining > 0 && index + 1 === maxToDisplay)
                ? ` plus ${remaining} more` : ''}
        </li>
      );
    }
  });
  return (
    <>
      {coTravellersJsx}
    </>
  );
};

const getTotalNumberOfPersons = (targetTask) => {
  if (!targetTask?.movement?.person) {
    return 0;
  }
  // Should the code above not run, count is defaulted to 1 as we can assume there at least someone in the movement.
  let personsCount = 1;
  personsCount += targetTask.movement.otherPersons.length;
  return personsCount;
};

const toFormattedDepartureDateTime = (targetTask) => {
  if (!targetTask?.movement?.journey?.departure?.time) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(targetTask.movement.journey.departure.time, LONG_DATE_FORMAT);
};

const toFormattedArrivalDateTime = (targetTask) => {
  if (!targetTask?.movement?.journey?.arrival?.time) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(targetTask.movement.journey.arrival.time, LONG_DATE_FORMAT);
};

const getDepartureLocation = (targetTask) => {
  if (!targetTask?.movement?.journey?.departure?.time) {
    return UNKNOWN_TEXT;
  }
  return targetTask.movement.journey.departure.location;
};

const getDepartureCountry = (targetTask) => {
  if (!targetTask?.movement?.journey?.departure?.country) {
    return UNKNOWN_TEXT;
  }
  return targetTask.movement.journey.departure.country;
};

const getArrivalLocation = (targetTask) => {
  if (!targetTask?.movement?.journey?.arrival.location) {
    return UNKNOWN_TEXT;
  }
  return targetTask.movement.journey.arrival.location;
};

const getArrivalCountry = (targetTask) => {
  if (!targetTask?.movement?.journey?.arrival.country) {
    return UNKNOWN_TEXT;
  }
  return targetTask.movement.journey.arrival.country;
};

const getFlightNumber = (targetTask) => {
  if (!targetTask?.movement?.flight?.number) {
    return UNKNOWN_TEXT;
  }
  return targetTask.movement.flight.number;
};

const getAirlineOperator = (targetTask) => {
  return targetTask?.movement?.flight?.operator;
};

const toAirlineName = (airlineCode) => {
  if (!airlineCode) {
    return UNKNOWN_TEXT;
  }
  return airlines.findWhere({ iata: airlineCode }).get('name');
};

const getDepartureStatus = (targetTask) => {
  const departureStatus = targetTask?.movement?.flight?.departureStatus;
  let departureStatusClass;
  switch (departureStatus) {
    case 'DC':
      departureStatusClass = 'departureConfirmed';
      break;
    case 'BP':
      departureStatusClass = 'bookedPassenger';
      break;
    case 'CI':
      departureStatusClass = 'checkedIn';
      break;
    case 'DX':
      departureStatusClass = 'departureException';
      break;
    default:
      break;
  }
  return (
    departureStatus && (
      <span className={`govuk-body govuk-tag govuk-tag--${departureStatusClass}`}>
        {departureStatus}
      </span>
    )
  );
};

const getMovementTypeText = (targetTask) => {
  const movementType = targetTask?.movement?.mode;
  if (!movementType) {
    return UNKNOWN_TEXT;
  }
  if (movementType === MOVEMENT_MODE_AIR_PASSENGER) {
    return 'Passenger';
  }
  return 'Crew';
};

const toDescriptionText = (targetTask) => {
  const movementDescription = targetTask?.movement?.description;
  const movementType = targetTask?.movement?.mode;
  let descriptionText;
  if (movementType === MOVEMENT_MODE_AIR_PASSENGER) {
    switch (movementDescription) {
      case MOVEMENT_DESCRIPTION_INDIVIDUAL: {
        descriptionText = 'Single passenger';
        break;
      }
      case MOVEMENT_DESCRIPTION_GROUP: {
        descriptionText = `In group of ${getTotalNumberOfPersons(targetTask)}`;
        break;
      }
      default: {
        return '';
      }
    }
    if (movementType === MOVEMENT_MODE_AIR_CREW) {
      descriptionText = 'Crew member';
    }
  }
  return descriptionText;
};

const isNegativeNumber = (number) => {
  return number < 0;
};

const utcOffsetToInteger = (utcOffset) => {
  const utcHour = utcOffset.split(':')[0];
  return parseInt(utcHour, 10);
};

const toDepartureArrivalTimezone = (departureCountryIsoCode, arrivalCountryIsoCode) => {
  const departureCountryMetadata = ct.getCountry(departureCountryIsoCode);
  const arrivalCountryMetadata = ct.getCountry(arrivalCountryIsoCode);
  return { departureCountryMetadata, arrivalCountryMetadata };
};

// TODO finish implementation
const toTimeZoneDifference = (targetTask) => {
  const journey = hasJourney(targetTask) && getJourney(targetTask);
  const departureCountryIsoCode = getDepartureCountry(targetTask);
  const arrivalCountryIsoCode = getArrivalCountry(targetTask);
  const departureTime = getDepartureTime(journey);
  const arrivalTime = getArrivalTime(journey);
  // If any evaluates to be false, no calculations are performed
  if (!departureCountryIsoCode || !arrivalCountryIsoCode || !departureTime || !arrivalTime) {
    return '';
  }
  const { departureCountryMetadata, arrivalCountryMetadata } = toDepartureArrivalTimezone(departureCountryIsoCode,
    arrivalCountryIsoCode);

  const departureTimezone = departureCountryMetadata.timezones[0];
  const arrivalTimezone = arrivalCountryMetadata.timezones[0];

  const depertureZonedTime = ZonedDateTime.parse(`${departureTime}[${departureTimezone}]`);
  const arrivalZonedTime = ZonedDateTime.parse(`${arrivalTime}[${arrivalTimezone}]`);

  const departureUtcOffset = utcOffsetToInteger(depertureZonedTime._offset._id);
  const arrivalUtcOffset = utcOffsetToInteger(arrivalZonedTime._offset._id);

  const timeZoneDifference = departureUtcOffset - arrivalUtcOffset;
  return !isNegativeNumber(timeZoneDifference) ? `(+${timeZoneDifference})` : `(-${timeZoneDifference})`;
};

const renderModeSection = (targetTask) => {
  return (
    <div className="govuk-grid-column-one-quarter govuk-!-padding-left-9">
      <i className={`icon-position--left ${INDIVIDUAL_ICON}`} />
      <p className="govuk-body-s content-line-one govuk-!-margin-bottom-0 govuk-!-padding-left-1">{toDescriptionText(targetTask)}</p>
      <span className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-padding-left-1">
        <span className="govuk-font-weight-bold">{getMovementTypeText(targetTask)} {getDepartureStatus(targetTask)}</span>
      </span>
    </div>
  );
};

const renderVoyageSection = (targetTask) => {
  const journey = hasJourney(targetTask) && getJourney(targetTask);
  const departureTime = getDepartureTime(journey);
  const arrivalTime = getArrivalTime(journey);
  const dateTimeList = toDateTimeList(departureTime, arrivalTime);
  return (
    <div className="govuk-grid-column-three-quarters govuk-!-padding-right-7 align-right">
      <i className="c-icon-aircraft" />
      <p className="content-line-one govuk-!-padding-right-2">
        {`${toAirlineName(getAirlineOperator(targetTask))}, flight ${getFlightNumber(targetTask)}, 
        ${calculateTimeDifference(dateTimeList, 'arrival')}`}
      </p>
      <p className="govuk-body-s content-line-two govuk-!-padding-right-2">
        <span className="govuk-!-font-weight-bold">{getFlightNumber(targetTask)}</span>
        <span className="dot" />
        {`${toFormattedDepartureDateTime(targetTask)} ${toTimeZoneDifference(targetTask)}`}
        <span className="dot" />
        <span className="govuk-!-font-weight-bold">{getDepartureLocation(targetTask)}</span> &#8594;
        <span className="govuk-!-font-weight-bold"> {getArrivalLocation(targetTask)}</span>
        <span className="dot" />
        {toFormattedArrivalDateTime(targetTask)}
      </p>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const buildFirstSection = (targetTask) => {
  return (
    <></>
  );
};

const buildSecondSection = (targetTask) => {
  return (
    <section className="task-list--item-2">
      <div>
        <div className="govuk-grid-row grid-background--greyed">
          {renderModeSection(targetTask)}
          {renderVoyageSection(targetTask)}
        </div>
      </div>
    </section>
  );
};

const buildThirdSection = (targetTask) => {
  const person = hasPerson(targetTask) && getPerson(targetTask);
  const baggage = hasBaggage(targetTask) && getBaggage(targetTask);
  const booking = hasBooking(targetTask) && getBooking(targetTask);
  const flight = hasFlight(targetTask) && getFlight(targetTask);
  const journey = hasJourney(targetTask) && getJourney(targetTask);
  const document = hasDocument(person) && getDocument(person);
  const otherPersons = hasOtherPersons(targetTask) && getOthetherPersons(targetTask);
  return (
    <section className="task-list--item-3">
      <div className="govuk-grid-row">
        <div className="govuk-grid-item">
          <div>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
              {getMovementTypeText(targetTask)}
            </h3>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <>
                {<li className="govuk-!-font-weight-bold">{getLastName(person)}, </li>}
                {<li className="govuk-!-font-weight-regular">{getFirstName(person)}</li>}
              </>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <>
                {<li className="govuk-!-font-weight-regular">{getGender(person)}, </li>}
                {<li className="govuk-!-font-weight-regular">{getDateOfBirth(person)}, </li>}
                {<li className="govuk-!-font-weight-regular">{getNationality(person)}</li>}
              </>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <>
                {<li className="govuk-!-font-weight-regular">{getCheckedBags(baggage)}, </li>}
                {<li className="govuk-!-font-weight-regular">{getBaggageWeight(baggage)} </li>}
              </>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <>
                {<li className="govuk-!-font-weight-regular">{toCheckInTimeText(booking)}, </li>}
                {<li className="govuk-!-font-weight-regular">{getSeatNumber(flight)} </li>}
              </>
            </ul>
          </div>
        </div>

        <div className="govuk-grid-item verticel-dotted-line">
          <div>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
              Document
            </h3>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
              <li className="govuk-!-font-weight-bold">{getDocumentIdentification(document)} ({getNationality(person)})</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{getDocumentValidity(booking)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{getDocumentExpiry(booking)}</li>
            </ul>
            <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
              <li className="govuk-!-font-weight-regular">{getDocumentCountryOfIssue(booking)}</li>
            </ul>
          </div>
        </div>

        <div className="govuk-grid-item verticel-dotted-line">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Booking
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-bold">{getBookingReference(booking)}</li>
          </ul>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-regular">{toBookingDateText(booking)}</li>
          </ul>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0 secondary-text">
            <li className="govuk-!-font-weight-regular">{getBookedPriorToDeparture(getBookedAt(booking), getDepartureTime(journey))}</li>
          </ul>
        </div>

        <div className="govuk-grid-item verticel-dotted-line">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Co-travellers
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            {toCoTravellers(otherPersons)}
          </ul>
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular secondary-text">
            Route
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-0">
            <li className="govuk-!-font-weight-regular">{toRoute(getRoute(journey))}</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

const buildFourthSection = (targetTask) => {
  const targetingIndicators = hasRisk(targetTask) && getTargetingIndicators(getRisk(targetTask));
  return (
    <section className="task-list--item-4">
      <div className="govuk-grid-row">
        <div className="govuk-grid-item airpax-tis-container">
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
                {formatTargetIndicators(targetingIndicators)}
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

export { buildFirstSection, buildSecondSection, buildThirdSection, buildFourthSection };
