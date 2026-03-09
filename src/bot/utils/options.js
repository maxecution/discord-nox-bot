import { MAX_USERS } from './constants.js';
export function getSelectedUsers(interaction) {
  return Array.from({ length: MAX_USERS }, (_, i) => interaction.options.getUser(`user${i + 1}`)).filter(Boolean);
}
