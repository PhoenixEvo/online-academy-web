// src/controllers/adminuser.controller.js
import { userModel } from '../models/user.model.js';

export const adminUserController = {
  async list(req, res) {
    try {
      const users = await userModel.findAll();
      const admins = users.filter(u => u.role === 'admin');
      const students = users.filter(u => u.role === 'student');
      const totalUsers = admins.length + students.length;

      res.render('admins/users/list', {
        layout: 'main',
        users: [...admins, ...students],
        admins,
        students,
        totalUsers,
        title: 'User Management (Admins & Students)',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error('[adminuser.list] Error:', error);
      req.flash('error', 'Failed to load users');
      return res.redirect('/admins/users');
    }
  },

  async renderAddUser(req, res) {
    res.render('admins/users/add', {
      layout: 'main',
      title: 'Add Admin or Student',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken(),
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  },

  async addUser(req, res) {
    const { name, email, password, role, avatar_url } = req.body;
    try {
      if (!name || !email || !password || !role) {
        req.flash('error', 'Please fill all required fields');
        return res.redirect('/admins/users/add');
      }

      if (!['admin', 'student'].includes(role)) {
        req.flash('error', 'Invalid role. Only admin or student allowed.');
        return res.redirect('/admins/users/add');
      }

      const existing = await userModel.findByEmail(email);
      if (existing) {
        req.flash('error', 'Email already exists');
        return res.redirect('/admins/users/add');
      }

      await userModel.createUser({ name, email, password, role, avatar_url });
      req.flash('success', `${role === 'admin' ? 'Admin' : 'Student'} added successfully`);
      return res.redirect('/admins/users');
    } catch (error) {
      console.error('[addUser] Error:', error);
      req.flash('error', error.message);
      return res.redirect('/admins/users/add');
    }
  },

  async renderEditUser(req, res) {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(id);
      if (!user || !['admin', 'student'].includes(user.role)) {
        req.flash('error', 'User not found or not allowed');
        return res.redirect('/admins/users');
      }

      res.render('admins/users/edit', {
        layout: 'main',
        editUser: user,
        title: 'Edit User',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      req.flash('error', 'Error loading user');
      return res.redirect('/admins/users');
    }
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password, role, avatar_url, is_verified } = req.body;

    try {
      if (!name || !email || !role) {
        req.flash('error', 'Required fields missing');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      if (!['admin', 'student'].includes(role)) {
        req.flash('error', 'Invalid role');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      const user = await userModel.getUserById(id);
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/admins/users');
      }

      const existing = await userModel.findByEmail(email);
      if (existing && existing.id.toString() !== id) {
        req.flash('error', 'Email already in use');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      const updateData = {
        name, email, role, avatar_url: avatar_url || null,
        is_verified: is_verified === 'on' || is_verified === true
      };

      if (password && password.trim()) {
        const bcrypt = await import('bcryptjs');
        updateData.password = await bcrypt.hash(password, 10);
      }

      await userModel.updateUser(id, updateData);
      req.flash('success', 'User updated');
      return res.redirect('/admins/users');
    } catch (error) {
      req.flash('error', error.message);
      return res.redirect(`/admins/users/${id}/edit`);
    }
  },

  async renderDeleteUser(req, res) {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(id);
      if (!user || !['admin', 'student'].includes(user.role)) {
        req.flash('error', 'User not found');
        return res.redirect('/admins/users');
      }

      if (user.id.toString() === '34' || req.user.id.toString() === id) {
        req.flash('error', 'Cannot delete this account');
        return res.redirect('/admins/users');
      }

      res.render('admins/users/removeUser', {
        layout: 'main',
        user,
        title: 'Delete User',
        csrfToken: req.csrfToken(),
        userSession: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      req.flash('error', 'Error');
      return res.redirect('/admins/users');
    }
  },

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(id);
      if (!user || !['admin', 'student'].includes(user.role)) {
        req.flash('error', 'User not found');
        return res.redirect('/admins/users');
      }

      if (user.id.toString() === '34' || req.user.id.toString() === id) {
        req.flash('error', 'Cannot delete this account');
        return res.redirect('/admins/users');
      }

      await userModel.deleteUser(id);
      req.flash('success', 'User deleted');
      return res.redirect('/admins/users');
    } catch (error) {
      req.flash('error', 'Delete failed');
      return res.redirect('/admins/users');
    }
  }
};