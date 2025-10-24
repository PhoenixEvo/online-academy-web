import { db } from './db.js';

// Get lesson details with course info
export async function getLessonById(lessonId) {
    return db('lessons')
        .select(
            'lessons.*',
            'sections.course_id',
            'sections.title as section_title',
            'courses.title as course_title',
            'courses.short_desc as course_description'
        )
        .leftJoin('sections', 'lessons.section_id', 'sections.id')
        .leftJoin('courses', 'sections.course_id', 'courses.id')
        .where('lessons.id', lessonId)
        .first();
}

// Get all lessons for a course (organized by sections)
export async function getCourseLessons(courseId, userId) {
    const sections = await db('sections')
        .where('course_id', courseId)
        .orderBy('order_index', 'asc');

    for (const section of sections) {
        section.lessons = await db('lessons')
            .select(
                'lessons.*',
                'progress.completed',
                'progress.watched_sec'
            )
            .leftJoin('progress', function() {
                this.on('lessons.id', '=', 'progress.lesson_id')
                    .andOn('progress.user_id', '=', db.raw('?', [userId]));
            })
            .where('lessons.section_id', section.id)
            .orderBy('lessons.order_index', 'asc');
    }

    return sections;
}

// Get user's progress for a lesson
export async function getLessonProgress(userId, lessonId) {
    return db('progress')
        .where({ user_id: userId, lesson_id: lessonId })
        .first();
}

// Update or create lesson progress - WITH AUTO-COMPLETE LOGIC
export async function updateProgress(userId, lessonId, watchedSec, completed = false) {
    const existing = await getLessonProgress(userId, lessonId);

    // Get lesson duration to check if should auto-complete
    const lesson = await db('lessons').where('id', lessonId).first();

    // Auto-complete if watched >= 95% of duration (and duration exists)
    let shouldComplete = completed;
    if (!shouldComplete && lesson && lesson.duration_sec > 0) {
        const watchPercentage = (watchedSec / lesson.duration_sec) * 100;
        if (watchPercentage >= 95) {
            shouldComplete = true;
        }
    }

    // Also auto-complete if watched_sec >= duration_sec
    if (!shouldComplete && lesson && watchedSec >= lesson.duration_sec) {
        shouldComplete = true;
    }

    if (existing) {
        // Only update if new watched_sec is greater OR completing
        if (watchedSec > existing.watched_sec || shouldComplete) {
            return db('progress')
                .where({ user_id: userId, lesson_id: lessonId })
                .update({
                    watched_sec: watchedSec,
                    completed: shouldComplete
                });
        }
        return null; // No update needed
    } else {
        return db('progress').insert({
            user_id: userId,
            lesson_id: lessonId,
            watched_sec: watchedSec,
            completed: shouldComplete
        });
    }
}

// Mark lesson as completed
export async function markLessonCompleted(userId, lessonId) {
    const lesson = await db('lessons').where('id', lessonId).first();
    if (!lesson) return null;

    return updateProgress(userId, lessonId, lesson.duration_sec || 0, true);
}

// Mark lesson as uncompleted - RESET watched_sec to 0
export async function markLessonUncompleted(userId, lessonId) {
    const existing = await getLessonProgress(userId, lessonId);

    if (existing) {
        return db('progress')
            .where({ user_id: userId, lesson_id: lessonId })
            .update({
                watched_sec: 0,
                completed: false
            });
    }
    return null;
}

// Get course progress percentage
export async function getCourseProgress(userId, courseId) {
    const totalLessons = await db('lessons')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('sections.course_id', courseId)
        .count('lessons.id as total')
        .first();

    const completedLessons = await db('progress')
        .join('lessons', 'progress.lesson_id', 'lessons.id')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('sections.course_id', courseId)
        .where('progress.user_id', userId)
        .where('progress.completed', true)
        .count('progress.id as completed')
        .first();

    const total = parseInt(totalLessons.total || 0);
    const completed = parseInt(completedLessons.completed || 0);

    return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

// Get first lesson of a course
export async function getFirstLesson(courseId) {
    return db('lessons')
        .select('lessons.*')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('sections.course_id', courseId)
        .orderBy('sections.order_index', 'asc')
        .orderBy('lessons.order_index', 'asc')
        .first();
}

// Check if user has submitted feedback for course
export async function hasUserSubmittedFeedback(userId, courseId) {
    const feedback = await db('reviews')
        .where({ user_id: userId, course_id: courseId })
        .first();

    return !!feedback;
}

// Create lesson feedback/rating - WITH EXPLICIT TIMESTAMP
export async function createLessonFeedback(userId, lessonId, comment, rating = null) {
    const lesson = await db('lessons')
        .select('sections.course_id')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('lessons.id', lessonId)
        .first();

    if (!lesson) return null;

    return db('reviews').insert({
        user_id: userId,
        course_id: lesson.course_id,
        rating: rating || 5,
        comment: comment,
        created_at: db.fn.now()
    });
}

// Check if user is enrolled in course
export async function isUserEnrolled(userId, courseId) {
    const enrollment = await db('enrollments')
        .where({ user_id: userId, course_id: courseId, active: true })
        .first();

    return !!enrollment;
}

// Get next lesson
export async function getNextLesson(currentLessonId) {
    const currentLesson = await db('lessons')
        .select('lessons.*', 'sections.course_id', 'sections.order_index as section_order')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('lessons.id', currentLessonId)
        .first();

    if (!currentLesson) return null;

    let nextLesson = await db('lessons')
        .where('section_id', currentLesson.section_id)
        .where('order_index', '>', currentLesson.order_index)
        .orderBy('order_index', 'asc')
        .first();

    if (!nextLesson) {
        const nextSection = await db('sections')
            .where('course_id', currentLesson.course_id)
            .where('order_index', '>', currentLesson.section_order)
            .orderBy('order_index', 'asc')
            .first();

        if (nextSection) {
            nextLesson = await db('lessons')
                .where('section_id', nextSection.id)
                .orderBy('order_index', 'asc')
                .first();
        }
    }

    return nextLesson;
}

// Get previous lesson
export async function getPreviousLesson(currentLessonId) {
    const currentLesson = await db('lessons')
        .select('lessons.*', 'sections.course_id', 'sections.order_index as section_order')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('lessons.id', currentLessonId)
        .first();

    if (!currentLesson) return null;

    let prevLesson = await db('lessons')
        .where('section_id', currentLesson.section_id)
        .where('order_index', '<', currentLesson.order_index)
        .orderBy('order_index', 'desc')
        .first();

    if (!prevLesson) {
        const prevSection = await db('sections')
            .where('course_id', currentLesson.course_id)
            .where('order_index', '<', currentLesson.section_order)
            .orderBy('order_index', 'desc')
            .first();

        if (prevSection) {
            prevLesson = await db('lessons')
                .where('section_id', prevSection.id)
                .orderBy('order_index', 'desc')
                .first();
        }
    }
    return prevLesson;
}