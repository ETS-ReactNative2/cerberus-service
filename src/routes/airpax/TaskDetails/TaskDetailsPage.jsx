import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Config
import config from '../../../config';
import { TASK_STATUS_TARGET_ISSUED, TASK_STATUS_COMPLETED } from '../../../constants';
// Utils
import useAxiosInstance from '../../../utils/axiosInstance';
import { useKeycloak } from '../../../utils/keycloak';
import { findAndUpdateTaskVersionDifferencesAirPax } from '../../../utils/findAndUpdateTaskVersionDifferences';
import { formatTaskStatusToCamelCase } from '../../../utils/formatTaskStatus';

// Components/Pages
import ActivityLog from '../../../components/ActivityLog';
import ClaimUnclaimTask from '../../../components/ClaimUnclaimTask';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TaskVersions from './TaskVersions';

// Styling
import '../__assets__/TaskDetailsPage.scss';

const TaskDetailsPage = () => {
  const { businessKey } = useParams();
  const keycloak = useKeycloak();
  const apiClient = useAxiosInstance(keycloak, config.taskApiUrl);
  const refDataClient = useAxiosInstance(keycloak, config.refdataApiUrl);
  const currentUser = keycloak.tokenParsed.email;
  const [assignee, setAssignee] = useState();
  const [formattedTaskStatus, setFormattedTaskStatus] = useState();
  const [taskData, setTaskData] = useState();
  const [refDataAirlineCodes, setRefDataAirlineCodes] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // TEMP VALUES FOR TESTING UNTIL API ACTIVE
  let tempData = {
    data: {
      // paste mock data here
      "id":"DEV-20220328-001",
      "status":"NEW",
      "assignee":null,
      "latestVersionNumber":1,
      "notes":[
         {
            "content":"task created",
            "timestamp":"2022-03-28T09:56:56.399861Z",
            "userId":"rules-based-targeting"
         }
      ],
      "movement":{
         "id":"ROROTSV:CMID=9c19fe74233c057f25e5ad333672c3f9/2b4a6b5b08ea434880562d6836b1036",
         "status":"PRE_ARRIVAL",
         "mode":"RORO_ACCOMPANIED_FREIGHT",
         "description":"vehicle-with-trailer",
         "booking":{
            "reference":"357485637",
            "type":"Online",
            "paymentMethod":"Account",
            "bookedAt":"2020-08-02T09:20:00Z",
            "checkInAt":"2020-08-04T12:10:00Z",
            "ticket":{
               "number":"TIC-998765421",
               "type":"Return",
               "price":"59.99"
            },
            "country":"GB"
         },
         "journey":{
            "id":"19aafdcd743bd63ca19bfe917f75a2db",
            "arrival":{
               "location":"CAL",
               "time":"2020-08-04T13:55:00Z"
            },
            "departure":{
               "location":"DOV",
               "time":"2020-08-04T13:10:00Z"
            }
         },
         "vessel":{
            "operator":"DFDS",
            "name":"KHALEESI SEAWAYS"
         },
         "person":{
            "entitySearchUrl":"http://localhost:5010/search?type=PERSON&term=103000003407504&fields=[%22id%22]",
            "name":{
               "first":"Daniel",
               "last":"Fagan",
               "full":"Daniel Fagan"
            },
            "dateOfBirth":"1984-08-03T00:00:00Z",
            "gender":"M",
            "nationality":"GB",
            "document":{
               "entitySearchUrl":null,
               "type":"PASSPORT",
               "number":"ST0392315",
               "expiry":"2021-02-01T00:00:00Z"
            },
            "movementStats":null
         },
         "otherPersons":[
            {
               "entitySearchUrl":"http://localhost:5010/search?type=PERSON&term=101234567888,101234567999&fields=[%22id%22]",
               "name":{
                  "first":"Donald",
                  "last":"Fox",
                  "full":"Donald Fox"
               },
               "dateOfBirth":"1981-06-03T00:00:00Z",
               "gender":"M",
               "nationality":"GB",
               "document":{
                  "entitySearchUrl":null,
                  "type":"PASSPORT",
                  "number":"ST0394612",
                  "expiry":"2021-02-01T00:00:00Z"
               },
               "movementStats":null
            }
         ],
         "vehicle":{
            "entitySearchUrl":"http://localhost:5010/search?type=VEHICLE&term=103000003407504&fields=[%22id%22]",
            "type":"Truck",
            "registration":"GB57MJP",
            "nationality":"GB",
            "colour":"Grey",
            "model":"R-Series",
            "make":"Scania",
            "netWeight":"3455",
            "grossWeight":"43623",
            "movementStats":null
         },
         "trailer":{
            "entitySearchUrl":"http://localhost:5010/search?type=VEHICLE&term=103000003407321&fields=[%22id%22]",
            "type":"TR",
            "registration":"GB09NFD",
            "nationality":"GB",
            "length":"75",
            "height":"3",
            "loadStatus":"Empty",
            "movementStats":null
         },
         "goods":{
            "description":"PPE Masks",
            "hazardous":false,
            "weight":null,
            "destination":null
         },
         "haulier":{
            "entitySearchUrl":null,
            "name":"Sinkable Hauling",
            "address":null,
            "contacts":{
               "phone":{
                  "value":"289675932",
                  "entitySearchUrl":null
               },
               "mobile":{
                  "value":"07809123456",
                  "entitySearchUrl":null
               }
            },
            "movementStats":null
         },
         "account":{
            "entitySearchUrl":"http://localhost:5010/search?type=ORGANISATION&term=10311111113407504&fields=[%22id%22]",
            "name":"Safe Cafe Medical PPE",
            "shortName":"SCM PPE",
            "reference":"000361676",
            "address":{
               "entitySearchUrl":null,
               "line1":"University of Portsmouth",
               "line2":"Royal Dockyards",
               "city":"Portsmouth",
               "postcode":"PO1 2EF",
               "country":"GB"
            },
            "contacts":{
               "phone":{
                  "value":"01234 926459",
                  "entitySearchUrl":null
               },
               "mobile":{
                  "value":"07809 386670",
                  "entitySearchUrl":null
               }
            },
            "movementStats":null
         },
         "booker":null,
         "occupants":{
            "numberOfOaps":0,
            "numberOfAdults":1,
            "numberOfChildren":0,
            "numberOfInfants":0,
            "numberOfUnknowns":3,
            "numberOfOccupants":4
         }
      },
      "risks":{
         "targetingIndicators":{
            "indicators":[
               {
                  "id":1,
                  "name":"VEHICLE-FREIGHT-QUICK-TURNAROUND-0_24_HRS",
                  "description":"Quick turnaround freight (under 24 hours)",
                  "score":30
               },
               {
                  "id":2,
                  "name":"VEHICLE-TOURIST-QUICK-TURNAROUND-0_24_HRS",
                  "description":"Quick turnaround tourist (under 24 hours)",
                  "score":30
               }
            ],
            "count":2,
            "score":60
         },
         "matchedRules":[
            {
               "id":535,
               "name":"Selector Matched Rule",
               "type":"Both",
               "priority":"Tier 1",
               "description":"Test",
               "version":1,
               "abuseTypes":[
                  "National Security at the Border"
               ],
               "indicatorMatches":[
                  {
                     "entity":"Message",
                     "descriptor":"mode",
                     "operator":"in",
                     "value":"[RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]"
                  },
                  {
                     "entity":"Message",
                     "descriptor":"selectorsMatched",
                     "operator":"equal",
                     "value":"true"
                  }
               ]
            },
            {
               "id":556,
               "name":"Checkin lead time",
               "type":"Both",
               "priority":"Tier 4",
               "description":"Qui nesciunt suscip",
               "version":1,
               "abuseTypes":[
                  "Class A Drugs"
               ],
               "indicatorMatches":[
                  {
                     "entity":"Booking",
                     "descriptor":"checkInLeadTime",
                     "operator":"between",
                     "value":"[1, 24]"
                  },
                  {
                     "entity":"Message",
                     "descriptor":"mode",
                     "operator":"in",
                     "value":"[RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]"
                  }
               ]
            }
         ],
         "matchedSelectorGroups":{
            "groups":[
               {
                  "groupReference":"SR-245",
                  "groupVersionNumber":1,
                  "requestingOfficer":"fe",
                  "intelligenceSource":"fefe",
                  "category":"A",
                  "threatType":"Class A Drugs",
                  "pointOfContactMessage":"fdvdfb",
                  "pointOfContact":"bfb",
                  "inboundActionCode":"No action required",
                  "outboundActionCode":"No action required",
                  "notes":"notes",
                  "creator":"user",
                  "selectors":[
                     {
                        "id":279,
                        "reference":"2021-279",
                        "category":"A",
                        "warning":{
                           "status":"NO",
                           "types":[
                              
                           ],
                           "detail":null
                        },
                        "indicatorMatches":[
                           {
                              "entity":"Message",
                              "descriptor":"mode",
                              "operator":"in",
                              "value":"RORO Accompanied Freight"
                           },
                           {
                              "entity":"Trailer",
                              "descriptor":"registrationNumber",
                              "operator":"equal",
                              "value":"qwerty"
                           }
                        ],
                        "description":"RORO Accompanied Freight qwerty"
                     },
                     {
                        "id":300,
                        "reference":"2022-300",
                        "category":"B",
                        "warning":{
                           "status":"NO",
                           "types":[
                              
                           ],
                           "detail":null
                        },
                        "indicatorMatches":[
                           {
                              "entity":"Trailer",
                              "descriptor":"registrationNumber",
                              "operator":"equal",
                              "value":"GB09NFD"
                           }
                        ],
                        "description":"GB09NFD"
                     }
                  ]
               }
            ],
            "totalNumberOfSelectors":2
         },
         "highestThreatLevelRiskType":"RULE",
         "highestThreatLevel":"A"
      },
      "versions":[
         {
            "number":1,
            "createdAt":"2022-03-28T09:56:56.402837Z",
            "movement":{
               "id":"ROROTSV:CMID=9c19fe74233c057f25e5ad333672c3f9/2b4a6b5b08ea434880562d6836b1036",
               "status":"PRE_ARRIVAL",
               "mode":"RORO_ACCOMPANIED_FREIGHT",
               "description":"vehicle-with-trailer",
               "booking":{
                  "reference":"357485637",
                  "type":"Online",
                  "paymentMethod":"Account",
                  "bookedAt":"2020-08-02T09:20:00Z",
                  "checkInAt":"2020-08-04T12:10:00Z",
                  "ticket":{
                     "number":"TIC-998765421",
                     "type":"Return",
                     "price":"59.99"
                  },
                  "country":"GB"
               },
               "journey":{
                  "id":"19aafdcd743bd63ca19bfe917f75a2db",
                  "arrival":{
                     "location":"CAL",
                     "time":"2020-08-04T13:55:00Z"
                  },
                  "departure":{
                     "location":"DOV",
                     "time":"2020-08-04T13:10:00Z"
                  }
               },
               "vessel":{
                  "operator":"DFDS",
                  "name":"KHALEESI SEAWAYS"
               },
               "person":{
                  "entitySearchUrl":"http://localhost:5010/search?type=PERSON&term=103000003407504&fields=[%22id%22]",
                  "name":{
                     "first":"Daniel",
                     "last":"Fagan",
                     "full":"Daniel Fagan"
                  },
                  "dateOfBirth":"1984-08-03T00:00:00Z",
                  "gender":"M",
                  "nationality":"GB",
                  "document":{
                     "entitySearchUrl":null,
                     "type":"PASSPORT",
                     "number":"ST0392315",
                     "expiry":"2021-02-01T00:00:00Z"
                  },
                  "movementStats":null
               },
               "otherPersons":[
                  {
                     "entitySearchUrl":"http://localhost:5010/search?type=PERSON&term=101234567888,101234567999&fields=[%22id%22]",
                     "name":{
                        "first":"Donald",
                        "last":"Fox",
                        "full":"Donald Fox"
                     },
                     "dateOfBirth":"1981-06-03T00:00:00Z",
                     "gender":"M",
                     "nationality":"GB",
                     "document":{
                        "entitySearchUrl":null,
                        "type":"PASSPORT",
                        "number":"ST0394612",
                        "expiry":"2021-02-01T00:00:00Z"
                     },
                     "movementStats":null
                  }
               ],
               "vehicle":{
                  "entitySearchUrl":"http://localhost:5010/search?type=VEHICLE&term=103000003407504&fields=[%22id%22]",
                  "type":"Truck",
                  "registration":"GB57MJP",
                  "nationality":"GB",
                  "colour":"Grey",
                  "model":"R-Series",
                  "make":"Scania",
                  "netWeight":"3455",
                  "grossWeight":"43623",
                  "movementStats":null
               },
               "trailer":{
                  "entitySearchUrl":"http://localhost:5010/search?type=VEHICLE&term=103000003407321&fields=[%22id%22]",
                  "type":"TR",
                  "registration":"GB09NFD",
                  "nationality":"GB",
                  "length":"75",
                  "height":"3",
                  "loadStatus":"Empty",
                  "movementStats":null
               },
               "goods":{
                  "description":"PPE Masks",
                  "hazardous":false,
                  "weight":null,
                  "destination":null
               },
               "haulier":{
                  "entitySearchUrl":null,
                  "name":"Sinkable Hauling",
                  "address":null,
                  "contacts":{
                     "phone":{
                        "value":"289675932",
                        "entitySearchUrl":null
                     },
                     "mobile":{
                        "value":"07809123456",
                        "entitySearchUrl":null
                     }
                  },
                  "movementStats":null
               },
               "account":{
                  "entitySearchUrl":"http://localhost:5010/search?type=ORGANISATION&term=10311111113407504&fields=[%22id%22]",
                  "name":"Safe Cafe Medical PPE",
                  "shortName":"SCM PPE",
                  "reference":"000361676",
                  "address":{
                     "entitySearchUrl":null,
                     "line1":"University of Portsmouth",
                     "line2":"Royal Dockyards",
                     "city":"Portsmouth",
                     "postcode":"PO1 2EF",
                     "country":"GB"
                  },
                  "contacts":{
                     "phone":{
                        "value":"01234 926459",
                        "entitySearchUrl":null
                     },
                     "mobile":{
                        "value":"07809 386670",
                        "entitySearchUrl":null
                     }
                  },
                  "movementStats":null
               },
               "booker":null,
               "occupants":{
                  "numberOfOaps":0,
                  "numberOfAdults":1,
                  "numberOfChildren":0,
                  "numberOfInfants":0,
                  "numberOfUnknowns":3,
                  "numberOfOccupants":4
               }
            },
            "risks":{
               "targetingIndicators":{
                  "indicators":[
                     {
                        "id":1,
                        "name":"VEHICLE-FREIGHT-QUICK-TURNAROUND-0_24_HRS",
                        "description":"Quick turnaround freight (under 24 hours)",
                        "score":30
                     },
                     {
                        "id":2,
                        "name":"VEHICLE-TOURIST-QUICK-TURNAROUND-0_24_HRS",
                        "description":"Quick turnaround tourist (under 24 hours)",
                        "score":30
                     }
                  ],
                  "count":2,
                  "score":60
               },
               "matchedRules":[
                  {
                     "id":535,
                     "name":"Selector Matched Rule",
                     "type":"Both",
                     "priority":"Tier 1",
                     "description":"Test",
                     "version":1,
                     "abuseTypes":[
                        "National Security at the Border"
                     ],
                     "indicatorMatches":[
                        {
                           "entity":"Message",
                           "descriptor":"mode",
                           "operator":"in",
                           "value":"[RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]"
                        },
                        {
                           "entity":"Message",
                           "descriptor":"selectorsMatched",
                           "operator":"equal",
                           "value":"true"
                        }
                     ]
                  },
                  {
                     "id":556,
                     "name":"Checkin lead time",
                     "type":"Both",
                     "priority":"Tier 4",
                     "description":"Qui nesciunt suscip",
                     "version":1,
                     "abuseTypes":[
                        "Class A Drugs"
                     ],
                     "indicatorMatches":[
                        {
                           "entity":"Booking",
                           "descriptor":"checkInLeadTime",
                           "operator":"between",
                           "value":"[1, 24]"
                        },
                        {
                           "entity":"Message",
                           "descriptor":"mode",
                           "operator":"in",
                           "value":"[RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]"
                        }
                     ]
                  }
               ],
               "matchedSelectorGroups":{
                  "groups":[
                     {
                        "groupReference":"SR-245",
                        "groupVersionNumber":1,
                        "requestingOfficer":"fe",
                        "intelligenceSource":"fefe",
                        "category":"A",
                        "threatType":"Class A Drugs",
                        "pointOfContactMessage":"fdvdfb",
                        "pointOfContact":"bfb",
                        "inboundActionCode":"No action required",
                        "outboundActionCode":"No action required",
                        "notes":"notes",
                        "creator":"user",
                        "selectors":[
                           {
                              "id":279,
                              "reference":"2021-279",
                              "category":"A",
                              "warning":{
                                 "status":"NO",
                                 "types":[
                                    
                                 ],
                                 "detail":null
                              },
                              "indicatorMatches":[
                                 {
                                    "entity":"Message",
                                    "descriptor":"mode",
                                    "operator":"in",
                                    "value":"RORO Accompanied Freight"
                                 },
                                 {
                                    "entity":"Trailer",
                                    "descriptor":"registrationNumber",
                                    "operator":"equal",
                                    "value":"qwerty"
                                 }
                              ],
                              "description":"RORO Accompanied Freight qwerty"
                           },
                           {
                              "id":300,
                              "reference":"2022-300",
                              "category":"B",
                              "warning":{
                                 "status":"NO",
                                 "types":[
                                    
                                 ],
                                 "detail":null
                              },
                              "indicatorMatches":[
                                 {
                                    "entity":"Trailer",
                                    "descriptor":"registrationNumber",
                                    "operator":"equal",
                                    "value":"GB09NFD"
                                 }
                              ],
                              "description":"GB09NFD"
                           }
                        ]
                     }
                  ],
                  "totalNumberOfSelectors":2
               },
               "highestThreatLevelRiskType":"RULE",
               "highestThreatLevel":"A"
            }
         }
      ]
    },
  };

  const getTaskData = async () => {
    let response;
    try {
      response = await apiClient.get(`/targeting-tasks/${businessKey}`);
      setTaskData(response.data);
    } catch {
      // until API is ready we set the temp data in the catch
      // this will be changed to the error handling
      response = tempData;

      // findAndUpdateTaskVersionDifferences is a mutable function
      const { differencesCounts } = findAndUpdateTaskVersionDifferencesAirPax(response.data.versions);
      setTaskData({
        ...response.data, taskVersionDifferencesCounts: differencesCounts,
      });
    }
  };

  const getAirlineCodes = async () => {
    let response;
    try {
      response = await refDataClient.get('/v2/entities/carrierlist', {
        params: {
          mode: 'dataOnly',
        },
      });
      setRefDataAirlineCodes(response.data.data);
    } catch (e) {
      setRefDataAirlineCodes([]);
    }
  };

  useEffect(() => {
    if (taskData) {
      setAssignee(taskData.assignee);
      setFormattedTaskStatus(formatTaskStatusToCamelCase(taskData.status));
      setLoading(false);
    }
  }, [taskData, setAssignee, setLoading]);

  useEffect(() => {
    getTaskData(businessKey);
    getAirlineCodes();
  }, [businessKey]);

  // TEMP NOTES FORM FOR TESTING
  const AddANoteForm = () => {
    return (
      <div>
        Add a new note
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner><br /><br /><br /></LoadingSpinner>;
  }

  return (
    <>
      <div className="govuk-grid-row govuk-task-detail-header govuk-!-padding-bottom-9">
        <div className="govuk-grid-column-one-half">
          <span className="govuk-caption-xl">{businessKey}</span>
          <h3 className="govuk-heading-xl govuk-!-margin-bottom-0">Overview</h3>
          {(formattedTaskStatus !== TASK_STATUS_TARGET_ISSUED && formattedTaskStatus !== TASK_STATUS_COMPLETED)
            && (
            <ClaimUnclaimTask
              assignee={taskData.assignee}
              currentUser={currentUser}
              businessKey={businessKey}
              source={`/airpax/tasks/${businessKey}`}
              buttonType="textLink"
            />
            )}
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {taskData && (
            <TaskVersions
              taskVersions={taskData.versions}
              businessKey={businessKey}
              taskVersionDifferencesCounts={taskData.taskVersionDifferencesCounts}
              airlineCodes={refDataAirlineCodes}
            />
          )}
        </div>
        <div className="govuk-grid-column-one-third">
          {currentUser === assignee && <AddANoteForm />}
          <ActivityLog
            activityLog={taskData?.notes}
          />
        </div>
      </div>

    </>
  );
};

export default TaskDetailsPage;
