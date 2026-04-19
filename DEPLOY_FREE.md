# Free Deployment Guide (Render + Vercel + MongoDB Atlas + Upstash)

This project can be deployed with a **$0/month hobby stack**:

- **Backend**: Render Free Web Service
- **Frontend**: Vercel Hobby
- **MongoDB**: Atlas M0 Free Cluster
- **Redis**: Upstash Redis Free DB

> Note: Free tiers have limits and can sleep/spin down.

## 1) Create MongoDB Atlas (free)

1. Create Atlas account.
2. Create **M0 free cluster**.
3. Add database user + password.
4. Add IP access (for quick start you can allow `0.0.0.0/0`, then tighten later).
5. Copy connection string as `MONGODB_URI`.

## 2) Create Upstash Redis (free)

1. Create Upstash Redis database.
2. Copy the `REDIS_URL` connection string.

## 3) Deploy backend to Render (free)

### Option A: Blueprint (recommended)

1. Push repo to GitHub.
2. In Render Dashboard, choose **New +** → **Blueprint**.
3. Select this repo.
4. Render will read `render.yaml`.
5. Set required env vars in Render UI:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `NEWS_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional for real AI)
6. Deploy.

### Option B: Manual service

- Build command: `npm install`
- Start command: `npm start`
- Root directory: `backend`

## 4) Deploy frontend to Vercel (free)

1. Import GitHub repo to Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env var:
   - `VITE_BACKEND_URL=https://<your-render-service>.onrender.com`
4. Deploy.

## 5) Wire CORS + socket origin

After Vercel deploy gives you a domain, add this to Render backend env var:

- `FRONTEND_ORIGIN=https://<your-vercel-project>.vercel.app`

For multiple origins, use comma-separated values, e.g.:

```bash
FRONTEND_ORIGIN=http://localhost:5173,https://my-bt.vercel.app
```

## 6) Verify

1. Backend health: `GET https://<render-url>/health`
2. Snapshot endpoint: `GET https://<render-url>/api/market/snapshot`
3. Open Vercel app and confirm watchlist/price updates.
4. Confirm AI panel shows mock or real responses.

## 7) Keep it free-friendly

- Keep poll interval at `5000ms` or slower.
- Use only BTC/ETH initially.
- Use mock AI mode if OpenAI spend is undesired.
- Add usage alerts on Atlas/Upstash/Vercel/Render dashboards.
