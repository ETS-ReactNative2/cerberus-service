import React from 'react';
import { Tag } from '@ukhomeoffice/cop-react-components';

import { UNKNOWN_TEXT, LONG_DATE_FORMAT, MOVEMENT_DESCRIPTION_INDIVIDUAL, MOVEMENT_DESCRIPTION_GROUP,
  MOVEMENT_MODE_AIR_PASSENGER, MOVEMENT_MODE_AIR_CREW } from '../../../constants';

import { getFormattedDate } from './datetimeUtil';
import { getTotalNumberOfPersons } from './personUtil';

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

const getSeatNumber = (flight) => {
  const seatPrefix = 'seat';
  if (!flight?.seatNumber) {
    return `${seatPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${seatPrefix} ${flight.seatNumber}`;
};

const hasFlight = (targetTask) => {
  return !!targetTask.movement.flight;
};

const getFlight = (targetTask) => {
  if (hasFlight(targetTask)) {
    return targetTask.movement.flight;
  }
  return null;
};

const hasJourney = (targetTask) => {
  return !!targetTask?.movement?.journey;
};

const getJourney = (targetTask) => {
  if (hasJourney(targetTask)) {
    return targetTask.movement.journey;
  }
  return null;
};

const getDepartureTime = (journey) => {
  return journey?.departure?.time;
};

const getArrivalTime = (journey) => {
  return journey?.arrival?.time;
};

const toFormattedDepartureDateTime = (journey) => {
  if (!journey?.departure?.time) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(journey.departure.time, LONG_DATE_FORMAT);
};

const toFormattedArrivalDateTime = (journey) => {
  if (!journey?.arrival?.time) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(journey.arrival.time, LONG_DATE_FORMAT);
};

const getDepartureLocation = (journey) => {
  if (!journey?.departure?.location) {
    return UNKNOWN_TEXT;
  }
  return journey.departure.location;
};

const getArrivalLocation = (journey) => {
  if (!journey?.arrival?.location) {
    return UNKNOWN_TEXT;
  }
  return journey.arrival.location;
};

const getFlightNumber = (flight) => {
  if (!flight?.number) {
    return UNKNOWN_TEXT;
  }
  return flight.number;
};

const getAirlineOperator = (flight) => {
  if (!flight?.operator) {
    return UNKNOWN_TEXT;
  }
  return flight.operator;
};

const getDepartureStatus = (targetTask) => {
  const departureStatus = targetTask?.movement?.flight?.departureStatus;
  const DEPARTURE_CLASSES = {
    DC: 'green',
    BP: 'purple',
    CI: 'blue',
    DX: 'red',
  };
  if (departureStatus) {
    return (
      <Tag className="airpax-status" classModifiers={DEPARTURE_CLASSES[departureStatus]}>{departureStatus}</Tag>
    );
  }
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
  if (movementType === MOVEMENT_MODE_AIR_PASSENGER) {
    if (movementDescription === MOVEMENT_DESCRIPTION_INDIVIDUAL) {
      return 'Single passenger';
    }
    if (movementDescription === MOVEMENT_DESCRIPTION_GROUP) {
      return `In group of ${getTotalNumberOfPersons(targetTask)}`;
    }
  }
  if (movementType === MOVEMENT_MODE_AIR_CREW) {
    return 'Crew member';
  }
  return UNKNOWN_TEXT;
};

const toAirlineName = (airlineCode, airlineCodes) => {
  if (!airlineCode || !airlineCodes.length) {
    return UNKNOWN_TEXT;
  }
  return airlineCodes.find(({ twolettercode }) => twolettercode === airlineCode)?.name;
};

const MovementUtil = {
  movementRoute: getRoute,
  convertMovementRoute: toRoute,
  seatNumber: getSeatNumber,
  movementFlight: getFlight,
  movementJourney: getJourney,
  departureTime: getDepartureTime,
  arrivalTime: getArrivalTime,
  formatDepartureTime: toFormattedDepartureDateTime,
  formatArrivalTime: toFormattedArrivalDateTime,
  departureLoc: getDepartureLocation,
  arrivalLoc: getArrivalLocation,
  flightNumber: getFlightNumber,
  airlineOperator: getAirlineOperator,
  status: getDepartureStatus,
  movementType: getMovementTypeText,
  description: toDescriptionText,
  airlineName: toAirlineName,
};

export default MovementUtil;

export {
  getRoute,
  toRoute,
  getSeatNumber,
  getFlight,
  getJourney,
  getDepartureTime,
  getArrivalTime,
  toFormattedDepartureDateTime,
  toFormattedArrivalDateTime,
  getDepartureLocation,
  getArrivalLocation,
  getFlightNumber,
  getAirlineOperator,
  getDepartureStatus,
  getMovementTypeText,
  toDescriptionText,
  toAirlineName,
};
