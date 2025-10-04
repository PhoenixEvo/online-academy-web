// Change if needed to fit the project
import { validationResult, query, body, param } from "express-validator";
import * as Course from "../models/course.model.js";
import * as Review from "../models/review.model.js";
import * as Watchlist from "../models/watchlist.model.js";
import * as Enrollment from "../models/enrollment.model.js";

function buildBaseUrl(req) {
  const q = new URLSearchParams(req.query);
  q.delete("page");
  const base = req.baseUrl + req.path;
  const qs = q.toString();
  return base + (qs ? "?" + qs + "&" : "?");
}

// GET /courses
export const listValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("sort").optional().isIn(["rating_desc", "price_asc", "newest"]),
];
export async function list(req, res, next) {
  try {
    await Promise.all(listValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).render("error", { message: "Bad query" });

    const page = req.query.page || 1;
    const sort = req.query.sort || "rating_desc";
    const pageSize = 12;

    const { rows, total } = await Course.findPaged({ page, pageSize, sort });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.render("course/list", {
      title: "Tất cả khoá học",
      courses: rows,
      page,
      totalPages,
      baseUrl: buildBaseUrl(req),
    });
  } catch (e) {
    next(e);
  }
}

// GET /courses/:id
export const detailValidators = [param("id").isInt().toInt()];
export async function detail(req, res, next) {
  try {
    await Promise.all(detailValidators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).render("error", { message: "Không tìm thấy" });

    const id = req.params.id;
    const course = await Course.findById(id);
    if (!course)
      return res
        .status(404)
        .render("error", { message: "Khoá học không tồn tại" });

    const bestInCategory = await Course.bestInCategory(course.category_id, 5);
    const reviews = await Review.listByCourse(id);

    res.render("course/detail", {
      title: course.title,
      course,
      bestInCategory,
      reviews,
    });
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/watch
export const watchValidators = [param("id").isInt().toInt()];
export async function addToWatchlist(req, res, next) {
  try {
    await Promise.all(watchValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Watchlist.add(userId, courseId);
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// DELETE /courses/:id/watch
export async function removeFromWatchlist(req, res, next) {
  try {
    await Promise.all(watchValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Watchlist.remove(userId, courseId);
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/enroll
export const enrollValidators = [param("id").isInt().toInt()];
export async function enroll(req, res, next) {
  try {
    await Promise.all(enrollValidators.map((v) => v.run(req)));
    const userId = req.user.id;
    const courseId = req.params.id;
    await Enrollment.enroll(userId, courseId);
    res.redirect("/courses/" + courseId);
  } catch (e) {
    next(e);
  }
}

// POST /courses/:id/reviews
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
        .render("error", { message: "Bạn chưa tham gia khoá này" });

    if (!errors.isEmpty()) return res.redirect("/courses/" + courseId);

    await Review.create({
      user_id: req.user.id,
      course_id: courseId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    // update course rating cached fields (avg/count)
    await Course.updateRatingStats(courseId);

    res.redirect("/courses/" + courseId + "#reviews");
  } catch (e) {
    next(e);
  }
}
