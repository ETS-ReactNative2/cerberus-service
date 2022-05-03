const targetListData = {
  id: 'DEV-20220415-001',
  status: 'NEW',
  assignee: null,
  relisted: false,
  latestVersionNumber: 1,
  notes: [],
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
    otherPersons: [],
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
    matchedRules: [],
    matchedSelectorGroups: {
      groups: [],
      totalNumberOfSelectors: 0,
    },
    highestThreatLevel: null,
  },
  versions: [],
};

export default targetListData;
