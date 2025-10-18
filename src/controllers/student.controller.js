import e from "connect-flash";
import "../helpers/hbs.helpers.js";
import Handlebars from "handlebars";

export async function listEnrolled(req, res) {
  res.render('students/enrollments');
}

export async function listWatchlist(req, res) {
  res.render('students/watchlist');
import { showCourses, getPagedCourses } from "../models/student.model.js";
import "../helpers/hbs.helpers.js";
// import { getPageData } from "../helpers/mockData.js";
import { getPageData } from "../helpers/mockData.js";
import { findCoursesByStudentId, Getallwatchlist } from "../models/student.model.js";
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
        if (!req.isAuthenticated()) {
            return res.redirect("/auth/login");
        }

        const studentId = req.user.id;
        const allCourses = await findCoursesByStudentId(studentId); // toàn bộ khóa học
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;
        const offset = (page - 1) * itemsPerPage;
        const paginatedCourses = allCourses.slice(offset, offset + itemsPerPage);

        const courseList = paginatedCourses.map(course => ({
            id: course.id,
            title: course.title,
            shortDesc: course.short_desc,
            price: course.price,
            thumbnailUrl: course.thumbnail_url,
            categoryName: course.category_name,
            purchasedAt: course.purchased_at
        }));
        console.log(courseList);

        const totalCourses = allCourses.length;
        const totalPages = Math.ceil(totalCourses / itemsPerPage);

        const pages = [];
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);
        for (let i = startPage; i <= endPage; i++) {
            pages.push({ value: i, isCurrent: i === page });
        }
        res.render("students/enrollments", {
            success: true,
            total: totalCourses,
            courses: courseList,
            currentPage: page,
            totalPages,
            pages,
            hasPrevious: page > 1,
            hasNext: page < totalPages
        });

    } catch (error) {
        console.error("Error detected: ", error);
        res.status(500).render("error");
    }
};
export async function listWatchlist(req, res) {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/auth/login");
        }


        const studentId = req.user.id;
        const allCourses = await Getallwatchlist(studentId); // toàn bộ khóa học
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;
        const offset = (page - 1) * itemsPerPage;
        const paginatedCourses = allCourses.slice(offset, offset + itemsPerPage);

        const courseList = paginatedCourses.map(course => ({
            id: course.id,
            title: course.title,
            shortDesc: course.short_desc,
            price: course.price,
            thumbnailUrl: course.thumbnail_url,
            categoryName: course.category_name,
            purchasedAt: course.purchased_at
        }));
        console.log(courseList);    
        const totalCourses = allCourses.length;
        const totalPages = Math.ceil(totalCourses / itemsPerPage);

        const pages = [];
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);
        for (let i = startPage; i <= endPage; i++) {
            pages.push({ value: i, isCurrent: i === page });
        }

        res.render("students/watchlist", {
            success: true,
            total: totalCourses,
            courses: courseList,
            currentPage: page,
            totalPages,
            pages,
            hasPrevious: page > 1,
            hasNext: page < totalPages
        });

    } catch (error) {
        console.error("Error detected: ", error);
        res.status(500).render("error");
    }
};
export const getLearningPage = (req, res) => {
    res.render("students/learn");
};
import { showCourses, getPagedCourses } from "../models/student.model.js";
import "../helpers/hbs.helpers.js";
import { getPageData } from "../helpers/mockData.js";
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
