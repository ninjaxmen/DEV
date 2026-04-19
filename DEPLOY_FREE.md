# Deploy This Project for Free (Plain English)

If you follow these steps in order, it will work.

---

## What you are deploying

- **Backend API + websockets** → Render
- **Frontend UI** → Vercel
- **Database** → MongoDB Atlas (free)
- **Redis cache** → Upstash (free)

You will end with:
- a Render URL like `https://your-api.onrender.com`
- a Vercel URL like `https://your-app.vercel.app`

---

## Step 0) Put code on GitHub

1. Create a GitHub repo.
2. Push this project to that repo.

You need this because Render and Vercel deploy directly from GitHub.

---

## Step 1) Create free MongoDB (Atlas)

1. Go to MongoDB Atlas and create an account.
2. Create a **free M0 cluster**.
3. Create a database user (username/password).
4. In Network Access, allow access from anywhere for now (`0.0.0.0/0`).
5. Copy the connection string.

Save it as: `MONGODB_URI`

---

## Step 2) Create free Redis (Upstash)

1. Go to Upstash and create a Redis database.
2. Copy the Redis URL.

Save it as: `REDIS_URL`

---

## Step 3) Deploy backend on Render

### Simple way (Blueprint)

1. Go to Render → **New +** → **Blueprint**.
2. Connect your GitHub repo.
3. Render will detect `render.yaml` automatically.
4. Add these env vars in Render before deploy:

Required:
- `MONGODB_URI` = (from Atlas)
- `REDIS_URL` = (from Upstash)

Optional (but recommended):
- `OPENAI_API_KEY` = your OpenAI key (if omitted, app uses mock AI)
- `NEWS_API_KEY` = your NewsAPI key (if omitted, neutral fallback)

5. Click deploy.
6. Wait until service is live.

Test it:
- Open: `https://YOUR_RENDER_URL/health`
- You should see: `{"ok":true}`

---

## Step 4) Deploy frontend on Vercel

1. Go to Vercel → **Add New Project**.
2. Import the same GitHub repo.
3. Set **Root Directory** = `frontend`.
4. Add env var:

- `VITE_BACKEND_URL` = `https://YOUR_RENDER_URL`

5. Click deploy.

---

## Step 5) Connect frontend domain to backend CORS

After Vercel deploys, copy the Vercel URL and put it into Render env var:

- `FRONTEND_ORIGIN=https://YOUR_PROJECT.vercel.app`

If you also want localhost to keep working, use both:

```bash
FRONTEND_ORIGIN=http://localhost:5173,https://YOUR_PROJECT.vercel.app
```

Then click **Manual Deploy** on Render (or restart service).

---

## Step 6) Final check (important)

1. Open your Vercel app URL.
2. You should see BTC/ETH data updating every few seconds.
3. AI panel should populate:
   - real AI if `OPENAI_API_KEY` is set
   - mock AI otherwise
4. If chart stays empty, wait ~20 seconds and refresh once.

---

## If something does not work

### Problem: Frontend loads but no live data
- Check `VITE_BACKEND_URL` on Vercel is exactly your Render URL.
- Check Render service is awake (free tier can sleep).
- Check `/health` endpoint works in browser.

### Problem: CORS/socket errors in browser console
- Ensure `FRONTEND_ORIGIN` in Render exactly matches Vercel URL (including `https://`).
- If using both local and hosted, use comma-separated origins.

### Problem: AI panel empty
- That is usually missing/invalid `OPENAI_API_KEY`.
- Without a key, it should still show mock insights.

---

## Cheapest safe defaults

- Keep only BTC/ETH.
- Keep polling at 5 seconds.
- Use mock AI first.
- Add OpenAI key only after everything else works.
