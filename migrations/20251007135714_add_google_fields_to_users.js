/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const addGoogleId = knex.schema.hasColumn('users', 'google_id').then(exists => {
    if (!exists) {
      return knex.schema.alterTable('users', (table) => {
        table.string('google_id').unique().nullable();
      });
    }
  });

  const addProvider = knex.schema.hasColumn('users', 'provider').then(exists => {
    if (!exists) {
      return knex.schema.alterTable('users', (table) => {
        table.string('provider').nullable();
      });
    }
  });

  const addAvatarUrl = knex.schema.hasColumn('users', 'avatar_url').then(exists => {
    if (!exists) {
      return knex.schema.alterTable('users', (table) => {
        table.string('avatar_url').nullable();
      });
    }
  });

  await Promise.all([addGoogleId, addProvider, addAvatarUrl]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const dropGoogleId = knex.schema.hasColumn('users', 'google_id').then(exists => {
    if (exists) {
      return knex.schema.alterTable('users', (table) => {
        table.dropColumn('google_id');
      });
    }
  });

  const dropProvider = knex.schema.hasColumn('users', 'provider').then(exists => {
    if (exists) {
      return knex.schema.alterTable('users', (table) => {
        table.dropColumn('provider');
      });
    }
  });

  // Do not drop avatar_url if it pre-existed; only drop when it was added by this migration.
  // Since we cannot know for sure at runtime, we keep avatar_url intact to avoid data loss.

  await Promise.all([dropGoogleId, dropProvider]);
};
