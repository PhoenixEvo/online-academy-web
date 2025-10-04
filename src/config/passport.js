import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../models/db.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await db("users").where({ email }).first();
        if (!user) return done(null, false, { message: "Email does not exist" });

        // Compare password
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return done(null, false, { message: "Incorrect password" });

        // Require email verification before login
        if (!user.is_verified) {
          return done(null, false, {
            message: "Account email not verified",
          });
        }

        // Check if user is a instructor, student or admin
        if (
          user.role === "instructor" ||
          user.role === "student" ||
          user.role === "admin"
        ) {
          return done(null, { id: user.id, name: user.name, email: user.email, role: user.role });
        }
        return done(null, false, { message: "Invalid account" });
      } catch (e) {
        return done(e);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db("users").where({ id }).first();
    if (!user) return done(null, false);
    done(null, { id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    done(e);
  }
});

export function setupPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}
