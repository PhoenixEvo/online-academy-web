// ESM
import 'dotenv/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

export function setupSession(app) {
  const PgSession = connectPgSimple(session);

  // Use DATABASE_URL if available (for production), otherwise use individual fields or fallback
  let pool;
  if (process.env.DATABASE_URL || process.env.DB_CONNECTION) {
    // Production: use connection string from environment
    const connectionString = process.env.DATABASE_URL || process.env.DB_CONNECTION;
    pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    // Development: use individual fields or fallback to hardcoded (for local dev)
    pool = new pg.Pool({
      host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
      port: process.env.DB_PORT || 6543,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres.eeokomgvickduxzgxunj',
      password: process.env.DB_PASSWORD || 'k#ty82PyBnjti-T',
      ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === undefined 
        ? { rejectUnauthorized: false } 
        : false
    });
  }

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
      secure: process.env.NODE_ENV === 'production', // true when deployed to HTTPS
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
    }
  }));
}
