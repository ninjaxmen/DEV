import axios from 'axios';

export class NewsService {
  constructor({ newsApiUrl, apiKey }) {
    this.apiKey = apiKey;
    this.client = axios.create({ baseURL: newsApiUrl, timeout: 4000 });
  }

  async getMarketSentiment(query = 'bitcoin OR ethereum') {
    if (!this.apiKey) {
      return { sentiment: 'neutral', headlines: [], source: 'mock' };
    }

    try {
      const response = await this.client.get('', {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey: this.apiKey
        }
      });

      const headlines = response.data.articles.map((article) => article.title);
      const score = headlines.reduce((acc, headline) => {
        const text = headline.toLowerCase();
        if (text.includes('surge') || text.includes('bull') || text.includes('record')) return acc + 1;
        if (text.includes('drop') || text.includes('hack') || text.includes('bear')) return acc - 1;
        return acc;
      }, 0);

      const sentiment = score > 1 ? 'positive' : score < -1 ? 'negative' : 'neutral';

      return {
        sentiment,
        headlines: headlines.slice(0, 5),
        source: 'newsapi'
      };
    } catch (error) {
      return { sentiment: 'neutral', headlines: [], source: 'fallback', error: error.message };
    }
  }
}
