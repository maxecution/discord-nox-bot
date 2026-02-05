export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands?.get(interaction.commandName);
    if (!command) return interaction.reply({ content: 'Unknown command', ephemeral: true });

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[cmd] Error executing command ${interaction.command}:`, err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing that command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error.', ephemeral: true });
      }
    }
  },
};
