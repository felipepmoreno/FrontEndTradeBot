// src/services/binanceService.js
import api from '../utils/api';

// Serviço para comunicação com a API Binance através do backend
const binanceService = {
  // Métodos para dados de mercado
  getTickerPrice: async (symbol) => {
    try {
      const response = await api.getTickerPrice(symbol);
      return response;
    } catch (error) {
      console.error('Erro ao obter preço:', error);
      return { success: false, error: error.message };
    }
  },
  
  getKlines: async (symbol, interval, limit) => {
    try {
      const response = await api.getKlines(symbol, interval, limit);
      return response;
    } catch (error) {
      console.error('Erro ao obter candles:', error);
      return { success: false, error: error.message };
    }
  },
  
  getOrderBook: async (symbol, limit) => {
    try {
      const response = await api.getOrderBook(symbol, limit);
      return response;
    } catch (error) {
      console.error('Erro ao obter livro de ordens:', error);
      return { success: false, error: error.message };
    }
  },
  
  getRecentTrades: async (symbol, limit) => {
    try {
      const response = await api.getRecentTrades(symbol, limit);
      return response;
    } catch (error) {
      console.error('Erro ao obter trades recentes:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Métodos para conta
  getAccountInfo: async () => {
    try {
      const response = await api.getAccountInfo();
      return response;
    } catch (error) {
      console.error('Erro ao obter informações da conta:', error);
      return { success: false, error: error.message };
    }
  },
  
  getAssetBalance: async (asset) => {
    try {
      const response = await api.getAssetBalance(asset);
      return response;
    } catch (error) {
      console.error('Erro ao obter saldo do ativo:', error);
      return { success: false, error: error.message };
    }
  },
  
  getMyTrades: async (symbol, limit) => {
    try {
      const response = await api.getMyTrades(symbol, limit);
      return response;
    } catch (error) {
      console.error('Erro ao obter meus trades:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Métodos para trading
  placeOrder: async (orderData) => {
    try {
      const response = await api.placeOrder(orderData);
      return response;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      return { success: false, error: error.message };
    }
  },
  
  getOrderStatus: async (symbol, orderId) => {
    try {
      const response = await api.getOrderStatus(symbol, orderId);
      return response;
    } catch (error) {
      console.error('Erro ao obter status da ordem:', error);
      return { success: false, error: error.message };
    }
  },
  
  cancelOrder: async (symbol, orderId) => {
    try {
      const response = await api.cancelOrder(symbol, orderId);
      return response;
    } catch (error) {
      console.error('Erro ao cancelar ordem:', error);
      return { success: false, error: error.message };
    }
  },
  
  getOpenOrders: async (symbol) => {
    try {
      const response = await api.getOpenOrders(symbol);
      return response;
    } catch (error) {
      console.error('Erro ao obter ordens abertas:', error);
      return { success: false, error: error.message };
    }
  },
  
  getOrderHistory: async (symbol, limit) => {
    try {
      const response = await api.getOrderHistory(symbol, limit);
      return response;
    } catch (error) {
      console.error('Erro ao obter histórico de ordens:', error);
      return { success: false, error: error.message };
    }
  },
  
  // WebSocket methods
  createTickerWebSocket: (symbol, onMessage) => {
    return api.createWebSocketConnection('ticker', { symbol }, onMessage);
  },
  
  createKlineWebSocket: (symbol, interval, onMessage) => {
    return api.createWebSocketConnection('kline', { symbol, interval }, onMessage);
  },
  
  createDepthWebSocket: (symbol, levels, onMessage) => {
    return api.createWebSocketConnection('depth', { symbol, levels }, onMessage);
  },
  
  createTradesWebSocket: (symbol, onMessage) => {
    return api.createWebSocketConnection('trades', { symbol }, onMessage);
  },
  
  createMultiStreamWebSocket: (streams, onMessage) => {
    return api.createWebSocketConnection('multi', { streams }, onMessage);
  },
  
  // Status da API
  checkApiStatus: async () => {
    try {
      const response = await api.getBinanceStatus();
      return response;
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      return { success: false, error: error.message };
    }
  }
};

export default binanceService;