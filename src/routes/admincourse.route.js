// src/routes/admincourse.route.js
import express from 'express';
import { 
  list,               
  renderDeleteCourse, 
  deleteCourse        
} from '../controllers/admincourse.controller.js';
import { requireAdmin } from '../middlewares/authGuard.js';

const router = express.Router();


router.get('/', requireAdmin, list);


router.get('/:id/delete', requireAdmin, renderDeleteCourse);
router.post('/:id/delete', requireAdmin, deleteCourse);

export default router;
