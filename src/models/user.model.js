// src/models/user.model.js
import bcrypt from 'bcryptjs';
import { db } from './db.js';

export const userModel = {
  // Lấy danh sách tất cả người dùng (không cần password)
  async findAll() {
    try {
      return await db('users')
        .select(
          'id',
          'name AS fullname',
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

  // Lấy chi tiết người dùng theo ID
  async getUserById(id) {
    try {
      return await db('users')
        .where({ id })
        .select(
          'id',
          'name AS fullname',
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

  // Tạo giảng viên mới (do admin)
  async createInstructor({ email, password, fullname, role }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const [user] = await db('users')
        .insert({
          name: fullname,
          email,
          password_hash: hashedPassword,
          role: role || 'instructor',
          is_verified: true,
          provider: 'email',
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning([
          'id',
          'name AS fullname',
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
      console.error('Lỗi khi tạo giảng viên:', error);
      throw new Error(`Lỗi khi tạo giảng viên: ${error.message}`);
    }
  },

  // Cập nhật thông tin người dùng
  async updateUser(id, { fullname, role, avatar_url, is_verified }) {
    try {
      const updateData = { name: fullname, role, avatar_url, is_verified, updated_at: new Date() };

      const [user] = await db('users')
        .where({ id })
        .update(updateData)
        .returning([
          'id',
          'name AS fullname',
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

  // Xóa người dùng
  async deleteUser(id) {
    try {
      const result = await db('users').where({ id }).del();
      return result > 0;
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      throw new Error(`Lỗi khi xóa user: ${error.message}`);
    }
  },

  // Kiểm tra email đã tồn tại
  async emailExists(email, excludeId = null) {
    const query = db('users').where({ email });
    if (excludeId) query.andWhereNot({ id: excludeId });
    const user = await query.first();
    return !!user;
  },

  // Tìm user theo email
  async findByEmail(email) {
    try {
      return await db('users')
        .where({ email })
        .select(
          'id',
          'name AS fullname',
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
// Tạo user mới (student, instructor, admin)
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
        'name AS fullname',
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
