// src/models/course.model.js
import { db } from './db.js';

export const courseModel = {

   async findAll() {
    try {
      return await db('courses').select('*').orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Error fetching course list:', error);
      throw new Error(`Error fetching course list: ${error.message}`);
    }
  },

  // Get course by ID
  async getCourseById(id) {
    try {
      return await db('courses')
        .where({ id })
        .first();
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error(`Error fetching course: ${error.message}`);
    }
  },

  // Delete course
  async deleteCourse(id) {
    try {
      const result = await db('courses').where({ id }).del();
      return result > 0;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error(`Error deleting course: ${error.message}`);
    }
  },

  // Check if course has any enrollments
  async hasEnrollments(courseId) {
    try {
      const count = await db('enrollments')
        .where({ course_id: courseId })
        .count('id as count')
        .first();
      return count.count > 0;
    } catch (error) {
      console.error('Error checking enrollments:', error);
      throw new Error(`Error checking enrollments: ${error.message}`);
    }
  },

  // Check if any course belongs to a category
  async hasCategory(categoryId) {
    try {
      const count = await db('courses')
        .where({ category_id: categoryId })
        .count('id as count')
        .first();
      return count.count > 0;
    } catch (error) {
      console.error('Error checking category:', error);
      throw new Error(`Error checking category: ${error.message}`);
    }
  },
//Get all courses with enrollment count
  async getCoursesWithEnrollmentCount() {
    try {
      return await db('courses')
        .select(
          'courses.*',
          'categories.name as category',
          db.raw('COALESCE(enrollment_counts.student_count, 0) as student_count')
        )
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .leftJoin(
          db('enrollments')
            .select('course_id')
            .count('user_id as student_count')
            .groupBy('course_id')
            .as('enrollment_counts'),
          'courses.id', 'enrollment_counts.course_id'
        )
        .orderBy('courses.created_at', 'desc');
    } catch (error) {
      console.error('Error fetching courses with enrollment count:', error);
      throw new Error(`Error fetching courses: ${error.message}`);
    }
  },
  // Get all published courses
async getAllPublished() {
  try {
    return await db('courses')
      .select('*')
      .where({ status: 'published' })
      .orderBy('created_at', 'desc');
  } catch (error) {
    console.error('Error fetching published courses:', error);
    throw new Error(`Error fetching published courses: ${error.message}`);
  }
},
  };

// Find course by ID with instructor and category info
export async function findById(id) {
    const course = await db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'users.email as instructor_email',
            'categories.name as category_name',
            'categories.parent_id as category_parent_id'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.id', id)
        .first();

    return course;
}

