/// <reference types="Cypress"/>
/// <reference path="../support/index.d.ts" />

describe('Filter tasks by Selectors on task management Page', () => {
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
    cy.intercept('GET', '/camunda/variable-instance?variableName=taskSummaryBasedOnTIS&processInstanceIdIn=**').as('tasks');
    cy.navigation('Tasks');
  });

  it('Should view filter tasks by selectors', () => {
    const filterOptions = [
      'Has no selector',
      'Has selector',
      'Both',
    ];

    cy.get('a[href="#new"]').invoke('text').as('total-tasks').then((totalTargets) => {
      cy.log('Total number of Targets', parseInt(totalTargets.match(/\d+/)[0], 10));
    });

    cy.get('.cop-filters-container').within(() => {
      cy.get('h2.govuk-heading-s').should('have.text', 'Filters');
      cy.get('.cop-filters-header .govuk-link').should('have.text', 'Clear all filters');
      cy.get('.govuk-radios__item [name="Selectors"]').next().each((element) => {
        cy.wrap(element).invoke('text').then((value) => {
          expect(filterOptions).to.include(value);
        });
      });
    });
  });

  it('Should apply filter tasks by selectors on newly created tasks', () => {
    const filterOptions = [
      'has-no-selector',
      'has-selector',
      'both',
    ];

    let actualTotalTargets = 0;

    // COP-9191 Apply each selectors filter, compare the expected number of targets
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'new').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        if (selector !== 'both') {
          actualTotalTargets += actualTargets;
        }
        cy.getNumberOfTasksBySelectors(selector, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click();

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#new"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      expect(totalTargets).be.equal(actualTotalTargets);
    });
  });

  it('Should apply filter tasks by selectors on In Progress tasks', () => {
    const filterOptions = [
      'has-no-selector',
      'has-selector',
      'both',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#inProgress"]').click();

    // COP-9191 Apply each selectors filter, compare the expected number of targets
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'inProgress').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        if (selector !== 'both') {
          actualTotalTargets += actualTargets;
        }
        cy.getNumberOfTasksBySelectors(selector, 'In Progress').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click();

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#inProgress"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      expect(totalTargets).be.equal(actualTotalTargets);
    });
  });

  it('Should apply filter tasks by selectors on Issued tasks', () => {
    const filterOptions = [
      'has-no-selector',
      'has-selector',
      'both',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#issued"]').click();

    // COP-9191 Apply each selectors filter, compare the expected number of targets
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'issued').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        if (selector !== 'both') {
          actualTotalTargets += actualTargets;
        }
        cy.getNumberOfTasksBySelectors(selector, 'Issued').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click();

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#issued"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      expect(totalTargets).be.equal(actualTotalTargets);
    });
  });

  it('Should apply filter tasks by selectors on Completed tasks', () => {
    const filterOptions = [
      'has-no-selector',
      'has-selector',
      'both',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#complete"]').click();

    // COP-9191 Apply each pre-arrival filter, compare the expected number of targets
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'complete').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        if (selector !== 'both') {
          actualTotalTargets += actualTargets;
        }
        cy.getNumberOfTasksBySelectors(selector, 'Completed').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click();

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#complete"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      expect(totalTargets).be.equal(actualTotalTargets);
    });
  });

  it('Should retain applied filter after page reload & navigating between pages', () => {
    const filterOptions = [
      'has-no-selector',
      'has-selector',
      'both',
    ];

    // COP-9191 switch between the tabs, filter should be retained
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'new').then((actualTargets) => {
        cy.getNumberOfTasksBySelectors(selector, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
        cy.get('a[href="#complete"]').click();
        cy.get('a[href="#new"]').click();
        cy.getNumberOfTasksBySelectors(selector, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // COP-9191 reload the page after filter applied on the page, filter should be retained
    filterOptions.forEach((selector) => {
      cy.applyFilter(selector, 'new').then((actualTargets) => {
        cy.getNumberOfTasksBySelectors(selector, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
        cy.reload();
        cy.wait(2000);
        cy.getNumberOfTasksBySelectors(selector, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
