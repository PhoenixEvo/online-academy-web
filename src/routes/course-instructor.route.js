import { Router } from "express";
import { showCourseSections, searchCoursesByTitle, showCourseDetails, addLessonToSectionOfCourse, addSectionToCourse, listSectionsLessonsForCourse, listInstructorCourses, showAddCourseForm, addCourseInformation, showEditCourseForm, updateCourseContent } from '../controllers/course-instructor.controller.js';
// import { listInstructorCourses } from '../controllers/course.controller.js';
const router = Router();

router.get('/', listInstructorCourses);
// console.log('Instructor course route loaded');
router.get('/add', showAddCourseForm);
router.post('/add', addCourseInformation);
router.get('/edit', (req, res) => res.redirect('/instructor/courses'));
router.get('/edit/:id', showEditCourseForm);
// Sections + lessons
router.get('/edit/:id/sections', listSectionsLessonsForCourse);
router.post('/edit/:id/sections', addSectionToCourse);
router.post('/edit/:id/sections/:sectionId/lessons', addLessonToSectionOfCourse);
// Delete a lesson
router.post('/edit/:id/lessons/:lessonId/delete', async (req, res, next) => {
	try {
		const { id, lessonId } = req.params;
		// Defer to controller to perform deletion
		const { deleteLessonOfCourse } = await import('../controllers/course-instructor.controller.js');
		return deleteLessonOfCourse(req, res, next);
	} catch (err) { next(err); }
});
// Update course info
router.post('/edit/:id', updateCourseContent);
// view course details
router.get('/details/:id', showCourseDetails);
// router.get('/search', searchCoursesByTitle);
export default router;