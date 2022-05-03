import lookup from 'country-code-lookup';

const hasCarrierCounts = (suppliedPassengerCounts) => {
  const expected = ['oapCount', 'adultCount', 'childCount', 'infantCount'];
  let hayStack = [];
  suppliedPassengerCounts.forEach((countObj) => {
    if ((countObj.propName === 'oapCount' && countObj.content !== null)
    || (countObj.propName === 'adultCount' && countObj.content !== null)
    || (countObj.propName === 'childCount' && countObj.content !== null)
    || (countObj.propName === 'infantCount' && countObj.content !== null)) {
      hayStack.push(countObj.propName);
    }
  });
  return expected.every((needle) => hayStack.includes(needle));
};

const getTaskDetailsTotalOccupants = (passengersMetadata) => {
  if (passengersMetadata) {
    const radix = 10;
    return parseInt(passengersMetadata.contents.find(({ propName }) => propName === 'totalOccupants').content, radix);
  }
  return 0;
};

const hasZeroCount = (content) => {
  return content === '0';
};

const isValid = (obj) => {
  return obj !== null && obj !== undefined && obj !== '';
};

const hasVehicle = (vehicleRegistration) => {
  return vehicleRegistration !== null && vehicleRegistration !== undefined && vehicleRegistration !== '';
};

const hasVehicleMake = (vehicleMake) => {
  return vehicleMake !== null && vehicleMake !== undefined && vehicleMake !== '';
};

const hasVehicleModel = (vehicleModel) => {
  return vehicleModel !== null && vehicleModel !== undefined && vehicleModel !== '';
};

const hasTrailer = (trailerRegistration) => {
  return trailerRegistration !== null && trailerRegistration !== undefined && trailerRegistration !== '';
};

const hasDriver = (driverName) => {
  return driverName !== null && driverName !== undefined && driverName !== '';
};

const hasCheckinDate = (checkinDate) => {
  return checkinDate !== null && checkinDate !== undefined && checkinDate !== '';
};

const hasEta = (eta) => {
  return eta !== null && eta !== undefined && eta !== '';
};

const hasDepartureTime = (departureTime) => {
  return departureTime !== null && departureTime !== undefined && departureTime !== '';
};

const getNamedPassenger = (passenger) => {
  if (passenger?.contents) {
    let hasName = false;
    passenger.contents.map(({ propName, content }) => {
      if (propName === 'name') {
        hasName = !!content;
      }
    });
    return hasName && passenger;
  }
};

const filterKnownPassengers = (passengers) => {
  return passengers.filter((passenger) => {
    if (passenger?.name) {
      return passenger;
    }
    return getNamedPassenger(passenger);
  });
};

const isSinglePassenger = (passengers) => {
  const filteredPassengers = passengers.filter((passenger) => {
    if (passenger?.name) {
      return passenger;
    }
    return getNamedPassenger(passenger);
  });
  return filteredPassengers && filteredPassengers?.length === 1;
};

// Checks for presence of at least a valid passenger
const hasTaskVersionPassengers = (passengers) => {
  for (const passengerChildSets of passengers.childSets) {
    const passengerName = passengerChildSets.contents.find(({ propName }) => propName === 'name').content;
    if (passengerName) {
      return true;
    }
  }
  return false;
};

const isTaskDetailsPassenger = (passenger) => {
  let validPassenger = false;
  for (const passengerDataFieldObj of passenger.contents) {
    if (passengerDataFieldObj.content !== null) {
      validPassenger = true;
      break;
    }
  }
  return validPassenger;
};

// Driver if available, will now be included in the passengers list
// therefore making person at index 0 the primary traveller.
const generateTotalPassengers = (driver, passengers) => {
  let totalPassengers = [];
  if (driver && driver?.name && driver?.name !== '' && driver?.name !== null) {
    totalPassengers.push(driver);
  }
  if (passengers && passengers?.length > 0) {
    passengers.map((passenger) => {
      totalPassengers.push(passenger);
    });
  }
  return totalPassengers;
};

// Passengers data within roroData will be overwritten the new passeners count (task list page).
const modifyRoRoPassengersTaskList = (roroData) => {
  roroData.passengers = generateTotalPassengers(roroData.driver, roroData.passengers);
  return roroData;
};

/*
* This method would modify the country code using country-code-lookup npm module
*/
const modifyCountryCodeIfPresent = (bookingField) => {
  const countryCode = bookingField.contents?.find(({ propName }) => propName === 'country')?.content;
  if (!countryCode && !lookup.byIso(countryCode)?.country) {
    return bookingField;
  }
  const countryName = (countryCode && lookup.byIso(countryCode) !== null) ? lookup.byIso(countryCode).country : 'Unknown';
  bookingField.contents.find(({ propName }) => propName === 'country').content = `${countryName} (${countryCode})`;
  return bookingField;
};

/*
* This method would add an additional object for the Driver
* into the passengers list as BE always nominating a driver
*  even in scenarios when there is no vehicles
*/
const modifyRoRoPassengersTaskDetails = (version) => {
  const newPassengersJsonNode = [];
  const driverNodeContents = version.find((fieldset) => fieldset.propName === 'driver').contents;
  const passengersChildsets = version.find((fieldset) => fieldset.propName === 'passengers').childSets;
  const driverData = [];
  driverNodeContents.map((driverContent) => {
    driverData.push(driverContent);
  });

  const driverToPassengerNode = {
    fieldSetName: '',
    hasChildSet: false,
    contents: driverData,
    type: 'null',
    propName: '',
  };

  newPassengersJsonNode.push(driverToPassengerNode);
  passengersChildsets.map((passengerChildset) => {
    if (isTaskDetailsPassenger(passengerChildset)) {
      newPassengersJsonNode.push(passengerChildset);
    }
  });
  version.find((fieldset) => fieldset.propName === 'passengers').childSets = newPassengersJsonNode;
  return version;
};

const extractTaskVersionsBookingField = (version, taskSummaryData) => {
  const bookingField = JSON.parse(JSON.stringify(version.find(({ propName }) => propName === 'booking')));
  const scheduledDepartureTime = taskSummaryData?.roro?.details?.departureTime;
  if (!hasCheckinDate(bookingField.contents.find(({ propName }) => propName === 'checkIn').content)) {
    return bookingField;
  }
  if (!hasDepartureTime(scheduledDepartureTime)) {
    return bookingField;
  }
  if (bookingField.contents.find(({ propName }) => propName === 'checkIn').type.includes('CHANGED')) {
    bookingField.contents.find(({ propName }) => propName === 'checkIn').type = 'BOOKING_DATETIME-CHANGED';
  } else {
    bookingField.contents.find(({ propName }) => propName === 'checkIn').type = 'BOOKING_DATETIME';
  }
  bookingField.contents.find(({ propName }) => propName === 'checkIn').content += `,${scheduledDepartureTime}`;
  return bookingField;
};

export { modifyRoRoPassengersTaskList,
  modifyRoRoPassengersTaskDetails,
  hasTaskVersionPassengers,
  hasZeroCount,
  isValid,
  hasVehicle,
  hasVehicleMake,
  hasVehicleModel,
  hasTrailer,
  hasDriver,
  hasEta,
  hasCheckinDate,
  extractTaskVersionsBookingField,
  getTaskDetailsTotalOccupants,
  hasCarrierCounts,
  modifyCountryCodeIfPresent,
  isSinglePassenger,
  filterKnownPassengers };
