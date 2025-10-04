import { Router } from 'express';
import * as homeCtrl from '../controllers/home.controller.js';

const r = Router();

// homepage
r.get("/", homeCtrl.home);

// about page
r.get("/about", homeCtrl.about);

export default r;
