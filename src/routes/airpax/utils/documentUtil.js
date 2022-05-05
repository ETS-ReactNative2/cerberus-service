import moment from 'moment';
import lookup from 'country-code-lookup';
import {
  A_TITLE_CASE_TEXT,
  AN_TITLE_CASE_TEXT,
  AGO_TEXT,
  A_SMALL_TEXT,
  AN_SMALL_TEXT,
  UNKNOWN_TEXT,
  AFTER_TRAVEL_TEXT,
  BEFORE_TRAVEL_TEXT,
  SHORT_DATE_FORMAT_ALT,
} from '../../../constants';
import { formatField } from '../../../utils/formatField';
import { getFormattedDate } from './datetimeUtil';

const calculateExpiry = (passportExpiry, arrivalTime) => {
  const expiry = arrivalTime
    && passportExpiry !== 'Unknown'
    && `${arrivalTime},${moment(passportExpiry).format('YYYY-MM-DDTHH:mm:ss')}`;
  if (expiry) {
    return formatField('BOOKING_DATETIME', expiry)
      .split(', ')[1]
      .replace(BEFORE_TRAVEL_TEXT, AFTER_TRAVEL_TEXT)
      .replace(AGO_TEXT, BEFORE_TRAVEL_TEXT)
      .replace(A_SMALL_TEXT, A_TITLE_CASE_TEXT)
      .replace(AN_SMALL_TEXT, AN_TITLE_CASE_TEXT);
  }
  return UNKNOWN_TEXT;
};

const hasDocument = (person) => {
  return !!person?.document;
};

const getDocument = (person) => {
  if (hasDocument(person)) {
    return person.document;
  }
  return null;
};

const getDocumentExpiry = (document, taskDetails = false) => {
  const expiryPrefix = 'Expires';
  if (!document?.validTo) {
    return taskDetails ? UNKNOWN_TEXT : `${expiryPrefix} ${UNKNOWN_TEXT}`;
  }
  return taskDetails ? `${getFormattedDate(document?.validTo, SHORT_DATE_FORMAT_ALT)}` : `${expiryPrefix} ${UNKNOWN_TEXT}`;
};

const getDocumentValidity = (document, taskDetails = false) => {
  const validityPrefix = 'Valid from';
  if (!document?.validFrom) {
    return taskDetails ? UNKNOWN_TEXT : `${validityPrefix} ${UNKNOWN_TEXT}`;
  }
  return taskDetails ? `${getFormattedDate(document?.validFrom, SHORT_DATE_FORMAT_ALT)}` : `${validityPrefix} ${UNKNOWN_TEXT}`;
};

const getDocumentType = (document) => {
  if (!document?.type) {
    return UNKNOWN_TEXT;
  }
  return document.type;
};

const getDocumentNumber = (document) => {
  if (!document?.number) {
    return UNKNOWN_TEXT;
  }
  return document.number;
};

const getDocumentName = (document) => {
  if (!document?.name) {
    return UNKNOWN_TEXT;
  }
  const firstNames = document.name.split(' ');
  const lastName = firstNames.pop();
  return `${lastName.toUpperCase()}, ${firstNames.join(' ')}`;
};

// TODO finish implementation once data flows through
const getDocumentIdentification = (document) => {
  if (!document) {
    return UNKNOWN_TEXT;
  }
  return UNKNOWN_TEXT;
};

const getDocumentCountryOfIssue = (document, taskDetails = false) => {
  const countryOfIssuePrefix = 'Issued by';
  if (!document?.countryOfIssue) {
    return taskDetails ? UNKNOWN_TEXT : `${countryOfIssuePrefix} ${UNKNOWN_TEXT}`;
  }
  if (taskDetails) {
    return lookup.byIso(document.countryOfIssue) !== null
      ? `${lookup.byIso(document.countryOfIssue).country} (${document.countryOfIssue})`
      : `${countryOfIssuePrefix} ${UNKNOWN_TEXT}`;
  }

  return lookup.byIso(document.countryOfIssue) !== null
    ? `${lookup.byIso(document.countryOfIssue).country} (${document.countryOfIssue})`
    : UNKNOWN_TEXT;
};

const getDocumentNationality = (document) => {
  if (!document?.nationality) {
    return UNKNOWN_TEXT;
  }
  return lookup.byIso(document.nationality) !== null
    ? `${lookup.byIso(document.nationality).country} (${document.nationality})`
    : UNKNOWN_TEXT;
};

const getDocumentDOB = (document) => {
  if (!document?.dateOfBirth) {
    return UNKNOWN_TEXT;
  }
  return getFormattedDate(document?.dateOfBirth, SHORT_DATE_FORMAT_ALT);
};

const DocumentUtil = {
  get: getDocument,
  docExpiry: getDocumentExpiry,
  docValidity: getDocumentValidity,
  docType: getDocumentType,
  docNumber: getDocumentNumber,
  docName: getDocumentName,
  docIdentification: getDocumentIdentification,
  docCountry: getDocumentCountryOfIssue,
  docNationality: getDocumentNationality,
  docDOB: getDocumentDOB,
  calculateExpiry,
};

export default DocumentUtil;

export {
  getDocument,
  getDocumentExpiry,
  getDocumentValidity,
  getDocumentType,
  getDocumentNumber,
  getDocumentName,
  getDocumentIdentification,
  getDocumentCountryOfIssue,
  getDocumentNationality,
  getDocumentDOB,
  calculateExpiry,
};
