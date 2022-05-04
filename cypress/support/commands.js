import 'cypress-keycloak-commands';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import config from '../../src/config';

const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', { relativeTime: config.dayjsConfig.relativeTime });

let token;

const cerberusServiceUrl = Cypress.env('cerberusServiceUrl');
const realm = Cypress.env('auth_realm');
const formioComponent = '.formio-component-';
const formioErrorText = '.govuk-error-message > div';
const displayDate24Format = 'DD-MM-YYYY HH:mm';

Cypress.Commands.add('login', (userName) => {
  cy.kcLogout();
  cy.kcLogin(userName).as('tokens');
  cy.intercept('POST', `/auth/realms/${realm}/protocol/openid-connect/token`).as('token');
  cy.visit('/');
  cy.wait('@token').then(({ response }) => {
    token = response.body.access_token;
  });
});

Cypress.Commands.add('navigation', (option) => {
  cy.contains('a', option).click();
});

Cypress.Commands.add('waitForTaskManagementPageToLoad', () => {
  cy.intercept('POST', '/camunda/v1/targeting-tasks/pages').as('tasks');

  cy.wait('@tasks').then(({ response }) => {
    expect(response.statusCode).to.equal(200);
  });
});

Cypress.Commands.add('getUnassignedTasks', () => {
  const authorization = `bearer ${token}`;

  const options = {
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/task?processVariables=processState_neq_Complete&unassigned=true`,
    headers: {
      authorization,
    },
  };

  cy.request(options).then((response) => {
    console.log(response.body);
    return response.body.filter((item) => item.assignee === null);
  });
});

Cypress.Commands.add('getTasksAssignedToOtherUsers', () => {
  const authorization = `bearer ${token}`;
  const options = {
    method: 'GET',
    url: '/camunda/engine-rest/task?**',
    headers: {
      authorization,
    },
  };

  cy.request(options).then((response) => {
    return response.body.filter((item) => (item.assignee !== 'cypressuser-cerberus@lodev.xyz' && item.assignee !== null));
  });
});

Cypress.Commands.add('getTasksAssignedToSpecificUser', (user) => {
  const authorization = `bearer ${token}`;
  const options = {
    method: 'GET',
    url: '/camunda/engine-rest/task?**',
    headers: {
      authorization,
    },
  };

  cy.request(options).then((response) => {
    return response.body.filter((item) => (item.assignee === user));
  });
});

Cypress.Commands.add('getTasksAssignedToMe', () => {
  const authorization = `bearer ${token}`;
  const options = {
    method: 'GET',
    url: '/camunda/engine-rest/task?**',
    headers: {
      authorization,
    },
  };

  cy.request(options).then((response) => {
    return response.body.filter((item) => item.assignee === 'cypressuser-cerberus@lodev.xyz');
  });
});

Cypress.Commands.add('claimTask', () => {
  cy.intercept('POST', '/camunda/engine-rest/task/*/claim').as('claim');
  cy.get('h4.task-heading').eq(0).invoke('text').then((text) => {
    cy.get('.govuk-task-list-card a').eq(0).click();
    cy.get('.govuk-caption-xl').invoke('text').then((taskTitle) => {
      expect(text).to.contain(taskTitle);
    });
    cy.get('p.govuk-body').eq(0).should('contain.text', 'Task not assigned');
    cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();
  });

  cy.wait('@claim').then(({ response }) => {
    expect(response.statusCode).to.equal(204);
  });

  cy.wait(2000);

  cy.contains('Back to task list').click();
});

Cypress.Commands.add('selectCheckBox', (elementName, value) => {
  if (value !== undefined && value !== '') {
    cy.get(`${formioComponent}${elementName}`)
      .should('be.visible')
      .contains(new RegExp(`^${value}$`, 'g'))
      .closest('div')
      .find('input')
      .click();
  }
});

Cypress.Commands.add('verifySelectedCheckBox', (elementName, values) => {
  for (let value of values) {
    cy.get(`${formioComponent}${elementName}`)
      .contains(new RegExp(`^${value}$`, 'g'))
      .closest('div')
      .find('input')
      .should('be.checked');
  }
});

Cypress.Commands.add('clickNext', () => {
  cy.get('button[ref$="next"]').should('be.enabled');
  cy.wait(1000);
  cy.get('button[ref$="next"]').click();
});

Cypress.Commands.add('typeValueInTextArea', (elementName, value) => {
  if (value !== undefined && value !== '') {
    cy.get(`${formioComponent}${elementName} textarea`)
      .should('be.visible')
      .type(value, { force: true });
  }
});

Cypress.Commands.add('clickSubmit', () => {
  cy.get('button[ref$="submit"]').should('be.enabled');
  cy.wait(1000);
  cy.get('button[ref$="submit"]').click();
});

Cypress.Commands.add('verifySuccessfulSubmissionHeader', (value) => {
  cy.get('.govuk-panel--confirmation h1')
    .should('be.visible')
    .and('have.text', value);
});

function findItem(taskName, action, taskdetails) {
  function findInPage(count) {
    let found = false;

    cy.get('.pagination').invoke('attr', 'aria-label').as('pages');

    cy.get('@pages').then((pages) => {
      let page = pages.match(/\d/g).join('');
      if (count >= page) {
        return false;
      }
      if (count > 0) {
        cy.contains('Next').click();
        cy.wait(1000);
      }
      cy.get('.govuk-task-list-card').each((item) => {
        if (action === null) {
          cy.wrap(item).find('h4.task-heading').invoke('text').then((text) => {
            cy.log('task text', text);
            cy.log('inside multiple pages');
            if (text.includes(taskName)) {
              if (taskdetails !== null) {
                cy.verifyTaskManagementPage(item, taskdetails);
              }
              found = true;
            }
          });
        } else {
          cy.wrap(item).find('h4.task-heading').invoke('text').then((text) => {
            if (text.includes(taskName)) {
              cy.wait(2000);
              cy.contains(action).click();
              found = true;
            }
          });
        }
      }).then(() => {
        if (!found) {
          findInPage(count += 1);
        } else {
          return found;
        }
      });
    });
  }
  findInPage(0);
}

Cypress.Commands.add('findTaskInAllThePages', (taskName, action, taskdetails) => {
  return findItem(taskName, action, taskdetails);
});

function getNumberOfTasksInPage() {
  function getCount(count) {
    cy.get('.pagination').invoke('attr', 'aria-label').as('pages');
    cy.get('@pages').then((pages) => {
      let page = pages.match(/\d/g).join('');
      if (count >= page) {
        return false;
      }
      if (count > 0) {
        cy.contains('Next').click();
        cy.wait(1000);
      }
      cy.get('.govuk-task-list-card').then((numberOfTasks) => {
        expect(numberOfTasks.length).lte(100);
      }).then(() => {
        getCount(count += 1);
      });
    });
  }
  getCount(0);
}

Cypress.Commands.add('findNumberOfTasksInPage', () => {
  return getNumberOfTasksInPage();
});

Cypress.Commands.add('verifyTaskManagementPage', (item, taskdetails) => {
  cy.wrap(item).parents('.govuk-tabs__panel').then((element) => {
    cy.wrap(element).invoke('attr', 'id').then((value) => {
      cy.wrap(item).find('.claim-button-container').then((taskElement) => {
        if (value === 'inProgress') {
          cy.wrap(taskElement).find('.task-list--email').invoke('text').then((assignee) => {
            expect(assignee).to.equal(taskdetails);
          });
        } else if (value === 'new') {
          if (taskdetails.risk != null) {
            cy.wrap(item).find('.task-risk-statement').invoke('text').then((risk) => {
              expect(risk).to.equal(taskdetails.risk);
            });
          }
          if (taskdetails.riskTier != null) {
            cy.wrap(item).find('.govuk-tag--riskTier').invoke('text').then((riskTier) => {
              expect(riskTier).to.equal(taskdetails.riskTier);
            });
            if (taskdetails.riskTier === 'B') {
              cy.wrap(item).find('.govuk-tag--riskTier').then((elem) => {
                cy.wrap(elem).prev('.govuk-body').should('contains.text', 'SELECTOR');
              });
            }
          }
          if (taskdetails.selector != null) {
            cy.wrap(item).find('.task-highest-risk .govuk-body').invoke('text').then((selector) => {
              expect(selector).to.equal(taskdetails.selector);
            });
          }
        }
      });
    });
  });
});

Cypress.Commands.add('verifyMandatoryErrorMessage', (element, errorText) => {
  cy.get(`${formioComponent}${element} ${formioErrorText}`)
    .should('be.visible')
    .contains(errorText);
});

Cypress.Commands.add('postTasks', (task, name) => {
  if (name !== null) {
    const businessKey = `${name}_${Math.floor((Math.random() * 1000000) + 1)}:CMID=TEST`;

    task.variables.rbtPayload.value = JSON.parse(task.variables.rbtPayload.value);

    task.businessKey = businessKey;

    task.variables.rbtPayload.value.data.movementId = businessKey;

    task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
  }

  cy.request({
    method: 'POST',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-definition/key/raiseMovement/start`,
    headers: { Authorization: `Bearer ${token}` },
    body: task,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.businessKey).to.eq((task.businessKey).replace(/\//g, '_'));
    return response.body;
  });
});

