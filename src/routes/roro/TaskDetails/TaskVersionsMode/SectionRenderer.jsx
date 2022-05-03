import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import lookup from 'country-code-lookup';

import {
  formatKey,
  formatField,
  formatLinkField,
} from '../../../../utils/formatField';
import formatGender from '../../../../utils/genderFormatter';
import {
  RORO_UNACCOMPANIED_FREIGHT,
  RORO_ACCOMPANIED_FREIGHT,
  GROUP_ICON,
  INDIVIDUAL_ICON,
  RORO_TOURIST,
  SHORT_DATE_ALT,
} from '../../../../constants';
import {
  isValid,
  hasZeroCount,
  hasDriver,
  hasTaskVersionPassengers,
  hasCarrierCounts,
} from '../../../../utils/roroDataUtil';

import EnrichmentCount from './EnrichmentCount';

const replaceFieldName = (fieldName) => {
  switch (true) {
    case fieldName === 'Date and time':
      return 'Booking date and time';
    case fieldName === 'Check-in':
      return 'Check-in date and time';
    default:
      return fieldName;
  }
};

const discardDriver = (passengersField) => {
  const passengers = passengersField;
  const passengersWithNoDriver = passengers.childSets.slice(1);
  passengers.childSets = passengersWithNoDriver;
  return passengers;
};

const findLink = (contents, content, linkPropNames) => {
  const linkPropName = linkPropNames[content.propName];
  if (!linkPropName) {
    return null;
  }
  return contents.find((field) => field.propName === linkPropName)?.content;
};

const renderFields = (
  contents,
  linkPropNames = {},
  className = 'govuk-task-details-grid-item',
) => {
  return contents.map((content) => {
    if (!content.type.includes('HIDDEN')) {
      const link = findLink(contents, content, linkPropNames);
      return (
        <div className={className} key={uuidv4()}>
          <ul>
            <li className="govuk-grid-key font__light">
              {formatKey(content.type, replaceFieldName(content.fieldName))}
            </li>
            <li className="govuk-grid-value font__bold">
              {link
                ? formatLinkField(content.type, content.content, link)
                : formatField(content.type, content.content)}
            </li>
          </ul>
        </div>
      );
    }
  });
};

const renderDocumentExpiry = (passportExpiry, arrivalTime) => {
  const expiry = arrivalTime
    && passportExpiry !== 'Unknown'
    && `${arrivalTime},${moment(passportExpiry).format('YYYY-MM-DDTHH:mm:ss')}`;
  if (expiry) {
    return formatField('BOOKING_DATETIME', expiry)
      .split(', ')[1]
      .replace('before travel', 'after travel')
      .replace('ago', 'before travel')
      .replace('a ', 'A ')
      .replace('an ', 'An ');
  }
  return 'Unknown';
};

const renderVersionSection = (
  { fieldSetName, contents },
  linkPropNames = {},
) => {
  const enrichmentCount = contents?.find(({ propName }) => propName === 'enrichmentCount')?.content;
  if (contents !== undefined && contents !== null && contents.length > 0) {
    const jsxElement = renderFields(contents, linkPropNames);
    return (
      <div className="task-details-container bottom-border-thick">
        <h3 className="title-heading">{fieldSetName}</h3>
        {(fieldSetName === 'Haulier details' || fieldSetName === 'Account details')
          && <EnrichmentCount enrichmentCount={enrichmentCount} />}
        <div>{jsxElement}</div>
      </div>
    );
  }
};

const defaultLinkPropNames = { name: 'entitySearchUrl' };
const renderHaulierSection = (fieldSet) => {
  return renderVersionSection(fieldSet, defaultLinkPropNames);
};

const renderAccountSection = (fieldSet) => {
  return renderVersionSection(fieldSet, defaultLinkPropNames);
};

const renderGoodsSection = (fieldSet) => {
  return renderVersionSection(fieldSet);
};

const renderBookingSection = (fieldSet) => {
  return renderVersionSection(fieldSet);
};

const applyHighlightLabel = (name, dob, gender, nationality) => {
  if (
    dob?.type.includes('-CHANGED')
    || gender?.type.includes('-CHANGED')
    || nationality?.type.includes('-CHANGED')
    || name?.type.includes('-CHANGED')
  ) {
    return 'task-versions--highlight';
  }
};

