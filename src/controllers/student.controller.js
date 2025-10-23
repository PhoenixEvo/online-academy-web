import "../helpers/hbs.helpers.js";
import Handlebars from "handlebars";

export async function listEnrolled(req, res) {
  res.render('students/enrollments');
}

export async function listWatchlist(req, res) {
  res.render('students/watchlist');
}

export const getLearningPage = (req, res) => {
  res.render("students/learn");
};
