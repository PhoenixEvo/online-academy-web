// Change if needed to fit the project
import { db } from "../models/db.js";
import { getPopularWeekly } from "../models/category.model.js";
import * as Course from "../models/course.model.js";

// home page
export async function home(req, res, next) {
  try {
    // If the user is an instructor, redirect to My Courses
    if (req.isAuthenticated?.() && req.user?.role === 'instructor') {
      return res.redirect('/mycourses');
    }

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

    // Get 10 hot courses by views
    const mostViewed = await db("courses")
      .select(
        'courses.*',
        'users.name as instructor_name',
        'categories.name as category_name'
      )
      .leftJoin('users', 'courses.instructor_id', 'users.id')
      .leftJoin('categories', 'courses.category_id', 'categories.id')
      .where('courses.status', 'published')
      .orderBy("views", "desc")
      .limit(10);

    const transformedMostViewed = mostViewed.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url),
      is_new: Course.isNewCourse(course.created_at)
    }));

    // Get 10 newest courses
    const newest = await db("courses")
      .select(
        'courses.*',
        'users.name as instructor_name',
        'categories.name as category_name'
      )
      .leftJoin('users', 'courses.instructor_id', 'users.id')
      .leftJoin('categories', 'courses.category_id', 'categories.id')
      .where('courses.status', 'published')
      .orderBy("created_at", "desc")
      .limit(10);

    const transformedNewest = newest.map(course => ({
      ...course,
      thumbnail_url: transformImageUrl(course.thumbnail_url),
      is_new: true // All are new by definition
    }));

    // Get popular categories
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
  try {
    // Get real statistics from database
    const stats = await Promise.all([
      // Count active students (users with role 'student')
      db('users').count('* as count').where('role', 'student').first(),
      
      // Count published courses
      db('courses').count('* as count').where('status', 'published').first(),
      
      // Count instructors (users with role 'instructor')
      db('users').count('* as count').where('role', 'instructor').first(),
      
      // Calculate success rate (students who completed courses / total enrolled students)
      // Since enrollments table doesn't have status column, we'll calculate based on progress completion
      db('progress')
        .countDistinct('user_id as completed_users')
        .where('completed', true)
        .first()
        .then(async (completed) => {
          const totalEnrolled = await db('enrollments').countDistinct('user_id as count').first();
          const successRate = totalEnrolled.count > 0 ? 
            Math.round((completed.completed_users / totalEnrolled.count) * 100) : 0;
          return { count: successRate };
        })
    ]);

    res.render("about", { 
      title: "About",
      stats: {
        activeStudents: stats[0].count,
        onlineCourses: stats[1].count,
        expertInstructors: stats[2].count,
        successRate: stats[3].count
      }
    });
  } catch (e) {
    next(e);
  }
}

// contact page
export async function contact(req, res, next) {
  res.render("contact", { title: "Contact" });
}

// terms of service page
export async function terms(req, res, next) {
  res.render("terms", { title: "Terms of Service" });
}

// privacy policy page
export async function privacy(req, res, next) {
  res.render("privacy", { title: "Privacy Policy" });
}
