import mongoose from 'mongoose';

const MarketSnapshotSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, index: true },
    source: { type: String, required: true },
    price: { type: Number, required: true },
    volume24h: Number,
    ohlc: {
      open: Number,
      high: Number,
      low: Number,
      close: Number
    },
    indicators: mongoose.Schema.Types.Mixed,
    smc: mongoose.Schema.Types.Mixed,
    newsSentiment: String
  },
  { timestamps: true }
);

export const MarketSnapshot = mongoose.model('MarketSnapshot', MarketSnapshotSchema);
