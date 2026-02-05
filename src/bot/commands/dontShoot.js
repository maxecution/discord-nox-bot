import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('hey').setDescription('Classic Raider encounter!'),
  async execute(interaction) {
    await interaction.reply(`Don't shoot!`);
  },
};
