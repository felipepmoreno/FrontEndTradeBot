import axios from 'axios';
import crypto from 'crypto-js';
import { API_BASE_URL, REQUEST_TIMEOUT, USE_MOCK_DATA } from '../config/apiConfig';

// API base URLs
export const BINANCE_API_BASE_URL = 'https://testnet.binance.vision/api'; // Testnet API URL
const BINANCE_API_URL = 'https://api.binance.com';
const BINANCE_TESTNET_URL = 'https://testnet.binance.vision/api';

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

// Mock data for when API is unavailable
const mockData = {
  dashboard: {
    success: true,
    data: {
      portfolioValue: 15482.75,
      dailyChange: 2.34,
      activeStrategies: 3,
      activePositions: 2,
      recentTrades: [
        { id: '1', time: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', amount: 0.05, price: 45678.50 },
        { id: '2', time: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 3245.75 },
      ],
    }
  },
  portfolio: {
    success: true,
    data: {
      totalBalance: 15482.75,
      availableBalance: 5000.25,
      performance: {
        dailyProfitPercentage: 2.34,
        totalProfit: 1500,
        totalProfitPercentage: 10.25,
      },
      positions: {
        'BTC': { amount: 0.25, value: 10000 },
        'ETH': { amount: 1.5, value: 5000 },
      }
    }
  },
  trades: {
    success: true,
    trades: [
      { id: '1', time: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', quantity: 0.05, price: 45678.50 },
      { id: '2', time: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', quantity: 1.2, price: 3245.75 },
    ]
  },
  strategies: {
    success: true,
    strategies: [
      { id: '1', name: 'BTC Moving Average', active: true, pair: 'BTCUSDT', performance: { dailyReturn: '2.5%' } },
      { id: '2', name: 'ETH RSI Strategy', active: true, pair: 'ETHUSDT', performance: { dailyReturn: '1.7%' } },
      { id: '3', name: 'ADA DCA', active: false, pair: 'ADAUSDT', performance: { dailyReturn: '0.0%' } }
    ]
  },
  botStatus: {
    success: true,
    isRunning: true
  },
  serverTime: {
    success: true,
    serverTime: Date.now()
  }
};

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Handle API requests with improved error handling and mock data fallback
 */
// Export the apiRequest function so it can be imported by other modules
export const apiRequest = async (method, endpoint, data = null, params = null) => {
  try {
    console.log(`Making ${method} request to ${endpoint}`);
    const response = await api({
      method,
      url: endpoint,
      data,
      params
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${method}): `, error);
    
    // Check if we should return mock data
    if (USE_MOCK_DATA && mockData[endpoint.replace(/^\//, '')]) {
      console.info('Using mock data as fallback');
      return mockData[endpoint.replace(/^\//, '')];
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An unexpected error occurred',
    };
  }
};

// API method wrappers
export const get = (endpoint, params) => apiRequest('GET', endpoint, null, params);
export const post = (endpoint, data) => apiRequest('POST', endpoint, data);
export const put = (endpoint, data) => apiRequest('PUT', endpoint, data);
export const del = (endpoint) => apiRequest('DELETE', endpoint);

// Test API connection
export const testConnection = async () => {
  try {
    await get('/health');
    return true;
  } catch (error) {
    return false;
  }
};

// Check connection to Binance Testnet server
export const getTestnetServerTime = async () => {
  try {
    const response = await axios.get(`${BINANCE_TESTNET_URL}/v3/time`);
    return { 
      success: true, 
      serverTime: response.data.serverTime,
      message: 'Successfully connected to Binance Testnet'
    };
  } catch (error) {
    console.error('Error connecting to Binance Testnet:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to connect to Binance Testnet'
    };
  }
};

// Strategy Management Functions

/**
 * Fetch all strategies
 */
export const fetchStrategies = async () => {
  try {
    const data = await apiRequest('GET', '/strategies');
    return data.strategies || [];
  } catch (error) {
    console.error('Error fetching strategies:', error);
    // Return mock data if enabled or empty array as fallback
    return USE_MOCK_DATA ? mockData.strategies.strategies : [];
  }
};

/**
 * Fetch a single strategy by ID
 */
export const fetchStrategyById = async (id) => {
  try {
    const data = await apiRequest('GET', `/strategies/${id}`);
    return data.strategy;
  } catch (error) {
    console.error(`Error fetching strategy ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new strategy
 */
export const createStrategy = async (strategyData) => {
  try {
    const data = await apiRequest('POST', '/strategies', strategyData);
    return data;
  } catch (error) {
    console.error('Error creating strategy:', error);
    throw error;
  }
};

/**
 * Update an existing strategy
 */
export const updateStrategy = async (id, data) => {
  try {
    const response = await apiRequest('PUT', `/strategies/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating strategy:', error);
    throw error;
  }
};

/**
 * Delete a strategy
 */
export const deleteStrategy = async (id) => {
  try {
    const response = await apiRequest('DELETE', `/strategies/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting strategy:', error);
    throw error;
  }
};

/**
 * Toggle strategy active state
 */
export const toggleStrategyActive = async (id, isActive) => {
  try {
    const response = await apiRequest('POST', `/strategies/${id}/toggle`, { active: isActive });
    return response;
  } catch (error) {
    console.error('Error toggling strategy status:', error);
    throw error;
  }
};

// Also maintain the default export for backward compatibility
export default { get, post, put, delete: del, testConnection };
