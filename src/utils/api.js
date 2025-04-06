import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request payload
 * @param {object} fallbackData - Data to return if API call fails
 * @returns {Promise<object>} API response or fallback data
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, fallbackData = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = { method };
    
    if (data && method.toUpperCase() !== 'GET') {
      config.data = data;
    }
    
    const response = await axios(url, config);
    return response.data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    
    // Return fallback data if provided
    if (fallbackData !== null) {
      return {
        success: true,
        data: fallbackData,
        isFallback: true
      };
    }
    
    throw error;
  }
};

/**
 * Get mock data for different endpoints when API is unavailable
 * @param {string} endpoint - API endpoint
 * @returns {object} Mock data
 */
export const getMockData = (endpoint) => {
  const mockData = {
    '/bot/status': {
      success: true,
      isRunning: false,
      lastUpdated: new Date().toISOString(),
      state: 'idle'
    },
    '/notifications': {
      success: true,
      notifications: [
        {
          id: '1',
          title: 'Demo Notification',
          message: 'This is a demo notification as the server is offline.',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
    }
  };

  return mockData[endpoint] || { success: false, message: 'No mock data available' };
};

export default {
  apiRequest,
  getMockData
};
