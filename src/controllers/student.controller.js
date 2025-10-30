import e from "connect-flash";
import "../helpers/hbs.helpers.js";
import { findCoursesByStudentId, Getallwatchlist, remove } from "../models/student.model.js";
import { findById as findCourseById } from "../models/course.model.js";
import { isEnrolled, enroll } from "../models/enrollment.model.js";
import { remove as removeFromWatchlist } from "../models/watchlist.model.js";
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
        const allCourses = await findCoursesByStudentId(studentId);
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
            purchasedAt: course.purchased_at,
            isCompleted: course.is_completed,
            completionPercentage: course.completion_percentage
        }));
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
        const studentId = req.user.id;
        const allCourses = await Getallwatchlist(studentId);
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
            hasNext: page < totalPages,
            categoryName1: req.csrfToken()
        });

    } catch (error) {
        console.error("Error detected: ", error);
        res.status(500).render("error");
    }
};

export const removeCourse = async(req, res) => {
   
    try {
       console.log('body:', req.body);
        console.log('_csrf from body:', req.body && req.body._csrf);
        const courseId = req.params.id;
        const userId = req.user.id;
        await remove(userId, courseId);
        req.flash('success', 'Removed from watchlist');
        res.redirect("/students/watchlist");
    } catch (err) {
        console.error("Error removing course from watchlist:", err);
        req.flash('error', 'Failed to remove course');
        res.redirect("/students/watchlist");
    }
};

// GET /students/checkout/:id - Show checkout page
export const showCheckout = async(req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id;

        // Get course details
        const course = await findCourseById(courseId);

        if (!course) {
            req.flash('error', 'Course not found');
            return res.redirect('/courses');
        }

        // Check if already enrolled
        const enrolled = await isEnrolled(userId, courseId);
        if (enrolled) {
            req.flash('info', 'You are already enrolled in this course');
            return res.redirect('/students/enrolled');
        }

        res.render('students/purchase', {
            title: 'Checkout - ' + course.title,
            course: course,
            user: req.user
        });
    } catch (error) {
        console.error('Checkout error:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/courses');
    }
};

// POST /students/purchase/:id - Process purchase
export const processPurchase = async(req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id;
        const { cardnumber, cardname } = req.body;

        // Validate payment details
        if (!cardnumber || !cardname) {
            req.flash('error', 'Please fill in all payment details');
            return res.redirect(`/students/checkout/${courseId}`);
        }

        // Validate card number (remove spaces and check length)
        const cleanCardNumber = cardnumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            req.flash('error', 'Invalid card number');
            return res.redirect(`/students/checkout/${courseId}`);
        }

        // Check if already enrolled
        const enrolled = await isEnrolled(userId, courseId);
        if (enrolled) {
            req.flash('info', 'You are already enrolled in this course');
            return res.redirect('/students/enrolled');
        }

        // Get course for validation
        const course = await findCourseById(courseId);
        if (!course) {
            req.flash('error', 'Course not found');
            return res.redirect('/courses');
        }

        // TODO: Integrate real payment gateway here
        // For now, simulate successful payment
        console.log('Processing payment for course:', course.title);
        console.log('Card number:', cleanCardNumber);
        console.log('Card name:', cardname);

        // Enroll user after successful payment
        await enroll(userId, courseId);

        // Remove from watchlist if exists
        await removeFromWatchlist(userId, courseId);

        req.flash('success', 'Payment successful! You are now enrolled in the course.');
        res.redirect('/students/enrolled');
    } catch (error) {
        console.error('Purchase error:', error);
        req.flash('error', 'Payment failed. Please try again.');
        res.redirect(`/students/checkout/${req.params.id}`);
    }
};