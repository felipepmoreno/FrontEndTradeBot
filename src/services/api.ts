import axios from 'axios';

// Base URL for API requests - define a URL base explícita para apontar para o backend
const api = axios.create({
  // Apontando diretamente para a porta 8000 onde está rodando o backend
  baseURL: 'http://localhost:8000/api',
  // Adicionando cabeçalhos comuns para todas as requisições
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptadores para tratar erros globalmente
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Wallet API endpoints
export const walletApi = {
  connect: (apiKey: string, apiSecret: string, useTestnet: boolean = true) => 
    api.post('/wallet/connect', { api_key: apiKey, api_secret: apiSecret, use_testnet: useTestnet }),
  getBalance: (walletId: string) => 
    api.get(`/wallet/balance?wallet_id=${walletId}`),
};

// Binance API endpoints
export const binanceApi = {
  getStatus: () => 
    api.get('/binance/status'),
  getPrice: (symbol: string) => 
    api.get(`/binance/price/${symbol}`),
};

// Trading API endpoints
export const tradingApi = {
  buy: (walletId: string, symbol: string, quantity: number, price?: number) => 
    api.post('/trading/buy', { wallet_id: walletId, symbol, quantity, price }),
  sell: (walletId: string, symbol: string, quantity: number, price?: number) => 
    api.post('/trading/sell', { wallet_id: walletId, symbol, quantity, price }),
  getOrders: (walletId: string, symbol?: string) => 
    api.get(`/trading/orders?wallet_id=${walletId}${symbol ? `&symbol=${symbol}` : ''}`),
  getOrder: (orderId: string, walletId: string, symbol: string) => 
    api.get(`/trading/order/${orderId}?wallet_id=${walletId}&symbol=${symbol}`),
  cancelOrder: (orderId: string, walletId: string, symbol: string) => 
    api.delete(`/trading/order/${orderId}?wallet_id=${walletId}&symbol=${symbol}`),
};

// Bot API endpoints
export const botApi = {
  start: (walletId: string, symbol: string, maxAmount: number, intervalSeconds: number, strategy: string = 'simple', buyThreshold?: number, sellThreshold?: number) => 
    api.post('/bot/start', { 
      wallet_id: walletId, 
      symbol, 
      max_amount: maxAmount, 
      interval_seconds: intervalSeconds,
      strategy,
      buy_threshold: buyThreshold,
      sell_threshold: sellThreshold
    }),
  stop: () => 
    api.post('/bot/stop'),
  getStatus: () => 
    api.get('/bot/status'),
};

export default api;