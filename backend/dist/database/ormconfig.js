"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.ormConfig = void 0;
const typeorm_1 = require("typeorm");
require("dotenv/config");
exports.ormConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'b2b_action_workforce',
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    entities: [__dirname + '/../modules/**/entities/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations',
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
};
exports.AppDataSource = new typeorm_1.DataSource(exports.ormConfig);
//# sourceMappingURL=ormconfig.js.map