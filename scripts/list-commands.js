import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_TOKEN?.trim();
const appId = process.env.DISCORD_CLIENT_ID?.trim();
const guildId = process.env.DEV_GUILD_ID?.trim();

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  const guild = await rest.get(Routes.applicationGuildCommands(appId, guildId));
  console.log(
    'Guild commands:',
    guild.map((c) => `${c.name} (${c.id})`),
  );

  const global = await rest.get(Routes.applicationCommands(appId));
  console.log(
    'Global commands:',
    global.map((c) => `${c.name} (${c.id})`),
  );
})();
