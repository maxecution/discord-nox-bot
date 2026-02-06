import env from '../src/config/env.js';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const token = env.discordToken;
const appId = env.discordClientId;
const guildId = env.devGuildId;

if (!token || !appId || !guildId) {
  console.error('Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DEV_GUILD_ID in environment');
  process.exit(1);
}

const commands = [];

const commandsPath = path.resolve('src/bot/commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const { default: cmd } = await import(`../src/bot/commands/${file}`);
  if (cmd?.data) commands.push(cmd.data.toJSON());
}
console.log(`[deploy] Loaded ${commands.length} command(s)`);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('[deploy] Registering guild commands...');
    await rest.put(Routes.applicationGuildCommands(appId, guildId), {
      body: commands,
    });
    console.log('[deploy] ✅ Commands deployed to server:', guildId);
  } catch (err) {
    console.error('[deploy] ❌ Failed to deploy commands:', err);
    process.exit(1);
  }
})();
