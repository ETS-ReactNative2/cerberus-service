import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import config from '../../../src/config';

const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', { relativeTime: config.dayjsConfig.relativeTime });

dayjs.extend(customParseFormat);
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
      cy.contains('h3', 'Account details').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          expect(count).to.deep.equal(expectedDetails['account-details'].enrichmentCount);
        });
        cy.getTaskDetails().then((details) => {
          console.log(expectedDetails.account);
          expect(details).to.deep.equal(expectedDetails['account-details'].account);
        });
      });

      cy.contains('h3', 'Trailer').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          expect(count).to.deep.equal(expectedDetails['trailer-details'].enrichmentCount);
        });
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails['trailer-details'].trailer);
        });
      });

      cy.contains('h3', 'Haulier details').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          expect(count).to.deep.equal(expectedDetails['haulier-details'].enrichmentCount);
        });
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['haulier-details'].haulier);
        });
      });

      cy.contains('h3', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h3', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });

      cy.contains('h4', 'SR-200').nextAll().within((elements) => {
        cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
          expect(expectedDetails.Selectors[0]).to.deep.equal(actualGroupDetails);
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

  it('Should verify task version details of RoRo-unaccompanied with only trailer task on task details page', () => {
    let date = new Date();
    const expectedDetails = {
      'Trailer registration number': 'GB07GYT',
      'Trailer type': 'SUV',
      'Trailer country of registration': 'DK',
      'Empty or loaded': 'Unknown',
      'Trailer length': 'Unknown',
      'Trailer height': 'Unknown',
    };
    cy.fixture('RoRo-Unaccompanied-Trailer-only.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-VERSION-DETAILS`).then((response) => {
        cy.wait(4000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(2000);
    cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').should('equal', 'true');
    cy.expandTaskDetails(0);

    cy.contains('h3', 'Trailer').nextAll().within((elements) => {
      cy.getVehicleDetails(elements).then((details) => {
        expect(details).to.deep.equal(expectedDetails);
      });
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
      cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.contains('h3', 'Account details').nextAll().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.account);
        });
      });

      cy.contains('h3', 'Haulier details').nextAll().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.haulier);
        });
      });

      // cy.contains('h3', 'Occupants').nextAll().within(() => {
      //   cy.getOccupantCounts().then((details) => {
      //     expect(details).to.deep.equal(expectedDetails['occupant-count']);
      //   });
      // });

      const obj = {};
      cy.contains('h3', 'Occupants').nextAll().within(() => {
        cy.get('.govuk-grid-row:not(.enrichment-counts)').each((item) => {
          cy.wrap(item).find('.govuk-grid-column-full').each((detail) => {
            cy.wrap(detail).find('.font__light').invoke('text').then((key) => {
              cy.wrap(detail).find('.font__light').nextAll().invoke('text')
                .then((value) => {
                  obj[key] = value;
                });
            });
          });
        }).then(() => {
          expect(obj).to.deep.equal(expectedDetails.driver);
        });
      });

      cy.contains('h3', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h3', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });
    });
  });

  it('Should verify task version details of tourist task on task details page', () => {
    cy.fixture('RoRo-Tourist-2-passengers.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = Cypress.dayjs('2022-03-27T10:00:00.000Z').valueOf();
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
      cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          console.log(count);
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
                console.log(count);
                expect(count).to.deep.equal(expectedDetails['Occupant-EnrichmentCount'][index]);
              });
            });
          });

          cy.get('.govuk-hidden-passengers').find('.enrichment-counts').within((elements) => {
            cy.getEnrichmentCounts(elements).then((count) => {
              console.log(count);
              expect(count).to.deep.equal(expectedDetails['Occupant-hiddenPassenger']);
            });
          });
          cy.getOccupantDetails().then((actualoccupantDetails) => {
            console.log(actualoccupantDetails);
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

  it('Should verify task version details of accompanied task with 2 passengers on task details page', () => {
    let date = new Date();
    cy.fixture('RoRo-Freight-Accompanied.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = Cypress.dayjs('2022-03-27T10:00:00.000Z').valueOf();
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
      cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          console.log(count);
          expect(count).to.deep.equal(expectedDetails['vehicle-details'].enrichmentCount);
        });
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails['vehicle-details'].vehicle);
        });
      });

      cy.contains('h3', 'Account details').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          console.log(count);
          expect(count).to.deep.equal(expectedDetails['account-details'].enrichmentCount);
        });
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['account-details'].account);
        });
      });

      cy.contains('h3', 'Haulier details').nextAll().within((elements) => {
        cy.getEnrichmentCounts(elements).then((count) => {
          console.log(count);
          expect(count).to.deep.equal(expectedDetails['haulier-details'].enrichmentCount);
        });
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['haulier-details'].haulier);
        });
      });

      cy.get('[id$=-content-1]').within(() => {
        cy.get('.govuk-task-details-col-3').within(() => {
          cy.get('.task-details-container').each((occupant, index) => {
            cy.wrap(occupant).find('.enrichment-counts').within((elements) => {
              cy.getEnrichmentCounts(elements).then((count) => {
                console.log(count);
                expect(count).to.deep.equal(expectedDetails['Occupant-EnrichmentCount'][index]);
              });
            });
          });

          cy.get('.govuk-hidden-passengers').find('.enrichment-counts').within((elements) => {
            cy.getEnrichmentCounts(elements).then((count) => {
              console.log(count);
              expect(count).to.deep.equal(expectedDetails['Occupant-hiddenPassenger']);
            });
          });
          cy.getOccupantDetails().then((actualoccupantDetails) => {
            console.log(actualoccupantDetails);
            expect(actualoccupantDetails).to.deep.equal(expectedDetails.Occupants);
          });
        });
      });

      cy.contains('h3', 'Goods').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails.goods);
        });
      });

      cy.contains('h3', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });

      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });

      cy.contains('h2', 'Rules matched').nextAll(() => {
        cy.getAllRuleMatches().then((actualRuleMatches) => {
          expect(actualRuleMatches).to.deep.equal(expectedDetails.rules);
        });
      });
    });
  });

  it('Should verify single task created for the same target with different versions when payloads sent with delay', () => {
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-different-versions-task_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;
    const expectedAutoExpandStatus = [
      'false',
      'false',
      'false',
    ];

    let arrivalTime = Cypress.dayjs().subtract(3, 'year').valueOf();
    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v2.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v3.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null).then((response) => {
        cy.wait(15000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.getAllProcessInstanceId(`${response.businessKey}`).then((res) => {
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

    cy.visit('/tasks');

    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);

    cy.verifyTaskHasUpdated(businessKey, 'Updated');
  });

  it('Should verify task details on each version retained', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-different-versions-task_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.visit(`/tasks/${businessKeys[0]}`);
      cy.wait(3000);
    }).then(() => {
      // COP-8997 Verify Task version details are not changed after clicking on cancel button
      cy.fixture('task-details-versions.json').then((expectedDetails) => {
        cy.verifyTaskDetailAllSections(expectedDetails.versions[0], 1);
        cy.get('[id$=-content-1]').within(() => {
          cy.contains('h4', 'SR-200').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-3'][0]).to.deep.equal(actualGroupDetails);
            });
          });

          cy.contains('h4', 'SR-215').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-3'][1]).to.deep.equal(actualGroupDetails);
            });
          });

          cy.contains('h4', 'SR-227').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-3'][2]).to.deep.equal(actualGroupDetails);
            });
          });
        });
      });
      cy.get('p.govuk-body').eq(0).invoke('text').then((assignee) => {
        if (assignee.includes('Task not assigned')) {
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
        cy.expandTaskDetails(2);

        cy.get('[id$=-content-3]').within(() => {
          cy.contains('h4', 'SR-215').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-1'][0]).to.deep.equal(actualGroupDetails);
            });
          });

          cy.contains('h4', 'SR-227').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-1'][1]).to.deep.equal(actualGroupDetails);
            });
          });

          cy.contains('h4', 'null').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-1'][2]).to.deep.equal(actualGroupDetails);
            });
          });

          cy.contains('h4', 'SR-200').nextAll().within((elements) => {
            cy.getSelectorGroupInformation(elements).then((actualGroupDetails) => {
              console.log(actualGroupDetails);
              expect(expectedDetails['Selectors-version-1'][3]).to.deep.equal(actualGroupDetails);
            });
          });
        });
      });
    });
  });

  it('Should verify difference between versions displayed on task details page', () => {
    const firstVersionIndex = 2;
    const versionDiff = [
      '33 changes in this version',
      '10 changes in this version',
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
      cy.wrap(element).find('.task-versions--right .govuk-list li').eq(0).invoke('text')
        .then((value) => {
          expect(versionDiff[index]).to.be.equal(value);
        });

      if (index !== firstVersionIndex) {
        cy.getTaskVersionDetailsDifferenceWithOccupants(element, index).then((differences) => {
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
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-No-Delay_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    let tasks = [];

    let arrivalTime = Cypress.dayjs().subtract(3, 'year').valueOf();

    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('RoRo-task-v2.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.fixture('RoRo-task-v3.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.businessKey = businessKey;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      tasks.push(task);
    });

    cy.postTasksInParallel(tasks).then((response) => {
      cy.wait(20000);
      cy.checkTaskDisplayed(`${response.businessKey}`);
      cy.getAllProcessInstanceId(`${response.businessKey}`).then((res) => {
        expect(res.body.length).to.not.equal(0);
        expect(res.body.length).to.equal(1);
      });
    });
    cy.get('.govuk-accordion__section-heading').should('have.length', 3);

    cy.fixture('expected-risk-indicators-versions.json').as('expectedRiskIndicatorMatches');

    cy.get('.govuk-accordion__open-all').invoke('text').then(($text) => {
      if ($text === 'Close all') {
        cy.get('.govuk-accordion__open-all').click();
      }
    });

    for (let index = 3; index > 0; index -= 1) {
      cy.get(`[id$=-content-${index}]`).within(() => {
        cy.get('.govuk-rules-section').within(() => {
          cy.get('table').each((table, indexOfRisk) => {
            cy.wrap(table).getTable().then((tableData) => {
              cy.get('@expectedRiskIndicatorMatches').then((expectedData) => {
                expectedData[`riskIndicatorsV-${index}`][indexOfRisk].forEach((taskItem) => expect(tableData).to.deep.include(taskItem));
              });
            });
          });
        });
      });
    }

    cy.visit('/tasks');

    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);

    cy.verifyTaskHasUpdated(businessKey, 'Updated');
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

  it('Should verify single task created for the same target with different versions with different passengers information', () => {
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-passenger-info_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;
    let departureDateTime;
    const dateFormat = 'D MMM YYYY [at] HH:mm';
    let arrivalDataTime = Cypress.dayjs().subtract(3, 'year').format(dateFormat);

    let arrivalTime = Cypress.dayjs().subtract(3, 'year').valueOf();
    cy.fixture('/task-version-passenger/RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.scheduledDepartureTimestamp = Cypress.dayjs().add(15, 'day').valueOf();
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualDepartureTimestamp = Cypress.dayjs().add(15, 'day').valueOf();
      task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime = Cypress.dayjs().subtract(2, 'day').format('YYYY-MM-DDThh:mm:ss');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('/task-version-passenger/RoRo-task-v2.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.scheduledDepartureTimestamp = Cypress.dayjs().add(2, 'month').valueOf();
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualDepartureTimestamp = Cypress.dayjs().add(2, 'day').valueOf();
      task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime = Cypress.dayjs().subtract(1, 'day').format('YYYY-MM-DDThh:mm:ss');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('/task-version-passenger/RoRo-task-v3.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      departureDateTime = Cypress.dayjs().add(13, 'day').valueOf();
      task.variables.rbtPayload.value.data.movement.voyage.voyage.scheduledDepartureTimestamp = departureDateTime;
      departureDateTime = Cypress.dayjs(departureDateTime).format(dateFormat);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualDepartureTimestamp = Cypress.dayjs().add(13, 'day').valueOf();
      task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime = Cypress.dayjs().format('YYYY-MM-DDThh:mm:ss');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null).then((response) => {
        cy.wait(15000);
        cy.checkTaskDisplayed(`${response.businessKey}`);
        cy.getAllProcessInstanceId(`${response.businessKey}`).then((res) => {
          expect(res.body.length).to.not.equal(0);
          expect(res.body.length).to.equal(1);
        });

        // COP-9368 Latest departure date/time should be displayed in UI for tasks with multiple versions
        let expectedTaskSummary = {
          'Ferry': 'DFDS voyage of DOVER SEAWAYS',
          'Departure': `${departureDateTime}   DOV`,
          'Arrival': `CAL      ${arrivalDataTime}`,
          'vehicle': 'Vehicle with TrailerGB09KLT-10685 with NL-234-392 driven by Bobby Brownshoes',
          'Account': 'Arrival 3 years ago',
        };

        cy.checkTaskSummaryDetails().then((taskSummary) => {
          expect(taskSummary).to.deep.equal(expectedTaskSummary);
        });
      });
    });

    cy.get('.govuk-accordion__section-heading').should('have.length', 3);

    cy.visit('/tasks');

    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);

    cy.verifyTaskHasUpdated(businessKey, 'Updated');
  });

  // COP-8934 two versions have passenger details and one version doesn't have passenger details
  it.skip('Should verify passenger details on different version on task details page', () => {
    cy.getBusinessKey('-RORO-Accompanied-Freight-passenger-info_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.checkTaskDisplayed(businessKeys[0]);

      cy.get('[id$=-content-2]').within(() => {
        cy.contains('h2', 'Passengers').should('not.exist');
      });

      cy.fixture('passenger-details.json').then((expectedDetails) => {
        cy.verifyTaskDetailSection(expectedDetails.passengers, 1, 'Passengers');

        cy.verifyTaskDetailSection(expectedDetails.passengers, 3, 'Passengers');
      });
    });
  });

  // COP-6905 Scenario-2 to COP-10194 change in target indicators triggers new version
  it('Should verify new version created for a task when the attribute for the target indicators in the payload changed', () => {
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-target-indicators-same-version_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    let arrivalTime = Cypress.dayjs().subtract(3, 'year').valueOf();
    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v1-target-update.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
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
    cy.expandTaskDetails(0);

    const expectedDetails = {
      'Total Score': '20',
      'Total Indicators': '1',
      'indicators': {
        'Quick turnaround tourist (24-72 hours)': '20',
      },
    };

    cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
      cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
        cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
          expect(numberOfIndicators).to.be.equal(expectedDetails['Total Indicators']);
        });
        cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
          expect(totalScore).to.be.equal(expectedDetails['Total Score']);
        });
      });

      cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
        cy.getTargetIndicatorDetails().then((details) => {
          delete details.Indicator;
          expect(details).to.deep.equal(expectedDetails.indicators);
        });
      });
    });

    cy.visit('/tasks');

    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);

    const nextPage = 'a[data-test="next"]';
    cy.get('body').then(($el) => {
      if ($el.find(nextPage).length > 0) {
        cy.findTaskInAllThePages(businessKey, null, null).then(() => {
          cy.get('.govuk-task-list-card').contains(businessKey).closest('section').then((element) => {
            cy.wrap(element).find('.govuk-tag--updatedTarget').should('exist');
          });
        });
      } else {
        cy.findTaskInSinglePage(businessKey, null, null).then(() => {
          cy.get('.govuk-task-list-card').contains(businessKey).closest('section').then((element) => {
            cy.wrap(element).find('.govuk-tag--updatedTarget').should('exist');
          });
        });
      }
    });
  });

  // COP-6905 Scenario-3
  it('Should verify 2 versions are created for a task when the payload has different target indicators', () => {
    const businessKey = `AUTOTEST-${dateNowFormatted}-RORO-Accompanied-Freight-target-indicators-diff-version_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;
    let arrivalTime = Cypress.dayjs().subtract(3, 'year').valueOf();
    cy.fixture('RoRo-task-v1.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(30000);

    cy.fixture('RoRo-task-v1-target-update.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, null);
    });

    cy.wait(3000);

    cy.fixture('RoRo-task-v3-target-update.json').then((task) => {
      task.businessKey = businessKey;
      task.variables.rbtPayload.value.data.movementId = businessKey;
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalTime;
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

    cy.get('.govuk-accordion__section-button').eq(0).invoke('attr', 'aria-expanded').then((value) => {
      if (value !== true) {
        cy.get('.govuk-accordion__section-button').eq(0).click();
      }
    });

    const expectedDetails = {
      'Total Score': '80',
      'Total Indicators': '3',
      'indicators': {
        'UK port hop inbound': '20',
        'First use of account (Driver)': '30',
        'First time through this UK port (Trailer)': '30',
      },
    };

    cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
      cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
        cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
          expect(numberOfIndicators).to.be.equal(expectedDetails['Total Indicators']);
        });
        cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
          expect(totalScore).to.be.equal(expectedDetails['Total Score']);
        });
      });

      cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
        cy.getTargetIndicatorDetails().then((details) => {
          delete details.Indicator;
          expect(details).to.deep.equal(expectedDetails.indicators);
        });
      });
    });

    cy.visit('/tasks');

    cy.get('.govuk-checkboxes [value="RORO_ACCOMPANIED_FREIGHT"]')
      .click({ force: true });

    cy.contains('Apply filters').click();

    cy.wait(2000);

    cy.verifyTaskHasUpdated(businessKey, 'Updated');
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
      'Total Score': '4140',
      'Total Indicators': '16',
      'indicators': {
        'UK port hop inbound': '20',
        'First use of account (Driver)': '30',
        'First time through this UK port (Trailer)': '30',
        'Intelligence Received - Account': '500',
        'Intelligence Received - Consignee': '500',
        'Intelligence Received - Consignor': '500',
        'Intelligence Received - Driver': '500',
        'Intelligence Received - Haulier': '500',
        'Intelligence Received - Passenger': '500',
        'Intelligence Received - Trailer': '500',
        'Intelligence Received - Vehicle': '500',
        'Empty trailer': '20',
        'Has previously travelled as tourist (vehicle)': '10',
        'Has previously travelled as freight (person)': '10',
        'Has previously travelled as freight (vehicle)': '10',
        'Has previously travelled as tourist (person)': '10',
      },
    };

    cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
      cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
        cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
          expect(numberOfIndicators).to.be.equal(expectedDetails['Total Indicators']);
        });
        cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
          expect(totalScore).to.be.equal(expectedDetails['Total Score']);
        });
      });

      cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
        cy.getTargetIndicatorDetails().then((details) => {
          delete details.Indicator;
          expect(details).to.deep.equal(expectedDetails.indicators);
        });
      });
    });
  });

  it('Should verify task details of RoRo-Tourist with Vehicle', () => {
    cy.getBusinessKey('-TOURIST-RBT-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.wait(4000);
      cy.checkTaskDisplayed(`${businessKeys[0]}`);
    });

    cy.fixture('tourist-task-with-vehicle-details.json').then((expectedDetails) => {
      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });

      cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });

      cy.get('[id$=-content-1]').within(() => {
        cy.get('.govuk-task-details-col-3').within(() => {
          cy.getOccupantDetails().then((actualoccupantDetails) => {
            console.log(actualoccupantDetails);
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

  it('Should verify task details of RoRo-Tourist with Single Passenger', () => {
    cy.getBusinessKey('-SINGLE-PASSENGER').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.wait(4000);
      cy.checkTaskDisplayed(`${businessKeys[0]}`);
    });

    cy.fixture('tourist-task-with-single-passenger.json').then((expectedDetails) => {
      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });

      cy.contains('h3', 'Primary Traveller').nextAll().within((elements) => {
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails['primary traveller']);
        });
      });

      cy.contains('h3', 'Document').next().within((elements) => {
        cy.getDocumentDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails.document);
        });
      });

      cy.contains('h3', 'Booking and check-in').next().within(() => {
        cy.getTaskDetails().then((details) => {
          expect(details).to.deep.equal(expectedDetails['Booking-and-check-in']);
        });
      });
    });
  });

  it('Should verify task details of RoRo-Tourist with Multiple Passenger', () => {
    cy.getBusinessKey('-MULTIPLE-PASSENGERS').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.wait(4000);
      cy.checkTaskDisplayed(`${businessKeys[0]}`);
    });

    cy.fixture('tourist-task-with-multiple-passengers.json').then((expectedDetails) => {
      cy.contains('h3', 'Targeting indicators').nextAll().within((elements) => {
        cy.wrap(elements).filter('.govuk-task-details-grid-row').eq(1).within(() => {
          cy.get('.govuk-grid-key').eq(0).invoke('text').then((numberOfIndicators) => {
            expect(numberOfIndicators).to.be.equal(expectedDetails.TargetingIndicators['Total Indicators']);
          });
          cy.get('.govuk-grid-key').eq(1).invoke('text').then((totalScore) => {
            expect(totalScore).to.be.equal(expectedDetails.TargetingIndicators['Total Score']);
          });
        });

        cy.wrap(elements).filter('.govuk-task-details-indicator-container').within(() => {
          cy.getTargetIndicatorDetails().then((details) => {
            delete details.Indicator;
            expect(details).to.deep.equal(expectedDetails.TargetingIndicators.indicators);
          });
        });
      });

      cy.contains('h3', 'Document').next().within((elements) => {
        cy.getDocumentDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails.Document);
        });
      });

      cy.get('[id$=-content-1]').within(() => {
        cy.get('.govuk-task-details-col-3').within(() => {
          cy.contains('h3', 'Other travellers').next().within((elements) => {
            const occupantArray = [];
            cy.wrap(elements).each((occupant) => {
              cy.wrap(occupant).find('.govuk-grid-row:not(.enrichment-counts)').each((item) => {
                let obj = {};
                cy.wrap(item).find('.govuk-grid-column-full').each((detail) => {
                  cy.wrap(detail).find('.font__light').invoke('text').then((key) => {
                    cy.wrap(detail).find('.font__light').nextAll().invoke('text')
                      .then((value) => {
                        obj[key] = value;
                      });
                  });
                }).then(() => {
                  occupantArray.push(obj);
                });
              });
            }).then(() => {
              expect(occupantArray).to.deep.equal(expectedDetails.Occupants);
            });
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

  it('Should verify task Display highest threat level in task details', () => {
    const highestThreatLevel = [
      'Category C',
      'Tier 1',
      'Category A',
    ];

    cy.getBusinessKey('RORO-Accompanied-Freight-passenger-info_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.wait(4000);
      cy.checkTaskDisplayed(`${businessKeys[0]}`);
    });

    // COP-9672 Display highest threat level in task details
    cy.get('.task-versions .govuk-accordion__section').each((element, index) => {
      cy.wrap(element).find('.task-versions--right .govuk-list li span.govuk-tag--positiveTarget').invoke('text').then((value) => {
        expect(highestThreatLevel[index]).to.be.equal(value);
      });
    });
  });

  it('Should verify the Risk Score for a task with 2 Target Indicators', () => {
    // COP-9051
    cy.getBusinessKey('-RORO-Accompanied-Freight-target-indicators-same-version_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`, 'RORO_ACCOMPANIED_FREIGHT').then((taskListDetails) => {
        console.log(taskListDetails);
        expect('Risk Score: 20').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Task with multiple versions', () => {
    // COP-9051 The aggregated score is for the TIs in the latest version and does NOT include the score for TIs in previous 2 versions
    cy.getBusinessKey('-RORO-Accompanied-Freight-target-indicators-diff-version_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`, 'RORO_ACCOMPANIED_FREIGHT').then((taskListDetails) => {
        expect('Risk Score: 80').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Task with 16 TIs displays the correct aggregated score', () => {
    // COP-9051
    cy.getBusinessKey('-Target-Indicators-Details').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`, 'RORO_ACCOMPANIED_FREIGHT').then((taskListDetails) => {
        expect('Risk Score: 4140').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify the Risk Score for Tasks without TIs present are not displaying a score/value', () => {
    // COP-9051
    cy.getBusinessKey('-RORO-Unaccompanied-Freight-RoRo-UNACC-SBT_').then((businessKeys) => {
      expect(businessKeys.length).to.not.equal(0);
      cy.verifyTaskListInfo(`${businessKeys[0]}`, 'RORO_UNACCOMPANIED_FREIGHT').then((taskListDetails) => {
        expect('Risk Score: 0').to.deep.equal(taskListDetails.riskScore);
      });
    });
  });

  it('Should verify datetime of the latest version when new version is not created', () => {
    let date = new Date();
    let businessKey;

    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((task) => {
      date.setDate(date.getDate() + 8);
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-VERSION-DETAILS`).then((response) => {
        cy.wait(4000);
        businessKey = response.businessKey;
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(60000);

    let updateDateTime;
    const dateFormat = 'D MMM YYYY [at] HH:mm';
    console.log('updateDateTime', updateDateTime);
    cy.fixture('RoRo-Unaccompanied-RBT-SBT.json').then((reListTask) => {
      date.setDate(date.getDate() + 8);
      reListTask.businessKey = businessKey;
      reListTask.variables.rbtPayload.value.data.movementId = businessKey;
      reListTask.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
      reListTask.variables.rbtPayload.value = JSON.stringify(reListTask.variables.rbtPayload.value);
      cy.postTasks(reListTask, null).then((taskResponse) => {
        cy.wait(10000);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
        updateDateTime = Cypress.dayjs().format(dateFormat);
        cy.get('.task-versions--left .govuk-caption-m').eq(0).should('have.text', updateDateTime);
      });
    });
  });

  it('Should verify datetime of the update is displayed in the version header when new version is created', () => {
    let date = new Date();
    let businessKey;

    const dateFormat = 'D MMM YYYY [at] HH:mm';
    let arrivalDataTime = Cypress.dayjs().add(3, 'day').valueOf();

    cy.fixture('RoRo-Tourist-2-passengers.json').then((task) => {
      task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalDataTime;
      let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
      task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
      cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-VERSION-DETAILS`).then((response) => {
        cy.wait(4000);
        businessKey = response.businessKey;
        cy.checkTaskDisplayed(`${response.businessKey}`);
      });
    });

    cy.wait(120000);
    let updateDateTime;
    updateDateTime = Cypress.dayjs().format(dateFormat);
    cy.fixture('RoRo-Tourist-2-passengers.json').then((reListTask) => {
      date.setDate(date.getDate() + 8);
      reListTask.businessKey = businessKey;
      reListTask.variables.rbtPayload.value.data.movementId = businessKey;
      reListTask.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = arrivalDataTime;
      reListTask.variables.rbtPayload.value.data.movement.persons[1].person.gender = 'M';
      reListTask.variables.rbtPayload.value = JSON.stringify(reListTask.variables.rbtPayload.value);
      cy.postTasks(reListTask, null).then((taskResponse) => {
        cy.wait(10000);
        updateDateTime = Cypress.dayjs().format(dateFormat);
        cy.checkTaskDisplayed(`${taskResponse.businessKey}`);
        cy.get('.task-versions--left .govuk-caption-m').eq(0).should('have.text', updateDateTime);
        cy.get('.task-versions--left .govuk-caption-m').eq(1).invoke('text').then((value) => {
          let version2 = Cypress.dayjs(updateDateTime, dateFormat);
          let version1 = Cypress.dayjs(value, dateFormat);
          let diff = version2.diff(version1, 'minute');
          expect(diff).to.be.greaterThan(1);
        });

        cy.wait(10000);

        cy.visit('/tasks');

        cy.contains('Clear all filters').click();

        cy.get('.govuk-checkboxes [value="RORO_TOURIST"]')
          .click({ force: true });

        cy.contains('Apply filters').click({ force: true });

        cy.wait(2000);

        cy.verifyTaskHasUpdated(taskResponse.businessKey, 'Updated');
      });
    });
  });

  after(() => {
    cy.deleteAutomationTestData();
    cy.contains('Sign out').click();
    cy.url().should('include', Cypress.env('auth_realm'));
  });
});
