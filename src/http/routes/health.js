import { Router } from 'express';
import { intervalToDuration, formatDuration } from 'date-fns';

export function createHealthRouter(getDiscordReady, { client, appName = 'My Bot' } = {}) {
  const router = Router();

  // ----- Healthz -----
  router.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'web' });
  });

  // ----- Readyz -----
  router.get('/readyz', (_req, res) => {
    const ready = safeBoolean(getDiscordReady());
    if (ready) res.status(200).json({ status: 'ok', service: 'discord' });
    else res.status(503).json({ status: 'not ready', service: 'discord' });
  });

  // ----- Status -----
  router.get('/status', (_req, res) => {
    const now = new Date();

    const uptimeMillis = Math.round(process.uptime() * 1000);
    const uptimeSec = Math.floor(uptimeMillis / 1000);

    const startedAtAligned = new Date(now.getTime() - uptimeMillis);

    const duration = intervalToDuration({ start: startedAtAligned, end: now });
    const uptimeFormatted = formatDuration(duration, {
      delimiter: ', ',
      format: ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
    });

    const payload = {
      app: appName,
      time: now.toISOString(),
      startedAt: startedAtAligned.toISOString(),
      totalUptime: uptimeFormatted,
      uptimeSeconds: uptimeSec,
      discord: {
        ready: safeBoolean(getDiscordReady()),
        serverConnections: safeNum(client?.guilds?.cache?.size, 0),
        wsPingMs: safeNum(client?.ws?.ping, null),
      },
      commandsAvailable: safeNum(client?.commands?.size, 0),
    };

    res.json(payload);
  });

  return router;
}

// ----- Helper Functions -----
function safeBoolean(fnOrVal) {
  try {
    return typeof fnOrVal === 'function' ? !!fnOrVal() : !!fnOrVal;
  } catch {
    return false;
  }
}

function safeNum(n, fallback = null) {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}
