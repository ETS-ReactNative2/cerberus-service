import renderer from 'react-test-renderer';

import { MovementUtil } from '../../utils';
import { LONDON_TIMEZONE, UNKNOWN_TEXT } from '../../../../constants';

import config from '../../../../config';

describe('MovementUtil', () => {
  beforeEach(() => {
    config.dayjsConfig.timezone = LONDON_TIMEZONE;
  });

  const airlineCodesMin = [
    {
      'name': 'British Airways',
      'twolettercode': 'BA',
    },
    {
      'name': 'Air France',
      'twolettercode': 'AF',
    },
    {
      'name': 'Qantas',
      'twolettercode': 'QF',
    },
  ];

  const targetTaskMin = {
    movement: {
      id: 'AIRPAXTSV:CMID=9c19fe74233c057f25e5ad333672c3f9/2b4a6b5b08ea434880562d6836b1111',
      status: 'PRE_ARRIVAL',
      mode: 'AIR_PASSENGER',
      description: 'individual',
      journey: {
        id: 'BA103',
        arrival: {
          country: null,
          location: 'LHR',
          time: null,
        },
        departure: {
          country: null,
          location: 'FRA',
          time: '2020-08-07T17:15:00Z',
        },
        route: [
          'FRA',
          'LHR',
        ],
        itinerary: [
          {
            id: 'BA103',
            arrival: {
              country: null,
              location: 'LHR',
              time: null,
            },
            departure: {
              country: null,
              location: 'FRA',
              time: '2020-08-07T17:15:00Z',
            },
          },
        ],
      },
      flight: {
        departureStatus: 'DC',
        number: 'BA103',
        operator: 'BA',
        seatNumber: null,
      },
    },
  };

  it('should return the route if present', () => {
    const output = MovementUtil.movementRoute(targetTaskMin.movement.journey);
    expect(output).not.toBeUndefined();
    expect(output).not.toBeNull();
    expect(output).toEqual(targetTaskMin.movement.journey.route);
  });

  it('should return null if formatted seat number is not present', () => {
    const output = MovementUtil.seatNumber(targetTaskMin.movement.flight);
    expect(output).toEqual(`seat ${UNKNOWN_TEXT}`);
  });

  it('should return null if formatted seat number is present', () => {
    targetTaskMin.movement.flight.seatNumber = '15C';

    const output = MovementUtil.seatNumber(targetTaskMin.movement.flight);
    expect(output).toEqual('seat 15C');
  });

  it('should return a flight object if present', () => {
    const output = MovementUtil.movementFlight(targetTaskMin);
    expect(output).not.toBeUndefined();
    expect(output).not.toBeNull();
    expect(output).toEqual(targetTaskMin.movement.flight);
  });

  it('should return a journey object if present', () => {
    const output = MovementUtil.movementFlight(targetTaskMin);
    expect(output).not.toBeUndefined();
    expect(output).not.toBeNull();
    expect(output).toEqual(targetTaskMin.movement.flight);
  });

  it('should return a departure time if present', () => {
    const output = MovementUtil.departureTime(targetTaskMin.movement.journey);
    expect(output).toEqual(targetTaskMin.movement.journey.departure.time);
  });

  it('should return arrival time if present', () => {
    const output = MovementUtil.arrivalTime(targetTaskMin.movement.journey);
    expect(output).toEqual(targetTaskMin.movement.journey.arrival.time);
  });

  it('should return a formatted departure date and time if present', () => {
    const output = MovementUtil.formatDepartureTime(targetTaskMin.movement.journey);
    expect(output).toEqual('7 Aug 2020 at 18:15');
  });

  it('should return a formatted arrival date and time if present', () => {
    const output = MovementUtil.formatArrivalTime(targetTaskMin.movement.journey);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should return a departure location if present', () => {
    const output = MovementUtil.departureLoc(targetTaskMin.movement.journey);
    expect(output).toEqual(targetTaskMin.movement.journey.departure.location);
  });

  it('should return an arrival location if present', () => {
    const output = MovementUtil.arrivalLoc(targetTaskMin.movement.journey);
    expect(output).toEqual(targetTaskMin.movement.journey.arrival.location);
  });

  it('should return a flight number if present', () => {
    const output = MovementUtil.flightNumber(targetTaskMin.movement.flight);
    expect(output).toEqual(targetTaskMin.movement.flight.number);
  });

  it('should return the airline operator if present', () => {
    const output = MovementUtil.airlineOperator(targetTaskMin.movement.flight);
    expect(output).toEqual(targetTaskMin.movement.flight.operator);
  });

  it('should render the departure status if present', () => {
    const tree = renderer.create(MovementUtil.status(targetTaskMin)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should return the movement type if present', () => {
    const output = MovementUtil.movementType(targetTaskMin);
    expect(output).toEqual('Passenger');
  });

  it('should return the movement description text', () => {
    const output = MovementUtil.description(targetTaskMin);
    expect(output).toEqual('Single passenger');
  });

  it('should return the movement description text for multiple persons', () => {
    targetTaskMin.movement.description = 'group';

    targetTaskMin.movement.person = {
      name: {
        first: 'Isaiah',
        last: 'Ford',
        full: 'Isaiah Ford',
      },
      role: 'PASSENGER',
      dateOfBirth: '1966-05-13T00:00:00Z',
      gender: 'M',
      nationality: 'GBR',
      document: null,
    };

    targetTaskMin.movement.otherPersons = [
      {
        name: {
          first: 'Isaiah',
          last: 'Ford',
          full: 'Isaiah Ford',
        },
        role: 'PASSENGER',
        dateOfBirth: '1966-05-13T00:00:00Z',
        gender: 'M',
        nationality: 'GBR',
        document: null,
      },
    ];

    const output = MovementUtil.description(targetTaskMin);
    expect(output).toEqual('In group of 2');
  });

  it('should convert airline code to airline name', () => {
    const GIVEN_BA = MovementUtil.airlineName('BA', airlineCodesMin);
    const GIVEN_AF = MovementUtil.airlineName('AF', airlineCodesMin);
    const GIVEN_QF = MovementUtil.airlineName('QF', airlineCodesMin);

    expect(GIVEN_BA).toEqual('British Airways');
    expect(GIVEN_AF).toEqual('Air France');
    expect(GIVEN_QF).toEqual('Qantas');
  });
});
