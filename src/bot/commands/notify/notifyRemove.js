import { ChannelType, SlashCommandSubcommandBuilder, MessageFlags } from 'discord.js';
import { supabase } from '../../../supabase/client.js';

const data = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('Remove VC from notification list')
  .addStringOption((option) =>
    option.setName('channel').setDescription('Select subscribed Voice Channel').setAutocomplete(true).setRequired(true),
  );

const execute = async (interaction) => {
  const channelId = interaction.options.getString('channel');
  const channel = interaction.guild.channels.cache.get(channelId);
  const channelName = channel?.name ?? 'Unknown Channel';

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('guild_id', interaction.guildId)
    .eq('user_id', interaction.user.id)
    .eq('voice_channel_id', channelId);

  if (error) {
    console.error(error);
    return interaction.reply({
      content: 'Failed to remove subscription.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({
    content: `Removed subscription for **${channelName}**.`,
    flags: MessageFlags.Ephemeral,
  });
};

export default { data, execute };
