// models/course.model.js

import { db } from "./db.js";

// Lấy danh sách khóa học trong watchlist của user
export async function listWatchlistByUser(userId) {
  const rows = await db("watchlist")
    .join("courses", "watchlist.course_id", "courses.id")
    .where("watchlist.user_id", userId)
    .select(
      "courses.id",
      "courses.title",
      "courses.category_id as category",
      "courses.price",
      "courses.short_desc",
      "courses.thumbnail_url",
      "courses.rating_avg",
      "courses.rating_count",
      "courses.created_at",
      instructors("instructors.id", "instructors.name")
    );

  return rows;
}
