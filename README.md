# AutoServe — MERN Learning Project (Beginner-Friendly)

AutoServe is a step-by-step **learning project** that builds a real MERN web app while teaching you fundamentals like Node/Express, REST APIs, MongoDB/Mongoose, React (Vite), CORS, environment variables, and basic software hygiene (error handling, structure, and testing later).

> **Current Status**
> - **API (Express, CommonJS)** running with:
>   - `GET /api/health`, `POST /api/echo` (JSON body), centralized error handling & 404s
>   - CORS configured for React dev origin
>   - MongoDB connected via **Mongoose**
>   - `Service` model and `GET /api/services` (reads real data)
> - **Client (React + Vite)** running at `5173`, calling `GET /api/health`
> - **MongoDB** installed locally and seeded via `mongosh` (or optional dev seeder)

---

## Table of Contents

1. [Project Goals](#project-goals)
2. [Stack & Key Concepts](#stack--key-concepts)
3. [Monorepo Structure](#monorepo-structure)
4. [Prerequisites (macOS)](#prerequisites-macos)
5. [Quick Start (Two Terminals)](#quick-start-two-terminals)
6. [Environment Variables](#environment-variables)
7. [API Reference (Current)](#api-reference-current)
8. [Data Model (Mongoose)](#data-model-mongoose)
9. [Seeding Data](#seeding-data)
10. [CORS in Dev (Why & How)](#cors-in-dev-why--how)
11. [Learning Roadmap](#learning-roadmap)
12. [Common Scripts](#common-scripts)
13. [Troubleshooting](#troubleshooting)
14. [Glossary (Beginner Quick Ref)](#glossary-beginner-quick-ref)
15. [License / Notes](#license--notes)

---

## Project Goals

- Learn **by doing**, in **tiny steps** with visible checkpoints.
- Build a realistic MERN app with clean structure:
  - **API:** Node + Express, JSON routes, error handling, CORS
  - **DB:** MongoDB with Mongoose schemas & validation
  - **Client:** React (Vite) that calls the API and renders data
- Keep secrets/config in **env files**, not code.
- Keep code beginner-friendly and **explainable**.

---

## Stack & Key Concepts

**MERN**:
- **MongoDB** – NoSQL database storing JSON-like **documents**.
- **Express** – Minimal web framework on Node for building **REST APIs**.
- **React** – UI library for building **components** and handling state in the browser.
- **Node.js** – Runs JavaScript outside the browser (server & tooling).

**Dev Tools**:
- **Vite** – Fast dev server & bundler for React.
- **Mongoose** – Adds schemas/validation to MongoDB.
- **Postman** – Test your APIs without a browser.
- **dotenv** – Loads environment variables from `.env`.

---

## Monorepo Structure

```
autoserv/
  client/                   # React (Vite)
    src/
      lib/api.js           # small fetch helper (GET/POST later)
      App.jsx              # calls /api/health and renders status
    .env                   # VITE_ variables (ignored by git)

  server/                   # Express API (CommonJS)
    src/
      models/Service.js    # Mongoose schema for services
      index.js             # Express app: CORS, routes, error handling, DB connect
    .env                   # server config (ignored by git)

  .gitignore               # ignores env files, node_modules, build output, logs
  README.md                # this file
```

---

## Prerequisites (macOS)

- **Node.js** LTS (v18+ recommended) + **npm**
- **Git**
- **MongoDB Community**:  
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community@7.0
  brew services start mongodb-community@7.0
  ```
  Verify: `lsof -nP -iTCP:27017 -sTCP:LISTEN` (should show `mongod`)
- **Postman** (optional but recommended)

---

## Quick Start (Two Terminals)

> Replace paths/ports only if you changed them.

### 1) Backend (API) — Terminal A

```bash
cd server
npm install

# Create server/.env (keep this out of git)
cat > .env <<'EOF'
PORT=5050
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/autoserve
# JWT_SECRET=dev-only-change-me (will be used in the Auth module later)
EOF

npm start
# Expect logs:
# ✔ MongoDB connected
# API running on http://localhost:5050
```

### 2) Frontend (React) — Terminal B

```bash
cd client
npm install

# Create client/.env (Vite variables must start with VITE_)
cat > .env <<'EOF'
VITE_API_URL=http://localhost:5050
EOF

npm run dev
# Open http://localhost:5173
```

**You should see:** React page with “Server health: OK” (after Lesson 11 integration).

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=5050
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/autoserve
# JWT_SECRET=dev-only-change-me
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5050
```

> **Important:** Vite only exposes variables that start with **`VITE_`** to the browser.

---

## API Reference (Current)

Base URL in dev: `http://localhost:5050`

### Health
**GET** `/api/health` → `200 OK`
```json
{ "status": "OK", "time": "2025-10-..." }
```

### Echo (learn JSON body + headers)
**POST** `/api/echo`  
Headers: `Content-Type: application/json`  
Body:
```json
{ "name": "Ansar", "role": "learner" }
```
Response: `201 Created`
```json
{
  "received": { "name": "Ansar", "role": "learner" },
  "serverTime": "2025-10-..."
}
```
If missing `Content-Type` or body is empty → `400 { "message": "Empty JSON body" }`.

### Services
**GET** `/api/services` → `200 OK`  
Returns **active** services from MongoDB (A→Z by name). Example:
```json
[
  {
    "name": "Brake Inspection",
    "description": "Pads/rotors visual check",
    "basePrice": 29.99,
    "durationMins": 30,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "...",
    "id": "652e..."
  },
  {
    "name": "Oil Change",
    "description": "Engine oil & filter replacement",
    "basePrice": 49.99,
    "durationMins": 45,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "...",
    "id": "652d..."
  }
]
```

### Error/Not Found
- Unknown routes → `404 { "message": "Not Found" }`
- Server errors → `500 { "message": "..." }` (centralized error handler)

---

## Data Model (Mongoose)

**File:** `server/src/models/Service.js`

```js
{
  name:         String (required, trimmed),
  description:  String (optional, default ""),
  basePrice:    Number (required, >= 0),
  durationMins: Number (required, 1..480),
  isActive:     Boolean (default true),
  createdAt:    Date (auto),
  updatedAt:    Date (auto)
}
```

- `timestamps: true` auto-adds `createdAt` & `updatedAt`
- Transform converts `_id` → `id` and hides `__v` in JSON
- Reads use `.find({ isActive: true }).sort({ name: 1 }).lean()` for fast, clean objects

---

## Seeding Data

### Option A — Using `mongosh` (recommended for learning)
```bash
mongosh
use autoserve
db.services.insertMany([
  { name: "Oil Change",   description: "Engine oil & filter",     basePrice: 49.99, durationMins: 45, isActive: true, createdAt: new Date() },
  { name: "Brake Inspection", description: "Pads/rotors check",   basePrice: 29.99, durationMins: 30, isActive: true, createdAt: new Date() },
  { name: "AC Check",     description: "Cooling performance",     basePrice: 24.99, durationMins: 20, isActive: true, createdAt: new Date() }
])
db.services.find().pretty()
exit
```

### Option B — Dev-only seed route (remove before sharing)
Add to `server/src/index.js`:
```js
app.post("/api/dev/seed-services", async (req, res, next) => {
  try {
    const Service = require("./models/Service");
    await Service.deleteMany({});
    const docs = await Service.insertMany([
      { name: "Oil Change", description: "Engine oil & filter", basePrice: 49.99, durationMins: 45, isActive: true },
      { name: "Brake Inspection", description: "Pads/rotors check", basePrice: 29.99, durationMins: 30, isActive: true },
      { name: "AC Check", description: "Cooling performance", basePrice: 24.99, durationMins: 20, isActive: true }
    ]);
    res.status(201).json({ inserted: docs.length });
  } catch (err) { next(err); }
});
```

---

## CORS in Dev (Why & How)

- React dev runs at `http://localhost:5173`
- API runs at `http://localhost:5050`
- Different **origins** → the browser blocks by default (Same-Origin Policy)
- Server opts-in via **CORS**:

```js
const cors = require("cors");
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
```

> **Postman** ignores CORS (not a browser), so Postman requests will work even if CORS is misconfigured.

---

## Learning Roadmap

- ✅ **Module 2**: Express basics (routes, JSON, errors), CORS
- ✅ **Module 3**: React + Vite basics, env vars, fetch `/api/health`
- ✅ **Module 4**: MongoDB install + Mongoose, `Service` model, `GET /api/services`
- ⏭ **Next**:
  - Render services in React (list/detail)
  - Add **Auth** (register/login with bcrypt, JWT, `GET /api/me`)
  - **Bookings** MVP (`POST /api/bookings`, `GET /api/bookings?me=true`)
  - Quality: ESLint + Prettier, basic tests (Jest/Supertest & RTL), GitHub Actions (CI)
  - Docs polish: screenshots, seed scripts, single root dev command

---

## Common Scripts

### Server
```bash
npm start               # start API (reads server/.env)
# (optional during dev)
npm i -D nodemon
npx nodemon src/index.js
```

### Client
```bash
npm run dev             # Vite dev server (5173)
npm run build           # production build to /dist
npm run preview         # serve built /dist locally
```

---

## Troubleshooting

- **API prints “running” but browser can’t connect**
  - Check port conflicts: `lsof -nP -iTCP:5050 -sTCP:LISTEN`
  - Change `PORT` in `server/.env` (e.g., 5051) and restart
- **`GET /api/health` works in Postman but not from React**
  - Likely CORS or wrong `VITE_API_URL`
  - Ensure `client/.env` has correct URL **and** restart `npm run dev`
- **`POST /api/echo` returns `400`**
  - Add header: `Content-Type: application/json`
  - Ensure you’re sending valid JSON
- **Mongo connect fails**
  - Start service: `brew services start mongodb-community@7.0`
  - Verify URI and DB name in `server/.env`
- **`VITE_API_URL` shows blank/undefined**
  - File must be `client/.env`, variable must start with `VITE_`
  - You must restart Vite after changing env files

---

## Glossary (Beginner Quick Ref)

- **Route**: An HTTP method + path handled by the server (e.g., `GET /api/health`).
- **Middleware**: Functions that run in order for each request (e.g., CORS, JSON parser).
- **CORS**: Server-side permission for the browser to call cross-origin APIs.
- **Environment Variable**: Config (like ports/URLs/secrets) provided outside the code (via `.env` or system).
- **Schema (Mongoose)**: A blueprint for your documents (types, required fields, validation).
- **Lean Query**: `lean()` returns plain JS objects (faster, no Mongoose document methods).
- **HMR**: Hot Module Reload—Vite updates the browser instantly on save.

---

## License / Notes

- This repository is for **learning**. Some dev conveniences (e.g., `/api/dev/seed-services`) should be removed or guarded before sharing publicly.
- Backend currently uses **CommonJS**; we may switch to **ESM** later for modern `import` syntax.
- Never commit `.env` files or secrets. `.gitignore` is configured to protect them.

---