Cypress.Commands.add('postTasksInParallel', (tasks) => {
  tasks.map((task) => {
    cy.request({
      method: 'POST',
      url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-definition/key/raiseMovement/start`,
      headers: { Authorization: `Bearer ${token}` },
      body: task,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.businessKey).to.eq(task.businessKey);
      return response.body;
    });
  });
});

Cypress.Commands.add('selectDropDownValue', (elementName, value) => {
  cy.get(`${formioComponent}${elementName}${formioComponent}select div.form-control`)
    .should('be.visible')
    .click();
  cy.get(`${formioComponent}${elementName} div[role='listbox']`)
    .contains(value)
    .click({ force: true });
});

Cypress.Commands.add('typeTodaysDateTime', (elementName) => {
  let dateNow = new Date();
  let dateNowFormatted = Cypress.dayjs(dateNow).format(displayDate24Format);

  let dateTime = Cypress.dayjs(dateNowFormatted, displayDate24Format);

  cy.get(`${formioComponent}${elementName}`)
    .should('be.visible')
    .within(() => {
      cy.get(`#${elementName}-day`).clear().type(dateTime.format('D'));
      cy.get(`#${elementName}-month`).clear().type(dateTime.format('MM'));
      cy.get(`#${elementName}-year`).clear().type(dateTime.format('YYYY'));
      cy.get(`#${elementName}-hour`).clear().type(dateTime.format('HH'));
      cy.get(`#${elementName}-minute`).clear().type(dateTime.format('mm'));
    });
});

Cypress.Commands.add('selectRadioButton', (elementName, value) => {
  cy.get(`${formioComponent}${elementName} .govuk-radios`)
    .contains(value)
    .closest('div')
    .find('input')
    .click({ force: true });
});

Cypress.Commands.add('getProcessInstanceId', (businessKey) => {
  cy.request({
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/task?processInstanceBusinessKey=${businessKey}`,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body[0].processInstanceId;
  });
});

Cypress.Commands.add('getAllProcessInstanceId', (businessKey) => {
  cy.request({
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/task?processInstanceBusinessKey=${businessKey}`,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response);
    console.log(response.body);
    return response;
  });
});

Cypress.Commands.add('checkTaskDisplayed', (businessKey) => {
  cy.visit(`/tasks/${businessKey}`);
  cy.get('.govuk-caption-xl').should('have.text', businessKey);
});

Cypress.Commands.add('waitForNoErrors', () => {
  cy.get(formioErrorText).should('not.exist');
});

Cypress.Commands.add('typeValueInTextField', (elementName, value) => {
  cy.get(`${formioComponent}textfield${formioComponent}${elementName} input`)

    .should('be.visible')
    .clear()
    .type(value);
});

Cypress.Commands.add('findTaskInSinglePage', (taskName, action, taskdetails) => {
  let found = false;
  cy.get('.govuk-task-list-card').each((item) => {
    if (action === null) {
      cy.wrap(item).find('h4.task-heading').invoke('text').then((text) => {
        cy.log('task text', text);
        cy.log('inside Single pages');
        if (text.includes(taskName)) {
          if (taskdetails !== null) {
            cy.verifyTaskManagementPage(item, taskdetails);
          }
          found = true;
        }
      });
    } else {
      cy.wrap(item).find('h4.task-heading').invoke('text').then((text) => {
        if (text.includes(taskName)) {
          cy.wait(2000);
          cy.contains(action).click();
          found = true;
        }
      });
    }
  }).then(() => {
    return found;
  });
});

Cypress.Commands.add('getTasksByBusinessKey', (businessKey) => {
  cy.request({
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/task?processInstanceBusinessKey=${businessKey}`,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body.filter((item) => item.assignee === null && item.name === 'Develop the task');
  });
});

Cypress.Commands.add('getBusinessKeyByProcessInstanceId', (processInstanceId) => {
  cy.request({
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance/${processInstanceId}`,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body.businessKey;
  });
});

Cypress.Commands.add('getBusinessKey', (partOfTheBusinessKey) => {
  cy.request({
    method: 'POST',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance`,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      'businessKeyLike': `%${partOfTheBusinessKey}%`,
    },
  }).then((response) => {
    expect(response.status).to.equal(200);
    return response.body.map((item) => item.businessKey);
  });
});

Cypress.Commands.add('getTaskDetails', () => {
  const obj = {};
  cy.get('.govuk-task-details-grid-item').each((item) => {
    cy.wrap(item).find('span.govuk-grid-key').invoke('text').then((key) => {
      cy.wrap(item).find('.govuk-grid-value').invoke('text').then((value) => {
        obj[key] = value;
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add('getTargetIndicatorDetails', () => {
  const obj = {};
  cy.get('.govuk-task-details-grid-row').each((item) => {
    cy.wrap(item).find('.govuk-grid-key').invoke('text').then((key) => {
      cy.wrap(item).find('.govuk-grid-value').invoke('text').then((value) => {
        obj[key] = value;
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add(('getVehicleDetails'), (elements) => {
  const obj = {};
  cy.wrap(elements).eq(1).each((item) => {
    cy.wrap(item).find('div ul').each((detail) => {
      cy.wrap(detail).find('span.govuk-grid-key').invoke('text').then((key) => {
        cy.wrap(detail).find('.govuk-grid-value').invoke('text').then((value) => {
          obj[key] = value;
        });
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add(('getDocumentDetails'), (elements) => {
  const obj = {};
  cy.wrap(elements).each((item) => {
    cy.wrap(item).find('div ul').each((detail) => {
      cy.wrap(detail).find('span.govuk-grid-key').invoke('text').then((key) => {
        cy.wrap(detail).find('.govuk-grid-value').invoke('text').then((value) => {
          obj[key] = value;
        });
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add(('getEnrichmentCounts'), (elements) => {
  let obj = {};
  const keys = [];
  const values = [];
  cy.wrap(elements).eq(0).within(() => {
    cy.get('.labels .govuk-grid-column-one-third').each((item) => {
      cy.wrap(item).find('span.font__light').invoke('text').then((key) => {
        keys.push(key);
      });
    });
    cy.get('.values .govuk-grid-column-one-third').each((value) => {
      cy.wrap(value).find('span.font__bold').invoke('text').then((count) => {
        values.push(count);
      });
    });
  }).then(() => {
    keys.forEach((k, i) => {
      obj[k] = values[i];
    });
  })
    .then(() => {
      return obj;
    });
});

Cypress.Commands.add(('getOccupantDetails'), () => {
  const occupantArray = [];
  cy.get('.task-details-container').each((occupant) => {
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
    return occupantArray;
  });
});

Cypress.Commands.add(('getTaskVersionDetailsDifferenceWithOccupants'), (version, index) => {
  let valueLocator = '.font__bold .task-versions--highlight';
  let difference = {};
  cy.expandTaskDetails(index).then(() => {
    cy.wrap(version).find('.task-versions--highlight').each((item) => {
      cy.wrap(item).parent().then((valueElement) => {
        if (valueElement.find(valueLocator).length > 0) {
          cy.wrap(item).invoke('text').then((key) => {
            cy.wrap(valueElement).find(valueLocator).invoke('text').then((value) => {
              if (key in difference) {
                if (`${key}-dup` in difference) {
                  difference[`${key}-dup-${1}`] = value;
                } else {
                  difference[`${key}-dup`] = value;
                }
              } else {
                difference[key] = value;
              }
            });
          });
        } else {
          cy.wrap(item).invoke('text').then((key) => {
            if (key in difference) {
              if (`${key}-dup` in difference) {
                difference[`${key}-dup-${1}`] = '';
              } else {
                difference[`${key}-dup`] = '';
              }
            } else {
              difference[key] = '';
            }
          });
        }
      });
    });
  }).then(() => {
    console.log(difference);
    return difference;
  });
});

Cypress.Commands.add(('getOccupantCounts'), () => {
  const obj = {};
  cy.get('.task-details-container').eq(1).within(() => {
    cy.get('.govuk-task-details-grid-row').each((item) => {
      cy.wrap(item).find('ul').each((detail) => {
        cy.wrap(detail).find('li.govuk-grid-value').invoke('text').then((key) => {
          cy.wrap(detail).next().invoke('text').then((value) => {
            obj[key] = value;
          });
        });
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add('expandTaskDetails', (versionNumber) => {
  cy.get('.govuk-accordion__section-button').eq(versionNumber).invoke('attr', 'aria-expanded').then((value) => {
    if (value === 'false') {
      cy.get('.govuk-accordion__section-button').eq(versionNumber).click();
    }
  });
});

Cypress.Commands.add('collapseTaskDetails', () => {
  cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').then((value) => {
    if (value === 'true') {
      cy.get('.govuk-accordion__section-button').click();
    }
  });
});

Cypress.Commands.add('navigateToTaskDetailsPage', (task) => {
  const processInstanceId = task.map((item) => item.processInstanceId);
  expect(processInstanceId.length).to.not.equal(0);
  cy.intercept('GET', `/camunda/engine-rest/task?processInstanceId=${processInstanceId[0]}`).as('tasksDetails');
  cy.getBusinessKeyByProcessInstanceId(processInstanceId[0]).then((businessKey) => {
    cy.visit(`/tasks/${businessKey}`);
    cy.wait('@tasksDetails').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
  });
});

Cypress.Commands.add('assignToOtherUser', (task) => {
  const processInstanceId = task.map((item) => item.processInstanceId);
  cy.request({
    method: 'GET',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/task?processInstanceId=${processInstanceId}`,
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    expect(res.status).to.eq(200);
    let taskId = res.body[0].id;
    cy.request({
      method: 'POST',
      url: `https://${cerberusServiceUrl}/camunda/engine-rest/task/${taskId}/assignee`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        'userId': 'boothi.palanisamy@digital.homeoffice.gov.uk',
      },
    }).then((response) => {
      expect(response.status).to.eq(204);
    });
  });
});

