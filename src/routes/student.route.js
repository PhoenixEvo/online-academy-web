import express from "express";
import { listEnrolled, listWatchlist, getEnrolledCourses, removeCourse, showCheckout, processPurchase }
from "../controllers/student.controller.js";
import { authGuard } from '../middlewares/authGuard.js';
const router = express.Router();

// Các route test hiển thị view
router.get("/enrolled", authGuard, getEnrolledCourses);
router.get("/profile-student", authGuard, (req, res) => {
    res.render("students/profile-student");
});

// student.route.js
router.get("/watchlist", authGuard, listWatchlist);
router.post("/watchlist/remove/:id", authGuard, removeCourse);
// Checkout and purchase routes
router.get("/checkout/:id", authGuard, showCheckout);
router.post("/purchase/:id", authGuard, processPurchase);
router.get("/enrolled/learn/:id", authGuard, (req, res) => {
    res.render("students/learn");
});
export default router;