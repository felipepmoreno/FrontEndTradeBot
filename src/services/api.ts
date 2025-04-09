// Base API URLs - adjust as needed for your environment
const API_BASE_URL = 'http://localhost:5000';

interface ApiErrorResponse {
  message: string;
  error: string;
  status: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiErrorResponse;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || 'Unknown error occurred';
    } catch (e) {
      errorMessage = `HTTP Error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Check API health
export async function checkApiHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  } catch (error) {
    console.error('API health check failed:', error);
    throw new Error('API is not available');
  }
}

// Connect wallet with Binance API credentials
export async function connectWallet(apiKey: string, apiSecret: string, useTestnet: boolean = true): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/binance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, use_testnet: useTestnet }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Connect wallet error:', error);
    throw error;
  }
}

// Get wallet balance
export async function getWalletBalance(walletId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/balance?wallet_id=${encodeURIComponent(walletId)}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Get wallet balance error:', error);
    throw error;
  }
}

// Place a buy order
export async function placeBuyOrder(orderData: {
  symbol: string;
  quantity: number;
  wallet_id: string;
  price?: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Place buy order error:', error);
    throw error;
  }
}

// Place a sell order
export async function placeSellOrder(orderData: {
  symbol: string;
  quantity: number;
  wallet_id: string;
  price?: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Place sell order error:', error);
    throw error;
  }
}

// Get recent orders
export async function getOrders(walletId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/orders?wallet_id=${encodeURIComponent(walletId)}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
}

// Start trading bot
export async function startBot(config: {
  symbol: string;
  interval_seconds: number;
  max_amount: number;
  wallet_id: string;
  strategy: string;
  buy_threshold?: number;
  sell_threshold?: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/bot/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Start bot error:', error);
    throw error;
  }
}

// Stop trading bot
export async function stopBot(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/bot/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Stop bot error:', error);
    throw error;
  }
}

// Get bot status
export async function getBotStatus(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/bot/status`);
    return handleResponse(response);
  } catch (error) {
    console.error('Get bot status error:', error);
    throw error;
  }
}
