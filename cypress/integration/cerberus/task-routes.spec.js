describe.skip('Targeter should be able to navigate to the different task routes', () => {
// COP-10496
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });
  it('Targeter should be able to navigate to /tasks and view task list', () => {
    cy.visit('/tasks');
    cy.get('.govuk-heading-xl').invoke('text').then((Heading) => {
      expect(Heading).to.equal('Task management');
      expect(cy.contains('New')).to.exist;
      expect(cy.contains('In progress')).to.exist;
      expect(cy.contains('Issued')).to.exist;
      expect(cy.contains('Complete')).to.exist;
    });
    cy.get('.govuk-tabs__panel').should('be.visible');
  });
  it('Targeter should be able to navigate to /airpax/tasks and view task list', () => {
    cy.visit('/airpax/tasks');
    cy.get('.govuk-heading-xl').invoke('text').then((Heading) => {
      expect(Heading).to.equal('Task management');
      expect(cy.contains('New')).to.exist;
      expect(cy.contains('In progress')).to.exist;
      expect(cy.contains('Issued')).to.exist;
      expect(cy.contains('Complete')).to.exist;
    });
    cy.get('.govuk-tabs__panel').should('be.visible');
  });
  it('Targeter should be able to navigate to /roro/tasks and view task list', () => {
    cy.visit('/roro/tasks');
    cy.get('.govuk-heading-xl').invoke('text').then((Heading) => {
      expect(Heading).to.equal('Task management');
      expect(cy.contains('New')).to.exist;
      expect(cy.contains('In progress')).to.exist;
      expect(cy.contains('Issued')).to.exist;
      expect(cy.contains('Complete')).to.exist;
    });
    cy.get('.govuk-tabs__panel').should('be.visible');
  });
  it('Targeter should be able to navigate to /tasks/taskId and view task list details', () => {
    cy.visit('/tasks');
    cy.intercept('POST', '/camunda/v1/targeting-tasks/pages').as('taskLists');
    cy.get('.govuk-tabs__panel').should('be.visible');
    cy.wait('@taskLists').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.get('.govuk-task-list-card:first-of-type').find('.title-container').invoke('text').as('taskId');
    cy.get('.govuk-task-list-card:first-of-type').find('.govuk-link').click();
    cy.wait(3000);
    cy.get('@taskId').then((taskId) => {
      cy.url().should('include', taskId);
      cy.get('.govuk-heading-xl').should('have.text', 'Overview');
      cy.get('.govuk-caption-xl').should('have.text', taskId);
      cy.get('.govuk-accordion').should('be.visible');
    });
  });
  it('Targeter should be able to navigate to roro/tasks/taskId and view task list details', () => {
    cy.visit('roro/tasks');
    cy.intercept('POST', '/camunda/v1/targeting-tasks/pages').as('taskLists');
    cy.get('.govuk-tabs__panel').should('be.visible');
    cy.wait('@taskLists').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.get('.govuk-task-list-card:first-of-type').find('.title-container').invoke('text').as('taskId');
    cy.get('.govuk-task-list-card:first-of-type').find('.govuk-link').click();
    cy.wait(3000);
    cy.get('@taskId').then((taskId) => {
      cy.url().should('include', taskId);
      cy.get('.govuk-heading-xl').should('have.text', 'Overview');
      cy.get('.govuk-caption-xl').should('have.text', taskId);
      cy.get('.govuk-accordion').should('be.visible');
    });
  });
});
