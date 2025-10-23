import { db } from '../models/db.js';
import {courseTaughtBy,getInstructorId} from '../models/course.model.js';
// Controllers + routes cho Instructor
// Create draft course (WYSIWYG desc)
// export async function createCourseDraft(req, res, next) {
  
// }
// Edit info, upload video, mark completed
export async function editCourse(req, res, next) {
  res.render('vWInstructors/edit');
}
export async function listInstructorCourses(req, res, next) {
// List instructor courses
  const instructorUserId = req.user.id;
//   const instructorId = await getInstructorId(instructorUserId);
//   console.log('Instructor ID:', instructorId);
  const list = await courseTaughtBy(instructorUserId);
//   console.log('Courses List:', list);
  res.render('vwInstructorCourse/mycourses', { 
    courses: list, 
  });
}
export async function showEditCourseForm(req, res, next) {
  res.render('vwInstructorCourse/course-form');
}
export async function addCourseContent(req, res, next) {
  // const courseId = req.params.id;
  // const content = req.body.content;

  // Logic to add content to the course
  res.render('vwInstructorCourse/course-form',{

  });
}