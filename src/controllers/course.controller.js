import { validationResult, query, body, param } from "express-validator";
import * as Course from "../models/course.model.js";
import * as Review from "../models/review.model.js";
import * as Watchlist from "../models/watchlist.model.js";
import * as Enrollment from "../models/enrollment.model.js";
import * as Category from "../models/category.model.js";

function buildBaseUrl(req) {
  const q = new URLSearchParams(req.query);
  q.delete("page");
  const base = req.baseUrl + req.path;
  const qs = q.toString();
  return base + (qs ? "?" + qs + "&" : "?");
}

// GET /courses - List all courses with pagination and filters
export const listValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().isIn(["rating_desc", "price_asc", "newest"]),
  query("category").optional().isInt().toInt(),
  query("search").optional().trim().isLength({ min: 1, max: 100 }),
];


export async function list(req, res, next) {
  try {
    await Promise.all(listValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const page = req.query.page || 1;
    const sort = req.query.sort || "rating_desc";
    const categoryId = req.query.category || null;
    const search = req.query.search || null;
    const pageSize = 12;

    const [courseResult, categories] = await Promise.all([
      Course.findPaged({ page, pageSize, sort, categoryId, search }),
      Category.getAll()
    ]);

    const { rows, total } = courseResult;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.render("course/list", {
      title: "All courses",
      courses: rows,
      categories,
      page,
      totalPages,
      currentSort: sort,
      currentCategory: categoryId,
      currentSearch: search,
      baseUrl: buildBaseUrl(req),
    });
  } catch (e) {
    console.error('Error in course list:', e);
    next(e);
  }
}


// GET /courses/:id - Course detail page
export const detailValidators = [param("id").isInt().toInt()];
export async function detail(req, res, next) {
  try {
    await Promise.all(detailValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).render("error", { message: "Not found" });

    const id = req.params.id;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .render("error", { message: "Course not found" });

    // Increment views
    await Course.incrementViews(id);

    // Get related data
    const bestInCategory = await Course.bestInCategory(course.category_id, 5);
    const reviews = await Review.listByCourse(id);
    const reviewStats = await Review.getCourseStats(id);
    const courseContent = await Course.getCourseContent(id);
    const enrollmentCount = await Enrollment.getCourseEnrollmentCount(id);

    // Check if user is enrolled or has in watchlist (if authenticated)
    let isEnrolled = false;
    let isInWatchlist = false;
    if (req.user) {
      isEnrolled = await Enrollment.isEnrolled(req.user.id, id);
      isInWatchlist = await Watchlist.isInWatchlist(req.user.id, id);
    }

    res.render("course/detail", {
      title: course.title,
      course: {
        ...course,
        enrollment_count: enrollmentCount
      },
      bestInCategory,
      reviews,
      reviewStats,
      courseContent,
      isEnrolled,
      isInWatchlist,
    });
  } catch (e) {
    next(e);
  }
}

// GET /search - Search courses
export const searchValidators = [
  query("q").optional().trim().isLength({ min: 1, max: 100 }),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().isIn(["rating_desc", "price_asc", "newest"]),
  query("category").optional().isInt().toInt(),
];
export async function search(req, res, next) {
  try {
    await Promise.all(searchValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const searchQuery = req.query.q || "";
    const page = req.query.page || 1;
    const sort = req.query.sort || "rating_desc";
    const categoryId = req.query.category || null;
    const pageSize = 12;

    const { rows, total } = await Course.findPaged({
      page,
      pageSize,
      sort,
      categoryId,
      search: searchQuery
    });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Get categories for filter
    const categories = await Category.getAll();

    res.render("course/search", {
      title: `Search: ${searchQuery}`,
      courses: rows,
      categories,
      page,
      totalPages,
      currentSort: sort,
      currentCategory: categoryId,
      currentSearch: searchQuery,
      baseUrl: buildBaseUrl(req),
    });
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/watch - Add to watchlist (authenticated users only)
export const watchValidators = [param("id").isInt().toInt()];
export async function addToWatchlist(req, res, next) {
  try {
    await Promise.all(watchValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Watchlist.add(userId, courseId);
    req.flash('success', 'Added to watchlist');
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// DELETE /courses/:id/watch - Remove from watchlist (authenticated users only)
export async function removeFromWatchlist(req, res, next) {
  try {
    await Promise.all(watchValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Watchlist.remove(userId, courseId);
    req.flash('success', 'Removed from watchlist');
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/enroll - Enroll in course (authenticated users only)
export const enrollValidators = [param("id").isInt().toInt()];
export async function enroll(req, res, next) {
  try {
    await Promise.all(enrollValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Enrollment.enroll(userId, courseId);
    req.flash('success', 'Enrolled in course successfully!');
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/reviews - Create review (authenticated users only)
export const reviewValidators = [
  param("id").isInt().toInt(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").trim().isLength({ min: 0, max: 2000 }),
];
export async function createReview(req, res, next) {
  try {
    await Promise.all(reviewValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    const courseId = req.params.id;

    // Must be enrolled to review
    const enrolled = await Enrollment.isEnrolled(req.user.id, courseId);
    if (!enrolled)
      return res
        .status(403)
        .render("error", { message: "You are not enrolled in this course" });

    if (!errors.isEmpty()) {
      req.flash('error', 'Invalid review data');
      return res.redirect("/courses/" + courseId);
    }

    await Review.create({
      user_id: req.user.id,
      course_id: courseId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    // update course rating cached fields (avg/count)
    await Course.updateRatingStats(courseId);

    req.flash('success', 'Thank you for reviewing the course!');
    res.redirect("/courses/" + courseId + "#reviews");
  } catch (e) {
    next(e);
  }
}
