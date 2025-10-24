import express from 'express';
import * as categoryCtrl from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', categoryCtrl.list);                    // GET /categories - List all categories or show courses by category
router.get('/:id', categoryCtrl.detail);              // GET /categories/:id - Category detail

export default router;