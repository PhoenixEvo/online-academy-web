## Mentor - Online Academy — PTUDW Final Project

### Overview
Online Academy is a web application that enables learners to discover, enroll in, and study online courses while instructors can publish and manage their courses. The system follows the MVC pattern with Express.js and Handlebars, uses PostgreSQL via Knex for persistence, and implements authentication, session management, CSRF protection, and email-based OTP verification.

https://online-academy-web.onrender.com/

This README summarizes the scope from the PTUDW specification and the current implementation in the `online-academy` folder.

### Key Features
- **Guest**
  - Browse categories (two-level hierarchy) and courses
  - Home page highlights featured, most-viewed, and newest courses
  - Full-text-like search (intended) with filtering and sorting options
  - Course details page with description, rating, enrollments, last update, preview outline, instructor info, and top related courses
- **Student**
  - Register with email and password (hashed with bcrypt), OTP verification via email
  - Manage profile (name, email, password), view/enroll courses
  - Watchlist (favorite courses) management
  - Track lesson progress across course videos
  - Rate and review enrolled courses
- **Instructor**
  - Create/update courses with descriptions (WYSIWYG intended) and lesson videos
  - Mark course completion status when content is ready
  - Manage instructor profile and view owned courses
- **Administrator**
  - CRUD management for categories, users, and courses (with constraints, e.g., cannot delete a category already in use)
- **Common**
  - Local authentication (Passport Local), sessions, CSRF protection, and security headers (Helmet)
  - Handlebars templating with layouts and partials; static assets served from `src/public`

### Tech Stack
- **Runtime/Framework**: Node.js, Express.js (v5)
- **Templating**: Handlebars (`express-handlebars`)
- **Database**: PostgreSQL with Knex migrations and seeds
- **Auth**: Passport (Local strategy), `express-session`
- **Security**: Helmet CSP, CSRF (`csurf`), input validation (`express-validator`)
- **Mail**: Nodemailer
- **Utilities**: Day.js, UUID, method-override, morgan

### Repository Structure
```
FinalProject/
  Mentor/                     # Static site template (reference assets and pages)
  online-academy/             # Main application
    src/
      app.js                  # Express app bootstrap
      config/                 # Handlebars, session, passport configuration
      controllers/            # Route handlers (auth, course, home, profile)
      middlewares/            # Auth guard, error handler
      models/                 # Knex DB access layers
      routes/                 # Express routers (index, auth, profile, course)
      services/               # Mail and OTP services
      views/                  # Handlebars views, layouts, and partials
      public/                 # Static assets (css, js, images, vendor)
    migrations/               # Knex migration scripts
    seeds/                    # Knex seed scripts
    knexfile.js               # Knex configuration
    package.json              # Scripts and dependencies
    env.example               # Environment variable sample
```

### Requirements
- Node.js 18+ and npm
- PostgreSQL 14+

### Installation
```bash
cd online-academy
npm install
```

### Environment Configuration
Create a `.env` file inside `online-academy` based on `env.example`. Key variables:
```env
# Server
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=replace-with-a-long-random-string

# Database (choose one style)
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
# or use discrete fields (used by knexfile.js when no URL provided)
DB_CONNECTION=postgres://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=
DB_SSL=false

# Mail (Nodemailer)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=example@example.com
MAIL_PASS=example-password
MAIL_FROM="Mentor Online Academy <no-reply@online.com>"

# Google Authentication (optional)
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Supabase (Storage + Database, optional)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
SUPABASE_BUCKET=
```

`knexfile.js` will prefer `DATABASE_URL` or `DB_CONNECTION` when provided; otherwise it falls back to individual `DB_*` fields. Do not commit secrets.

### Database Migration and Seed
```bash
# From online-academy/
npm run migrate     # Apply latest migrations
npm run seed        # Seed initial data
# To rollback last batch
npm run rollback
```

Migrations included:
- `20251001142417_001_init_users_categories_courses`
- `20251001142548_002_lessons_enrollments_watchlist_reviews`
- `20251001142556_003_progress_otp_tokens`
- `20250102000000_add_is_verified_to_users`
- `20250123000000_add_fulltext_search_index`
- `20251007135714_add_google_fields_to_users`

For details about enabling full-text search, see `SETUP_FULLTEXT_SEARCH.md`.

### Running the App
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000` by default.

### Deployment

This application can be deployed to various platforms. **Render** is recommended for easy setup.

**Quick Render Deploy:**
1. Push code to GitHub (with `render.yaml` file)
2. Go to https://render.com → "New" → "Blueprint"
3. Connect GitHub repo → Render auto-detects `render.yaml`
4. Set environment variables (MAIL_*, GOOGLE_*, SUPABASE_*)
5. Wait for deploy → Run migrations in Shell:
   ```bash
   npm run migrate
   npm run seed
   ```

See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed Render deployment guide.  
See [DEPLOY.md](./DEPLOY.md) for other platforms (Heroku, Railway).

### Security Notes
- **Helmet CSP** is configured to restrict script/style sources and fonts
- **CSRF** protection is applied globally; forms must include `{{csrfToken}}`
- **Sessions** are configured server-side; ensure a strong `SESSION_SECRET`
- **Password hashing** uses `bcrypt`

### Notable Routes
- `/` home, category and course browsing (per site navigation)
- `/auth/*` login, register, OTP verification, forgot/reset password
- `/profile` profile management for authenticated users
- `/courses/*` course browsing and details (router present; logic may be WIP)

### Scripts
```json
{
  "dev": "nodemon src/app.js",
  "start": "node src/app.js",
  "migrate": "knex migrate:latest --knexfile ./knexfile.js",
  "rollback": "knex migrate:rollback --knexfile ./knexfile.js",
  "seed": "knex seed:run --knexfile ./knexfile.js"
}
```

### Testing Checklist
| Area | Criteria |
| --- | --- |
| Interface | Pages render with Handlebars layouts/partials; assets load without CSP violations |
| Auth | Register/login/logout flows; bcrypt hashing; OTP email delivery and verification |
| CSRF | All form posts include a valid token; AJAX receives JSON error on invalid CSRF |
| Session | Session persists across requests; flash messages display correctly |
| Profile | Update name/email/password (requires current password) |
| Courses | List, paginate, sort, and view course details; preview outline works |
| Search | Keyword and category search returns expected results; pagination and sorting |
| Watchlist | Add/remove courses; view personal watchlist |
| Enrollment | Enroll flow; access to lessons restricted to enrolled students |
| Progress | Lesson progress saved and restored per student per lesson |
| Reviews | Only enrolled students can rate/review; aggregate rating updates |
| Admin | Category/course/user management; business rules enforced (e.g., cannot delete used category) |

### Development Notes
- Views live in `src/views` with layouts (`layouts/main.hbs`, `layouts/auth.hbs`) and partials (`partials/header.hbs`, `partials/footer.hbs`).
- Static files are served from `src/public`.
- Error handling: custom 404 (`views/404.hbs`) and 500 (`views/error.hbs`).

### License
ISC


