import { SlashCommandSubcommandBuilder, MessageFlags } from 'discord.js';
import { AUDIT_EVENTS } from '../../utils/constants.js';
import {
  getUserSubscriptionChannelIds,
  resolveChannelsFromIds,
  filterChannelsBySearch,
  toAutocompleteChoices,
} from '../../services/subscriptionService.js';
import { logAuditEvent } from '../../services/auditService.js';
import { supabase } from '../../../supabase/client.js';

const data = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('Remove VC from notification list')
  .addStringOption((option) =>
    option.setName('channel').setDescription('Select subscribed Voice Channel').setAutocomplete(true).setRequired(true),
  );

const execute = async (interaction) => {
  const channelId = interaction.options.getString('channel');

  if (!channelId) {
    return interaction.reply({
      content: 'Invalid channel selection.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = interaction.guild.channels.cache.get(channelId);
  const channelName = channel?.name ?? 'Unknown Channel';

  const { data, error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('guild_id', interaction.guildId)
    .eq('user_id', interaction.user.id)
    .eq('voice_channel_id', channelId)
    .select();

  if (error) {
    console.error(error);
    return interaction.reply({
      content: 'Failed to remove subscription. Try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (!data?.length) {
    return interaction.reply({
      content: 'No subscription found for that channel.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({
    content: `Removed subscription for **${channelName}**.`,
    flags: MessageFlags.Ephemeral,
  });

  logAuditEvent({
    eventType: 'SUBSCRIPTION_REMOVED',
    actorUserId: interaction.user.id,
    guildId: interaction.guildId,
    metadata: {
      voiceChannelId: channel.id,
      channel_name: channel.name,
    },
  });
};

const subbedChannels = async (interaction) => {
  try {
    const channelIds = await getUserSubscriptionChannelIds(interaction.guildId, interaction.user.id);

    const channels = resolveChannelsFromIds(interaction.guild, channelIds);

    const choices = toAutocompleteChoices(filterChannelsBySearch(channels, interaction.options.getFocused()));

    return interaction.respond(choices);
  } catch (err) {
    console.error(err);
    return interaction.respond([]);
  }
};

export default { data, execute, subbedChannels };
