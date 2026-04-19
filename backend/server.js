import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectMongo } from './config/db.js';
import { createRedisClient } from './config/redis.js';
import { buildIndicators } from './services/indicatorService.js';
import { MarketDataService } from './services/marketDataService.js';
import { NewsService } from './services/newsService.js';
import { AiAgentService } from './services/aiAgentService.js';
import { createSocketServer } from './websocket/socketServer.js';
import { buildMarketRoutes } from './routes/marketRoutes.js';
import { MarketSnapshot } from './models/MarketSnapshot.js';
import { AiInsightLog } from './models/AiInsightLog.js';

const app = express();
const server = http.createServer(app);

const port = Number(process.env.PORT || 4000);
const pollIntervalMs = Number(process.env.MARKET_POLL_INTERVAL_MS || 5000);
const aiIntervalMs = Number(process.env.AI_INTERVAL_MS || 20000);

const state = {
  latestBySymbol: new Map(),
  latestInsights: new Map(),
  updatedAt: null,
  insightUpdatedAt: null
};

const marketDataService = new MarketDataService({
  binanceBaseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com',
  coingeckoBaseUrl: process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3'
});

const newsService = new NewsService({
  newsApiUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2/everything',
  apiKey: process.env.NEWS_API_KEY
});

const aiAgentService = new AiAgentService({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
});

const redis = createRedisClient(process.env.REDIS_URL);
if (redis) redis.connect().catch((error) => console.error('Redis connect failed:', error.message));

connectMongo(process.env.MONGODB_URI);

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(express.json());
app.use('/api/market', buildMarketRoutes(state));
app.get('/health', (_req, res) => res.json({ ok: true }));

const io = createSocketServer(server, allowedOrigins.includes('*') ? '*' : allowedOrigins);

async function cacheLatest(symbol, payload) {
  if (!redis) return;
  try {
    await redis.set(`bt:latest:${symbol}`, JSON.stringify(payload), 'EX', 90);
  } catch (error) {
    console.error('Redis set failed:', error.message);
  }
}

async function runMarketCycle() {
  try {
    const assets = await marketDataService.fetchBatch(['BTCUSDT', 'ETHUSDT']);
    const sentiment = await newsService.getMarketSentiment();

    for (const asset of assets) {
      const indicators = buildIndicators(asset.candles);
      const normalized = {
        symbol: asset.symbol,
        source: asset.source,
        price: asset.price,
        volume24h: asset.volume24h,
        ohlc: asset.ohlc,
        candles: asset.candles,
        indicators,
        smc: {
          trend: indicators.trend,
          bos: indicators.bos,
          liquidityZones: indicators.liquidityZones,
          fvg: indicators.fvg,
          orderBlocks: indicators.orderBlocks
        },
        newsSentiment: sentiment.sentiment,
        headlines: sentiment.headlines,
        timestamp: new Date().toISOString()
      };

      state.latestBySymbol.set(asset.symbol, normalized);
      await cacheLatest(asset.symbol, normalized);
      io.emit('market:update', normalized);

      await MarketSnapshot.create({
        symbol: normalized.symbol,
        source: normalized.source,
        price: normalized.price,
        volume24h: normalized.volume24h,
        ohlc: normalized.ohlc,
        indicators: normalized.indicators,
        smc: normalized.smc,
        newsSentiment: normalized.newsSentiment
      }).catch(() => null);
    }

    state.updatedAt = new Date().toISOString();
  } catch (error) {
    console.error('Market cycle failed:', error.message);
  }
}

async function runAiCycle() {
  try {
    for (const [symbol, market] of state.latestBySymbol.entries()) {
      const payload = {
        price: market.price,
        trend: market.smc.trend,
        liquidity_zones: market.smc.liquidityZones,
        fvg: market.smc.fvg,
        order_blocks: market.smc.orderBlocks,
        news_sentiment: market.newsSentiment
      };

      const insight = await aiAgentService.getInsight(payload);
      const enriched = {
        symbol,
        ...insight,
        generatedAt: new Date().toISOString()
      };

      state.latestInsights.set(symbol, enriched);
      io.emit('ai:insight', enriched);

      await AiInsightLog.create({
        symbol,
        bias: enriched.bias,
        entryZone: enriched.entryZone,
        stopLoss: enriched.stopLoss,
        target: enriched.target,
        explanation: enriched.explanation,
        model: enriched.model,
        raw: enriched
      }).catch(() => null);
    }

    state.insightUpdatedAt = new Date().toISOString();
  } catch (error) {
    console.error('AI cycle failed:', error.message);
  }
}

server.listen(port, () => {
  console.info(`Backend listening on http://localhost:${port}`);
  runMarketCycle();
  runAiCycle();
  setInterval(runMarketCycle, pollIntervalMs);
  setInterval(runAiCycle, aiIntervalMs);
});
