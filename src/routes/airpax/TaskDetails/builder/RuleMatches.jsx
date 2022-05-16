import React from 'react';
import Table from '../../../../components/Table';
import { RisksUtil } from '../../utils';
import { RULES_FIELD_NAMES, RULES_FIELD_DESCRIPTION } from '../../../../constants';

const renderRulesData = (rules) => {
  return Object.entries(rules).map(([key, rule], index) => {
    const field = Object.keys(RULES_FIELD_NAMES).includes(key) ? key : false;
    if (field) {
      return (
        <div key={index} className="govuk-grid-column-one-quarter">
          <h4 className="govuk-heading-s">{RULES_FIELD_NAMES[key]}</h4>
          <p>{rule}</p>
        </div>
      );
    }
  });
};

const renderRulesDesc = (rules) => {
  return Object.entries(rules).map(([key, rule], index) => {
    const field = Object.keys(RULES_FIELD_DESCRIPTION).includes(key) ? key : false;
    if (field) {
      return (
        <div key={index} className={`govuk-grid-column-one-quarter ${key === 'agency' && 'float-right'}`}>
          <h4 className="govuk-heading-s">{RULES_FIELD_DESCRIPTION[key]}</h4>
          <p>{rule}</p>
        </div>
      );
    }
  });
};

// Converts Array of objects into Array of Arrays
const toRows = (indicators) => {
  return indicators.map(Object.values);
};

const renderRiskIndicators = (rules) => {
  if (rules.indicatorMatches.length > 0) {
    return (
      <Table
        headings={['Entity type', 'Attribute', 'Operator', 'Value(s)']}
        rows={toRows(rules.indicatorMatches)}
      />
    );
  }
};

const RuleMatches = ({ version }) => {
  const rules = RisksUtil.getRules(version);
  const firstRule = rules.length && rules.slice(0, 1);
  const otherRules = rules.length > 0 && rules.slice(1, rules.length);

  return (
    <div>
      <h2 className="govuk-heading-m header-bg-grey">Rules matched</h2>
      <div className="govuk-grid-row">{ firstRule && renderRulesData(firstRule) }</div>
      <div className="govuk-grid-row">{ firstRule && renderRulesDesc(firstRule) }</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          <h4 className="govuk-heading-s govuk-!-margin-bottom-2">Risk indicators ({firstRule?.indicatorMatches.length})</h4>
          { firstRule && renderRiskIndicators(firstRule) }
        </div>
      </div>

      <h2 className="govuk-heading-m header-bg-grey">Other rules matches ({otherRules.length})</h2>
      { otherRules && otherRules.map((rule, index) => (
        <div key={index}>
          <div className="govuk-grid-row">{ renderRulesData(rule) }</div>
          <details className="govuk-details" data-module="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">View further details</span>
            </summary>
            <div className="govuk-details__text" style={{ overflow: 'hidden' }}>
              <div className="govuk-grid-row govuk-!-margin-left-1">{ renderRulesDesc(firstRule) }</div>
              <div className="govuk-grid-column-full">
                <h4 className="govuk-heading-s">Risk indicators ({rule.indicatorMatches.length})</h4>
                { rule && renderRiskIndicators(rule) }
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
};

export default RuleMatches;
