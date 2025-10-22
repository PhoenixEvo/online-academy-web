/**
 * Migration: Add full-text search indexes for courses
 * This migration adds GIN indexes for efficient full-text search on PostgreSQL
 */

export async function up(knex) {
  // Add GIN index for full-text search on courses table
  // This will speed up searches on title and short_desc
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_courses_fulltext_search 
    ON courses 
    USING GIN (
      to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(short_desc, ''))
    );
  `);

  // Add GIN index for category names as well
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_categories_fulltext_search 
    ON categories 
    USING GIN (
      to_tsvector('english', COALESCE(name, ''))
    );
  `);

  console.log('✓ Full-text search indexes created successfully');
}

export async function down(knex) {
  // Drop the indexes
  await knex.raw('DROP INDEX IF EXISTS idx_courses_fulltext_search;');
  await knex.raw('DROP INDEX IF EXISTS idx_categories_fulltext_search;');
  
  console.log('✓ Full-text search indexes dropped');
}

