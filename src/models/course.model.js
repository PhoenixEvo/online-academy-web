import db from '../config/db.js';

export function findById(id) {
  return db('courses').where('id', id).first();
}
export function searchByTitle(keyword) {
    return db('courses').where('title', 'ilike', `%${keyword}%`);
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
