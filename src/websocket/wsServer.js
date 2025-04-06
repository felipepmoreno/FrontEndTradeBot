// backend/src/websocket/wsServer.js
const WebSocket = require('ws');
const binanceService = require('.../services/binanceService'); // Importar o serviço de Binance
const initWsServer = (server) => {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket conectado');
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    // Manipular diferentes tipos de WebSockets
    if (path === '/ws/ticker') {
      const symbols = url.searchParams.get('symbols')?.split(',') || ['BTCUSDT'];
      const binanceWs = binanceService.createTickerWebSocket(symbols, (data) => {
        ws.send(JSON.stringify(data));
      });
      
      // Cleanup quando o WebSocket fechar
      ws.on('close', () => {
        if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
          binanceWs.close();
        }
      });
    }
    // Adicione outros handlers conforme necessário
  });
  
  return wss;
};

module.exports = { initWsServer };