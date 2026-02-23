import { supabase } from '../../supabase/client.js';

export async function getUserSubscriptionChannelIds(guildId, userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('voice_channel_id')
    .eq('guild_id', guildId)
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((r) => r.voice_channel_id);
}

export function resolveChannelsFromIds(guild, channelIds) {
  return channelIds.map((id) => guild.channels.cache.get(id)).filter(Boolean);
}

export function filterChannelsBySearch(channels, search) {
  const query = search.toLowerCase();

  return channels.filter((c) => c.name.toLowerCase().includes(query));
}

export function toAutocompleteChoices(channels) {
  return channels.slice(0, 25).map((c) => ({
    name: c.name,
    value: c.id,
  }));
}
