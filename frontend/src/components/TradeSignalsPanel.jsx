export default function TradeSignalsPanel({ signals }) {
  return (
    <div className="rounded-md border border-terminal-border bg-terminal-panel p-3">
      <h3 className="mb-2 text-sm font-semibold">Live Logs / Signals</h3>
      <div className="max-h-56 space-y-1 overflow-auto text-xs text-slate-300">
        {signals.length ? signals.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : <div>No signals yet.</div>}
      </div>
    </div>
  );
}
