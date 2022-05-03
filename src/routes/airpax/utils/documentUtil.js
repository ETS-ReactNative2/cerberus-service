import { UNKNOWN_TEXT } from '../../../constants';

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

const hasDocument = (person) => {
  return !!person?.document;
};

const getDocument = (person) => {
  if (person && hasDocument(person)) {
    return person.document;
  }
  return null;
};

const DocumentUtil = {
  get: getDocument,
  docExpiry: getDocumentExpiry,
  docValidity: getDocumentValidity,
  docIdentification: getDocumentIdentification,
  docCountry: getDocumentCountryOfIssue,
};

export default DocumentUtil;

export {
  getDocumentCountryOfIssue,
  getDocumentIdentification,
  getDocumentValidity,
  getDocumentExpiry,
  getDocument,
};
