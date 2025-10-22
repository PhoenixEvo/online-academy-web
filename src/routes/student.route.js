//file test hbs
import express from "express";
<<<<<<< HEAD
import { listEnrolled, listWatchlist, getEnrolledCourses }
from "../controllers/student.controller.js";
const router = express.Router();

// Các route test hiển thị view
router.get("/enrollments", getEnrolledCourses);
router.get("/profile-student", (req, res) => {
    res.render("students/profile-student");
});
router.get("/learn", (req, res) => {
    res.render("students/learn");
});
router.get("/watchlist", listWatchlist);

export default router;
=======
import {
  listEnrolled,
  listWatchlist,
} from "../controllers/student.controller.js";

const router = express.Router();

// Các route test hiển thị view
router.get("/enrollments", listEnrolled);
router.get("/learn", (req, res) => {
  res.render("students/learn");
});
router.get("/watchlist", listWatchlist);

router.get('/purchase', (req, res) => {
  res.render('students/purchase');
});


export default router;
>>>>>>> origin/MinhQuan
