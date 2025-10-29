import { categoryModel } from '../models/category.model.js';
import { courseModel } from '../models/course.model.js';

export const adminCategoryController = {
  async list(req, res) {
    try {
    const categories = await categoryModel.findAllWithParentNameAndCourseCount();
    res.render('admins/category/list', {
      layout: 'main',
      categories,
      title: 'Category Management',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading category list');
  }
},

  async addForm(req, res) {
  try {
    const parentCategories = await categoryModel.findAll();
    const courses = await courseModel.getAllPublished();
    res.render('admins/category/add', {
      layout: 'main',
      parentCategories,
      courses,
      title: 'Add New Category',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading add form');
  }
},

  async add(req, res) {
    try {
      const { name, parent_id } = req.body;

      
      const parentIdValue = parent_id === '' ? null : Number(parent_id);

      
      await categoryModel.insert({
        name: name.trim(),
        parent_id: parentIdValue,
      });

      res.redirect('/admins/categories');
    } catch (err) {
      console.error(' Error adding category:', err);
      res.status(500).send('Error adding category');
    }
  },

  async editForm(req, res) {
  try {
    const id = req.params.id;
    const category = await categoryModel.findById(id);
    const parentCategories = await categoryModel.findAllExcept(id);
    const courses = await courseModel.getAllPublished();
    const selectedCourses = await courseModel.findByCategoryId(id);

    
    const selectedCourseIds = new Set(selectedCourses.map(c => c.id));

    res.render('admins/category/edit', {
      layout: 'main',
      category,
      parentCategories,
      courses,
      selectedCourseIds: Array.from(selectedCourseIds),
      title: 'Edit Category',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading edit form');
  }
},

  async update(req, res) {
    try {
      const id = req.params.id;
      const { name, parent_id } = req.body;

      const parentIdValue = parent_id === '' ? null : Number(parent_id);

      await categoryModel.update(id, {
        name: name.trim(),
        parent_id: parentIdValue,
      });

      res.redirect('/admins/categories');
    } catch (err) {
      console.error(' Error updating category:', err);
      res.status(500).send('Error updating category');
    }
  },

  async delete(req, res) {
  try {
    const id = req.params.id;

  
    const hasCourses = await courseModel.hasCategory(id);
    if (hasCourses) {
      req.flash('error', 'Cannot delete this category because it already has courses.');
      return res.redirect('/admins/categories');
    }

  
    const childCategories = await categoryModel.findByParentId(id);
    if (childCategories.length > 0) {
      req.flash('error', 'Cannot delete this category because it has subcategories.');
      return res.redirect('/admins/categories');
    }


    await categoryModel.delete(id);
    req.flash('success', 'Category deleted successfully.');
    res.redirect('/admins/categories');
  } catch (err) {
    console.error(' Error deleting category:', err);
    res.status(500).send('Error deleting category');
  }
},
};
