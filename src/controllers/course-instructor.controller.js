import { db } from '../models/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deleteObjectByPublicUrl } from '../services/supabase.service.js';
import {searchByTitle,getReviewsByCourseId,getCourseInformation,courseTaughtBy,getInstructorId,findById, getSectionsByCourseId} from '../models/instructor-course.model.js';
// Edit info, upload video, mark completed
export async function editCourse(req, res, next) {
  res.render('vWInstructors/edit');
}
export async function listInstructorCourses(req, res, next) {
// List instructor courses
  try {
    const instructorUserId = req.user.id;
    const q = (req.query.q || '').toString().trim();
    const limit = 10;
    let page = parseInt(req.query.page || '1', 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    let base = db('courses').where('instructor_id', instructorUserId);
    if (q) base = base.andWhere('title', 'ilike', `%${q}%`);
    const totalRow = await base.clone().count({ count: '*' }).first();
    const totalCount = parseInt(totalRow?.count ?? totalRow?.COUNT ?? 0, 10) || 0;
    const nPages = Math.max(1, Math.ceil(totalCount / limit));
    if (page > nPages) page = nPages;
    const offset = (page - 1) * limit;
    const list = await base
      .clone()
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .offset(offset);
    const page_numbers = [];
    for (let i = 1; i <= nPages; i++) {
      page_numbers.push({ value: i, isCurrent: i === page });
    }
    return res.render('vwInstructorCourse/mycourses', {
      courses: list,
      empty: totalCount === 0,
      q: q || undefined,
      page_numbers,
      isFirstPage: page <= 1,
      isLastPage: page >= nPages,
      prevPage: page > 1 ? page - 1 : 1,
      nextPage: page < nPages ? page + 1 : nPages,
    });
  } catch (err) {
    next(err);
  }
}
export async function showAddCourseForm(req, res, next) {
  res.render('vwInstructorCourse/course-form');
}
export async function addCourseInformation(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      req.flash?.('error', 'You must be signed in as an instructor.');
      return res.redirect('/auth/login');
    }

    let { title, short_desc, full_desc, price, sale_price, category_id, thumbnail_url } = req.body;
    if (!title || !title.trim()) {
      req.flash?.('error', 'Title is required.');
      return res.status(200).render('vwInstructorCourse/course-form', { 
        form: { title, short_desc, full_desc, price, sale_price, category_id, thumbnail_url }
      });
    }
    const toNumber = (v) => {
      if (v === undefined || v === null || String(v).trim() === '') return null;
      const s = String(v).replace(/[,\s]/g, '');
      const num = parseFloat(s);
      return Number.isNaN(num) ? null : num;
    };
    price = toNumber(price) ?? 0;
    sale_price = toNumber(sale_price);

    category_id = category_id ? Number(category_id) : null;

    //insert course
    const insertPayload = {
      title: title.trim(),
      short_desc: short_desc || null,
      full_desc: full_desc || null,
      price,
      sale_price,
      category_id,
      instructor_id: userId,
      status: 'draft',
      thumbnail_url: thumbnail_url || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const inserted = await db('courses').insert(insertPayload).returning('*');
    const newCourse = Array.isArray(inserted) ? inserted[0] : inserted;
    req.flash?.('success', 'Course created. You can now add sections and lessons.');
    return res.redirect(`/instructor/courses/edit/${newCourse.id}/sections`);
  } catch (err) {
    next(err);
  }
}
//get course details for view details
export async function showCourseDetails(req, res, next) {
  const courseId = req.params.id;
  const course = await getCourseInformation(courseId);
  const reviewslist = await getReviewsByCourseId(courseId);
  // console.log('Course Details:', reviewslist);
  res.render('vwInstructorCourse/details', {
    course: course,
    reviews: reviewslist,
  });
}

