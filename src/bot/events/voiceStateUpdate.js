import { getSubscriptionsForGuild } from '../services/subscriptionCacheService.js';
import { addUserToBuffer, cancelBufferIfSubscriberJoined } from '../services/notificationBufferService.js';
import { isWithinQuietHours } from '../utils/timeUtils.js';

export default {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    const joinedChannelId = newState.channelId;
    const oldChannelId = oldState.channelId;

    if (joinedChannelId === oldChannelId) return;
    if (!joinedChannelId) return;

    const guild = newState.guild;
    const channel = newState.channel;
    const joinedUserId = newState.member.id;

    cancelBufferIfSubscriberJoined(joinedUserId);

    const subscriptions = await getSubscriptionsForGuild(guild.id);
    const relevantSubs = subscriptions.filter((s) => s.voice_channel_id === joinedChannelId);

    if (!relevantSubs.length) return;

    for (const sub of relevantSubs) {
      if (sub.notify_user_ids?.length && !sub.notify_user_ids.includes(joinedUserId)) {
        continue;
      }

      if (joinedUserId === sub.user_id) continue;

      if (isWithinQuietHours(sub.quiet_start, sub.quiet_end)) continue;

      addUserToBuffer({
        subscription: sub,
        joinedUserId,
        channel,
        guild,
        bufferSeconds: sub.buffer_seconds,
      });
    }
  },
};
