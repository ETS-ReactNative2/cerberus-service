import { BaggageUtil } from '../../utils';
import { UNKNOWN_TEXT } from '../../../../constants';

describe('BaggageUtil', () => {
  it('should return a baggage object', () => {
    const targetTaskMin = {
      movement: {
        baggage: {
          numberOfCheckedBags: 1,
          weight: '1',
        },
      },
    };

    const expected = {
      numberOfCheckedBags: 1,
      weight: '1',
    };

    const output = BaggageUtil.get(targetTaskMin);
    expect(output).toEqual(expected);
  });

  it('should return the number of checked bags if present', () => {
    const baggage = {
      numberOfCheckedBags: 1,
      weight: '1',
    };

    const expected = '1 checked bag';

    const output = BaggageUtil.checked(baggage);
    expect(output).toEqual(expected);
  });

  it('should return no checked bags if none is present', () => {
    const baggage = {
      numberOfCheckedBags: 0,
      weight: '1',
    };

    const expected = 'No checked bags';

    const output = BaggageUtil.checked(baggage);
    expect(output).toEqual(expected);
  });

  it('should return number of checked bags', () => {
    const baggage = {
      numberOfCheckedBags: 2,
      weight: '1',
    };

    const expected = '2 checked bags';

    const output = BaggageUtil.checked(baggage);
    expect(output).toEqual(expected);
  });

  it('should return null if no baggage object is found', () => {
    const targetTaskMin = {
      movement: {},
    };

    const output = BaggageUtil.get(targetTaskMin);
    expect(output).toBeNull();
  });

  it('should return baggage weight if found', () => {
    const baggage = {
      numberOfCheckedBags: 1,
      weight: '1',
    };
    const output = BaggageUtil.weight(baggage);
    expect(output).toEqual('1kg');
  });

  it('should return the default text for when baggage weight is not found', () => {
    const baggage = {
      numberOfCheckedBags: 1,
      weight: null,
    };
    const output = BaggageUtil.weight(baggage);
    expect(output).toEqual(UNKNOWN_TEXT);
  });
});
