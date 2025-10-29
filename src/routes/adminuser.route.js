import express from 'express';
import { adminUserController } from '../controllers/adminuser.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = express.Router();

// 📋 Danh sách user
router.get('/', requireAdmin, adminUserController.list);

// ➕ Thêm user
router.get('/add', requireAdmin, adminUserController.renderAddUser);
router.post('/add', requireAdmin, adminUserController.addUser);

// ✏️ Sửa user
router.get('/:id/edit', requireAdmin, adminUserController.renderEditUser);
router.post('/:id/update', requireAdmin, adminUserController.updateUser);

// ❌ Xóa user
router.get('/:id/delete', requireAdmin, adminUserController.renderDeleteUser);
router.post('/:id/delete', requireAdmin, adminUserController.deleteUser);

export default router;
