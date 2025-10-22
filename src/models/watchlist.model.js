import { db } from './db.js';

// Add course to watchlist
export async function add(userId, courseId) {
    return db('watchlist').insert({
        user_id: userId,
        course_id: courseId
    }).onConflict(['user_id', 'course_id']).ignore();
}

// Remove course from watchlist
export async function remove(userId, courseId) {
    return db('watchlist')
        .where({ user_id: userId, course_id: courseId })
        .del();
}

// Check if course is in user's watchlist
export async function isInWatchlist(userId, courseId) {
    const item = await db('watchlist')
        .where({ user_id: userId, course_id: courseId })
        .first();

    return !!item;
}

// Get user's watchlist
export async function getUserWatchlist(userId, page = 1, pageSize = 12) {
    const offset = (page - 1) * pageSize;

    const countQuery = db('watchlist')
        .where('user_id', userId)
        .count('* as total');

    const [{ total }] = await countQuery;

    const courses = await db('watchlist')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name',
            'watchlist.created_at as added_at'
        )
        .leftJoin('courses', 'watchlist.course_id', 'courses.id')
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('watchlist.user_id', userId)
        .where('courses.status', 'published')
        .orderBy('watchlist.created_at', 'desc')
        .limit(pageSize)
        .offset(offset);

    return {
        courses,
        total: parseInt(total),
        page,
        totalPages: Math.ceil(total / pageSize)
    };
}
