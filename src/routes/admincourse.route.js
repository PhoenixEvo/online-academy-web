// src/routes/admincourse.route.js
import express from 'express';
import * as adminCourseController from '../controllers/admincourse.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = express.Router();

// Danh sách courses
router.get('/', requireAdmin, adminCourseController.list);

// Hiển thị form xóa course
router.get('/:id/delete', requireAdmin, adminCourseController.renderDeleteCourse);

// Xử lý xóa course thực sự
router.post('/:id/delete', requireAdmin, adminCourseController.deleteCourse);

// Chỉnh sửa course
router.get('/:id/edit', requireAdmin, adminCourseController.renderEditCourse);
router.post('/:id/edit', requireAdmin, adminCourseController.updateCourse);

export default router;
