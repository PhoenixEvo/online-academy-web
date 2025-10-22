import { db } from "./db.js"; // student model
export async function findCoursesByStudentId(studentId) {
    return db("enrollments")
        .join("courses", "enrollments.course_id", "courses.id")
        .leftJoin("categories", "courses.category_id", "categories.id")
        .where("enrollments.user_id", studentId)
        .where("enrollments.active", true)
        .select(
            "courses.id",
            "courses.title",
            "courses.short_desc",
            "courses.price",
            "courses.thumbnail_url",
            "categories.name as category_name",
            "enrollments.purchased_at"
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