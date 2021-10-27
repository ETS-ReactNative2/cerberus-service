describe('Issue target from cerberus UI using target sheet information form', () => {
  let dateNowFormatted;
  let date;
  beforeEach(() => {
    date = new Date();
    dateNowFormatted = Cypress.moment(date).format('DD-MM-YYYY');
    cy.login(Cypress.env('userName'));
  });

  it('Should submit a target successfully from a RoRo-accompanied task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');

    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-Accompanied`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Unassigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.fixture('accompanied-task-2-passengers-details.json').then((expectedDetails) => {
      let driverFirstName = expectedDetails.driver.Name;
      let driiverDOB = expectedDetails.driver['Date of birth'].replace(/(^|-)0+/g, '$1').split('/');
      let driverDocExpiry = expectedDetails.driver['Travel document expiry'].replace(/(^|-)0+/g, '$1').split('/');
      cy.verifyElementText('name', expectedDetails.vessel.name);
      cy.verifyElementText('company', expectedDetails.vessel.shippingCompany);
      cy.verifyElementText('make', expectedDetails.vehicle.Make);
      cy.verifyElementText('model', expectedDetails.vehicle.Model);
      cy.verifyElementText('colour', expectedDetails.vehicle.Colour);
      cy.verifyElementText('registrationNumber', expectedDetails.vehicle['Vehicle registration']);
      cy.verifyElementText('regNumber', expectedDetails.vehicle['Trailer registration number']);
      cy.verifyMultiSelectDropdown('threatIndicators', ['Paid by cash', 'Empty trailer for round trip', 'Empty vehicle']);
      cy.removeOptionFromMultiSelectDropdown('threatIndicators', ['Paid by cash']);
      cy.verifyMultiSelectDropdown('threatIndicators', ['Empty trailer for round trip', 'Empty vehicle']);

      cy.get('.formio-component-driver').within(() => {
        cy.verifyElementText('firstName', driverFirstName.split(' ')[0]);
        cy.verifyElementText('lastName', driverFirstName.split(' ')[1]);
        cy.verifyDate('dob', driiverDOB[0], driiverDOB[1], driiverDOB[2]);
        cy.verifyElementText('docNumber', expectedDetails.driver['Travel document number']);
        cy.verifyDate('docExpiry', driverDocExpiry[0], driverDocExpiry[1], driverDocExpiry[2]);
      });

      const name = 'passengers';
      let row = 0;
      for (let passenger of expectedDetails.passengersTIS) {
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

    cy.selectDropDownValue('mode', 'RoRo Freight');

    cy.selectDropDownValue('eventPort', '135 Dunganno Road');

    cy.selectDropDownValue('issuingHub', 'Vessel Targeting');

    cy.typeTodaysDateTime('eta');

    cy.selectDropDownValue('strategy', 'Alcohol');

    cy.selectDropDownValue('nominalType', 'Account');

    cy.selectDropDownValue('checks', 'Anti Fraud Information System');

    cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

    cy.selectRadioButton('warningsIdentified', 'No');

    cy.clickNext();

    cy.waitForNoErrors();

    cy.selectDropDownValue('teamToReceiveTheTarget', 'Portsmouth Frontline - GPGMYBP2');

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#target-issued"]').click();

    cy.reload();

    cy.get('a[href="#target-issued"]').click();

    cy.waitForTaskManagementPageToLoad();

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
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');

    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-Unaccompanied`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Unassigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.fixture('unaccompanied-task-details.json').then((expectedDetails) => {
      cy.verifyElementText('name', expectedDetails.vessel.name);
      cy.verifyElementText('company', expectedDetails.vessel.shippingCompany);
      cy.verifyElementText('make', expectedDetails.vehicle.Make);
      cy.verifyElementText('model', expectedDetails.vehicle.Model);
      cy.verifyElementText('colour', expectedDetails.vehicle.Colour);
      cy.verifyElementText('registrationNumber', expectedDetails.vehicle['Vehicle registration']);
      cy.verifyElementText('regNumber', expectedDetails.vehicle['Trailer registration number']);
    });

    cy.selectDropDownValue('mode', 'RoRo Freight');

    cy.selectDropDownValue('eventPort', '135 Dunganno Road');

    cy.selectDropDownValue('issuingHub', 'Vessel Targeting');

    cy.typeTodaysDateTime('eta');

    cy.selectDropDownValue('strategy', 'Alcohol');

    cy.selectDropDownValue('nominalType', 'Account');

    cy.multiSelectDropDown('threatIndicators', ['Paid by cash', 'Change of account (Driver)']);

    cy.selectDropDownValue('checks', 'Anti Fraud Information System');

    cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

    cy.selectRadioButton('warningsIdentified', 'No');

    cy.clickNext();

    cy.waitForNoErrors();

    cy.selectDropDownValue('teamToReceiveTheTarget', 'Portsmouth Frontline - GPGMYBP2');

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#target-issued"]').click();

    cy.reload();

    cy.get('a[href="#target-issued"]').click();

    cy.waitForTaskManagementPageToLoad();

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
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');

    cy.fixture('RoRo-Tourist-2-passengers.json').then((task) => {
      date.setDate(date.getDate() + 6);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      console.log('data value', task.variables.rbtPayload.value);
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-RoRo-Tourist`).then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByBusinessKey(taskResponse.businessKey).then((tasks) => {
          cy.navigateToTaskDetailsPage(tasks);
        });
      });
    });

    cy.get('p.govuk-body').eq(0).should('contain.text', 'Unassigned');

    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

    cy.wait('@claim').then(({ response }) => {
      expect(response.statusCode).to.equal(204);
    });

    cy.contains('Issue target').click();

    cy.wait(2000);

    cy.get('.govuk-caption-xl').invoke('text').as('taskName');

    cy.fixture('tourist-task-2-passengers-details.json').then((expectedDetails) => {
      cy.verifyElementText('name', expectedDetails.vessel.name);
      cy.verifyElementText('company', expectedDetails.vessel.shippingCompany);
      cy.verifyElementText('make', expectedDetails.vehicle.Make);
      cy.verifyElementText('model', expectedDetails.vehicle.Model);
      cy.verifyElementText('colour', expectedDetails.vehicle.Colour);
      cy.verifyElementText('registrationNumber', expectedDetails.vehicle['Vehicle registration']);
      cy.verifyElementText('regNumber', expectedDetails.vehicle['Trailer registration number']);
    });

    cy.selectDropDownValue('mode', 'RoRo Tourist');

    cy.selectDropDownValue('eventPort', '135 Dunganno Road');

    cy.selectDropDownValue('issuingHub', 'Vessel Targeting');

    cy.typeTodaysDateTime('eta');

    cy.selectDropDownValue('strategy', 'Alcohol');

    cy.selectDropDownValue('nominalType', 'Account');

    cy.multiSelectDropDown('threatIndicators', ['Paid by cash', 'Change of account (Driver)']);

    cy.selectDropDownValue('checks', 'Anti Fraud Information System');

    cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

    cy.selectRadioButton('warningsIdentified', 'No');

    cy.clickNext();

    cy.waitForNoErrors();

    cy.selectDropDownValue('teamToReceiveTheTarget', 'Portsmouth Frontline - GPGMYBP2');

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.get('a[href="#target-issued"]').click();

    cy.reload();

    cy.get('a[href="#target-issued"]').click();

    cy.waitForTaskManagementPageToLoad();

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
    cy.get('a[href="#target-issued"]').click();

    cy.get('.govuk-grid-row').eq(0).within(() => {
      cy.get('a').click();
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.get('button.link-button').should('not.exist');

    cy.get('.formio-component-note textarea').should('not.exist');
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
