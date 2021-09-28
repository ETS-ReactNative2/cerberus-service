describe('Create task with different payload from Cerberus', () => {
  let date;
  let dateNowFormatted;
  before(() => {
    cy.login(Cypress.env('userName'));
    date = new Date();
    dateNowFormatted = Cypress.moment(date).format('DD-MM-YYYY');
  });

  it('Should create a task with a payload contains hazardous cargo without description and passport number as null', () => {
    cy.fixture('tasks-hazardous-cargo.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-HAZARDOUS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains organisation value as null', () => {
    cy.fixture('tasks-org-null.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-ORG-NULL`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains vehicle value as null', () => {
    cy.fixture('task-vehicle-null.json').then((task) => {
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-VEHICLE-NULL`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(null, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist and check AbuseType set to correct value', () => {
    cy.fixture('RoRo-Tourist.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 2);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TOURIST-WITH-PASSENGERS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
      cy.wait(2000);
      cy.expandTaskDetails().then(() => {
        cy.contains('h2', 'Rules matched').next().contains('.govuk-summary-list__key', 'Abuse type')
          .next()
          .should('have.text', 'Obscene Material');
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist from RBT & SBT', () => {
    cy.fixture('RoRo-Tourist-RBT-SBT.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 5);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TOURIST-RBT-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist from SBT', () => {
    cy.fixture('RoRo-Tourist-SBT.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      console.log(task.variables.rbtPayload.value);
      date.setDate(date.getDate() + 4);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.organisations[0].attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      cy.log('Booking Date  Time', bookingDateTime);
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TOURIST-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight', () => {
    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-ACC`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight from RBT & SBT', () => {
    cy.fixture('RoRo-Accompanied-RBT-SBT.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-ACC-RBT-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight from SBT', () => {
    cy.fixture('RoRo-Accompanied-SBT.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 10);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-ACC-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Unaccompanied Freight from SBT', () => {
    cy.fixture('RoRo-Unaccompanied-Freight.json').then((task) => {
      task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-UNACC-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Unaccompanied Freight from RBT & SBT', () => {
    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 1);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      console.log(task.variables.rbtPayload.value);
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-UNACC-RBT-SBT`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create a task with a payload contains RoRo accompanied with no passengers', () => {
    cy.fixture('RoRo-Freight-Accompanied-no-passengers.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      date.setDate(date.getDate() + 1);
      console.log(task.variables.rbtPayload.value);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      console.log(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-ACC-NO-PASSENGERS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create TSV task with payload contains actual and scheduled timestamps different', () => {
    let expectedTaskSummary = [];
    cy.fixture('tsv-timestamps-different.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      let departureDateTime = Cypress.moment(voyage.actualDepartureTimestamp).format('D MMM YYYY [at] HH:mm');
      let arrivalDateTime = Cypress.moment(voyage.actualArrivalTimestamp).format('D MMM YYYY [at] HH:mm');
      expectedTaskSummary.push(`${voyage.carrier} voyage of ${voyage.craftId}`);
      expectedTaskSummary.push(`${voyage.departureLocation}, ${departureDateTime}`);
      expectedTaskSummary.push(`${voyage.arrivalLocation}, ${arrivalDateTime}`);
      expectedTaskSummary.push('unknown');
      expectedTaskSummary.push('unknown');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TSV-TIMESTAMP-DIFF`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummaryDetails(expectedTaskSummary);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create TSV task with payload contains actual and scheduled timestamps same', () => {
    let expectedTaskSummary = [];
    cy.fixture('tsv-timestamps-same.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      console.log(task.variables.rbtPayload.value);
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      let departureDateTime = Cypress.moment(voyage.actualDepartureTimestamp).format('D MMM YYYY [at] HH:mm');
      let arrivalDateTime = Cypress.moment(voyage.actualArrivalTimestamp).format('D MMM YYYY [at] HH:mm');
      expectedTaskSummary.push(`${voyage.carrier} voyage of ${voyage.craftId}`);
      expectedTaskSummary.push(`${voyage.departureLocation}, ${departureDateTime}`);
      expectedTaskSummary.push(`${voyage.arrivalLocation}, ${arrivalDateTime}`);
      expectedTaskSummary.push('unknown');
      expectedTaskSummary.push('unknown');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      console.log(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TSV-TIMESTAMP-SAME`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummaryDetails(expectedTaskSummary);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create TSV task with payload contains only scheduled timestamp', () => {
    let expectedTaskSummary = [];
    cy.fixture('tsv-scheduled-timestamp.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      let departureDateTime = Cypress.moment(voyage.actualDepartureTimestamp).format('D MMM YYYY [at] HH:mm');
      let arrivalDateTime = Cypress.moment(voyage.scheduledArrivalTimestamp).format('D MMM YYYY [at] HH:mm');
      expectedTaskSummary.push(`${voyage.carrier} voyage of ${voyage.craftId}`);
      expectedTaskSummary.push(`${voyage.departureLocation}, ${departureDateTime}`);
      expectedTaskSummary.push(`${voyage.arrivalLocation}, ${arrivalDateTime}`);
      expectedTaskSummary.push('unknown');
      expectedTaskSummary.push('unknown');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      console.log(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TSV-TIMESTAMP-SCHEDULED`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummaryDetails(expectedTaskSummary);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create TSV task with payload with no actual and scheduled timestamps', () => {
    let expectedTaskSummary = [];
    cy.fixture('tsv-only-estimated-timestamp.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      let departureDateTime = Cypress.moment(voyage.actualDepartureTimestamp).format('D MMM YYYY [at] HH:mm');
      let arrivalDateTime = Cypress.moment(task.variables.rbtPayload.value.data.movement.voyage.features.feats['STANDARDISED:estimatedArrivalTimestamp'].value).format('D MMM YYYY [at] HH:mm');
      expectedTaskSummary.push(`${voyage.carrier} voyage of ${voyage.craftId}`);
      expectedTaskSummary.push(`${voyage.departureLocation}, ${departureDateTime}`);
      expectedTaskSummary.push(`${voyage.arrivalLocation}, ${arrivalDateTime}`);
      expectedTaskSummary.push('unknown');
      expectedTaskSummary.push('unknown');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TSV-NO-ACTUAL-SCHEDULED-TIMESTAMP`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummaryDetails(expectedTaskSummary);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  it('Should create TSV task with payload with no departure location, actual, scheduled and estimated timestamps', () => {
    let expectedTaskSummary = [];
    cy.fixture('tsv-no-departure-location.json').then((task) => {
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      date.setDate(date.getDate() + 1);
      console.log(task.variables.rbtPayload.value);
      let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
      bookingDateTime = Cypress.moment(bookingDateTime).format('D MMM YYYY [at] HH:mm');
      let departureDateTime = Cypress.moment(voyage.actualDepartureTimestamp).format('D MMM YYYY [at] HH:mm');
      expectedTaskSummary.push(`${voyage.carrier} voyage of ${voyage.craftId}`);
      expectedTaskSummary.push(`${voyage.departureLocation}, ${departureDateTime}`);
      expectedTaskSummary.push(`${voyage.arrivalLocation}, unknown`);
      expectedTaskSummary.push('unknown');
      expectedTaskSummary.push('unknown');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      console.log(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TSV-NO-DEPARTURE-LOCATION`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummaryDetails(expectedTaskSummary);
        cy.checkTaskSummary(registrationNumber, bookingDateTime);
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
