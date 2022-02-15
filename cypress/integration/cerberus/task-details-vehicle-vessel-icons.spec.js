describe('Vehicle and Vessel Icons in Task List and Task Summary', () => {
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });

  it('Display Vehicle and Vessel Icons for mulitple passengers task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_TOURIST"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('MULTIPLE-PASSENGERS').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'group', 'ship');
    });
  });

  it('Display Vehicle and Vessel Icons for Tourist task with No vehicle task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_TOURIST"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('TOURIST-NO-VEHICLE').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'group', 'ship');
    });
  });

  it('Display Vehicle and Vessel Icons for Tourist task with Passengers task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_TOURIST"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('TOURIST-WITH-PASSENGERS').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'car', 'ship');
    });
  });

  it('Display Vehicle and Vessel Icons for Unaccompanied task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_UNACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('RoRo-UNACC-RBT-SBT').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'hgv', 'ship');
    });
  });

  it('Display Vehicle and Vessel Icons for Accompanied-Freight task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('-HAZARDOUS_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'van', 'ship');
    });
  });

  it('Display Vehicle and Vessel Icons for Unaccompanied with trailer task', () => {
    cy.visit('/tasks');
    cy.wait(3000);
    cy.get('.govuk-checkboxes [value="RORO_UNACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);
    cy.getBusinessKey('RoRo-UNACC-SBT').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyIcons(businessKeys[0], 'trailer', 'ship');
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
