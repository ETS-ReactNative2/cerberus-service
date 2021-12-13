/// <reference types="Cypress"/>
/// <reference path="../support/index.d.ts" />

describe('Render tasks from Camunda and manage them on task management Page', () => {
  const MAX_TASK_PER_PAGE = 100;
  const nextPage = 'a[data-test="next"]';

  beforeEach(() => {
    cy.login(Cypress.env('userName'));
    cy.intercept('GET', '/camunda/variable-instance?variableName=taskSummaryBasedOnTIS&processInstanceIdIn=**').as('tasks');
    cy.navigation('Tasks');
  });

  it('Should render all the tabs on task management page', () => {
    const taskNavigationItems = [
      'New',
      'In progress',
      'Issued',
      'Complete',
    ];

    cy.get('.govuk-tabs__list li a').each((navigationItem, index) => {
      cy.wrap(navigationItem).click()
        .should('contain.text', taskNavigationItems[index]).and('be.visible');
    });
  });

  it.skip('Should verify Back to task list workflow', () => {
    cy.get('.govuk-tabs__list li a[href="#new"]').then((element) => {
      cy.backToTaskList(element, 'New');
    });

    cy.get('.govuk-tabs__list li a[href="#inProgress"]').then((element) => {
      cy.backToTaskList(element, 'In progress');
    });

    cy.get('.govuk-tabs__list li a[href="#issued"]').then((element) => {
      cy.backToTaskList(element, 'Issued');
    });

    cy.get('.govuk-tabs__list li a[href="#complete"]').then((element) => {
      cy.backToTaskList(element, 'Complete');
    });
  });

  it('Should hide first and prev buttons on first page', () => {
    if (Cypress.$(nextPage).length > 0) {
      cy.get('.pagination--list a').then(($items) => {
        const texts = Array.from($items, (el) => el.innerText);
        expect(texts).not.to.contain(['First', 'Previous']);
      });

      cy.get('.pagination--summary').should('contain.text', `Showing 1 - ${MAX_TASK_PER_PAGE}`);
    }
  });

  it('Should hide last and next buttons on last page', () => {
    if (Cypress.$(nextPage).length > 0) {
      cy.get('.pagination--list a').last().click();

      cy.get('.pagination--list a').then(($items) => {
        const texts = Array.from($items, (el) => el.innerText);
        expect(texts).not.to.contain(['Next', 'Last']);
      });
    }
  });

  it('Should maintain the page links count', () => {
    cy.get('.task-list--item').should('have.length.lessThan', MAX_TASK_PER_PAGE);

    if (Cypress.$(nextPage).length > 0) {
      cy.get('a[data-test="page-number"]').each((item) => {
        cy.wrap(item).click();
        cy.get('.task-list--item').should('have.length.lessThan', MAX_TASK_PER_PAGE);
      });
    }
  });

  it('Should verify refresh task list page', () => {
    if (Cypress.$(nextPage).length > 0) {
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
    }
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
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');

    cy.fixture('tasks.json').then((task) => {
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-CLAIM-TASK-MANAGEMENT`).then((taskResponse) => {
        cy.wait(4000);
        cy.reload();
        let businessKey = encodeURIComponent(taskResponse.businessKey);
        if (Cypress.$(nextPage).length > 0) {
          cy.findTaskInAllThePages(`${businessKey}`, 'Claim', null).then((returnValue) => {
            expect(returnValue).to.equal(true);
            cy.wait('@claim').then(({ response }) => {
              expect(response.statusCode).to.equal(204);
            });
          });
        } else {
          cy.findTaskInSinglePage(`${businessKey}`, 'Claim', null).then((returnValue) => {
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

    cy.get('a[href="#inProgress"]').click();

    cy.reload();

    cy.get('a[href="#inProgress"]').click();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((value) => {
      cy.intercept('POST', '/camunda/task/*/unclaim').as('unclaim');
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(value, 'Unclaim', null).then((returnValue) => {
          expect(returnValue).to.equal(true);
          cy.wait('@unclaim').then(({ response }) => {
            expect(response.statusCode).to.equal(204);
          });
        });
      } else {
        cy.findTaskInSinglePage(value, 'Unclaim', null).then((returnValue) => {
          expect(returnValue).to.equal(true);
          cy.wait('@unclaim').then(({ response }) => {
            expect(response.statusCode).to.equal(204);
          });
        });
      }
    });
  });

  it('Should check rule matches details on task management page', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');

    cy.fixture('/tasks-with-rules-selectors/task-rules-only.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Rule-matches`).then((taskResponse) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((text) => {
      cy.log('task to be searched', text);
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'Paid by Cash, Tier 1, National Security at the Border and 1 other rule').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'Paid by Cash, Tier 1, National Security at the Border and 1 other rule').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should check selector matches details on task management page', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');

    cy.fixture('/tasks-with-rules-selectors/task-selectors-only.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Selector-matches`).then((taskResponse) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((text) => {
      cy.log('task to be searched', text);
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 2 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 2 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should check selector & rule matches details on task management page', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');

    cy.fixture('/tasks-with-rules-selectors/task-selectors-rules.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Selector-rules-matches`).then((taskResponse) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((text) => {
      cy.log('task to be searched', text);
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 4 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 4 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should hide rule matches details on task management page', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');

    cy.fixture('/tasks-with-rules-selectors/task-selectors-rules-hide.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Selector-rules-matches-hide`).then((taskResponse) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((text) => {
      cy.log('task to be searched', text);
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'Paid by Cash, Tier 1, National Security at the Border and 1 other rule').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'Paid by Cash, Tier 1, National Security at the Border and 1 other rule').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should check selector & rule matches details for more than one version on task management page', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);
    let dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Tourist-selectors-rules-versions_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    cy.fixture('/tasks-with-rules-selectors/task-selectors-rules-v2.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('/tasks-with-rules-selectors/task-rules-only.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null).then((response) => {
        cy.wait(15000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        let encodedBusinessKey = encodeURIComponent(`${response.businessKey}`);
        cy.getAllProcessInstanceId(encodedBusinessKey).then((res) => {
          expect(res.body.length).to.not.equal(0);
          expect(res.body.length).to.equal(1);
        });
      });
    });

    cy.wait(3000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.waitForTaskManagementPageToLoad();

    cy.get('@taskName').then((text) => {
      cy.log('task to be searched', text);
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 4 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'SELECTOR: selector auto testing, B, Class B&C Drugs inc. Cannabis and 4 other rules').then((taskFound) => {
          expect(taskFound).to.equal(true);
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
