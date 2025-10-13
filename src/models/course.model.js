import { db } from './db.js';

export const courseModel = {
  // Kiểm tra xem có khoá học nào thuộc lĩnh vực này không
  hasCategory: async (categoryId) => {
    const result = await db('courses').where({ category_id: categoryId }).first();
    return !!result;
  },
};
