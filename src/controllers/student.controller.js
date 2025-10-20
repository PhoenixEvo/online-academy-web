import "../helpers/hbs.helpers.js";
// import { getPageData } from "../helpers/mockData.js";
import { findCoursesByStudentId } from "../models/student.model.js";
import Handlebars from "handlebars";

export async function listEnrolled(req, res) {
    const page = parseInt(req.query.page) || 1;
    const { courses, pagination } = getPageData(page, 6);

    res.render('students/enrollments', {
        courses,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        pages: pagination.pages
    });
}
export const getProfilePage = (req, res) => {
    res.render("students/profile-student");
};
export async function getEnrolledCourses(req, res) {
    try {
        const studentId = req.user.id;
        const courses = await findCoursesByStudentId(studentId);
        const courseList = courses.map(course => ({
            id: course.id,
            title: course.title,
            shortDesc: course.short_desc,
            price: course.price,
            thumbnailUrl: course.thumbnail_url,
            categoryName: course.category_name,
            purchasedAt: course.purchased_at
        }));
        console.log(courseList);
        res.render('students/enrollments', {
            success: true,
            total: courseList.length,
            courses: courseList
        });
    } catch (error) {
        console.error(" Lỗi khi lấy danh sách khóa học:", error);
        res.status(500).render("error");
    }
}


export async function listWatchlist(req, res) {
    const page = parseInt(req.query.page) || 1;
    const { courses, pagination } = getPageData(page, 6);

    res.render('students/watchlist', {
        courses,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        pages: pagination.pages
    });
}

export const getLearningPage = (req, res) => {
    res.render("students/learn");
};