Cypress.Commands.add('checkTaskSummary', (registrationNumber, bookingDateTime) => {
  if (registrationNumber !== null) {
    cy.get('.card').within(() => {
      cy.get('.govuk-heading-s').should('contain.text', registrationNumber);
    });
  }
  if (bookingDateTime === 'Invalid date') {
    bookingDateTime = 'Invalid Date';
  }
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' ');
  cy.get('.task-versions .task-versions--left').should('contain.text', bookingDateTime);
  cy.get('.task-versions .task-versions--left').should('contain.text', formattedDate);
});

Cypress.Commands.add('deleteAutomationTestData', () => {
  let dateNowFormatted;
  if (Cypress.dayjs().day() === 1) {
    dateNowFormatted = Cypress.dayjs().subtract(3, 'day').format('DD-MM-YYYY');
  } else {
    dateNowFormatted = Cypress.dayjs().subtract(1, 'day').format('DD-MM-YYYY');
  }
  cy.request({
    method: 'POST',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance`,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      'businessKeyLike': `%AUTOTEST-${dateNowFormatted}-%`,
    },
  }).then((response) => {
    const processInstanceId = response.body.map((item) => item.id);
    processInstanceId.map((id) => {
      console.log(response.body);
      cy.request({
        method: 'DELETE',
        url: `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance/${id}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(204);
      });
    });
  });
  cy.request({
    method: 'POST',
    url: `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance`,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      'processInstanceBusinessKeyLike': `%AUTOTEST-${dateNowFormatted}-%`,
    },
  }).then((response) => {
    const processInstanceId = response.body.map((item) => item.id);
    processInstanceId.map((id) => {
      console.log(response.body);
      cy.request({
        method: 'DELETE',
        url: `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance/${id}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(204);
      });
    });
  });
});

Cypress.Commands.add('multiSelectDropDown', (element, values) => {
  if (values !== '') {
    cy.get(`${formioComponent}${element}`)
      .should('be.visible')
      .within(() => {
        cy.get(' .formio-choices').click({ force: true });
        cy.get('.choices__list').should('have.class', 'is-active');
        for (let value of values) {
          cy.get('div[role="listbox"]')
            .contains(value)
            .click({ force: true });
        }
      });
    cy.get(`${formioComponent}${element}`).type('{esc}');
  }
});

Cypress.Commands.add('verifyElementText', (elementName, value) => {
  cy.get(`${formioComponent}${elementName} input`).should('have.value', value);
});

Cypress.Commands.add('verifyDate', (elementName, day, month, year) => {
  cy.get(`#${elementName}-day`).should('have.value', day);
  cy.get(`#${elementName}-month`).should('have.value', month);
  cy.get(`#${elementName}-year`).should('have.value', year);
});

Cypress.Commands.add('verifyTaskSummary', (taskSummary) => {
  cy.get('.card').should('contain.text', taskSummary);
});

function getTaskSummary(businessKey) {
  let taskSummary = {};
  cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within((element) => {
    cy.wrap(element).find('.task-risk-statement').invoke('text').then((rules) => {
      taskSummary.rules = rules;
    });

    cy.wrap(element).find('.content-line-one').eq(1).then(($voyage) => {
      let value = $voyage.text();
      taskSummary.voyage = (value.split(',')[0].trim());
      taskSummary.arrival = (value.split(',')[1].trim());
    });

    cy.wrap(element).find('.content-line-two').then(($dateTime) => {
      let value = $dateTime.text();
      let departure = (value.split('-')[0].trim());
      let arrival = (value.split('-')[1].trim());
      if (departure.includes('unknown')) {
        taskSummary.departurePort = departure.slice(-7).trim();
        taskSummary.departureDateTime = departure.slice(0, departure.length - 7).trim();
      } else {
        taskSummary.departurePort = departure.slice(-3).trim();
        taskSummary.departureDateTime = departure.slice(0, departure.length - 3).trim();
      }

      if (arrival.includes('unknown')) {
        taskSummary.arrivalPort = arrival.slice(0, 7).trim();
        taskSummary.arrivalDateTime = arrival.slice(7, arrival.length).trim();
      } else {
        taskSummary.arrivalPort = arrival.slice(0, 3).trim();
        taskSummary.arrivalDateTime = arrival.slice(3, arrival.length).trim();
      }
    });

    if (businessKey.includes('Accompanied')) {
      cy.wrap(element).contains('Driver details').then((count) => {
        cy.wrap(count).find('span.govuk-\\!-margin-left-3').invoke('text').then((enrichmentCount) => {
          taskSummary.driverEnrichmentCount = enrichmentCount;
        });
      });
      cy.wrap(element).contains('Driver details').next().then((driverDetails) => {
        cy.wrap(driverDetails).find('li').each((details, index) => {
          cy.wrap(details).invoke('text').then((info) => {
            if (index === 0) {
              taskSummary.driverFirstName = info;
            } else if (index === 1) {
              taskSummary.driverLastName = info;
            } else {
              taskSummary.driverNumberOfTrips = info;
            }
          });
        });
      });

      cy.wrap(element).contains('Vehicle details').then((count) => {
        cy.wrap(count).find('span.govuk-\\!-margin-left-3').invoke('text').then((vehicleCount) => {
          taskSummary.vehicleEnrichmentCount = vehicleCount;
        });
      });

      cy.wrap(element).contains('Vehicle details').next().then((vehicleDetails) => {
        cy.wrap(vehicleDetails).find('li').each((details, index) => {
          cy.wrap(details).invoke('text').then((info) => {
            if (index === 0) {
              taskSummary.vehicleRegistration = info;
            } else if (index === 1) {
              taskSummary.vehicleMake = info;
            } else if (index === 2) {
              taskSummary.vehicleModel = info;
            } else {
              taskSummary.vehicleNumberOfTrips = info;
            }
          });
        });
      });

      cy.wrap(element).contains('Passenger details').next().then((passengerDetails) => {
        cy.wrap(passengerDetails).find('li').each((details) => {
          cy.wrap(details).invoke('text').then((info) => {
            taskSummary.passengerDetails = info;
          });
        });
      });
    }

    cy.wrap(element).contains('Account details').then((count) => {
      cy.wrap(count).find('span.govuk-\\!-margin-left-3').invoke('text').then((accountCount) => {
        taskSummary.accountEnrichmentCount = accountCount;
      });
    });

    cy.wrap(element).contains('Account details').next().then((accountDetails) => {
      cy.wrap(accountDetails).find('li').each((details, index) => {
        cy.wrap(details).invoke('text').then((info) => {
          if (index === 0) {
            taskSummary.bookedDateTime = info;
          } else {
            taskSummary.bookedDetails = info;
          }
        });
      });
    });

    cy.wrap(element).contains('Haulier details').then((count) => {
      cy.wrap(count).find('span.govuk-\\!-margin-left-3').invoke('text').then((haulierCount) => {
        taskSummary.haulierEnrichmentCount = haulierCount;
      });
    });

    cy.wrap(element).contains('Haulier details').next().then((haulierDetails) => {
      cy.wrap(haulierDetails).find('li').each((details) => {
        cy.wrap(details).invoke('text').then((info) => {
          taskSummary.haulier = info;
        });
      });
    });

    cy.wrap(element).contains('Goods description').next().then((goodsDetails) => {
      cy.wrap(goodsDetails).find('li').each((details) => {
        cy.wrap(details).invoke('text').then((info) => {
          taskSummary.goods = info;
        });
      });
    });

    if (!businessKey.includes('Unknown-Null-vehicle-regNumber')) {
      cy.wrap(element).contains('Trailer details').then((count) => {
        cy.wrap(count).find('span.govuk-\\!-margin-left-3').invoke('text').then((trailerCount) => {
          taskSummary.trailerEnrichmentCount = trailerCount;
        });
      });
    }

    cy.wrap(element).contains('Trailer details').next().then((trailerDetails) => {
      cy.wrap(trailerDetails).find('li').each((details, index) => {
        cy.wrap(details).invoke('text').then((info) => {
          if (index === 0) {
            taskSummary.trailerRegistration = info;
          } else {
            taskSummary.trailerTrips = info;
          }
        });
      });
    });

    cy.wrap(element).find('.task-labels-item strong').invoke('text').then((riskScore) => {
      taskSummary.riskScore = riskScore;
    });
  })
    .then(() => {
      return taskSummary;
    });
}

Cypress.Commands.add('verifyTaskListInfo', (businessKey, mode) => {
  const nextPage = 'a[data-test="next"]';
  cy.visit('/tasks');

  cy.get(`.govuk-checkboxes [value="${mode.toString().replace(/-/g, '_').toUpperCase()}"]`)
    .click({ force: true });

  cy.contains('Apply filters').click();
  cy.wait(2000);
  cy.get('body').then(($el) => {
    if ($el.find(nextPage).length > 0) {
      cy.findTaskInAllThePages(businessKey, null, null).then(() => {
        return getTaskSummary(businessKey);
      });
    } else {
      cy.findTaskInSinglePage(businessKey, null, null).then(() => {
        return getTaskSummary(businessKey);
      });
    }
  });
});

Cypress.Commands.add('verifyTaskDetailSection', (expData, versionInRow, sectionname) => {
  if (versionInRow == null) {
    versionInRow = 1;
  }
  cy.get(`[id$=-content-${versionInRow}]`).within(() => {
    cy.contains('h3', sectionname)
      .nextAll()
      .within(() => {
        cy.getTaskDetails()
          .then((details) => {
            expect(details)
              .to
              .deep
              .equal(expData);
          });
      });
  });
});

Cypress.Commands.add('verifyTaskDetailAllSections', (expectedDetails, versionInRow) => {
  const sectionHeading = new Map();
  sectionHeading.set('vehicle', 'Vehicle');
  sectionHeading.set('account', 'Account details');
  sectionHeading.set('haulier', 'Haulier details');
  sectionHeading.set('Occupants', 'Occupants');
  sectionHeading.set('goods', 'Goods');
  sectionHeading.set('booking', 'Booking and check-in');
  sectionHeading.set('rulesMatched', 'Rules matched');
  sectionHeading.set('selectorMatch', '1 selector matches');
  sectionHeading.set('TargetingIndicators', 'Targeting indicators');

  // close all in order to expand the correct version
  cy.get('.govuk-accordion__open-all').invoke('text').then(($text) => {
    if ($text === 'Close all') {
      cy.get('.govuk-accordion__open-all').click();
    }
  });

  // Check section in expectedDetails(Json file) is a valid section
  Object.entries(expectedDetails).forEach(([key]) => {
    let sections = Array.from(sectionHeading.keys());
    if (sectionHeading.has(key) === false && key !== 'taskListDetail' && key !== 'taskSummary') {
      throw new Error(`Section '${key}' in json file is not valid. ${sections}`);
    }
  });

  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'vehicle')) {
    cy.get(`[id$=-content-${versionInRow}]`).within(() => {
      cy.contains('h3', 'Vehicle').nextAll().within((elements) => {
        cy.getVehicleDetails(elements).then((details) => {
          expect(details).to.deep.equal(expectedDetails.vehicle);
        });
      });
    });
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'account')) {
    cy.verifyTaskDetailSection(expectedDetails.account, versionInRow, sectionHeading.get('account'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'haulier')) {
    cy.verifyTaskDetailSection(expectedDetails.haulier, versionInRow, sectionHeading.get('haulier'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'Occupants')) {
    cy.get(`[id$=-content-${versionInRow}]`).within(() => {
      cy.get('.govuk-task-details-col-3').within(() => {
        cy.getOccupantDetails().then((actualoccupantDetails) => {
          console.log('Occupant', actualoccupantDetails);
          expect(actualoccupantDetails).to.deep.equal(expectedDetails.Occupants);
        });
      });
    });
  }

  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'goods')) {
    cy.verifyTaskDetailSection(expectedDetails.goods, versionInRow, sectionHeading.get('goods'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'booking')) {
    cy.verifyTaskDetailSection(expectedDetails.booking, versionInRow, sectionHeading.get('booking'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'rulesMatched')) {
    cy.get(`[id$=-content-${versionInRow}]`).within(() => {
      cy.contains('h2', 'Rules matched').nextAll(() => {
        cy.getAllRuleMatches().then((actualRuleMatches) => {
          expect(actualRuleMatches).to.deep.equal(expectedDetails.rulesMatched);
        });
      });
    });
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'TargetingIndicators')) {
    cy.get(`[id$=-content-${versionInRow}]`).within(() => {
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
  }
});

Cypress.Commands.add('checkTaskSummaryDetails', () => {
  let taskSummary = [];
  cy.get('.summary-data-list li').each((summary, index) => {
    cy.wrap(summary).invoke('text').then((value) => {
      if (index === 2) {
        taskSummary.push(value.split('→')[0].trim());
        taskSummary.push(value.split('→')[1].trim());
      } else {
        taskSummary.push(value);
      }
    });
  }).then(() => {
    const [vehicle, Ferry, Departure, Arrival, Account] = taskSummary;
    return { vehicle, Ferry, Departure, Arrival, Account };
  });
});

Cypress.Commands.add('verifyMultiSelectDropdown', (elementName, values) => {
  cy.get(`${formioComponent}${elementName}`)
    .should('be.visible')
    .within(() => {
      cy.get('[data-item]')
        .should('be.visible')
        .should('have.length', values.length)
        .each(($div) => {
          const text = $div.text().replace('Remove item', '');
          expect(values).to.include(text);
        });
    });
});

Cypress.Commands.add('verifySelectDropdown', (elementName, values) => {
  cy.get(`${formioComponent}${elementName}${formioComponent}select div.form-control`)
    .should('be.visible').click({ force: true });
  cy.get(`${formioComponent}${elementName} div[role='listbox']`)
    .within(() => {
      cy.get('.choices__item')
        .should('be.visible')
        .should('have.length', values.length)
        .each(($div) => {
          const text = $div.text();
          expect(values).to.include(text);
        });
    });
});

Cypress.Commands.add('verifySelectedDropdownValue', (elementName, value) => {
  cy.get(`${formioComponent}${elementName} [data-item]`)
    .should('be.visible')
    .should(($div) => {
      const text = $div.text().replace('Remove item', '');
      expect(text).equal(value);
    });
});

Cypress.Commands.add('removeOptionFromMultiSelectDropdown', (elementName, values) => {
  cy.get(`${formioComponent}${elementName}`)
    .should('be.visible')
    .within(() => {
      cy.get('[data-item]')
        .should('be.visible')
        .each((element) => {
          cy.wrap(element).invoke('text').then((value) => {
            const text = value.replace('Remove item', '');
            if (values.includes(text)) {
              cy.wrap(element).find('button').click({ force: true });
            }
          });
        });
    });
});

Cypress.Commands.add('createCerberusTask', (payload, taskName) => {
  let expectedTaskSummary = {};
  let dateNowFormatted = Cypress.dayjs().format('DD-MM-YYYY');
  const dateFormat = 'D MMM YYYY [at] HH:mm';
  let taskCreationDateTime = dayjs().utc().format(dateFormat);
  cy.fixture(payload).then((task) => {
    let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
    const rndInt = Math.floor(Math.random() * 20) + 1;
    task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = Cypress.dayjs().add(rndInt, 'day').valueOf();
    let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
    if (taskName.includes('TSV')) {
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      let vehicle = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle;
      let person = task.variables.rbtPayload.value.data.movement.persons[0].person;
      let departureDateTime = Cypress.dayjs(voyage.actualDepartureTimestamp).utc().format(dateFormat);
      let arrivalDateTime = Cypress.dayjs(voyage.actualArrivalTimestamp).utc().format(dateFormat);
      let diff = Cypress.dayjs(voyage.actualArrivalTimestamp).from(Cypress.dayjs());
      expectedTaskSummary.vehicle = `Vehicle${vehicle.registrationNumber} driven by ${person.fullName}`;
      expectedTaskSummary.Ferry = `${voyage.carrier} voyage of ${voyage.craftId}`;
      expectedTaskSummary.Departure = `${departureDateTime}   ${voyage.departureLocation}`;
      expectedTaskSummary.Arrival = `${voyage.arrivalLocation}      ${arrivalDateTime}`;
      expectedTaskSummary.Account = `Arrival ${diff}`;
    }
    task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
    cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-${taskName}`).then((response) => {
      cy.wait(4000);
      cy.checkTaskDisplayed(`${response.businessKey}`);
      if (taskName.includes('TSV')) {
        cy.checkTaskSummaryDetails().then((taskSummary) => {
          expect(taskSummary).to.deep.equal(expectedTaskSummary);
        });
      }
      cy.checkTaskSummary(registrationNumber, taskCreationDateTime);
    });
  });
});

Cypress.Commands.add('getTaskCount', (modeName, selector, statusTab) => {
  let payload;
  if (modeName === null && selector !== 'any') {
    payload = [
      {
        'taskStatuses': [
          statusTab,
        ],
        'movementModes': [],
        'hasSelectors': selector,
      },
    ];
  } else if (selector === 'any') {
    payload = [
      {
        'taskStatuses': [
          statusTab,
        ],
        'movementModes': [],
        'hasSelectors': null,
      },
    ];
  } else if (modeName instanceof Array) {
    payload = [
      {
        'taskStatuses': [
          statusTab,
        ],
        'movementModes': modeName,
        'hasSelectors': selector,
      },
    ];
  } else {
    payload = [
      {
        'taskStatuses': [
          statusTab,
        ],
        'movementModes': [modeName],
        'hasSelectors': selector,
      },
    ];
  }
  const baseUrl = '/camunda/v1/targeting-tasks/status-counts';
  cy.request({
    method: 'POST',
    url: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response.body);
    return response.body[0].statusCounts;
  });
});

Cypress.Commands.add('applyModesFilter', (filterOptions, taskType) => {
  if (filterOptions instanceof Array) {
    filterOptions.forEach((option) => {
      cy.get(`.govuk-checkboxes [value=${option}]`)
        .click({ force: true });
    });
  } else {
    cy.get(`.govuk-checkboxes [value=${filterOptions}]`)
      .click({ force: true });
  }

  cy.contains('Apply filters').click();
  cy.wait(2000);
  cy.get(`a[href='#${taskType}']`).invoke('text').then((targets) => {
    return parseInt(targets.match(/\d+/)[0], 10);
  });
});

Cypress.Commands.add('applySelectorFilter', (filterOptions, taskType) => {
  if (filterOptions instanceof Array) {
    filterOptions.forEach((option) => {
      cy.get(`.govuk-radios__item [value=${option}]`)
        .click({ force: true });
    });
  } else {
    cy.get(`.govuk-radios__item [value=${filterOptions}]`)
      .click({ force: true });
  }

  cy.contains('Apply filters').click();
  cy.wait(2000);
  cy.get(`a[href='#${taskType}']`).invoke('text').then((targets) => {
    return parseInt(targets.match(/\d+/)[0], 10);
  });
});

Cypress.Commands.add('verifyBookingDateTime', (expectedBookingDateTime) => {
  cy.contains('h3', 'Booking and check-in').next().within(() => {
    cy.getTaskDetails().then((details) => {
      const bookingDateTime = Object.fromEntries(Object.entries(details).filter(([key]) => key.includes('Booking date and time')));
      expect(bookingDateTime['Booking date and time']).to.be.equal(expectedBookingDateTime);
    });
  });
});

Cypress.Commands.add('verifyCheckInDateTime', (expectedCheckInDateTime) => {
  cy.contains('h3', 'Booking and check-in').next().within(() => {
    cy.getTaskDetails().then((details) => {
      const checkInDateTime = Object.fromEntries(Object.entries(details).filter(([key]) => key.includes('Check-in date and time')));
      expect(checkInDateTime['Check-in date and time']).to.be.equal(expectedCheckInDateTime);
    });
  });
});

Cypress.Commands.add('getTaskVersionsDifference', (version, index) => {
  let valueLocator = '.govuk-grid-value .task-versions--highlight';
  let difference = {};
  cy.expandTaskDetails(index).then(() => {
    cy.wrap(version).find('.govuk-grid-key .task-versions--highlight').each((item) => {
      cy.wrap(item).parents('ul').then((valueElement) => {
        if (valueElement.find(valueLocator).length > 0) {
          cy.wrap(item).invoke('text').then((key) => {
            cy.wrap(valueElement).find(valueLocator).invoke('text').then((value) => {
              if (key in difference) {
                if (`${key}-dup` in difference) {
                  difference[`${key}-dup-${1}`] = value;
                } else {
                  difference[`${key}-dup`] = value;
                }
              } else {
                difference[key] = value;
              }
            });
          });
        } else {
          cy.wrap(item).invoke('text').then((key) => {
            if (key in difference) {
              if (`${key}-dup` in difference) {
                difference[`${key}-dup-${1}`] = '';
              } else {
                difference[`${key}-dup`] = '';
              }
            } else {
              difference[key] = '';
            }
          });
        }
      });
    });
  }).then(() => {
    console.log(difference);
    return difference;
  });
});

Cypress.Commands.add('backToTaskList', (element, tabName) => {
  cy.wrap(element).click();
  cy.get('.govuk-link--no-visited-state').eq(0).click();
  cy.wait(1000);
  cy.contains('Back to task list').click();
  cy.get('.govuk-tabs__list-item--selected').should('contain.text', tabName).and('be.visible');
});

Cypress.Commands.add('getActivityLogs', () => {
  let activityLog = [];
  cy.get('.govuk-grid-column-one-third p.govuk-body:not(.govuk-tag--positiveTarget)').each((item) => {
    cy.wrap(item).invoke('text').then((activity) => {
      activityLog.push(activity);
    });
  }).then(() => {
    return activityLog;
  });
});

Cypress.Commands.add('getAllRuleMatches', () => {
  let actualRuleMatches = {};
  cy.get('.govuk-grid-row').each((element, index) => {
    if (index < 2) {
      cy.wrap(element).find('.govuk-heading-s').each((item) => {
        cy.wrap(item).invoke('text').then((header) => {
          cy.wrap(item).next().invoke('text').then((value) => {
            actualRuleMatches[header] = value;
          });
        });
      }).then(() => {
        return actualRuleMatches;
      });
    }
  });
});

Cypress.Commands.add('getSelectorGroupDetails', (elements) => {
  let actualRuleMatches = {};
  cy.wrap(elements).each((element, index) => {
    if (index <= 9) {
      cy.wrap(element).find('.govuk-heading-s').each((item) => {
        cy.wrap(item).invoke('text').then((header) => {
          cy.wrap(item).next().invoke('text').then((value) => {
            actualRuleMatches[header] = value;
          });
        });
      });
    }
  }).then(() => {
    return actualRuleMatches;
  });
});

Cypress.Commands.add('getAllSelectorMatches', (locator) => {
  let actualSelectorMatches = [];
  cy.wrap(locator).nextAll().find('.govuk-\\!-margin-bottom-6').each((selector) => {
    let obj = {};
    cy.wrap(selector).find('.govuk-summary-list__row').each((item) => {
      cy.wrap(item).find('dt').invoke('text').then((key) => {
        cy.wrap(item).find('dd').invoke('text').then((value) => {
          obj[key] = value;
        });
      });
    }).then(() => {
      actualSelectorMatches.push(obj);
    });
  })
    .then(() => {
      return actualSelectorMatches;
    });
});

function verifyTaskUpdatedStatus(businessKey, status) {
  let locator;
  if (status === 'Updated') {
    locator = '.govuk-tag--updatedTarget';
  } else {
    locator = '.govuk-tag--relistedTarget';
  }
  cy.get('.govuk-task-list-card').contains(businessKey).closest('section').then((element) => {
    cy.wrap(element).find(locator).invoke('text').then((taskUpdated) => {
      expect(taskUpdated).to.be.equal(status);
    });
  });
}

Cypress.Commands.add('verifyTaskHasUpdated', (businessKey, status) => {
  const nextPage = 'a[data-test="next"]';
  cy.get('body').then(($el) => {
    if ($el.find(nextPage).length > 0) {
      cy.findTaskInAllThePages(businessKey, null, null).then(() => {
        verifyTaskUpdatedStatus(businessKey, status);
      });
    } else {
      cy.findTaskInSinglePage(businessKey, null, null).then(() => {
        verifyTaskUpdatedStatus(businessKey, status);
      });
    }
  });
});

Cypress.Commands.add('verifyTasksSortedOnArrivalDateTime', () => {
  let arrivalDate;
  cy.get('.task-list--item-2 .content-line-two').each((item, index) => {
    let dates;
    cy.wrap(item).invoke('text').then((element) => {
      if (!element.includes('unknown')) {
        dates = element.split('-')[1];
        dates = dates.slice(5, dates.length).split('at')[0];
        const d = new Date(dates);
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

function getTouristTaskSummary(businessKey) {
  let taskSummary = {};
  cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within((element) => {
    cy.get('.task-list--item-2 i').invoke('attr', 'class').then((value) => {
      taskSummary.icon = value;

      if (value.includes('car')) {
        cy.wrap(element).contains('Driver').next().then((primary) => {
          cy.wrap(primary).find('li').each((details, index) => {
            cy.wrap(details).invoke('text').then((info) => {
              if (index === 0) {
                taskSummary.driverName = info;
              } else if (index === 1) {
                taskSummary.driverGender = info;
              }
            });
          });
        });

        cy.wrap(element).contains('VRN').next().then((document) => {
          cy.wrap(document).find('li').each((details) => {
            cy.wrap(details).invoke('text').then((info) => {
              taskSummary.vrn = info;
            });
          });
        });
      } else {
        cy.wrap(element).contains('Primary traveller').next().then((primary) => {
          cy.wrap(primary).find('li').each((details) => {
            cy.wrap(details).invoke('text').then((info) => {
              taskSummary.primaryTravellerName = info;
            });
          });
        });

        cy.wrap(element).contains('Document').next().then((document) => {
          cy.wrap(document).find('li').each((details) => {
            cy.wrap(details).invoke('text').then((info) => {
              taskSummary.documentDetails = info;
            });
          });
        });
      }
    });

    cy.wrap(element).contains('Booking').next().then((booking) => {
      cy.wrap(booking).find('li').each((details, index) => {
        cy.wrap(details).invoke('text').then((info) => {
          if (index === 0) {
            taskSummary.bookedOn = info;
          } else if (index === 1) {
            taskSummary.booked = info;
          }
        });
      });
    });

    cy.wrap(element).contains('Co-travellers').next().then((travellers) => {
      let passengers = [];
      cy.wrap(travellers).find('li').each((details) => {
        cy.wrap(details).invoke('text').then((info) => {
          passengers.push(info);
          taskSummary.travellers = passengers;
        });
      });
    });
  })
    .then(() => {
      return taskSummary;
    });
}

Cypress.Commands.add('verifyTouristTaskSummary', (businessKey) => {
  const nextPage = 'a[data-test="next"]';
  cy.visit('/tasks');
  cy.get('body').then(($el) => {
    if ($el.find(nextPage).length > 0) {
      cy.findTaskInAllThePages(businessKey, null, null).then(() => {
        return getTouristTaskSummary(businessKey);
      });
    } else {
      cy.findTaskInSinglePage(businessKey, null, null).then(() => {
        return getTouristTaskSummary(businessKey);
      });
    }
  });
});

Cypress.Commands.add('verifyIcons', (businessKey, vehicle, ship) => {
  const nextPage = 'a[data-test="next"]';
  cy.get('body').then(($el) => {
    if ($el.find(nextPage).length > 0) {
      cy.findTaskInAllThePages(businessKey, null, null).then(() => {
        cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within(() => {
          cy.get('i').eq(0).invoke('attr', 'class').should('contain', vehicle);
          cy.get('i').eq(1).invoke('attr', 'class').should('contain', ship);
        });
      });
    } else {
      cy.findTaskInSinglePage(businessKey, null, null).then(() => {
        cy.get('.govuk-task-list-card').contains(businessKey).parents('.card-container').within(() => {
          cy.get('i').eq(0).invoke('attr', 'class').should('contain', vehicle);
          cy.get('i').eq(1).invoke('attr', 'class').should('contain', ship);
        });
      });
    }
  });
  cy.wait(2000);
  cy.checkTaskDisplayed(businessKey);
  cy.get('i').eq(0).invoke('attr', 'class').should('contain', vehicle);
  cy.get('i').eq(1).invoke('attr', 'class').should('contain', ship);
});

Cypress.Commands.add('checkTaskUpdateAndRelistStatus', (filterValue, taskResponse) => {
  cy.contains('Clear all filters').click({ force: true });

  cy.wait(2000);

  cy.get(`.govuk-checkboxes [value="${filterValue}"]`)
    .click({ force: true });

  cy.contains('Apply filters').click({ force: true });

  cy.wait(2000);

  cy.verifyTaskHasUpdated(taskResponse.businessKey, 'Updated');
  cy.verifyTaskHasUpdated(taskResponse.businessKey, 'Relisted');
});

Cypress.Commands.add('getSelectorGroupInformation', (elements) => {
  let actualSelectorGroupDetails = {};
  let warningMessage = {};
  let entityArray = [];
  cy.getSelectorGroupDetails(elements).then((actualSelectorMatches) => {
    actualSelectorGroupDetails.selectorGroupInfo = actualSelectorMatches;
  });

  cy.get('.react-tabs__tab-list li').each((item) => {
    cy.wrap(item).click();
    cy.get('.react-tabs__tab-panel--selected').within(() => {
      cy.get('.govuk-heading-s').eq(0).invoke('text').then((header) => {
        cy.get('.govuk-heading-s').eq(1).invoke('text').then((value) => {
          warningMessage[header] = value;
        });
      });
    });

    cy.get('.panel').within(() => {
      cy.get('.panel-content').each((element) => {
        let entities = {};
        cy.wrap(element).find('.govuk-\\!-font-weight-bold').each((entity) => {
          cy.wrap(entity).invoke('text').then((header) => {
            cy.wrap(entity).next().invoke('text').then((value) => {
              entities[header] = value;
              entityArray.push(entities);
            });
          });
        });
      });
    });
  }).then(() => {
    actualSelectorGroupDetails.group = warningMessage;
    actualSelectorGroupDetails.group.entities = entityArray;
    return actualSelectorGroupDetails;
  });
});

Cypress.Commands.add('SelectInformBothFreightAndTouristOption', (elementName) => {
  cy.get(`${formioComponent}${elementName}`).find('input').should('not.be.checked');

  cy.get(`input[name="data[${elementName}]"]`).click();

  cy.get(`${formioComponent}${elementName}`).find('input').should('be.checked');
});

Cypress.Commands.add('verifyDateTime', (elementName, dateTimeFormatted) => {
  let eta = Cypress.dayjs(dateTimeFormatted);
  cy.get(`#${elementName}-day`).should('have.value', eta.format('DD'));
  cy.get(`#${elementName}-month`).should('have.value', eta.format('MM'));
  cy.get(`#${elementName}-year`).should(
    'have.value',
    eta.format('YYYY'),
  );
  cy.get(`#${elementName}-hour`).should('have.value', eta.format('HH'));
  cy.get(`#${elementName}-minute`).should(
    'have.value',
    eta.format('mm'),
  );
});
