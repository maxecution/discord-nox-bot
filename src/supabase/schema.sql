create table public.audit_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  event_type text not null,
  actor_user_id text null,
  guild_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint audit_logs_pkey primary key (id)
) TABLESPACE pg_default;

create table public.subscriptions (
  id uuid not null default extensions.uuid_generate_v4 (),
  guild_id text not null,
  user_id text not null,
  voice_channel_id text not null,
  enabled boolean not null default true,
  notify_user_ids text[] not null default '{}'::text[],
  buffer_seconds integer not null default 0,
  quiet_start time without time zone null,
  quiet_end time without time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_user_id_voice_channel_id_key unique (user_id, voice_channel_id),
  constraint unique_user_channel_subscription unique (guild_id, user_id, voice_channel_id)
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_user on public.subscriptions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_channel on public.subscriptions using btree (voice_channel_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_guild on public.subscriptions using btree (guild_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_voice_channel on public.subscriptions using btree (guild_id, voice_channel_id) TABLESPACE pg_default
where
  (enabled = true);

create trigger set_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION set_updated_at ();