// src/controllers/admincourse.controller.js
import { courseModel } from '../models/course.model.js';
import { categoryModel } from '../models/category.model.js'; // nếu bạn có categories

// ================== DANH SÁCH KHÓA HỌC ==================
export const list = async (req, res) => {
  try {
    const courses = await courseModel.findAll({ raw: true });
    return res.render('admins/course/list', {
      layout: 'main',
      courses,
      title: 'Quản lý Khóa Học',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khóa học:', error);
    req.flash('error', 'Không thể tải danh sách khóa học');
    return res.status(500).render('error', {
      layout: 'main',
      message: 'Lỗi hệ thống khi tải danh sách khóa học',
      error: error.message
    });
  }
};


// ================== XÓA KHÓA HỌC ==================
export const renderDeleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      req.flash('error', 'Khóa học không tồn tại');
      return res.status(404).render('error', {
        layout: 'main',
        message: 'Khóa học không tồn tại',
        error: 'Không tìm thấy khóa học'
      });
    }

    return res.render('admins/course/removeCourse', {
      layout: 'main',
      course,
      title: 'Xóa Khóa Học',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error('Lỗi khi render giao diện xóa khóa học:', error);
    return res.status(500).render('error', {
      layout: 'main',
      message: 'Lỗi hệ thống khi tải giao diện xóa',
      error: error.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      req.flash('error', 'Khóa học không tồn tại');
      return res.redirect('/admins/courses');
    }

    const hasEnrollments = await courseModel.hasEnrollments(id);
    if (hasEnrollments) {
      req.flash('error', 'Không thể xóa khóa học do có sinh viên đăng ký');
      return res.redirect('/admins/courses');
    }

    const result = await courseModel.deleteCourse(id);
    if (!result) {
      req.flash('error', 'Xóa khóa học thất bại');
      return res.redirect('/admins/courses');
    }

    req.flash('success', 'Xóa khóa học thành công');
    return res.redirect('/admins/courses');
  } catch (error) {
    console.error('Lỗi khi xóa khóa học:', error);
    req.flash('error', 'Lỗi hệ thống khi xóa khóa học');
    return res.redirect('/admins/courses');
  }
};
