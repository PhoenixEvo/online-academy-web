import { categoryModel } from '../models/category.model.js';
import { courseModel } from '../models/course.model.js';

export const adminCategoryController = {
  async list(req, res) {
    try {
      const categories = await categoryModel.findAllWithParentName();
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
      res.render('admins/category/add', {
        layout: 'main',
        parentCategories,
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

      // Nếu người dùng không chọn danh mục cha, set null
      const parentIdValue = parent_id === '' ? null : Number(parent_id);

      // Không truyền id — Supabase/Postgres sẽ tự tăng
      await categoryModel.insert({
        name: name.trim(),
        parent_id: parentIdValue,
      });

      res.redirect('/admins/categories');
    } catch (err) {
      console.error('❌ Error adding category:', err);
      res.status(500).send('Error adding category');
    }
  },

  async editForm(req, res) {
    try {
      const id = req.params.id;
      const category = await categoryModel.findById(id);
      const parentCategories = await categoryModel.findAllExcept(id);
      res.render('admins/category/edit', {
        layout: 'main',
        category,
        parentCategories,
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
      console.error('❌ Error updating category:', err);
      res.status(500).send('Error updating category');
    }
  },

  async delete(req, res) {
  try {
    const id = req.params.id;

    // 1️ Check if this category already has courses
    const hasCourses = await courseModel.hasCategory(id);
    if (hasCourses) {
      req.flash('error', 'Cannot delete this category because it already has courses.');
      return res.redirect('/admins/categories');
    }

    // 2️ Check if this category has any subcategories (child categories)
    const childCategories = await categoryModel.findByParentId(id);
    if (childCategories.length > 0) {
      req.flash('error', 'Cannot delete this category because it has subcategories.');
      return res.redirect('/admins/categories');
    }

    // 3️ If both checks pass, delete the category
    await categoryModel.delete(id);
    req.flash('success', 'Category deleted successfully.');
    res.redirect('/admins/categories');
  } catch (err) {
    console.error('❌ Error deleting category:', err);
    res.status(500).send('Error deleting category');
  }
},
};
