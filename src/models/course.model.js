import { db } from './db.js';

// Find course by ID with instructor and category info
export async function findById(id) {
    const course = await db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'users.email as instructor_email',
            'categories.name as category_name',
            'categories.parent_id as category_parent_id'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.id', id)
        .first();

    return course;
}

// Find courses with pagination and sorting
export async function findPaged({ page = 1, pageSize = 12, sort = 'rating_desc', categoryId = null, search = null } = {}) {
    const offset = (page - 1) * pageSize;

    let query = db('courses')
        .select(
            'courses.id',
            'courses.title',
            'courses.short_desc',
            'courses.price',
            'courses.sale_price',
            'courses.rating_avg',
            'courses.rating_count',
            'courses.views',
            'courses.thumbnail_url',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published');

    // Filter by category
    if (categoryId) {
        query = query.where('courses.category_id', categoryId);
    }

    // Search functionality
    if (search) {
        query = query.where(function () {
            this.where('courses.title', 'ilike', `%${search}%`)
                .orWhere('courses.short_desc', 'ilike', `%${search}%`)
                .orWhere('categories.name', 'ilike', `%${search}%`);
        });
    }

    // Apply sorting
    switch (sort) {
        case 'rating_desc':
            query = query.orderBy('courses.rating_avg', 'desc');
            break;
        case 'price_asc':
            query = query.orderBy('courses.price', 'asc');
            break;
        case 'newest':
            query = query.orderBy('courses.created_at', 'desc');
            break;
        default:
            query = query.orderBy('courses.rating_avg', 'desc');
    }
    const countQuery = db('courses')
        .where('courses.status', 'published');

    if (categoryId) {
        countQuery.where('courses.category_id', categoryId);
    }

    if (search) {
        countQuery.where(function () {
            this.where('courses.title', 'ilike', `%${search}%`)
                .orWhere('courses.short_desc', 'ilike', `%${search}%`)
                .orWhere('categories.name', 'ilike', `%${search}%`);
        });
    }

    const [countResult, rows] = await Promise.all([
        countQuery.count('* as total'),
        query.limit(pageSize).offset(offset)
    ]);

    const total = parseInt(countResult[0].total);

    return { rows, total };
}

// Get most viewed courses
export async function getMostViewed(limit = 10) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy('courses.views', 'desc')
        .limit(limit);
}

// Get newest courses
export async function getNewest(limit = 10) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy('courses.created_at', 'desc')
        .limit(limit);
}

// Get best courses in category
export async function bestInCategory(categoryId, limit = 5) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.category_id', categoryId)
        .where('courses.status', 'published')
        .orderBy('courses.rating_avg', 'desc')
        .limit(limit);
}

// Increment course views
export async function incrementViews(courseId) {
    return db('courses')
        .where('id', courseId)
        .increment('views', 1);
}

// Update course rating stats
export async function updateRatingStats(courseId) {
    const stats = await db('reviews')
        .where('course_id', courseId)
        .select(
            db.raw('AVG(rating) as avg_rating'),
            db.raw('COUNT(*) as count')
        )
        .first();

    return db('courses')
        .where('id', courseId)
        .update({
            rating_avg: stats.avg_rating || 0,
            rating_count: stats.count || 0
        });
}

// Get course sections and lessons
export async function getCourseContent(courseId) {
    const sections = await db('sections')
        .where('course_id', courseId)
        .orderBy('order_index', 'asc');

    for (const section of sections) {
        section.lessons = await db('lessons')
            .where('section_id', section.id)
            .orderBy('order_index', 'asc');
    }

    return sections;
}
