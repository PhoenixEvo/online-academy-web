import Instructor from '../models/instructor.model.js';
import { db } from '../models/db.js';

//display list all instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.findAll();
    res.render('instructors/list', { 
      title: 'All Instructors',
      instructors 
    });
  } catch (error) {
    console.error('Error getting instructors:', error);
  }
};

//display 1 instructor profile with their courses
export const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const instructor = await Instructor.getWithUserInfo(userId);
    
    //get course
    const courses = await db('courses')
      .where('instructor_id', userId)
      .where('status', 'published')
      .select('*');
    
    const tab = (req.query.tab || 'info').toString();
    res.render('vwInstructors/profile', { 
      title: instructor.display_name || instructor.name,
      instructor,
      courses,
      activeTab: tab,
      isInfoTab: tab === 'info',
      isPhotoTab: tab === 'photo',
      isSettingsTab: tab === 'settings'
    });
  } catch (error) {
    console.error('Error getting instructor profile:', error);
    res.status(500).render('error', { error: 'Không thể tải thông tin giảng viên' });
  }
};

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