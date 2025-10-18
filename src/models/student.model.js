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
