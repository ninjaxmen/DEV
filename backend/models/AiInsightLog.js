import mongoose from 'mongoose';

const AiInsightLogSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, index: true },
    bias: { type: String, required: true },
    entryZone: String,
    stopLoss: String,
    target: String,
    explanation: String,
    model: String,
    raw: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AiInsightLog = mongoose.model('AiInsightLog', AiInsightLogSchema);
