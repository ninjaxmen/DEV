import axios from 'axios';

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT'];

export class MarketDataService {
  constructor({ binanceBaseUrl, coingeckoBaseUrl }) {
    this.binanceClient = axios.create({ baseURL: binanceBaseUrl, timeout: 4000 });
    this.coingeckoClient = axios.create({ baseURL: coingeckoBaseUrl, timeout: 4000 });
  }

  async fetchTicker(symbol) {
    try {
      const [tickerRes, candleRes] = await Promise.all([
        this.binanceClient.get('/api/v3/ticker/24hr', { params: { symbol } }),
        this.binanceClient.get('/api/v3/klines', { params: { symbol, interval: '1m', limit: 80 } })
      ]);

      const candles = candleRes.data.map((kline) => ({
        openTime: Number(kline[0]),
        open: Number(kline[1]),
        high: Number(kline[2]),
        low: Number(kline[3]),
        close: Number(kline[4]),
        volume: Number(kline[5])
      }));

      return {
        symbol,
        source: 'binance',
        price: Number(tickerRes.data.lastPrice),
        volume24h: Number(tickerRes.data.quoteVolume),
        candles,
        ohlc: candles.at(-1)
      };
    } catch (error) {
      return this.fetchFromCoinGecko(symbol, error);
    }
  }

  async fetchFromCoinGecko(symbol, binanceError) {
    const idMap = {
      BTCUSDT: 'bitcoin',
      ETHUSDT: 'ethereum'
    };

    const coinId = idMap[symbol] ?? 'bitcoin';
    const [marketRes, chartRes] = await Promise.all([
      this.coingeckoClient.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: coinId,
          price_change_percentage: '24h'
        }
      }),
      this.coingeckoClient.get(`/coins/${coinId}/market_chart`, {
        params: { vs_currency: 'usd', days: '1', interval: 'minutely' }
      })
    ]);

    const market = marketRes.data[0];
    const prices = chartRes.data.prices.slice(-80);
    const candles = prices.map(([timestamp, price], index) => {
      const prev = prices[Math.max(index - 1, 0)][1];
      return {
        openTime: timestamp,
        open: prev,
        high: Math.max(prev, price),
        low: Math.min(prev, price),
        close: price,
        volume: chartRes.data.total_volumes[index]?.[1] ?? 0
      };
    });

    return {
      symbol,
      source: 'coingecko',
      warning: `Binance fallback due to: ${binanceError.message}`,
      price: market.current_price,
      volume24h: market.total_volume,
      candles,
      ohlc: candles.at(-1)
    };
  }

  async fetchBatch(symbols = DEFAULT_SYMBOLS) {
    const results = await Promise.all(symbols.map((symbol) => this.fetchTicker(symbol)));
    return results;
  }
}
