import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import config from '../../../config';

dayjs.extend(utc);
dayjs.extend(timezone);

const getFormattedDate = (date, dateFormat) => {
  const tz = config.dayjsConfig.timezone || dayjs.tz.guess();
  return dayjs.utc(date).tz(tz).format(dateFormat);
};

const toDateTimeList = (dateOne, dateTwo) => {
  return [dateOne, dateTwo];
};

const DateTimeUtil = {
  format: getFormattedDate,
  toList: toDateTimeList,
};

export default DateTimeUtil;

export { getFormattedDate, toDateTimeList };
