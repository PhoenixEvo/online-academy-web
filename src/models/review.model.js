import { db } from './db.js';

// Get reviews by course ID
export async function listByCourse(courseId, limit = 10) {
    return db('reviews')
        .select(
            'reviews.*',
            'users.name as user_name',
            'users.avatar_url'
        )
        .leftJoin('users', 'reviews.user_id', 'users.id')
        .where('reviews.course_id', courseId)
        .orderBy('reviews.created_at', 'desc')
        .limit(limit);
}

// Create new review
export async function create({ user_id, course_id, rating, comment }) {
    return db('reviews').insert({
        user_id,
        course_id,
        rating,
        comment
    });
}

// Check if user has reviewed course
export async function hasUserReviewed(userId, courseId) {
    const review = await db('reviews')
        .where({ user_id: userId, course_id: courseId })
        .first();

    return !!review;
}

// Get review statistics for course
export async function getCourseStats(courseId) {
    const stats = await db('reviews')
        .where('course_id', courseId)
        .select(
            db.raw('AVG(rating) as avg_rating'),
            db.raw('COUNT(*) as total_reviews'),
            db.raw('COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star'),
            db.raw('COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star'),
            db.raw('COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star'),
            db.raw('COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star'),
            db.raw('COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star')
        )
        .first();

    return {
        avg_rating: parseFloat(stats.avg_rating || 0).toFixed(1),
        total_reviews: parseInt(stats.total_reviews || 0),
        rating_distribution: {
            5: parseInt(stats.five_star || 0),
            4: parseInt(stats.four_star || 0),
            3: parseInt(stats.three_star || 0),
            2: parseInt(stats.two_star || 0),
            1: parseInt(stats.one_star || 0)
        }
    };
}
