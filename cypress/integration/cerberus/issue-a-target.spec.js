describe('Issue target from cerberus UI using target sheet information form', () => {
  beforeEach(() => {
    cy.login(Cypress.env('userName'));
  });

  it('Should submit a target successfully from a task and it should be moved to target issued tab', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');

    cy.fixture('tasks.json').then((task) => {
      cy.postTasks(task, 'CERB-AUTOTEST').then((taskResponse) => {
        cy.wait(4000);
        cy.getTasksByPartialBusinessKey(taskResponse.businessKey).then((tasks) => {
          const processInstanceId = tasks.map(((item) => item.processInstanceId));
          expect(processInstanceId.length).to.not.equal(0);
          cy.intercept('GET', `/camunda/task?processInstanceId=${processInstanceId[0]}`).as('tasksDetails');
          cy.visit(`/tasks/${processInstanceId[0]}`);
          cy.wait('@tasksDetails').then(({ response }) => {
            expect(response.statusCode).to.equal(200);
          });
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

    cy.selectDropDownValue('mode', 'RoRo Freight');

    cy.selectDropDownValue('eventPort', '135 Dunganno Road');

    cy.selectDropDownValue('issuingHub', 'Vessel Targeting');

    cy.typeTodaysDateTime('eta');

    cy.selectDropDownValue('strategy', 'Alcohol');

    cy.selectDropDownValue('nominalType', 'Account');

    cy.selectDropDownValue('threatIndicators', 'Paid by cash');

    cy.selectDropDownValue('checks', 'Anti Fraud Information System');

    cy.typeValueInTextArea('comments', 'Nominal type comments for testing');

    cy.selectRadioButton('warningsIdentified', 'No');

    cy.clickNext();

    cy.waitForNoErrors();

    cy.selectDropDownValue('teamToReceiveTheTarget', 'Portsmouth Customs/Immigration Team 1 - DS05A1');

    cy.clickSubmit();

    cy.verifySuccessfulSubmissionHeader('Target created successfully');

    cy.reload();

    cy.get('@taskName').then((value) => {
      cy.get('.govuk-caption-xl').should('have.text', value);
    });

    cy.get('.task-actions--buttons button').should('not.exist');

    cy.contains('Back to task list').click();

    cy.reload();

    cy.get('a[href="#target-issued"]').click();

    cy.waitForTaskManagementPageToLoad();

    cy.wait(2000);

    cy.get('@taskName').then((value) => {
      cy.log('Task Name to be searched', value);
      const nextPage = 'a[data-test="next"]';
      if (Cypress.$(nextPage).length > 0) {
        cy.findTaskInAllThePages(value, null).then((taskFound) => {
          expect(taskFound).to.equal(true);
        });
      } else {
        cy.findTaskInSinglePage(value, null).then((taskFound) => {
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
    cy.contains('Sign out').click();
    cy.get('#kc-page-title').should('contain.text', 'Log In');
  });
});
