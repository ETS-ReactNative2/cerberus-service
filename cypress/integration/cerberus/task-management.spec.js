/// <reference types="Cypress"/>
/// <reference path="../support/index.d.ts" />

describe('Render tasks from Camunda and manage them on task management Page', () => {
  const MAX_TASK_PER_PAGE = 100;

  beforeEach(() => {
    cy.login(Cypress.env('userName'));
    cy.intercept('GET', '/camunda/variable-instance?variableName=taskSummaryBasedOnTIS&processInstanceIdIn=**').as('tasks');
    cy.navigation('Tasks');
  });

  it('Should render all the tabs on task management page', () => {
    const taskNavigationItems = [
      'New',
      'In progress',
      'Target issued',
      'Complete',
    ];

    cy.get('.govuk-tabs__list li a').each((navigationItem, index) => {
      cy.wrap(navigationItem).click()
        .should('contain.text', taskNavigationItems[index]).and('be.visible');
    });
  });

  it.skip('Should hide first and prev buttons on first page', () => {
    cy.get('.pagination--list a').then(($items) => {
      const texts = Array.from($items, (el) => el.innerText);
      expect(texts).not.to.contain(['First', 'Previous']);
    });

    cy.get('.pagination--summary').should('contain.text', `Showing 1 - ${MAX_TASK_PER_PAGE}`);
  });

  it.skip('Should hide last and next buttons on last page', () => {
    cy.get('.pagination--list a').last().click();

    cy.get('.pagination--list a').then(($items) => {
      const texts = Array.from($items, (el) => el.innerText);
      expect(texts).not.to.contain(['Next', 'Last']);
    });
  });

  it.skip('Should maintain the page links count', () => {
    cy.get('.task-list--item').should('have.length', MAX_TASK_PER_PAGE);

    cy.get('a[data-test="page-number"]').each((item) => {
      cy.wrap(item).click();
      cy.get('.task-list--item').its('length').should('be.lte', MAX_TASK_PER_PAGE);
    });
  });

  it.skip('Should verify refresh task list page', () => {
    cy.clock();

    cy.wait('@tasks').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.get('a[href="/tasks?page=2"]').eq(0).click();

    cy.tick(65000);

    cy.wait('@tasks').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.url().should('contain', 'page=2');
  });

  it('Should verify tasks are sorted in arrival time on task management page', () => {
    let arrivalDate;
    cy.get('.task-list--item .content-line-two').each((item, index) => {
      let dates;
      cy.wrap(item).find('li').last().then((element) => {
        if (element.text() !== 'unknown') {
          dates = element.text().split('at');
          const d = new Date(dates[0]);
          if (index === 0) {
            arrivalDate = d.getTime();
          } else {
            expect(arrivalDate).to.be.lte(d.getTime());
            arrivalDate = d.getTime();
          }
        }
      });
    });
  });

  it('Should Claim and Unclaim a task Successfully from task management page', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    const nextPage = 'a[data-test="next"]';
    let dateNowFormatted = Cypress.moment(new Date()).format('DD-MM-YYYY');

    cy.fixture('tasks.json').then((task) => {
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-CLAIM-TASK-MANAGEMENT`).then((taskResponse) => {
        cy.wait(4000);
        cy.reload();
        let businessKey = encodeURIComponent(taskResponse.businessKey);
        if (Cypress.$(nextPage).length > 0) {
          cy.findTaskInAllThePages(`${businessKey}`, 'Claim').then((returnValue) => {
            expect(returnValue).to.equal(true);
            cy.wait('@claim').then(({ response }) => {
              expect(response.statusCode).to.equal(204);
            });
          });
        } else {
          cy.findTaskInSinglePage(`${businessKey}`, 'Claim').then((returnValue) => {
            expect(returnValue).to.equal(true);
            cy.wait('@claim').then(({ response }) => {
              expect(response.statusCode).to.equal(204);
            });
          });
        }
      });
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.get('a[href="#in-progress"]').click();

    cy.reload();

    cy.get('a[href="#in-progress"]').click();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((value) => {
      cy.intercept('POST', '/camunda/task/*/unclaim').as('unclaim');
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(value, 'Unclaim').then((returnValue) => {
          expect(returnValue).to.equal(true);
          cy.wait('@unclaim').then(({ response }) => {
            expect(response.statusCode).to.equal(204);
          });
        });
      } else {
        cy.findTaskInSinglePage(value, 'Unclaim').then((returnValue) => {
          expect(returnValue).to.equal(true);
          cy.wait('@unclaim').then(({ response }) => {
            expect(response.statusCode).to.equal(204);
          });
        });
      }
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
