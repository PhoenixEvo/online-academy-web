import express from 'express';
import instructorModel from '../models/instructor.model.js';
import { 
  getAllInstructors, 
  getInstructorProfile, 
  getInstructorAPI 
} from '../controllers/instructor.controller.js';

const router = express.Router();

router.get('/', getAllInstructors);

router.get('/:userId', getInstructorProfile);

router.get('/api/:userId', getInstructorAPI);




export default router;