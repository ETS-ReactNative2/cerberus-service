describe('Airpax task list page', () => {
  before(() => {
    cy.login(Cypress.env('userName'));
  });
  it('Should verify task container list for airpax/tasks', () => {
    cy.visit('/airpax/tasks');
    const taskNavigationItems = [
      'New',
      'In progress',
      'Issued',
      'Complete'];
    cy.get('.govuk-heading-xl').invoke('text').then((Heading) => {
      expect(Heading).to.equal('Task management');
    });
    cy.get('.govuk-tabs__list li a').each((navigationItem, index) => {
      cy.wrap(navigationItem).click()
        .should('contain.text', taskNavigationItems[index]).and('be.visible');
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
