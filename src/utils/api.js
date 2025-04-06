import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Mock data for offline mode or when API is not available
const mockData = {
  '/bot/status': {
    success: true,
    isRunning: false,
    lastChecked: new Date().toISOString(),
    isFallback: true
  },
  '/notifications': {
    success: true,
    notifications: [
      {
        id: '1',
        title: 'System Message',
        message: 'Working in offline mode - Backend not connected',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString()
      }
    ],
    isFallback: true
  },
  '/dashboard': {
    success: true,
    data: {
      activeStrategies: 3,
      totalProfit: 245.75,
      todayPerformance: 1.25,
      openPositions: 2,
      recentTrades: [
        { id: '1', time: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', amount: 0.05, price: 45678.50 },
        { id: '2', time: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 3245.75 },
      ]
    },
    isFallback: true
  },
  '/trades': {
    success: true,
    trades: [
      { id: '1', timestamp: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', amount: 0.05, price: 45678.50, strategyName: 'RSI Strategy' },
      { id: '2', timestamp: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 3245.75, strategyName: 'Moving Average' }
    ],
    isFallback: true
  },
  '/strategies': {
    success: true,
    strategies: [
      { id: '1', name: 'RSI Strategy', active: true, pairs: ['BTC/USDT', 'ETH/USDT'], profit: 1.23 },
      { id: '2', name: 'Moving Average', active: true, pairs: ['BTC/USDT'], profit: 0.87 },
      { id: '3', name: 'Bollinger Bands', active: false, pairs: ['ETH/USDT', 'BNB/USDT'], profit: -0.45 }
    ],
    isFallback: true
  }
};

// Helper function to get mock data
export const getMockData = (endpoint) => {
  const path = endpoint.split('?')[0]; // Remove query parameters
  return mockData[path] || { success: false, error: 'No mock data available', isFallback: true };
};

// Main API request function with fallback to mock data
export const apiRequest = async (endpoint, method = 'GET', data = null, fallbackData = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    
    // If fallback data is provided, return it
    if (fallbackData) {
      return {
        ...fallbackData,
        isFallback: true
      };
    }
    
    // Otherwise, try to get mock data for this endpoint
    const mockResponse = getMockData(endpoint);
    if (mockResponse) {
      return mockResponse;
    }
    
    // If all else fails, throw the error for the caller to handle
    throw error;
  }
};

export default {
  apiRequest,
  getMockData
};
