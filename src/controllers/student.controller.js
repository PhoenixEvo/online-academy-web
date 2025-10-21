import "../helpers/hbs.helpers.js";
import { getPageData } from "../helpers/mockData.js";
import Handlebars from "handlebars";

export async function listEnrolled(req, res) {
  const page = parseInt(req.query.page) || 1;
  const { courses, pagination } = getPageData(page, 6);

  res.render('students/enrollments', {
    courses,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pages: pagination.pages
  });
}

export async function listWatchlist(req, res) {
  const page = parseInt(req.query.page) || 1;
  const { courses, pagination } = getPageData(page, 6);

  res.render('students/watchlist', {
    courses,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pages: pagination.pages
  });
}

export const getLearningPage = (req, res) => {
  res.render("students/learn");
};
