import { SlashCommandBuilder } from 'discord.js';
import notifyAdd from './notifyAdd.js';
import notifyRemove from './notifyRemove.js';

const handlers = {
  add: notifyAdd,
  remove: notifyRemove,
};

export default {
  data: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Manage VC notifications')
    .addSubcommand(notifyAdd.data)
    .addSubcommand(notifyRemove.data),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    return handlers[sub].execute(interaction);
  },
};
