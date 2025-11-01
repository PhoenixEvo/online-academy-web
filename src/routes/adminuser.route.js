import { Router } from 'express';
import { adminUserController } from '../controllers/adminuser.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = Router();

// List users (admins & students)
router.get('/', requireAdmin, adminUserController.list);

// Add new user
router.get('/add', requireAdmin, adminUserController.renderAddUser);
router.post('/add', requireAdmin, adminUserController.addUser);

// Edit user
router.get('/:id/edit', requireAdmin, adminUserController.renderEditUser);
router.post('/:id/update', requireAdmin, adminUserController.updateUser);

// Lock / Unlock
router.post('/:id/lock', requireAdmin, adminUserController.lockUser);
router.post('/:id/unlock', requireAdmin, adminUserController.unlockUser);

// Delete (render + confirm)
router.get('/:id/delete', requireAdmin, adminUserController.renderDeleteUser);
router.delete('/:id', requireAdmin, adminUserController.deleteUser);

export default router;
