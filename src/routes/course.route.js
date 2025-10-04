// Change if needed to fit the project
import { Router } from "express";
import * as courseCtrl from "../controllers/course.controller.js";
import { requireLogin } from "../middlewares/authGuard.js";

const r = Router();

// Guest
r.get("/", courseCtrl.list); // /courses?page=1&sort=rating_desc
r.get("/:id(\\d+)", courseCtrl.detail); // /courses/123

// Student actions
r.post("/:id(\\d+)/watch", requireLogin, courseCtrl.addToWatchlist);
r.delete("/:id(\\d+)/watch", requireLogin, courseCtrl.removeFromWatchlist);
r.post("/:id(\\d+)/enroll", requireLogin, courseCtrl.enroll);

// Reviews (only enrolled)
r.post("/:id(\\d+)/reviews", requireLogin, courseCtrl.createReview);

export default r;
