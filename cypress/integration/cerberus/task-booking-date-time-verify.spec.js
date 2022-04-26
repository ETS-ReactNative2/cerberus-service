describe('Targeter to see how long before a task is due to arrive So that Targeter can prioritise a task accordingly', () => {
  // COP-9050
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });

  it('Should verify Difference between Departure and booking date is a month before travel', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-RoRo-ACC_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('1 Mar 2021 at 15:50, a month before travel');
  });

  it('Should verify Difference between Departure and booking date is a year before travel', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-RoRo-ACC-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('2 Aug 2020 at 09:15, a year before travel');
  });

  it('Should verify Difference between Departure and booking date is 3 years before travel', () => {
    cy.getBusinessKey('-RORO-Unaccompanied-Freight-RoRo-UNACC-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('4 Oct 2018 at 02:15, 3 years before travel');
  });

  it('Should verify Difference between Departure and booking date is a day before travel', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-RoRo-ACC-NO-PASSENGERS_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('15 Nov 2021 at 09:15, a day before travel');
  });

  it('Should verify Difference between Departure and booking date is 4 days before travel', () => {
    cy.getBusinessKey('-RORO-Tourist-TSV-TIMESTAMP-DIFF_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('12 Nov 2021 at 09:15, 4 days before travel');
  });

  it('Should verify Difference between Departure and booking date is 13 hours before travel', () => {
    cy.getBusinessKey('-RORO-Tourist-TSV-TIMESTAMP-SAME_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('15 Nov 2021 at 09:10, 13 hours before travel');
  });

  it('Should verify Difference between Departure and booking date is an hour before travel', () => {
    cy.getBusinessKey('-RORO-Tourist-TSV-TIMESTAMP-SCHEDULED_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('17 Nov 2021 at 09:10, an hour before travel');
  });

  it('Should verify Difference between Departure and booking date is 33 minutes before travel', () => {
    cy.getBusinessKey('-RORO-Tourist-TSV-NO-ACTUAL-SCHEDULED-TIMESTAMP_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });

    cy.verifyBookingDateTime('17 Nov 2021 at 09:10, 33 minutes before travel');
  });

  it('Should verify Difference between Departure and booking date is 26 days before travel', () => {
    cy.getBusinessKey('-RORO-Tourist-TSV-NO-DEPARTURE-LOCATION_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.contains(`${businessKeys[0]}`);
    });
    // if the difference is 26 days to 45 days then it should be displayed as month before travel
    cy.verifyBookingDateTime('23 Oct 2021 at 01:00, a month before travel');
  });

  it('Should verify Difference between Passenger Passport validity & Arrival Date', () => {
    let dateNowFormatted = Cypress.dayjs().format('DD-MM-YYYY');
    let arrivalDate = Cypress.dayjs('2021-02-15', 'YYYY-MM-DD').valueOf();
    let departureDate = Cypress.dayjs('2021-01-01', 'YYYY-MM-DD').valueOf();
    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalDate;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualDepartureTimestamp = departureDate;
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      console.log(task.variables.rbtPayload.value);
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Occupant-passport-validity`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.get('[id$=-content-1]').within(() => {
      cy.get('.govuk-task-details-col-3').within(() => {
        cy.getOccupantDetails().as('actualOccupantDetails');
      });
    });

    cy.get('@actualOccupantDetails').then((actualOccupantDetails) => {
      let driverPassportValidityRange = actualOccupantDetails[1]['Validity3 years after travel'].slice(19);
      let passenger1PassportValidityRange = actualOccupantDetails[3]['ValidityA year after travel'].slice(19);
      let passenger2PassportValidityRange = actualOccupantDetails[5]['Validity14 days before travel'].slice(19);
      expect(driverPassportValidityRange).to.be.equal('3 years after travel');
      expect(passenger1PassportValidityRange).to.be.equal('A year after travel');
      expect(passenger2PassportValidityRange).to.be.equal('14 days before travel');
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
