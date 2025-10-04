// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.up = function(knex) {
  
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
  
// };
export async function up(knex) {
    await knex.schema.createTable('sections', t => {
      t.increments('id').primary();
      t.integer('course_id').references('id').inTable('courses').onDelete('CASCADE');
      t.string('title').notNullable();
      t.integer('order_index').defaultTo(0);
    });
  
    await knex.schema.createTable('lessons', t => {
      t.increments('id').primary();
      t.integer('section_id').references('id').inTable('sections').onDelete('CASCADE');
      t.string('title').notNullable();
      t.string('video_url');
      t.boolean('is_preview').defaultTo(false);
      t.integer('duration_sec').defaultTo(0);
      t.integer('order_index').defaultTo(0);
    });
  
    await knex.schema.createTable('enrollments', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.integer('course_id').references('id').inTable('courses').onDelete('CASCADE');
      t.timestamp('purchased_at').defaultTo(knex.fn.now());
      t.boolean('active').defaultTo(true);
      t.unique(['user_id','course_id']);
    });
  
    await knex.schema.createTable('watchlist', t => {
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.integer('course_id').references('id').inTable('courses').onDelete('CASCADE');
      t.primary(['user_id','course_id']);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
  
    await knex.schema.createTable('reviews', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.integer('course_id').references('id').inTable('courses').onDelete('CASCADE');
      t.integer('rating').notNullable(); // 1..5
      t.text('comment');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  
  export async function down(knex) {
    await knex.schema.dropTableIfExists('reviews');
    await knex.schema.dropTableIfExists('watchlist');
    await knex.schema.dropTableIfExists('enrollments');
    await knex.schema.dropTableIfExists('lessons');
    await knex.schema.dropTableIfExists('sections');
  }
  