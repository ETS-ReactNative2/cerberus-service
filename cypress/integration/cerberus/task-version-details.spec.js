describe('Task Details of different tasks on task details Page', () => {
  let dateNowFormatted;
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });

  before(() => {
    dateNowFormatted = Cypress.dayjs().format('DD-MM-YYYY');
  });

  it('Should verify task version details of unaccompanied task on task details page', () => {
    let date = new Date();
    let targetURL;
    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-VERSION-DETAILS`).then((response) => {
        cy.wait(4000);
        targetURL = response.businessKey;
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);
    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');
    cy.expandTaskDetails(0);

    cy.fixture('unaccompanied-task-details.json').then((expectedDetails) => {
      cy.contains('h2', 'Vehicle details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.contains('h2', 'Account details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.account);
        });
      });

      cy.contains('h2', 'Haulier details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.haulier);
        });
      });

      cy.contains('h2', 'Driver').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.driver);
        });
      });

      cy.contains('h2', 'Passengers').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.passengers);
        });
      });

      cy.contains('h2', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h2', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h2', 'Targeting indicators').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.TargetingIndicators);
        });
      });

      cy.contains('h2', '1 selector matches').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.selector_matches);
        });
      });
      // COP-6433 : Auto-expand current task version
      cy.collapseTaskDetails(0);
      cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'false');
      cy.reload();
      cy.wait(2000);
      cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'false');

      cy.contains('Sign out').click();

      cy.login(Cypress.env('userName'));

      cy.checkTaskDisplayed(targetURL);

      cy.wait(2000);

      cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');
    });
  });

  it('Should verify task version details of accompanied task with no passengers on task details page', () => {
    let date = new Date();
    cy.fixture('RoRo-Accompanied-Freight.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-DETAILS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');
    cy.expandTaskDetails(0);

    cy.fixture('accompanied-task-details.json').then((expectedDetails) => {
      cy.contains('h2', 'Vehicle details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.contains('h2', 'Account details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.account);
        });
      });

      cy.contains('h2', 'Haulier details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.haulier);
        });
      });

      cy.contains('h2', 'Driver').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.driver);
        });
      });

      cy.contains('h2', 'Passengers').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.passengers);
        });
      });

      cy.contains('h2', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h2', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h2', 'Targeting indicators').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.TargetingIndicators);
        });
      });
    });
  });

  it('Should verify task version details of tourist task on task details page', () => {
    let date = new Date();
    cy.fixture('RoRo-Tourist-2-passengers.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-DETAILS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');
    cy.expandTaskDetails(0);

    cy.fixture('tourist-task-details.json').then((expectedDetails) => {
      cy.contains('h2', 'Vehicle details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.contains('h2', 'Account details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.account);
        });
      });

      cy.contains('h2', 'Haulier details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.haulier);
        });
      });

      cy.contains('h2', 'Driver').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.driver);
        });
      });

      cy.contains('h2', 'Passengers').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.passengers);
        });
      });

      cy.contains('h2', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h2', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });
    });
  });

  it('Should verify task version details of accompanied task with 2 passengers on task details page', () => {
    let date = new Date();
    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      console.log(task.variables.rbtPayload.value);
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-with-2-Passengers-DETAILS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');

    cy.expandTaskDetails(0);

    cy.fixture('accompanied-task-2-passengers-details.json').then((expectedDetails) => {
      cy.contains('h2', 'Vehicle details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.contains('h2', 'Account details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.account);
        });
      });

      cy.contains('h2', 'Haulier details').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.haulier);
        });
      });

      cy.contains('h2', 'Driver').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.driver);
        });
      });

      cy.contains('h2', 'Passengers').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.passengers);
        });
      });

      cy.contains('h2', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h2', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h2', 'Rules matched').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.rules);
        });
      });
    });
  });

  it('Should verify single task created for the same target with different versions when payloads sent with delay', () => {
    let date = new Date();
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-different-versions-task_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;
    const expectedAutoExpandStatus = [
      'false',
      'false',
      'false',
    ];

    date.setDate(date.getDate() + 8);
    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v2.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v3.json').then((task) => {
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

    cy.get('.govuk-accordion__section-heading').should('have.length', 3);

    // COP-6433 : Auto-expand latest task version

    cy.get('.govuk-accordion__section-button').first().invoke('attr', 'aria-expanded').should('equal', 'true');

    cy.get('.govuk-accordion__section-button').first().click();

    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').first().invoke('attr', 'aria-expanded').should('equal', 'false');
    cy.reload();
    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').each((version, index) => {
      cy.wrap(version).invoke('attr', 'aria-expanded').should('equal', expectedAutoExpandStatus[index]);
    });

    cy.contains('Sign out').click();

    cy.login(Cypress.env('userName'));

    cy.checkTaskDisplayed(businessKey);

    cy.wait(2000);

    const expectedDefaultExpandStatus = [
      'true',
      'false',
      'false',
    ];

    cy.get('.govuk-accordion__section-button').each((version, index) => {
      cy.wrap(version).invoke('attr', 'aria-expanded').should('equal', expectedDefaultExpandStatus[index]);
    });
  });

  it('Should verify task details on each version retained', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-different-versions-task_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.wait(3000);
    });

    // COP-8997 Verify Task version details are not changed after clicking on cancel button
    cy.fixture('task-details-versions.json').then((expectedDetails) => {
      cy.verifyTaskDetailAllSections(expectedDetails.versions[0], 1);
    });

    cy.get('p.govuk-body').eq(0).invoke('text').then((assignee) => {
      if (assignee.includes('Unassigned')) {
        cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();
      }
    });

    cy.contains('Issue target').click();

    cy.wait(3000);

    cy.contains('Cancel').click();

    cy.on('window:confirm', (str) => {
      expect(str).to.equal('Are you sure you want to cancel?');
    });

    cy.on('window:confirm', () => true);

    // Check Version 1 details are retained after clicking cancel button
    cy.fixture('task-details-versions.json').then((expectedDetails) => {
      cy.verifyTaskDetailAllSections(expectedDetails.versions[2], 3);
    });
  });

  it('Should verify difference between versions displayed on task details page', () => {
    const firstVersionIndex = 2;
    const versionDiff = [
      '32 changes in this version',
      '6 changes in this version',
      'No changes in this version',
    ];

    cy.fixture('/task-version-differences.json').as('differences');

    let differencesInEachVersion = [];
    cy.getBusinessKey('-RORO-Accompanied-Freight-different-versions-task_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.wait(3000);
    });

    // COP-8704 Verify number of difference between the versions displayed & highlighted
    cy.get('.task-versions .govuk-accordion__section').each((element, index) => {
      cy.wrap(element).find('.task-versions--right .govuk-list li').invoke('text').then((value) => {
        expect(versionDiff[index]).to.be.equal(value);
      });

      if (index !== firstVersionIndex) {
        cy.getTaskVersionsDifference(element, index).then((differences) => {
          differencesInEachVersion.push(differences);
        });
      }
    });

    // COP-9273 Verify number of difference between the versions for both Keys and values displayed & highlighted
    cy.get('@differences').then((expectedData) => {
      expect(expectedData.versions).to.deep.equal(differencesInEachVersion);
    });
  });

  it('Should verify single task created for the same target with different versions when payloads sent without delay', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-No-Delay_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    let tasks = [];

    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('RoRo-task-v2.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('RoRo-task-v3.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.postTasksInParallel(tasks).then((response) => {
      cy.wait(15000);
      cy.checkTaskDisplayed(`${response.businessKey}`);
      let encodedBusinessKey = encodeURIComponent(`${response.businessKey}`);
      cy.getAllProcessInstanceId(encodedBusinessKey).then((res) => {
        expect(res.body.length).to.not.equal(0);
        expect(res.body.length).to.equal(1);
      });
    });
    cy.get('.govuk-accordion__section-heading').should('have.length', 3);
  });

  it('Should verify single task created for the same target with different versions when Failed Cerberus payloads sent without delay', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-No-Delay_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    let tasks = [];

    cy.fixture('/task-version/RoRo-task-v1.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('/task-version/RoRo-task-v2.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('/task-version/RoRo-task-v3.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('/task-version/RoRo-task-v4.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.postTasksInParallel(tasks).then((response) => {
      cy.wait(15000);
      cy.checkTaskDisplayed(`${response.businessKey}`);
      let encodedBusinessKey = encodeURIComponent(`${response.businessKey}`);
      cy.getAllProcessInstanceId(encodedBusinessKey).then((res) => {
        expect(res.body.length).to.not.equal(0);
        expect(res.body.length).to.equal(1);
      });
    });
    cy.get('.govuk-accordion__section-heading').should('have.length.lte', 4);
  });

  // COP-6905 Scenario-2
  it('Should verify only one versions are created for a task when the attribute for the target indicators in the payload not changed', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-target-indicators-same-version_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v1-target-update.json').then((task) => {
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
    cy.get('.govuk-accordion__section-heading').should('have.length', 1);
    cy.expandTaskDetails(0);

    const expectedDetails = {
      'Name': 'Quick turnaround tourist (24-72 hours)',
      'Name': 'Paid by cash',
    };

    cy.contains('h2', 'Targeting indicators').next().within(() => {
      cy.getTaskDetails().then((details) => {
        expect(details).to.deep.equal(expectedDetails);
      });
    });
  });

  // COP-6905 Scenario-3
  it('Should verify 2 versions are created for a task when the payload has different target indicators', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-target-indicators-diff-version_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v1-target-update.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(3000);

    cy.fixture('RoRo-task-v3-target-update.json').then((task) => {
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
    cy.get('.govuk-accordion__section-heading').should('have.length', 2);

    cy.get('.govuk-accordion__section-button').eq(0).invoke('attr', 'aria-expanded').then((value) => {
      if (value !== true) {
        cy.get('.govuk-accordion__section-button').eq(0).click();
      }
    });

    const expectedDetails = {
      'Name': 'UK port hop inbound',
      'Name': 'First use of account (Driver)',
      'Name': 'First time through this UK port (Trailer)',
    };

    cy.contains('h2', 'Targeting indicators').next().within(() => {
      cy.getTaskDetails().then((details) => {
        expect(details).to.deep.equal(expectedDetails);
      });
    });
  });

  it('Should verify all the target indicators received in the payload displayed on UI', () => {
    let date = new Date();
    date.setDate(date.getDate() + 8);

    cy.fixture('RoRo-task-target-indicators.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-Target-Indicators-Details`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);

    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');

    cy.expandTaskDetails(0);

    const expectedDetails = {
      'Name': 'UK port hop inbound',
      'Name': 'First use of account (Driver)',
      'Name': 'First time through this UK port (Trailer)',
      'Name': 'Intelligence Received - Account',
      'Name': 'Intelligence Received - Consignee',
      'Name': 'Intelligence Received - Consignor',
      'Name': 'Intelligence Received - Driver',
      'Name': 'Intelligence Received - Haulier',
      'Name': 'Intelligence Received - Passenger',
      'Name': 'Intelligence Received - Trailer',
      'Name': 'Intelligence Received - Vehicle',
      'Name': 'Empty trailer',
      'Name': 'Has previously travelled as tourist (vehicle)',
      'Name': 'Has previously travelled as freight (person)',
      'Name': 'Has previously travelled as freight (vehicle)',
      'Name': 'Has previously travelled as tourist (person)',
    };

    cy.contains('h2', 'Targeting indicators').next().within(() => {
      cy.getTaskDetails().then((details) => {
        expect(details).to.deep.equal(expectedDetails);
      });
    });
  });

  it('Should verify the Risk Score for a task with 2 Target Indicators', () => {
    // COP-9051
    cy.getBusinessKey('-RORO-Accompanied-Freight-target-indicators-same-version_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`).then((taskListDetails) => {
        expect('Risk Score: 50').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Task with multiple versions', () => {
    // COP-9051 The aggregated score is for the TIs in the latest version and does NOT include the score for TIs in previous 2 versions
    cy.getBusinessKey('-RORO-Accompanied-Freight-target-indicators-diff-version_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`).then((taskListDetails) => {
        expect('Risk Score: 80').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Task with 16 TIs displays the correct aggregated score', () => {
    // COP-9051
    cy.getBusinessKey('-Target-Indicators-Details').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`).then((taskListDetails) => {
        expect('Risk Score: 4140').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Tasks without TIs present are not displaying a score/value', () => {
    // COP-9051
    cy.getBusinessKey('-RORO-Unaccompanied-Freight-RoRo-UNACC-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`).then((taskListDetails) => {
        expect('Risk Score:').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