export async function showEditCourseForm(req, res, next) {
  try {
    const courseId = req.params.id;
    if (!courseId) {
      req.flash?.('error', 'Missing course id');
      return res.redirect('/instructor/courses');
    }
    const course = await findById(courseId);
    if (!course) {
      req.flash?.('error', 'Course not found');
      return res.redirect('/instructor/courses');
    }
    res.render('vwInstructorCourse/edit', { course, sections: [], activeTab: 'edit', isEditTab: true, isLessonsTab: false });
  } catch (err) {
    next(err);
  }
}

export async function updateCourseContent(req, res, next) {
  try {
    const courseId = req.params.id;
    let { title, short_desc, full_desc, price, sale_price, thumbnail_url, status } = req.body;
    // sanitize status to match DB enum: ['draft','published','completed']
    const allowed = new Set(['draft','published','completed']);
    const safeStatus = allowed.has((status || '').toString()) ? status : undefined;
    // normalize prices (accept formatted strings with commas)
    const toNumber = (v) => {
      if (v === undefined || v === null || String(v).trim() === '') return null;
      const s = String(v).replace(/[\,\s]/g, '');
      const num = parseFloat(s);
      return Number.isNaN(num) ? null : num;
    };
    price = toNumber(price) ?? 0;
    sale_price = toNumber(sale_price);
    await db('courses')
      .where({ id: courseId })
      .update({
        title,
        short_desc,
        full_desc,
        price,
        sale_price,
        thumbnail_url,
        ...(safeStatus ? { status: safeStatus } : {}),
        updated_at: new Date(),
      });
    req.flash?.('success', 'Course updated');
    res.redirect(`/instructor/courses/edit/${courseId}`);
  } catch (err) {
    next(err);
  }
}

export async function showCourseSections(req, res, next) {
  try {
    const courseId = req.params.id;
    if (!courseId) return res.redirect('/instructor/courses');
    const course = await findById(courseId);
    if (!course) return res.redirect('/instructor/courses');
    const sections = await db('sections').where({ course_id: courseId }).orderBy('order_index', 'asc');
    //load lessons per section
    const sectionIds = sections.map(s => s.id);
    let lessonsBySection = {};
    if (sectionIds.length) {
      const lessons = await db('lessons').whereIn('section_id', sectionIds).orderBy('order_index', 'asc');
      lessonsBySection = lessons.reduce((acc, l) => {
        acc[l.section_id] = acc[l.section_id] || [];
        acc[l.section_id].push(augmentLessonForView(l));
        return acc;
      }, {});
    }
    const sectionsWithLessons = sections.map(s => ({ ...s, lessons: lessonsBySection[s.id] || [] }));
    res.render('vwInstructorCourse/edit', { course, sections: sectionsWithLessons, activeTab: 'lessons', isEditTab: false, isLessonsTab: true });
  } catch (err) {
    next(err);
  }
}

// show lessons for a section
export async function showLessonsList(req, res, next) {
  try {
    const sectionId = req.params.sectionId || req.params.id;
    if (!sectionId) return res.redirect('back');
    const lessons = await db('lessons').where({ section_id: sectionId }).orderBy('order_index', 'asc');
    res.render('vwInstructorCourse/edit', { lessons, activeTab: 'lessons' });
  } catch (err) {
    next(err);
  }
}

// add lesson placeholder
export async function addLessonToSectionOfCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const sectionId = req.params.sectionId || req.params.section_id;
    if (!courseId || !sectionId) return res.redirect('back');
  const { title, video_url, is_preview, duration_sec } = req.body;
    const maxRow = await db('lessons').where({ section_id: sectionId }).max('order_index as max').first();
    const nextIndex = (maxRow?.max || 0) + 1;
    const normalizedDuration = (() => {
      const n = parseInt(String(duration_sec ?? '').replace(/[^0-9-]/g, ''), 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    })();
    await db('lessons').insert({
      section_id: sectionId,
      title,
      video_url,
      is_preview: is_preview ? true : false,
      duration_sec: normalizedDuration,
      order_index: nextIndex,
    });
    res.redirect(`/instructor/courses/edit/${courseId}/sections`);
  } catch (err) {
    next(err);
  }
}

