import { RORO_ACCOMPANIED_ICON, RORO_NO_ICON, RORO_TOURIST, RORO_TOURIST_CAR_ICON, GROUP_ICON,
  INDIVIDUAL_ICON, RORO_UNACCOMPANIED_ICON, RORO_VAN_ICON } from '../constants';

import { isSinglePassenger } from './roroDataUtil';

const isVehiclePresent = (vehicle) => {
  return vehicle?.registrationNumber && vehicle?.registrationNumber !== ''
    && vehicle?.registrationNumber !== null && vehicle?.registrationNumber !== undefined;
};

const hasTrailer = (vehicle) => {
  return vehicle?.trailer?.regNumber && vehicle?.trailer?.regNumber !== ''
    && vehicle?.trailer?.regNumber !== null && vehicle?.trailer?.regNumber !== undefined;
};

const getTouristIcon = (vehicle, passengers) => {
  if (isVehiclePresent(vehicle)) {
    return RORO_TOURIST_CAR_ICON;
  }

  if (!isVehiclePresent(vehicle) && isSinglePassenger(passengers)) {
    return INDIVIDUAL_ICON;
  }

  return GROUP_ICON;
};

const getMovementModeIcon = (movementMode, vehicle, passengers) => {
  if (movementMode === RORO_TOURIST.toUpperCase()) {
    return getTouristIcon(vehicle, passengers);
  }

  if (!isVehiclePresent(vehicle) && hasTrailer(vehicle)) {
    return RORO_UNACCOMPANIED_ICON;
  }

  if (isVehiclePresent(vehicle) && !hasTrailer(vehicle)) {
    return RORO_VAN_ICON;
  }

  if (isVehiclePresent(vehicle) && hasTrailer(vehicle)) {
    return RORO_ACCOMPANIED_ICON;
  }

  return RORO_NO_ICON;
};

export default getMovementModeIcon;
