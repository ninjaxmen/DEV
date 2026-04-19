import PriceTicker from './PriceTicker';

export default function WatchlistPanel({ assets, selectedSymbol, onSelect }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Watchlist</h2>
      {assets.map((asset) => (
        <PriceTicker key={asset.symbol} asset={asset} selected={selectedSymbol === asset.symbol} onClick={() => onSelect(asset.symbol)} />
      ))}
    </div>
  );
}
