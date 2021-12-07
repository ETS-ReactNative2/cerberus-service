import 'cypress-keycloak-commands';

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
  cy.intercept('GET', '/camunda/variable-instance?variableName=taskSummaryBasedOnTIS&processInstanceIdIn=**').as('tasks');

  cy.navigation('Tasks');

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
    url: '/camunda/task?**',
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
    url: '/camunda/task?**',
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
    url: '/camunda/task?**',
    headers: {
      authorization,
    },
  };

  cy.request(options).then((response) => {
    return response.body.filter((item) => item.assignee === 'cypressuser-cerberus@lodev.xyz');
  });
});

Cypress.Commands.add('claimTask', () => {
  cy.intercept('POST', '/camunda/task/*/claim').as('claim');

  cy.get('.title-container').eq(0).within(() => {
    cy.get('a').invoke('text').as('taskName');
    cy.get('a').click();
  });
  cy.get('p.govuk-body').eq(0).should('contain.text', 'Unassigned');

  cy.get('button.link-button').should('be.visible').and('have.text', 'Claim').click();

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
      cy.get('.govuk-link--no-visited-state').each((item) => {
        if (action === null) {
          cy.wrap(item).invoke('text').then((text) => {
            cy.log('task text', text);
            if (taskName === text) {
              if (taskdetails !== null) {
                cy.verifyTaskManagementPage(item, taskdetails);
              }
              found = true;
            }
          });
        } else {
          cy.wrap(item).invoke('text').then((text) => {
            if (taskName === text) {
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

Cypress.Commands.add('verifyTaskManagementPage', (item, taskdetails) => {
  cy.wrap(item).parents('.govuk-tabs__panel').then((element) => {
    cy.wrap(element).invoke('attr', 'id').then((value) => {
      cy.wrap(item).parents('.title-container').then((taskElement) => {
        if (value === 'in-progress') {
          cy.wrap(taskElement).find('.task-list--email').invoke('text').then((assignee) => {
            expect(assignee).to.equal(taskdetails);
          });
        } else if (value === 'new') {
          cy.wrap(taskElement).next('.govuk-grid-row').then((riskStatementElement) => {
            cy.wrap(riskStatementElement).find('.task-risk-statement').invoke('text').then((selector) => {
              expect(selector).to.equal(taskdetails);
            });
          });
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
    expect(response.body.businessKey).to.eq(task.businessKey);
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
  cy.get(`${formioComponent}${elementName} div[role="listbox"]`)
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
  cy.get('.govuk-link--no-visited-state').each((item) => {
    if (action === null) {
      cy.wrap(item).invoke('text').then((text) => {
        cy.log('task text', text);
        if (taskName === text) {
          if (taskdetails !== null) {
            cy.verifyTaskManagementPage(item, taskdetails);
          }
          found = true;
        }
      });
    } else {
      cy.wrap(item).invoke('text').then((text) => {
        if (taskName === text) {
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
  cy.get('.govuk-summary-list__row').each((item) => {
    cy.wrap(item).find('dt').invoke('text').then((key) => {
      cy.wrap(item).find('dd').invoke('text').then((value) => {
        obj[key] = value;
      });
    });
  }).then(() => {
    return obj;
  });
});

Cypress.Commands.add('expandTaskDetails', (versionNumber) => {
  cy.get('.govuk-accordion__section-button').eq(versionNumber).invoke('attr', 'aria-expanded').then((value) => {
    if (value !== true) {
      cy.get('.govuk-accordion__section-button').eq(versionNumber).click();
    }
  });
});

Cypress.Commands.add('collapseTaskDetails', () => {
  cy.get('.govuk-accordion__section-button').invoke('attr', 'aria-expanded').then((value) => {
    if (value === true) {
      cy.get('.govuk-accordion__section-button').click();
    }
  });
});

Cypress.Commands.add('navigateToTaskDetailsPage', (task) => {
  const processInstanceId = task.map((item) => item.processInstanceId);
  expect(processInstanceId.length).to.not.equal(0);
  cy.intercept('GET', `/camunda/task?processInstanceId=${processInstanceId[0]}`).as('tasksDetails');
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
      cy.get('.govuk-heading-m').should('contain.text', registrationNumber);
    });
  }

  if (bookingDateTime === 'Invalid date') {
    bookingDateTime = 'Invalid Date';
  }

  cy.get('.task-versions .task-versions--left').should('contain.text', bookingDateTime);
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

Cypress.Commands.add('verifyTaskListInfo', (businessKey) => {
  let taskSummary = {};
  cy.visit('/tasks');
  cy.get('.task-list--item').contains(businessKey).closest('section').then((element) => {
    cy.wrap(element).find('h4.task-heading').invoke('text').then((mode) => {
      taskSummary.mode = mode;
    });
    cy.wrap(element).find('.task-risk-statement').invoke('text').then((rules) => {
      taskSummary.rules = rules;
    });

    cy.wrap(element).find('.content-line-one li').each((section, index) => {
      cy.wrap(section).invoke('text').then((info) => {
        if (index === 0) {
          taskSummary.voyage = info;
        } else {
          taskSummary.arrival = info;
        }
      });
    });

    cy.wrap(element).find('.content-line-two li').each((section, index) => {
      cy.wrap(section).invoke('text').then((info) => {
        if (index === 0) {
          taskSummary.departurePort = info;
        } else if (index === 1) {
          taskSummary.departureDateTime = info;
        } else if (index === 2) {
          taskSummary.arrivalPort = info;
        } else {
          taskSummary.arrivalDateTime = info;
        }
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

    cy.wrap(element).contains('Passenger details').next().then((passengerDetails) => {
      cy.wrap(passengerDetails).find('li').each((details) => {
        cy.wrap(details).invoke('text').then((info) => {
          taskSummary.passengerDetails = info;
        });
      });
    });

    cy.wrap(element).contains('Trailer details').next().then((trailerDetails) => {
      cy.wrap(trailerDetails).find('li').each((details, index) => {
        cy.wrap(details).invoke('text').then((info) => {
          if (index === 0) {
            taskSummary.trailerRegitration = info;
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
});

Cypress.Commands.add('verifyTaskDetailSection', (expData, versionInRow, sectionname) => {
  if (versionInRow == null) {
    versionInRow = 1;
  }
  cy.get(`[id$=-content-${versionInRow}]`).within(() => {
    cy.contains('h2', sectionname)
      .next()
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
  sectionHeading.set('vehicle', 'Vehicle details');
  sectionHeading.set('account', 'Account details');
  sectionHeading.set('haulier', 'Haulier details');
  sectionHeading.set('driver', 'Driver');
  sectionHeading.set('passengers', 'Passengers');
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
      throw new Error(`Section "${key}" in json file is not valid. ${sections}`);
    }
  });

  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'vehicle')) {
    cy.verifyTaskDetailSection(expectedDetails.vehicle, versionInRow, sectionHeading.get('vehicle'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'account')) {
    cy.verifyTaskDetailSection(expectedDetails.account, versionInRow, sectionHeading.get('account'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'haulier')) {
    cy.verifyTaskDetailSection(expectedDetails.haulier, versionInRow, sectionHeading.get('haulier'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'driver')) {
    cy.verifyTaskDetailSection(expectedDetails.driver, versionInRow, sectionHeading.get('driver'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'passengers')) {
    cy.verifyTaskDetailSection(expectedDetails.passengers, versionInRow, sectionHeading.get('passengers'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'goods')) {
    cy.verifyTaskDetailSection(expectedDetails.goods, versionInRow, sectionHeading.get('goods'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'booking')) {
    cy.verifyTaskDetailSection(expectedDetails.booking, versionInRow, sectionHeading.get('booking'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'rulesMatched')) {
    cy.verifyTaskDetailSection(expectedDetails.rulesMatched, versionInRow, sectionHeading.get('rulesMatched'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'selectorMatch')) {
    cy.verifyTaskDetailSection(expectedDetails.selectorMatch, versionInRow, sectionHeading.get('selectorMatch'));
  }
  if (Object.prototype.hasOwnProperty.call(expectedDetails, 'TargetingIndicators')) {
    cy.verifyTaskDetailSection(expectedDetails.TargetingIndicators, versionInRow, sectionHeading.get('TargetingIndicators'));
  }
});

Cypress.Commands.add('checkTaskSummaryDetails', () => {
  let taskSummary = {};
  cy.get('.govuk-grid-row dl.mode-details dt').each((keyElement) => {
    cy.wrap(keyElement).invoke('text').then((key) => {
      cy.log('key', key);
      cy.wrap(keyElement).next().invoke('text').then((value) => {
        cy.log('value', value);
        taskSummary[key] = value;
      });
    });
  }).then(() => {
    return taskSummary;
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
  cy.get(`${formioComponent}${elementName} div[role="listbox"]`)
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
              cy.wrap(element).find('button').click();
            }
          });
        });
    });
});

Cypress.Commands.add('createCerberusTask', (payload, taskName) => {
  let expectedTaskSummary = {};
  let date = new Date();
  let dateNowFormatted = Cypress.dayjs(date).format('DD-MM-YYYY');
  const dateFormat = 'D MMM YYYY [at] HH:mm';
  cy.fixture(payload).then((task) => {
    let registrationNumber = task.variables.rbtPayload.value.data.movement.vehicles[0].vehicle.registrationNumber;
    const rndInt = Math.floor(Math.random() * 20) + 1;
    date.setDate(date.getDate() + rndInt);
    task.variables.rbtPayload.value.data.movement.voyage.voyage.actualArrivalTimestamp = date.getTime();
    let bookingDateTime = task.variables.rbtPayload.value.data.movement.serviceMovement.attributes.attrs.bookingDateTime;
    bookingDateTime = Cypress.dayjs(bookingDateTime).format(dateFormat);
    let mode = task.variables.rbtPayload.value.data.movement.serviceMovement.movement.mode.replace(/ /g, '-');
    if (taskName.includes('TSV')) {
      let voyage = task.variables.rbtPayload.value.data.movement.voyage.voyage;
      let departureDateTime = Cypress.dayjs(voyage.actualDepartureTimestamp).utc().format(dateFormat);
      let arrivalDateTime = Cypress.dayjs(voyage.actualArrivalTimestamp).utc().format(dateFormat);
      cy.log('departure and arrival time', departureDateTime, arrivalDateTime);
      expectedTaskSummary.Ferry = `${voyage.carrier} voyage of ${voyage.craftId}`;
      expectedTaskSummary.Departure = `${voyage.departureLocation}, ${departureDateTime}`;
      expectedTaskSummary.Arrival = `${voyage.arrivalLocation}, ${arrivalDateTime}`;
      expectedTaskSummary.Account = `unknown, booked on ${bookingDateTime}`;
      expectedTaskSummary.Haulier = 'unknown';
    }
    task.variables.rbtPayload.value = JSON.stringify(task.variables.rbtPayload.value);
    cy.postTasks(task, `AUTOTEST-${dateNowFormatted}-${mode}-${taskName}`).then((response) => {
      cy.wait(4000);
      cy.checkTaskDisplayed(`${response.businessKey}`);
      if (taskName.includes('TSV')) {
        cy.checkTaskSummaryDetails().then((taskSummary) => {
          expect(expectedTaskSummary).to.deep.equal(taskSummary);
        });
      }
      cy.checkTaskSummary(registrationNumber, bookingDateTime);
    });
  });
});

Cypress.Commands.add('getNumberOfTasksByMode', (modeName, taskStatus) => {
  const baseUrl = `https://${cerberusServiceUrl}/camunda/engine-rest/task?processVariables=movementMode_eq_${modeName},`;
  let url;

  if (taskStatus === 'New') {
    url = `${baseUrl}processState_neq_Complete&unassigned=true`;
  } else if (taskStatus === 'In Progress') {
    url = `${baseUrl}processState_neq_Complete&assigned=true`;
  } else if (taskStatus === 'Issued') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance?variables=movementMode_eq_${modeName},processState_eq_Issued`;
  } else if (taskStatus === 'Completed') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance?variables=movementMode_eq_${modeName},processState_eq_Complete&processDefinitionKey=assignTarget`;
  }
  cy.request({
    method: 'GET',
    url,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response.body);
    return response.body.filter((item) => item.id).length;
  });
});

Cypress.Commands.add('getNumberOfTasksWithoutFilter', (taskStatus) => {
  const baseUrl = `https://${cerberusServiceUrl}/camunda/engine-rest/task?processVariables=`;
  let url;

  if (taskStatus === 'New') {
    url = `${baseUrl}processState_neq_Complete&unassigned=true`;
  } else if (taskStatus === 'In Progress') {
    url = `${baseUrl}processState_neq_Complete&assigned=true`;
  } else if (taskStatus === 'Issued') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance?variables=processState_eq_Issued`;
  } else if (taskStatus === 'Completed') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance?variables=processState_eq_Complete&processDefinitionKey=assignTarget`;
  }
  cy.request({
    method: 'GET',
    url,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response.body);
    return response.body.filter((item) => item.id).length;
  });
});

Cypress.Commands.add('getNumberOfTasksByModeAndSelectors', (modeName, selector, taskStatus) => {
  if (selector === 'has-no-selector') {
    selector = 'hasSelectors_eq_no';
  } else if (selector === 'has-selector') {
    selector = 'hasSelectors_eq_yes';
  } else {
    selector = '';
  }
  const baseUrl = `https://${cerberusServiceUrl}/camunda/engine-rest/task?processVariables=movementMode_eq_${modeName},`;
  let url;

  if (taskStatus === 'New') {
    url = `${baseUrl}processState_neq_Complete,${selector}&unassigned=true`;
  } else if (taskStatus === 'In Progress') {
    url = `${baseUrl}processState_neq_Complete,${selector}&assigned=true`;
  } else if (taskStatus === 'Issued') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance?variables=movementMode_eq_${modeName},processState_eq_Issued,${selector}`;
  } else if (taskStatus === 'Completed') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance?variables=movementMode_eq_${modeName},processState_eq_Complete,${selector}&processDefinitionKey=assignTarget`;
  }
  cy.request({
    method: 'GET',
    url,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response.body);
    return response.body.filter((item) => item.id).length;
  });
});

Cypress.Commands.add('getNumberOfTasksBySelectors', (selector, taskStatus) => {
  if (selector === 'has-no-selector') {
    selector = 'hasSelectors_eq_no';
  } else if (selector === 'has-selector') {
    selector = 'hasSelectors_eq_yes';
  } else {
    selector = '';
  }
  const baseUrl = `https://${cerberusServiceUrl}/camunda/engine-rest/task?processVariables=processState_neq_Complete,${selector}&`;
  let url;

  if (taskStatus === 'New') {
    url = `${baseUrl}unassigned=true`;
  } else if (taskStatus === 'In Progress') {
    url = `${baseUrl}assigned=true`;
  } else if (taskStatus === 'Issued') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/process-instance?variables=processState_eq_Issued,${selector}&firstResult=0&maxResults=100`;
  } else if (taskStatus === 'Completed') {
    url = `https://${cerberusServiceUrl}/camunda/engine-rest/history/process-instance?variables=processState_eq_Complete,${selector}&processDefinitionKey=assignTarget`;
  }
  cy.request({
    method: 'GET',
    url,
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
    console.log(response.body);
    return response.body.filter((item) => item.id).length;
  });
});

Cypress.Commands.add('applyFilter', (filterOptions, taskType) => {
  if (filterOptions instanceof Array) {
    filterOptions.forEach((option) => {
      cy.get(`.govuk-radios [value=${option}]`)
        .click({ force: true });
    });
  } else {
    cy.get(`.govuk-radios [value=${filterOptions}]`)
      .click({ force: true });
  }

  cy.contains('Apply filters').click();
  cy.wait(2000);
  cy.get(`a[href="#${taskType}"]`).invoke('text').then((targets) => {
    return parseInt(targets.match(/\d+/)[0], 10);
  });
});

Cypress.Commands.add('verifyBookingDateTime', (expectedBookingDateTime) => {
  cy.contains('h2', 'Booking and check-in').next().within(() => {
    cy.getTaskDetails().then((details) => {
      const bookingDateTime = Object.fromEntries(Object.entries(details).filter(([key]) => key.includes('Date and time')));
      expect(bookingDateTime['Date and time']).to.be.equal(expectedBookingDateTime);
    });
  });
});

Cypress.Commands.add('getTaskVersionsDifference', (version, index) => {
  let valueLocator = '.govuk-summary-list__value .task-versions--highlight';
  let difference = {};
  cy.expandTaskDetails(index).then(() => {
    cy.wrap(version).find('.govuk-summary-list__key .task-versions--highlight').each((item) => {
      cy.wrap(item).parents('.govuk-summary-list__row').then((valueElement) => {
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
