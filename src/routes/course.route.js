import express from 'express';
import * as courseCtrl from '../controllers/course.controller.js';
import { authGuard } from '../middlewares/authGuard.js';

const r = express.Router();

// Public routes (Guest access)
r.get('/search', courseCtrl.search_guest);       // GET /courses/search - Search courses (using guest version)
r.get('/', courseCtrl.list);                    // GET /courses - List all courses
r.get('/detail', courseCtrl.detail);            // GET /courses/detail?id= - Course detail

// Protected routes (Authenticated users only)
r.post('/:id/watch', authGuard, courseCtrl.addToWatchlist);           // POST /courses/:id/watch
r.delete('/:id/watch', authGuard, courseCtrl.removeFromWatchlist);    // DELETE /courses/:id/watch
r.post('/:id/enroll', authGuard, courseCtrl.enroll);                  // POST /courses/:id/enroll
r.post('/:id/reviews', authGuard, courseCtrl.createReview);           // POST /courses/:id/reviews

export default r;