import { supabase } from '../../supabase/client.js';

export const logAuditEvent = async ({ eventType, actorUserId = null, guildId = null, metadata = {} }) => {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      event_type: eventType,
      actor_user_id: actorUserId,
      guild_id: guildId,
      metadata,
    });

    if (error) {
      console.error('[audit] insert failed:', error);
    }
  } catch (error) {
    console.error('[audit] unexpected error:', error);
  }
};
