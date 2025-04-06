import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ImportMeta {
  env: Record<string, string>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define TypeScript interfaces
interface Strategy {
  id: string;
  name: string;
  active: boolean;
  pair: string;
  performance?: {
    dailyReturn?: string;
  };
}

interface Trade {
  id: string;
  time: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  profit?: number;
}

interface BotStatus {
  isRunning: boolean;
  error?: string;
}

const TradingBotDashboard = () => {
  // State management
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [dailyChange, setDailyChange] = useState<number>(0);
  const [activeStrategies, setActiveStrategies] = useState<number>(0);
  const [activePositions, setActivePositions] = useState<number>(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [botStatus, setBotStatus] = useState<BotStatus>({ isRunning: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/portfolio`);
        
        if (response.data.success) {
          const portfolioData = response.data.data;
          setPortfolioValue(portfolioData.totalBalance);
          setDailyChange(portfolioData.performance.dailyProfitPercentage);
          setActivePositions(Object.keys(portfolioData.positions).length);
        } else {
          setError(response.data.error || 'Failed to fetch portfolio data');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to communicate with server');
        setLoading(false);
      }
    };

    fetchPortfolioData();
    
    // Refresh every 60 seconds
    const intervalId = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trades`, {
          params: { limit: 5 }
        });
        
        if (response.data.success) {
          setRecentTrades(response.data.trades);
        } else {
          console.error('Error fetching trades:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
    const intervalId = setInterval(fetchTrades, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/strategies`);
        
        if (response.data.success) {
          setStrategies(response.data.strategies);
          setActiveStrategies(response.data.strategies.filter((s: Strategy) => s.active).length);
        } else {
          console.error('Error fetching strategies:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching strategies:', error);
      }
    };

    fetchStrategies();
    const intervalId = setInterval(fetchStrategies, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch bot status
  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bot/status`);
        
        if (response.data.success) {
          setBotStatus(response.data);
        } else {
          console.error('Error fetching bot status:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    };

    fetchBotStatus();
    const intervalId = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Toggle bot status (start/stop)
  const handleToggleBot = async () => {
    try {
      const endpoint = botStatus.isRunning ? '/bot/stop' : '/bot/start';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`);
      
      if (response.data.success) {
        setBotStatus({
          ...botStatus,
          isRunning: !botStatus.isRunning
        });
      } else {
        console.error(`Error ${botStatus.isRunning ? 'stopping' : 'starting'} bot:`, response.data.error);
      }
    } catch (error) {
      console.error(`Error ${botStatus.isRunning ? 'stopping' : 'starting'} bot:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CryptoTradeBot</h1>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded ${botStatus.isRunning ? 'bg-green-700' : 'bg-gray-700'}`}>
              <span className="font-medium">Status:</span> {botStatus.isRunning ? 'Running' : 'Stopped'}
            </div>
            <button 
              onClick={handleToggleBot}
              className={`px-3 py-1 rounded ${botStatus.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {botStatus.isRunning ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-gray-500 text-sm">Portfolio Value</h3>
                <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-gray-500 text-sm">Daily Change</h3>
                <p className={`text-2xl font-bold ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-gray-500 text-sm">Active Strategies</h3>
                <p className="text-2xl font-bold">{activeStrategies}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-gray-500 text-sm">Open Positions</h3>
                <p className="text-2xl font-bold">{activePositions}</p>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Performance Chart (Coming Soon)</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Allocation Chart (Coming Soon)</p>
                </div>
              </div>
            </div>

            {/* Active Strategies */}
            <div className="bg-white p-4 rounded shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Strategies</h2>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                  New Strategy
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Return</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {strategies.map(strategy => (
                      <tr key={strategy.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{strategy.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            strategy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {strategy.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {strategy.performance?.dailyReturn || '0.00%'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{strategy.pair}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className={`${strategy.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                            {strategy.active ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {strategies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No strategies found. Create your first strategy to start trading.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Trades</h2>
                <a href="/trades" className="text-indigo-600 hover:text-indigo-800">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTrades.map(trade => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(trade.time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trade.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trade.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${Number(trade.price).toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          trade.profit !== undefined ? (
                            trade.profit > 0 ? 'text-green-500' : 
                            trade.profit < 0 ? 'text-red-500' : 'text-gray-500'
                          ) : 'text-gray-500'
                        }`}>
                          {trade.profit !== undefined ? `${trade.profit > 0 ? '+' : ''}${Number(trade.profit).toFixed(2)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                    {recentTrades.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent trades found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TradingBotDashboard;