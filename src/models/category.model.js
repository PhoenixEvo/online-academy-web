import { db } from './db.js';

export const categoryModel = {
  // Get all categories
  findAll: async () => db('categories').select('*'),

  // Get category by ID
  findById: async (id) => db('categories').where({ id }).first(),

  // Get all categories except one (by ID)
  findAllExcept: async (id) => db('categories').whereNot('id', id),

  // Insert a new category
  insert: async (category) => {
    const { id, ...data } = category;
    return db('categories').insert(data).returning('*');
  },

  // Update a category by ID
  update: async (id, category) => db('categories').where({ id }).update(category),

  // Delete a category by ID
  delete: async (id) => db('categories').where({ id }).del(),

  // Get all categories with their parent names
  findAllWithParentName: async () =>
    db('categories as c')
      .leftJoin('categories as p', 'c.parent_id', 'p.id')
      .select('c.*', 'p.name as parent_name'),

  // 🔹 Get all subcategories of a given parent
  findByParentId: async (parent_id) => db('categories').where({ parent_id }),
};
