# Personal Bloomberg Terminal (BT) - Crypto

Production-ready full-stack dashboard with real-time crypto market streaming, indicator/SMC detection, and AI trading intelligence.

## Stack
- **Backend:** Node.js, Express, Socket.IO, MongoDB, Redis
- **Frontend:** React, Vite, TailwindCSS, Lightweight Charts
- **AI Layer:** OpenAI API with structured market prompt + fallback mock agent
- **Data Sources:** Binance primary, CoinGecko fallback, NewsAPI sentiment

## Project Structure

```text
/backend
  /config
  /models
  /routes
  /services
  /websocket
  server.js
/frontend
  /src
    /components
    /hooks
    /pages
    /services
```

## Features
- Live BTCUSDT + ETHUSDT streaming every 3-5s
- Binance market data + automatic CoinGecko fallback
- News sentiment enrichment via NewsAPI
- Indicator stack: SMA, EMA, RSI + SMC signals (BOS, liquidity zones, FVG, order blocks)
- WebSocket real-time updates for market and AI insights
- AI trade assistant outputting bias, entry, stop, target, and rationale
- Bloomberg-like dark dashboard with watchlist, chart, AI panel, and live logs

## Environment

### Backend `.env`
Copy `backend/.env.example` to `backend/.env` and configure keys.

### Frontend `.env`
Create `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:4000
```

## Run Locally

### 1) Install deps
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend
```bash
cd backend
npm run dev
```

### 3) Start frontend
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.


## Free Deployment (Recommended)

Use this stack for a no-cost hobby deployment:
- Backend: Render Free Web Service
- Frontend: Vercel Hobby
- Database: MongoDB Atlas M0
- Cache: Upstash Redis Free

Detailed guide: [DEPLOY_FREE.md](./DEPLOY_FREE.md)

## API Endpoints
- `GET /health`
- `GET /api/market/price?symbol=BTCUSDT`
- `GET /api/market/snapshot`
- `GET /api/market/insights`

## Real-time Event Bus (Socket.IO)
- `market:update`
- `ai:insight`

## AI Prompt Payload

```json
{
  "price": 67200,
  "trend": "bullish",
  "liquidity_zones": [66500, 66800],
  "fvg": "present_above",
  "order_blocks": "recent_demand_zone",
  "news_sentiment": "positive"
}
```

## Testing Checklist
- Verify WebSocket updates every few seconds in UI logs
- Stop Binance access and confirm CoinGecko fallback still emits data
- Run with missing `OPENAI_API_KEY` and confirm mock insights are generated

## Bonus Included
- Dark terminal theme
- Multi-asset watchlist
- Alert-ready signal log stream in the UI
