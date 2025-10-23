// src/routes/admincourse.route.js
import express from 'express';
import { 
  list,               // danh sách khóa học
  renderDeleteCourse, // hiển thị form xóa
  deleteCourse        // xử lý xóa
} from '../controllers/admincourse.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = express.Router();

// ================== DANH SÁCH KHÓA HỌC ==================
router.get('/', requireAdmin, list);

// ================== XÓA KHÓA HỌC ==================
router.get('/:id/delete', requireAdmin, renderDeleteCourse);
router.post('/:id/delete', requireAdmin, deleteCourse);

export default router;
