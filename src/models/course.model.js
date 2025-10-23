// src/models/course.model.js
import { db } from './db.js';

export const courseModel = {
  // Lấy tất cả khóa học
  async findAll() {
    try {
      return await db('courses').select('*').orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khóa học:', error);
      throw new Error(`Lỗi khi lấy danh sách khóa học: ${error.message}`);
    }
  },

  // Lấy khóa học theo ID
  async getCourseById(id) {
    try {
      return await db('courses')
        .where({ id })
        .first();
    } catch (error) {
      console.error('Lỗi khi lấy khóa học:', error);
      throw new Error(`Lỗi khi lấy khóa học: ${error.message}`);
    }
  },

  // Xóa khóa học
  async deleteCourse(id) {
    try {
      const result = await db('courses').where({ id }).del();
      return result > 0;
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      throw new Error(`Lỗi khi xóa khóa học: ${error.message}`);
    }
  },

  // Kiểm tra xem khóa học có sinh viên đăng ký không
  async hasEnrollments(courseId) {
    try {
      const count = await db('enrollments')
        .where({ course_id: courseId })
        .count('id as count')
        .first();
      return count.count > 0;
    } catch (error) {
      console.error('Lỗi khi kiểm tra sinh viên đăng ký:', error);
      throw new Error(`Lỗi khi kiểm tra sinh viên đăng ký: ${error.message}`);
    }
  }
};
