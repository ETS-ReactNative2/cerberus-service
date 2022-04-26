describe('Create task with different payload from Cerberus', () => {
  before(() => {
    cy.login(Cypress.env('userName'));
  });

  it('Should create a task with a payload contains hazardous cargo without description and passport number as null', () => {
    cy.createCerberusTask('tasks-hazardous-cargo.json', 'HAZARDOUS');
  });

  it('Should create a task with a payload contains organisation value as null', () => {
    cy.createCerberusTask('tasks-org-null.json', 'ORG-NULL');
  });

  it('Should create a task with a payload contains vehicle value as null', () => {
    cy.fixture('task-vehicle-null.json').then((task) => {
      let date = new Date();
      let dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-VEHICLE-NULL`).then((response) => {
        cy.wait(4000);
        let businessKey = response.businessKey;
        cy.checkTaskDisplayed(businessKey);
        cy.checkTaskSummary(null, Cypress.dayjs().format('D MMM YYYY [at] HH:mm'));

        cy.contains('Back to task list').click();

        cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
          .click({ force: true });

        cy.contains('Apply filters').click({ force: true });

        cy.wait(2000);

        const nextPage = 'a[data-test="next"]';
        cy.visit('/tasks');
        cy.get('body').then(($el) => {
          if ($el.find(nextPage).length > 0) {
            cy.findTaskInAllThePages(businessKey, null, null).then(() => {
              cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within(() => {
                cy.get('.task-list--item-2 .govuk-grid-column-one-quarter').find('[class^=c-icon-]').should('not.exist');
              });
            });
          } else {
            cy.findTaskInSinglePage(businessKey, null, null).then(() => {
              cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within(() => {
                cy.get('.task-list--item-2 .govuk-grid-column-one-quarter').find('[class^=c-icon-]').should('not.exist');
              });
            });
          }
        });
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist and check AbuseType set to correct value', () => {
    cy.createCerberusTask('RoRo-Tourist.json', 'TOURIST-WITH-PASSENGERS').then(() => {
      cy.wait(2000);
      cy.expandTaskDetails(0).then(() => {
        cy.contains('h2', 'Rules matched').nextAll(() => {
          cy.getAllRuleMatches().then((actualRuleMatches) => {
            expect(actualRuleMatches['Abuse Type']).to.be.equal('Obscene Material');
          });
        });
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist from RBT & SBT', () => {
    cy.fixture('RoRo-Tourist-RBT-SBT.json').then((task) => {
      const dateFormat = 'D MMM YYYY [at] HH:mm';
      let dateNowFormatted = Cypress.dayjs().format('DD-MM-YYYY');
      let taskCreationDateTime = Cypress.dayjs().format(dateFormat);
      let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = Cypress.dayjs().subtract(3, 'year').valueOf();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);

      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-TOURIST-RBT-SBT`).then((response) => {
        cy.wait(10000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.checkTaskSummary(registrationNumber, taskCreationDateTime);
      });

      cy.fixture('tourist-task-co-travellers.json').then((expectedDetails) => {
        cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
          cy.getEnrichmentCounts(elements).then((count) => {
            expect(count).to.deep.equal(expectedDetails['vehicle-details'].enrichmentCount);
          });
          cy.getVehicleDetails(elements).then((details) => {
            expect(details).to.deep.equal(expectedDetails['vehicle-details'].vehicle);
          });
        });

        cy.get('[id$=-content-1]').within(() => {
          cy.get('.govuk-task-details-col-3').within(() => {
            cy.get('.task-details-container').each((occupant, index) => {
              cy.wrap(occupant).find('.enrichment-counts').within((elements) => {
                cy.getEnrichmentCounts(elements).then((count) => {
                  expect(count).to.deep.equal(expectedDetails['Occupant-EnrichmentCount'][index]);
                });
              });
            });
            cy.getOccupantDetails().then((actualoccupantDetails) => {
              expect(actualoccupantDetails).to.deep.equal(expectedDetails.Occupants);
            });
          });
        });

        cy.contains('h3', 'Booking and check-in').next().within(() => {
          cy.getTaskDetails().then((details) => {
            expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
          });
        });
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist from SBT', () => {
    cy.createCerberusTask('RoRo-Tourist-SBT.json', 'TOURIST-SBT');
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight', () => {
    cy.createCerberusTask('RoRo-Freight-Accompanied.json', 'RoRo-ACC');
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight from RBT & SBT', () => {
    cy.createCerberusTask('RoRo-Accompanied-RBT-SBT.json', 'RoRo-ACC-RBT-SBT');
  });

  it('Should create a task with a payload contains RoRo Accompanied Freight from SBT', () => {
    cy.createCerberusTask('RoRo-Accompanied-SBT.json', 'RoRo-ACC-SBT');
  });

  it('Should create a task with a payload contains RoRo Unaccompanied Freight from SBT', () => {
    cy.createCerberusTask('RoRo-Unaccompanied-Freight.json', 'RoRo-UNACC-SBT');
  });

  it('Should create a task with a payload contains RoRo Unaccompanied Freight from RBT & SBT', () => {
    cy.createCerberusTask('RoRo-Unaccompanied-RBT-SBT.json', 'RoRo-UNACC-RBT-SBT');
  });

  it('Should create a task with a payload contains RoRo accompanied with no passengers', () => {
    cy.createCerberusTask('RoRo-Freight-Accompanied-no-passengers.json', 'RoRo-ACC-NO-PASSENGERS');
  });

  it('Should create TSV task with payload contains actual and scheduled timestamps different', () => {
    cy.createCerberusTask('tsv-timestamps-different.json', 'TSV-TIMESTAMP-DIFF');
  });

  it('Should create TSV task with payload contains actual and scheduled timestamps same', () => {
    cy.createCerberusTask('tsv-timestamps-same.json', 'TSV-TIMESTAMP-SAME');
  });

  it('Should create TSV task with payload contains only scheduled timestamp', () => {
    cy.createCerberusTask('tsv-scheduled-timestamp.json', 'TSV-TIMESTAMP-SCHEDULED');
  });

  it('Should create TSV task with payload with no actual and scheduled timestamps', () => {
    cy.createCerberusTask('tsv-only-estimated-timestamp.json', 'TSV-NO-ACTUAL-SCHEDULED-TIMESTAMP');
  });

  it('Should create TSV task with payload with no departure location, actual, scheduled and estimated timestamps', () => {
    cy.createCerberusTask('tsv-no-departure-location.json', 'TSV-NO-DEPARTURE-LOCATION');
  });

  it('Should create a task with payload contains risks array and arrival timestamp as null', () => {
    cy.intercept('POST', '/camunda/task/*/claim').as('claim');
    cy.fixture('task-risks-null.json').then((task) => {
      let date = new Date();
      let dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-RISKS-NULL`).then((response) => {
        cy.wait(4000);
        cy.navigation('Tasks');
        cy.get('.govuk-heading-xl').should('have.text', 'Task management');
        cy.checkTaskDisplayed(`${response.businessKey}`);

        // COP-9672 Display No Rule matches in task details if there are no Rule / Selector
        cy.get('.task-versions .govuk-accordion__section').each((element) => {
          cy.wrap(element).find('.task-versions--right .govuk-list li').eq(1).invoke('text')
            .then((value) => {
              expect('No rule matches').to.be.equal(value);
            });
        });
      });
    });
  });

  it('Should create a RoRo task with payload contains multiple passengers', () => {
    let expectedDetails = {
      'icon': 'icon-position--left c-icon-group',
      'primaryTravellerName': 'Isiaih Ford',
      'documentDetails': '566746DL',
      'bookedOn': 'Booked on 02/08/2020',
      'booked': 'Booked 5 days before travel',
      'travellers': [
        'Donald Donald Duck, ',
        'Fred Flintstone, ',
        'Micky MickyMouse, ',
        'Barney Rubble ',
      ],
    };
    cy.fixture('RoRo-Tourist-muliple-passengers.json').then((task) => {
      let dateNowFormatted = Cypress.dayjs().format('DD-MM-YYYY');
      let arrivalDateTime = Cypress.dayjs().subtract(3, 'year').valueOf();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalDateTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-MULTIPLE-PASSENGERS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.verifyTouristTaskSummary(`${response.businessKey}`).then((taskDetails) => {
          expect(taskDetails).to.deep.equal(expectedDetails);
        });
      });
    });
  });

  it('Should create a RoRo task with payload contains Single passenger', () => {
    let expectedDetails = {
      'icon': 'icon-position--left c-icon-person',
      'primaryTravellerName': 'Isiaih Ford',
      'documentDetails': '566746DL',
      'bookedOn': 'Booked on 02/08/2020',
      'booked': 'Booked 5 days before travel',
      'travellers': [ 'None'],
    };

    cy.fixture('RoRo-Tourist-single-passengers.json').then((task) => {
      let date = new Date();
      let dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-SINGLE-PASSENGER`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.visit('/tasks');

        cy.get('.govuk-checkboxes [value=RORO_TOURIST]')
          .click({ force: true });

        cy.contains('Apply filters').click();
        cy.wait(2000);
        cy.verifyTouristTaskSummary(`${response.businessKey}`).then((taskDetails) => {
          expect(taskDetails).to.deep.equal(expectedDetails);
        });
      });
    });
  });

  it('Should verify the RoRo Tourist task with Vehicle Details', () => {
    let expectedDetails = {
      'icon': 'icon-position--left c-icon-car',
      'driverName': 'Daisy Flower',
      'driverGender': 'Female',
      'vrn': 'HL09YXR',
      'bookedOn': 'Booked on 03/08/2020',
      'booked': 'Booked a day before travel',
      'travellers': [
        'Darren Ball ',
      ],
    };
    cy.getBusinessKey('-TOURIST-RBT-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.wait(4000);
      cy.checkTaskDisplayed(`${businessKeys[0]}`);
      cy.visit('/tasks');

      cy.get('.govuk-checkboxes [value=RORO_TOURIST]')
        .click({ force: true });

      cy.contains('Apply filters').click();
      cy.wait(2000);
      cy.verifyTouristTaskSummary(`${businessKeys[0]}`).then((taskDetails) => {
        expect(taskDetails).to.deep.equal(expectedDetails);
      });
    });
  });

  it('Should create a task with a payload contains RoRo Tourist - no vehicle but has a lead and another passenger', () => {
    cy.fixture('RoRo-Tourist-NoVehicle.json').then((task) => {
      let date = new Date();
      let dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-TOURIST-NO-VEHICLE`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
