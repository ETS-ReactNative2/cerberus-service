import React from 'react';

import { calculateTaskVersionTotalRiskScore } from '../../../utils/rickScoreCalculator';

import {
  renderTargetingIndicatorsSection,
  renderVehicleSection,
  renderTrailerSection,
  renderGoodsSection,
  renderBookingSection,
  renderOccupantsSection,
  renderHaulierSection,
  renderAccountSection,
  renderVersionSection,
  renderOccupantCarrierCountsSection,
} from './SectionRenderer';

import {
  hasTaskVersionPassengers,
  extractTaskVersionsBookingField,
  getTaskDetailsTotalOccupants,
} from '../../../utils/roroDataUtil';

const renderFirstColumn = (version, movementMode) => {
  const targIndicatorsField = version.find(({ propName }) => propName === 'targetingIndicators');
  const vehicleField = version.find(({ propName }) => propName === 'vehicle');
  const goodsField = version.find(({ propName }) => propName === 'goods');
  const targetingIndicators = (targIndicatorsField !== null && targIndicatorsField !== undefined) && renderTargetingIndicatorsSection(targIndicatorsField);
  const vehicle = (vehicleField !== null && vehicleField !== undefined) && renderVehicleSection(vehicleField, movementMode);
  const trailer = (vehicleField !== null && vehicleField !== undefined) && renderTrailerSection(vehicleField, movementMode);
  const goods = (goodsField !== null && goodsField !== undefined) && renderGoodsSection(goodsField);
  return (
    <div className="govuk-task-details-col-1">
      <div className="govuk-task-details-indicator-container  bottom-border-thick">
        <h3 className="title-heading">{targIndicatorsField.fieldSetName}</h3>
        <div className="govuk-task-details-grid-row bottom-border">
          <span className="govuk-grid-key font__bold">Indicators</span>
          <span className="govuk-grid-value font__bold">Total score</span>
        </div>
        <div className="govuk-task-details-grid-row">
          <span className="govuk-grid-key font__bold">{targIndicatorsField.childSets.length}</span>
          <span className="govuk-grid-key font__bold">{calculateTaskVersionTotalRiskScore(targIndicatorsField.childSets)}</span>
        </div>
        {targetingIndicators}
      </div>
      {vehicle}
      {trailer}
      {goods}
    </div>
  );
};

const renderSecondColumn = (version, taskSummaryData) => {
  const haulierField = version.find(({ propName }) => propName === 'haulier');
  const accountField = version.find(({ propName }) => propName === 'account');
  const bookingField = extractTaskVersionsBookingField(version, taskSummaryData);
  const haulier = (haulierField !== null && haulierField !== undefined) && renderHaulierSection(haulierField);
  const account = (accountField !== null && accountField !== undefined) && renderAccountSection(accountField);
  const booking = (bookingField !== null && bookingField !== undefined) && renderBookingSection(bookingField);
  return (
    <div className="govuk-task-details-col-2">
      {haulier}
      {account}
      {booking}
    </div>
  );
};

const renderThirdColumn = (version, movementMode, movementModeIcon) => {
  const driverField = version.find(({ propName }) => propName === 'driver');
  const passengersField = version.find(({ propName }) => propName === 'passengers');
  const passengersMetadata = version.find(({ propName }) => propName === 'occupants');
  const totalCount = getTaskDetailsTotalOccupants(passengersMetadata);
  const isValidToRender = hasTaskVersionPassengers(passengersField);
  const occupants = isValidToRender && passengersField.childSets.length > 0 && renderOccupantsSection(passengersField, movementModeIcon);
  const carrierOccupantCounts = renderOccupantCarrierCountsSection(driverField, passengersField, passengersMetadata, movementMode);
  const driver = (driverField !== null && driverField !== undefined) && renderVersionSection(driverField);
  return (
    <div className="govuk-task-details-col-3">
      <div className="task-details-container bottom-border-thick">
        <h3 className="title-heading">Occupants</h3>
        <div className="govuk-task-details-grid-row total-occupants-header">
          <span className="govuk-grid-key font__light">Total occupants</span>
        </div>
        <div className="govuk-task-details-grid-row total-occupants-count">
          <span className="govuk-grid-key font__bold">{totalCount || passengersField.childSets.length}</span>
        </div>
        {carrierOccupantCounts
        && (
        <div className="govuk-task-details-counts-container">
          <div className="task-details-container">
            {carrierOccupantCounts}
          </div>
        </div>
        )}
        {occupants}
      </div>
      {driver}
    </div>
  );
};

const RoRoAccompaniedTaskVersion = ({ version, movementMode, movementModeIcon, taskSummaryData }) => {
  return (
    <div className="govuk-task-details-grid">
      <div className="govuk-grid-column-one-third">
        {renderFirstColumn(version, movementMode)}
      </div>
      <div className="govuk-grid-column-one-third vertical-dotted-line-one">
        {renderSecondColumn(version, taskSummaryData)}
      </div>
      <div className="govuk-grid-column-one-third vertical-dotted-line-two">
        {renderThirdColumn(version, movementMode, movementModeIcon)}
      </div>
    </div>
  );
};

export default RoRoAccompaniedTaskVersion;
