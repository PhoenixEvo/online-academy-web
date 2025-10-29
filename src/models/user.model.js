// src/models/user.model.js
import bcrypt from 'bcrypt';
import { db } from './db.js';

export const userModel = {
  async findAll(options = {}) {
    try {
      let query = db('users')
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

      if (options.transaction) query = query.transacting(options.transaction);

      const users = await query;
      return users;
    } catch (error) {
      console.error('[findAll] Error:', error);
      throw new Error(`Error fetching user list: ${error.message}`);
    }
  },

  async getUserById(id, options = {}) {
    try {
      let query = db('users')
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
          'provider',
          'password_hash'
        )
        .first();

      if (options.transaction) query = query.transacting(options.transaction);

      const user = await query;
      return user;
    } catch (error) {
      console.error('[getUserById] Error:', error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  },

  async createUser({ name, email, password, role, avatar_url }, options = {}) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isVerified = role === 'admin' ? true : false;  // ĐÚNG

    let query = db('users')
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        role,
        avatar_url: avatar_url || '',
        is_verified: isVerified,  
        provider: 'email',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning([
        'id', 'name', 'email', 'role', 'avatar_url',
        'created_at', 'updated_at', 'is_verified', 'provider'
      ]);

    if (options.transaction) query = query.transacting(options.transaction);

    const [user] = await query;
    console.log('[createUser] Created:', user.id);
    return user;
  } catch (error) {
    console.error('[createUser] Error:', error);
    throw new Error(`Error creating new user: ${error.message}`);
  }
},

  async updateUser(id, { name, email, password, role, avatar_url, is_verified }, options = {}) {
    try {
      const updateData = {
        name,
        email,
        role,
        avatar_url: avatar_url || null,
        is_verified,
        updated_at: new Date()
      };

      if (password && password.trim() !== '') {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      let query = db('users')
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
          'provider'
        ]);

      if (options.transaction) query = query.transacting(options.transaction);

      const [user] = await query;
      console.log('[updateUser] Updated:', user.id);
      return user;
    } catch (error) {
      console.error('[updateUser] Error:', error);
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  async deleteUser(id, options = {}) {
    try {
      let query = db('users')
        .where({ id })
        .del();

      if (options.transaction) query = query.transacting(options.transaction);

      const result = await query;
      console.log('[deleteUser] Deleted:', id);
      return result > 0;
    } catch (error) {
      console.error('[deleteUser] Error:', error);
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },

  async findByEmail(email, options = {}) {
    try {
      let query = db('users')
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
          'provider',
          'password_hash'
        )
        .first();

      if (options.transaction) query = query.transacting(options.transaction);

      const user = await query;
      console.log('[findByEmail] Result:', user ? user.id : 'No user found');
      return user;
    } catch (error) {
      console.error('[findByEmail] Error:', error);
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }
};
