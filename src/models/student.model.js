import { db } from "./db.js"; // student model
export async function findCoursesByStudentId(studentId) {
    return db("enrollments")
        .join("courses", "enrollments.course_id", "courses.id")
        .leftJoin("categories", "courses.category_id", "categories.id")
        .leftJoin("sections", "courses.id", "sections.course_id")
        .leftJoin("lessons", "sections.id", "lessons.section_id")
        .leftJoin("progress", function() {
            this.on("progress.lesson_id", "=", "lessons.id")
                .andOn("progress.user_id", "=", db.raw("?", [studentId]));
        })
        .where("enrollments.user_id", studentId)
        .where("enrollments.active", true)
        .groupBy(
            "courses.id",
            "courses.title",
            "courses.short_desc",
            "courses.price",
            "courses.thumbnail_url",
            "categories.name",
            "enrollments.purchased_at"
        )
        .select(
            "courses.id",
            "courses.title",
            "courses.short_desc",
            "courses.price",
            "courses.thumbnail_url",
            "categories.name as category_name",
            "enrollments.purchased_at",
            db.raw(`
                CASE 
                    WHEN COUNT(lessons.id) = 0 THEN false
                    WHEN COUNT(lessons.id) = COUNT(CASE WHEN progress.completed = true THEN 1 END) THEN true
                    ELSE false
                END as is_completed
            `),
            db.raw(`
                CASE 
                    WHEN COUNT(lessons.id) = 0 THEN 0
                    ELSE ROUND((COUNT(CASE WHEN progress.completed = true THEN 1 END)::numeric / COUNT(lessons.id)::numeric) * 100, 2)
                END as completion_percentage
            `)
        )
        .orderBy("enrollments.purchased_at", "desc");
}
export async function Getallwatchlist(studentId) {
    return db("watchlist")
        .join("courses", "watchlist.course_id", "courses.id")
        .leftJoin("categories", "courses.category_id", "categories.id")
        .where("watchlist.user_id", studentId)
        .select(
            "courses.id",
            "courses.title",
            "courses.short_desc",
            "courses.price",
            "courses.thumbnail_url",
            "categories.name as category_name",
            "watchlist.created_at"
        )
        .orderBy("watchlist.created_at", "desc");
}
export async function remove(userId, courseId) {
    return db('watchlist')
        .where({ user_id: userId, course_id: courseId })
        .del();
}