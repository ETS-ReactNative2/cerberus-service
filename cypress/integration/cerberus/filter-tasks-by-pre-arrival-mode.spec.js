/// <reference types="Cypress"/>
/// <reference path="../support/index.d.ts" />

describe('Filter tasks by pre-arrival mode on task management Page', () => {
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
    cy.intercept('GET', '/camunda/variable-instance?variableName=taskSummaryBasedOnTIS&processInstanceIdIn=**').as('tasks');
    cy.navigation('Tasks');
  });

  it('Should view filter tasks by pre-arrival modes', () => {
    const filterOptions = [
      'RoRo unaccompanied freight',
      'RoRo accompanied freight',
      'RoRo tourist',
    ];

    cy.get('a[href="#new"]').invoke('text').as('total-tasks').then((totalTargets) => {
      cy.log('Total number of Targets', parseInt(totalTargets.match(/\d+/)[0], 10));
    });

    cy.get('.cop-filters-container').within(() => {
      cy.get('h2.govuk-heading-s').should('have.text', 'Filters');
      cy.get('.cop-filters-header .govuk-link').should('have.text', 'Clear all filters');
      cy.get('.govuk-radios__item [name="Mode"]').next().each((element) => {
        cy.wrap(element).invoke('text').then((value) => {
          expect(filterOptions).to.include(value);
        });
      });
    });
  });

  it('Should apply filter tasks by pre-arrival modes on newly created tasks', () => {
    const filterOptions = [
      'roro-unaccompanied-freight',
      'roro-accompanied-freight',
      'roro-tourist',
    ];

    let actualTotalTargets = 0;

    // COP-5715 Apply each pre-arrival filter, compare the expected number of targets
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'new').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        actualTotalTargets += actualTargets;
        cy.getNumberOfTasksByMode(mode, 'New').then((expectedTargets) => {
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

  it('Should apply filter tasks by pre-arrival modes on In Progress tasks', () => {
    const filterOptions = [
      'roro-unaccompanied-freight',
      'roro-accompanied-freight',
      'roro-tourist',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#inProgress"]').click();

    // COP-5715 Apply each pre-arrival filter, compare the expected number of targets
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'inProgress').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        actualTotalTargets += actualTargets;
        cy.getNumberOfTasksByMode(mode, 'In Progress').then((expectedTargets) => {
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

  it('Should apply filter tasks by pre-arrival modes on Issued tasks', () => {
    const filterOptions = [
      'roro-unaccompanied-freight',
      'roro-accompanied-freight',
      'roro-tourist',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#issued"]').click();

    // COP-5715 Apply each pre-arrival filter, compare the expected number of targets
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'issued').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        actualTotalTargets += actualTargets;
        cy.getNumberOfTasksByMode(mode, 'Issued').then((expectedTargets) => {
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

  it('Should apply filter tasks by pre-arrival modes on Completed tasks', () => {
    const filterOptions = [
      'roro-unaccompanied-freight',
      'roro-accompanied-freight',
      'roro-tourist',
    ];

    let actualTotalTargets = 0;

    cy.get('a[href="#complete"]').click();

    // COP-5715 Apply each pre-arrival filter, compare the expected number of targets
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'complete').then((actualTargets) => {
        cy.log('actual targets', actualTargets);
        actualTotalTargets += actualTargets;
        cy.getNumberOfTasksByMode(mode, 'Completed').then((expectedTargets) => {
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
      'roro-unaccompanied-freight',
      'roro-accompanied-freight',
      'roro-tourist',
    ];

    // COP-5715 switch between the tabs, filter should be retained
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'new').then((actualTargets) => {
        cy.getNumberOfTasksByMode(mode, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
        cy.get('a[href="#complete"]').click();
        cy.get('a[href="#new"]').click();
        cy.getNumberOfTasksByMode(mode, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });

    // COP-5715 reload the page after filter applied on the page, filter should be retained
    filterOptions.forEach((mode) => {
      cy.applyFilter(mode, 'new').then((actualTargets) => {
        cy.getNumberOfTasksByMode(mode, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
        cy.reload();
        cy.wait(2000);
        cy.getNumberOfTasksByMode(mode, 'New').then((expectedTargets) => {
          expect(expectedTargets).be.equal(actualTargets);
        });
      });
    });
  });

  it('Should apply filter tasks by roro-unaccompanied mode & has selectors on New tasks', () => {
    const filterOptions = [
      'roro-unaccompanied-freight',
      'has-selector',
    ];

    cy.getNumberOfTasksWithoutFilter('New').as('expectedTargets');

    // COP-9191 Apply each pre-arrival filter, compare the expected number of targets

    cy.applyFilter(filterOptions, 'new').then((actualTargets) => {
      cy.log('actual targets', actualTargets);
      cy.getNumberOfTasksByModeAndSelectors(filterOptions[0], filterOptions[1], 'New').then((expectedTargets) => {
        expect(expectedTargets).be.equal(actualTargets);
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click({ force: true });

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#new"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      cy.get('@expectedTargets').then((expectedTargets) => {
        expect(expectedTargets).be.equal(totalTargets);
      });
    });
  });

  it('Should apply filter tasks by roro-accompanied mode & has no selectors on In Progress tasks', () => {
    const filterOptions = [
      'roro-accompanied-freight',
      'has-no-selector',
    ];

    cy.get('a[href="#inProgress"]').click();

    cy.getNumberOfTasksWithoutFilter('In Progress').as('expectedTargets');

    // COP-9191 Apply each pre-arrival filter, compare the expected number of targets

    cy.applyFilter(filterOptions, 'inProgress').then((actualTargets) => {
      cy.log('actual targets', actualTargets);
      cy.getNumberOfTasksByModeAndSelectors(filterOptions[0], filterOptions[1], 'In Progress').then((expectedTargets) => {
        expect(expectedTargets).be.equal(actualTargets);
      });
    });

    // clear the filter
    cy.contains('Clear all filters').click({ force: true });

    cy.wait(1000);

    // compare total number of expected and actual targets
    cy.get('a[href="#inProgress"]').invoke('text').then((totalTargets) => {
      totalTargets = parseInt(totalTargets.match(/\d+/)[0], 10);
      cy.get('@expectedTargets').then((expectedTargets) => {
        expect(expectedTargets).be.equal(totalTargets);
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
