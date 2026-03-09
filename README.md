# Nox the Night Manager

![Cron job status](https://api.cron-job.org/jobs/7232956/fc576fd9f01ff7f7/status-3.svg)

A Discord bot project designed to manage and automate server interactions, with an initial focus on slash command handling and stable production deployment.

The current implementation includes a fully working **voice channel notification service**, backed by Supabase persistence, in-memory notification buffering, quiet hour enforcement, and audit logging.

The repository represents the foundation for a larger modular bot system designed to remain lightweight, reliable, and inexpensive to operate on small hosting environments.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Environment Configuration](#environment-configuration)
- [Discord Bot Setup](#discord-bot-setup)
- [Notification System](#notification-system)
- [Subscription Cache](#subscription-cache)
- [Command System](#command-system)
- [Event Handling](#event-handling)
- [Database Architecture](#database-architecture)
- [HTTP Server and Health Checks](#http-server-and-health-checks)
- [Graceful Shutdown](#graceful-shutdown)
- [Slash Command Deployment](#slash-command-deployment)
- [Current Limitations](#current-limitations)
- [Development Scripts](#development-scripts)

---

## Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![dotenv](https://img.shields.io/badge/dotenv-17.x-2E7D32?logo=dotenv&logoColor=fff)](https://www.dotenv.org/)
[![date-fns](https://img.shields.io/badge/date--fns-4.x-8c1b54?logo=datefns&logoColor=fff)](https://date-fns.org/)
[![Nodemon](https://img.shields.io/badge/Nodemon-3.x-76D04B?logo=nodemon&logoColor=fff)](https://nodemon.io/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3FCF8E?logo=supabase&logoColor=fff)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-000000?logo=render&logoColor=fff)](https://render.com/)
[![cron-job](https://img.shields.io/badge/cron--job-c33d1b)](https://cron-job.org/)

---

## Roadmap

This roadmap reflects the intended phased evolution of the bot, prioritising a stable utility core before expanding into engagement and progression systems.

---

### Phase 1 - MVP (Utility Core)

**Primary goal:** deliver a reliable, lightweight notification system with persistent storage and minimal operational overhead.

#### Voice Channel Join DM Notifications

Users can subscribe to voice channels and receive a **direct message notification** when someone joins.

Features include:

- Subscribing to specific voice channels
- Optional filtering to notify only when **specific users** join
- **Buffered notifications** (0-120 seconds)
- **Quiet hour support**
- Ignoring notifications if the subscriber joins voice themselves
- Automatic grouping of multiple join events into a single notification
- Ephemeral command responses to prevent channel clutter

Example notification:

```text
Alice, Bob, and Charlie joined "Gaming VC" on "My Server"
```

---

## Slash Commands

All configuration is performed directly inside Discord using slash commands.

```text
/notify add
/notify remove
```

---

### `/notify add` Command

Creates or updates a subscription.

```text
/notify add
channel:<voice>
[user1 ... userN]
[buffer:0|30|60|120]
[quiet-start:HH:mm]
[quiet-end:HH:mm]
```

Behaviour:

- Creates a new subscription if none exists
- Updates existing subscriptions using an idempotent upsert
- Stores the list of watched users as an array

---

### `/notify remove` Command

Removes a subscription.

Autocomplete dynamically displays only the channels that the user is currently subscribed to.

---

## Notification System

The notification system operates entirely through the `voiceStateUpdate` event.

This avoids background workers and allows the bot to operate efficiently even on low-resource hosting environments.

---

### Notification Flow

1. A user joins a voice channel
2. The bot receives the `voiceStateUpdate` event
3. The bot retrieves active subscriptions for the guild
4. Matching subscriptions are filtered by:

- channel
- enabled state
- watched users
- quiet hours

5. If the subscription is valid:

- the joining user is added to an in-memory buffer
- a timer starts based on the subscription buffer time

6. When the buffer expires:

- all users who joined during the buffer window are grouped
- a single DM notification is sent

---

### In-Memory Notification Buffers

To minimise database load, active notification buffers are stored in memory.

Each buffer tracks:

- subscription ID
- joining user IDs
- target subscriber
- buffer expiration timer

Benefits:

- avoids frequent database writes
- reduces latency
- eliminates the need for cooldown tables

---

### Subscriber Presence Detection

If the subscriber joins any voice channel while a notification buffer is active:

- the pending notification is cancelled
- the buffer is cleared

This prevents unnecessary notifications when the user is already active in voice.

---

## Subscription Cache

Voice join events can occur frequently, so subscriptions are cached in memory.

The cache stores **guild-level subscription data** with a short TTL.

Benefits:

- prevents database reads on every voice join
- reduces Supabase query load
- improves event response speed

Cache refresh occurs automatically when expired.

---

## Database Architecture

The bot uses **Supabase Postgres** for persistent storage.

---

### Subscriptions Table

Stores all voice channel subscriptions.

Key fields:

- `guild_id`
- `user_id`
- `voice_channel_id`
- `notify_user_ids[]`
- `buffer_seconds`
- `quiet_start`
- `quiet_end`
- `enabled`

Composite constraint:

```sql
UNIQUE (guild_id, user_id, voice_channel_id)
```

This guarantees safe upserts and prevents duplicate subscriptions.

---

### Audit Logging

All configuration commands create audit records.

Stored fields:

- event type
- actor user
- guild
- metadata (JSON)

Example events:

```text
SUBSCRIPTION_CREATED
SUBSCRIPTION_UPDATED
SUBSCRIPTION_REMOVED
```

This provides lightweight historical tracking without storing large activity logs.

---

### Phase 2 - Engagement Features

#### LFG (Looking For Group) System

**Command UX**

```text
/lfg game:"Arc Raiders" time:"20:00" note:"Trials?"
```

**Bot behaviour**

- Posts an embed containing:
  - game title
  - start time
  - creator
  - optional note

- Users click a ✅ reaction to join

- The bot dynamically updates the participant list

- A reminder ping is sent shortly before the session start

**Storage impact**

Minimal data retention:

- LFG post records
- reaction participant user IDs

---

### Phase 3 - XP, Achievements, and Leaderboards

#### XP System Split

- **Text XP:** earned per message with cooldown enforcement
- **Voice XP:** earned per minute spent in voice channels

Stored separately to allow accurate balancing and tuning.

#### Derived Systems

- achievements
- activity milestones
- potential frontend leaderboard dashboard

#### Leaderboards

```text
/leaderboard text
/leaderboard voice
/leaderboard total
```

#### Storage Strategy

Only essential aggregates are stored:

- XP totals
- last activity timestamps

Raw activity logs are intentionally not stored to keep the database lightweight, cost-efficient, and privacy-respectful.

---

## Environment Configuration

Local development uses a `.env` file, which is ignored in Git.

Production deployments (for example Render) read values from platform environment variables.

### Required Environment Variables

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_client_id
DEV_GUILD_ID=your_test_server_id
PORT=3000
```

### Recommended Workflow

- `.env` is kept local and excluded from version control
- `.env.example` can be committed with placeholder values
- Production values are configured in the hosting provider

---

## Discord Bot Setup

To run the bot:

1. Create a Discord application in the Developer Portal
2. Add a bot to the application
3. Invite the bot to a server
4. Copy the server ID and set it as `DEV_GUILD_ID`
5. Copy the bot token and set it as `DISCORD_TOKEN`

No additional Discord client configuration is required beyond inviting the bot to a server.

---

## Command System

Commands are loaded into a `discord.js` `Collection` and executed through the `interactionCreate` event.

Each command exports:

```javascript
data;
execute();
```

Subcommands are routed through a central command handler.

Autocomplete functionality is supported for commands that require dynamic options.

---

## Event Handling

The bot listens to the following Discord events:

- `ready`
- `interactionCreate`
- `voiceStateUpdate`
- disconnect/reconnect lifecycle events

Event modules are loaded dynamically through the event loader.

---

## HTTP Server and Health Checks

A small Express server runs alongside the bot.

Endpoints:

```text
/
```

Basic status response.

```text
/healthz
```

Health check endpoint used by cron-job.org to keep the Render instance awake.

---

## Graceful Shutdown

The bot listens for system termination signals.

Shutdown process:

1. Stop the HTTP server
2. Destroy the Discord client
3. Exit cleanly

This prevents dangling connections and unstable deployments.

---

## Slash Command Deployment

Commands are deployed using a dedicated script.

Behaviour:

- Commands are registered to a development guild using `DEV_GUILD_ID`
- Guild deployment provides instant command availability

Global commands are intentionally avoided during development to maintain fast iteration and testing.

---

## Current Limitations

- Designed primarily for **private or small server environments**
- Notifications rely on **in-memory buffers** (no persistence across restarts)
- No dashboard UI
- No cross-guild global command deployment
- No advanced moderation features
- No analytics or historical activity tracking beyond audit logs

---

## Development Scripts

```bash
npm run dev              # Run bot with hot reload
npm run start            # Run bot normally
npm run deploy:commands  # Deploy slash commands to dev guild
npm run list:commands    # List loaded commands
```

---
