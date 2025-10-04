import { Router } from "express";
import passport from "passport";
import * as authCtrl from "../controllers/auth.controller.js";

const r = Router();

// login
r.get("/login", authCtrl.showLogin);
r.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

// register
r.get("/register", authCtrl.showRegister);
r.post("/register", authCtrl.validateRegister, authCtrl.doRegister);
r.post("/resend-otp", authCtrl.resendOtp);
r.post("/verify-otp", authCtrl.validateOtp, authCtrl.verifyOtp);

// logout
r.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});
r.post("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

export default r;