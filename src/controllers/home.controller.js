// Change if needed to fit the project
import { db } from "../models/db.js";

// home page
export async function home(req, res, next) {
  try {
    // example: 10 hot courses by views
    const mostViewed = await db("courses").orderBy("views", "desc").limit(10);
    // 10 new courses
    const newest = await db("courses").orderBy("created_at", "desc").limit(10);
    
    res.render("home", { 
      mostViewed, 
      newest, 
      title: "Online Academy"
    });
  } catch (e) {
    next(e);
  }
}

// about page
export async function about(req, res, next) {
  res.render("about", { title: "About" });
}
