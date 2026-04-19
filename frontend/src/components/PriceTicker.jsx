export default function PriceTicker({ asset, selected, onClick }) {
  if (!asset) return null;

  const changeColor = asset.smc.trend === 'bullish' ? 'text-emerald-400' : asset.smc.trend === 'bearish' ? 'text-red-400' : 'text-yellow-300';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border px-3 py-2 text-left transition ${selected ? 'border-terminal-accent bg-terminal-border/40' : 'border-terminal-border bg-terminal-panel hover:bg-terminal-border/30'}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{asset.symbol}</span>
        <span className={changeColor}>{asset.price.toFixed(2)}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400">24h Vol: {Math.round(asset.volume24h).toLocaleString()}</div>
    </button>
  );
}
