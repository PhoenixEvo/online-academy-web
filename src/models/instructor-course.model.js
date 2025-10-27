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
export async function getInstructorStats(instructorId) {
    const courseCount = await db('courses')
        .where('instructor_id', instructorId)
        .where('status', 'published')
        .count('* as count')
        .first();

    const totalStudents = await db('enrollments')
        .join('courses', 'enrollments.course_id', 'courses.id')
        .where('courses.instructor_id', instructorId)
        .where('courses.status', 'published')
        .countDistinct('enrollments.user_id as count')
        .first();

    const avgRating = await db('courses')
        .where('instructor_id', instructorId)
        .where('status', 'published')
        .avg('rating_avg as avg')
        .first();

    // Sum total views across all courses by this instructor (any status)
    const totalViews = await db('courses')
        .where('instructor_id', instructorId)
        .sum({ sum: 'views' })
        .first();

    // Count courses by status for breakdown
    const byStatusRows = await db('courses')
        .where('instructor_id', instructorId)
        .select('status')
        .count('* as count')
        .groupBy('status');

    const breakdown = { draft: 0, published: 0, completed: 0 };
    for (const r of byStatusRows) {
        const key = String(r.status || '').toLowerCase();
        if (key in breakdown) breakdown[key] = parseInt(r.count || 0);
    }

    const total_courses = breakdown.draft + breakdown.published + breakdown.completed;

    return {
        course_count: parseInt(courseCount.count || 0), // published only (back-compat)
        total_students: parseInt(totalStudents.count || 0),
        avg_rating: parseFloat(avgRating.avg || 0).toFixed(1),
        total_viewers: parseInt((totalViews && (totalViews.sum ?? totalViews.SUM)) || 0),
        total_courses,
        courses_breakdown: breakdown
    };
}


