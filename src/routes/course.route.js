// Change if needed to fit the project
import { Router } from "express";
import * as courseCtrl from "../controllers/course.controller.js";
import { requireLogin } from "../middlewares/authGuard.js";

const r = Router();

// Guest
r.get("/", courseCtrl.list); // /courses?page=1&sort=rating_desc
r.get("/watchlist", requireLogin, courseCtrl.showWatchlist);
r.get("/:id", courseCtrl.detail); // /courses/123

// Student actions

r.post("/:id/watch", requireLogin, courseCtrl.addToWatchlist);
r.delete("/:id/watch", requireLogin, courseCtrl.removeFromWatchlist);
r.post("/:id/enroll", requireLogin, courseCtrl.enroll);

// Reviews (only enrolled)
r.post("/:id/reviews", requireLogin, courseCtrl.createReview);

export default r;
