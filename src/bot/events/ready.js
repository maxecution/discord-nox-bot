import { ActivityType } from 'discord.js';
export default {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`[bot] Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'Nox online', type: ActivityType.Playing }],
      status: 'online',
    });
  },
};
