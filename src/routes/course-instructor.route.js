import { Router } from "express";
import { listInstructorCourses, addCourseContent,showEditCourseForm } from '../controllers/course-instructor.controller.js';
// import { listInstructorCourses } from '../controllers/course.controller.js';
const router = Router();

router.get('/', listInstructorCourses);
// console.log('Instructor course route loaded');
router.get('/add', showEditCourseForm);

router.post('/add', addCourseContent);
export default router;