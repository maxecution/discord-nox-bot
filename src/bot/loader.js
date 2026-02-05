export function loadEvents(client, events) {
  for (const e of events) {
    if (e.once) client.once(e.name, (...args) => e.execute(...args, client));
    else client.on(e.name, (...args) => e.execute(...args, client));
  }
}

export function loadCommands(collection, commands) {
  for (const cmd of commands) {
    if (collection.has(cmd.data.name)) {
      console.warn(`[loader] Duplicate command: ${cmd.data.name}`);
    }
    collection.set(cmd.data.name, cmd);
  }
}
