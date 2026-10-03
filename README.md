# ARCShield — SMART CONNECTED SAFETY GEAR
## Industrial Supervisor Safety Console & Edge Telemetry Platform (MERN Stack)

**ArcShield** is a production-grade, **Light-Themed Web Application** engineered for workshop supervisors, trainers, safety administrators, and workshop managers in electrical and welding industrial training environments (ITIs).

The platform ingests real-time safety telemetry from connected smart PPE helmets (incorporating MAX6675 thermocouple, DHT22 ambient temperature/humidity, GUVA-S12SD UV/arc optical sensors, MQ-series combustible/toxic gas detectors, MPU6050 6-DOF IMU, TCRT5000 optical head-presence sensors, and NEO-6M GPS modules) and provides dual-tier web interfaces:
1. **Personal Safety Dashboard (`/dashboard`)**: Strictly isolated personal safety telemetry, helmet fitment metrics, exposure analytics, personal alerts, and PDF/CSV compliance exports for the authenticated worker.
2. **Admin Supervisor Console (`/admin/*`)**: Workshop-wide fleet management, multi-helmet matrix, active hazard dispatching, incident/near-miss reporting, 27-metric analytical breakdowns, and live operational security telemetry.

---

## 🏗️ Architecture & Production Topology

```text
┌─────────────────────────────────────────────────────────┐
│              VERCEL (React 19 + Vite Frontend)          │
│  - SPA Routing & Strict Client Security Headers         │
│  - Clean Light Industrial Theme (No Gimmicks)           │
│  - Dynamic API Service Adapter (VITE_API_URL)          │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS / WSS
                             ▼
┌─────────────────────────────────────────────────────────┐
│               RENDER (Node.js + Express API)            │
│  - Helmet HTTP Security Headers & Content Security Policy│
│  - Distributed Rate Limiting & Brute-Force Throttling   │
│  - Cryptographic Auth (Argon2/bcrypt + Signed JWTs)    │
│  - Strict Role-Based Access Control (USER vs ADMIN)     │
│  - NoSQL Injection Sanitization & Zod Schema Validation │
│  - Isolated Socket.IO Rooms (user:${id}, admin:monitor) │
│  - Security Event Audit Logging & Health Telemetry      │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│        MONGODB ATLAS         │ │            REDIS             │
│   (Persistent Safety Data)   │ │  (Temporary State & Cache)   │
│  - TLS/SSL ReplicaSet        │ │  - Brute-Force Lockouts      │
│  - User & Helmet Registry    │ │  - Distributed Rate Limits   │
│  - Incident & Alert Logs     │ │  - Revoked Token Blacklist   │
│  - Auditable Security Events │ │  - Fast Session Invalidation │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🔒 Production Security Controls Implemented

1. **Authentication & Session Hardening**:
   - High-entropy JWT signing for access tokens (`JWT_SECRET`) and refresh tokens (`JWT_REFRESH_SECRET`).
   - Token blacklisting and session invalidation via Redis store.
   - Generic login failure responses (`"Unable to authenticate with the provided credentials."`) to prevent account/email enumeration.

2. **Login Brute-Force & Credential Stuffing Protection**:
   - Redis-backed progressive throttling tracked across combined IP and normalized account identifier.
   - 5 failed attempts locks out authentication for 15 minutes.

3. **Strict Authorization & Role-Based Access Control (RBAC)**:
   - Route protection enforced on Express middleware (`authenticateJwt`, `requireAdmin`, `requireOwnership`).
   - All `/api/my/*` endpoints strictly derive worker identity and assigned helmet from the verified JWT payload (`req.user.id`).
   - Normal users are prevented from querying or altering other workers' safety records.
   - All `/api/admin/*` endpoints reject non-admin users with `403 Forbidden`.

4. **Input Validation & Sanitization**:
   - All API parameters, request bodies, telemetry packets, and alert lifecycle transitions validated using **Zod** schemas.
   - Express NoSQL injection sanitization strips recursive MongoDB query operators (`$`, `{ $gt: ... }`) from untrusted inputs.

5. **API Rate Limiting**:
   - General API endpoints: 100 requests per 15 minutes.
   - Authentication routes (`/api/auth/*`): 10 requests per 15 minutes.
   - Telemetry ingestion routes: 120 packets per minute per device.
   - Report generation routes: 20 requests per 15 minutes.

6. **Socket.IO Room Isolation**:
   - Worker clients are restricted to their dedicated user room (`user:${userId}`) and helmet room (`helmet:${helmetId}`).
   - Organization-wide fleet monitoring broadcasts are isolated to the authenticated `admin:monitoring` room.

7. **Audit & Security Logging**:
   - Real-time logging of authentication successes/failures, RBAC violations, alert state transitions, and incident reports into MongoDB `SecurityEvent` collection.

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`server/.env` / Render Dashboard)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web service listening port | `5000` |
| `MONGODB_URI` | MongoDB Atlas TLS connection string | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/arcshield?retryWrites=true&w=majority` |
| `MONGODB_DB_NAME` | Database name | `arcshield` |
| `REDIS_URL` | Redis connection URI | `rediss://default:<password>@<redis-host>:6379` |
| `JWT_SECRET` | Cryptographic secret for Access Tokens | *(Generate with `openssl rand -base64 48`)* |
| `JWT_REFRESH_SECRET` | Cryptographic secret for Refresh Tokens | *(Generate with `openssl rand -base64 48`)* |
| `JWT_EXPIRES_IN` | Access token lifespan | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://arcshield.vercel.app` |
| `RATE_LIMIT_MAX_REQUESTS` | Global API rate limit max requests | `100` |
| `AUTH_RATE_LIMIT_MAX` | Auth endpoints rate limit max requests | `10` |

### Frontend Environment Variables (`client/.env` / Vercel Dashboard)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Production Render backend API URL | `https://arcshield-api.onrender.com` |
| `VITE_SOCKET_URL` | Production Socket.IO backend URL | `https://arcshield-api.onrender.com` |

> **⚠️ SECURITY RULE**: Never put database credentials, Redis URLs, or JWT secrets in client environment variables.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- *(Optional)* Local MongoDB & Redis, or use cloud connection strings.

### 2. Backend Installation & Start
```bash
cd server
npm install
cp .env.example .env
# Edit .env if connecting to live Atlas/Redis instances
npm run dev
# Server listening on http://localhost:5000
```

### 3. Frontend Installation & Start
```bash
cd client
npm install
cp .env.example .env
npm run dev -- --port 3000
# React App available at http://localhost:3000
```

---

## 🚢 Production Deployment Guide

### A. Deploy Backend to Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the repository: `https://github.com/ozlarts18-ops/ArcSheild.git`.
3. Configure Service Settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables in the Render Dashboard:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(Your MongoDB Atlas connection URI)*
   - `REDIS_URL` = *(Your Redis instance URI)*
   - `JWT_SECRET` = *(Secure random string)*
   - `JWT_REFRESH_SECRET` = *(Secure random string)*
   - `CLIENT_URL` = `https://<your-vercel-app>.vercel.app`
5. Click **Deploy**. Note your Render URL (e.g., `https://arcshield-api.onrender.com`).

### B. Deploy Frontend to Vercel

1. Create a new Project on [Vercel](https://vercel.com).
2. Import the GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable in Vercel:
   - `VITE_API_URL` = `https://arcshield-api.onrender.com`
   - `VITE_SOCKET_URL` = `https://arcshield-api.onrender.com`
5. Click **Deploy**.

---

## 🧪 Security & Quality Verification

Run local test suites to verify auth, RBAC, input sanitization, and production builds:

```bash
# Test Frontend Production Build
cd client
npm run build

# Verify Backend API & RBAC
cd ../server
node src/server.js
```
