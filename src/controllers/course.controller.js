import { validationResult, query, body, param } from "express-validator";
import * as Course from "../models/course.model.js";
import * as Review from "../models/review.model.js";
import * as Watchlist from "../models/watchlist.model.js";
import * as Enrollment from "../models/enrollment.model.js";
import * as Category from "../models/category.model.js";
import { parseSortList } from "../helpers/hbs.helpers.js";

const ALLOWED_SORTS = new Set([
  'rating_desc', 'rating_asc',
  'price_desc', 'price_asc',
  'date_desc', 'date_asc',
  'newest', 'oldest'
]);
function buildBaseUrl(req) {
  const q = new URLSearchParams(req.query);
  q.delete("page");
  q.delete("sort");  // Remove sort so buttons can set their own sort
  const base = req.baseUrl + req.path;
  const qs = q.toString();
  return base + (qs ? "?" + qs + "&" : "?");
}

// GET /courses - List all courses with pagination and filters
export const listValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().custom(validateSortCsv),
  query("category").optional({ nullable: true, checkFalsy: true }).isInt().toInt(),
  query("q").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }),
];

function validateSortCsv(val) {
  if (!val) return true;
  const items = String(val).split(',').map(s => s.trim()).filter(Boolean);
  return items.every(x => ALLOWED_SORTS.has(x));
}

