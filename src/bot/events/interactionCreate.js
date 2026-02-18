import { supabase } from '../../supabase/client.js';
export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === 'notify' && interaction.options.getSubcommand() === 'remove') {
        const focused = interaction.options.getFocused();
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const { data, error } = await supabase
          .from('subscriptions')
          .select('voice_channel_id')
          .eq('guild_id', guildId)
          .eq('user_id', userId);

        if (error) {
          console.error(error);
          return interaction.respond([]);
        }

        const channels = data.map((row) => interaction.guild.channels.cache.get(row.voice_channel_id)).filter(Boolean);

        await interaction.respond(
          channels
            .filter((c) => c.name.toLowerCase().includes(focused.toLowerCase()))
            .slice(0, 25)
            .map((c) => ({
              name: c.name,
              value: c.id,
            })),
        );
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands?.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: 'Unknown command',
        flags: MessageFlags.Ephemeral,
      });
    }

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
        await interaction.reply({
          content: 'There was an error.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
