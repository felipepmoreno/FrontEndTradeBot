// backend/src/websocket/wsServer.js
const WebSocket = require('ws');
const url = require('url');

const initWsServer = (server) => {
  // Initialize the WebSocket server
  const wss = new WebSocket.Server({ 
    server: server,
    path: '/ws'
  });
  
  wss.on('connection', (ws, req) => {
    // Extract path from URL
    const path = url.parse(req.url).pathname;
    console.log(`New WebSocket connection: ${path}`);
    
    let binanceWs = null;
    
    if (path === '/ws/ticker') {
      // Connect to Binance WebSocket for ticker data
      binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      // Forward Binance data to client
      binanceWs.on('message', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
      
      ws.on('close', () => {
        if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
          binanceWs.close();
        }
      });
    }
    // Add other handlers as needed
  });
  
  return wss;
};

module.exports = { initWsServer };