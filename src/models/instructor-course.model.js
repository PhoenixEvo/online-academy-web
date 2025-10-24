import db from './db.js';

export function findById(id) {
  return db('courses').where('id', id).first();
}

export function searchByTitle(keyword) {
  return db('courses').where('title', 'ilike', `%${keyword}%`);
}

export async function getInstructorId(userId) {
  const instructorId = await db('instructors')
    .select('id')
    .where('user_id', userId)
    .first();
  return instructorId?.id;
}

export function courseTaughtBy(instructorId, countOnly = false) {
  if (countOnly) {
    return db('courses')
      .where('instructor_id', instructorId)
      .count('* as amount')
      .first();
  }
  return db('courses').where('instructor_id', instructorId);
}

export function addCourse(course) {
  return db('courses').insert(course).returning('*');
}

export function updateCourse(id, course) {
  return db('courses').where('id', id).update(course).returning('*');
}

export function getLessonsBySectionId(sectionId) {
  return db('lessons').where('section_id', sectionId);
}

export function addLesson(lesson) {
  return db('lessons').insert(lesson).returning('*');
}

export function getSectionsByCourseId(courseId) {
  return db('sections').where('course_id', courseId);
}

export function addSection(section) {
  return db('sections').insert(section).returning('*');
}

export function getReviewsByCourseId(courseId) {
  return db('reviews').where('course_id', courseId);
}

export function getCourseInformation(courseId) {
  return db('courses').where('id', courseId).first();
}
