import { UNKNOWN_TEXT } from '../../../constants';
import { formatField } from '../../../utils/formatField';

const getBaggageWeight = (baggage) => {
  if (!baggage) {
    return UNKNOWN_TEXT;
  }
  return formatField('WEIGHT', baggage.weight);
};

const hasBaggage = (targetTask) => {
  return !!targetTask.movement.baggage;
};

const getBaggage = (targetTask) => {
  if (hasBaggage(targetTask)) {
    return targetTask.movement.baggage;
  }
  return null;
};

const getCheckedBags = (baggage) => {
  if (baggage.numberOfCheckedBags === 0) {
    return 'No checked bags';
  }
  if (baggage.numberOfCheckedBags === 1) {
    return `${baggage.numberOfCheckedBags} checked bag`;
  }
  return `${baggage.numberOfCheckedBags} checked bags`;
};

const BaggageUtil = {
  get: getBaggage,
  weight: getBaggageWeight,
  checked: getCheckedBags,
};

export default BaggageUtil;

export { getBaggageWeight, getBaggage, getCheckedBags };
