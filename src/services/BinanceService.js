// src/services/binanceService.js
import axios from 'axios';
import API_BASE_URL from '../config';

// Métodos que chamam o backend, não a Binance diretamente
const binanceService = {
  getTickerPrice: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/binance/ticker/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter preço:', error);
      return { success: false, error: error.message };
    }
  },
  
  createTickerWebSocket: (symbols, onMessage) => {
    const ws = new WebSocket(`ws://localhost:5000/ws/ticker?symbols=${Array.isArray(symbols) ? symbols.join(',') : symbols}`);
    
    ws.onopen = () => console.log('WebSocket conectado para ticker');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };
    
    return ws;
  },
  
  // Adicione outros métodos conforme necessário...
};

export default binanceService;