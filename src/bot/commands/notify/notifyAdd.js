import { ChannelType, SlashCommandSubcommandBuilder, MessageFlags } from 'discord.js';
import { BUFFER_OPTIONS, MAX_USERS } from '../../utils/constants.js';
import { getSelectedUsers } from '../../utils/options.js';
import { validateQuietTimes } from '../../utils/validation.js';
import { formatWatchedUsers } from '../../utils/formatters.js';
import { supabase } from '../../../supabase/client.js';

const data = new SlashCommandSubcommandBuilder()
  .setName('add')
  .setDescription('Add VC to notification list')
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Select Voice Channel')
      .addChannelTypes(ChannelType.GuildVoice)
      .setRequired(true),
  );

for (let i = 1; i <= MAX_USERS; i++) {
  data.addUserOption((o) => o.setName(`user${i}`).setDescription('Add user to watch'));
}

data
  .addIntegerOption((option) =>
    option
      .setName('buffer')
      .setDescription('Set buffer between notifications')
      .addChoices(...BUFFER_OPTIONS),
  )
  .addStringOption((o) => o.setName('quiet-start').setDescription('Quiet start (hh:mm)'))
  .addStringOption((o) => o.setName('quiet-end').setDescription('Quiet end (hh:mm)'));

const execute = async (interaction) => {
  const guildId = interaction.guildId;
  const commandUserId = interaction.user.id;

  const channel = interaction.options.getChannel('channel');
  const channelId = channel.id;

  const users = getSelectedUsers(interaction);
  const watchedUsers = formatWatchedUsers(users);

  const buffer = interaction.options.getInteger('buffer') ?? 30;
  const quietStart = interaction.options.getString('quiet-start');
  const quietEnd = interaction.options.getString('quiet-end');

  const quietError = validateQuietTimes(quietStart, quietEnd);
  if (quietError) {
    return interaction.reply({ content: quietError, flags: MessageFlags.Ephemeral });
  }

  const payload = {
    guild_id: guildId,
    user_id: commandUserId,
    voice_channel_id: channelId,
    notify_user_ids: users.map((u) => u.id),
    buffer_seconds: buffer,
    quiet_start: quietStart ?? null,
    quiet_end: quietEnd ?? null,
    enabled: true,
  };

  const { error } = await supabase.from('subscriptions').upsert(payload, {
    onConflict: 'guild_id,user_id,voice_channel_id',
  });

  if (error) {
    console.error(error);
    return interaction.reply({
      content: 'Failed to save subscription.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({
    content:
      `Subscribed to **${channel.name}**. Watching **${watchedUsers}** with **${buffer}s** buffer.` +
      (quietStart ? ` Quiet hours: **${quietStart} → ${quietEnd}**.` : ''),
    flags: MessageFlags.Ephemeral,
  });
};

export default { data, execute };
