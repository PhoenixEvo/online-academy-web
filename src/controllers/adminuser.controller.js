// src/controllers/adminuser.controller.js
import { userModel } from '../models/user.model.js';
import { instructorModel } from '../models/admininstructor.model.js';
import bcrypt from 'bcrypt';
export const adminUserController = {
async list(req, res) {
  try {
    const filter = req.query.filter || 'all';
    let users = await userModel.findAll();
    
    let admins = [], students = [];

    
    users.forEach(u => {
      if (u.role === 'admin') admins.push(u);
      else if (u.role === 'student') students.push(u);

    });

    let filteredUsers = [];
    if (filter === 'admin') filteredUsers = admins;
    else if (filter === 'student') filteredUsers = students;
    else filteredUsers = [...admins, ...students]; 

    const totalUsers = admins.length + students.length;

    res.render('admins/users/list', {
      layout: 'main',
      users: filteredUsers,
      admins,
      students,
      totalUsers,
      filter, 
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
    const old = req.flash('old')[0] || {};
  const error = req.flash('error')[0];
  const success = req.flash('success')[0];
    res.render('admins/users/add', {
      layout: 'main',
      title: 'Add Admin or Student',
      success,
      error,
      old,
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
        req.flash('old', { name, email, role, avatar_url });
        return res.redirect('/admins/users/add');
      }

      await userModel.createUser({ name, email, password, role, avatar_url, is_verified: true });
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
      if (!user || !['admin', 'student', 'instructor'].includes(user.role)) {
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
  const currentUser = req.user;
const oldUser = await userModel.getUserById(id);
  try {
    const user = await userModel.getUserById(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admins/users');
    }
    if (user.role === 'admin' && currentUser.id.toString() !== id) {
      if (currentUser.id.toString() !== '113') {
        req.flash('error', 'Only Super Admin can modify other admin accounts');
        return res.redirect('/admins/users');
      }
    }
if (role === 'instructor' && currentUser.role !== 'admin') {
  req.flash('error', 'Only admins can assign instructor role');
  return res.redirect(`/admins/users/${id}/edit`);
}
    if (currentUser.id.toString() === id && role && role !== 'admin') {
      req.flash('error', 'You cannot downgrade your own admin role');
      return res.redirect(`/admins/users/${id}/edit`);
    }

   if (role && !['admin', 'student', 'instructor'].includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect(`/admins/users/${id}/edit`);
    }

    const existing = await userModel.findByEmail(email);
    if (existing && existing.id.toString() !== id) {
      req.flash('error', 'Email already in use');
      return res.redirect(`/admins/users/${id}/edit`);
    }
    const updateData = {
      name,
      email,
      role,
      avatar_url: avatar_url || null,
      is_verified: is_verified === 'on'
    };

   
    if (password && password.trim() !== '') {
      updateData.password = password;
    }
await userModel.updateUser(id, updateData);
    
const isRoleChangedToInstructor = role === 'instructor' && oldUser.role !== 'instructor';

if (isRoleChangedToInstructor) {
  try {
    
    const existingInstructor = await instructorModel.getInstructorByUserId(id);
    if (!existingInstructor) {
      await instructorModel.createInstructor({
        name: name || oldUser.name,
        display_name: name || oldUser.name,
        job_title: 'Instructor',
        image_50x50: avatar_url || oldUser.avatar_url,
        image_100x100: avatar_url || oldUser.avatar_url,
        user_id: id,
      });
    }
  } catch (err) {
    console.error('[updateUser] Failed to create instructor record:', err);
   
  }
}

if (oldUser.role === 'instructor' && role !== 'instructor') {
  try {
    await instructorModel.deleteByUserId?.(id) || await instructorModel.destroy({ where: { user_id: id } });
  } catch (err) {
    console.error('[updateUser] Failed to delete instructor record:', err);
  }
}

req.flash('success', 'User updated successfully');
return res.redirect('/admins/users');

  } catch (error) {
    console.error('[updateUser] Error:', error);
    req.flash('error', error.message || 'Update failed');
    return res.redirect(`/admins/users/${id}/edit`);
  }
},

  async renderDeleteUser(req, res) {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (!user || !['admin', 'student'].includes(user.role)) {
      req.flash('error', 'User not found or not allowed');
      return res.redirect('/admins/users');
    }
    if (
      user.role === 'admin' && 
      req.user.id.toString() !== '113' && 
      user.id.toString() !== req.user.id.toString()
    ) {
      req.flash('error', 'Only Super Admin can delete other admin accounts');
      return res.redirect('/admins/users');
    }

    if (user.id.toString() === '113' || req.user.id.toString() === id) {
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
      req.flash('error', 'User not found or not allowed');
      return res.redirect('/admins/users');
    }

    if (
      user.role === 'admin' && 
      req.user.id.toString() !== '113'
    ) {
      req.flash('error', 'Only Super Admin can delete admin accounts');
      return res.redirect('/admins/users');
    }

    if (user.id.toString() === '113' || req.user.id.toString() === id) {
      req.flash('error', 'Cannot delete this account');
      return res.redirect('/admins/users');
    }

    await userModel.deleteUser(id);
    req.flash('success', 'User deleted successfully');
    return res.redirect('/admins/users');
  } catch (error) {
    console.error('[deleteUser] Error:', error);
    req.flash('error', 'Delete failed');
    return res.redirect('/admins/users');
  }
},
};