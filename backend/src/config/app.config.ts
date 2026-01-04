export const AppConfig = {
  env: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 3000,

  apiPrefix: 'api',

  timezone: 'UTC',

  pagination: {
    defaultLimit: 25,
    maxLimit: 100,
  },

  uploads: {
    maxScreenshotSizeKb: 500,
  },
};
