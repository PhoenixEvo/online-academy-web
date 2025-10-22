//file test hbs
import express from "express";
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

export default router;
