import express from "express";
import {
    viewLesson,
    updateProgress,
    completeLesson,
    uncompleteLesson,
    submitFeedback // ADD THIS
} from "../controllers/learn.controller.js";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

// All routes require authentication
router.use(authGuard);

// GET /lessons/:lessonId - View lesson learning page
router.get("/:lessonId", viewLesson);

// POST /lessons/:lessonId/progress - Update lesson progress (AJAX)
router.post("/:lessonId/progress", updateProgress);

// POST /lessons/:lessonId/complete - Mark lesson as completed
router.post("/:lessonId/complete", completeLesson);

// POST /lessons/:lessonId/uncomplete - Mark lesson as uncompleted
router.post("/:lessonId/uncomplete", uncompleteLesson);

// POST /lessons/:lessonId/feedback - Submit feedback (ADD THIS)
router.post("/:lessonId/feedback", submitFeedback);

export default router;