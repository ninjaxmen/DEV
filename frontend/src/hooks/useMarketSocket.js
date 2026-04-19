import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchSnapshot, fetchInsights } from '../services/api';

export function useMarketSocket() {
  const [assets, setAssets] = useState({});
  const [insights, setInsights] = useState({});
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    fetchSnapshot().then((data) => {
      const map = Object.fromEntries(data.assets.map((asset) => [asset.symbol, asset]));
      setAssets(map);
    });

    fetchInsights().then((data) => {
      const map = Object.fromEntries(data.insights.map((insight) => [insight.symbol, insight]));
      setInsights(map);
    });

    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000');

    socket.on('market:update', (payload) => {
      setAssets((prev) => ({ ...prev, [payload.symbol]: payload }));
      setSignals((prev) => [
        `${new Date().toLocaleTimeString()} ${payload.symbol} ${payload.price.toFixed(2)} trend=${payload.smc.trend}`,
        ...prev.slice(0, 39)
      ]);
    });

    socket.on('ai:insight', (payload) => {
      setInsights((prev) => ({ ...prev, [payload.symbol]: payload }));
      setSignals((prev) => [
        `${new Date().toLocaleTimeString()} ${payload.symbol} AI=${payload.bias} target=${payload.target}`,
        ...prev.slice(0, 39)
      ]);
    });

    return () => socket.disconnect();
  }, []);

  const watchlist = useMemo(() => Object.values(assets), [assets]);

  return { watchlist, assets, insights, signals };
}
