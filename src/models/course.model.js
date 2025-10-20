// src/models/course.model.js
import { db } from './db.js';

export const courseModel = {
  async getCourseById(id) {
    try {
      const course = await db('courses').where({ id }).first();
      return course;
    } catch (error) {
      throw new Error(`Lỗi khi lấy khóa học: ${error.message}`);
    }
  },

  async deleteCourse(id) {
    try {
      const result = await db('courses').where({ id }).del();
      return result;
    } catch (error) {
      throw new Error(`Lỗi khi xóa khóa học: ${error.message}`);
    }
  },

  async hasCategory(categoryId) {
    try {
      const count = await db('courses').where({ category_id: categoryId }).count('id as count').first();
      return count.count > 0;
    } catch (error) {
      throw new Error(`Lỗi khi kiểm tra khóa học theo danh mục: ${error.message}`);
    }
  },

  async findAll() {
    try {
      const courses = await db('courses').select('*');
      return courses;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách khóa học: ${error.message}`);
    }
  }
};