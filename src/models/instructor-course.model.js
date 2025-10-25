import db from '../models/db.js';

export function findById(id) {
    return db('courses').where('id', id).first();
}
export function searchByTitle(keyword) {
    return db('courses').where('title', 'ilike', `%${keyword}%`);
}
export async function getInstructorId(userId) {
    // return db('instructors').select('id').where('user_id', userId).first()?.id;
    const instructorId =  await db('instructors')
    .select('id')
    .where('user_id', userId)
    .first();
    return instructorId?.id;
}
export function courseTaughtBy(instructorId) {
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
        return db('reviews')
            .join('users', 'reviews.user_id', 'users.id')
            .where('reviews.course_id', courseId)
            .select(
                'reviews.id',
                'reviews.user_id',
                'reviews.course_id',
                'reviews.rating',
                'reviews.comment',
                'reviews.created_at',
                'users.name as user_name',
                'users.avatar_url as user_avatar_url'
            )
            .orderBy('reviews.created_at', 'desc');
}
export function getCourseInformation(courseId) {
    return db('courses').where('id', courseId).first();
}