export async function list(req, res, next) {
  try {
    await Promise.all(listValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const page = req.query.page || 1;

    // Handle duplicate sort values (take first one if array)
    const sortRaw = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort;
    const sort = sortRaw || "rating_desc";
    const categoryId = req.query.category && req.query.category !== '' ? parseInt(req.query.category) : null;
    const search = req.query.q && req.query.q.trim() !== '' ? req.query.q : null;
    const pageSize = 12;
    const sortCsv = Array.isArray(req.query.sort)
      ? req.query.sort[req.query.sort.length - 1]
      : (req.query.sort || '');
    const sortList = parseSortList(sortCsv).map(x => {
      // map newest/oldest (nếu còn dùng)
      if (x.field === 'newest') return { field: 'date', dir: 'desc' };
      if (x.field === 'oldest') return { field: 'date', dir: 'asc' };
      return x;
    });
    const [courseResult, categories] = await Promise.all([
      Course.findPaged({ page, pageSize, sortList, categoryId, search }),
      Category.getAll()
    ]);

    const { rows, total } = courseResult;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Add badges and enrollment count to courses
    const coursesWithBadges = await Promise.all(rows.map(async (course) => {
      const enrollmentCount = await Course.getEnrollmentCount(course.id);
      return {
        ...course,
        is_new: Course.isNewCourse(course.created_at),
        is_bestseller: course.weekly_enrollments >= 5, // 100+ enrollments = bestseller
        enrollment_count: enrollmentCount
      };
    }));

    res.render("course/list", {
      title: "All courses",
      courses: coursesWithBadges,
      categories,
      page,
      totalPages,
      currentSort: sortCsv,
      currentCategory: categoryId,
      currentSearch: search,
      baseUrl: buildUrl(req, { keepPage: false }),
      sortBaseUrl: buildUrl(req, { keepPage: true }),
    });
  } catch (e) {
    console.error('Error in course list:', e);
    next(e);
  }
}


// GET /courses/:id - Course detail page
export const detailValidators = [query("id").isInt().toInt()];
export async function detail(req, res, next) {
  try {
    await Promise.all(detailValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).render("error", { message: "Not found" });

    const id = req.query.id;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .render("error", { message: "Course not found" });

    // Increment views
    await Course.incrementViews(id);

    // Get related data
    const [bestInCategory, reviews, reviewStats, courseContent, enrollmentCount, courseStats, instructorStats] = await Promise.all([
      Course.bestInCategory(course.category_id, 5),
      Review.listByCourse(id),
      Review.getCourseStats(id),
      Course.getCourseContent(id),
      Enrollment.getCourseEnrollmentCount(id),
      Course.getCourseStats(id),
      Course.getInstructorStats(course.instructor_id)
    ]);

    // Add badges to related courses
    const bestInCategoryWithBadges = await Promise.all(bestInCategory.map(async (c) => {
      const count = await Course.getEnrollmentCount(c.id);
      return {
        ...c,
        is_new: Course.isNewCourse(c.created_at),
        is_bestseller: count >= 100
      };
    }));

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
        enrollment_count: enrollmentCount,
        is_new: Course.isNewCourse(course.created_at),
        is_bestseller: course.weekly_enrollments >= 100
      },
      courseStats,
      instructorStats,
      bestInCategory: bestInCategoryWithBadges,
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
  query("q").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().isIn([
    "rating_desc", "rating_asc",     // Rating: High to Low, Low to High
    "price_desc", "price_asc",       // Price: High to Low, Low to High
    "newest", "oldest"               // Date: Newest First, Oldest First
  ]),
  query("category").optional({ nullable: true, checkFalsy: true }).isInt().toInt(),
];
export const searchValidators_guest = [
  query("q").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().custom(validateSortCsv),
  query("category").optional({ nullable: true, checkFalsy: true }).isInt().toInt(),
];

export async function search_guest(req, res, next) {
  try {
    await Promise.all(searchValidators_guest.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const searchQuery = req.query.q && req.query.q.trim() !== '' ? req.query.q : null;
    const page = req.query.page || 1;
    const categoryId = req.query.category && req.query.category !== '' ? parseInt(req.query.category) : null;
    const pageSize = 12;
    const sortCsv = Array.isArray(req.query.sort)
      ? req.query.sort[req.query.sort.length - 1]
      : (req.query.sort || '');
    const sortList = parseSortList(sortCsv).map(x => {
      if (x.field === 'newest') return { field: 'date', dir: 'desc' };
      if (x.field === 'oldest') return { field: 'date', dir: 'asc' };
      return x;
    });
    const { rows, total } = await Course.findPaged({
      page,
      pageSize,
      sortList,
      categoryId,
      search: searchQuery
    });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Get categories for filter
    const categories = await Category.getAll();

    // Add badges to courses
    const coursesWithBadges = await Promise.all(rows.map(async (course) => {
      const enrollmentCount = await Course.getEnrollmentCount(course.id);
      return {
        ...course,
        is_new: Course.isNewCourse(course.created_at),
        is_bestseller: enrollmentCount >= 100,
        enrollment_count: enrollmentCount
      };
    }));

    res.render("course/search", {
      title: `Search: ${searchQuery}`,
      courses: coursesWithBadges,
      categories,
      page,
      totalPages,
      currentSort: sortCsv,
      currentCategory: categoryId,
      currentSearch: searchQuery,
      baseUrl: buildUrl(req, { keepPage: false }),
      sortBaseUrl: buildUrl(req, { keepPage: true }),
    });
  } catch (e) {
    next(e);
  }
}
export async function search(req, res, next) {
  try {
    await Promise.all(searchValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const searchQuery = req.query.q && req.query.q.trim() !== '' ? req.query.q : null;
    const page = req.query.page || 1;
    const sortRaw = Array.isArray(req.query.sort) ? req.query.sort[0] : req.query.sort;
    const sort = sortRaw || "rating_desc";
    const categoryId = req.query.category && req.query.category !== '' ? parseInt(req.query.category) : null;
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

    // Add badges to courses
    const coursesWithBadges = await Promise.all(rows.map(async (course) => {
      const enrollmentCount = await Course.getEnrollmentCount(course.id);
      return {
        ...course,
        is_new: Course.isNewCourse(course.created_at),
        is_bestseller: enrollmentCount >= 100,
        enrollment_count: enrollmentCount
      };
    }));

    res.render("course/search", {
      title: `Search: ${searchQuery}`,
      courses: coursesWithBadges,
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
    res.render()
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
function buildUrl(req, { keepPage = false } = {}) {
  const q = new URLSearchParams(req.query);
  if (!keepPage) q.delete("page");
  const base = req.baseUrl + req.path;
  const qs = q.toString();
  return base + (qs ? "?" + qs + "&" : "?");
}

export function multiCompare(a, b, criteria) {
  for (const { field, dir } of criteria) {
    let av, bv;
    if (field === 'price') { av = a.price; bv = b.price; }
    if (field === 'rating') { av = a.rating_avg; bv = b.rating_avg; }
    if (field === 'date') { av = new Date(a.created_at); bv = new Date(b.created_at); }

    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
  }
  return 0;
}
