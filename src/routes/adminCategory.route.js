import express from 'express';
import { adminCategoryController } from '../controllers/adminCategory.controller.js';

const router = express.Router();


router.get('/', adminCategoryController.list);


router.get('/add', adminCategoryController.addForm);
router.post('/add', adminCategoryController.add);


router.get('/edit/:id', adminCategoryController.editForm);
router.post('/edit/:id', adminCategoryController.update);

router.post('/delete/:id', adminCategoryController.delete);

export default router;
