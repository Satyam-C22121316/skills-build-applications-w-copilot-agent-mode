# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use React hooks (useState, useEffect) + Bootstrap components for UI; client.ts handles all API calls
- Logic tier decision: Use Express error middleware for centralized error handling; services contain all business logic
- Data tier decision: Use Mongoose schema validation with required field constraints; seed.ts provides test data
- Activity tracking approach: Validate user/team IDs exist before creating; compute points server-side based on activity type/minutes
- Team management approach: POST requires name field; return 400 if missing; populate members array with User references
- Leaderboard approach: Aggregate activities by team using $group, sum points, sort by totalPoints descending, add 1-based rank
- Workout suggestions approach: Find user by email, match Workout.focus to User.fitnessGoal, provide reason explaining match

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Validates Mongoose schemas have required field constraints; failure means models don't reject empty objects with validation errors

- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Validates endpoints return correct HTTP status codes (201 for success, 400 for validation errors, 404 for not found); failure means services lack business logic or error handling

- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Validates React components render API data, show meaningful empty states, and display error alerts; failure means components aren't implemented yet

- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Validates TypeScript compiles without errors; failure means type errors in source code

- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Validates Vite bundles React code without errors; failure means TypeScript or JSX errors in components
