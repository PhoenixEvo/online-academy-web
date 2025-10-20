import { db } from "./db.js";

// find user by email
export async function findByEmail(email) {
  return db("users").where({ email }).first();
}

// 
// src/models/user.model.js
import bcrypt from 'bcryptjs';

export const userModel = {
  async findAll() {
    try {
      const users = await db('users')
        .select('id', 'name', 'email', 'role', 'avatar_url', 'created_at', 'is_verified', 'google_id', 'provider')
        .orderBy('created_at', 'desc');
      return users;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách user:', error);
      throw new Error(`Lỗi khi lấy danh sách user: ${error.message}`);
    }
  },

  async getUserById(id) {
    try {
      console.log(`Fetching user with ID: ${id} (type: ${typeof id})`); // Debug ID đầu vào
      const user = await db('users')
        .where({ id: id.toString() }) // Đảm bảo ID là chuỗi
        .select('id', 'name', 'email', 'role', 'avatar_url', 'created_at', 'is_verified', 'google_id', 'provider')
        .first();
      console.log(`User found: ${JSON.stringify(user)}`); // Debug user trả về
      return user;
    } catch (error) {
      console.error('❌ Lỗi khi lấy user:', error);
      throw new Error(`Lỗi khi lấy user: ${error.message}`);
    }
  },

  async createUser({ name, email, password, role, avatar_url }) {
    try {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const [user] = await db('users')
        .insert({
          name,
          email,
          password_hash: hashedPassword,
          role,
          avatar_url,
          created_at: new Date(),
          is_verified: true,
          provider: password ? 'email' : null
        })
        .returning(['id', 'name', 'email', 'role', 'avatar_url', 'created_at', 'is_verified', 'google_id', 'provider']);
      return user;
    } catch (error) {
      console.error('❌ Lỗi khi tạo user:', error);
      throw new Error(`Lỗi khi tạo user: ${error.message}`);
    }
  },

  async updateUser(id, { name, email, password, role, avatar_url, is_verified }) {
    try {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const updateData = {
        name,
        email,
        role,
        avatar_url,
        is_verified: is_verified !== undefined ? is_verified : undefined
      };
      if (hashedPassword) {
        updateData.password_hash = hashedPassword;
      }
      const [user] = await db('users')
        .where({ id: id.toString() }) // Đảm bảo ID là chuỗi
        .update(updateData)
        .returning(['id', 'name', 'email', 'role', 'avatar_url', 'created_at', 'is_verified', 'google_id', 'provider']);
      return user;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật user:', error);
      throw new Error(`Lỗi khi cập nhật user: ${error.message}`);
    }
  },

  async deleteUser(id) {
    try {
      const result = await db('users').where({ id: id.toString() }).del();
      return result;
    } catch (error) {
      console.error('❌ Lỗi khi xóa user:', error);
      throw new Error(`Lỗi khi xóa user: ${error.message}`);
    }
  }
};