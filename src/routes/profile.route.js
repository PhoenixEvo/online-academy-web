import { Router } from "express";
import { requireLogin } from "../middlewares/authGuard.js";
import * as profileCtrl from "../controllers/profile.controller.js";

const r = Router();

// Apply authentication guard to all profile routes
r.use(requireLogin);

// Profile management routes
r.get("/", profileCtrl.showProfile);
r.post("/update", profileCtrl.validateProfileUpdate, profileCtrl.updateProfile);
r.post("/change-password", profileCtrl.validatePasswordChange, profileCtrl.changePassword);

export default r;