const applyHighlightValue = (obj) => {
  if (obj?.type.includes('-CHANGED')) {
    return 'task-versions--highlight';
  }
};

const renderOccupants = (contents, fieldSetName, arrivalTime = undefined) => {
  const enrichmentCount = contents.find(({ propName }) => propName === 'enrichmentCount')?.content;
  const name = contents.find(({ propName }) => propName === 'name');
  const dob = contents.find(({ propName }) => propName === 'dob');
  const gender = contents.find(({ propName }) => propName === 'gender');
  const nationality = contents.find(
    ({ propName }) => propName === 'nationality',
  );
  const passportCountryOfIssue = contents.find(({ propName }) => propName === 'docCountryOfIssue')?.content;
  const isValidCountryCode = passportCountryOfIssue && passportCountryOfIssue.length === 2
  && lookup.byIso(passportCountryOfIssue) !== null;
  const passportNumber = contents.find(
    ({ propName }) => propName === 'docNumber',
  );
  const passportExpiry = contents.find(
    ({ propName }) => propName === 'docExpiry',
  );
  const link = findLink(contents, name, defaultLinkPropNames);
  return (
    <div className="govuk-!-margin-bottom-4 bottom-border">
      <EnrichmentCount enrichmentCount={enrichmentCount} />
      <div className="govuk-grid-row govuk-!-margin-bottom-2">
        <div className="govuk-grid-column-full">
          <p className="govuk-!-margin-bottom-1 font__light">
            <span
              className={applyHighlightLabel(name, dob, gender, nationality)}
            >
              {fieldSetName}
            </span>
          </p>
          {link ? (
            <p className="govuk-!-margin-bottom-0 font__bold">
              <span className={applyHighlightValue(name)}>
                {formatLinkField(name.type, name.content, link)}
              </span>
            </p>
          ) : (
            <p className="govuk-!-margin-bottom-0 font__bold">
              <span className={applyHighlightValue(name)}>{name.content}</span>
            </p>
          )}
          <p className="govuk-!-margin-bottom-0">
            <span className={`font__bold ${applyHighlightValue(gender)}`}>
              {formatGender(gender?.content)}
            </span>
            {dob?.content ? (
              <span className={`font__bold ${applyHighlightValue(dob)}`}>
                , born {formatField(SHORT_DATE_ALT, dob?.content)}
              </span>
            ) : (
              <span className={`font__bold ${applyHighlightValue(dob)}`}>
                , Unknown
              </span>
            )}
            {nationality?.content ? (
              <span
                className={`font__bold ${applyHighlightValue(nationality)}`}
              >
                , {nationality?.content}
              </span>
            ) : (
              <span
                className={`font__bold ${applyHighlightValue(nationality)}`}
              >
                , Unknown
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-2">
        <div className="govuk-grid-column-full govuk-!-margin-bottom-2">
          <p className="govuk-!-margin-bottom-1 font__light">
            <span className={`${applyHighlightValue(passportNumber)}`}>
              Passport
            </span>
          </p>
          <p className="govuk-!-margin-bottom-0 font__bold">
            <span
              className={`font__bold ${applyHighlightValue(passportNumber)}`}
            >
              {passportNumber?.content || 'Unknown'}
            </span>
          </p>
          <p className="govuk-!-margin-bottom-0 font__bold">
            {isValidCountryCode ? lookup.byIso(passportCountryOfIssue).country : 'Unknown'} ({isValidCountryCode ? passportCountryOfIssue : 'Unknown'})
          </p>
        </div>
        <div className="govuk-grid-column-full">
          <p className="govuk-!-margin-bottom-0 font__light">
            <span className={applyHighlightValue(passportExpiry)}>
              Validity
            </span>
          </p>
          <p className="govuk-!-margin-bottom-1">
            {passportExpiry?.content ? (
              <span
                className={`font__bold ${applyHighlightValue(passportExpiry)}`}
              >
                Expires {formatField(SHORT_DATE_ALT, passportExpiry?.content)}
              </span>
            ) : (
              <span
                className={`font__bold ${applyHighlightValue(passportExpiry)}`}
              >
                Unknown
              </span>
            )}
          </p>
          <p className="govuk-!-margin-bottom-0 font__light">
            <span className={applyHighlightValue(passportExpiry)}>
              {renderDocumentExpiry(
                formatField(SHORT_DATE_ALT, passportExpiry?.content),
                arrivalTime,
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const renderDriverSection = (fieldSet, arrivalTime) => {
  return renderOccupants(fieldSet.contents, fieldSet.fieldSetName, arrivalTime);
};

const renderVersionSectionBody = (
  fieldSet,
  linkPropNames = {},
  className = '',
) => {
  if (fieldSet.length > 0 && fieldSet !== null && fieldSet !== undefined) {
    return renderFields(fieldSet, linkPropNames, className);
  }
};

const renderTargetingIndicatorsSection = ({ type, hasChildSet, childSets }) => {
  if (hasChildSet) {
    const targetingIndicators = childSets.map((childSet, index) => {
      const indicator = childSet.contents.filter(
        ({ propName }) => propName === 'userfacingtext',
      )[0].content;
      const score = childSet.contents.filter(
        ({ propName }) => propName === 'score',
      )[0].content;
      if (!type.includes('HIDDEN')) {
        const className = index !== childSets.length - 1
          ? 'govuk-task-details-grid-row bottom-border'
          : 'govuk-task-details-grid-row';
        return (
          <div className={className} key={uuidv4()}>
            <ul className="list-bullet-container">
              {type.includes('CHANGED') ? (
                <li className="govuk-grid-key list-bullet font__light task-versions--highlight">
                  {indicator}
                </li>
              ) : (
                <li className="govuk-grid-key list-bullet font__light">
                  {indicator}
                </li>
              )}
            </ul>
            <span className="govuk-grid-value font__bold">
              {formatField(type, score)}
            </span>
          </div>
        );
      }
    });
    if (targetingIndicators.length > 0) {
      return (
        <>
          <div className="govuk-task-details-indicator-container">
            <div className="govuk-task-details-grid-row bottom-border">
              <span className="govuk-grid-key font__light">Indicator</span>
              <span className="govuk-grid-value font__light">Score</span>
            </div>
            <div className="task-details-container">{targetingIndicators}</div>
          </div>
        </>
      );
    }
  }
};

const renderVehicleSection = ({ contents }, movementMode) => {
  const enrichmentCount = contents.find(({ propName }) => propName === 'enrichmentCount')?.content;
  if (movementMode !== RORO_UNACCOMPANIED_FREIGHT.toUpperCase()) {
    if (contents.length > 0) {
      const vehicleArray = contents.filter(({ propName }) => {
        return (
          propName === 'registrationNumber'
          || propName === 'make'
          || propName === 'model'
          || propName === 'type'
          || propName === 'registrationNationality'
          || propName === 'colour'
          || propName === 'vehicleEntitySearchUrl'
        );
      });
      const linkPropNames = { registrationNumber: 'vehicleEntitySearchUrl' };
      const vehicleSection = renderVersionSectionBody(
        vehicleArray,
        linkPropNames,
      );
      return (
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Vehicle</h3>
          <EnrichmentCount enrichmentCount={enrichmentCount} />
          <div className="govuk-task-details-grid-column">{vehicleSection}</div>
        </div>
      );
    }
  }
};

const renderTrailerSection = ({ contents }, movementMode) => {
  const trailerEnrichmentCount = contents.find(({ propName }) => propName === 'trailerEnrichmentCount')?.content;
  if (
    movementMode === RORO_UNACCOMPANIED_FREIGHT.toUpperCase()
    || movementMode === RORO_ACCOMPANIED_FREIGHT.toUpperCase()
  ) {
    const trailerDataArray = contents.filter(({ propName }) => {
      return (
        propName === 'trailerRegistrationNumber'
        || propName === 'trailerType'
        || propName === 'trailerRegistrationNationality'
        || propName === 'trailerLength'
        || propName === 'trailerHeight'
        || propName === 'trailerEmptyOrLoaded'
        || propName === 'trailerEntitySearchUrl'
      );
    });
    // Check that trailer registration exists
    if (trailerDataArray[0].content !== null) {
      const linkPropNames = {
        trailerRegistrationNumber: 'trailerEntitySearchUrl',
      };
      const trailerSection = renderVersionSectionBody(
        trailerDataArray,
        linkPropNames,
      );
      return (
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Trailer</h3>
          <EnrichmentCount enrichmentCount={trailerEnrichmentCount} />
          <div className="govuk-task-details-grid-column">{trailerSection}</div>
        </div>
      );
    }
  }
};

const createOccupantsCarrierCountsFields = (manifestOccupantCategoryCounts) => {
  return manifestOccupantCategoryCounts.map((categoryCount, index) => {
    if (isValid(categoryCount)) {
      if (!categoryCount.type.includes('HIDDEN')) {
        const className = index !== manifestOccupantCategoryCounts.length - 1
          ? 'govuk-task-details-grid-row bottom-border'
          : 'govuk-task-details-grid-row';
        return (
          <div className={className} key={uuidv4()}>
            <ul>
              {categoryCount.type.includes('CHANGED') ? (
                <li
                  className={`govuk-grid-value font__bold ${
                    hasZeroCount(categoryCount.content) && 'font__grey'
                  } task-versions--highlight`}
                >
                  {categoryCount.fieldName}
                </li>
              ) : (
                <li
                  className={`govuk-grid-value  ${
                    hasZeroCount(categoryCount.content) && 'font__grey'
                  } font__bold`}
                >
                  {categoryCount.fieldName}
                </li>
              )}
            </ul>
            {categoryCount.type.includes('CHANGED') ? (
              <span
                className={`govuk-grid-value font__bold ${
                  hasZeroCount(categoryCount.content) && 'font__grey'
                } task-versions--highlight`}
              >
                {parseInt(
                  formatField(categoryCount.type, categoryCount.content),
                  10,
                )}
              </span>
            ) : (
              <span
                className={`govuk-grid-value font__bold ${
                  hasZeroCount(categoryCount.content) && 'font__grey'
                }`}
              >
                {parseInt(
                  formatField(categoryCount.type, categoryCount.content),
                  10,
                )}
              </span>
            )}
          </div>
        );
      }
    }
  });
};

const renderOccupantCarrierCountsSection = (
  driverField,
  passengersField,
  passengersMetadata,
  movementMode,
  movementModeIcon = 'any-icon',
) => {
  if (passengersMetadata) {
    if (
      movementMode === RORO_ACCOMPANIED_FREIGHT
      || movementMode === RORO_TOURIST
    ) {
      /**
       * Discard the driver element that was initially added to obtain actual number
       * of named passengers in the movement
       */
      const passengersDiscardedDriver = discardDriver(passengersField);
      let occupantsCountJsxElement;
      let driverName;
      if (
        movementModeIcon !== GROUP_ICON
        && movementModeIcon !== INDIVIDUAL_ICON
      ) {
        if (driverField.contents.length > 0) {
          driverName = driverField.contents.find(
            ({ propName }) => propName === 'name',
          ).content;
        }
      }
      let manifestOccupantCategoryCounts = passengersMetadata.contents
        .filter(({ propName }) => {
          return (
            propName === 'infantCount'
            || propName === 'childCount'
            || propName === 'adultCount'
            || propName === 'oapCount'
          );
        })
        .reverse();

      if (
        !hasDriver(driverName)
        && !hasTaskVersionPassengers(passengersDiscardedDriver)
        && hasCarrierCounts(manifestOccupantCategoryCounts)
      ) {
        occupantsCountJsxElement = createOccupantsCarrierCountsFields(
          manifestOccupantCategoryCounts,
        );
      }

      if (
        hasDriver(driverName)
        && !hasTaskVersionPassengers(passengersDiscardedDriver)
        && hasCarrierCounts(manifestOccupantCategoryCounts)
      ) {
        occupantsCountJsxElement = createOccupantsCarrierCountsFields(
          manifestOccupantCategoryCounts,
        );
      }

      if (
        !hasDriver(driverName)
        && !hasTaskVersionPassengers(passengersDiscardedDriver)
        && !hasCarrierCounts(manifestOccupantCategoryCounts)
      ) {
        manifestOccupantCategoryCounts = passengersMetadata.contents.filter(
          ({ propName }) => {
            return propName === 'unknownCount';
          },
        );
        occupantsCountJsxElement = manifestOccupantCategoryCounts
          && manifestOccupantCategoryCounts[0]?.content
          && createOccupantsCarrierCountsFields(manifestOccupantCategoryCounts);
      }

      if (occupantsCountJsxElement) {
        return (
          <div className="govuk-task-details-counts-container">
            <div className="govuk-task-details-grid-row bottom-border">
              <span className="govuk-grid-key font__light">Category</span>
              <span className="govuk-grid-value font__light">Number</span>
            </div>
            <div className="task-details-container">
              {occupantsCountJsxElement}
            </div>
          </div>
        );
      }
    }
  }
};

const renderOccupantsSection = (
  { childSets },
  movementModeIcon,
  arrivalTime,
) => {
  // Passenger at position 0 is driver so they are excluded from the remaining passengers
  const remainingTravellers = childSets.slice(1);
  // Actual passenger
  const firstPassenger = remainingTravellers[0]?.contents;
  const otherPassengers = remainingTravellers
    ? remainingTravellers.slice(1)
    : undefined;
  let firstPassengerJsxElement;
  let otherPassengersJsxElementBlock;

  if (firstPassenger !== null && firstPassenger !== undefined) {
    if (firstPassenger.length > 0) {
      firstPassengerJsxElement = renderOccupants(
        firstPassenger,
        'Occupant',
        arrivalTime,
      );

      if (otherPassengers !== null && otherPassengers !== undefined) {
        if (otherPassengers.length > 0) {
          otherPassengersJsxElementBlock = otherPassengers.map(
            (otherPassenger) => {
              const passengerJsxElement = renderOccupants(
                otherPassenger.contents,
                'Occupant',
                arrivalTime,
              );
              return <div key={uuidv4()}>{passengerJsxElement}</div>;
            },
          );
        }
      }
      return (
        <>
          <div className="task-details-container">
            <div>{firstPassengerJsxElement}</div>
            {otherPassengersJsxElementBlock && (
              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Show more</span>
                </summary>
                <div className="govuk-hidden-passengers">
                  {otherPassengersJsxElementBlock}
                </div>
              </details>
            )}
          </div>
        </>
      );
    }
  }
};

const renderPrimaryTraveller = ({ childSets }, movementModeIcon) => {
  const primaryTraveller = childSets[0].contents;
  const enrichmentCount = primaryTraveller.find(({ propName }) => propName === 'enrichmentCount')?.content;
  if (primaryTraveller.length > 0) {
    let primaryTravellerArray;
    if (movementModeIcon === INDIVIDUAL_ICON) {
      primaryTravellerArray = primaryTraveller.filter(({ propName }) => {
        return (
          propName === 'name'
          || propName === 'dob'
          || propName === 'gender'
          || propName === 'nationality'
          || propName === 'docType'
          || propName === 'docNumber'
          || propName === 'docExpiry'
          || propName === 'entitySearchUrl'
        );
      });
    } else {
      primaryTravellerArray = primaryTraveller.filter(({ propName }) => {
        return (
          propName === 'name'
          || propName === 'dob'
          || propName === 'gender'
          || propName === 'nationality'
          || propName === 'entitySearchUrl'
        );
      });
    }
    const primaryTravellerSection = renderVersionSectionBody(
      primaryTravellerArray,
      defaultLinkPropNames,
    );
    return (
      <div className="task-details-container bottom-border-thick">
        <h3 className="title-heading">Primary Traveller</h3>
        <EnrichmentCount enrichmentCount={enrichmentCount} />
        <div className="govuk-task-details-grid-column">
          {primaryTravellerSection}
        </div>
      </div>
    );
  }
};

const renderPrimaryTravellerDocument = ({ childSets }) => {
  const primaryTraveller = childSets[0].contents;
  if (primaryTraveller.length > 0) {
    const primaryTravellerDocumentArray = primaryTraveller.filter(
      ({ propName }) => {
        return (
          propName === 'docType'
          || propName === 'docNumber'
          || propName === 'docExpiry'
        );
      },
    );
    const primaryTravellerDocumentSection = renderVersionSectionBody(
      primaryTravellerDocumentArray,
    );
    return (
      <div className="task-details-container bottom-border-thick">
        <h3 className="title-heading">Document</h3>
        <div className="govuk-task-details-grid-column">
          {primaryTravellerDocumentSection}
        </div>
      </div>
    );
  }
};

export {
  renderHaulierSection,
  renderVersionSection,
  renderAccountSection,
  renderDriverSection,
  renderGoodsSection,
  renderBookingSection,
  renderTargetingIndicatorsSection,
  renderVehicleSection,
  renderTrailerSection,
  renderOccupantsSection,
  renderOccupantCarrierCountsSection,
  renderPrimaryTraveller,
  renderPrimaryTravellerDocument,
  renderDocumentExpiry,
};