// Find courses with pagination and sorting
export async function findPaged({ page = 1, pageSize = 12, sort = null, sortList = null, categoryId = null, search = null, includeSubcategories = false } = {}) {
    const offset = (page - 1) * pageSize;

    let query = db('courses')
        .select(
            'courses.id',
            'courses.title',
            'courses.short_desc',
            'courses.price',
            'courses.sale_price',
            'courses.rating_avg',
            'courses.rating_count',
            'courses.views',
            'courses.thumbnail_url',
            'courses.created_at',
            'users.name as instructor_name',
            'categories.name as category_name',
            db.raw('COUNT(enrollments.id) as weekly_enrollments')
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .leftJoin('enrollments', function () {
            this.on('courses.id', '=', 'enrollments.course_id')
                .andOn(db.raw('enrollments.purchased_at >= NOW() - INTERVAL \'7 days\''));
        })
        .where('courses.status', 'published')
        .groupBy('courses.id', 'users.name', 'categories.name');

    // Filter by category
    if (categoryId) {
        if (includeSubcategories) {
            // Get all subcategory IDs recursively
            const getAllSubcategoryIds = async (parentId) => {
                const subcategories = await db('categories')
                    .select('id')
                    .where('parent_id', parentId);

                let allIds = [parentId]; // Include the parent category itself

                for (const sub of subcategories) {
                    const subIds = await getAllSubcategoryIds(sub.id);
                    allIds = allIds.concat(subIds);
                }

                return allIds;
            };

            const categoryIds = await getAllSubcategoryIds(categoryId);
            query = query.whereIn('courses.category_id', categoryIds);
        } else {
            query = query.where('courses.category_id', categoryId);
        }
    }

    // Full-text search functionality
    if (search) {
        query = query.where(function () {
            this.whereRaw(`
                to_tsvector('english', COALESCE(courses.title, '') || ' ' || COALESCE(courses.short_desc, '')) ||
                to_tsvector('english', COALESCE(categories.name, ''))
                @@ plainto_tsquery('english', ?)
            `, [search])
                .orWhere('courses.title', 'ilike', `%${search}%`)
                .orWhere('courses.short_desc', 'ilike', `%${search}%`)
                .orWhere('categories.name', 'ilike', `%${search}%`);
        });
    }

    const ORDER_MAP = {
        price: 'COALESCE(courses.sale_price, courses.price)',
        rating: 'courses.rating_avg',
        date: 'courses.created_at'
    };
    let finalSortList = Array.isArray(sortList) && sortList.length ? sortList : null;
    if (!finalSortList) {
        if (!sort) {
            finalSortList = [{ field: 'bestseller', dir: 'desc' }, { field: 'rating', dir: 'desc' }];
        } else if (String(sort).includes(',')) {
            finalSortList = String(sort)
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => {
                    if (s === 'newest') return { field: 'date', dir: 'desc' };
                    if (s === 'oldest') return { field: 'date', dir: 'asc' };
                    const [field, dir] = s.split('_');
                    return { field, dir: dir === 'asc' ? 'asc' : 'desc' };
                });
        } else {
            switch (sort) {
                case 'rating_desc': finalSortList = [{ field: 'rating', dir: 'desc' }]; break;
                case 'rating_asc': finalSortList = [{ field: 'rating', dir: 'asc' }]; break;
                case 'price_desc': finalSortList = [{ field: 'price', dir: 'desc' }]; break;
                case 'price_asc': finalSortList = [{ field: 'price', dir: 'asc' }]; break;
                case 'newest': finalSortList = [{ field: 'date', dir: 'desc' }]; break;
                case 'oldest': finalSortList = [{ field: 'date', dir: 'asc' }]; break;
                default:
                    finalSortList = [{ field: 'bestseller', dir: 'desc' }, { field: 'rating', dir: 'desc' }];
            }
        }
    }
    for (const { field, dir } of finalSortList) {
        if (field === 'bestseller') {
            query = query.orderBy('weekly_enrollments', dir);
        } else if (field === 'price') {
            query = query.orderByRaw(`${ORDER_MAP.price} ${dir.toUpperCase()}`);
        } else {
            const col = ORDER_MAP[field];
            if (col) query = query.orderByRaw(`${col} ${dir.toUpperCase()}`);
        }
    }
    query = query.orderBy('courses.id', 'asc');


    const countQuery = db('courses')
        .where('courses.status', 'published');

    if (categoryId) {
        countQuery.where('courses.category_id', categoryId);
    }

    if (search) {
        // Join categories for full-text search in count query
        countQuery
            .leftJoin('categories as cat_search', 'courses.category_id', 'cat_search.id')
            .where(function () {
                this.whereRaw(`
                    to_tsvector('english', COALESCE(courses.title, '') || ' ' || COALESCE(courses.short_desc, '')) ||
                    to_tsvector('english', COALESCE(cat_search.name, ''))
                    @@ plainto_tsquery('english', ?)
                `, [search])
                    .orWhere('courses.title', 'ilike', `%${search}%`)
                    .orWhere('courses.short_desc', 'ilike', `%${search}%`)
                    .orWhere('cat_search.name', 'ilike', `%${search}%`);
            });
    }

    const [countResult, rows] = await Promise.all([
        countQuery.count('* as total'),
        query.limit(pageSize).offset(offset)
    ]);

    const total = parseInt(countResult[0].total);

    return { rows, total };
}

// Get most viewed courses
export async function getMostViewed(limit = 10) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy('courses.views', 'desc')
        .limit(limit);
}

// Get newest courses
export async function getNewest(limit = 10) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.status', 'published')
        .orderBy('courses.created_at', 'desc')
        .limit(limit);
}

// Get best courses in category
export async function bestInCategory(categoryId, limit = 5) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name'
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .where('courses.category_id', categoryId)
        .where('courses.status', 'published')
        .orderBy('courses.rating_avg', 'desc')
        .limit(limit);
}

// Increment course views
export async function incrementViews(courseId) {
    return db('courses')
        .where('id', courseId)
        .increment('views', 1);
}

