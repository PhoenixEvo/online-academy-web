// Change if needed to fit the project
import { db } from "../models/db.js";
import { getNewestCourse, getMostViewed, getPopularWeekly } from "../models/category.model.js";
import * as Course from "../models/course.model.js";

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

    // Get 4 featured courses this week (most enrollments in last 7 days)
    const featuredThisWeek = await Course.getFeaturedThisWeek(4);
    const transformedFeatured = featuredThisWeek.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url),
      is_new: Course.isNewCourse(course.created_at),
      is_bestseller: course.weekly_enrollments >= 5 // Consider bestseller if 5+ enrollments this week
    }));

    // Get most viewed courses
    const mostViewed = await getMostViewed(10);
    const transformedMostViewed = mostViewed.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url),
      is_new: Course.isNewCourse(course.created_at)
    }));

    // Get newest courses
    const newest = await getNewestCourse(10);

    const transformedNewest = newest.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url),
      is_new: true // All are new by definition
    }));

    const popularCategories = await getPopularWeekly(6);
    res.render("home", {
      featuredThisWeek: transformedFeatured,
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
