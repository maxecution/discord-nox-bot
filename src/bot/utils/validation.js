import { TIME_REGEX } from './constants.js';

export function isValidTime(value) {
  return TIME_REGEX.test(value);
}

export function validateQuietTimes(start, end) {
  if ((start && !end) || (!start && end)) {
    return 'You must set **both** quietStart and quietEnd, or leave both empty.';
  }

  if (start && end && (!isValidTime(start) || !isValidTime(end))) {
    return 'Quiet times must be in **hh:mm (24-hour)** format. Example: `22:30`';
  }

  return null;
}
