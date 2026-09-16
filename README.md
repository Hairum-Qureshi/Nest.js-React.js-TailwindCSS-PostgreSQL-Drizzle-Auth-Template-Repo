# NestJS + React + Vite + Tailwind + Turbo (with Google Auth)

This repository is a **full-stack monorepo template** using **npm workspaces** and **Turborepo** to manage a React frontend and a NestJS backend in a single repository.

It is based on a minimal monorepo foundation, with **Google OAuth authentication pre-wired using Google Cloud OAuth credentials** so you don't have to build authentication plumbing from scratch.

This is a **template**, not a production-ready system.

---

## What This Template Is

This template provides:

- A correct, minimal **monorepo setup**
- Clear separation of frontend and backend concerns
- Centralized dependency management
- Coordinated development scripts
- **Google OAuth authentication across the frontend and backend**
- JWT-based authentication for authenticated backend requests- A shared `@repo/shared-types` package so the frontend and backend consume the same TypeScript types instead of duplicating them Authentication is included, but only to the extent required to:

- Sign users in with Google on the frontend
- Send the Google authentication credential to the backend
- Verify the Google identity on the backend
- Establish an authenticated session using a backend-issued JWT

Everything else remains intentionally unopinionated.

---

## What This Template Is _Not_

This template does **not** try to be a full application starter.

It does **not** include:

- User roles or permissions
- Auth-based authorization rules
- API clients
- Deployment, Docker, or CI/CD
- Production session-management infrastructure

Those decisions are left to the user.

---

## Repository Structure

```text
.
├── apps/
│   ├── backend/          # NestJS backend (Google OAuth + JWT + MongoDB)
│   └── frontend/         # React + Vite + Tailwind (Google OAuth)
├── packages/
│   └── shared-types/     # @repo/shared-types - types shared by the frontend and backend
│       └── src/
│           ├── types/    # Domain types (e.g. UserPayload, AuthRequest)
│           └── hooks/    # Hook return/prop types (e.g. UseGoogleAuthHook)
├── package.json          # Root workspace + Turbo configuration
├── package-lock.json     # Single lockfile for the entire monorepo
├── turbo.json            # Turbo task pipeline
└── README.md
```

### Key Structural Notes

- This **is a monorepo**
- Dependency management is centralized at the **root**
- Each app remains a **standalone project**
- Shared TypeScript types live in `packages/shared-types` and are consumed via `@repo/shared-types` — apps do not define their own duplicate `types.ts`/`interfaces.ts` files
- New shared types should be added under `packages/shared-types/src`, organized into subfolders by kind (e.g. `types/` for domain types, `hooks/` for hook return/prop types, `props/` for component prop types) and re-exported from `packages/shared-types/src/index.ts`

---

## Tech Stack

### Backend (`apps/backend`)

- NestJS
- TypeScript
- Google OAuth
- JWT-based session tokens
- MongoDB

### Frontend (`apps/frontend`)

- React
- Vite
- TailwindCSS
- TypeScript
- Google OAuth

### Shared (`packages/shared-types`)

- TypeScript types shared between the frontend and backend, consumed as `@repo/shared-types`

### Tooling

- npm workspaces
- Turborepo

---

## Prerequisites

You need:

- Node.js (LTS recommended)
- npm (v7+ for workspaces)
- A Google Cloud project
- Google OAuth credentials

---

## Installation

From the **repository root**:

```bash
npm install
```

This installs dependencies for **all workspace packages** and generates a **single `package-lock.json`**.

Do not run `npm install` inside individual apps.

---

## Google OAuth Setup

Google authentication uses **OAuth 2.0 credentials from Google Cloud Console**.

Firebase is **not required** for authentication in this template.

### 1. Create or Select a Google Cloud Project

