import { modifyRoRoPassengersTaskList,
  hasCheckinDate,
  hasEta,
  hasCarrierCounts,
  hasTaskVersionPassengers,
  extractTaskVersionsBookingField,
  modifyCountryCodeIfPresent } from '../roroDataUtil';

import { testRoroData } from '../__fixtures__/roroData.fixture';

describe('RoRoData Util', () => {
  it('should return a modified roroData object with a list of 2 passengers', () => {
    const modifiedRoroData = modifyRoRoPassengersTaskList({ ...testRoroData });
    expect(modifiedRoroData.passengers.length).toEqual(2);
  });

  it('should return false if given empty', () => {
    const result = hasCheckinDate('');
    expect(result).toBeFalsy();
  });

  it('should return false if given null', () => {
    const result = hasCheckinDate(null);
    expect(result).toBeFalsy();
  });

  it('should return false if given undefined', () => {
    const result = hasCheckinDate(undefined);
    expect(result).toBeFalsy();
  });

  it('should return true if given not null, undefined or empty', () => {
    const result = hasCheckinDate('2022-01-22T10:12:55');
    expect(result).toBeTruthy();
  });

  it('should return false for hasEta if given empty', () => {
    const result = hasEta('');
    expect(result).toBeFalsy();
  });

  it('should return false for hasEta if given null', () => {
    const result = hasEta(null);
    expect(result).toBeFalsy();
  });

  it('should return false for hasEta if given undefined', () => {
    const result = hasEta(undefined);
    expect(result).toBeFalsy();
  });

  it('should return true for hasEta if given not null, undefined or empty', () => {
    const result = hasEta('2022-01-22T10:12:55');
    expect(result).toBeTruthy();
  });

  it('should true when all counts have non-null content', () => {
    const suppliedPassengerCounts = [
      {
        propName: 'infantCount',
      },
      {
        propName: 'childCount',
      },
      {
        propName: 'adultCount',
      },
      {
        propName: 'oapCount',
      },
    ];
    const result = hasCarrierCounts(suppliedPassengerCounts);
    expect(result).toBeTruthy();
  });

  it('should return a check-in time that is a concatenated datetime string', () => {
    const expectedCheckInDataTime = '2020-08-03T12:05:00,2020-08-03T13:05:00Z';

    const taskVersionMinified = [
      {
        fieldSetName: 'Booking and check-in',
        hasChildSet: false,
        contents: [
          {
            fieldName: 'Check-in',
            type: 'DATETIME',
            content: '2020-08-03T12:05:00',
            versionLastUpdated: null,
            propName: 'checkIn',
          },
        ],
        type: 'null',
        propName: 'booking',
      },
    ];

    const testRoroDataMinified = {
      roro: {
        details: {
          departureTime: '2020-08-03T13:05:00Z',
        },
      },
    };

    const result = extractTaskVersionsBookingField(taskVersionMinified, testRoroDataMinified);
    const modifiedCheckInTime = result.contents.find(({ propName }) => propName === 'checkIn').content;

    expect(modifiedCheckInTime).toEqual(expectedCheckInDataTime);
  });

  it('should return check-in time with no concatenated datetime string when departure time is empty', () => {
    const expectedCheckInDataTime = '2020-08-03T12:05:00';

    const taskVersionMinified = [
      {
        fieldSetName: 'Booking and check-in',
        hasChildSet: false,
        contents: [
          {
            fieldName: 'Check-in',
            type: 'DATETIME',
            content: '2020-08-03T12:05:00',
            versionLastUpdated: null,
            propName: 'checkIn',
          },
        ],
        type: 'null',
        propName: 'booking',
      },
    ];

    const testRoroDataMinified = {
      roro: {
        details: {
          departureTime: '',
        },
      },
    };

    const result = extractTaskVersionsBookingField(taskVersionMinified, testRoroDataMinified);
    const modifiedCheckInTime = result.contents.find(({ propName }) => propName === 'checkIn').content;

    expect(modifiedCheckInTime).toEqual(expectedCheckInDataTime);
  });

  it('should return check-in time with no concatenated datetime string when check-in time is null', () => {
    const taskVersionMinified = [
      {
        fieldSetName: 'Booking and check-in',
        hasChildSet: false,
        contents: [
          {
            fieldName: 'Check-in',
            type: 'DATETIME',
            content: null,
            versionLastUpdated: null,
            propName: 'checkIn',
          },
        ],
        type: 'null',
        propName: 'booking',
      },
    ];

    const testRoroDataMinified = {
      roro: {
        details: {
          departureTime: '2020-08-03T13:05:00Z',
        },
      },
    };

    const result = extractTaskVersionsBookingField(taskVersionMinified, testRoroDataMinified);
    const modifiedCheckInTime = result.contents.find(({ propName }) => propName === 'checkIn').content;

    expect(modifiedCheckInTime).toBeFalsy();
  });

  it('Should return a country name from country code provided', () => {
    const bookingFieldMinified = {
      fieldSetName: 'Booking and check-in',
      hasChildSet: false,
      contents: [
        {
          fieldName: 'Country',
          type: 'STRING',
          content: 'GB',
          versionLastUpdated: null,
          propName: 'country',
        },
      ],
      type: 'null',
      propName: 'booking',
    };
    const result = modifyCountryCodeIfPresent(bookingFieldMinified);
    expect(result.contents?.find(({ propName }) => propName === 'country').content).toBe('United Kingdom (GB)');
  });

  it('Should return Falsy when country code is not provided', () => {
    const bookingFieldMinified = {
      fieldSetName: 'Booking and check-in',
      hasChildSet: false,
      contents: [
        {
          fieldName: 'Country',
          type: 'STRING',
          content: null,
          versionLastUpdated: null,
          propName: 'country',
        },
      ],
      type: 'null',
      propName: 'booking',
    };
    const result = modifyCountryCodeIfPresent(bookingFieldMinified);
    expect(result.contents?.find(({ propName }) => propName === 'country').content).toBeFalsy();
  });

  it('should return false for absence of a valid passenger when not found', () => {
    const given = {
      fieldSetName: 'Passengers',
      hasChildSet: true,
      contents: [],
      childSets: [
        {
          fieldSetName: '',
          hasChildSet: false,
          contents: [
            {
              fieldName: 'Name',
              type: 'STRING',
              content: null,
              versionLastUpdated: null,
              propName: 'name',
            },
            {
              fieldName: 'Date of birth',
              type: 'SHORT_DATE',
              content: null,
              versionLastUpdated: null,
              propName: 'dob',
            },
            {
              fieldName: 'Enrichment count',
              type: 'HIDDEN',
              content: '-/-/-',
              versionLastUpdated: null,
              propName: 'enrichmentCount',
            },
          ],
          type: 'null',
          propName: '',
        },
        {
          fieldSetName: '',
          hasChildSet: false,
          contents: [
            {
              fieldName: 'Name',
              type: 'STRING',
              content: null,
              versionLastUpdated: null,
              propName: 'name',
            },
            {
              fieldName: 'Date of birth',
              type: 'SHORT_DATE',
              content: null,
              versionLastUpdated: null,
              propName: 'dob',
            },
            {
              fieldName: 'Enrichment count',
              type: 'HIDDEN',
              content: '-/-/1',
              versionLastUpdated: null,
              propName: 'enrichmentCount',
            },
          ],
          type: 'null',
          propName: '',
        },
      ],
      type: 'STANDARD',
      propName: 'passengers',
    };
    const outcome = hasTaskVersionPassengers(given);
    expect(outcome).toEqual(false);
  });

  it('should return true for presence of a valid passenger when found', () => {
    const given = {
      fieldSetName: 'Passengers',
      hasChildSet: true,
      contents: [],
      childSets: [
        {
          fieldSetName: '',
          hasChildSet: false,
          contents: [
            {
              fieldName: 'Name',
              type: 'STRING',
              content: 'JOE BLOGGS',
              versionLastUpdated: null,
              propName: 'name',
            },
            {
              fieldName: 'Date of birth',
              type: 'SHORT_DATE',
              content: null,
              versionLastUpdated: null,
              propName: 'dob',
            },
            {
              fieldName: 'Enrichment count',
              type: 'HIDDEN',
              content: '-/-/-',
              versionLastUpdated: null,
              propName: 'enrichmentCount',
            },
          ],
          type: 'null',
          propName: '',
        },
        {
          fieldSetName: '',
          hasChildSet: false,
          contents: [
            {
              fieldName: 'Name',
              type: 'STRING',
              content: 'JOHN CHEESE',
              versionLastUpdated: null,
              propName: 'name',
            },
            {
              fieldName: 'Date of birth',
              type: 'SHORT_DATE',
              content: null,
              versionLastUpdated: null,
              propName: 'dob',
            },
            {
              fieldName: 'Enrichment count',
              type: 'HIDDEN',
              content: '-/-/-',
              versionLastUpdated: null,
              propName: 'enrichmentCount',
            },
          ],
          type: 'null',
          propName: '',
        },
      ],
      type: 'STANDARD',
      propName: 'passengers',
    };
    const outcome = hasTaskVersionPassengers(given);
    expect(outcome).toEqual(true);
  });
});
