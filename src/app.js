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

import indexRoute from './routes/index.route.js';
import authRoute from './routes/auth.route.js';
import profileRoute from './routes/profile.route.js';
import studentRoutes from './routes/student.route.js';

const app = express();

// helmet for website security
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-eval'"],
            styleSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https://mona.media",
                "https://*.mona.media",
                "https://example.com",
                "https://cdn.jsdelivr.net"
            ],
        },
    }));

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
    // prettier-ignore
    res.locals.isAuthenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
    res.locals.year = new Date().getFullYear();
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ROUTES (thin, no logic)
app.use('/', indexRoute);
app.use('/auth', authRoute);
app.use('/profile', profileRoute);
// app.use('/courses', courseRoute);
app.use('/students', studentRoutes);

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