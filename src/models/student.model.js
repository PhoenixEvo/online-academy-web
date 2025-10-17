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
import { db } from "./db.js";

export async function showCourses() {
  const rows = await db("courses")
    .leftJoin("instructors", "courses.instructor_id", "instructors.id")
    .leftJoin("categories", "courses.category_id", "categories.id")
    .select(
      "courses.id",
      "courses.title",
      "courses.short_desc",
      "courses.price",
      "courses.thumbnail_url",
      "courses.rating_avg",
      "categories.name as category",
      "instructors.name as instructor_name",
      "instructors.image_50x50 as instructor_image"
    );

  const formatted = rows.map((r) => ({
    title: r.title,
    category: r.category,
    price: r.price,
    short_desc: r.short_desc,
    thumbnail_url: r.thumbnail_url,
    rating_avg: r.rating_avg,
    instructor: {
      name: r.instructor_name,
      image_50x50: r.instructor_image,
    },
  }));

  return formatted;
}

export async function getPagedCourses(page = 1, limit = 6) {
  const offset = (page - 1) * limit;

  const rows = await db("courses")
    .leftJoin("instructors", "courses.instructor_id", "instructors.id")
    .leftJoin("categories", "courses.category_id", "categories.id")
    .select(
      "courses.id",
      "courses.title",
      "courses.short_desc",
      "courses.price",
      "courses.thumbnail_url",
      "courses.rating_avg",
      "categories.name as category",
      "instructors.name as instructor_name",
      "instructors.image_50x50 as instructor_image"
    )
    .limit(limit)
    .offset(offset)
    .debug();

  console.log(`Page ${page} | Limit ${limit} | Rows returned: ${rows.length}`);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    price: r.price,
    short_desc: r.short_desc,
    thumbnail_url: r.thumbnail_url,
    rating_avg: r.rating_avg,
    instructor: {
      name: r.instructor_name,
      image_50x50: r.instructor_image,
    },
  }));
}
