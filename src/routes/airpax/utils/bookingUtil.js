import { getFormattedDate, toDateTimeList } from './datetimeUtil';
import calculateTimeDifference from '../../../utils/calculateDatetimeDifference';

import { UNKNOWN_TEXT, SHORT_DATE_FORMAT_ALT, STANDARD_HOUR_MINUTE_FORMAT } from '../../../constants';

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
  if (!booking?.checkInAt) {
    return `${checkinPrefix} ${UNKNOWN_TEXT}`;
  }
  return `${checkinPrefix} ${getFormattedDate(booking.checkInAt, STANDARD_HOUR_MINUTE_FORMAT)}`;
};

const getBookedAt = (booking) => {
  return booking?.bookedAt;
};

const getBookedPriorToDeparture = (bookedAt, departureTime) => {
  const dateTimeList = toDateTimeList(bookedAt, departureTime);
  return calculateTimeDifference(dateTimeList);
};

const hasBooking = (targetTask) => {
  return !!targetTask?.movement?.booking;
};

const getBooking = (targetTask) => {
  if (hasBooking(targetTask)) {
    return targetTask.movement.booking;
  }
  return null;
};

const BookingUtil = {
  get: getBooking,
  bookedAt: getBookedAt,
  bookedPrior: getBookedPriorToDeparture,
  toCheckInText: toCheckInTimeText,
  bookingRef: getBookingReference,
  toBookingText: toBookingDateText,
};

export default BookingUtil;

export {
  toBookingDateText,
  getBookingReference,
  toCheckInTimeText,
  getBooking,
  getBookedAt,
  getBookedPriorToDeparture,
};
