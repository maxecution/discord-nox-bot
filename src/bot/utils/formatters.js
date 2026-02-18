export function formatWatchedUsers(users) {
  return users.length ? users.map((u) => u.tag).join(', ') : 'everyone';
}
