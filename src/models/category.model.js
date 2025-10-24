import { db } from './db.js';

// Get all categories with hierarchy
export async function getAll() {
    const categories = await db('categories')
        .select('*')
        .orderBy('parent_id', 'asc')
        .orderBy('name', 'asc');

    // Organize into hierarchy
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create category objects
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
        if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id);
            if (parent) {
                parent.children.push(categoryMap.get(cat.id));
            }
        } else {
            rootCategories.push(categoryMap.get(cat.id));
        }
    });

    return rootCategories;
}

// Get category by ID
export async function findById(id) {
    return db('categories').where('id', id).first();
}

// Get categories with course counts
export async function getWithCourseCounts() {
    return db('categories')
        .select(
            'categories.*',
            db.raw('COUNT(courses.id) as course_count')
        )
        .leftJoin('courses', function () {
            this.on('categories.id', '=', 'courses.category_id')
                .andOn('courses.status', '=', db.raw("'published'"));
        })
        .groupBy('categories.id', 'categories.name', 'categories.parent_id')
        .orderBy('course_count', 'desc');
}

// Get popular categories (most enrolled)
export async function getPopular(limit = 5) {
    return db('categories')
        .select(
            'categories.*',
            db.raw('COUNT(DISTINCT enrollments.user_id) as enrollment_count')
        )
        .leftJoin('courses', 'categories.id', 'courses.category_id')
        .leftJoin('enrollments', 'courses.id', 'enrollments.course_id')
        .where('courses.status', 'published')
        .groupBy('categories.id', 'categories.name', 'categories.parent_id')
        .orderBy('enrollment_count', 'desc')
        .limit(limit);
}
export async function getMostViewed(limit = 10) {
    return db("courses")
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy("views", "desc")
        .limit(limit);
}
export async function getNewestCourse(limit = 10) {
    return db("courses")
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy("created_at", "desc")
        .limit(limit);
}
export async function getPopularWeekly(limit = 6) {
    return db('categories')
        .select(
            'categories.*',
            db.raw('COUNT(e.id) AS weekly_enrollment_count')
        )
        .join('courses as c', 'categories.id', 'c.category_id')
        .join('enrollments as e', 'c.id', 'e.course_id')
        .where('c.status', 'published')
        .andWhereRaw(`e.purchased_at >= NOW() - INTERVAL '7 days'`)
        .groupBy('categories.id', 'categories.name', 'categories.parent_id')
        .orderBy('weekly_enrollment_count', 'desc')
        .limit(limit);
}

// Get courses by category
export async function getCoursesByCategory(categoryId) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.category_id', categoryId)
        .andWhere('courses.status', 'published')
        .orderBy('courses.created_at', 'desc');
}

