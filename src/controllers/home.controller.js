// Change if needed to fit the project
import { db } from "../models/db.js";
import { getPopular } from "../models/category.model.js";

// home page
export async function home(req, res, next) {
  try {
    // Function to transform Unsplash URLs to use their optimization parameters
    const transformImageUrl = (url) => {
      if (!url) return '/img/course/course-1.webp';
      if (url.startsWith('https://images.unsplash.com/')) {
        // Add Unsplash parameters for optimization
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=800&h=600&auto=format&fit=crop`;
      }
      return url;
    };

    // Get 10 hot courses by views
    const mostViewed = await db("courses")
      .orderBy("views", "desc")
      .limit(10);

    const transformedMostViewed = mostViewed.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url)
    }));

    // Get 10 newest courses
    const newest = await db("courses")
      .orderBy("created_at", "desc")
      .limit(10);

    const transformedNewest = newest.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url)
    }));

    // Get popular categories
    const popularCategories = await getPopular(6);

    res.render("home", {
      mostViewed: transformedMostViewed,
      newest: transformedNewest,
      popularCategories: popularCategories,
      title: "Online Academy"
    });
  } catch (e) {
    next(e);
  }
}

// about page
export async function about(req, res, next) {
  res.render("about", { title: "About" });
}
