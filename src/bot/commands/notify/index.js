import { SlashCommandBuilder } from 'discord.js';
import notifyAdd from './notifyAdd.js';

const handlers = {
  add: notifyAdd,
};

export default {
  data: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Manage VC notifications')
    .addSubcommand(notifyAdd.data),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    return handlers[sub].execute(interaction);
  },
};
