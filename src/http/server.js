import express from 'express';
import { createHealthRouter } from './routes/health.js';

export function createServer({ getDiscordReady, client, appName }) {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => res.send(appName + ' is running'));
  app.use('/', createHealthRouter(getDiscordReady, { client, appName }));

  return app;
}
