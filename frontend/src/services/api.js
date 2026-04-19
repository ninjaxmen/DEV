import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
});

export async function fetchSnapshot() {
  const response = await api.get('/api/market/snapshot');
  return response.data;
}

export async function fetchInsights() {
  const response = await api.get('/api/market/insights');
  return response.data;
}

export default api;