// list sections and lessons for a course
export async function listSectionsLessonsForCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await getCourseInformation(courseId);
    const sections = await db('sections').where({ course_id: courseId }).orderBy('order_index', 'asc');
    const sectionIds = sections.map(s => s.id);
    let lessonsBySection = {};
    if (sectionIds.length) {
      const lessons = await db('lessons').whereIn('section_id', sectionIds).orderBy('order_index', 'asc');
      lessonsBySection = lessons.reduce((acc, l) => {
        acc[l.section_id] = acc[l.section_id] || [];
        acc[l.section_id].push(augmentLessonForView(l));
        return acc;
      }, {});
    }
    const sectionsWithLessons = sections.map(s => ({ ...s, lessons: lessonsBySection[s.id] || [] }));
    res.render('vwInstructorCourse/edit', { course, sections: sectionsWithLessons, activeTab: 'lessons', isEditTab: false, isLessonsTab: true });
  } catch (err) {
    next(err);
  }
}

// add section placeholder
export async function addSectionToCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const { title } = req.body;
    if (!courseId || !title) return res.redirect('back');
    const maxRow = await db('sections').where({ course_id: courseId }).max('order_index as max').first();
    const nextIndex = (maxRow?.max || 0) + 1;
    await db('sections').insert({ course_id: courseId, title, order_index: nextIndex });
    res.redirect(`/instructor/courses/edit/${courseId}/sections`);
  } catch (err) {
    next(err);
  }
}

// list the reviews for a course
export async function listReviewsForCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const reviewslist = await getReviewsByCourseId(courseId);
    res.render('vwInstructorCourse/edit', { reviews: reviewslist });
  } catch (err) {
    next(err);
  }
}

export async function searchCoursesByTitle(req, res, next) {
  try {
    const q = req.query.q || '';
    if (q.length === 0) {
      return res.render('vwInstructorCourse/search', { q, empty: true });
    }
    const keywords = q.replace(/ /g, ' & ');
    const courses = await searchByTitle(keywords);
    res.render('vwInstructorCourse/search', { q, empty: courses.length === 0, courses, pages: [] });
  } catch (err) {
    next(err);
  }
}
//augment lesson with video rendering hints
function augmentLessonForView(lesson) {
  const l = { ...lesson };
  const url = (l.video_url || '').toString();
  l.isYouTube = /youtu\.be|youtube\.com/.test(url);
  if (l.isYouTube) {
    let videoId = '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.replace('/', '');
      } else {
        videoId = u.searchParams.get('v') || '';
      }
    } catch {}
    l.youtubeEmbedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  l.isDirectVideo = /\.(mp4|webm|ogg)$/i.test(url);
  return l;
}

