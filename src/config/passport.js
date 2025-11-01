import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../models/db.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

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
        if (!user.is_active) {
          return done(null, false, {
            message: "Your account has been locked. Please contact the administrator.",
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

// Google OAuth 2.0 strategy
// Google OAuth 2.0 strategy 
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "placeholder" &&
  process.env.GOOGLE_CLIENT_SECRET !== "placeholder"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          const displayName =
            profile.displayName || profile.name?.givenName || "User";
          const avatarUrl = profile.photos && profile.photos[0]?.value;
          const googleId = profile.id;

          if (!email) {
            return done(null, false, { message: "Google account has no email" });
          }

          let user = await db("users").where({ google_id: googleId }).first();
          if (user) {
            if (!user.is_active) {
          return done(null, false, { message: "Account has been locked" });
             }
            return done(null, {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            });
          }

         
          user = await db("users").where({ email }).first();
          if (user) {
            await db("users")
              .where({ id: user.id })
              .update({
                google_id: googleId,
                provider: "google",
                is_verified: true,
                avatar_url: user.avatar_url || avatarUrl,
              });
            return done(null, {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            });
          }

        // 3) Create new user - only student role allowed for OAuth registration
        const desiredRole = "student";
        const [created] = await db("users")
          .insert({
            name: displayName,
            email,
            password_hash: "",
            role: desiredRole,
            avatar_url: avatarUrl,
            google_id: googleId,
            provider: "google",
            is_verified: true,
          })
          .returning(["id", "name", "email", "role"]);
        if (req.session) {
          req.session.oauthDesiredRole = undefined;
        }
        return done(null, created);
        } catch (e) {
          return done(e);
      }
    }
    )
  );
} else {
  console.warn(
    "⚠️  Google OAuth not configured — skipping GoogleStrategy setup."
  );
}
