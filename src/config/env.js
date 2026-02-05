if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}
const ensure = (vars) => {
  const missing = vars.filter((k) => !process.env[k] || process.env[k]?.trim() === '');
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
};

ensure(['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DEV_GUILD_ID']);

const parsedPort = Number.parseInt(process.env.PORT || '3000', 10);

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
  discordToken: process.env.DISCORD_TOKEN?.trim(),
  isRender: !!process.env.RENDER,
};

export default config;