Open the [Google Cloud Console](https://console.cloud.google.com/) and create a new project or select an existing one.

---

### 2. Configure the OAuth Consent Screen

In Google Cloud Console:

1. Open **Google Auth Platform** / **OAuth consent screen**
2. Configure the application information
3. Select the appropriate audience for your application
4. Add the scopes required by the application

For basic Google sign-in, the application generally needs access to the user's basic profile and email information.

If the application is in testing mode, make sure the Google accounts you intend to use are configured as test users.

---

### 3. Create OAuth Client Credentials

In Google Cloud Console, go to:

**Google Auth Platform → Clients**

Create an **OAuth 2.0 Client ID**.

For a browser-based React application, configure a **Web application** client.

Add the frontend origin used during local development to the authorized JavaScript origins:

```text
http://localhost:5173
```

If your application is deployed later, add the appropriate production origin as well.

> The exact Google Cloud Console navigation may change over time, but the credentials you need are an OAuth 2.0 **Client ID** and **Client Secret** for a web application.

---

### 4. Copy the OAuth Credentials

After creating the OAuth client, Google provides:

- **Client ID**
- **Client Secret**

The **Client ID** is used by both the frontend and backend.

The **Client Secret is backend-only** and must never be exposed to the frontend.

The frontend uses:

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
```

The backend uses:

```env
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret_here
```

---

## Environment Variables

The repository includes example environment files for both applications:

```text
apps/
├── backend/
│   └── .env.example
└── frontend/
    └── .env.example
```

These files are the **source of truth for the environment variables required by each application**.

Copy each example file to `.env` before starting the application.

### Backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

The backend example file contains configuration for:

- JWT authentication
- NestJS
- MongoDB
- Google OAuth
- Frontend CORS configuration

In particular, Google OAuth requires:

```env
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret_here
```

### Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

The frontend example file contains the backend URL and Google OAuth client ID:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
```

Because Vite exposes variables prefixed with `VITE_` to browser code, **never put the Google OAuth client secret in the frontend `.env` file**.

---

## MongoDB Setup

The backend requires a MongoDB connection string through:

```env
MONGO_URI=mongodb_connection_string
```

This can be:

- A local MongoDB instance:

```text
mongodb://localhost:27017/your-db-name
```

- Or a hosted MongoDB provider such as MongoDB Atlas.

If `MONGO_URI` is missing or invalid, the backend will fail during startup.

---

## Development

Run all development servers concurrently:

```bash
npm run dev
```

This uses Turbo to:

- Start the NestJS backend
- Start the Vite frontend
- Stream logs with app prefixes

### Default Ports

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Make sure the frontend URL matches the URL configured in:

```env
FRONTEND_URL=http://localhost:5173
```

and the Google OAuth client's authorized JavaScript origins.

---

## Authentication Flow

The authentication flow is intentionally simple:

```text
┌─────────────┐
│   Browser   │
│ React/Vite  │
└──────┬──────┘
       │
       │ 1. Sign in with Google
       ▼
┌─────────────────┐
│  Google OAuth   │
└────────┬────────┘
         │
         │ 2. Google credential
         ▼
┌─────────────────┐
│ NestJS Backend  │
│                 │
│ Verify Google   │
│ identity        │
└────────┬────────┘
         │
         │ 3. Backend-issued JWT
         ▼
┌─────────────────┐
│ Authenticated   │
│ API requests    │
└─────────────────┘
```

Google is responsible for authenticating the user.

The backend is responsible for:

- Verifying the Google authentication credential
- Establishing trust in the authenticated Google account
- Issuing the application's JWT
- Authenticating subsequent API requests

This keeps the frontend and backend independently deployable while still providing a clear authentication boundary.

---

### Do not commit `.env` files

The repository should contain the example files:

```text
.env.example
```

but local secrets should live in:

```text
.env
```

Make sure your `.gitignore` excludes local environment files.

### OAuth Client ID vs Client Secret

The Google OAuth **Client ID is not considered a secret** and is expected to be used by the browser.

The **Client Secret is confidential** and should only be available to the backend.

---

## App Independence

Even with authentication included:

- Frontend and backend are **not tightly coupled**
- They can be deployed independently
- No shared packages are required
- API communication is explicit

Authentication establishes **trust**, not architectural dependency.
