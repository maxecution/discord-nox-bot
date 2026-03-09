import { supabase } from '../../supabase/client.js';

const CACHE_TTL = 60 * 1000; // 1 minute
const subscriptionCache = new Map();
export const getSubscriptionsForGuild = async (guildId) => {
  const cached = subscriptionCache.get(guildId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const { data, error } = await supabase.from('subscriptions').select('*').eq('guild_id', guildId).eq('enabled', true);

  if (error) {
    console.error('Subscription fetch failed:', error);
    return [];
  }

  subscriptionCache.set(guildId, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return data;
};

export const invalidateGuildSubscriptions = (guildId) => {
  subscriptionCache.delete(guildId);
};
