import { validationResult, param } from "express-validator";
import Instructor from '../models/instructor.model.js';
import * as Course from "../models/course.model.js";
import { db } from '../models/db.js';
// Validators
export const detailValidators = [param("id").isInt().toInt()];

// GET /instructors/:id - Instructor detail page
export async function detail(req, res, next) {
    try {
        const instructorId = parseInt(req.query.id);
        if (!instructorId || isNaN(instructorId))
            return res.status(400).render("error", { message: "Invalid instructor ID" });

        // Get instructor details with stats
        const instructor = await Instructor.findById(instructorId);
        if (!instructor)
            return res.status(404).render("error", { message: "Instructor not found" });

        // Get instructor stats and courses
        const [instructorStats, instructorCourses] = await Promise.all([
            Instructor.getInstructorStats(instructorId),
            Instructor.getInstructorCourses(instructorId, 10)
        ]);

        res.render("instructor/details", {
            title: `${instructor.display_name || instructor.name} - Instructor Profile`,
            instructor: {
                ...instructor,
                name: instructor.display_name || instructor.name,
                bio: instructor.bio || `${instructor.display_name || instructor.name} is an experienced instructor with passion for teaching.`
            },
            instructorStats: instructorStats || {
                course_count: 0,
                total_students: 0,
                avg_rating: "0.0"
            },
            instructorCourses: instructorCourses || [],
            isAuthenticated: !!req.user
        });
    } catch (e) {
        console.error('Error in instructor detail:', e);
        next(e);
    }
}

// GET /instructors - List all instructors
export async function list(req, res, next) {
    try {
        const instructors = await Instructor.getInstructorsWithCourseCount();

        res.render("instructor/list", {
            title: "All Instructors",
            instructors,
            isAuthenticated: !!req.user
        });
    } catch (e) {
        next(e);
    }
}



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
