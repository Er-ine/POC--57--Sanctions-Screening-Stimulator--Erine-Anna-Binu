# Deployment Notes
**Project:** POC 35 - Weather-to-Supply Chain Risk Model

This document outlines how to deploy the Real Rails Intelligence Dashboard to a production environment. Since the project uses a Next.js 16 frontend and a FastAPI (Python) backend, we recommend deploying them as two separate services.

---

## 1. Frontend Deployment (Vercel)
Vercel is the creator of Next.js and provides the easiest, zero-configuration deployment for the frontend.

1. Create a free account at [Vercel.com](https://vercel.com)
2. Connect your GitHub repository.
3. Select the `frontend` directory as your **Root Directory**.
4. The Build Settings will auto-detect Next.js:
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`
5. Click **Deploy**.

*Note: Once your backend is deployed (see below), you will need to update the `fetch()` URLs in the Next.js components to point to the live backend URL instead of `http://localhost:8000`.*

---

## 2. Backend Deployment (Render or Railway)
FastAPI is lightweight and deploys perfectly on platforms like Render or Railway.

### Option A: Render.com (Recommended Free Tier)
1. Create a free account at [Render.com](https://render.com)
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt` (Make sure to run `pip freeze > requirements.txt` locally if you haven't yet).
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.

### CORS Configuration
Once your frontend is live on Vercel, you must update the `CORSMiddleware` in `backend/main.py` to allow the Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-vercel-app-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 3. The "Mock Fallback" Advantage
Because this project utilizes the Real Rails "Mock Fallback" pattern (`mock_data.json`), it does not require a live database (PostgreSQL, MongoDB) to function in production. The entire intelligence demonstration will run smoothly and securely off the static memory footprint of the FastAPI server.
