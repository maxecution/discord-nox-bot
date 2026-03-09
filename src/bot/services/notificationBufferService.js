import { formatDisplayNameList } from '../utils/formatters.js';

const buffers = new Map();

const getBufferKey = (subscriptionId) => subscriptionId;

export const addUserToBuffer = ({ subscription, joinedUserId, channel, guild, bufferSeconds }) => {
  const key = getBufferKey(subscription.id);

  const existing = buffers.get(key);

  if (existing) {
    existing.joinedUsers.add(joinedUserId);
    return;
  }

  const joinedUsers = new Set([joinedUserId]);

  const timer = setTimeout(async () => {
    await flushBuffer(subscription, joinedUsers, channel, guild);
    buffers.delete(key);
  }, bufferSeconds * 1000);

  buffers.set(key, {
    timer,
    joinedUsers,
    subscriberId: subscription.user_id,
  });
};

export const cancelBufferIfSubscriberJoined = (subscriberId) => {
  for (const [key, buffer] of buffers.entries()) {
    if (buffer.subscriberId === subscriberId) {
      clearTimeout(buffer.timer);
      buffers.delete(key);
    }
  }
};

const flushBuffer = async (subscription, joinedUsers, channel, guild) => {
  let subscriber;

  try {
    subscriber = await guild.members.fetch(subscription.user_id);
  } catch {
    return; // in case subscriber has left the server
  }

  if (subscriber.voice.channelId) return;

  const joinedMembers = await Promise.all(
    [...joinedUsers].map(async (id) => {
      return guild.members.cache.get(id) ?? (await guild.members.fetch(id).catch(() => null));
    }),
  );

  const joinedDisplayNames = joinedMembers.filter(Boolean).map((member) => member.displayName);

  const joinedUsersText = formatDisplayNameList(joinedDisplayNames);

  if (!joinedUsersText) return;

  try {
    await subscriber.send(`*${joinedUsersText}* joined **${channel.name}** on **${guild.name}**`);
  } catch (err) {
    console.error('Failed to send notification DM:', err);
  }
};
