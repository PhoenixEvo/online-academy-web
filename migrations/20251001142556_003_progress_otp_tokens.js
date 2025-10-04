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
    await knex.schema.createTable('progress', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.integer('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
      t.integer('watched_sec').defaultTo(0);
      t.boolean('completed').defaultTo(false);
      t.unique(['user_id','lesson_id']);
    });
  
    await knex.schema.createTable('otp_tokens', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.string('email').notNullable();
      t.string('otp_hash').notNullable();
      t.timestamp('expires_at').notNullable();
      t.boolean('consumed').defaultTo(false);
      t.timestamps(true, true);
    });
  }
  
  export async function down(knex) {
    await knex.schema.dropTableIfExists('otp_tokens');
    await knex.schema.dropTableIfExists('progress');
  }
  