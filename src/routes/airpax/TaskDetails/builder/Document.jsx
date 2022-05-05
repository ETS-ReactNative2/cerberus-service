import React from 'react';
// Utils
import { getFormattedDate } from '../../utils/datetimeUtil';
import { getJourney, getArrivalTime } from '../../utils/movementUtil';

import {
  DocumentUtil,
} from '../../utils';

import renderBlock from './helper/common';

const Document = ({ version }) => {
  const document = DocumentUtil.get(version.movement.person);
  const journey = getJourney(version);
  // getFormattedDate() return current datetime if used without parameters
  const validFromExpiry = document ? DocumentUtil.calculateExpiry(document.validFrom, getFormattedDate()) : 'Unknown';
  const validToExpiry = document ? DocumentUtil.calculateExpiry(document.validTo, getArrivalTime(journey)) : 'Unknown';

  return (
    <div className="task-details-container">
      <h3 className="govuk-heading-s">Document</h3>
      <div className="govuk-task-details-grid-column">
        {renderBlock('Type', [DocumentUtil.docType(document)])}
        {renderBlock('Number', [DocumentUtil.docNumber(document)])}
        {renderBlock('Document nationality', [DocumentUtil.docNationality(document)])}
        {renderBlock('Country of issue', [DocumentUtil.docCountry(document)])}
        {renderBlock('Valid from', [DocumentUtil.docValidity(document, true), validFromExpiry])}
        {renderBlock('Valid To', [DocumentUtil.docExpiry(document, true), validToExpiry])}
        {renderBlock('Name', [DocumentUtil.docName(document)])}
        {renderBlock('Date of birth', [DocumentUtil.docDOB(document)])}
      </div>
    </div>
  );
};

export default Document;
