import { BaggageUtil } from '../../utils';
import { UNKNOWN_TEXT } from '../../../../constants';

describe('BaggageUtil', () => {
  let targetTaskMin;
  let invalidValues = [
    [undefined, UNKNOWN_TEXT],
    [null, UNKNOWN_TEXT],
    ['', UNKNOWN_TEXT],
  ];

  let checkedBagsCounts = [
    [2, '2 bags'],
    [1, '1 bag'],
    [0, 'None'],
  ];

  beforeEach(() => {
    targetTaskMin = {
      movement: {
        baggage: {
          numberOfCheckedBags: 1,
          weight: '1',
        },
      },
    };
  });

  it('should return a baggage object', () => {
    const expected = {
      numberOfCheckedBags: 1,
      weight: '1',
    };

    const output = BaggageUtil.get(targetTaskMin);
    expect(output).toEqual(expected);
  });

  it('should return the number of checked bags if present', () => {
    const expected = '1 checked bag';
    const output = BaggageUtil.checked(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual(expected);
  });

  it('should return no checked bags when number of checked bags is 0', () => {
    targetTaskMin.movement.baggage.numberOfCheckedBags = 0;
    const expected = 'No checked bags';
    const output = BaggageUtil.checked(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual(expected);
  });

  it('should return none when number of checked bags is 0 for task details', () => {
    targetTaskMin.movement.baggage.numberOfCheckedBags = 0;
    const expected = 'None';
    const output = BaggageUtil.checked(BaggageUtil.get(targetTaskMin), true);
    expect(output).toEqual(expected);
  });

  it('should return number of checked bags', () => {
    targetTaskMin.movement.baggage.numberOfCheckedBags = 2;
    const expected = '2 checked bags';
    const output = BaggageUtil.checked(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual(expected);
  });

  it('should return null if no baggage object is found', () => {
    targetTaskMin.movement.baggage = null;
    const output = BaggageUtil.get(targetTaskMin);
    expect(output).toBeNull();
  });

  it('should return baggage weight if present', () => {
    targetTaskMin.movement.baggage.weight = '1';
    const output = BaggageUtil.weight(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual('1kg');
  });

  it.each(invalidValues)(
    'should return unknown for invalid weight values', (invalidValue, expected) => {
      targetTaskMin.movement.baggage.weight = invalidValue;
      const output = BaggageUtil.weight(BaggageUtil.get(targetTaskMin));
      expect(output).toEqual(expected);
    },
  );

  it('should return the count of checked bags', () => {
    targetTaskMin.movement.baggage.numberOfCheckedBags = 2;
    const output = BaggageUtil.checkedCount(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual(2);
  });

  it('should return the count of checked bags when count is 0', () => {
    targetTaskMin.movement.baggage.numberOfCheckedBags = 0;
    const output = BaggageUtil.checkedCount(BaggageUtil.get(targetTaskMin));
    expect(output).toEqual(0);
  });

  it.each(invalidValues)(
    'should return unknown for invalid number of checked bags', (invalidValue, expected) => {
      targetTaskMin.movement.baggage.numberOfCheckedBags = invalidValue;
      const output = BaggageUtil.checkedCount(BaggageUtil.get(targetTaskMin));
      expect(output).toEqual(expected);
    },
  );

  it.each(checkedBagsCounts)(
    'should return formatted checked bag count for valid number of checked bags', (bagCount, expected) => {
      targetTaskMin.movement.baggage.numberOfCheckedBags = bagCount;
      const output = BaggageUtil.formatCheckedCount(BaggageUtil.get(targetTaskMin));
      expect(output).toEqual(expected);
    },
  );

  it.each(invalidValues)(
    'should return formatted checked bag count for valid number of checked bags', (invalidValue, expected) => {
      targetTaskMin.movement.baggage.numberOfCheckedBags = invalidValue;
      const output = BaggageUtil.formatCheckedCount(BaggageUtil.get(targetTaskMin));
      expect(output).toEqual(expected);
    },
  );
});
