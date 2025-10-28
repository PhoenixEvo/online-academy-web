
// import db from './db.js';
import { db } from './db.js';
class Instructor {
  static async findAll() {
    return db('instructors')
      .join('users', 'instructors.user_id', 'users.id')
      .select('instructors.*', 'users.name as user_name', 'users.email');
  }
  
  static async findById(id) {
    return db('instructors').where('id', id).first();
  }
  
  static async findByUserId(userId) {
    return db('instructors').where('user_id', userId).first();
  }
  
  static async getWithUserInfo(userId) {
    return db('instructors')
      .join('users', 'instructors.user_id', 'users.id')
      .where('users.id', userId)
      .select('instructors.*', 'users.name', 'users.email', 'users.avatar_url')
      .first();
  }
  
  static async create(instructorData) {
    const [id] = await db('instructors').insert(instructorData).returning('id');
    return this.findById(id);
  }
  
  static async update(id, instructorData) {
    await db('instructors').where('id', id).update(instructorData);
    return this.findById(id);
  }
}

export default Instructor;
