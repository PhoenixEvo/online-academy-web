import Instructor from '../models/instructor.model.js';
// import Course from '../models/course.model.js';
// import db from '../models/db.js';
import { db } from '../models/db.js';

//display list all instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.findAll();
    res.render('instructors/list', { 
      title: 'Danh sách Giảng viên',
      instructors 
    });
  } catch (error) {
    console.error('Error getting instructors:', error);
    res.status(500).render('error', { error: 'Không thể tải danh sách giảng viên' });
  }
};

//display 1 instructor profile with their courses
export const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const instructor = await Instructor.getWithUserInfo(userId);
    if (!instructor) {
      return res.status(404).render('404', { message: 'Không tìm thấy giảng viên' });
    }
    
    //get course
    const courses = await db('courses')
      .where('instructor_id', userId)
      .where('status', 'published')
      .select('*');
    
    res.render('instructors/profile', { 
      title: instructor.display_name || instructor.name,
      instructor,
      courses
    });
  } catch (error) {
    console.error('Error getting instructor profile:', error);
    res.status(500).render('error', { error: 'Không thể tải thông tin giảng viên' });
  }
};

/////////API get in4 instructor cho AJAX
export const getInstructorAPI = async (req, res) => {
  try {
    const userId = req.params.userId;
    const instructor = await Instructor.getWithUserInfo(userId);
    
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    res.json(instructor);
  } catch (error) {
    console.error('Error getting instructor API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


/*const courses = await db('courses')
  .join('users', 'courses.instructor_id', 'users.id')
  .leftJoin('instructors', 'users.id', 'instructors.user_id')
  .select(
    'courses.*', 
    'users.name as instructor_name',
    'instructors.display_name',
    'instructors.job_title',
    'instructors.image_50x50'
  );*/