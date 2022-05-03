import { BookingUtil } from '../../utils';
import { LONDON_TIMEZONE, UNKNOWN_TEXT } from '../../../../constants';

import config from '../../../../config';

describe('BookingUtil', () => {
  beforeEach(() => {
    config.dayjsConfig.timezone = LONDON_TIMEZONE;
  });
  it('should return a booking object if present', () => {
    const targetTaskMin = {
      movement: {
        booking: {
          reference: null,
          bookedAt: null,
          checkInAt: null,
          country: null,
        },
      },
    };

    const expected = {
      reference: null,
      bookedAt: null,
      checkInAt: null,
      country: null,
    };

    const output = BookingUtil.get(targetTaskMin);

    expect(output).not.toBeUndefined();
    expect(output).toEqual(expected);
  });

  it('should not return a booking object if not present', () => {
    const targetTaskMin = {
      movement: {
      },
    };

    const output = BookingUtil.get(targetTaskMin);

    expect(output).toBeNull();
  });

  it('should return the default error text when bookedAt is not present', () => {
    const booking = {
      bookedAt: null,
    };
    const output = BookingUtil.toBookingText(booking);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should return a formatted date if bookedAt is present', () => {
    const booking = {
      bookedAt: '1966-05-13T00:00:00Z',
    };

    const output = BookingUtil.toBookingText(booking);
    expect(output).toEqual('13 May 1966');
  });

  it('should have bookedAt if populated', () => {
    const booking = {
      bookedAt: '1966-05-13T00:00:00Z',
    };

    const output = BookingUtil.bookedAt(booking);
    expect(output).toEqual('1966-05-13T00:00:00Z');
  });

  it('should return null if bookedAt is assigned null', () => {
    const booking = {
      bookedAt: null,
    };

    const output = BookingUtil.bookedAt(booking);
    expect(output).toBeNull();
  });

  it('should return formatted check-in text if check-in time is present within the booking', () => {
    const booking = {
      checkInAt: '2020-08-07T17:15:00Z', // UTC
    };

    const output = BookingUtil.toCheckInText(booking);
    expect(output).toEqual('Check-in 18:15');
  });

  it('should return default formatted error text if check-in time is not present within the booking', () => {
    const booking = {
      checkInAt: null,
    };

    const output = BookingUtil.toCheckInText(booking);
    expect(output).toEqual(`Check-in ${UNKNOWN_TEXT}`);
  });

  it('should return a booking reference if present', () => {
    const booking = {
      reference: 'REF-12345',
    };

    const output = BookingUtil.bookingRef(booking);
    expect(output).toEqual('REF-12345');
  });

  it('should return the default error text if booking reference is not present', () => {
    const booking = {
      reference: null,
    };

    const output = BookingUtil.bookingRef(booking);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should calculate the booked prior value for given', () => {
    const bookedAt = '2020-08-07T17:15:00Z';
    const departureTime = '2020-08-10T18:15:00Z';

    const output = BookingUtil.bookedPrior(bookedAt, departureTime);
    expect(output).toEqual('3 days before travel');
  });

  it('should handle the omission of one the two dates', () => {
    const bookedAt = '';
    const departureTime = '2020-08-10T18:15:00Z';

    const output = BookingUtil.bookedPrior(bookedAt, departureTime);
    expect(output).toEqual(UNKNOWN_TEXT);
  });
});
