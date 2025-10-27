// src/routes/admininstructor.route.js
import express from 'express';
import { adminInstructorController } from '../controllers/admininstructor.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = express.Router();

router.get('/', requireAdmin, adminInstructorController.list);
router.get('/add', requireAdmin, adminInstructorController.renderAdd);
router.post('/add', requireAdmin, adminInstructorController.add);

router.get('/:id/edit', requireAdmin, adminInstructorController.renderEdit);     // DÒNG 18
router.post('/:id/update', requireAdmin, adminInstructorController.update);

router.get('/:id/delete', requireAdmin, adminInstructorController.renderDelete);
router.post('/:id/delete', requireAdmin, adminInstructorController.delete);

export default router;