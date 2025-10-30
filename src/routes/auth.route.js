import { Router } from "express";
import passport from "passport";
import * as authCtrl from "../controllers/auth.controller.js";

const r = Router();

// login
r.get("/login", authCtrl.showLogin);
r.post(
  "/login",
  passport.authenticate("local", {
  failureRedirect: "/auth/login",
  failureFlash: true,}),
  (req, res) => {
    if (req.user.role === 'admin') {
      req.flash('success', 'Welcome back, Admin!');
      return res.redirect('/admins/users');
    }
    return res.redirect('/');
  }
);

// Google OAuth: capture desired role then start auth
r.get("/google", (req, res, next) => {
  const desiredRole = req.query.role;
  if (desiredRole === "student" || desiredRole === "instructor") {
    req.session.oauthDesiredRole = desiredRole;
  } else {
    req.session.oauthDesiredRole = "student";
  }
  next();
}, passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

r.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res) => {
    if (req.user.role === 'admin') {
      req.flash('success', 'Welcome back, Admin!');
      return res.redirect('/admins/users');
    }
    return res.redirect('/');
  }
);

// register
r.get("/register", authCtrl.showRegister);
r.post("/register", authCtrl.validateRegister, authCtrl.doRegister);
r.post("/resend-otp", authCtrl.resendOtp);
r.post("/verify-otp", authCtrl.validateOtp, authCtrl.verifyOtp);

// API: Check email availability (Ajax validation)
r.get("/check-email", authCtrl.checkEmail);

// forgot password
r.get("/forgot-password", authCtrl.showForgotPassword);
r.post("/forgot-password", authCtrl.validateForgotPassword, authCtrl.sendResetOtp);
r.get("/reset-password", authCtrl.showResetPassword);
r.post("/reset-password", authCtrl.validateResetPassword, authCtrl.doResetPassword);

// logout
r.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});
r.post("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

export default r;