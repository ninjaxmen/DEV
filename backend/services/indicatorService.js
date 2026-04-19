function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function sma(values, period = 14) {
  if (values.length < period) return null;
  const sample = values.slice(-period);
  const total = sample.reduce((acc, current) => acc + current, 0);
  return round(total / period);
}

export function ema(values, period = 14) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let emaValue = values[0];
  values.forEach((price) => {
    emaValue = price * k + emaValue * (1 - k);
  });
  return round(emaValue);
}

export function rsi(values, period = 14) {
  if (values.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = values.length - period; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return round(100 - 100 / (1 + rs));
}

export function detectTrend(closes) {
  const shortEma = ema(closes, 9);
  const longEma = ema(closes, 21);
  if (!shortEma || !longEma) return 'neutral';
  if (shortEma > longEma) return 'bullish';
  if (shortEma < longEma) return 'bearish';
  return 'neutral';
}

export function detectBos(candles) {
  if (candles.length < 6) return { state: 'none', level: null };
  const recent = candles.slice(-6);
  const highs = recent.map((candle) => candle.high);
  const lows = recent.map((candle) => candle.low);
  const lastClose = recent.at(-1).close;
  const maxPreviousHigh = Math.max(...highs.slice(0, -1));
  const minPreviousLow = Math.min(...lows.slice(0, -1));

  if (lastClose > maxPreviousHigh) return { state: 'bullish_bos', level: round(maxPreviousHigh) };
  if (lastClose < minPreviousLow) return { state: 'bearish_bos', level: round(minPreviousLow) };
  return { state: 'none', level: null };
}

export function detectLiquidityZones(candles) {
  if (!candles.length) return [];
  const highs = candles.slice(-20).map((c) => c.high);
  const lows = candles.slice(-20).map((c) => c.low);
  return [round(Math.max(...highs)), round(Math.min(...lows))];
}

export function detectFvg(candles) {
  if (candles.length < 3) return 'none';
  const [a, b, c] = candles.slice(-3);

  if (a.high < c.low) return 'present_above';
  if (a.low > c.high) return 'present_below';
  return 'none';
}

export function detectOrderBlocks(candles) {
  if (candles.length < 10) return 'none';
  const recent = candles.slice(-10);
  const largeBearish = recent.find(
    (candle) => candle.open > candle.close && Math.abs(candle.open - candle.close) / candle.open > 0.008
  );
  const largeBullish = recent.find(
    (candle) => candle.close > candle.open && Math.abs(candle.close - candle.open) / candle.open > 0.008
  );

  if (largeBearish) return 'recent_supply_zone';
  if (largeBullish) return 'recent_demand_zone';
  return 'none';
}

export function buildIndicators(candles) {
  const closes = candles.map((candle) => candle.close);
  const trend = detectTrend(closes);
  const bos = detectBos(candles);

  return {
    sma14: sma(closes, 14),
    ema14: ema(closes, 14),
    rsi14: rsi(closes, 14),
    trend,
    bos,
    liquidityZones: detectLiquidityZones(candles),
    fvg: detectFvg(candles),
    orderBlocks: detectOrderBlocks(candles)
  };
}
