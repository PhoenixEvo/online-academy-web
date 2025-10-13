import express from 'express';
import { adminCategoryController } from '../controllers/adminCategory.controller.js';

const router = express.Router();

// Danh sách lĩnh vực
router.get('/', adminCategoryController.list);

// Thêm mới
router.get('/add', adminCategoryController.addForm);
router.post('/add', adminCategoryController.add);

// Chỉnh sửa
router.get('/edit/:id', adminCategoryController.editForm);
router.post('/edit/:id', adminCategoryController.update);

// Xoá
router.post('/delete/:id', adminCategoryController.delete);

export default router;
