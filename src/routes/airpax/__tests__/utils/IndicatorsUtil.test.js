import renderer from 'react-test-renderer';
import { IndicatorsUtil } from '../../utils';

describe('IndicatorsUtil', () => {
  it('should get risk if present', () => {
    const targetListDataMin = {
      id: 'DEV-20220415-001',
      risks: {
        targetingIndicators: {
          indicators: [
            {
              description: 'Quick turnaround freight (under 24 hours)',
            },
            {
              description: 'Quick turnaround tourist (under 24 hours)',
            },
          ],
          count: 2,
          score: 60,
        },
      },
    };

    const expected = {
      targetingIndicators: {
        indicators: [
          {
            description: 'Quick turnaround freight (under 24 hours)',
          },
          {
            description: 'Quick turnaround tourist (under 24 hours)',
          },
        ],
        count: 2,
        score: 60,
      },
    };

    const output = IndicatorsUtil.getRisks(targetListDataMin);
    expect(output).toEqual(expected);
  });

  it('should get targeting indicators if present', () => {
    const risks = {
      targetingIndicators: {
        indicators: [
          {
            description: 'Quick turnaround freight (under 24 hours)',
          },
          {
            description: 'Quick turnaround tourist (under 24 hours)',
          },
        ],
        count: 2,
        score: 60,
      },
    };

    const expected = {
      indicators: [
        {
          description: 'Quick turnaround freight (under 24 hours)',
        },
        {
          description: 'Quick turnaround tourist (under 24 hours)',
        },
      ],
      count: 2,
      score: 60,
    };

    const output = IndicatorsUtil.getIndicators(risks);
    expect(output).toEqual(expected);
  });

  it('should return a formatted targeting indicators if present', () => {
    const targetingIndicators = {
      indicators: [
        {
          description: 'Quick turnaround freight (under 24 hours)',
        },
        {
          description: 'Quick turnaround tourist (under 24 hours)',
        },
      ],
      count: 2,
      score: 60,
    };

    const tree = renderer.create(IndicatorsUtil.format(targetingIndicators)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render No warnings text if warning status is NO', () => {
    const selector = {
      id: 279,
      reference: '2021-279 A',
      category: 'A',
      warning: {
        status: 'NO',
        types: [

        ],
        detail: null,
      },
    };

    const output = IndicatorsUtil.getWarning(selector);
    expect(output).toEqual('No warnings');
  });

  it('should render Warnings currently unavailable text if warning status is Currently unavailable', () => {
    const selector = {
      id: 279,
      reference: '2021-279 A',
      category: 'A',
      warning: {
        status: 'Currently unavailable',
        types: [

        ],
        detail: null,
      },
    };

    const output = IndicatorsUtil.getWarning(selector);
    expect(output).toEqual('Warnings currently unavailable');
  });

  it('should render comma seperated warnings if warning status is YES', () => {
    const selector = {
      id: 279,
      reference: '2021-279 A',
      category: 'A',
      warning: {
        status: 'YES',
        types: ['VIOL', 'FIRE', 'WEAP', 'CTGN', 'SEH'],
        detail: null,
      },
    };

    const output = IndicatorsUtil.getWarning(selector);
    expect(output).toEqual('Violence, Firearms, Weapons, Contagion, Self Harm');
  });

<<<<<<< HEAD
  it('should render nothing if warning status is null', () => {
    const selector = {
      id: 279,
      reference: '2021-279 A',
      category: 'A',
      warning: {
        status: null,
        types: [],
        detail: null,
      },
    };

    const output = IndicatorsUtil.getWarning(selector);
    expect(output).toEqual(undefined);
  });

  it('should get indicator matches if present', () => {
=======
  it('should get indicators matches if present', () => {
>>>>>>> COP-10599: Added selector matches to task versions
    const selector = {
      indicatorMatches: [
        {
          entity: 'Message',
          descriptor: 'mode',
          operator: 'in',
          value: 'RORO Accompanied Freight',
        },
        {
          entity: 'Trailer',
          descriptor: 'registrationNumber',
          operator: 'equal',
          value: 'qwerty',
        },
      ],
    };

    const expected = [
      {
        descriptor: 'mode',
        entity: 'Message',
        operator: 'in',
        value: 'RORO Accompanied Freight',
      },
      {
        descriptor: 'registrationNumber',
        entity: 'Trailer',
        operator: 'equal',
        value: 'qwerty',
      },
    ];
    const output = IndicatorsUtil.getMatches(selector);
    expect(output).toEqual(expected);
  });

  it('should return empty array if indicator matches does not contain any indicators', () => {
    const selector = {
      indicatorMatches: [],
    };

    const output = IndicatorsUtil.getMatches(selector);
    expect(output).toEqual([]);
  });

  it('should return null if indicator matches is null', () => {
    const selector = {
      indicatorMatches: null,
    };

    const output = IndicatorsUtil.getMatches(selector);
    expect(output).toEqual(null);
  });
});
