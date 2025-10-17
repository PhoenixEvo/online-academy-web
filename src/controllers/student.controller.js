import { showCourses, getPagedCourses } from "../models/student.model.js";
import "../helpers/hbs.helpers.js";
import Handlebars from "handlebars";

export async function listEnrolled(req, res) {
  const engine = req.app.engines[".hbs"];
  if (engine && engine.handlebars) {
    if (!engine.handlebars.helpers.gt) {
      engine.handlebars.registerHelper("gt", (a, b) => a > b);
      engine.handlebars.registerHelper("lt", (a, b) => a < b);
      engine.handlebars.registerHelper("increment", (v) => v + 1);
      engine.handlebars.registerHelper("decrement", (v) => v - 1);
    }
  }
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const totalCourses = 25;

  const allCourses = await showCourses();
  const trimmedAll = allCourses.slice(0, totalCourses);

  const start = (page - 1) * limit;
  const end = Math.min(start + limit, totalCourses);
  const paged = trimmedAll.slice(start, end);

  const totalPages = Math.ceil(totalCourses / limit);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      value: i,
      isCurrent: i === page,
    });
  }

  res.render("students/enrollments", {
    courses: paged,
    currentPage: page,
    totalPages,
    pages,
  });
}
export const getProfilePage = (req, res) => {
  res.render("students/profile-student");
};

export async function listWatchlist(req, res) {
  const engine = req.app.engines[".hbs"];
  if (engine && engine.handlebars) {
    if (!engine.handlebars.helpers.gt) {
      engine.handlebars.registerHelper("gt", (a, b) => a > b);
      engine.handlebars.registerHelper("lt", (a, b) => a < b);
      engine.handlebars.registerHelper("increment", (v) => v + 1);
      engine.handlebars.registerHelper("decrement", (v) => v - 1);
    }
  }
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const totalCourses = 25;

  const allCourses = await showCourses();
  const trimmedAll = allCourses.slice(0, totalCourses);

  const start = (page - 1) * limit;
  const end = Math.min(start + limit, totalCourses);
  const paged = trimmedAll.slice(start, end);

  const totalPages = Math.ceil(totalCourses / limit);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      value: i,
      isCurrent: i === page,
    });
  }

  res.render("students/watchlist", {
    courses: paged,
    currentPage: page,
    totalPages,
    pages,
  });
}

export const getLearningPage = (req, res) => {
  res.render("students/learn");
};
