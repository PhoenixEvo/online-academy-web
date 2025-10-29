// ESM
import 'dotenv/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

export function setupSession(app) {
  const PgSession = connectPgSimple(session);

  // Supabase requires SSL
  const pool = new pg.Pool({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.eeokomgvickduxzgxunj',
    password: 'k#ty82PyBnjti-T',
    ssl: { rejectUnauthorized: false }
  });

  app.use(session({
    store: new PgSession({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true, // create table if not exists
      // pruneSessionInterval: 60 // prune session interval (minutes) – optional
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development-only-123456789',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,        // set true if running HTTPS
      maxAge: 1000 * 60 * 60 * 4,
    }
  }));
}
