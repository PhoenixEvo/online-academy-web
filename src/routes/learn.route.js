import express from "express";
import {
    viewLesson,
    getProgress,
    updateProgress,
    completeLesson,
    uncompleteLesson
} from "../controllers/learn.controller.js";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

// All routes require authentication
router.use(authGuard);

// GET /learn/:lessonId - View lesson learning page
router.get("/:lessonId", viewLesson);

// POST /learn/:lessonId/progress - Update lesson progress (AJAX)
router.post("/:lessonId/progress", updateProgress);

// POST /learn/:lessonId/complete - Mark lesson as completed
router.post("/:lessonId/complete", completeLesson);

// POST /learn/:lessonId/uncomplete - Mark lesson as uncompleted
router.post("/:lessonId/uncomplete", uncompleteLesson);

export default router;