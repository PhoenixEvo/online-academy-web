// src/models/user.model.js
import bcrypt from 'bcryptjs';
import { db } from './db.js';

export const userModel = {
  // 🟦 Lấy danh sách tất cả người dùng
  async findAll() {
    try {
      return await db('users')
        .select(
          'id',
          'name',
          'email',
          'role',
          'avatar_url',
          'created_at',
          'updated_at',
          'is_verified',
          'google_id',
          'provider'
        )
        .orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Lỗi khi lấy danh sách user:', error);
      throw new Error(`Lỗi khi lấy danh sách user: ${error.message}`);
    }
  },

  // 🟦 Lấy chi tiết người dùng theo ID
  async getUserById(id) {
    try {
      return await db('users')
        .where({ id })
        .select(
          'id',
          'name',
          'email',
          'role',
          'avatar_url',
          'created_at',
          'updated_at',
          'is_verified',
          'google_id',
          'provider'
        )
        .first();
    } catch (error) {
      console.error('Lỗi khi lấy user:', error);
      throw new Error(`Lỗi khi lấy user: ${error.message}`);
    }
  },

  // ✅ Tạo giảng viên mới (do admin)
  async createInstructor({ email, password, fullname, job_title, role = 'instructor' }) {
    const trx = await db.transaction(); // Dùng transaction để rollback nếu lỗi
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1️⃣ Thêm vào bảng users
      let user;
      try {
        [user] = await trx('users')
          .insert({
            name: fullname,
            email,
            password_hash: hashedPassword,
            role,
            is_verified: true,
            provider: 'email',
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning([
            'id',
            'name',
            'email',
            'role',
            'avatar_url',
            'created_at',
            'updated_at',
            'is_verified',
            'provider'
          ]);
      } catch {
        // MySQL fallback
        const [insertId] = await trx('users').insert({
          name: fullname,
          email,
          password_hash: hashedPassword,
          role,
          is_verified: true,
          provider: 'email',
          created_at: new Date(),
          updated_at: new Date()
        });
        user = await trx('users')
          .where({ id: insertId })
          .select(
            'id',
            'name',
            'email',
            'role',
            'avatar_url',
            'created_at',
            'updated_at',
            'is_verified',
            'provider'
          )
          .first();
      }

      // 2️⃣ Sinh chữ viết tắt từ tên
      const initials = fullname
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase();

      // 3️⃣ Thêm vào bảng instructors
      await trx('instructors').insert({
        _class: 'default',
        title: job_title || 'Instructor',
        name: fullname,
        display_name: fullname,
        job_title: job_title || 'Instructor',
        image_50x50: user.avatar_url || null,
        image_100x100: user.avatar_url || null,
        initials,
        url: `/instructors/${user.id}`,
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date()
      });

      await trx.commit();
      return user;
    } catch (error) {
      await trx.rollback();
      console.error('❌ Lỗi khi tạo giảng viên:', error);
      throw new Error(`Lỗi khi tạo giảng viên: ${error.message}`);
    }
  },

  // 🟦 Cập nhật thông tin người dùng
  async updateUser(id, { name, role, avatar_url, is_verified, password }) {
    try {
      const updateData = { name, role, avatar_url, is_verified, updated_at: new Date() };
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      const [user] = await db('users')
        .where({ id })
        .update(updateData)
        .returning([
          'id',
          'name',
          'email',
          'role',
          'avatar_url',
          'created_at',
          'updated_at',
          'is_verified',
          'google_id',
          'provider'
        ]);

      return user;
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error);
      throw new Error(`Lỗi khi cập nhật user: ${error.message}`);
    }
  },

  // 🟦 Xóa người dùng
  async deleteUser(id) {
    const trx = await db.transaction();
    try {
      // Nếu là instructor → xóa cả trong bảng instructors
      await trx('instructors').where({ user_id: id }).del();
      const result = await trx('users').where({ id }).del();

      await trx.commit();
      return result > 0;
    } catch (error) {
      await trx.rollback();
      console.error('Lỗi khi xóa user:', error);
      throw new Error(`Lỗi khi xóa user: ${error.message}`);
    }
  },

  // 🟦 Kiểm tra email đã tồn tại
  async emailExists(email, excludeId = null) {
    const query = db('users').where({ email });
    if (excludeId) query.andWhereNot({ id: excludeId });
    const user = await query.first();
    return !!user;
  },

  // 🟦 Tìm user theo email
  async findByEmail(email) {
    try {
      return await db('users')
        .where({ email })
        .select(
          'id',
          'name',
          'email',
          'role',
          'avatar_url',
          'created_at',
          'updated_at',
          'is_verified',
          'google_id',
          'provider'
        )
        .first();
    } catch (error) {
      console.error('Lỗi khi tìm user theo email:', error);
      throw new Error(`Lỗi khi tìm user theo email: ${error.message}`);
    }
  },

  // 🟦 Tạo user mới (student/admin/instructor)
  async createUser({ name, email, password, role, avatar_url }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db('users')
        .insert({
          name,
          email,
          password_hash: hashedPassword,
          role,
          avatar_url: avatar_url || '',
          is_verified: false,
          provider: 'email',
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning([
          'id',
          'name',
          'email',
          'role',
          'avatar_url',
          'created_at',
          'updated_at',
          'is_verified',
          'provider'
        ]);

      return user;
    } catch (error) {
      console.error('Lỗi khi tạo user mới:', error);
      throw new Error(`Lỗi khi tạo user mới: ${error.message}`);
    }
  }
};
