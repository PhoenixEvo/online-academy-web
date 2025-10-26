    import { db } from './db.js';

    //Admin side

    export const categoryModel = {
    // Get all categories
    findAll: async () => db('categories').select('*'),

    // Get category by ID
    findById: async (id) => db('categories').where({ id }).first(),
    // Get all categories except one (by ID)
    findAllExcept: async (id) => db('categories').whereNot('id', id),

    // Insert a new category
    insert: async (category) => {
        const { id, ...data } = category;
        return db('categories').insert(data).returning('*');
    },

    // Update a category by ID
    update: async (id, category) => db('categories').where({ id }).update(category),

    // Delete a category by ID
    delete: async (id) => db('categories').where({ id }).del(),

    // Get all categories with their parent names
    findAllWithParentName: async () =>
        db('categories as c')
        .leftJoin('categories as p', 'c.parent_id', 'p.id')
        .select('c.*', 'p.name as parent_name'),

    // 🔹 Get all subcategories of a given parent
    findByParentId: async (parent_id) => db('categories').where({ parent_id }),
    };
    
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
