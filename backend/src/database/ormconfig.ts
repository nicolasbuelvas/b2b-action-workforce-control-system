import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'b2b_action_workforce',

  synchronize: false, // ⚠️ NUNCA true en producción
  logging: process.env.NODE_ENV !== 'production',

  entities: [__dirname + '/../modules/**/entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',

  ssl:
    process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
};

export const AppDataSource = new DataSource(ormConfig);
