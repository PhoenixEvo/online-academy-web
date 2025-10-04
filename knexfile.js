// Update with your config settings.
import 'dotenv/config';

export default {
  client: 'pg',
  connection: {
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.eeokomgvickduxzgxunj',
    password: 'k#ty82PyBnjti-T', 
    ssl: { rejectUnauthorized: false }, // Supabase cần SSL
  },
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
  seeds: { directory: './seeds' },
  debug: true,
};

