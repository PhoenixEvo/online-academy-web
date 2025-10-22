import express from "express";
import { listEnrolled, listWatchlist, getEnrolledCourses }
from "../controllers/student.controller.js";
const router = express.Router();

// Các route test hiển thị view
router.get("/enrollments", getEnrolledCourses);
router.get("/profile-student", (req, res) => {
    res.render("students/profile-student");
});
router.get("/learn", (req, res) => {
    res.render("students/learn");
});
router.get("/watchlist", listWatchlist);

export default router;