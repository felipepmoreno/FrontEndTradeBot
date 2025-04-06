import axios from 'axios';
import crypto from 'crypto-js';

// API base URLs
export const BINANCE_API_BASE_URL = 'https://testnet.binance.vision/api'; // Testnet API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BINANCE_API_URL = 'https://api.binance.com';

// Binance API signature generation for authenticated endpoints
const generateSignature = (queryString, apiSecret) => {
  return crypto.HmacSHA256(queryString, apiSecret).toString(crypto.enc.Hex);
};

// Build query string from parameters
const buildQueryString = (params = {}) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
};

// Get timestamp for Binance API
const getTimestamp = () => {
  return Date.now();
};

// Configure Binance API request with authentication headers
export const binanceRequest = async (endpoint, method = 'GET', params = {}, requiresAuth = false) => {
  try {
    // Get API keys from local storage or environment
    const apiKey = localStorage.getItem('binance_api_key') || import.meta.env.VITE_BINANCE_API_KEY;
    const apiSecret = localStorage.getItem('binance_api_secret') || import.meta.env.VITE_BINANCE_API_SECRET;
    
    if (requiresAuth && (!apiKey || !apiSecret)) {
      throw new Error('API Key and Secret are required for authenticated endpoints');
    }

    // Add timestamp for authenticated requests
    if (requiresAuth) {
      params.timestamp = getTimestamp();
    }

    // Build query string and signature
    const queryString = buildQueryString(params);
    
    // Configure request
    const config = {
      method,
      url: `${BINANCE_API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add authentication headers if needed
    if (requiresAuth) {
      const signature = generateSignature(queryString, apiSecret);
      config.url += `&signature=${signature}`;
      config.headers['X-MBX-APIKEY'] = apiKey;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Binance API error:', error);
    return {
      success: false,
      error: error.response?.data?.msg || error.message || 'An error occurred with the Binance API'
    };
  }
};

// Configure axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Make API request to backend server
 */
export const apiRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data: data,
      params: params,
    });
    
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    if (error.response) {
      // Server responded with an error status code
      return { success: false, error: error.response.data.message || 'Server error' };
    } else if (error.request) {
      // Request was made but no response received
      return { success: false, error: 'No response from server' };
    } else {
      // Something else went wrong
      return { success: false, error: error.message };
    }
  }
};

/**
 * Get data directly from Binance API
 */
export const getBinanceData = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BINANCE_API_URL}${endpoint}`, {
      params
    });
    return response;
  } catch (error) {
    console.error(`Binance API Error (${endpoint}):`, error);
    throw error;
  }
};

// Common Binance API methods
export const getKlines = async (symbol, interval, limit = 500) => {
  return await getBinanceData('/api/v3/klines', {
    symbol,
    interval,
    limit
  });
};

export const getTickerPrice = async (symbol) => {
  return await getBinanceData('/api/v3/ticker/price', {
    symbol
  });
};

// Testnet-specific endpoints
export const getTestnetServerTime = async () => {
  try {
    const response = await axios.get('https://testnet.binance.vision/api/v3/time');
    return { success: true, serverTime: response.data.serverTime };
  } catch (error) {
    console.error('Error checking testnet server time:', error);
    return { success: false, error: error.message };
  }
};

export const getTestnetExchangeInfo = async () => {
  return binanceRequest('/v3/exchangeInfo');
};

// Get account information (requires authentication)
export const getAccountInfo = async () => {
  return binanceRequest('/v3/account', 'GET', {}, true);
};

// Get recent trades for a symbol
export const getRecentTrades = async (symbol) => {
  return binanceRequest('/v3/trades', 'GET', { symbol, limit: 10 });
};

// Get 24hr ticker price change statistics
export const get24hTickerStats = async (symbol) => {
  return binanceRequest('/v3/ticker/24hr', 'GET', symbol ? { symbol } : {});
};

