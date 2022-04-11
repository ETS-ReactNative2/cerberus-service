import React from 'react';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
// Config
import * as pluralise from 'pluralise';
import * as constants from '../../constants';
// Utils
import targetDatetimeDifference from '../../utils/calculateDatetimeDifference';
import formatGender from '../../utils/genderFormatter';
import { hasVehicleMake, hasVehicleModel, hasVehicle, hasTrailer } from '../../utils/roroDataUtil';

const getMovementModeTypeText = (movementModeIcon) => {
  switch (movementModeIcon) {
    case constants.RORO_TOURIST_CAR_ICON: {
      return 'Vehicle';
    }
    case constants.RORO_TOURIST_SINGLE_ICON: {
      return 'Single passenger';
    }
    default: {
      return 'Group';
    }
  }
};

const getMovementModeTypeContent = (roroData, movementModeIcon, passengers) => {
  switch (movementModeIcon) {
    case constants.RORO_TOURIST_CAR_ICON: {
      return !roroData.vehicle.registrationNumber ? '\xa0' : roroData.vehicle.registrationNumber.toUpperCase();
    }
    case constants.RORO_TOURIST_SINGLE_ICON: {
      return '1 foot passenger';
    }
    default: {
      return passengers !== undefined ? `${passengers.length} foot passengers` : '0';
    }
  }
};

const createCoTravellers = (coTravellers) => {
  let remainingCoTravellers = coTravellers.splice(1); // Return remainder of array (passenger at index 0 is primary traveller)
  const maxToDisplay = 4;
  const remaining = remainingCoTravellers.length > maxToDisplay ? remainingCoTravellers.length - maxToDisplay : 0;
  const coTravellersJsx = remainingCoTravellers.map((coTraveller, index) => {
    if (index < maxToDisplay) {
      return (
        <li key={uuidv4()}>{coTraveller?.firstName} {coTraveller?.lastName}{(index !== maxToDisplay - 1) && (index !== remainingCoTravellers.length - 1) ? ',' : ''} {(remaining > 0 && index + 1 === maxToDisplay) ? ` plus ${remaining} more` : ''}</li>
      );
    }
  });
  return (
    <>
      {coTravellersJsx}
    </>
  );
};

const hasPreviousSeizures = (enrichmentCounts) => {
  const seizure = enrichmentCounts?.split('/')[2];
  return seizure >= 1;
};

const hasTravellersWithPreviousSeizures = (passengers) => {
  return passengers.find((passenger) => {
    const seizure = passenger?.enrichmentCount?.split('/')[2];
    return seizure >= 1;
  });
};

const renderRoRoTouristModeSection = (roroData, movementModeIcon, passengers) => {
  return (
    <div className="govuk-grid-column-one-quarter govuk-!-padding-left-9">
      <i className={`icon-position--left ${movementModeIcon}`} />
      <p className="govuk-body-s content-line-one govuk-!-margin-bottom-0 govuk-!-padding-left-1">{getMovementModeTypeText(movementModeIcon)}</p>
      <p className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-padding-left-1">{getMovementModeTypeContent(roroData, movementModeIcon, passengers)}</p>
    </div>
  );
};

const renderRoroModeSection = (roroData, movementModeIcon) => {
  if (movementModeIcon === constants.RORO_UNACCOMPANIED_ICON) {
    return (
      <div className="govuk-grid-column-one-quarter govuk-!-padding-left-9">
        <i className={`icon-position--left ${movementModeIcon}`} />
        <p className="govuk-body-s content-line-one govuk-!-margin-bottom-0 govuk-!-padding-left-1">{'\xa0'}</p>
        <p className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-padding-left-1">
          {hasTrailer(roroData.vehicle?.trailer?.regNumber) ? roroData.vehicle.trailer.regNumber.toUpperCase() : '\xa0'}
        </p>
      </div>
    );
  }
  return (
    <div className="govuk-grid-column-one-quarter govuk-!-padding-left-9">
      <i className={`icon-position--left ${movementModeIcon}`} />
      <p className="govuk-body-s content-line-one govuk-!-margin-bottom-0 govuk-!-padding-left-1">
        {hasVehicleMake(roroData.vehicle?.make) ? roroData.vehicle.make : '\xa0'}{' '}
        {hasVehicleModel(roroData.vehicle?.model) ? roroData.vehicle.model : '\xa0'}
      </p>
      <p className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-padding-left-1">
        {hasVehicle(roroData.vehicle?.registrationNumber) ? roroData.vehicle.registrationNumber.toUpperCase() : '\xa0'}
      </p>
    </div>
  );
};

