export const MAX_USERS = 5;

export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const BUFFER_OPTIONS = [
  { name: 'No buffer', value: 0 },
  { name: '30 seconds', value: 30 },
  { name: '60 seconds', value: 60 },
  { name: '2 minutes', value: 120 },
];

export const AUDIT_EVENTS = {
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_REMOVED: 'subscription_removed',
  SUBSCRIPTION_TOGGLED: 'subscription_toggled',
  QUIET_UPDATED: 'quiet_hours_updated',
};
