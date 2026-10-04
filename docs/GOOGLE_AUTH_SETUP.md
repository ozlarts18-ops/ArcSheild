# ArcShield — Google Identity Services (GIS) Setup Guide

This document outlines the exact configuration required in the Google Cloud Console, Render, and Vercel environments to enable Google Sign-In for ArcShield.

---

## 1. Google Cloud Console Configuration

### A. Create or Select a Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select your existing ArcShield project.

### B. Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the required application details:
   - **App name**: `ArcShield`
   - **User support email**: Your administrative or support email
   - **Developer contact information**: Your contact email
4. Scopes: ArcShield requires standard identity scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Save and proceed to the dashboard.

### C. Create OAuth 2.0 Web Client ID
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `ArcShield Production Web Client`.
5. **Authorized JavaScript origins** (CRITICAL):
   Add the following exact origins without trailing slashes:
   - `https://arc-sheild.vercel.app` *(Production Frontend)*
   - `http://localhost:5173` *(Local Vite Development)*
   - `http://localhost:3000` *(Alternative Local Development)*
6. **Authorized redirect URIs**:
   - **LEAVE EMPTY**.
   - *Note*: ArcShield implements Google Identity Services (GIS) ID-token flow. The Google popup/OneTap prompt communicates directly with GIS inside the browser window via JavaScript callbacks, eliminating the need for OAuth authorization-code redirect URIs.
7. Click **Create**.
8. Copy the generated **Client ID** (format: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
   *(Note: The client secret is NOT used by GIS and should NOT be placed in the frontend).*

---

## 2. Render Backend Environment Setup

Render hosts the ArcShield API backend (`https://arcsheild.onrender.com`).

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Select the **arcsheild** Web Service.
3. Navigate to **Environment**.
4. Add the following environment variable:
   - **Key**: `GOOGLE_CLIENT_ID`
   - **Value**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
5. Click **Save Changes**. Render will automatically redeploy the backend service with the configured audience verification.

---

## 3. Vercel Frontend Environment Setup

Vercel hosts the ArcShield SPA frontend (`https://arc-sheild.vercel.app`).

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Select the **arc-sheild** project.
3. Go to **Settings** > **Environment Variables**.
4. Add the following environment variable:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - **Environments**: Check `Production`, `Preview`, and `Development`.
5. Click **Save**.
6. Trigger a redeploy (or deploy the latest commit) on Vercel so the build includes `VITE_GOOGLE_CLIENT_ID`.

---

## 4. Verification Flow

Once both variables are saved:
1. Open [https://arc-sheild.vercel.app/login](https://arc-sheild.vercel.app/login).
2. The official Google Sign-In button will render below the login form.
3. Clicking **Continue with Google** will authenticate with Google, send the Google ID token to `POST https://arcsheild.onrender.com/api/auth/google`, establish your ArcShield JWT session, and automatically redirect to `/dashboard`.
