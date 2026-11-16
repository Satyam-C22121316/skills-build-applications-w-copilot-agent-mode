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

- **Presentation tier decision**: Use React hooks (useState, useEffect) + Bootstrap components for UI; `src/api/client.ts` handles all API calls; each capability page shows loading/empty/error/success states
- **Logic tier decision**: Use Express error middleware for centralized error handling; services contain all business logic; return deliberate 4xx for invalid input (never 500 from cast errors)
- **Data tier decision**: Use Mongoose schema validation with required field constraints and type safety; `src/scripts/seed.ts` provides test data with upserts for stable fixtures
- **Activity tracking approach**: Validate userId and teamId reference existing documents before creating; compute points server-side based on activity type (run=1pt/min, bike=0.75pt/min, swim=1.5pt/min); reject malformed IDs with 400
- **Team management approach**: POST requires name field; return 400 if missing; populate members array with User references; teams can exist without members
- **Leaderboard approach**: Aggregate activities by team using MongoDB $group, sum points per team, sort by totalPoints descending, add 1-based rank in memory
- **Workout suggestions approach**: Find user by exact email match, return 404 if not found; select first Workout.focus matching User.fitnessGoal; include reason field explaining the recommendation

## Test plan

Record the commands you run and what each failure means.

- **Data contract**: `npm test --prefix octofit-tracker/backend`
  - Validates Mongoose schemas enforce required fields and reject invalid data; passing test means models accept valid seed data
  - Failure indicates missing field validation in model definitions

- **API contract**: `npm test --prefix octofit-tracker/backend`
  - Validates endpoints return 201 for successful POST, 400 for validation errors (invalid IDs, missing fields), 404 for not found, 200 for GET
  - Each endpoint tests: happy path (valid request), validation error (missing/invalid field), not-found (ID doesn't exist)
  - Failure means services lack input validation or error handling middleware

- **Presentation contract**: `npm test --prefix octofit-tracker/frontend`
  - Validates React components render API data, announce loading states with role="status", show empty states with meaningful text, display error alerts with role="alert"
  - Each route (`/activities`, `/teams`, `/leaderboard`, `/workouts`) tested for all 4 states: loading, empty, success (data rendered), error
  - Specific tests: activities page shows activity type (e.g., "run"), teams show team name (e.g., "Octocats"), leaderboard shows points, workouts fetch with user email
  - Failure indicates component not implemented, missing useEffect to fetch data, or state not rendered

- **Backend build**: `npm run build --prefix octofit-tracker/backend`
  - Validates TypeScript compiles without type errors; indicates missing type annotations or incorrect API responses

- **Frontend build**: `npm run build --prefix octofit-tracker/frontend`
  - Validates Vite bundles React code; indicates TypeScript/JSX syntax errors or missing imports

**Test execution order** (safety: data→API→build→presentation):
1. `npm test --prefix octofit-tracker/backend` — ensures database models are sound
2. `npm run build --prefix octofit-tracker/backend` — ensures no TypeScript errors before running API tests
3. `npm test --prefix octofit-tracker/frontend` — presentation tests already mocked, no backend needed
