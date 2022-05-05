const targetListData = {
  id: 'DEV-20220419-001',
  status: 'NEW',
  assignee: 'test',
  relisted: false,
  latestVersionNumber: 1,
  notes: [
    {
      id: '123',
      content: 'task created',
      timestamp: '2022-04-19T10:01:48.460594Z',
      userId: 'rules-based-targeting',
    },
  ],
  movement: {
    id: 'AIRPAXTSV:CMID=9c19fe74233c057f25e5ad333672c3f9/2b4a6b5b08ea434880562d6836b1111',
    status: 'PRE_ARRIVAL',
    mode: 'AIR_PASSENGER',
    description: 'individual',
    booking: {
      reference: null,
      type: null,
      paymentMethod: null,
      bookedAt: null,
      checkInAt: null,
      ticket: {
        number: null,
        type: null,
        price: null,
      },
      country: null,
    },
    journey: {
      id: 'BA103',
      arrival: {
        country: null,
        location: 'LHR',
        time: null,
      },
      departure: {
        country: null,
        location: 'FRA',
        time: '2020-08-07T17:15:00Z',
      },
      route: [
        'FRA',
        'LHR',
      ],
      itinerary: [
        {
          id: 'BA103',
          arrival: {
            country: null,
            location: 'LHR',
            time: null,
          },
          departure: {
            country: null,
            location: 'FRA',
            time: '2020-08-07T17:15:00Z',
          },
        },
      ],
    },
    vessel: null,
    person: {
      entitySearchUrl: null,
      name: {
        first: 'Isaiah',
        last: 'Ford',
        full: 'Isaiah Ford',
      },
      role: 'PASSENGER',
      dateOfBirth: '1966-05-13T00:00:00Z',
      gender: 'M',
      nationality: 'GBR',
      document: null,
      movementStats: null,
      frequentFlyerNumber: null,
    },
    otherPersons: [

    ],
    flight: {
      departureStatus: 'DC',
      number: 'BA103',
      operator: 'BA',
      seatNumber: null,
    },
    baggage: {
      numberOfCheckedBags: 1,
      weight: '1',
    },
    vehicle: null,
    trailer: null,
    goods: null,
    haulier: null,
    account: null,
    booker: null,
    occupants: null,
  },
  risks: {
    targetingIndicators: {
      indicators: [
        {
          id: 1,
          name: 'VEHICLE-FREIGHT-QUICK-TURNAROUND-0_24_HRS',
          description: 'Quick turnaround freight (under 24 hours)',
          score: 30,
        },
        {
          id: 2,
          name: 'VEHICLE-TOURIST-QUICK-TURNAROUND-0_24_HRS',
          description: 'Quick turnaround tourist (under 24 hours)',
          score: 30,
        },
      ],
      count: 2,
      score: 60,
    },
    matchedRules: [

    ],
    matchedSelectorGroups: {
      groups: [

      ],
      totalNumberOfSelectors: 0,
    },
    highestThreatLevel: null,
  },
  versions: [
    {
      number: 2,
      createdAt: '2022-04-25T11:55:05.416744800Z',
      movement: {
        id: 'APIPNR:CMID=15148b83b4fbba770dad11348d1c9b09',
        status: 'PRE_ARRIVAL',
        mode: 'AIR_PASSENGER',
        description: 'group',
        booking: {
          reference: 'LSV4UV',
          type: null,
          paymentMethod: null,
          bookedAt: null,
          checkInAt: null,
          ticket: {
            number: null,
            type: null,
            price: null,
          },
          country: null,
          payments: [
            {
              amount: 2190.48,
              card: {
                number: '30XXXXXXXXXXX63X',
                expiry: '2020-10-01T00:00:00Z',
              },
            },
            {
              amount: 2190.48,
              card: {
                number: '30XXXXXXXXXXX63X',
                expiry: '2020-10-01T00:00:00Z',
              },
            },
          ],
        },
        journey: {
          id: 'AC0850',
          arrival: {
            country: 'GB',
            location: 'LHR',
            time: '2021-10-03T21:19:20Z',
          },
          departure: {
            country: 'CA',
            location: 'YYC',
            time: '2018-10-03T18:32:40Z',
          },
          route: [
            'CDG',
            'YYZ',
            'YYC',
            'LHR',
          ],
          itinerary: [
            {
              id: 'AC0850',
              arrival: {
                country: 'CA',
                location: 'YYZ',
                time: '2018-10-03T13:05:00Z',
              },
              departure: {
                country: 'FR',
                location: 'CDG',
                time: '2018-10-03T11:00:00Z',
              },
              duration: 7500000,
            },
            {
              id: 'BD0998',
              arrival: {
                country: 'CA',
                location: 'YYC',
                time: '2018-10-03T18:16:00Z',
              },
              departure: {
                country: 'CA',
                location: 'YYZ',
                time: '2018-10-03T16:05:00Z',
              },
              duration: 7860000,
            },
            {
              id: 'XZ0123',
              arrival: {
                country: 'GB',
                location: 'LHR',
                time: '2018-10-03T21:19:20Z',
              },
              departure: {
                country: 'CA',
                location: 'YYC',
                time: '2018-10-03T18:32:40Z',
              },
              duration: 10000000,
            },
          ],
          duration: 10000000,
        },
        vessel: null,
        person: {
          entitySearchUrl: null,
          name: {
            first: 'GEMMA',
            last: 'MESTA',
            full: 'GEMMA MESTA',
          },
          role: 'CREW',
          dateOfBirth: null,
          gender: null,
          nationality: null,
          document: {
            type: 'Passport',
            number: '1234567890',
            countryOfIssue: 'FR',
            nationality: 'GB',
            validFrom: '2020-04-14T00:00:00Z',
            validTo: '2025-04-14T00:00:00Z',
            firstName: 'Miss Gemma',
            lastName: 'Mesta',
            dateOfBirth: '1970-04-14T00:00:00Z',
          },
          movementStats: null,
          frequentFlyerNumber: '579419193A',
          ssrCodes: [
            'DOCS',
            'AUTH',
          ],
        },
        otherPersons: [
          {
            entitySearchUrl: null,
            name: {
              first: null,
              last: 'MAUSSER',
              full: 'MAUSSER',
            },
            role: 'CREW',
            dateOfBirth: '1970-04-14T00:00:00Z',
            gender: 'F',
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: null,
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
          {
            entitySearchUrl: null,
            name: {
              first: 'SHARON',
              last: 'MAUSSER',
              full: 'SHARON MAUSSER',
            },
            role: 'CREW',
            dateOfBirth: null,
            gender: null,
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: '763381878A',
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
          {
            entitySearchUrl: null,
            name: {
              first: null,
              last: null,
              full: null,
            },
            role: 'CREW',
            dateOfBirth: '1967-06-10T00:00:00Z',
            gender: 'M',
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: null,
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
        ],
        flight: {
          departureStatus: null,
          number: 'AC0850',
          operator: 'AC',
          seatNumber: null,
        },
        baggage: {
          numberOfCheckedBags: null,
          weight: null,
          tags: [

          ],
        },
        vehicle: null,
        trailer: null,
        goods: null,
        haulier: null,
        account: null,
        booker: null,
        occupants: null,
      },
      risks: {
        targetingIndicators: {
          indicators: [

          ],
          count: 0,
          score: 0,
        },
        matchedRules: [
          {
            id: 7808,
            name: 'PNR-Arrival Airport',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'arrivalLocations',
                operator: 'contains_any_of',
                value: '[lhr, man]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
            ],
          },
          {
            id: 7844,
            name: 'Return Leg- Return',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'bookingType',
                operator: 'equal',
                value: 'RETURN',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
            ],
          },
          {
            id: 7849,
            name: 'PNR-Risk-Rule',
            type: 'Both',
            priority: 'Tier 1',
            description: 'test pne',
            version: 1,
            abuseTypes: [
              'Class B&C Drugs inc. Cannabis',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
              {
                entity: 'Voyage',
                descriptor: 'arrivalLocation',
                operator: 'contains',
                value: 'LHR',
              },
            ],
          },
          {
            id: 7919,
            name: 'Generic rule - For trailer',
            type: 'Pre-load',
            priority: 'Tier 3',
            description: 'Eu velit commodo ill',
            version: 1,
            abuseTypes: [
              'International Trade inc. Missing Trader Intra-Community Fraud (MTIC)',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
              {
                entity: 'Trailer',
                descriptor: 'registrationNumber',
                operator: 'not_equal',
                value: 'AA005022',
              },
            ],
          },
          {
            id: 7963,
            name: 'Predict_Movement_Name_qwerty',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
            ],
          },
          {
            id: 8865,
            name: 'Duration of Whole trip',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Duration of Whole trip',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'durationOfWholeTrip',
                operator: 'between',
                value: '[1, 70]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
            ],
          },
          {
            id: 8867,
            name: 'Duration of Stay -days',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'durationOfStay',
                operator: 'between',
                value: '[1, 70]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
            ],
          },
        ],
        matchedSelectorGroups: {
          groups: [

          ],
          totalNumberOfSelectors: 0,
        },
        highestThreatLevel: {
          type: 'RULE',
          value: 'Tier 1',
        },
      },
    },
    {
      number: 1,
      createdAt: '2022-04-21T15:50:31.780311600Z',
      movement: {
        id: 'APIPNR:CMID=15148b83b4fbba770dad11348d1c9b09',
        status: 'PRE_ARRIVAL',
        mode: 'AIR_PASSENGER',
        description: 'group',
        booking: {
          reference: 'LSV4UV',
          type: null,
          paymentMethod: null,
          bookedAt: null,
          checkInAt: null,
          ticket: {
            number: null,
            type: null,
            price: null,
          },
          country: null,
          payments: [
            {
              amount: 2190.48,
              card: {
                number: '30XXXXXXXXXXX63X',
                expiry: '2020-10-01T00:00:00Z',
              },
            },
            {
              amount: 2190.48,
              card: {
                number: '30XXXXXXXXXXX63X',
                expiry: '2020-10-01T00:00:00Z',
              },
            },
          ],
        },
        journey: {
          id: 'AC0850',
          arrival: {
            country: null,
            location: 'LHR',
            time: '2018-09-20T10:00:00Z',
          },
          departure: {
            country: null,
            location: 'YYC',
            time: '2018-09-19T18:25:00Z',
          },
          route: [
            'YYC',
            'CDG',
            'YYZ',
            'YYC',
          ],
          itinerary: [
            {
              id: 'AC0850',
              arrival: {
                country: null,
                location: 'LHR',
                time: '2018-09-19T10:00:00Z',
              },
              departure: {
                country: null,
                location: 'YYC',
                time: '2018-09-19T18:25:00Z',
              },
              duration: -30300000,
            },
            {
              id: 'AC0850',
              arrival: {
                country: null,
                location: 'YYZ',
                time: '2018-10-03T13:05:00Z',
              },
              departure: {
                country: null,
                location: 'CDG',
                time: '2018-10-03T11:00:00Z',
              },
              duration: 7500000,
            },
            {
              id: 'AC0850',
              arrival: {
                country: null,
                location: 'YYC',
                time: '2018-10-03T18:16:00Z',
              },
              departure: {
                country: null,
                location: 'YYZ',
                time: '2018-10-03T16:05:00Z',
              },
              duration: 7860000,
            },
          ],
          duration: 56100000,
        },
        vessel: null,
        person: {
          entitySearchUrl: null,
          name: {
            first: 'GEMMA',
            last: 'MESTA',
            full: 'GEMMA MESTA',
          },
          role: 'UNKNOWN',
          dateOfBirth: null,
          gender: null,
          nationality: null,
          document: {
            type: 'Passport',
            number: '1234567890',
            countryOfIssue: 'FR',
            nationality: 'GB',
            validFrom: '1970-04-14T00:00:00Z',
            validTo: '1970-04-14T00:00:00Z',
            firstName: 'Miss Gemma',
            lastName: 'Mesta',
            dateOfBirth: '1970-04-14T00:00:00Z',
          },
          movementStats: null,
          frequentFlyerNumber: '579419193A',
          ssrCodes: [
            'DOCS',
            'AUTH',
          ],
        },
        otherPersons: [
          {
            entitySearchUrl: null,
            name: {
              first: null,
              last: 'MAUSSER',
              full: 'MAUSSER',
            },
            role: 'PASSENGER',
            dateOfBirth: '1970-04-14T00:00:00Z',
            gender: 'F',
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: null,
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
          {
            entitySearchUrl: null,
            name: {
              first: 'SHARON',
              last: 'MAUSSER',
              full: 'SHARON MAUSSER',
            },
            role: 'UNKNOWN',
            dateOfBirth: null,
            gender: null,
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: '763381878A',
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
          {
            entitySearchUrl: null,
            name: {
              first: null,
              last: null,
              full: null,
            },
            role: 'PASSENGER',
            dateOfBirth: '1967-06-10T00:00:00Z',
            gender: 'M',
            nationality: null,
            document: null,
            movementStats: null,
            frequentFlyerNumber: null,
            ssrCodes: [
              'DOCS',
              'AUTH',
            ],
          },
        ],
        flight: {
          departureStatus: null,
          number: 'AC0850',
          operator: 'AC',
          seatNumber: null,
        },
        baggage: {
          numberOfCheckedBags: null,
          weight: null,
          tags: null,
        },
        vehicle: null,
        trailer: null,
        goods: null,
        haulier: null,
        account: null,
        booker: null,
        occupants: null,
      },
      risks: {
        targetingIndicators: {
          indicators: [

          ],
          count: 0,
          score: 0,
        },
        matchedRules: [
          {
            id: 7808,
            name: 'PNR-Arrival Airport',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'arrivalLocations',
                operator: 'contains_any_of',
                value: '[lhr, man]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
            ],
          },
          {
            id: 7844,
            name: 'Return Leg- Return',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'bookingType',
                operator: 'equal',
                value: 'RETURN',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
            ],
          },
          {
            id: 7849,
            name: 'PNR-Risk-Rule',
            type: 'Both',
            priority: 'Tier 1',
            description: 'test pne',
            version: 1,
            abuseTypes: [
              'Class B&C Drugs inc. Cannabis',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Passenger]',
              },
              {
                entity: 'Voyage',
                descriptor: 'arrivalLocation',
                operator: 'contains',
                value: 'LHR',
              },
            ],
          },
          {
            id: 7919,
            name: 'Generic rule - For trailer',
            type: 'Pre-load',
            priority: 'Tier 3',
            description: 'Eu velit commodo ill',
            version: 1,
            abuseTypes: [
              'International Trade inc. Missing Trader Intra-Community Fraud (MTIC)',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
              {
                entity: 'Trailer',
                descriptor: 'registrationNumber',
                operator: 'not_equal',
                value: 'AA005022',
              },
            ],
          },
          {
            id: 7963,
            name: 'Predict_Movement_Name_qwerty',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
              {
                entity: 'Movement',
                descriptor: 'name',
                operator: 'not_equal',
                value: 'qwerty',
              },
            ],
          },
          {
            id: 8865,
            name: 'Duration of Whole trip',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Duration of Whole trip',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'durationOfWholeTrip',
                operator: 'between',
                value: '[1, 70]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
            ],
          },
          {
            id: 8866,
            name: 'Duration of Stay -days',
            type: 'Both',
            priority: 'Tier 1',
            description: 'Test',
            version: 1,
            abuseTypes: [
              'Alcohol',
            ],
            indicatorMatches: [
              {
                entity: 'Booking',
                descriptor: 'durationOfStay',
                operator: 'between',
                value: '[1, 70]',
              },
              {
                entity: 'Message',
                descriptor: 'mode',
                operator: 'in',
                value: '[Air Freight, Air Passenger, Fast Parcels, RORO Accompanied Freight, RORO Tourist, RORO Unaccompanied Freight]',
              },
            ],
          },
        ],
        matchedSelectorGroups: {
          groups: [

          ],
          totalNumberOfSelectors: 0,
        },
        highestThreatLevel: {
          type: 'RULE',
          value: 'Tier 1',
        },
      },
    },
  ],
};

export default targetListData;
