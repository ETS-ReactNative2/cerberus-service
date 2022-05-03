import renderer from 'react-test-renderer';

import { UNKNOWN_TEXT } from '../../../../constants';
import { PersonUtil } from '../../utils';

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

  it('should return total number of people within a movement with 1 person', () => {
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
        otherPersons: [],
      },
    };

    const output = PersonUtil.totalPersons(targetTaskMin);
    expect(output).toEqual(1);
  });

  it('should return total number of people within a movement with multiple persons', () => {
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
        otherPersons: [
          {
            name: {
              first: 'John',
              last: 'Cheese',
              full: 'John Cheese',
            },
            role: 'PASSENGER',
            dateOfBirth: '1967-05-13T00:00:00Z',
            gender: 'M',
            nationality: 'GBR',
            document: null,
          },
        ],
      },
    };

    const output = PersonUtil.totalPersons(targetTaskMin);
    expect(output).toEqual(2);
  });

  it('should return nationality if present', () => {
    const output = PersonUtil.nationality(person);
    expect(output).toEqual(person.nationality);
  });

  it('should return dob if present', () => {
    const output = PersonUtil.dob(person);
    expect(output).toEqual('13 May 1966');
  });

  it('should show gender text when person is of gender male', () => {
    const output = PersonUtil.gender(person);
    expect(output).toEqual('Male');
  });

  it('should show gender text when person is of gender female', () => {
    person.gender = 'F';
    const output = PersonUtil.gender(person);
    expect(output).toEqual('Female');
  });

  it('should show unknown when person is of no specified gender', () => {
    person.gender = '';
    const output = PersonUtil.gender(person);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should show unknown when gender is null', () => {
    person.gender = null;
    const output = PersonUtil.gender(person);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should show unknown when gender is undefined', () => {
    person.gender = undefined;
    const output = PersonUtil.gender(person);
    expect(output).toEqual(UNKNOWN_TEXT);
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
