# TravelWave
![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s1.png)

![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s2.png)
![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s3.png)
![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s4.png)
![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s5.png)
![TraveWave](https://raw.githubusercontent.com/VenkateshLatchireddy/TravelWave/main/client/src/assets/s6.png)


## Project Overview

TravelWave is an AI-powered travel planning application that generates personalized trip itineraries, budgets, hotel recommendations, and packing lists. The system combines a React + Vite frontend with an Express + TypeScript backend that leverages a generative AI model (Google Gemini) to build rich, contextual itineraries and smart packing suggestions. Users can create, edit, share, export, and email trip itineraries as PDFs or JSON.

Key user flows:
- Sign up, verify email, and authenticate via JWTs.
- Generate itineraries from prompts and edit them.
- Persist trips, mark them public/shared, and view shared trips.
- Export itineraries as PDFs and optionally email them.
- Use the creative Packing List feature to automatically generate and manage packing items per trip.

## Tech Stack

- Frontend
  - React 19 + TypeScript (Vite): fast, modern SPA developer experience.
  - TailwindCSS: rapid styling and consistent design tokens.
  - React Router: client-side routing and protected routes.

- Backend
  - Node.js + Express + TypeScript: typed API surface, developer ergonomics, and broad ecosystem.
  - Mongoose (MongoDB): flexible document model for trips and users.
  - JSON Web Tokens (JWT): stateless authentication with short-lived access tokens and refresh tokens.
  - Nodemailer: transactional emails for verification and exports.
  - html-pdf: server-side PDF generation for exports.
  - Winston + Morgan: logging and request tracing.

- AI / Integrations
  - Google Generative AI (Gemini) via @google/generative-ai SDK: central agent to craft itineraries and packing recommendations.

Why these choices
- TypeScript across the stack for consistent types and safer refactors.
- React + Vite for developer productivity and fast HMR.
- MongoDB suits the flexible structure of travel itineraries and varied packing items.
- Gemini provides a powerful, flexible language model useful for domain-specific content.

## Setup Instructions

Prerequisites
- Node 18+ / npm
- MongoDB (local or connection string)
- Environment variables (see `.env.example` or below)

1. Clone the repo

```bash
git clone <repo-url> TravelWave
cd TravelWave
```

2. Server setup

```bash
cd server
npm install
# Add environment variables (see .env.example)
npm run dev         # start in dev (ts-node-dev)
npm run build       # build TS to dist
npm run start       # run production build
npm run type-check  # run TypeScript type checks
npm test            # run backend tests (Jest)
```

Environment variables (example)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/travelwave
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
SMTP_FROM=noreply@travelwave.ai
```

3. Client setup

```bash
cd client
npm install
npm run dev     # start dev server for the frontend (Vite)
npm run build   # build production assets
```

Deployment (high level)
- Frontend: Deploy to Vercel / Netlify by pointing to the `client` folder and setting the build command `npm run build`.
- Backend: Deploy to a Node host (Render, Heroku, DigitalOcean App Platform, etc.) and set environment variables. Use `npm run build` and `npm run start` in production.
- MongoDB: Use a managed Mongo provider (MongoDB Atlas) and supply `MONGODB_URI` to the app.

Production deployment details
- Frontend production URL: `https://travel-wave-eta.vercel.app/login`
- Backend production URL: `https://travelwave.onrender.com`
- In Vercel, set Root Directory to `client`, Install Command to `npm install`, Build Command to `npm run build`, Output Directory to `dist`.
- In Vercel environment variables, set:
  - `VITE_API_URL=https://travelwave.onrender.com`
  - `VITE_APP_NAME=TravelWave`
- In Render environment variables for the backend, set:
  - `FRONTEND_URL=https://travel-wave-eta.vercel.app`
  - `MONGODB_URI` to your MongoDB connection string
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`, `SMTP_*` values, etc.
- Local development works with the defaults: server on `http://localhost:5000`, client on `http://localhost:5173`.

## High-level Architecture

- Frontend (React) interacts with a RESTful API under `/api/*`.
- Backend (Express) hosts endpoints for auth, trip CRUD, export, and AI generation.
- GeminiService encapsulates calls to the generative AI model; results are normalized and validated before saving.
- Exports: Backend generates PDFs server-side (html-pdf) and sends via email with Nodemailer.
- Sharing: Trips can be marked public with a `shareToken` to enable read-only public access.

Mermaid architecture (high-level)

```mermaid
flowchart LR
  A[User Browser] -->|API requests| B[Frontend (React)]
  B --> |REST| C[Express API]
  C --> D[MongoDB]
  C --> E[Gemini AI Service]
  C --> F[Nodemailer / SMTP]
  C --> G[PDF Generator]
  E -->|Itinerary JSON| C
  G -->|PDF| C
  C -->|Email with attachment| F
```

## Authentication & Authorization

- Authentication: JWT-based.
  - Short-lived access tokens (configured via `JWT_ACCESS_EXPIRE`) and long-lived refresh tokens.
  - `JWTService` handles generation and verification of tokens. Access tokens contain minimal user claims.
  - Login, register, refresh token, and logout flows are implemented on server routes under `/api/auth`.
  - Email verification for account activation using signed tokens and `EmailService`.

- Authorization:
  - `authMiddleware` protects routes and sets `req.user` from validated JWTs.
  - `authorize(...)` middleware is a placeholder for role-based checks; currently checks that a user is authenticated and can be extended for roles.

Security notes
- Secrets and credentials must be stored in environment variables or a secure secrets manager in production.
- Rate limiting and helmet are enabled on the API to reduce abuse.

## AI Agent Design & Purpose

- `GeminiService` is a small wrapper around the Google Generative AI SDK. Responsibilities:
  - Build prompts from user inputs (trip details, preferences, budget, interests)
  - Configure model generation parameters (temperature, topP, max tokens)
  - Apply safety settings to filter harmful content
  - Retry on transient failures with exponential backoff
  - Normalize and validate AI-generated JSON into domain models (itinerary days, hotels, packing items)

Why an agent approach
- The AI agent centralizes prompt construction, safety, parsing, and error handling. This gives a single place to iterate on prompt engineering and post-processing for future improvements.

## Creative / Custom Feature — Packing List

Overview
- TravelWave includes an intelligent `Packing List` feature that automatically suggests items tailored to each trip. The packing list is stored per-trip, editable by the user, and can be marked item-by-item as packed.

Why we built it
- Packing is a frequent pain point for travelers. A contextual packing list saves time and reduces the cognitive load of trip planning (especially for complex itineraries or for travelers with special requirements like sports, business travel, or mixed climates).

What problem it solves
- Converts itinerary context (destination climate, activities, trip length, special activities like trekking or scuba) into a prioritized packing checklist. It reduces forgotten items and improves trip readiness.

Implementation details
- The AI agent (GeminiService) outputs packing suggestions as part of the generated itinerary response.
- The backend normalizes packing items into a `packingList` array on the `Trip` model. Each packing item includes:
  - `item` (string)
  - `quantity` (number)
  - `category` (e.g., clothing, electronics, documents)
  - `isPacked` (boolean)
  - `reason` (why suggested)

- Frontend UI: `PackingList` component shows items with checkboxes and category badges. Items can be toggled to mark as packed, filtered, or searched.

Creative extensions & UX benefits
- Smart suggestions: the AI suggests items prioritized by importance (passport, chargers), grouped by activity.
- Auto-adjust: counts and mix (e.g., number of socks, layers) are calculated based on trip length and weather predictions.
- Shareable packing list: export packing list with the itinerary PDF or share via email.

Engineering trade-offs
- We rely on the AI for suggestion quality (convenient but requires careful validation). The solution normalizes and sanitizes AI responses to avoid hallucinations.

## Key Design Decisions & Trade-offs

1. TypeScript strictness
   - Decision: Use `strict` TypeScript for the backend and frontend.
   - Trade-off: More upfront typing work but safer refactors and fewer runtime errors.

2. Server-side PDF generation (`html-pdf`)
   - Decision: Generate PDFs server-side so exported itineraries are consistent and can be emailed.
   - Trade-off: `html-pdf` uses a headless rendering approach that can be brittle; in the future consider Puppeteer/Playwright for more consistent output.

3. AI model selection (Gemini)
   - Decision: Use `@google/generative-ai` for its structure and safety features.
   - Trade-off: Cost and rate limits — we wrap calls with retry and caching where sensible.

4. Stateless JWT with refresh tokens
   - Decision: Keep token state stateless for scalability.
   - Trade-off: Can't forcibly invalidate tokens server-side without additional storage (token blacklist). We rely on short-lived access tokens and refresh token rotation strategies.

5. Packing List powered by AI
   - Decision: Use AI to suggest packing items for a better UX.
   - Trade-off: Must implement robust validation and allow user overrides.

## Known Limitations

- AI dependency: suggestions depend on model quality and may require human review for edge cases.
- PDF rendering: `html-pdf` may produce layout differences across environments; consider migrating to Puppeteer for production-grade PDFs.
- Token invalidation: Stateless JWTs cannot be instantly revoked unless a server-side blacklist is used.
- Email deliverability: depends on SMTP provider configuration and sometimes requires additional DNS (SPF/DKIM) setup.
- Tests: Some parts rely on integration tests (Gemini), which may be costly to run against the real API. The repo uses `mongodb-memory-server` for unit/integration tests, which is stubbed in types.

## Running Tests

```bash
# Server (in project root)
cd server
npm test

# Client
cd client
npm test
```

## Development Tips & Troubleshooting

- If type checks fail in the server, run:

```bash
cd server
npm run type-check
```

- To run the backend in development with auto-reload:

```bash
cd server
npm run dev
```

- To run the frontend dev server:

```bash
cd client
npm run dev
```

## API Endpoints (High-level)
- `POST /api/auth/register` — create user
- `POST /api/auth/login` — login & receive tokens
- `POST /api/auth/refresh` — refresh tokens
- `GET /api/trips` — list user trips
- `POST /api/trips` — create trip (triggers AI generation)
- `GET /api/trips/:id` — trip details
- `PUT /api/trips/:id` — edit trip
- `POST /api/export/:id` — export trip PDF
- `POST /api/export/:id/email` — export and email PDF
- `GET /api/shared/:token` — view shared trip (public)

## Creative Future Ideas
- Offline packing checklist export (mobile PWA) and reminder scheduling.
- Integrate weather API to adapt packing suggestions dynamically.
- Token revocation using a short-lived cache or Redis blacklist.

## Contribution & Contact
Contributions welcome — please open issues or PRs. For questions or feature requests, contact the maintainers listed in the repo.

---

Thank you for checking out TravelWave. If you want, I can also:
- Add a `README` section with screenshots or a short demo GIF,
- Add a `.env.example` file,
- Create CI workflows for tests and type checks.
