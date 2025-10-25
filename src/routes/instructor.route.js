import { Router } from "express";
import { requireLogin } from "../middlewares/authGuard.js";
import * as profileCtrl from "../controllers/profile.controller.js";
import { getAllInstructors, getInstructorProfile } from "../controllers/instructor.controller.js";

const r = Router();

r.use(requireLogin);

r.get("/", (req, res) => {
	const uid = req.user?.id;
	if (!uid) return res.redirect('/auth/login');
	const tab = req.query.tab || 'info';
	return res.redirect(`/profile?tab=${encodeURIComponent(tab === 'info' ? 'account' : tab)}`);
});

r.get("/:id", profileCtrl.showInstructorProfile);

r.post("/update/:id", profileCtrl.updateInstructorProfile);
r.post("/upload-avatar/:id", profileCtrl.updateInstructorProfilePicture);

export default r;

//listing/profile (mounted at /instructors)
export const instructorsRouter = Router();
instructorsRouter.use(requireLogin);
instructorsRouter.get('/', getAllInstructors);
instructorsRouter.get('/profile/:userId', getInstructorProfile);
