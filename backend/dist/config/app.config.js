"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
exports.AppConfig = {
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
//# sourceMappingURL=app.config.js.map