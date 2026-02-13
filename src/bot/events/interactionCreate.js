export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands?.get(interaction.commandName);
    if (!command) return interaction.reply({ content: 'Unknown command', flags: MessageFlags.Ephemeral });

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[cmd] Error executing command ${interaction.commandName}:`, err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error executing that command.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({ content: 'There was an error.', flags: MessageFlags.Ephemeral });
      }
    }
  },
};
