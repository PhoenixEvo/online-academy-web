
import { db } from './db.js';

// Get instructor by ID (from instructors table)
export async function findById(instructorId) {
    return db('instructors')
        .where('id', instructorId)
        .first();
}

// Get instructor details with stats
export async function getInstructorDetails(instructorId) {
    const instructor = await findById(instructorId);

    if (!instructor) return null;

    const stats = await getInstructorStats(instructorId);

    return {
        ...instructor,
        stats
    };
}

// Get instructor stats
export async function getInstructorStats(instructorId) {
    if (!instructorId) return null;

    const instructor = await findById(instructorId);
    if (!instructor || !instructor.user_id) return null;

    const userId = instructor.user_id;

    const courseCount = await db('courses')
        .where('instructor_id', userId)
        .where('status', 'published')
        .count('* as count')
        .first();

    const totalStudents = await db('enrollments')
        .join('courses', 'enrollments.course_id', 'courses.id')
        .where('courses.instructor_id', userId)
        .where('courses.status', 'published')
        .where('enrollments.active', true)
        .countDistinct('enrollments.user_id as count')
        .first();

    const avgRating = await db('courses')
        .where('instructor_id', userId)
        .where('status', 'published')
        .avg('rating_avg as avg')
        .first();

    return {
        course_count: parseInt(courseCount.count || 0),
        total_students: parseInt(totalStudents.count || 0),
        avg_rating: parseFloat(avgRating.avg || 0).toFixed(1)
    };
}

// Get instructor's courses
export async function getInstructorCourses(instructorId, limit = 12) {
    if (!instructorId) return [];

    const instructor = await findById(instructorId);
    if (!instructor || !instructor.user_id) return [];

    const userId = instructor.user_id;

    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.instructor_id', userId)
        .where('courses.status', 'published')
        .orderBy('courses.created_at', 'desc')
        .limit(limit);
}

// Get all instructors
export async function getAll() {
    return db('instructors')
        .select('id', 'name', 'display_name', 'job_title', 'image_100x100', 'created_at')
        .orderBy('name', 'asc');
}

// Get instructor with courses count
export async function getInstructorsWithCourseCount() {
    return db('instructors')
        .select(
            'instructors.*',
            db.raw('COUNT(courses.id) as course_count')
        )
        .leftJoin('courses', function () {
            this.on('instructors.user_id', '=', 'courses.instructor_id')
                .andOn('courses.status', '=', db.raw("'published'"));
        })
        .groupBy('instructors.id')
        .orderBy('course_count', 'desc');
}
// import db from './db.js';
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
