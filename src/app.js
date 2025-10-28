import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import csurf from 'csurf';
import morgan from 'morgan';
import methodOverride from 'method-override';
import flash from 'connect-flash';

import { setupHandlebars } from './config/handlebars.js';
import { setupSession } from './config/session.js';
import { setupPassport } from './config/passport.js';
import { addCategoriesToLocals } from './middlewares/categories.js';
import indexRoute from './routes/index.route.js';
import authRoute from './routes/auth.route.js';
import profileRoute from './routes/profile.route.js';
import InstructorProfile, { instructorsRouter as instructorsPublicRoute } from './routes/instructor.route.js';
//import courseRoute from './routes/course.route.js';
import courseRoute from './routes/course.route.js';
import studentsRoute from './routes/student.route.js';
import learnRoutes from './routes/learn.route.js';
import lessonsRoutes from './routes/lessons.route.js';
import categoryRoute from './routes/category.route.js';

const app = express();

// helmet for website security
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
      "'self'",
      "https://cdnjs.cloudflare.com",
      "https://cdn.jsdelivr.net",
      "https://releases.transloadit.com",
      "https://www.youtube.com",
      "https://s.ytimg.com",
      "https://cdn.plyr.io",
      "'unsafe-eval'",
      "'unsafe-inline'"
    ],

    styleSrc: [
      "'self'",
      "https://cdnjs.cloudflare.com",
      "https://cdn.jsdelivr.net",
      "https://releases.transloadit.com",
      "https://fonts.googleapis.com",
      "https://cdn.plyr.io",
      "'unsafe-inline'"
    ],

    fontSrc: [
      "'self'",
      "data:",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ],

    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "http:",
      "https://i.ytimg.com"
    ],

    frameSrc: [
      "'self'",
      "https://drive.google.com",
      "https://www.youtube.com",
      "https://youtube.com",
      "https://www.youtube-nocookie.com"
    ],

    mediaSrc: [
      "'self'",
      "https:",
      "http:",
      "https://drive.google.com",
      "https://*.supabase.co",
      "https://*.supabase.in"
    ],

    connectSrc: [
      "'self'",
      "https://*.supabase.co",
      "https://*.supabase.in",
      "https://www.youtube.com",
      "https://s.ytimg.com",
      "https://cdn.plyr.io"
    ]
    },
  })
);

// middleware for website
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method')); // for put and delete request
app.use(morgan('dev')); // for logging
app.use(express.static('src/public')); // for static files

// setup session and passport
setupHandlebars(app);
setupSession(app);
setupPassport(app);

// flash messages (must be after session and passport)
app.use(flash());

// CSRF must be after session:
app.use(csurf());

// error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle AJAX requests differently
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(403).json({
        success: false,
        message: 'Session expired or CSRF is invalid. Please try again.'
      });
    }
    req.flash('error', 'Session expired or CSRF is invalid. Please try again.');
    return res.redirect('back');
  }
  return next(err);
});

// locals for website
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated?.() || false;
  res.locals.year = new Date().getFullYear();
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Add categories to locals for guest users
app.use(addCategoriesToLocals);


// Inject global categories for all views (must be BEFORE routes that render views)
import categoryModel from './models/instructor-category.model.js';
app.use(async function (req, res, next) {
  try {
    res.locals.globalCategories = await categoryModel.findAllTree();
  } catch (e) {
    console.error('load globalCategories failed:', e);
    res.locals.globalCategories = [];
  }
  next();
});

// ROUTES (thin, no logic)
app.use('/', indexRoute);
app.use('/auth', authRoute);
app.use('/profile', profileRoute);
//app.use('/courses', courseRoute);
app.use('/instructor', instructorsPublicRoute);
// instructor course route
import courseInstructorRouter from './routes/course-instructor.route.js';
import { restrict,restrictInstructor } from './controllers/auth.controller.js';
app.use('/instructor/courses', restrict, restrictInstructor, courseInstructorRouter);
app.use('/instructor/profile', restrict, restrictInstructor, InstructorProfile);
// Upload API (signed URLs to GCS)
import uploadRouter from './routes/upload.route.js';
app.use('/api/uploads', restrict, restrictInstructor, uploadRouter);
app.use('/courses', courseRoute);
app.use('/students', studentsRoute);
app.use('/learn', learnRoutes);
app.use('/lessons', lessonsRoutes);
app.use('/categories', categoryRoute);
app.use('/categories', categoryRoute);


// 404 handler
app.use((req, res) => {
  res.status(404).render('404.hbs');
});


// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error.hbs', { message: 'An error occurred!' });
});

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));

