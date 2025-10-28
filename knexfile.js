// Update with your config settings.
import 'dotenv/config';

const useUrl = !!process.env.DATABASE_URL || !!process.env.DB_CONNECTION;

const connection = useUrl
  ? {
      // Prefer DATABASE_URL or DB_CONNECTION when provided
      connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    };

export default {
  client: 'pg',
  connection,
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
  seeds: { directory: './seeds' },
  debug: process.env.KNEX_DEBUG === 'true',
};

