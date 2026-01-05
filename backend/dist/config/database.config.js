"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
exports.DatabaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'b2b_workforce',
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: true,
};
//# sourceMappingURL=database.config.js.map