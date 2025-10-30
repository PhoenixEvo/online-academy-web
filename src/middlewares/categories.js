import * as Category from '../models/category.model.js';

// Middleware to add categories to all views
export async function addCategoriesToLocals(req, res, next) {
    try {
        const categories = await Category.getAll();
        res.locals.categories = categories;
        next();
    } catch (error) {
        console.error('Error loading categories:', error);
        next();
    }
}
