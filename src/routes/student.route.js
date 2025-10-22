import express from "express";
import { listEnrolled, listWatchlist, getEnrolledCourses, removeCourse }
from "../controllers/student.controller.js";
import { authGuard } from '../middlewares/authGuard.js';
const router = express.Router();

// Các route test hiển thị view
router.get("/enrolled", authGuard, getEnrolledCourses);
router.get("/profile-student", authGuard, (req, res) => {
    res.render("students/profile-student");
});
router.get("/learn", authGuard, (req, res) => {
    res.render("students/learn");
});
// student.route.js
router.get("/watchlist", authGuard, listWatchlist); 
router.post("/watchlist/remove/:id", authGuard, removeCourse);

export default router;