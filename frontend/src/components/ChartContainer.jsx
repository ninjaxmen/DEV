import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function ChartContainer({ candles }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !candles?.length) return undefined;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#101523' }, textColor: '#D7E2FF' },
      grid: { vertLines: { color: '#1D2945' }, horzLines: { color: '#1D2945' } },
      width: containerRef.current.clientWidth,
      height: 420
    });

    const series = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E'
    });

    series.setData(
      candles.map((candle) => ({
        time: Math.floor(candle.openTime / 1000),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      }))
    );

    const handleResize = () => chart.applyOptions({ width: containerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles]);

  return <div ref={containerRef} className="w-full rounded-md border border-terminal-border" />;
}
