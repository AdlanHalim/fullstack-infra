# Deployment Guide

This guide will help you publish your Fullstack Resume Matcher application online.
We will use **Render** for the Backend (Python/Flask) and **Vercel** for the Frontend (React).

## Prerequisites

1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Render Account**: [Sign up here](https://render.com/).
3.  **Vercel Account**: [Sign up here](https://vercel.com/).

---

## Part 1: Prepare your Code (Already Done by Me)

I have already added the necessary files to your backend:
*   `requirements.txt`: Lists all Python libraries needed.
*   `Procfile`: Tells the server how to start your app (`gunicorn app:app`).

**Action Required**:
1.  Commit and push these changes to your GitHub repository.
    ```bash
    git add .
    git commit -m "Prepare for deployment"
    git push origin main
    ```

---

## Part 2: Deploy Backend (Render)

1.  **Create New Web Service**:
    *   Go to your [Render Dashboard](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Service**:
    *   **Name**: `resume-matcher-backend` (or similar)
    *   **Region**: Choose one close to you (e.g., Singapore).
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (IMPORTANT: set this because your app is in a subfolder).
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
    *   **Plan**: Free

3.  **Environment Variables**:
    *   Scroll down to **Environment Variables** and add the following:
        *   `SECRET_KEY`: (Generate a random string)
        *   `JWT_SECRET_KEY`: (Generate a random string)
        *   `DB_URI_MAIN`: `sqlite:///instance/main.db` (See Note below)
        *   `DB_URI_PII`: `sqlite:///instance/pii.db` (See Note below)
    
    > **Note on Database**: Using `sqlite:///...` on Render's free tier means your **database will reset** every time the server restarts (about every 15 mins of inactivity). For a permanent database, you would need to set up a Render PostgreSQL database, but that is more complex. For a quick demo, SQLite is fine.

4.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for the deployment to finish. You will get a URL like `https://resume-matcher-backend.onrender.com`. **Copy this URL.**

---

## Part 3: Deploy Frontend (Vercel)

1.  **Import Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.

2.  **Configure Project**:
    *   **Framework Preset**: Create React App (should be auto-detected).
    *   **Root Directory**: Click `Edit` and select `frontend/resume-matcher-frontend`.

3.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add:
        *   `REACT_APP_BACKEND_URL`: Paste your Render Backend URL (e.g., `https://resume-matcher-backend.onrender.com`)
        *   **IMPORTANT**: Remove any trailing slash `/` from the URL.

4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to complete. You will get a domain like `https://resume-matcher-frontend.vercel.app`.

---

## Part 4: Final Check

1.  Open your Vercel URL.
2.  Try to register/login.
3.  Upload a resume.
4.  If you get errors, check the **Logs** in Render or Vercel dashboards.

### Troubleshooting
*   **CORS Error**: If the frontend can't talk to the backend, ensure your Flask app allows the Vercel domain. Currently, `CORS(app)` in `app.py` allows all domains, so it should work fine.

---

## Alternative: Deploy Frontend (Netlify)

If you prefer **Netlify**, use these settings:

1.  **Import Project**: Connect GitHub and select your repo.
2.  **Build Settings**:
    *   **Base directory**: `frontend/resume-matcher-frontend`
    *   **Build command**: `CI=false npm run build`
    *   **Publish directory**: `build`
3.  **Environment Variables**:
    *   Go to **Site configuration** > **Environment variables**.
    *   Add `REACT_APP_BACKEND_URL` with your Render URL.
