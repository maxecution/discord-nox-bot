import env from '../src/config/env.js';
import { REST, Routes } from 'discord.js';

const token = env.discordToken;
const appId = env.discordClientId;
const guildId = env.devGuildId;

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
