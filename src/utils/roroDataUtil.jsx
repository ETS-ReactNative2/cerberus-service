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

const hasTaskVersionPassengers = (passengers) => {
  let hasValidPassengers = false;
  for (const passengerChildSets of passengers.childSets) {
    for (const passenger of passengerChildSets.contents) {
      if (passenger.content !== null) {
        hasValidPassengers = true;
        break;
      }
    }
  }
  return hasValidPassengers;
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
  let eta = taskSummaryData.roro.details?.eta;
  if (hasCheckinDate(bookingField.contents.find(({ propName }) => propName === 'checkIn').content)) {
    if (hasEta(eta)) {
      eta = eta.substring(0, eta.length - 1);
      bookingField.contents.find(({ propName }) => propName === 'checkIn').type = 'BOOKING_DATETIME';
      bookingField.contents.find(({ propName }) => propName === 'checkIn').content += `,${eta}`;
    }
  }
  return bookingField;
};

export { modifyRoRoPassengersTaskList,
  modifyRoRoPassengersTaskDetails,
  hasTaskVersionPassengers,
  hasVehicle,
  hasVehicleMake,
  hasVehicleModel,
  hasTrailer,
  hasDriver,
  hasEta,
  hasCheckinDate,
  extractTaskVersionsBookingField };
