# Nox the Night Manager ![Cron job status](https://api.cron-job.org/jobs/7232956/fc576fd9f01ff7f7/status-3.svg)

A Discord bot project built to manage and automate server interactions, with an initial focus on slash command handling and stable production deployment. The current implementation focuses on Discord connectivity, command registration, event handling, and a small HTTP service for uptime and health checks.

This repository represents the foundation for a larger bot system. Future development will introduce Supabase-backed persistence and more advanced moderation and automation features.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Environment Configuration](#environment-configuration)
- [Discord Bot Setup](#discord-bot-setup)
- [How the Bot Works](#how-the-bot-works)
- [Command System](#command-system)
- [Event Handling](#event-handling)
- [HTTP Server and Health Checks](#http-server-and-health-checks)
- [Graceful Shutdown](#graceful-shutdown)
- [Slash Command Deployment](#slash-command-deployment)
- [Current Limitations](#current-limitations)
- [Development Scripts](#development-scripts)

---

## Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![dotenv](https://img.shields.io/badge/dotenv-17.x-2E7D32?logo=dotenv&logoColor=fff)](https://www.dotenv.org/)
[![date-fns](https://img.shields.io/badge/date--fns-4.x-8c1b54?logo=datefns&logoColor=fff)](https://date-fns.org/)
[![Nodemon](https://img.shields.io/badge/Nodemon-3.x-76D04B?logo=nodemon&logoColor=fff)](https://nodemon.io/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3FCF8E?logo=supabase&logoColor=fff)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-000000?logo=render&logoColor=fff)](https://render.com/)
[![cron-job](https://img.shields.io/badge/cron--job-c33d1b)](https://cron-job.org/)

---

## Roadmap

This roadmap reflects the intended phased evolution of the bot, prioritising a solid utility core before expanding into engagement and progression systems.

### Phase 1 - MVP (Utility Core)

**Primary goal:** Deliver a reliable, lightweight notification system with persistent storage and minimal overhead.

**Voice Channel Join DM Subscriptions**

- Subscribe to notifications for a specific voice channel
- Optional filtering to notify only when specific users join
- Cooldown and anti‑spam logic to prevent excessive alerts
- Ignore notifications if the subscriber is already present in the voice channel

**Slash Commands Only (No Dashboard)**

All configuration managed through Discord slash commands:

- `/notify add channel:<voice> [users:<list?>] [buffer:<0|30|60|120?>] [quiet-start:<HH:mm?>] [quiet-end:<HH:mm?>]`
- `/notify remove channel:<voice>`
- `/notify list`
- `/notify toggle channel:<voice> on|off`
- `/notify quiet channel:<voice> start:<HH:mm?> end:<HH:mm?>`

**Supabase Persistence**

Stores minimal but essential data:

- Subscription records
- Cooldown timestamps
- Lightweight audit logs

Designed to remain efficient, low‑cost, and scalable.

**Render Keep‑Alive HTTP Endpoint**

- Prevents Render instance sleeping
- Uses a simple ping route
- No unnecessary compute or background workloads

---

### Phase 2 - Engagement Features

**LFG (Looking For Group) System**

**Command UX**

- `/lfg game:"Arc Raiders" time:"20:00" note:"Trials?"`

**Bot Behaviour**

- Posts an embed containing:
  - Game title
  - Start time
  - Creator
  - Optional note

- Users click a ✅ reaction to join
- Bot dynamically updates the participant list
- Reminder ping shortly before session start

**Storage Impact**

Minimal data retention:

- LFG post records
- Reaction participant user IDs

---

### Phase 3 - XP, Achievements, and Leaderboards

**XP System Split**

- **Text XP:** Earned per message with cooldown enforcement
- **Voice XP:** Earned per minute spent in voice channels
- Stored separately to allow accurate balancing and tuning

**Derived Systems**

- Achievements
- Activity milestones
- Potential Frontend Leaderboard Dashboard

**Leaderboards**

- `/leaderboard text`
- `/leaderboard voice`
- `/leaderboard total`

**Storage Strategy**

Stores only essential aggregates:

- XP totals
- Last activity timestamps

Raw activity logs are intentionally not stored to keep the database lightweight, cost‑efficient, and privacy‑respectful.

---

## Environment Configuration

Local development uses a `.env` file, which is ignored in Git.
Production deployments (for example Render) read values from platform environment variables.

### Required environment variables

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_client_id
DEV_GUILD_ID=your_test_server_id
PORT=3000
```

### Recommended workflow

- `.env` is kept local and excluded from version control
- `.env.example` can be committed with placeholder values
- Production values are configured in the hosting provider

---

## Discord Bot Setup

To run the bot, you must:

1. Create a Discord application in the Developer Portal
2. Add a bot to the application
3. Invite the bot to a server
4. Copy the server ID and set it as `DEV_GUILD_ID`
5. Copy the bot token and set it as `DISCORD_TOKEN`

No additional Discord client configuration is required beyond inviting the bot to a server.

---

## How the Bot Works

### Application entry point

The bot is started through `src/index.js`, which orchestrates:

- Discord client creation
- Command and event loading
- Express HTTP server startup
- Graceful shutdown handling

### Discord client lifecycle

- A Discord client is created via `createClient()`
- A `Collection` stores loaded slash commands
- Event handlers are registered dynamically
- The bot logs in using `DISCORD_TOKEN`

A readiness flag tracks whether the client is connected:

- Set to `true` when the client becomes ready
- Reset on disconnect, reconnect, or error

---

## Command System

Commands are loaded into a Discord.js `Collection` and executed through the `interactionCreate` event.

### Example command

`dontShoot` is a test slash command used to validate deployment and execution.

Behaviour:

- Command name: `hey`
- Responds with: `Don't shoot!`

### Command execution flow

1. A user runs a slash command
2. `interactionCreate` checks if it is a chat input command
3. The command handler retrieves the command from the collection
4. The command `execute()` function runs
5. Errors are caught and reported gracefully

Unknown commands return an ephemeral error message.

---

## Event Handling

The bot currently handles:

- `ready` / `clientReady`
- `interactionCreate`
- Disconnect and reconnect state changes

Event handlers are modular and loaded through a loader utility.

---

## HTTP Server and Health Checks

An Express server runs alongside the bot to provide:

- A root status endpoint
- A health route reporting bot readiness

This allows uptime monitoring on hosting platforms.

The server shuts down gracefully when the process receives termination signals.

---

## Graceful Shutdown

The bot listens for system signals and performs clean shutdown steps:

- Stops the HTTP server
- Destroys the Discord client connection
- Exits safely

This prevents orphaned connections and unstable shutdowns.

---

## Slash Command Deployment

Slash commands are deployed using a dedicated script.

### Behaviour

- Commands are registered to a development guild using `DEV_GUILD_ID`
- Guild deployment provides instant availability
- This project intentionally avoids global command registration

This approach is optimised for private or development-only bots.

---

## Current Limitations

- Supabase integration is not implemented yet
- Only one example command exists
- No persistence layer is active
- The bot is designed for private or controlled server use

---

## Development Scripts

```bash
npm run dev              # Run bot with hot reload
npm run start            # Run bot normally
npm run deploy:commands  # Deploy slash commands to dev guild
npm run list:commands    # List loaded commands
```

---