const renderRoroVoyageSection = (roroData) => {
  return (
    <div className="govuk-grid-column-three-quarters govuk-!-padding-right-7 align-right">
      <i className="c-icon-ship" />
      <p className="content-line-one govuk-!-padding-right-2">{roroData.vessel.company && `${roroData.vessel.company} voyage of `}{roroData.vessel.name}{', '}arrival {!roroData.eta ? 'unknown' : dayjs.utc(roroData.eta).fromNow()}</p>
      <p className="govuk-body-s content-line-two govuk-!-padding-right-2">
        {!roroData.departureTime ? 'unknown' : dayjs.utc(roroData.departureTime).local().format(constants.LONG_DATE_FORMAT)}{' '}
        <span className="dot" />
        <span className="govuk-!-font-weight-bold"> {roroData.departureLocation || 'unknown'}</span>{' '}-{' '}
        <span className="govuk-!-font-weight-bold">{roroData.arrivalLocation || 'unknown'}</span> <span className="dot" /> {!roroData.eta ? 'unknown'
          : dayjs.utc(roroData.eta).local().format(constants.LONG_DATE_FORMAT)}
      </p>
    </div>
  );
};

const renderRoRoTouristSingleAndGroupCardBody = (roroData) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-item">
        <div>
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
            Primary traveller
            {roroData.driver?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.driver.enrichmentCount) ? 'font--red' : ''}`}>({roroData.driver.enrichmentCount})</span>}
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
            {roroData.passengers ? (<li className="govuk-!-font-weight-bold">{roroData?.passengers[0]?.name}</li>)
              : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
          </ul>
        </div>
      </div>
      <div className="govuk-grid-item verticel-dotted-line">
        <div>
          <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
            Document
          </h3>
          <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
            {roroData.passengers[0]?.docNumber ? (<li className="govuk-!-font-weight-bold">{roroData.passengers[0].docNumber}</li>)
              : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
          </ul>
        </div>
      </div>
      <div className="govuk-grid-item verticel-dotted-line">
        <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
          Booking
        </h3>
        <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
          {roroData.bookingDateTime ? (
            <>
              {roroData.bookingDateTime && <li>Booked on {dayjs.utc(roroData.bookingDateTime.split(',')[0]).format(constants.SHORT_DATE_FORMAT)}</li>}
              {roroData.bookingDateTime && <br />}
              {roroData.bookingDateTime && <li>{targetDatetimeDifference(roroData.bookingDateTime)}</li>}
            </>
          ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
        </ul>
      </div>
      <div className="govuk-grid-item verticel-dotted-line">
        <h3 className={`
          govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular
          ${hasTravellersWithPreviousSeizures(roroData.passengers) ? 'font--red' : ''}
        `}
        >
          Co-travellers
        </h3>
        <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
          {roroData?.passengers && roroData?.passengers.length > 1
            ? (createCoTravellers([...roroData.passengers])) : (<li className="govuk-!-font-weight-bold">None</li>) }
        </ul>
      </div>
    </div>
  );
};

const renderRoRoTouristCard = (roroData, movementMode, movementModeIcon) => {
  const passengers = roroData?.passengers;
  if (movementModeIcon === constants.RORO_TOURIST_CAR_ICON) {
    return (
      <>
        <section className="task-list--item-2">
          <div>
            <div className="govuk-grid-row grid-background--greyed">
              {renderRoRoTouristModeSection(roroData, movementModeIcon, passengers)}
              {renderRoroVoyageSection(roroData)}
            </div>
          </div>
        </section>
        <section className="task-list--item-3">
          <div className="govuk-grid-row">
            <div className="govuk-grid-item">
              <div>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Driver
                  {roroData.driver?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.driver.enrichmentCount) ? 'font--red' : ''}`}>({roroData.driver.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData?.passengers ? (
                    <>
                      <li className="govuk-!-font-weight-bold">
                        {(roroData.passengers && roroData.passengers.length > 0) && roroData.passengers[0].name}
                      </li>
                      {(roroData.passengers && roroData.passengers.length > 0) && <br />}
                      <li>
                        {formatGender(passengers[0]?.gender)}
                      </li>
                    </>
                  ) : (
                    <li className="govuk-!-font-weight-bold">Unknown</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="govuk-grid-item verticel-dotted-line">
              <div>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  VRN
                  {roroData.vehicle?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.vehicle.enrichmentCount) ? 'font--red' : ''}`}>({roroData.vehicle.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.vehicle?.registrationNumber
                    ? (
                      <>
                        <li>
                          <span className="govuk-!-font-weight-bold">{roroData.vehicle.registrationNumber}</span>
                          <span className="govuk-!-margin-left-3">{roroData.enrichmnentCount && roroData.enrichmnentCount}</span>
                        </li>
                        {roroData.vehicle.make && <br />}
                      </>
                    )
                    : (<li className="govuk-!-font-weight-bold">Unknown</li>
                    )}

                </ul>
              </div>
            </div>
            <div className="govuk-grid-item verticel-dotted-line">
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                Booking
              </h3>
              <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                {roroData.bookingDateTime ? (
                  <>
                    {roroData.bookingDateTime && <li>Booked on {dayjs.utc(roroData.bookingDateTime.split(',')[0]).format(constants.SHORT_DATE_FORMAT)}</li>}
                    {roroData.bookingDateTime && <br />}
                    {roroData.bookingDateTime && <li>{targetDatetimeDifference(roroData.bookingDateTime)}</li>}
                  </>
                ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
              </ul>
            </div>
            <div className="govuk-grid-item verticel-dotted-line">
              <h3 className={`
                govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular
                ${hasTravellersWithPreviousSeizures(roroData.passengers) ? 'font--red' : ''}
              `}
              >
                Co-travellers
              </h3>
              <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                {roroData.passengers && roroData.passengers.length > 1
                  ? (createCoTravellers([...roroData.passengers])) : (<li className="govuk-!-font-weight-bold">None</li>)}
              </ul>
            </div>
          </div>
        </section>
      </>
    );
  }
  if (movementModeIcon === constants.RORO_TOURIST_SINGLE_ICON) {
    return (
      <>
        <section className="task-list--item-2">
          <div>
            <div className="govuk-grid-row grid-background--greyed">
              {renderRoRoTouristModeSection(roroData, movementModeIcon, passengers)}
              {renderRoroVoyageSection(roroData)}
            </div>
          </div>
        </section>
        <section className="task-list--item-3">
          {renderRoRoTouristSingleAndGroupCardBody(roroData)}
        </section>
      </>
    );
  }
  if (movementModeIcon === constants.RORO_TOURIST_GROUP_ICON) {
    return (
      <>
        <section className="task-list--item-2">
          <div>
            <div className="govuk-grid-row grid-background--greyed">
              {renderRoRoTouristModeSection(roroData, movementModeIcon, passengers)}
              {renderRoroVoyageSection(roroData)}
            </div>
          </div>
        </section>
        <section className="task-list--item-3">
          {renderRoRoTouristSingleAndGroupCardBody(roroData)}
        </section>
      </>
    );
  }
};

const TaskListMode = ({ roroData, target, movementModeIcon }) => {
  const passengers = roroData.passengers;
  const movementMode = target.movementMode.toUpperCase();
  return (
    <>
      {movementMode === constants.RORO_UNACCOMPANIED_FREIGHT.toUpperCase() && (
        <>
          <section className="task-list--item-2">
            <div>
              <div className="govuk-grid-row grid-background--greyed">
                {renderRoroModeSection(roroData, movementModeIcon)}
                {renderRoroVoyageSection(roroData)}
              </div>
            </div>
          </section>
          <section className="task-list--item-3">
            <div className="govuk-grid-row">
              <div className="govuk-grid-item">
                <div>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                    Trailer details
                    {roroData.vehicle.trailer?.trailerEnrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.vehicle.trailer.trailerEnrichmentCount) ? 'font--red' : ''}`}>({roroData.vehicle.trailer.trailerEnrichmentCount})</span>}
                  </h3>
                  <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                    {roroData.vehicle.trailer ? (
                      <>
                        {roroData.vehicle.trailer.regNumber && <li className="govuk-!-font-weight-bold">{roroData.vehicle.trailer.regNumber}</li>}
                        {roroData.vehicle.trailerType && <li>{roroData.vehicle.trailerType}</li>}
                        <li>{pluralise.withCount(target.aggregateTrailerTrips || 0, '% trip', '% trips')}</li>
                      </>
                    ) : (<li className="govuk-!-font-weight-bold">No trailer</li>)}
                  </ul>
                </div>
              </div>
              <div className="govuk-grid-item verticel-dotted-line">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Haulier details
                  {roroData.haulier?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.haulier.enrichmentCount) ? 'font--red' : ''}`}>({roroData.haulier.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.haulier?.name ? (
                    <>
                      {roroData.haulier.name && <li className="govuk-!-font-weight-bold">{roroData.haulier.name}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Account details
                  {roroData.account?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.account.enrichmentCount) ? 'font--red' : ''}`}>({roroData.account.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.account ? (
                    <>
                      {roroData.account.name && <li className="govuk-!-font-weight-bold">{roroData.account.name}</li>}
                      {roroData.bookingDateTime && <li>Booked on {dayjs.utc(roroData.bookingDateTime.split(',')[0]).format(constants.SHORT_DATE_FORMAT)}</li>}
                      {roroData.bookingDateTime && <br />}
                      {roroData.bookingDateTime && <li>{targetDatetimeDifference(roroData.bookingDateTime)}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>
              <div className="govuk-grid-item verticel-dotted-line">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Goods description
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.load.manifestedLoad ? (
                    <>
                      {roroData.load.manifestedLoad && <li className="govuk-!-font-weight-bold">{roroData.load.manifestedLoad}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>
              <div className="govuk-grid-item verticel-dotted-line" />
            </div>
          </section>
        </>
      )}
      {movementMode === constants.RORO_ACCOMPANIED_FREIGHT.toUpperCase() && (
        <>
          <section className="task-list--item-2">
            <div>
              <div className="govuk-grid-row grid-background--greyed">
                {renderRoroModeSection(roroData, movementModeIcon)}
                {renderRoroVoyageSection(roroData)}
              </div>
            </div>
          </section>
          <section className="task-list--item-3">
            <div className="govuk-grid-row">
              <div className="govuk-grid-item">
                <div>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                    Driver details
                    {roroData.driver?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.driver.enrichmentCount) ? 'font--red' : ''}`}>({roroData.driver.enrichmentCount})</span>}
                  </h3>
                  <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                    {roroData.driver ? (
                      <>
                        {roroData.driver.firstName && <li className="govuk-!-font-weight-bold">{roroData.driver.firstName}</li>}
                        {roroData.driver.middleName && <li className="govuk-!-font-weight-bold">{roroData.driver.middleName}</li>}
                        {roroData.driver.lastName && <li className="govuk-!-font-weight-bold">{roroData.driver.lastName}</li>}
                        {roroData.driver.dob && <li>DOB: {roroData.driver.dob}</li>}
                        <li>{pluralise.withCount(target.aggregateDriverTrips || '?', '% trip', '% trips')}</li>
                      </>
                    ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                  </ul>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                    Passenger details
                  </h3>
                  <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                    {roroData.passengers && roroData.passengers.length > 0 ? (
                      <>
                        <li className="govuk-!-font-weight-bold">{pluralise.withCount(passengers.length - 1, '% passenger', '% passengers')}</li>
                      </>
                    ) : (<li className="govuk-!-font-weight-bold">None</li>)}
                  </ul>
                </div>
              </div>

              <div className="govuk-grid-item verticel-dotted-line">
                <div>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                    Vehicle details
                    {roroData.vehicle?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.vehicle.enrichmentCount) ? 'font--red' : ''}`}>({roroData.vehicle.enrichmentCount})</span>}
                  </h3>
                  <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                    {roroData.vehicle ? (
                      <>
                        {roroData.vehicle.registrationNumber && <li className="govuk-!-font-weight-bold">{roroData.vehicle.registrationNumber}</li>}
                        {roroData.vehicle.colour && <li>{roroData.vehicle.colour}</li>}
                        {roroData.vehicle.make && <li>{roroData.vehicle.make}</li>}
                        {roroData.vehicle.model && <li>{roroData.vehicle.model}</li>}
                        <li>{pluralise.withCount(target.aggregateVehicleTrips || 0, '% trip', '% trips')}</li>
                      </>
                    ) : (<li className="govuk-!-font-weight-bold">No vehicle</li>)}
                  </ul>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                    Trailer details
                    {roroData.vehicle.trailer?.trailerEnrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.vehicle.trailer.trailerEnrichmentCount) ? 'font--red' : ''}`}>({roroData.vehicle.trailer.trailerEnrichmentCount})</span>}
                  </h3>
                  <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                    {roroData.vehicle.trailer ? (
                      <>
                        {roroData.vehicle.trailer.regNumber && <li className="govuk-!-font-weight-bold">{roroData.vehicle.trailer.regNumber}</li>}
                        {roroData.vehicle.trailerType && <li>{roroData.vehicle.trailerType}</li>}
                        <li>{pluralise.withCount(target.aggregateTrailerTrips || 0, '% trip', '% trips')}</li>
                      </>
                    ) : (<li className="govuk-!-font-weight-bold">No trailer</li>)}
                  </ul>
                </div>
              </div>

              <div className="govuk-grid-item verticel-dotted-line">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Haulier details
                  {roroData.haulier?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.haulier.enrichmentCount) ? 'font--red' : ''}`}>({roroData.haulier?.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.haulier?.name ? (
                    <>
                      {roroData.haulier.name && <li className="govuk-!-font-weight-bold">{roroData.haulier.name}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Account details
                  {roroData.account?.enrichmentCount && <span className={`govuk-!-margin-left-3 ${hasPreviousSeizures(roroData.account.enrichmentCount) ? 'font--red' : ''}`}>({roroData.account.enrichmentCount})</span>}
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.account ? (
                    <>
                      {roroData.account.name && <li className="govuk-!-font-weight-bold">{roroData.account.name}</li>}
                      {roroData.bookingDateTime && <li>Booked on {dayjs.utc(roroData.bookingDateTime.split(',')[0]).format(constants.SHORT_DATE_FORMAT)}</li>}
                      {roroData.bookingDateTime && <br />}
                      {roroData.bookingDateTime && <li>{targetDatetimeDifference(roroData.bookingDateTime)}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>

              <div className="govuk-grid-item verticel-dotted-line">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1 govuk-!-font-size-16 govuk-!-font-weight-regular">
                  Goods description
                </h3>
                <ul className="govuk-body-s govuk-list govuk-!-margin-bottom-2">
                  {roroData.load.manifestedLoad ? (
                    <>
                      {roroData.load.manifestedLoad && <li className="govuk-!-font-weight-bold">{roroData.load.manifestedLoad}</li>}
                    </>
                  ) : (<li className="govuk-!-font-weight-bold">Unknown</li>)}
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
      {movementMode === constants.RORO_TOURIST.toUpperCase() && (
        renderRoRoTouristCard(roroData, movementMode, movementModeIcon)
      )}
    </>
  );
};

export default TaskListMode;
