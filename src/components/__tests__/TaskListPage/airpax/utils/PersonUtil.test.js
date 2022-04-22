import renderer from 'react-test-renderer';
import { PersonUtil } from '../../../../TaskListPage/airpax/utils/index';

describe('PersonUtil', () => {
  const person = {
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
  };

  it('should get a person object if present', () => {
    const targetTaskMin = {
      movement: {
        person: {
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
        },
      },
    };

    const output = PersonUtil.get(targetTaskMin);
    expect(output).toEqual(person);
  });

  it('should validate the presence of person', () => {
    const targetTaskMin = {
      movement: {
        person: {
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
        },
      },
    };

    const output = PersonUtil.has(targetTaskMin);
    expect(output).toBeTruthy();
  });

  it('should validate the absence of person', () => {
    const targetTaskMin = {
      movement: {},
    };

    const output = PersonUtil.has(targetTaskMin);
    expect(output).toBeFalsy();
  });

  it('should check if other persons are present', () => {
    const targetTaskMin = {
      movement: {
        otherPersons: [],
      },
    };

    const output = PersonUtil.hasOthers(targetTaskMin);
    expect(output).toBeFalsy();
  });

  it('should get other persons if present', () => {
    const targetTaskMin = {
      movement: {
        otherPersons: [
          {
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
          },
        ],
      },
    };

    const output = PersonUtil.getOthers(targetTaskMin);
    expect(output).toEqual([person]);
  });

  it('should return total number pf people within the movement', () => {
    const targetTaskMin = {
      movement: {
        person: {
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
        },
      },
    };

    const output = PersonUtil.totalPersons(targetTaskMin);
    expect(output).toEqual(1);
  });

  it('should return nationality if present', () => {
    const output = PersonUtil.nationality(person);
    expect(output).toEqual(person.nationality);
  });

  it('should return dob if present', () => {
    const output = PersonUtil.dob(person);
    expect(output).toEqual('13 May 1966');
  });

  it('should return gender if present', () => {
    const output = PersonUtil.gender(person);
    expect(output).toEqual('Male');
  });

  it('should return first name if present', () => {
    const output = PersonUtil.firstname(person);
    expect(output).toEqual(person.name.first);
  });

  it('should return last name if present', () => {
    const output = PersonUtil.lastname(person);
    expect(output).toEqual(person.name.last.toUpperCase());
  });

  it('should return a formatted co-travellers block', () => {
    const otherPersons = [
      {
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
      },
      {
        name: {
          first: 'Joe',
          last: 'Bloggs',
          full: 'Joe Bloggs',
        },
        role: 'PASSENGER',
        dateOfBirth: '1978-05-13T00:00:00Z',
        gender: 'M',
        nationality: 'FRA',
        document: null,
      },
    ];
    const tree = renderer.create(PersonUtil.toOthers(otherPersons)).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
