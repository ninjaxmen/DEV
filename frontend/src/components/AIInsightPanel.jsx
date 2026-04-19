export default function AIInsightPanel({ insight }) {
  if (!insight) {
    return <div className="rounded-md border border-terminal-border bg-terminal-panel p-3 text-sm text-slate-400">Waiting for AI insight...</div>;
  }

  const badge = insight.bias === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : insight.bias === 'SELL' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300';

  return (
    <div className="rounded-md border border-terminal-border bg-terminal-panel p-3 text-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">AI Trade Intelligence</h3>
        <span className={`rounded px-2 py-0.5 text-xs ${badge}`}>{insight.bias}</span>
      </div>
      <ul className="space-y-1 text-slate-300">
        <li><strong>Entry:</strong> {insight.entryZone}</li>
        <li><strong>Stop:</strong> {insight.stopLoss}</li>
        <li><strong>Target:</strong> {insight.target}</li>
        <li><strong>Levels:</strong> {Array.isArray(insight.keyLevels) ? insight.keyLevels.join(', ') : 'N/A'}</li>
      </ul>
      <p className="mt-3 text-xs text-slate-400">{insight.explanation}</p>
    </div>
  );
}
