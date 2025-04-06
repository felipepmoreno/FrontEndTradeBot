// API configuration

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:5000/api';

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API endpoints
export const ENDPOINTS = {
  // Portfolio
  PORTFOLIO: '/portfolio',
  
  // Trading
  TRADES: '/trades',
  TRADES_RECENT: '/trades/recent',
  
  // Strategies
  STRATEGIES: '/strategies',
  STRATEGY_DETAIL: (id) => `/strategies/${id}`,
  STRATEGY_TOGGLE: (id) => `/strategies/${id}/toggle`,
  STRATEGY_PERFORMANCE: (id) => `/strategies/${id}/performance`,
  
  // Trading pairs
  PAIRS: '/pairs',
  PAIRS_ACTIVE: '/pairs/active',
  PAIR_DETAIL: (symbol) => `/pairs/${symbol}`,
  
  // Alerts
  ALERTS: '/alerts',
  
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
};

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  DEFAULT_HEADERS,
  ENDPOINTS
};
