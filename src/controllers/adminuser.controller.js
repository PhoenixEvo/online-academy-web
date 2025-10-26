// src/controllers/adminuser.controller.js
import { userModel } from '../models/user.model.js';

export const adminUserController = {
  // Lấy danh sách tất cả user, lọc học viên và giảng viên
  async list(req, res) {
    try {
      const users = await userModel.findAll();
      const students = users.filter(user => user.role === 'student');
      const instructors = users.filter(user => user.role === 'instructor');

      console.log(`[list] Fetched ${users.length} users, ${students.length} students, ${instructors.length} instructors`);

      res.render('admins/users/list', {
        layout: 'main',
        users,
        students,
        instructors,
        title: 'Quản lý User (Học viên & Giảng viên)',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error('❌ [list] Lỗi khi lấy danh sách user:', error);
      return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
  },

  // Hiển thị form thêm user
  async renderAddUser(req, res) {
    try {
      res.render('admins/users/add', {
        layout: 'main',
        title: 'Thêm User (Học viên hoặc Giảng viên)',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error('❌ [renderAddUser] Lỗi khi hiển thị form thêm user:', error);
      return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
  },

  // Thêm user mới
  async addUser(req, res) {
    const { name, email, password, role, avatar_url } = req.body;
    try {
      console.log(`[addUser] Input: name=${name}, email=${email}, role=${role}, avatar_url=${avatar_url}`);

      if (!name || !email || !password || !role) {
        console.log(`[addUser] Thiếu trường bắt buộc`);
        req.flash('error', 'Vui lòng điền đầy đủ các trường bắt buộc (name, email, password, role)');
        return res.redirect('/admins/users/add');
      }

      if (!['student', 'instructor', 'admin'].includes(role)) {
        console.log(`[addUser] Role không hợp lệ: ${role}`);
        req.flash('error', 'Role không hợp lệ (chỉ student, instructor hoặc admin)');
        return res.redirect('/admins/users/add');
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        console.log(`[addUser] Email đã tồn tại: ${email}`);
        req.flash('error', 'Email đã tồn tại');
        return res.redirect('/admins/users/add');
      }

      const newUser = await userModel.createUser({ name, email, password, role, avatar_url });
      console.log(`[addUser] Thêm user thành công: ${email}, role: ${role}`);
      req.flash('success', `Thêm ${role === 'student' ? 'học viên' : role === 'instructor' ? 'giảng viên' : 'admin'} thành công`);
      return res.redirect('/admins/users');
    } catch (error) {
      console.error('❌ [addUser] Lỗi khi thêm user:', error);
      req.flash('error', `Lỗi: ${error.message}`);
      return res.redirect('/admins/users/add');
    }
  },

  // Hiển thị form chỉnh sửa user
  async renderEditUser(req, res) {
    const { id } = req.params;
    try {
      console.log(`[renderEditUser] Fetching user with ID: ${id}`);
      const editUser = await userModel.getUserById(id);

      if (!editUser) {
        req.flash('error', 'User không tồn tại');
        return res.redirect('/admins/users');
      }

      console.log(`[renderEditUser] User found: ${JSON.stringify(editUser)}`);
      res.render('admins/users/edit', {
        layout: 'main',
        editUser,
        title: 'Cập nhật User',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error('❌ [renderEditUser] Lỗi khi lấy user để sửa:', error);
      req.flash('error', `Lỗi: ${error.message}`);
      return res.redirect('/admins/users');
    }
  },

  // ✅ Cập nhật user
  async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password, role, avatar_url, is_verified } = req.body;

    try {
      console.log(`[updateUser] Input: id=${id}, name=${name}, email=${email}, role=${role}`);

      if (id.toString() === '34') {
        req.flash('error', 'Không thể chỉnh sửa tài khoản admin gốc');
        return res.redirect('/admins/users');
      }

      if (!name || !email || !role) {
        req.flash('error', 'Vui lòng điền đầy đủ các trường bắt buộc');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      const validRoles = ['student', 'instructor', 'admin'];
      if (!validRoles.includes(role)) {
        req.flash('error', 'Role không hợp lệ');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      const user = await userModel.getUserById(id);
      if (!user) {
        req.flash('error', 'User không tồn tại');
        return res.redirect('/admins/users');
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser && existingUser.id.toString() !== id.toString()) {
        req.flash('error', 'Email đã tồn tại');
        return res.redirect(`/admins/users/${id}/edit`);
      }

      let finalPassword = undefined;
      if (password && password.trim() !== '') {
        const bcrypt = await import('bcryptjs');
        finalPassword = await bcrypt.hash(password, 10);
      }

      const verifiedValue = typeof is_verified === 'string'
        ? is_verified === 'true'
        : Boolean(is_verified);

      const updatedUser = await userModel.updateUser(id, {
        name,
        email,
        password: finalPassword,
        role,
        avatar_url: avatar_url || user.avatar_url,
        is_verified: verifiedValue,
      });

      console.log(`[updateUser] ✅ User updated successfully: ${JSON.stringify(updatedUser)}`);
      req.flash('success', 'Cập nhật user thành công');
      return res.redirect('/admins/users');
    } catch (error) {
      console.error('❌ [updateUser] Lỗi khi cập nhật user:', error);
      req.flash('error', `Lỗi: ${error.message}`);
      return res.redirect(`/admins/users/${id}/edit`);
    }
  },

  // ✅ Hiển thị form xác nhận xóa user
  async renderDeleteUser(req, res) {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(id);
      if (!user) {
        req.flash('error', 'User không tồn tại');
        return res.redirect('/admins/users');
      }

      const userIdStr = user.id.toString();
      const reqIdStr = id.toString();

      if (userIdStr === '34' || req.user.id.toString() === userIdStr) {
        req.flash('error', 'Không thể xóa tài khoản admin hoặc tài khoản đang đăng nhập');
        return res.redirect('/admins/users');
      }

      res.render('admins/users/removeUser', {
        layout: 'main',
        user,
        title: 'Xóa User',
        success: req.flash('success'),
        error: req.flash('error'),
        csrfToken: req.csrfToken(),
        userSession: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      console.error('❌ [renderDeleteUser] Lỗi khi lấy user để xóa:', error);
      req.flash('error', `Lỗi: ${error.message}`);
      return res.redirect('/admins/users');
    }
  },

  // Xóa user
  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      console.log(`[deleteUser] Fetching user with ID: ${id}`);
      const user = await userModel.getUserById(id);

      if (!user) {
        req.flash('error', 'User không tồn tại');
        return res.status(404).json({ message: 'User không tồn tại' });
      }

      if (user.role === 'admin' || req.user.id === id.toString()) {
        req.flash('error', 'Không thể xóa tài khoản admin hoặc tài khoản đang đăng nhập');
        return res.status(403).json({ message: 'Không thể xóa tài khoản admin hoặc tài khoản đang đăng nhập' });
      }

      const result = await userModel.deleteUser(id);
      if (result) {
        req.flash('success', 'Xóa user thành công');
        return res.redirect('/admins/users');
      } else {
        req.flash('error', 'Xóa user thất bại');
        return res.status(500).json({ message: 'Xóa user thất bại' });
      }
    } catch (error) {
      console.error('❌ [deleteUser] Lỗi khi xóa user:', error);
      req.flash('error', `Lỗi: ${error.message}`);
      return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
  },
};
