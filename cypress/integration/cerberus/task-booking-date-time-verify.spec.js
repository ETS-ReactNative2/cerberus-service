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

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
