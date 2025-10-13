import * as Category from '../models/category.model.js';

// Middleware to add categories to all views
export async function addCategoriesToLocals(req, res, next) {
    try {
        // Only add categories for guest users (not authenticated)
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            const categories = await Category.getAll();
            res.locals.categories = categories;
        }
        next();
    } catch (error) {
        console.error('Error loading categories:', error);
        next();
    }
}
