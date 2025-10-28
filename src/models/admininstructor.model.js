import { db } from './db.js';

export const instructorModel = {
  async findInstructors({ transaction } = {}) {
    try {
      let query = db('instructors as i')
        .join('users as u', 'i.user_id', 'u.id')
        .select(
          'i.id',
          'i.name',
          'i.display_name',
          'i.job_title',
          'i.image_50x50',
          'i.image_100x100',
          'i.user_id',
          'i.created_at',
          'i.updated_at',
          'u.email',
          'u.is_verified'
        )
        .orderBy('i.created_at', 'desc');

      if (transaction) query = query.transacting(transaction);
      return await query;
    } catch (error) {
      console.error('[findInstructors] Error:', error);
      throw new Error(`Error fetching instructors: ${error.message}`);
    }
  },

  async getInstructorById(id, { transaction } = {}) {
    try {
      let query = db('instructors as i')
        .join('users as u', 'i.user_id', 'u.id')
        .select(
          'i.id',
          'i.name',
          'i.display_name',
          'i.job_title',
          'i.image_50x50',
          'i.image_100x100',
          'i.user_id',
          'i.created_at',
          'i.updated_at',
          'u.email',
          'u.is_verified'
        )
        .where('i.id', id)
        .first();

      if (transaction) query = query.transacting(transaction);
      return await query;
    } catch (error) {
      console.error('[getInstructorById] Error:', error);
      throw new Error(`Error fetching instructor: ${error.message}`);
    }
  },

  async getInstructorByUserId(user_id, { transaction } = {}) {
    try {
      let query = db('instructors').where({ user_id }).first();
      if (transaction) query = query.transacting(transaction);

      const instructor = await query;
      console.log('[getInstructorByUserId] Result:', instructor ? instructor.id : 'No instructor found');
      return instructor;
    } catch (error) {
      console.error('[getInstructorByUserId] Error:', error);
      throw new Error(`Error fetching instructor by user_id: ${error.message}`);
    }
  },

  async createInstructor(data, { transaction } = {}) {
    try {
      // Check for duplicate user_id before insert
      let checkQuery = db('instructors').where({ user_id: data.user_id }).first();
      if (transaction) checkQuery = checkQuery.transacting(transaction);
      const existing = await checkQuery;
      if (existing) {
        console.warn(`[createInstructor] Skipped: user_id ${data.user_id} already exists`);
        return existing;
      }

      // ✅ Perform insert
      let insertQuery = db('instructors')
        .insert({
          name: data.name,
          display_name: data.display_name || data.name,
          job_title: data.job_title || 'Instructor',
          image_50x50: data.image_50x50 || null,
          image_100x100: data.image_100x100 || null,
          user_id: data.user_id,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      if (transaction) insertQuery = insertQuery.transacting(transaction);
      const [instructor] = await insertQuery;
      console.log('[createInstructor] Created:', instructor.id);
      return instructor;
    } catch (error) {
      console.error('[createInstructor] Error:', error);
      throw new Error(`Error creating instructor: ${error.message}`);
    }
  },

  async updateInstructor(id, data, { transaction } = {}) {
    try {
      let query = db('instructors')
        .where({ id })
        .update({
          name: data.name,
          display_name: data.display_name || data.name,
          job_title: data.job_title || 'Instructor',
          image_50x50: data.image_50x50 || null,
          image_100x100: data.image_100x100 || null,
          updated_at: new Date(),
        })
        .returning('*');

      if (transaction) query = query.transacting(transaction);
      const [instructor] = await query;
      console.log('[updateInstructor] Updated:', instructor.id);
      return instructor;
    } catch (error) {
      console.error('[updateInstructor] Error:', error);
      throw new Error(`Error updating instructor: ${error.message}`);
    }
  },

  async deleteInstructor(id, { transaction } = {}) {
    try {
      let query = db('instructors').where({ id }).del();
      if (transaction) query = query.transacting(transaction);

      const result = await query;
      console.log('[deleteInstructor] Deleted:', id);
      return result;
    } catch (error) {
      console.error('[deleteInstructor] Error:', error);
      throw new Error(`Error deleting instructor: ${error.message}`);
    }
  },
};