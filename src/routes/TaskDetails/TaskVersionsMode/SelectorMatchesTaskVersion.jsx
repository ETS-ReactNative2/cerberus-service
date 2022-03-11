import React from 'react';
import { Tab, TabList, Tabs, TabPanel } from 'react-tabs';
import { v4 as uuidv4 } from 'uuid';
import '../../../__assets__/ReactTabs.scss';

const warningCodesMapping = {
  VIOL: 'Violence',
  FIRE: 'Firearms',
  WEAP: 'Weapons',
  CTGN: 'Contagion',
  SEH: 'Self Harm',
};

// Grouping selectors by group reference
const selectorsByGroupReference = (selectors) => {
  let groupedSelectors = [];
  selectors.map((selector) => {
    const groupReference = selector.contents.find(({ propName }) => propName === 'groupReference')?.content;
    if (!groupedSelectors[groupReference]) groupedSelectors[groupReference] = [];
    groupedSelectors[groupReference].push(selector);
  });
  return groupedSelectors;
};

const SelectorMatchesTaskVersion = ({ version }) => {
  const otherFields = ['requestingOfficer', 'sourceReference', 'category', 'threatType', 'pointOfContactMessage', 'pointOfContact', 'inboundActionCode', 'outboundActionCode', 'notes', 'creator'];
  const selectorMatches = version.find(({ propName }) => propName === 'selectors');
  const selectorsGroup = selectorsByGroupReference(selectorMatches?.childSets);
  return (
    <div>
      <h2 className="govuk-heading-m">{selectorMatches.fieldSetName}</h2>
      { Object.entries(selectorsGroup).map(([GroupReference, selectors], index) => {
        let indicatorValue;
        let selectorReference;
        let contents;
        let warnings;
        let warningDetails;
        let groupNumber;
        let field;
        return (
          <div key={uuidv4()}>
            <h4 className="govuk-heading-s govuk-!-margin-bottom-2 govuk-!-margin-top-2">{GroupReference}</h4>
            { selectors.map((selector, j) => {
              return selector.contents.map((c) => {
                if (j === 0) {
                  field = otherFields.includes(c.propName) ? c : false;
                  if (field) {
                    return (
                      <div key={uuidv4()} className="govuk-grid-row">
                        <p className="govuk-heading-s govuk-!-margin-bottom-0 govuk-!-font-size-16 govuk-grid-column-one-half">{field.fieldName}</p>
                        <p className="govuk-body govuk-!-margin-bottom-0 govuk-!-font-size-16 govuk-grid-column-one-half govuk-!-padding-0">{field.content}</p>
                      </div>
                    );
                  }
                }
              });
            })}
            <br />
            <Tabs>
              <TabList key={index}>
                { selectors.map((selector, selectorKey) => {
                  indicatorValue = selector.childSets[0]?.contents?.filter(({ propName }) => propName === 'indicatorValue').map((indicator) => indicator.content).join(' ');
                  selectorReference = selector.contents.find(({ propName }) => propName === 'groupNumber').content;
                  return (
                    <Tab key={selectorKey}>
                      <p className="govuk-heading-s govuk-!-font-size-16">{indicatorValue}</p>
                      <p className="govuk-!-font-size-14 font-light">{selectorReference}</p>
                    </Tab>
                  );
                })};
              </TabList>

              { selectors.map((selector, selectorIndex) => {
                contents = selector?.childSets[0].contents;
                warnings = selector.contents.find(({ propName }) => propName === 'selectorWarnings')?.content;
                groupNumber = selector.contents.find(({ propName }) => propName === 'groupNumber').content;
                const warningSplit = warnings?.split(',');
                const containsOther = warningSplit?.indexOf('O') > -1;
                if (warningSplit?.length > 1 || containsOther || warningCodesMapping[warnings]) {
                  if (containsOther) {
                    warningDetails = selector.contents.find(({ propName }) => propName === 'warningDetails').content;
                  }
                  warnings = warningSplit.map((v) => (v === 'O' ? warningDetails?.substring(0, 500) : warningCodesMapping[v])).join(',');
                }
                return (
                  <TabPanel key={selectorIndex}>
                    <div className="govuk-grid-row govuk-!-margin-top-1">
                      <p className="govuk-heading-s govuk-!-font-size-16 govuk-grid-column-one-half govuk-!-margin-bottom-0">Selector {groupNumber}</p>
                      <p className="govuk-heading-s govuk-!-font-size-16 govuk-grid-column-one-half govuk-!-padding-right-1 govuk-!-margin-bottom-0 font-warning">{warnings}</p>
                    </div>
                    <p className="govuk-body govuk-!-font-size-16">All of these attributes are present in this movement.</p>
                    <div className="panel">
                      { contents.map((c, contentIndex) => {
                        return (
                          <div className="panel-content" key={contentIndex}>
                            <p className="govuk-body govuk-!-font-size-16 govuk-!-font-weight-bold govuk-!-margin-bottom-0">{c.fieldName}</p>
                            <p className="govuk-body govuk-!-font-size-16">{c.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </TabPanel>
                );
              })}

            </Tabs>
            <br /><br />
          </div>
        );
      })}
    </div>
  );
};

export { SelectorMatchesTaskVersion, selectorsByGroupReference };
