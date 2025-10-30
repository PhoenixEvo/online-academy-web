// src/controllers/admincourse.controller.js
import { courseModel } from '../models/course.model.js';
import { categoryModel } from '../models/category.model.js';
import { db } from '../models/db.js';

export const list = async (req, res) => {
  try {
    const { category, instructor } = req.query;
    let query = courseModel.getCoursesWithEnrollmentCount();

    if (category && category !== 'all') {
      query = query.where('courses.category_id', category);
    }
    if (instructor && instructor !== 'all') {
      query = query.where('courses.instructor_id', instructor);
    }
    const courses = await query;
    const totalLessons = await db('lessons').count('* as count').first();
    const totalEnrollments = await db('enrollments').count('* as count').first();
    const totalStudents = await db('enrollments').countDistinct('user_id as count').first();


    const categories = await categoryModel.findAll();
    const instructors = await db('users')
      .join('courses', 'users.id', 'courses.instructor_id')
      .select('users.id', 'users.name')
      .groupBy('users.id', 'users.name')
      .orderBy('users.name', 'asc');

    return res.render('admins/course/list', {
      layout: 'main',
      courses,
      categories,
      instructors,
      selectedCategory: category || 'all',
      selectedInstructor: instructor || 'all',
      totalLessons: parseInt(totalLessons.count),
      totalEnrollments: parseInt(totalEnrollments.count),
      totalStudents: parseInt(totalStudents.count),
      title: 'Course Management',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error('Error fetching course list:', error);
    req.flash('error', 'Unable to load course list');
    return res.status(500).render('error', {
      layout: 'main',
      message: 'System error while loading course list',
      error: error.message
    });
  }
};
export const renderDeleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      req.flash('error', 'Course does not exist');
      return res.status(404).render('error', {
        layout: 'main',
        message: 'Course not found',
        error: 'Course does not exist'
      });
    }

    return res.render('admins/course/removeCourse', {
      layout: 'main',
      course,
      title: 'Delete Course',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error('Error rendering delete course page:', error);
    return res.status(500).render('error', {
      layout: 'main',
      message: 'System error while loading delete page',
      error: error.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      req.flash('error', 'Course does not exist');
      return res.redirect('/admins/courses');
    }

    const hasEnrollments = await courseModel.hasEnrollments(id);
    if (hasEnrollments) {
      req.flash('error', 'Cannot delete course because students are enrolled');
      return res.redirect('/admins/courses');
    }

    const result = await courseModel.deleteCourse(id);
    if (!result) {
      req.flash('error', 'Failed to delete course');
      return res.redirect('/admins/courses');
    }

    req.flash('success', 'Course deleted successfully');
    return res.redirect('/admins/courses');
  } catch (error) {
    console.error('Error deleting course:', error);
    req.flash('error', 'System error while deleting course');
    return res.redirect('/admins/courses');
  }
};