// Place a new order (requires authentication)
export const placeOrder = async (symbol, side, type, quantity, price = null) => {
  const params = {
    symbol,
    side, // BUY or SELL
    type, // LIMIT, MARKET, etc.
    quantity
  };
  
  if (type === 'LIMIT') {
    params.price = price;
    params.timeInForce = 'GTC'; // Good Till Canceled
  }
  
  return binanceRequest('/v3/order', 'POST', params, true);
};

// Cancel an order (requires authentication)
export const cancelOrder = async (symbol, orderId) => {
  return binanceRequest('/v3/order', 'DELETE', { symbol, orderId }, true);
};

// Get all open orders (requires authentication)
export const getOpenOrders = async (symbol = null) => {
  const params = symbol ? { symbol } : {};
  return binanceRequest('/v3/openOrders', 'GET', params, true);
};

// Backend API functions
export const fetchSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: error.message };
  }
};

export const saveSettings = async (settings) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/settings`, settings);
    return response.data;
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message };
  }
};

// Mock data function for development/testing
export const getMockData = (type) => {
  const mockData = {
    portfolio: {
      totalBalance: 15482.75,
      dailyProfitPercentage: 2.34,
      assets: [
        { symbol: 'BTC', amount: 0.42, valueUSD: 8765.32 },
        { symbol: 'ETH', amount: 3.5, valueUSD: 5432.21 },
        { symbol: 'SOL', amount: 45.8, valueUSD: 1285.22 }
      ]
    },
    strategies: [
      { id: 'strat1', name: 'Moving Average Crossover', active: true, pair: 'BTCUSDT', performance: { dailyReturn: '2.4%' } },
      { id: 'strat2', name: 'RSI Strategy', active: true, pair: 'ETHUSDT', performance: { dailyReturn: '1.7%' } },
      { id: 'strat3', name: 'DCA Bitcoin', active: false, pair: 'BTCUSDT', performance: { dailyReturn: '0.8%' } }
    ],
    trades: [
      { id: '1', time: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', quantity: 0.05, price: 45678.50, status: 'COMPLETED' },
      { id: '2', time: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 3245.75, status: 'COMPLETED', profit: 120.50 }
    ]
  };
  
  return Promise.resolve({ success: true, data: mockData[type] || {} });
};

// Strategy API functions
export const fetchStrategies = async () => {
  return await apiRequest('GET', '/strategies');
};

export const updateStrategy = async (strategyId, strategyData) => {
  return await apiRequest('PUT', `/strategies/${strategyId}`, strategyData);
};

export const deleteStrategy = async (strategyId) => {
  return await apiRequest('DELETE', `/strategies/${strategyId}`);
};

export const createStrategy = async (strategyData) => {
  return await apiRequest('POST', '/strategies', strategyData);
};

// Trading and market endpoints
export const fetchPortfolio = async () => {
  return await apiRequest('GET', '/portfolio');
};

export const fetchTrades = async (params) => {
  return await apiRequest('GET', '/trades', null, params);
};

export const fetchMarketData = async (symbol, timeframe) => {
  return await apiRequest('GET', '/market/klines', null, { symbol, interval: timeframe });
};

// Bot control endpoints
export const startBot = async () => {
  return await apiRequest('POST', '/bot/start');
};

export const stopBot = async () => {
  return await apiRequest('POST', '/bot/stop');
};

export const getBotStatus = async () => {
  return await apiRequest('GET', '/bot/status');
};

export default {
  getTestnetServerTime,
  getTestnetExchangeInfo,
  getAccountInfo,
  getRecentTrades,
  getTickerPrice,
  get24hTickerStats,
  placeOrder,
  cancelOrder,
  getOpenOrders,
  getKlines,
  fetchSettings,
  saveSettings,
  fetchStrategies,
  updateStrategy,
  deleteStrategy,
  createStrategy,
  fetchPortfolio,
  fetchTrades,
  fetchMarketData,
  getMockData,
  startBot,
  stopBot,
  getBotStatus
};
