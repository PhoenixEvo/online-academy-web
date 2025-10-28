import * as Category from '../models/category.model.js';

// GET /categories - List all categories or show courses by category
export async function list(req, res, next) {
    try {
        const categoryId = req.query.category && req.query.category !== '' ? parseInt(req.query.category) : null;
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).render('error', { message: 'Category not found' });
            }

            // Use recursive function to get courses from parent + subcategories
            const courses = await Category.getCoursesByCategoryRecursive(categoryId);

            res.render('category/detail', {
                title: category.name,
                category,
                courses
            });
        } else {
            const categories = await Category.getWithCourseCounts();
            res.render('category/list', {
                title: 'All Categories',
                categories
            });
        }
    } catch (error) {
        console.error('Error in category list:', error);
        next(error);
    }
}

// GET /categories/:id - Category detail page
export async function detail(req, res, next) {
    try {
        const categoryId = parseInt(req.params.id);

        if (isNaN(categoryId)) {
            return res.status(400).render('error', { message: 'Invalid category ID' });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).render('error', { message: 'Category not found' });
        }

        // Get courses in this category
        const courses = await Category.getCoursesByCategory(categoryId);

        res.render('category/detail', {
            title: category.name,
            category,
            courses
        });
    } catch (error) {
        console.error('Error in category detail:', error);
        next(error);
    }
}