// delete a lesson by id for a given course
export async function deleteLessonOfCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;
    if (!courseId || !lessonId) {
      req.flash?.('error', 'Missing identifiers');
      if (req.xhr || (req.get('accept') || '').includes('json')) {
        return res.status(400).json({ success: false, message: 'Missing identifiers' });
      }
      return res.redirect('back');
    }
    const section = await db('sections')
      .join('lessons', 'lessons.section_id', 'sections.id')
      .where('lessons.id', lessonId)
      .select('sections.course_id')
      .first();
    if (!section || String(section.course_id) !== String(courseId)) {
      req.flash?.('error', 'Lesson not found in this course');
      return res.redirect(`/instructor/courses/edit/${courseId}/sections`);
    }
    // Load lesson to get its video_url
    const lesson = await db('lessons').where({ id: lessonId }).first();
    // Attempt to delete local or supabase file if referenced
    try {
      const url = (lesson?.video_url || '').toString();
      if (url.startsWith('/uploads/')) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const publicRoot = path.resolve(__dirname, '..', 'public');
        const rel = url.replace(/^\/+/, '');
        const abs = path.resolve(publicRoot, rel);
        // Ensure path is within public directory (safety)
        if (abs.startsWith(publicRoot)) {
          await fs.promises.unlink(abs).catch((err) => {
            if (err && err.code !== 'ENOENT') {
              console.warn('Failed to delete local upload:', abs, err);
            }
          });
        }
      } else if (/^https?:\/\//i.test(url) && /\/storage\/v1\/object\/public\//.test(url)) {
        // Supabase public URL; best-effort delete
        await deleteObjectByPublicUrl(url).catch(err => console.warn('Supabase delete failed:', err));
      }
    } catch (e) {
      console.warn('Error while trying to delete local video file:', e);
    }
    await db('lessons').where({ id: lessonId }).del();
    if (req.xhr || (req.get('accept') || '').includes('json')) {
      return res.json({ success: true });
    }
    req.flash?.('success', 'Lesson deleted');
    res.redirect(`/instructor/courses/edit/${courseId}/sections`);
  } catch (err) {
    next(err);
  }
}

// delete a section by id for a given course (and all its lessons)
export async function deleteSectionOfCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const sectionId = req.params.sectionId;
    if (!courseId || !sectionId) {
      const msg = 'Missing identifiers';
      if (req.xhr || (req.get('accept') || '').includes('json')) return res.status(400).json({ success: false, message: msg });
      req.flash?.('error', msg);
      return res.redirect('back');
    }

    // Check course status
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const msg = 'Course not found';
      if (req.xhr || (req.get('accept') || '').includes('json')) return res.status(404).json({ success: false, message: msg });
      req.flash?.('error', msg);
      return res.redirect('/instructor/courses');
    }
    if (String(course.status) === 'completed') {
      const msg = 'Cannot delete section on a completed course';
      if (req.xhr || (req.get('accept') || '').includes('json')) return res.status(400).json({ success: false, message: msg });
      req.flash?.('error', msg);
      return res.redirect(`/instructor/courses/edit/${courseId}/sections`);
    }

    // Ensure section belongs to course
    const section = await db('sections').where({ id: sectionId, course_id: courseId }).first();
    if (!section) {
      const msg = 'Section not found for this course';
      if (req.xhr || (req.get('accept') || '').includes('json')) return res.status(404).json({ success: false, message: msg });
      req.flash?.('error', msg);
      return res.redirect(`/instructor/courses/edit/${courseId}/sections`);
    }

    // Load lessons in this section to delete local files if any
    const lessons = await db('lessons').where({ section_id: sectionId });
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const publicRoot = path.resolve(__dirname, '..', 'public');
      await Promise.all((lessons || []).map(async (l) => {
        const url = (l?.video_url || '').toString();
        if (url.startsWith('/uploads/')) {
          const rel = url.replace(/^\/+/, '');
          const abs = path.resolve(publicRoot, rel);
          if (abs.startsWith(publicRoot)) {
            await fs.promises.unlink(abs).catch((err) => {
              if (err && err.code !== 'ENOENT') {
                console.warn('Failed to delete local upload:', abs, err);
              }
            });
          }
        } else if (/^https?:\/\//i.test(url) && /\/storage\/v1\/object\/public\//.test(url)) {
          await deleteObjectByPublicUrl(url).catch(err => console.warn('Supabase delete failed:', err));
        }
      }));
    } catch (e) {
      console.warn('Error while trying to delete files for section:', e);
    }
    await db.transaction(async (trx) => {
      await trx('lessons').where({ section_id: sectionId }).del();
      await trx('sections').where({ id: sectionId, course_id: courseId }).del();
    });

    if (req.xhr || (req.get('accept') || '').includes('json')) return res.json({ success: true });
    req.flash?.('success', 'Section deleted');
    return res.redirect(`/instructor/courses/edit/${courseId}/sections`);
  } catch (err) {
    next(err);
  }
}