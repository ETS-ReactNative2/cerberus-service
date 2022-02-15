describe('Render tasks from Camunda and manage them on task details Page', () => {
  let dateNowFormatted;
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });

  before(() => {
    dateNowFormatted = Cypress.dayjs(new Date()).format('DD-MM-YYYY');
  });

  it('Should navigate to task details page', () => {
    cy.get('h4.task-heading').eq(0).invoke('text').then((text) => {
      cy.get('.govuk-task-list-card a').eq(0).click();
      cy.get('.govuk-caption-xl').invoke('text').then((taskTitle) => {
        expect(text).to.contain(taskTitle);
      });
    });
    cy.wait(2000);
    cy.get('.govuk-accordion__section-button').eq(0).invoke('attr', 'aria-expanded').then((value) => {
      if (value !== true) {
        cy.get('.govuk-accordion__section-button').eq(0).click();
      }
    });
    cy.get('.selectors').within(() => {
      cy.get('.govuk-heading-m').should('contain.text', 'selector matches');
    });
  });

  it('Should add notes for the selected tasks', () => {
    const taskNotes = 'Add notes for testing & check it stored';
    cy.intercept('POST', '/camunda/engine-rest/process-definition/key/noteSubmissionWrapper/submit-form').as('notes');
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-ADD-NOTES`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Task not assigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.wait(2000);

    cy.get('.formio-component-note textarea')
      .should('be.visible')
      .type(taskNotes, { force: true });

    cy.get('.formio-component-submit button').click('top');

    cy.wait('@notes').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.get('.govuk-grid-column-one-third').within(() => {
      cy.get('.govuk-body-s a').first().should('have.text', 'cypressuser-cerberus@lodev.xyz');
      cy.contains('Add notes for testing & check it stored').should('have.text', taskNotes);
    });

    cy.get('button.link-button').should('be.visible').and('have.text', 'Unclaim task').click();

    cy.wait(2000);
  });

  it('Should hide Notes Textarea for the tasks assigned to others', () => {
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-ASSIGN-TO-OTHER`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.assignToOtherUser(tasks);
        });
      });
    });

    cy.getTasksAssignedToOtherUsers().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('.govuk-heading-xl').should('have.text', 'Overview');

    cy.get('.formio-component-note textarea').should('not.exist');
  });

  it('Should hide Claim/UnClaim button for the tasks assigned to others', () => {
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-ASSIGN-TO-OTHER-USER`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.assignToOtherUser(tasks);
        });
      });
    });

    cy.get('a[href="#inProgress"]').click();

    cy.getTasksAssignedToOtherUsers().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('button.link-button').should('not.exist');
  });

  it('Should Claim a task Successfully from task details page', () => {
    const actionItems = [
      'Issue target',
      'Assessment complete',
      'Dismiss',
    ];

    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-CLAIM`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Task not assigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.get('.task-actions--buttons button').each(($items, index) => {
      expect($items.text()).to.equal(actionItems[index]);
    });

    cy.contains('Back to task list').click();

    cy.get('a[href="#inProgress"]').click();

    cy.get('@taskName').then((value) => {
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(value, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(value, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should verify all the action buttons available when task loaded from In Progress', () => {
    const actionItems = [
      'Issue target',
      'Assessment complete',
      'Dismiss',
    ];

    cy.claimTask().then(() => {
      cy.getTasksAssignedToMe().then((tasks) => {
        cy.navigateToTaskDetailsPage(tasks);
      });

      cy.get('.task-actions--buttons button').each(($items, index) => {
        expect($items.text()).to.equal(actionItems[index]);
      });
    });
  });

  it('Should verify all the action buttons not available for non-task owner', () => {
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-ASSIGN-TO-OTHER`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.assignToOtherUser(tasks);
        });
      });
    });

    cy.getTasksAssignedToOtherUsers().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('.task-actions--buttons button').should('not.exist');
  });

  it('Should Unclaim a task Successfully from task details page', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/unclaim').as('unclaim');

    cy.getTasksAssignedToMe().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('button.link-button').should('be.visible').and('have.text', 'Unclaim task').click();

    cy.wait('@unclaim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.wait(2000);
  });

  it('Should dismiss a task with a reason', () => {
    const reasons = [
      'Vessel arrived',
      'False rule match',
      'Resource redirected',
      'Other',
    ];

    let businessKey;

    const expectedActivity = 'Task dismissed, the reason is \'other reason for testing\'. Accompanying note: \'This is for testing\'';

    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-DISMISS`).then((taskResponse) => {
        cy.wait(4000);
        businessKey = taskResponse.businessKey;
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });

        cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');
        cy.get('p.govuk-body').eq(0).should('contain.text', 'Task not assigned');

        cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

        cy.wait('@claim').then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });

        cy.wait(2000);

        cy.contains('Dismiss').click();

        cy.get('.formio-component-reason .govuk-radios__label').each((reason, index) => {
          cy.wrap(reason)
              .should('contain.text', reasons[index]).and('be.visible');
        });

        cy.clickNext();

        cy.verifyMandatoryErrorMessage('reason', 'You must indicate at least one reason for dismissing the task');

        cy.selectRadioButton('reason', 'Other');

        cy.typeValueInTextField('otherReason', 'other reason for testing');

        cy.clickNext();

        cy.waitForNoErrors();

        cy.typeValueInTextArea('addANote', 'This is for testing');

        cy.clickSubmit();

        cy.verifySuccessfulSubmissionHeader('Task has been dismissed');

        cy.visit(`/tasks/${businessKey}`);
      });
    });

    cy.getActivityLogs().then((activities) => {
      expect(activities).to.contain(expectedActivity);
      expect(activities).not.to.contain('Property delete changed from false to true');
    });
  });

  it('Should complete assessment of a task with a reason as take no further action', () => {
    const reasons = [
      'Credibility checks carried out no target required',
      'False BSM/selector match',
      'Vessel arrived',
      'Other',
    ];

    let businessKey = `AUTOTEST-${dateNowFormatted}/RORO-Accompanied-Freight/ASSESSMENT_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    const expectedActivity = 'Assessment complete, the reason is \'vesselArrived\'. Accompanying note: \'This is for testing\'';

    cy.fixture('tasks.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });

        cy.wait(2000);

        cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

        cy.contains('Assessment complete').click();

        cy.clickNext();

        cy.verifyMandatoryErrorMessage('reason', 'You must indicate at least one reason for completing your assessment');

        cy.get('.formio-component-reason .govuk-radios__label').each(($reason, index) => {
          expect($reason).to.be.visible;
          let reasonText = $reason.text().replace(/^\s+|\s+$/g, '');
          expect(reasonText).to.contain(reasons[index]);
        });

        cy.selectRadioButton('reason', 'Vessel arrived');

        cy.clickNext();

        cy.typeValueInTextArea('addANote', 'This is for testing');

        cy.clickSubmit();

        cy.verifySuccessfulSubmissionHeader('Task has been completed');

        cy.visit(`/tasks/${taskResponse.businessKey}`);
      });

      cy.getActivityLogs().then((activities) => {
        expect(activities).to.contain(expectedActivity);
        expect(activities).not.to.contain('Property delete changed from false to true');
      });

      // COP-8703 Display updated tasks that had previously completed assessment
      cy.fixture('tasks.json').then((reListTask) => {
        reListTask.businessKey = businessKey;
        reListTask.variables.rbtPayload.value.data.movementId = businessKey;
        reListTask.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber = 'ABC123';
        reListTask.variables.rbtPayload.value = JSON.stringify(reListTask.variables.rbtPayload.value);
        cy.postTasks(reListTask, null).then((taskResponse) => {
          cy.wait(10000);

          cy.visit('/tasks');

          cy.contains('Clear all filters').click();

          cy.get('.govuk-checkboxes [value="RORO_UNACCOMPANIED_FREIGHT"]')
            .click({ force: true });

          cy.contains('Apply filters').click({ force: true });

          cy.wait(2000);

          cy.verifyTaskHasUpdated(taskResponse.businessKey, 'Updated');
          cy.verifyTaskHasUpdated(taskResponse.businessKey, 'Relisted');
        });
      });

      // COP-8703 Check Task is no more listed on completed tab
      cy.get('a[href="#complete"]').click();
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(businessKey.replace(/\//g, '_'), null, null).then((taskFound) => {
          expect(taskFound).to.equal(false);
        });
      } else {
        cy.findTaskInSinglePage(businessKey.replace(/\//g, '_'), null, null).then((taskFound) => {
          expect(taskFound).to.equal(false);
        });
      }
    });
  });

  it('Should verify all the action buttons not available when task loaded from Complete tab', () => {
    cy.get('a[href="#complete"]').click();

    cy.get('.govuk-task-list-card a').eq(0).click();

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.get('button.link-button').should('not.exist');

    cy.get('.formio-component-note textarea').should('not.exist');
  });

  it('Should Unclaim a task Successfully from at the end of pages In Progress tab & verify it moved to New tab', () => {
    cy.clock();
    cy.intercept('POST', '/camunda/engine-rest/task/*/unclaim').as('unclaim');

    cy.getTasksAssignedToMe().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Unclaim task').click();

    cy.wait('@unclaim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.wait(2000);

    cy.url().should('contain', '/tasks?tab=new');

    cy.tick(60000);

    cy.get('@taskName').then((text) => {
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Should Unclaim a task Successfully from In Progress tab and verify it moved to New tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/unclaim').as('unclaim');

    cy.getTasksAssignedToMe().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Unclaim task').click();

    cy.wait('@unclaim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.wait(2000);

    cy.url().should('contain', '/tasks?tab=new');

    cy.get('@taskName').then((text) => {
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Vehicle and Trailer - Unknown values in Task List & Task Summary', () => {
    cy.fixture('taskInfo-unknown/RoRo-Acc-VehWithTrail-expected.json').as('expTestData');
    cy.fixture('taskInfo-unknown/RoRo-Acc-VehWithTrail.json')
      .then((task) => {
        // vehicle registration number
        task.variables.rbtPayload.value.data.movement.vehicles[1].vehicle.registrationNumber = null;
        // Trailer Registration number - If trailer is set to null then title changes from "Vehicle with Trailer" to "Vehicle"
        // task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber = null;
        task.variables.rbtPayload.value.data.movement.voyage.voyage.departureLocation = null;
        task.variables.rbtPayload.value.data.movement.voyage.voyage.arrivalLocation = null;
        // Account - (stored in holdername or name)
        task.variables.rbtPayload.value.data.movement.organisations[1].attributes.attrs.holderName = null;
        task.variables.rbtPayload.value.data.movement.organisations[1].organisation.name = null;
        // Haulier Name
        task.variables.rbtPayload.value.data.movement.organisations[2].organisation.name = null;
        task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.goodsDescription = null;
        let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
        task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
        cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`)
          .then((response) => {
            cy.wait(4000);
            cy.get('@expTestData').then((expTestData) => {
              cy.verifyTaskListInfo(`${response.businessKey}`).then((taskListDetails) => {
                expect(expTestData.taskListDetails).to.deep.equal(taskListDetails);
              });
            });
            cy.checkTaskDisplayed(`${response.businessKey}`);
          });
      });

    cy.get('.card .govuk-caption-m').should('contain.text', 'Trailer');
    cy.get('.card .govuk-heading-s').should('contain.text', 'NL-234-392');

    // COP-9672 Display highest threat level in task details
    cy.get('.task-versions .govuk-accordion__section').each((element) => {
      cy.wrap(element).find('.task-versions--right .govuk-list li span.govuk-tag--positiveTarget').invoke('text').then((value) => {
        expect('Tier 3').to.be.equal(value);
      });
    });

    cy.get('@expTestData').then((expTestData) => {
      cy.checkTaskSummaryDetails().then((taskSummary) => {
        expect(taskSummary).to.deep.equal(expTestData.taskSummary);
      });
    });
  });

  it('Vehicle - Unknown values in Task List and Task summary', () => {
    cy.fixture('taskInfo-unknown/RoRo-Acc-VehOnly-expected.json').as('expTestData');
    cy.fixture('/taskInfo-unknown/RoRo-Acc-VehOnly.json')
      .then((task) => {
        // vehicle registration number
        task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber = null;
        task.variables.rbtPayload.value.data.movement.voyage.voyage.departureLocation = null;
        task.variables.rbtPayload.value.data.movement.voyage.voyage.arrivalLocation = null;
        // Account - (stored in holdername or name)
        task.variables.rbtPayload.value.data.movement.organisations[1].attributes.attrs.holderName = null;
        task.variables.rbtPayload.value.data.movement.organisations[1].organisation.name = null;
        // Haulier Name
        task.variables.rbtPayload.value.data.movement.organisations[2].organisation.name = null;
        // Goods description
        task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.goodsDescription = null;
        let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
        task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
        const businessKey = `AUTOTEST-${dateNowFormatted}-${mode}`;
        cy.postTasks(task, businessKey)
          .then((response) => {
            cy.wait(4000);
            cy.get('@expTestData').then((expTestData) => {
              cy.verifyTaskListInfo(`${response.businessKey}`).then((taskListDetails) => {
                expect(expTestData.taskListDetails).to.deep.equal(taskListDetails);
              });
            });
            cy.checkTaskDisplayed(`${response.businessKey}`);
          });
      });

    // COP-9672 Display highest threat level in task details
    cy.get('.task-versions .govuk-accordion__section').each((element) => {
      cy.wrap(element).find('.task-versions--right .govuk-list li span.govuk-tag--positiveTarget').invoke('text').then((value) => {
        expect('Tier 3').to.be.equal(value);
      });
    });

    cy.get('@expTestData').then((expTestData) => {
      cy.checkTaskSummaryDetails().then((taskSummary) => {
        expect(taskSummary).to.deep.equal(expTestData.taskSummary);
      });
    });
  });

  it('Should display correct values for PERFDRIVER Driver, Booking, Vehicle, tasklist, task summary', () => {
    cy.fixture('/taskInfo-known/RoRo-Acc-TaskDetails-expected.json').as('expTestData');
    cy.fixture('/taskInfo-known/RoRo-Acc-TaskDetails-known.json')
      .then((task) => {
        task.variables.rbtPayload.value.data.movement.persons[0].person.type = 'PERFDRIVER';
        let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
        task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
        cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`)
          .then((response) => {
            cy.wait(4000);
            cy.get('@expTestData').then((expTestData) => {
              cy.verifyTaskListInfo(`${response.businessKey}`).then((taskListDetails) => {
                expect(expTestData.taskListDetails).to.deep.equal(taskListDetails);
              });
            });
            cy.checkTaskDisplayed(`${response.businessKey}`);
            cy.get('@expTestData').then((expectedData) => {
              cy.verifyTaskDetailAllSections(expectedData.versions[0], 1);
            });
          });
      });

    cy.get('.card .govuk-caption-m').should('contain.text', 'Vehicle with Trailer');
    cy.get('.card .govuk-heading-s').should('contain.text', 'NL-234-392');

    // COP-9672 Display highest threat level in task details
    cy.get('.task-versions .govuk-accordion__section').each((element) => {
      cy.wrap(element).find('.task-versions--right .govuk-list li span.govuk-tag--positiveTarget').invoke('text').then((value) => {
        expect('Tier 3').to.be.equal(value);
      });
    });

    cy.get('@expTestData').then((expTestData) => {
      cy.checkTaskSummaryDetails().then((taskSummary) => {
        expect(taskSummary).to.deep.equal(expTestData.taskSummary);
      });
    });
  });

  it('Should display assignee name when task in progress on task management page', () => {
    cy.fixture('tasks.json').then((task) => {
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-ASSIGN-TO-OTHER-CHECK-ASSIGNEE-NAME`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.assignToOtherUser(tasks);
        });
      });
    });

    cy.intercept('POST', '/camunda/v1/targeting-tasks/pages').as('tasks');

    cy.getTasksAssignedToSpecificUser('boothi.palanisamy@digital.homeoffice.gov.uk').then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Assigned to boothi.palanisamy@digital.homeoffice.gov.uk');

    cy.contains('Back to task list').click();

    cy.get('a[href="#inProgress"]').click();

    cy.wait('@tasks').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });

    cy.get('@taskName').then((text) => {
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(text, null, 'Assigned to boothi.palanisamy@digital.homeoffice.gov.uk').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(text, null, 'Assigned to boothi.palanisamy@digital.homeoffice.gov.uk').then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      }
    });
  });

  it('Setting drivers when no driver or multiple drivers exist', () => {
    let jsonFolder = '/drivers/';
    let expDriverForPayload = [
      ['driverAndMultiplePass.json', 'Joanne Flower'],
      ['driverNoPassenger.json', 'Bob Brown'],
      ['multipleDrivers.json', 'Amy Bailey'],
      ['vehicleTrailerOnly.json', ''],
      ['multiplePassengers.json', 'Darren Ball'],
    ];
    expDriverForPayload.forEach((item) => {
      let payloadFile = jsonFolder + item[0];
      let expDriver = item[1];
      cy.fixture(payloadFile)
        .then((task) => {
          let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
          const businessKey = `AUTOTEST-${dateNowFormatted}-${mode}-SETDRIVER`;
          task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
          cy.postTasks(task, businessKey)
            .then((response) => {
              cy.wait(4000);
              cy.checkTaskDisplayed(`${response.businessKey}`);
              cy.contains('h3', 'Driver').next().within(() => {
                cy.getTaskDetails().then((details) => {
                  expect(details.Name).to.be.equal(expDriver);
                });
              });
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
