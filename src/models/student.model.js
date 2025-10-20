import { db } from "./db.js"; // student model
// find all courses enrolled by a student
// export async function findCoursesByStudentId(studentId) {
//     return db("enrollments")
//         .join("courses", "enrollments.course_id", "courses.id")
//         .where("enrollments.user_id", studentId)
//         .where("enrollments.active", true)
//         .select(
//             "courses.id",
//             "courses.title",
//             "courses.short_desc",
//             "courses.full_desc",
//             "courses.price",
//             "courses.sale_price",
//             "courses.rating_avg",
//             "courses.rating_count",
//             "courses.views",
//             "courses.thumbnail_url",
//             "courses.status",
//             "courses.created_at",
//             "enrollments.purchased_at"
//         )
//         .orderBy("enrollments.purchased_at", "desc");
// }
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