import React from 'react';
import * as pluralise from 'pluralise';
<<<<<<< HEAD
import { WARNING_CODES_MAPPING, NO_TEXT, YES_TEXT, CURRENTLY_UNAVAILABLE_TEXT } from '../../../constants';
=======
import { WARNING_CODES_MAPPING } from '../../../constants';
>>>>>>> COP-10599: Added selector matches to task versions

const formatTargetIndicators = (targetingIndicators) => {
  if (targetingIndicators?.indicators?.length > 0) {
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

const hasTargetingIndicators = (risks) => {
  return !!risks?.targetingIndicators;
};

const getTargetingIndicators = (risks) => {
  if (hasTargetingIndicators(risks)) {
    return risks.targetingIndicators;
  }
  return null;
};

const hasRisk = (targetTask) => {
  return !!targetTask?.risks;
};

const getRisk = (targetTask) => {
  if (hasRisk(targetTask)) {
    return targetTask.risks;
  }
  return null;
};

const getSelectorWarning = (selector) => {
  let warning;
  let warningDetails;
  const warningStatus = selector.warning.status;
<<<<<<< HEAD
  if (warningStatus?.toLowerCase() === NO_TEXT.toLowerCase()) warning = 'No warnings';
  if (warningStatus?.toLowerCase() === CURRENTLY_UNAVAILABLE_TEXT.toLowerCase()) warning = 'Warnings currently unavailable';
  if (warningStatus?.toLowerCase() === YES_TEXT.toLowerCase()) {
=======
  if (warningStatus === 'No' || warningStatus === 'NO') warning = 'No warnings';
  if (warningStatus === 'Currently unavailable') warning = 'Warnings currently unavailable';
  if (warningStatus === 'Yes' || warningStatus === 'YES') {
>>>>>>> COP-10599: Added selector matches to task versions
    const warningTypes = selector.warning.types;
    const containsOther = warningTypes.indexOf('O') > -1;
    if (warningTypes.length > 0) {
      if (containsOther) {
        warningDetails = selector.warning.detail;
      }
      warning = warningTypes.map((w) => (w === 'O' ? warningDetails?.substring(0, 500) : WARNING_CODES_MAPPING[w])).join(', ');
    }
  }
  return warning;
};

const hasIndicatorMatches = (selector) => {
  return !!selector?.indicatorMatches;
};

const getIndicatorMatches = (selector) => {
  if (hasIndicatorMatches(selector)) {
    return selector.indicatorMatches;
  }
  return null;
};

const hasSelectorGroups = (version) => {
  return !!version?.risks?.matchedSelectorGroups;
};

const getSelectorGroups = (version) => {
  if (hasSelectorGroups(version)) {
    return version.risks.matchedSelectorGroups;
  }
  return null;
};

const IndicatorsUtil = {
  getRisks: getRisk,
  format: formatTargetIndicators,
  getIndicators: getTargetingIndicators,
  getWarning: getSelectorWarning,
  getMatches: getIndicatorMatches,
  getGroups: getSelectorGroups,
};

export default IndicatorsUtil;

export { formatTargetIndicators, getRisk, getTargetingIndicators, getSelectorWarning, getIndicatorMatches };
