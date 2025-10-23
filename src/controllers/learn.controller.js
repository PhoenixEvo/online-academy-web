import { validationResult, param, body } from "express-validator";
import * as Learn from "../models/learn.model.js";
import * as Course from "../models/course.model.js";
import { convertToYouTubeEmbed } from "../helpers/hbs.helpers.js";

// GET /students/enrolled/learn/:courseId - Show first lesson of course
export const startCourseValidators = [param("courseId").isInt().toInt()];
export async function startCourse(req, res, next) {
    try {
        await Promise.all(startCourseValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(404).render("error", { message: "Course not found" });

        const courseId = req.params.courseId;
        const userId = req.user.id;

        const isEnrolled = await Learn.isUserEnrolled(userId, courseId);
        if (!isEnrolled) {
            req.flash('error', 'You are not enrolled in this course');
            return res.redirect('/students/enrolled');
        }

        const firstLesson = await Learn.getFirstLesson(courseId);
        if (!firstLesson) {
            req.flash('error', 'This course has no lessons yet');
            return res.redirect('/students/enrolled');
        }

        res.redirect(`/learn/${firstLesson.id}`);
    } catch (e) {
        next(e);
    }
}

// GET /learn/:lessonId - Show lesson learning page
export const viewLessonValidators = [param("lessonId").isInt().toInt()];
export async function viewLesson(req, res, next) {
    try {
        await Promise.all(viewLessonValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(404).render("error", { message: "Lesson not found" });

        const lessonId = req.params.lessonId;
        const userId = req.user.id;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).render("error", { message: "Lesson not found" });
        }

        if (lesson.video_url) {
            lesson.video_url = convertToYouTubeEmbed(lesson.video_url);
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            req.flash('error', 'You are not enrolled in this course');
            return res.redirect('/students/enrolled');
        }

        const sections = await Learn.getCourseLessons(lesson.course_id, userId);
        const progress = await Learn.getLessonProgress(userId, lessonId);
        const courseProgress = await Learn.getCourseProgress(userId, lesson.course_id);

        const [nextLesson, prevLesson] = await Promise.all([
            Learn.getNextLesson(lessonId),
            Learn.getPreviousLesson(lessonId)
        ]);

        const userHasFeedback = await Learn.hasUserSubmittedFeedback(userId, lesson.course_id);

        res.render("students/learn", {
            title: lesson.title,
            lesson: lesson,
            sections: sections,
            progress: progress || { watched_sec: 0, completed: false },
            progressPercent: courseProgress.percentage,
            video_url: lesson.video_url,
            description: lesson.course_description,
            nextLesson: nextLesson,
            prevLesson: prevLesson,
            courseProgress: courseProgress,
            userHasFeedback: userHasFeedback
        });
    } catch (e) {
        next(e);
    }
}

// GET /learn/:lessonId/get-progress - Get lesson progress (AJAX)
export const getProgressValidators = [param("lessonId").isInt().toInt()];
export async function getProgress(req, res, next) {
    try {
        await Promise.all(getProgressValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Invalid data" });

        const lessonId = req.params.lessonId;
        const userId = req.user.id;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: "Not enrolled" });
        }

        const progress = await Learn.getLessonProgress(userId, lessonId);

        res.json({
            success: true,
            progress: progress || { watched_sec: 0, completed: false }
        });
    } catch (e) {
        console.error('Get progress error:', e);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// POST /learn/:lessonId/progress - Update lesson progress (AJAX)
export const updateProgressValidators = [
    param("lessonId").isInt().toInt(),
    body("watched_sec").isInt({ min: 0 }).toInt(),
    body("completed").optional().isBoolean().toBoolean()
];
export async function updateProgress(req, res, next) {
    try {
        await Promise.all(updateProgressValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Invalid data" });

        const lessonId = req.params.lessonId;
        const userId = req.user.id;
        const { watched_sec, completed } = req.body;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: "Not enrolled" });
        }

        // Update progress (model handles auto-complete logic)
        await Learn.updateProgress(userId, lessonId, watched_sec, completed || false);

        // Get updated course progress
        const courseProgress = await Learn.getCourseProgress(userId, lesson.course_id);

        res.json({
            success: true,
            progress: courseProgress
        });
    } catch (e) {
        console.error('Update progress error:', e);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// POST /learn/:lessonId/complete - Mark lesson as completed
export const completeLessonValidators = [param("lessonId").isInt().toInt()];
export async function completeLesson(req, res, next) {
    try {
        await Promise.all(completeLessonValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Invalid data" });

        const lessonId = req.params.lessonId;
        const userId = req.user.id;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: "Not enrolled" });
        }

        await Learn.markLessonCompleted(userId, lessonId);
        const courseProgress = await Learn.getCourseProgress(userId, lesson.course_id);
        const nextLesson = await Learn.getNextLesson(lessonId);

        res.json({
            success: true,
            message: "Lesson completed!",
            progress: courseProgress,
            nextLesson: nextLesson ? {
                id: nextLesson.id,
                title: nextLesson.title,
                url: `/learn/${nextLesson.id}`
            } : null
        });
    } catch (e) {
        console.error('Complete lesson error:', e);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// POST /learn/:lessonId/uncomplete - Mark lesson as uncompleted
export const uncompleteLessonValidators = [param("lessonId").isInt().toInt()];
export async function uncompleteLesson(req, res, next) {
    try {
        await Promise.all(uncompleteLessonValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Invalid data" });

        const lessonId = req.params.lessonId;
        const userId = req.user.id;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: "Not enrolled" });
        }

        await Learn.markLessonUncompleted(userId, lessonId);
        const courseProgress = await Learn.getCourseProgress(userId, lesson.course_id);

        res.json({
            success: true,
            message: "Lesson marked as incomplete",
            progress: courseProgress
        });
    } catch (e) {
        console.error('Uncomplete lesson error:', e);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// POST /lessons/:lessonId/feedback - Submit lesson/course feedback
export const feedbackValidators = [
    param("lessonId").isInt().toInt(),
    body("comment").trim().isLength({ min: 1, max: 2000 }),
    body("rating").optional().isInt({ min: 1, max: 5 }).toInt()
];
export async function submitFeedback(req, res, next) {
    try {
        await Promise.all(feedbackValidators.map((v) => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', 'Please provide valid feedback');
            return res.redirect(`/learn/${req.params.lessonId}`);
        }

        const lessonId = req.params.lessonId;
        const userId = req.user.id;
        const { comment, rating } = req.body;

        const lesson = await Learn.getLessonById(lessonId);
        if (!lesson) {
            req.flash('error', 'Lesson not found');
            return res.redirect('/students/enrolled');
        }

        const isEnrolled = await Learn.isUserEnrolled(userId, lesson.course_id);
        if (!isEnrolled) {
            req.flash('error', 'You are not enrolled in this course');
            return res.redirect('/students/enrolled');
        }

        const hasFeedback = await Learn.hasUserSubmittedFeedback(userId, lesson.course_id);
        if (hasFeedback) {
            req.flash('error', 'You have already submitted feedback for this course');
            return res.redirect(`/learn/${lessonId}`);
        }

        await Learn.createLessonFeedback(userId, lessonId, comment, rating);

        if (rating) {
            await Course.updateRatingStats(lesson.course_id);
        }

        req.flash('success', 'Thank you for your feedback!');
        res.redirect(`/learn/${lessonId}`);
    } catch (e) {
        console.error('Feedback error:', e);
        req.flash('error', 'Failed to submit feedback');
        res.redirect(`/learn/${req.params.lessonId}`);
    }
}