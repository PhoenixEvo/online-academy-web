//file test hbs
import express from "express";
import { showCourses } from "../models/student.model.js";
import {
  listEnrolled,
  listWatchlist,
} from "../controllers/student.controller.js";

const router = express.Router();

// Các route test hiển thị view
router.get("/enrollments", listEnrolled);
router.get("/learn", (req, res) => {
  res.render("students/learn");
});
router.get("/watchlist", listWatchlist);

router.get('/purchase', (req, res) => {
  res.render('students/purchase');
});

router.get("/profile", (req, res) => {
  res.render("students/profile-student");
});
router.get("/watchlist", listWatchlist);

export default router;
