import { Router } from 'express';
import * as homeCtrl from '../controllers/home.controller.js';

const r = Router();

// homepage
r.get("/", homeCtrl.home);

// alias route for instructor My Courses
// keeps URL short as requested
r.get('/mycourses', (req, res) => res.redirect('/instructor/courses'));

// about page
r.get("/about", homeCtrl.about);

// contact page
r.get("/contact", homeCtrl.contact);

// terms of service page
r.get("/terms", homeCtrl.terms);

// privacy policy page
r.get("/privacy", homeCtrl.privacy);

export default r;
