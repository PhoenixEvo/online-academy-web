import express from "express";
import { listEnrolled, listWatchlist, getEnrolledCourses, removeCourse, showCheckout, processPurchase }
from "../controllers/student.controller.js";
import { startCourse } from "../controllers/learn.controller.js";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

// Student routes
router.get("/enrolled", authGuard, getEnrolledCourses);
router.get("/watchlist", authGuard, listWatchlist);
router.post("/watchlist/remove/:id", authGuard, removeCourse);

// Checkout and purchase routes
router.get("/checkout/:id", authGuard, showCheckout);
router.post("/purchase/:id", authGuard, processPurchase);

// Start course - redirect to first lesson
router.get("/enrolled/learn/:courseId", authGuard, startCourse);

export default router;
