import express from 'express';
import * as instructorCtrl from '../controllers/instructor.controller.js';

const r = express.Router();

// GET /instructors/profile?id= - Instructor detail page
r.get('/profile', instructorCtrl.detail);

export default r;

