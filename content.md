#  Student Backend Implementation Documentation   (student)
**ID:** 23110035 — **Tran Dinh Khuong**

This documentation provides a comprehensive overview of the **backend implementation** for the online learning platform — covering **routes**, **controllers**, **models**, **helpers**, and **client-side scripts** that enable core student functionalities such as **learning progress tracking**, **watchlist management**, **simulated payments**, and **feedback submission**.

---

##  1. Routing Layer

### `src/routes/student.route.js`
| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/students/enrolled` | Display enrolled courses |
| GET | `/students/watchlist` | Display watchlist page |
| POST | `/students/watchlist/remove/:id` | Remove a course from watchlist |
| GET | `/students/checkout/:id` | Display checkout page |
| POST | `/students/purchase/:id` | Process purchase and record enrollment |
| GET | `/students/enrolled/learn/:courseId` | Redirect to the first lesson of a course |

---

### `src/routes/learn.route.js`
All routes are protected by **authGuard** middleware.

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/learn/:lessonId` | View a specific lesson |
| GET | `/learn/:lessonId/get-progress` | Fetch current progress (AJAX) |
| POST | `/learn/:lessonId/progress` | Update progress and completion status |
| POST | `/learn/:lessonId/complete` | Mark a lesson as completed |
| POST | `/learn/:lessonId/uncomplete` | Mark a lesson as incomplete |

---

### `src/routes/lessons.route.js`
| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | `/lessons/:lessonId/feedback` | Submit lesson feedback or rating |

---

### `src/routes/course.route.js`
| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | `/courses/:id/watch` | Add a course to watchlist |
| DELETE | `/courses/:id/watch` | Remove a course from watchlist |

>  All student and course-related routes are protected by authentication middleware (`authGuard`).

---

##  2. Controllers

### `student.controller.js`
Handles all student-related operations.

- **getEnrolledCourses()** — Retrieves purchased courses, paginates results, and calculates completion stats.
- **listWatchlist()** — Displays user’s watchlist with pagination; includes CSRF token for form security.
- **removeCourse()** — Deletes a course from the watchlist and displays flash messages.
- **showCheckout()** — Validates course existence and enrollment before rendering the checkout view.
- **processPurchase()** — Simulates payment, validates input, records enrollment, and removes course from watchlist if applicable.

> *Currently using simulated payment logic; future updates can integrate Stripe or PayPal.*

---

### `learn.controller.js`
Handles learning progress, video lessons, and feedback.

- **startCourse()** — Checks enrollment and redirects to the first lesson.
- **viewLesson()** — Loads the selected lesson, converts YouTube URLs into embedded videos, and passes progress data to the view.
- **getProgress()** — Returns JSON progress data (used by the video player).
- **updateProgress()** — Updates watched time and auto-completes when ≥95% viewed.
- **completeLesson() / uncompleteLesson()** — Toggle lesson completion and recalculate overall progress.
- **submitFeedback()** — Verifies enrollment, prevents duplicate feedback, saves review, and updates rating stats.

>  Input validation uses `express-validator`, while feedback and progress responses are handled via JSON or flash messages.

---

##  3. Models (Data Layer)

### `learn.model.js`
Implements data logic for lessons and progress tracking.

- `getLessonById()` — Fetch lesson and related course data.  
- `getCourseLessons()` — Return course sections and lessons with user progress (via joins).  
- `updateProgress()` — Auto-completes lesson when 95% watched, and only updates when progress increases.  
- `markLessonCompleted()` / `markLessonUncompleted()` — Manually complete or reset lesson progress.  
- `getCourseProgress()` — Compute overall completion percentage.  
- Navigation helpers: `getFirstLesson()`, `getNextLesson()`, `getPreviousLesson()`.  
- Feedback helpers: `hasUserSubmittedFeedback()`, `createLessonFeedback()`.

---

### `student.model.js`
Manages enrolled courses and watchlist.

- `findCoursesByStudentId()` — Fetch enrolled courses with computed progress and completion rate.  
- `getAllWatchlist()` — Retrieve user’s watchlist with joined metadata.  
- `remove()` — Delete an item from the watchlist.

---

### `watchlist.model.js`
CRUD operations for watchlists.

- `add()`, `remove()`, `isInWatchlist()`, `getUserWatchlist()`  
- Supports pagination and joins with instructor, categories, and course details.

---

### `review.model.js`
Handles user feedback and rating statistics.

- `listByCourse()`, `create()`, `hasUserReviewed()`, `getCourseStats()`  
- Calculates course rating averages and total review counts.

---

## 4. Helpers

### `src/helpers/hbs.helpers.js`
Custom **Handlebars** helpers used across templates.

- **URL helpers:** `buildUrl`, `buildSortUrl`, `buildRemoveSortUrl`, etc.  
- **Sorting utilities:** `parseSortList`, `hasSort`, `sortDir`.  
- **Formatting:** `formatDuration` (seconds → HH:MM:SS).  
- **YouTube utilities:** `isYouTubeUrl`, `getYouTubeVideoId`, `convertToYouTubeEmbed`.  
- **Math helpers:** `increment`, `gt`, `eq`, `format_number`.

These helpers simplify URL generation, video embedding, and numeric formatting in templates.

---

##  5. Client-Side JavaScript (`src/public/js/learn.js`)

### Core Features
- **Toast notifications** (Bootstrap)
- **Star rating UI** with dynamic input binding

### Lesson Progress & Completion
- Handles “Mark as Complete/Incomplete” actions and updates UI instantly.
- Periodically saves video progress (`watched_sec`, `completed`) every 3 seconds.
- Automatically marks lessons as complete when ≥95% watched.
- Uses `navigator.sendBeacon()` to save progress on page unload.

### Plyr Video Integration
- Supports both YouTube embeds and standard video elements.
- Syncs with backend progress using AJAX.
- Updates progress bars and shows completion toasts dynamically.

---

##  6. Views

### `src/views/students/`
| Template | Description |
|-----------|--------------|
| `enrollments.hbs` | Lists enrolled courses |
| `learn.hbs` | Main learning page (video, sidebar, progress, feedback) |
| `purchase.hbs` | Checkout/payment form |
| `watchlist.hbs` | Displays user’s watchlist |

Each template receives dynamic variables such as:  
`lesson`, `sections`, `progress`, `courseProgress`, `video_url`, `csrfToken`, and pagination data.

---

## ⚙️ 7. Technical Notes

- **Payment Simulation:** Currently mocked; needs integration with real payment gateway (Stripe/PayPal).  
- **sendBeacon Handling:** Beacon requests don’t include CSRF headers — backend must allow raw body or create CSRF-free endpoint for progress updates.  
- **Code Cleanup:** Some unused imports (e.g., Handlebars or `connect-flash`) should be removed.  
- **Error Handling:** Consistent use of flash messages for user feedback and JSON responses for AJAX endpoints.

---

## ✅ 8. Summary

This backend module completes the entire **student learning workflow**, including:

- **Watchlist Management** — Save , remove ...  and manage favorite courses.  
- **Course Enrollment & Checkout** — what list courses enrolled or (added in watchlist), Simulated payment and enrollment recording.  
- **Learning System** — Progress tracking, auto-resume, and completion tracking.  
- **Feedback & Ratings** — Submit reviews only after enrollment.  
- **Video Player Integration** — Embedded YouTube or local videos with real-time progress saving.  

> The implementation demonstrates strong modularization, clear route-controller-model separation, and integration between client-side interactivity and backend persistence.

--- 
**Course:** Web Application Development — HCMUTE  
**Branch:** Student Backend Module  
