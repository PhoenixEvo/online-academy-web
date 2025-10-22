import { db } from './db.js';

// Enroll user in course
export async function enroll(userId, courseId) {
    return db('enrollments').insert({
        user_id: userId,
        course_id: courseId,
        active: true
    }).onConflict(['user_id', 'course_id']).ignore();
}

// Check if user is enrolled in course
export async function isEnrolled(userId, courseId) {
    const enrollment = await db('enrollments')
        .where({
            user_id: userId,
            course_id: courseId,
            active: true
        })
        .first();

    return !!enrollment;
}

// Get user's enrolled courses
export async function getUserEnrollments(userId, page = 1, pageSize = 12) {
    const offset = (page - 1) * pageSize;

    const countQuery = db('enrollments')
        .where('user_id', userId)
        .where('active', true)
        .count('* as total');

    const [{ total }] = await countQuery;

    const courses = await db('enrollments')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name',
            'enrollments.purchased_at',
            'enrollments.active'
        )
        .leftJoin('courses', 'enrollments.course_id', 'courses.id')
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('enrollments.user_id', userId)
        .where('enrollments.active', true)
        .orderBy('enrollments.purchased_at', 'desc')
        .limit(pageSize)
        .offset(offset);

    return {
        courses,
        total: parseInt(total),
        page,
        totalPages: Math.ceil(total / pageSize)
    };
}

// Get course enrollment count
export async function getCourseEnrollmentCount(courseId) {
    const [{ count }] = await db('enrollments')
        .where('course_id', courseId)
        .where('active', true)
        .count('* as count');

    return parseInt(count);
}
