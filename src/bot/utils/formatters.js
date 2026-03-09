export function formatWatchedUsers(users) {
  return users.length ? users.map((u) => u.tag).join(', ') : 'everyone';
}

export function formatDisplayNameList(names) {
  let formattedNames;

  if (names.length === 1) {
    formattedNames = names[0];
  } else if (names.length === 2) {
    formattedNames = `${names[0]} and ${names[1]}`;
  } else {
    formattedNames = `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
  }

  return formattedNames;
}
