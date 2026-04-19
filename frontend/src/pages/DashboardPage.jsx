import { useMemo, useState } from 'react';
import { useMarketSocket } from '../hooks/useMarketSocket';
import WatchlistPanel from '../components/WatchlistPanel';
import ChartContainer from '../components/ChartContainer';
import AIInsightPanel from '../components/AIInsightPanel';
import TradeSignalsPanel from '../components/TradeSignalsPanel';

export default function DashboardPage() {
  const { watchlist, assets, insights, signals } = useMarketSocket();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const activeSymbol = useMemo(() => {
    if (assets[selectedSymbol]) return selectedSymbol;
    return watchlist[0]?.symbol;
  }, [assets, selectedSymbol, watchlist]);

  const activeAsset = assets[activeSymbol];
  const activeInsight = insights[activeSymbol];

  return (
    <div className="min-h-screen p-4">
      <header className="mb-4 rounded-md border border-terminal-border bg-terminal-panel px-4 py-3">
        <h1 className="text-lg font-bold">Personal Bloomberg Terminal (Crypto)</h1>
        <p className="text-xs text-slate-400">Real-time data • SMC signals • AI trading assistant</p>
      </header>

      <main className="grid grid-cols-12 gap-3">
        <section className="col-span-12 rounded-md border border-terminal-border bg-terminal-panel p-3 md:col-span-3">
          <WatchlistPanel assets={watchlist} selectedSymbol={activeSymbol} onSelect={setSelectedSymbol} />
        </section>

        <section className="col-span-12 space-y-3 rounded-md border border-terminal-border bg-terminal-panel p-3 md:col-span-6">
          <div className="text-sm">
            <div className="font-semibold">{activeSymbol || 'Loading...'}</div>
            {activeAsset && (
              <div className="mt-1 text-xs text-slate-400">
                Trend: {activeAsset.smc.trend} | BOS: {activeAsset.smc.bos.state} | FVG: {activeAsset.smc.fvg} | OB: {activeAsset.smc.orderBlocks}
              </div>
            )}
          </div>
          <ChartContainer candles={activeAsset?.candles || []} />
          <TradeSignalsPanel signals={signals} />
        </section>

        <section className="col-span-12 space-y-3 rounded-md border border-terminal-border bg-terminal-panel p-3 md:col-span-3">
          <AIInsightPanel insight={activeInsight} />
          {activeAsset && (
            <div className="rounded-md border border-terminal-border bg-[#0D1220] p-3 text-xs text-slate-300">
              <h3 className="mb-2 font-semibold">Indicator Snapshot</h3>
              <ul className="space-y-1">
                <li>SMA14: {activeAsset.indicators.sma14 ?? 'N/A'}</li>
                <li>EMA14: {activeAsset.indicators.ema14 ?? 'N/A'}</li>
                <li>RSI14: {activeAsset.indicators.rsi14 ?? 'N/A'}</li>
                <li>Liquidity: {activeAsset.smc.liquidityZones.join(', ')}</li>
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