// Update course rating stats
export async function updateRatingStats(courseId) {
    const stats = await db('reviews')
        .where('course_id', courseId)
        .select(
            db.raw('AVG(rating) as avg_rating'),
            db.raw('COUNT(*) as count')
        )
        .first();

    return db('courses')
        .where('id', courseId)
        .update({
            rating_avg: stats.avg_rating || 0,
            rating_count: stats.count || 0
        });
}

// Get course sections and lessons
export async function getCourseContent(courseId) {
    const sections = await db('sections')
        .where('course_id', courseId)
        .orderBy('order_index', 'asc');

    for (const section of sections) {
        section.lessons = await db('lessons')
            .where('section_id', section.id)
            .orderBy('order_index', 'asc');
    }

    return sections;
}

// Get featured courses this week (most enrollments in last 7 days)
export async function getFeaturedThisWeek(limit = 4) {
    return db('courses')
        .select(
            'courses.*',
            'users.name as instructor_name',
            'categories.name as category_name',
            db.raw('COUNT(enrollments.id) as weekly_enrollments')
        )
        .leftJoin('users', 'courses.instructor_id', 'users.id')
        .leftJoin('categories', 'courses.category_id', 'categories.id')
        .leftJoin('enrollments', function () {
            this.on('courses.id', '=', 'enrollments.course_id')
                .andOn(db.raw('enrollments.purchased_at >= NOW() - INTERVAL \'7 days\''));
        })
        .where('courses.status', 'published')
        .groupBy('courses.id', 'users.name', 'categories.name')
        .orderBy('weekly_enrollments', 'desc')
        .limit(limit);
}

// Check if course is new (created within last 30 days)
export function isNewCourse(createdAt) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
}

// Get enrollment count for course
export async function getEnrollmentCount(courseId) {
    const result = await db('enrollments')
        .where('course_id', courseId)
        .count('* as count')
        .first();
    return parseInt(result.count || 0);
}

// Get course content statistics (total duration, lesson count, section count)
export async function getCourseStats(courseId) {
    const sections = await db('sections')
        .where('course_id', courseId)
        .count('* as section_count')
        .first();

    const lessons = await db('lessons')
        .join('sections', 'lessons.section_id', 'sections.id')
        .where('sections.course_id', courseId)
        .select(
            db.raw('COUNT(*) as lesson_count'),
            db.raw('SUM(duration_sec) as total_duration')
        )
        .first();

    return {
        section_count: parseInt(sections.section_count || 0),
        lesson_count: parseInt(lessons.lesson_count || 0),
        total_duration: parseInt(lessons.total_duration || 0)
    };
}

// Get instructor statistics
export async function getInstructorStats(instructorId) {
    if (!instructorId) return null;

    const courseCount = await db('courses')
        .where('instructor_id', instructorId)
        .where('status', 'published')
        .count('* as count')
        .first();

    const totalStudents = await db('enrollments')
        .join('courses', 'enrollments.course_id', 'courses.id')
        .where('courses.instructor_id', instructorId)
        .where('courses.status', 'published')
        .countDistinct('enrollments.user_id as count')
        .first();

    const avgRating = await db('courses')
        .where('instructor_id', instructorId)
        .where('status', 'published')
        .avg('rating_avg as avg')
        .first();

    // Sum total views across all courses by this instructor (any status)
    const totalViews = await db('courses')
        .where('instructor_id', instructorId)
        .sum({ sum: 'views' })
        .first();

    // Count courses by status for breakdown
    const byStatusRows = await db('courses')
        .where('instructor_id', instructorId)
        .select('status')
        .count('* as count')
        .groupBy('status');

    const breakdown = { draft: 0, published: 0, completed: 0 };
    for (const r of byStatusRows) {
        const key = String(r.status || '').toLowerCase();
        if (key in breakdown) breakdown[key] = parseInt(r.count || 0);
    }

    const total_courses = breakdown.draft + breakdown.published + breakdown.completed;

    return {
        course_count: parseInt(courseCount.count || 0), // published only (back-compat)
        total_students: parseInt(totalStudents.count || 0),
        avg_rating: parseFloat(avgRating.avg || 0).toFixed(1),
        total_viewers: parseInt((totalViews && (totalViews.sum ?? totalViews.SUM)) || 0),
        total_courses,
        courses_breakdown: breakdown
    };
}

// Get instructor info from instructors table
export async function getInstructorInfo(userId) {
    if (!userId) return null;
    return db('instructors')
        .where('user_id', userId)
        .select('id', 'name', 'display_name', 'job_title', 'image_50x50', 'image_100x100')
        .first();
}
