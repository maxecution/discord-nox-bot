import env from './config/env.js';
import { createServer } from './http/server.js';
import { createClient } from './bot/client.js';
import { loadEvents, loadCommands } from './bot/loader.js';
import readyEvent from './bot/events/ready.js';
import interactionCreateEvent from './bot/events/interactionCreate.js';
import notifyCommand from './bot/commands/notify/index.js';
import { Collection, Events } from 'discord.js';

// --- Discord client ---
const client = createClient();
client.commands = new Collection();
let discordReady = false;

client.on(Events.ClientReady, () => (discordReady = true));
client.on('disconnect', () => (discordReady = false));
client.on('reconnecting', () => (discordReady = false));
client.on('resume', () => (discordReady = false));

loadEvents(client, [readyEvent, interactionCreateEvent]);
loadCommands(client.commands, [notifyCommand]);

client.login(env.discordToken);

// --- HTTP server ---
const app = createServer({ getDiscordReady: () => discordReady, client, appName: 'Nox the Night Manager' });
const server = app.listen(env.port, () => {
  console.log(`[web] Web server online on port ${env.port}`);
});

const shutdown = async (signal) => {
  try {
    console.log(`[sys] Received ${signal}. Shutting down...`);
    server.close(() => {
      console.log('[web] HTTP server closed');
    });
    await client.destroy();
    process.exit(0);
  } catch (e) {
    console.error('[sys] Error during shutdown:', e);
    process.exit(1);
  }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
