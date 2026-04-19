import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a crypto trading assistant that returns JSON only.
Required keys: bias, entryZone, stopLoss, target, explanation, keyLevels.
Bias must be BUY, SELL, or WAIT.`;

export class AiAgentService {
  constructor({ apiKey, model }) {
    this.model = model;
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async getInsight(payload) {
    if (!this.client) {
      return this.buildMock(payload);
    }

    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.output_text;
      return { ...JSON.parse(content), model: this.model, raw: content };
    } catch (error) {
      console.error('AI service failed, returning mock:', error.message);
      return this.buildMock(payload);
    }
  }

  buildMock(payload) {
    const { trend, price, liquidity_zones: liquidityZones, news_sentiment: newsSentiment } = payload;
    const bullish = trend === 'bullish' && newsSentiment !== 'negative';
    const bearish = trend === 'bearish' && newsSentiment !== 'positive';
    const bias = bullish ? 'BUY' : bearish ? 'SELL' : 'WAIT';

    const [highLiquidity, lowLiquidity] = liquidityZones;
    const entryZone = bias === 'BUY' ? `${lowLiquidity}-${price}` : bias === 'SELL' ? `${price}-${highLiquidity}` : 'wait_for_confirmation';

    return {
      bias,
      entryZone,
      stopLoss: bias === 'BUY' ? String(lowLiquidity * 0.995) : String(highLiquidity * 1.005),
      target: bias === 'BUY' ? String(highLiquidity) : String(lowLiquidity),
      keyLevels: liquidityZones,
      explanation: `Mock insight: trend=${trend}, sentiment=${newsSentiment}, fvg=${payload.fvg}.`,
      model: 'mock-agent'
    };
  }
}
