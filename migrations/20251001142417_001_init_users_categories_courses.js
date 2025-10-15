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
    await knex.schema.createTable('users', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').notNullable().unique();
      t.string('password_hash').notNullable();
      t.enu('role', ['student', 'instructor', 'admin']).notNullable().defaultTo('student');
      t.string('avatar_url');
      t.timestamps(true, true);
    });
  
    await knex.schema.createTable('categories', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.integer('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    });
  
    await knex.schema.createTable('courses', t => {
      t.increments('id').primary();
      t.string('title').notNullable();
      t.text('short_desc');
      t.text('full_desc');
      t.decimal('price', 10, 2).defaultTo(0);
      t.decimal('sale_price', 10, 2);
      t.decimal('rating_avg', 3, 2).defaultTo(0);
      t.integer('rating_count').defaultTo(0);
      t.integer('views').defaultTo(0);
      t.integer('category_id').references('id').inTable('categories').onDelete('RESTRICT');
      t.integer('instructor_id').references('id').inTable('users').onDelete('CASCADE');
      t.enu('status', ['draft','published','completed']).defaultTo('draft');
      t.string('thumbnail_url');
      t.timestamps(true, true);
    });

    //new 
    await knex.schema.createTable('instructors', t => {
    t.increments('id').primary();
    t.string('_class');
    t.string('title');
    t.string('name').notNullable();
    t.string('display_name');
    t.string('job_title');
    t.string('image_50x50');
    t.string('image_100x100');
    t.string('initials');
    t.string('url');
    t.integer('user_id').unsigned().unique();
    t.foreign('user_id').references('id').inTable('users');
    t.timestamps(true, true);
    });
  }
  
  export async function down(knex) {
    await knex.schema.dropTableIfExists('courses');
    await knex.schema.dropTableIfExists('categories');
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('instructors'); //new
  }
  