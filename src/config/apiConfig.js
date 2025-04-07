// API configuration

/**
 * API Configuration
 * This file centralizes all API configuration for easier management
 */

// Get the API base URL from environment variable or use a default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 15000;

// API version
export const API_VERSION = 'v1';

// Flag to use mock data when API is unavailable
export const USE_MOCK_DATA = true;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API endpoints
export const ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Bot control
  BOT_STATUS: '/bot/status',
  BOT_TOGGLE: '/bot/toggle',
  
  // Portfolio
  PORTFOLIO: '/portfolio',
  
  // Trading
  TRADES: '/trades',
  TRADES_RECENT: '/trades/recent',
  ORDERS: '/orders',
  TRADING_TOGGLE: '/trading/toggle',
  TRADING_STATUS: '/trading/status',
  
  // Strategies
  STRATEGIES: '/strategies',
  STRATEGY_DETAIL: (id) => `/strategies/${id}`,
  STRATEGY_TOGGLE: (id) => `/strategies/${id}/toggle`,
  STRATEGY_PERFORMANCE: (id) => `/strategies/${id}/performance`,
  STRATEGY_TYPES: '/strategies/types/all',
  
  // Trading pairs
  PAIRS: '/pairs',
  PAIRS_ACTIVE: '/pairs/active',
  PAIR_DETAIL: (symbol) => `/pairs/${symbol}`,
  TICKER: (symbol) => `/ticker/${symbol}`,
  
  // Risk management
  RISK_STATS: '/risk/stats',
  RISK_SETTINGS: '/risk/settings',
  
  // Backtest
  BACKTEST: '/backtest',
  
  // Binance API connection
  TEST_CONNECTION: '/test-connection',
  ACCOUNT: '/account',
  
  // Alerts
  ALERTS: '/alerts',
  
  // Authentication (may not be implemented yet in backend)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  
  // API status
  STATUS: '/status'
};

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  API_VERSION,
  USE_MOCK_DATA,
  DEFAULT_HEADERS,
  ENDPOINTS
};
