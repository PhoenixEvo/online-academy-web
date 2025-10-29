    import { db } from './db.js';

    //Admin side

    export const categoryModel = {
    findAll: async () => db('categories').select('*'),
    findById: async (id) => db('categories').where({ id }).first(),
    findAllExcept: async (id) => db('categories').whereNot('id', id),
    insert: async (category) => {
        const { id, ...data } = category;
        return db('categories').insert(data).returning('*');
    },
    update: async (id, category) => db('categories').where({ id }).update(category),
    delete: async (id) => db('categories').where({ id }).del(),
    findAllWithParentName: async () =>
        db('categories as c')
        .leftJoin('categories as p', 'c.parent_id', 'p.id')
        .select('c.*', 'p.name as parent_name'),
    findByParentId: async (parent_id) => db('categories').where({ parent_id }),
    findAllWithParentNameAndCourseCount: async () =>
  db('categories as c')
    .leftJoin('categories as p', 'c.parent_id', 'p.id')
    .leftJoin('courses', 'c.id', 'courses.category_id')
    .select(
      'c.*',
      'p.name as parent_name',
      db.raw('COUNT(courses.id) as course_count')
    )
    .groupBy('c.id', 'p.name')
    .orderBy('c.id')
    };

    export async function getAll() {
        const categories = await db('categories')
            .select('*')
            .orderBy('parent_id', 'asc')
            .orderBy('name', 'asc');
        const categoryMap = new Map();
        const rootCategories = [];
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });
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

