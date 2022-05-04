describe('Issue target from cerberus UI using target sheet information form', () => {
  let dateNowFormatted;
  let date;
  let etaDateTimeHintText = 'Please note, the date and time displayed here is in local time not UTC time';
  beforeEach(() => {
    date = new Date();
    dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
    cy.login(Cypress.env('userName'));
  });

  it('Should submit a target successfully from a RoRo-accompanied task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.fixture('target-information.json').as('inputData');

    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`).then((taskResponse) => {
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

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.verifySelectedDropdownValue('mode', 'RoRo Freight');

    cy.fixture('accompanied-task-2-passengers-details.json').then((targetData) => {
      let driiverDOB = targetData.driverTIS['Date of birth'].replace(/(^|-)0+/g, '$1').split('/');
      let driverDocExpiry = targetData.driverTIS['Travel document expiry'].replace(/(^|-)0+/g, '$1').split('/');

      cy.get('.formio-component-driver').within(() => {
        cy.verifyElementText('firstName', targetData.driverTIS.firstName);
        cy.verifyElementText('lastName', targetData.driverTIS.lastName);
        cy.verifyDate('dob', driiverDOB[0], driiverDOB[1], driiverDOB[2]);
        cy.verifyElementText('docNumber', targetData.driverTIS['Travel document number']);
        cy.verifyDate('docExpiry', driverDocExpiry[0], driverDocExpiry[1], driverDocExpiry[2]);
      });

      cy.verifyElementText('name', targetData.vessel.name);
      cy.verifyElementText('company', targetData.vessel.shippingCompany);
      cy.verifyElementText('make', targetData['vehicle-details'].vehicle.Make);
      cy.verifyElementText('model', targetData['vehicle-details'].vehicle.Model);
      cy.verifyElementText('colour', targetData['vehicle-details'].vehicle.Colour);
      cy.verifyElementText('registrationNumber', targetData['vehicle-details'].vehicle['Vehicle registration']);
      cy.verifyElementText('regNumber', 'IR-6457');
      cy.verifyMultiSelectDropdown('threatIndicators', ['Paid by cash', 'Empty trailer for round trip', 'Empty vehicle']);
      cy.removeOptionFromMultiSelectDropdown('threatIndicators', ['Paid by cash']);
      cy.verifyMultiSelectDropdown('threatIndicators', ['Empty trailer for round trip', 'Empty vehicle']);

      const name = 'passengers';
      let row = 0;
      for (let passenger of targetData.passengersTIS) {
        row += 1;
        cy.get(`.formio-component-${name} [ref="datagrid-${name}-tbody"] > div:nth-child(${row})`).should('be.visible').within(() => {
          cy.verifyElementText('firstName', passenger.Name.split(' ')[0]);
          cy.verifyElementText('lastName', passenger.Name.split(' ')[1]);
          let passengerDOB = passenger['Date of birth'].replace(/(^|-)0+/g, '$1').split('/');
          let passengerDocExpiry = passenger['Travel document expiry'].replace(/(^|-)0+/g, '').split('/');
          cy.verifyDate('dob', passengerDOB[0], passengerDOB[1], passengerDOB[2]);
          cy.verifyElementText('docNumber', passenger['Travel document number']);
          cy.verifyDate('docExpiry', passengerDocExpiry[0], passengerDocExpiry[1], passengerDocExpiry[2]);
        });
      }

      cy.verifySelectedCheckBox('detailsOf', ['haulier']);

      cy.get('.formio-component-haulier').within(() => {
        cy.verifyElementText('name', targetData.haulierTIS.Name);
        cy.verifyElementText('address', targetData.haulierTIS.Address);
        cy.verifyElementText('city', targetData.haulierTIS.City);
        cy.verifyElementText('country', targetData.haulierTIS.Country);
      });

      cy.get('.formio-component-account').within(() => {
        cy.verifyElementText('name', targetData['account-details'].account['Full name']);
        cy.verifyElementText('number', targetData['account-details'].account['Reference number']);
      });
    });

    cy.fixture('target-information.json').then((targetInfo) => {
      cy.selectDropDownValue('eventPort', targetInfo.port[Math.floor(Math.random() * targetInfo.port.length)]);

      cy.selectDropDownValue('issuingHub', targetInfo.issuingHub[Math.floor(Math.random() * targetInfo.issuingHub.length)]);

      cy.verifyDateTime('eta', date);

      cy.get('.formio-component-eta').within(() => {
        cy.get('.govuk-hint').should('contain.text', etaDateTimeHintText);
      });

      cy.verifySelectedDropdownValue('category', 'A');

      cy.verifyElementText('manifestedLoad', 'Wine');

      cy.multiSelectDropDown('strategy', [targetInfo.strategy[0], targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.verifyMultiSelectDropdown('strategy', [targetInfo.strategy[0], targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.removeOptionFromMultiSelectDropdown('strategy', [targetInfo.strategy[0]]);

      cy.verifyMultiSelectDropdown('strategy', [targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.selectDropDownValue('nominalType', 'Account');

      cy.selectDropDownValue('checks', 'Anti Fraud Information System');

      cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

      cy.selectRadioButton('warningsIdentified', 'No');

      cy.clickNext();

      cy.waitForNoErrors();

      cy.verifySelectDropdown('teamToReceiveTheTarget', targetInfo.groups);

      cy.selectDropDownValue('teamToReceiveTheTarget', targetInfo.groups[Math.floor(Math.random() * targetInfo.groups.length)]);

      cy.SelectInformBothFreightAndTouristOption('informFreightAndTourist');
    });

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#issued"]').click();

    cy.reload();

    cy.get('a[href="#issued"]').click();

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
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

  it('Should submit a target successfully from a RoRo-accompanied with No passengers task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.fixture('target-information.json').as('inputData');

    cy.fixture('RoRo-Freight-Accompanied-no-passengers.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-No-Passengers`).then((taskResponse) => {
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

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.verifySelectedDropdownValue('mode', 'RoRo Freight');

    cy.fixture('accompanied-task-no-passengers.json').then((targetData) => {
      let driverFirstName = targetData.driver.Name;
      cy.verifyElementText('name', targetData.vessel.name);
      cy.verifyElementText('company', targetData.vessel.shippingCompany);
      cy.verifyElementText('registrationNumber', targetData.vehicle['Vehicle registration']);
      cy.verifyElementText('regNumber', 'IR-6457');
      cy.get('.formio-component-driver').within(() => {
        cy.verifyElementText('firstName', driverFirstName.split(' ')[0]);
        cy.verifyElementText('lastName', driverFirstName.split(' ')[1]);
      });

      const name = 'passengers';
      cy.get(`.formio-component-${name} [ref="datagrid-${name}-tbody"]`).should('not.exist');

      cy.verifySelectedCheckBox('detailsOf', ['haulier']);

      cy.get('.formio-component-haulier').within(() => {
        cy.verifyElementText('name', targetData.haulier.name);
      });
    });

    cy.fixture('target-information.json').then((targetInfo) => {
      cy.selectDropDownValue('eventPort', targetInfo.port[Math.floor(Math.random() * targetInfo.port.length)]);

      cy.selectDropDownValue('issuingHub', targetInfo.issuingHub[Math.floor(Math.random() * targetInfo.issuingHub.length)]);

      cy.verifyDateTime('eta', date);

      cy.get('.formio-component-eta').within(() => {
        cy.get('.govuk-hint').should('contain.text', etaDateTimeHintText);
      });

      cy.verifySelectedDropdownValue('category', 'B');

      cy.verifyElementText('manifestedLoad', 'Wine');

      cy.multiSelectDropDown('strategy', [targetInfo.strategy[0], targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.verifyMultiSelectDropdown('strategy', [targetInfo.strategy[0], targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.removeOptionFromMultiSelectDropdown('strategy', [targetInfo.strategy[0]]);

      cy.verifyMultiSelectDropdown('strategy', [targetInfo.strategy[2], targetInfo.strategy[3]]);

      cy.selectDropDownValue('nominalType', 'Account');

      cy.selectDropDownValue('checks', 'Anti Fraud Information System');

      cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

      cy.selectRadioButton('warningsIdentified', 'No');

      cy.clickNext();

      cy.waitForNoErrors();

      cy.verifySelectDropdown('teamToReceiveTheTarget', targetInfo.groups);

      cy.selectDropDownValue('teamToReceiveTheTarget', targetInfo.groups[Math.floor(Math.random() * targetInfo.groups.length)]);
    });

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#issued"]').click();

    cy.reload();

    cy.get('a[href="#issued"]').click();

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
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

  it('Should submit a target successfully from a RoRo-Unaccompanied task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`).then((taskResponse) => {
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

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.verifySelectedDropdownValue('mode', 'RoRo Freight');

    cy.fixture('unaccompanied-task-details.json').then((expectedDetails) => {
      cy.verifyElementText('regNumber', expectedDetails['trailer-details'].trailer['Trailer registration number']);
      cy.get('.formio-component-type').should('be.visible');
      cy.get('.formio-component-registrationNationality').should('be.visible');
      cy.verifyElementText('name', expectedDetails.vessel.name);
      cy.verifyElementText('company', expectedDetails.vessel.shippingCompany);
      cy.verifySelectedCheckBox('detailsOf', ['haulier']);

      cy.get('.formio-component-haulier').within(() => {
        cy.verifyElementText('name', expectedDetails.haulierTIS.Name);
        cy.verifyElementText('address', expectedDetails.haulierTIS.Address);
        cy.verifyElementText('city', expectedDetails.haulierTIS.City);
        cy.verifyElementText('country', expectedDetails.haulierTIS.Country);
      });

      cy.get('.formio-component-account').within(() => {
        cy.verifyElementText('name', expectedDetails['account-details'].account['Full name']);
        cy.verifyElementText('number', expectedDetails['account-details'].account['Reference number']);
      });
    });

    cy.fixture('target-information.json').then((targetInfo) => {
      cy.selectDropDownValue('mode', 'RoRo Freight');

      cy.selectDropDownValue('eventPort', targetInfo.port[Math.floor(Math.random() * targetInfo.port.length)]);

      cy.selectDropDownValue('issuingHub', targetInfo.issuingHub[Math.floor(Math.random() * targetInfo.issuingHub.length)]);

      cy.verifyDateTime('eta', date);

      cy.get('.formio-component-eta').within(() => {
        cy.get('.govuk-hint').should('contain.text', etaDateTimeHintText);
      });

      cy.verifySelectedDropdownValue('category', 'B');

      cy.verifyElementText('manifestedLoad', 'Corkscrews');

      cy.selectDropDownValue('strategy', targetInfo.strategy[Math.floor(Math.random() * targetInfo.strategy.length)]);

      cy.selectDropDownValue('nominalType', 'Account');

      cy.multiSelectDropDown('threatIndicators', targetInfo['target-indicators']);

      cy.selectDropDownValue('checks', 'Anti Fraud Information System');

      cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

      cy.selectRadioButton('warningsIdentified', 'No');

      cy.clickNext();

      cy.waitForNoErrors();

      cy.selectDropDownValue('teamToReceiveTheTarget', targetInfo.groups[Math.floor(Math.random() * targetInfo.groups.length)]);
    });

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#issued"]').click();

    cy.reload();

    cy.get('a[href="#issued"]').click();

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
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

  it('Should submit a target successfully from a RoRo-Unaccompanied only with Trailer task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.fixture('RoRo-Unaccompanied-Trailer-only.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`).then((taskResponse) => {
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

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.verifySelectedDropdownValue('mode', 'RoRo Freight');

    cy.fixture('unaccompanied-task-details.json').then((expectedDetails) => {
      cy.verifyElementText('regNumber', expectedDetails['trailer-details'].trailer['Trailer registration number']);
      cy.get('.formio-component-type').should('be.visible');
      cy.get('.formio-component-registrationNationality').should('be.visible');
      cy.verifyElementText('name', expectedDetails.vessel.name);
      cy.verifyElementText('company', expectedDetails.vessel.shippingCompany);
    });

    cy.fixture('target-information.json').then((targetInfo) => {
      cy.selectDropDownValue('mode', 'RoRo Freight');

      cy.selectDropDownValue('eventPort', targetInfo.port[Math.floor(Math.random() * targetInfo.port.length)]);

      cy.selectDropDownValue('issuingHub', targetInfo.issuingHub[Math.floor(Math.random() * targetInfo.issuingHub.length)]);

      cy.verifyDateTime('eta', date);

      cy.get('.formio-component-eta').within(() => {
        cy.get('.govuk-hint').should('contain.text', etaDateTimeHintText);
      });

      cy.verifySelectedDropdownValue('category', 'B');

      cy.selectDropDownValue('strategy', targetInfo.strategy[Math.floor(Math.random() * targetInfo.strategy.length)]);

      cy.selectDropDownValue('nominalType', 'Account');

      cy.multiSelectDropDown('threatIndicators', targetInfo['target-indicators']);

      cy.selectDropDownValue('checks', 'Anti Fraud Information System');

      cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

      cy.selectRadioButton('warningsIdentified', 'No');

      cy.clickNext();

      cy.waitForNoErrors();

      cy.selectDropDownValue('teamToReceiveTheTarget', targetInfo.groups[Math.floor(Math.random() * targetInfo.groups.length)]);

      cy.SelectInformBothFreightAndTouristOption('informFreightAndTourist');
    });

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#issued"]').click();

    cy.reload();

    cy.get('a[href="#issued"]').click();

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
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

  it('Should submit a target successfully from a RoRo-Tourist task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');

    cy.fixture('RoRo-Tourist-2-passengers.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      console.log('data value', task.variables.rbtPayload.value);
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          console.log('tasks', tasks);
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Task not assigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.fixture('target-information.json').then((targetInfo) => {
      cy.verifySelectedDropdownValue('mode', 'RoRo Tourist');

      cy.fixture('tourist-task-2-passengers-details.json').then((targetData) => {
        let driverFirstName = targetData.driver.Name;
        let driiverDOB = targetData.driver['Date of birth'].replace(/(^|-)0+/g, '$1').split('/');
        let driverDocExpiry = targetData.driver['Travel document expiry'].replace(/(^|-)0+/g, '$1').split('/');
        cy.verifyElementText('name', targetData.vessel.name);
        cy.verifyElementText('company', targetData.vessel.shippingCompany);
        cy.verifyElementText('make', targetData.vehicle.Make);
        cy.verifyElementText('model', targetData.vehicle.Model);
        cy.verifyElementText('colour', targetData.vehicle.Colour);
        cy.verifyElementText('registrationNumber', targetData.vehicle['Vehicle registration']);
        cy.get('.formio-component-driver').within(() => {
          cy.verifyElementText('firstName', driverFirstName.split(' ')[0]);
          cy.verifyElementText('lastName', driverFirstName.split(' ')[1]);
          console.log(driiverDOB[0], driiverDOB[1], driiverDOB[2]);
          cy.verifyDate('dob', driiverDOB[0], driiverDOB[1], driiverDOB[2]);
          cy.verifyElementText('docNumber', targetData.driver['Travel document number']);
          cy.verifyDate('docExpiry', driverDocExpiry[0], driverDocExpiry[1], driverDocExpiry[2]);
        });

        const name = 'passengers';
        let row = 0;
        for (let passenger of targetData.passengersTIS) {
          row += 1;
          cy.get(`.formio-component-${name} [ref="datagrid-${name}-tbody"] > div:nth-child(${row})`).should('be.visible').within(() => {
            cy.verifyElementText('firstName', passenger.Name.split(' ')[0]);
            cy.verifyElementText('lastName', passenger.Name.split(' ')[1]);
            let passengerDOB = passenger['Date of birth'].replace(/(^|-)0+/g, '$1').split('/');
            let passengerDocExpiry = passenger['Travel document expiry'].replace(/(^|-)0+/g, '').split('/');
            cy.verifyDate('dob', passengerDOB[0], passengerDOB[1], passengerDOB[2]);
            cy.verifyElementText('docNumber', passenger['Travel document number']);
            cy.verifyDate('docExpiry', passengerDocExpiry[0], passengerDocExpiry[1], passengerDocExpiry[2]);
          });
        }
      });

      cy.selectDropDownValue('eventPort', targetInfo.port[Math.floor(Math.random() * targetInfo.port.length)]);

      cy.selectDropDownValue('issuingHub', targetInfo.issuingHub[Math.floor(Math.random() * targetInfo.issuingHub.length)]);

      cy.verifyDateTime('eta', date);

      cy.get('.formio-component-eta').within(() => {
        cy.get('.govuk-hint').should('contain.text', etaDateTimeHintText);
      });

      cy.verifySelectedDropdownValue('category', 'C');

      cy.get('.formio-component-account').should('have.class', 'formio-hidden');

      cy.selectDropDownValue('strategy', targetInfo.strategy[Math.floor(Math.random() * targetInfo.strategy.length)]);

      cy.selectDropDownValue('nominalType', 'Account');

      cy.multiSelectDropDown('threatIndicators', ['Paid by cash', 'Change of account (Driver)']);

      cy.selectDropDownValue('checks', 'Anti Fraud Information System');

      cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

      cy.selectRadioButton('warningsIdentified', 'No');

      cy.clickNext();

      cy.waitForNoErrors();

      cy.selectDropDownValue('teamToReceiveTheTarget', targetInfo.groups[Math.floor(Math.random() * targetInfo.groups.length)]);

      cy.SelectInformBothFreightAndTouristOption('informFreightAndTourist');
    });

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#issued"]').click();

    cy.reload();

    cy.get('a[href="#issued"]').click();

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
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

  it('Should verify all the action buttons not available when task loaded from Issued tab', () => {
    cy.get('a[href="#issued"]').click();

    cy.get('.govuk-task-list-card a').eq(0).click();

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.get('button.link-button').should('not.exist');

    cy.get('.formio-component-note textarea').should('not.exist');
  });

  it('Should check target indicators displayed sorted order in the drop down list', () => {
    cy.getUnassignedTasks().then((tasks) => {
      cy.navigateToTaskDetailsPage(tasks);
    });

    let expectedTargetIndicators = [];
    let actualTargetIndicators = [];
    cy.fixture('target-indicators.json').then((targetIndicators) => {
      targetIndicators.TI.forEach((indicator) => {
        expectedTargetIndicators.push(indicator);
      });

      cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();
      cy.contains('Issue target').click();

      cy.wait(2000);
      cy.get('.formio-component-threatIndicators').click();
      cy.get('.formio-component-threatIndicators')
        .within(() => {
          cy.get('.choices__list--dropdown .choices__item--selectable span').each((indicators) => {
            actualTargetIndicators.push(indicators.text());
          });
        }).then(() => {
          expect(actualTargetIndicators).to.have.ordered.members(expectedTargetIndicators);
        });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
