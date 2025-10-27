import { validationResult, param } from "express-validator";
import * as Instructor from "../models/instructor.model.js";
import * as Course from "../models/course.model.js";

// Validators
export const detailValidators = [param("id").isInt().toInt()];

// GET /instructors/:id - Instructor detail page
export async function detail(req, res, next) {
    try {
        const instructorId = parseInt(req.query.id);
        if (!instructorId || isNaN(instructorId))
            return res.status(400).render("error", { message: "Invalid instructor ID" });

        // Get instructor details with stats
        const instructor = await Instructor.findById(instructorId);
        if (!instructor)
            return res.status(404).render("error", { message: "Instructor not found" });

        // Get instructor stats and courses
        const [instructorStats, instructorCourses] = await Promise.all([
            Instructor.getInstructorStats(instructorId),
            Instructor.getInstructorCourses(instructorId, 10)
        ]);

        res.render("instructor/details", {
            title: `${instructor.display_name || instructor.name} - Instructor Profile`,
            instructor: {
                ...instructor,
                name: instructor.display_name || instructor.name,
                bio: instructor.bio || `${instructor.display_name || instructor.name} is an experienced instructor with passion for teaching.`
            },
            instructorStats: instructorStats || {
                course_count: 0,
                total_students: 0,
                avg_rating: "0.0"
            },
            instructorCourses: instructorCourses || [],
            isAuthenticated: !!req.user
        });
    } catch (e) {
        console.error('Error in instructor detail:', e);
        next(e);
    }
}

// GET /instructors - List all instructors
export async function list(req, res, next) {
    try {
        const instructors = await Instructor.getInstructorsWithCourseCount();

        res.render("instructor/list", {
            title: "All Instructors",
            instructors,
            isAuthenticated: !!req.user
        });
    } catch (e) {
        next(e);
    }
}

