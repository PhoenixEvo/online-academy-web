import { courseModel } from '../models/course.model.js';

// Nếu bạn chưa có logger, tạm thời dùng console
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error
};

export const list = async (req, res) => {
  try {
    const courses = await courseModel.findAll();
    return res.render('admins/course/list', {
      layout: 'main',
      courses,
      title: 'Quản lý Khóa Học',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    logger.error('Lỗi khi lấy danh sách khóa học:', error);
    req.flash('error', 'Không thể tải danh sách khóa học');
    return res.status(500).render('error', {
      layout: 'main',
      message: 'Lỗi hệ thống khi tải danh sách khóa học',
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
    return res.redirect('/admins/courses'); // redirect về danh sách

  } catch (error) {
    console.error('Lỗi khi xóa khóa học:', error);
    req.flash('error', 'Lỗi hệ thống khi xóa khóa học');
    return res.redirect('/admins/courses');
  }
};

export const renderDeleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      logger.warn(`Không tìm thấy khóa học với ID: ${id}`);
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
    logger.error('Lỗi khi render giao diện xóa khóa học:', error);
    return res.status(500).render('error', {
      layout: 'main',
      message: 'Lỗi hệ thống khi tải giao diện xóa',
      error: error.message
    });
  }
};


// Hiển thị form edit course
export const renderEditCourse = async (req, res) => {
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

    return res.render('admins/course/edit', {
      layout: 'main',
      course,
      title: 'Chỉnh sửa Khóa Học',
      success: req.flash('success'),
      error: req.flash('error'),
      csrfToken: req.csrfToken()
    });

  } catch (error) {
    console.error('Lỗi khi render form edit course:', error);
    return res.status(500).render('error', {
      layout: 'main',
      message: 'Lỗi hệ thống khi tải form edit',
      error: error.message
    });
  }
};

// Xử lý submit form edit
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const course = await courseModel.getCourseById(id);
    if (!course) {
      req.flash('error', 'Khóa học không tồn tại');
      return res.status(404).redirect('/admins/courses');
    }

    await courseModel.updateCourse(id, { title, description });

    req.flash('success', 'Cập nhật khóa học thành công');
    return res.redirect('/admins/courses');

  } catch (error) {
    console.error('Lỗi khi cập nhật khóa học:', error);
    req.flash('error', 'Lỗi hệ thống khi cập nhật khóa học');
    return res.status(500).redirect('/admins/courses');
  }
};
