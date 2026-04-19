import { Router } from 'express';

export function buildMarketRoutes(state) {
  const router = Router();

  router.get('/price', async (req, res) => {
    const symbol = req.query.symbol || 'BTCUSDT';
    const latest = state.latestBySymbol.get(symbol);

    if (!latest) {
      return res.status(404).json({ message: `No market data for ${symbol}` });
    }

    return res.json(latest);
  });

  router.get('/snapshot', async (_req, res) => {
    return res.json({
      assets: [...state.latestBySymbol.values()],
      updatedAt: state.updatedAt
    });
  });

  router.get('/insights', async (_req, res) => {
    return res.json({
      insights: [...state.latestInsights.values()],
      updatedAt: state.insightUpdatedAt
    });
  });

  return router;
}
