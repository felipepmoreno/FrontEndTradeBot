import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  // State for dashboard data
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [activeStrategies, setActiveStrategies] = useState(0);
  const [activePositions, setActivePositions] = useState(0);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        
        if (response.data?.success) {
          const data = response.data.data || {};
          setPortfolioValue(data.portfolioValue || 0);
          setDailyChange(data.dailyChange || 0);
          setActiveStrategies(data.activeStrategies || 0);
          setActivePositions(data.activePositions || 0);
          setRecentTrades(data.recentTrades || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to connect to the server. Using demo data.");
        
        // Use mock data when API fails
        setPortfolioValue(15482.75);
        setDailyChange(2.34);
        setActiveStrategies(3);
        setActivePositions(2);
        setRecentTrades([
          { id: '1', time: new Date().toISOString(), symbol: 'BTC/USDT', type: 'BUY', amount: 0.05, price: 45678.50 },
          { id: '2', time: new Date().toISOString(), symbol: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 3245.75 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every minute
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Safely format a number with toFixed - prevents the error in the console
  const safeToFixed = (value, digits = 2) => {
    // More robust check - handles NaN and other edge cases
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0.00';
    }
    try {
      return Number(value).toFixed(digits);
    } catch (err) {
      console.warn(`Error formatting value: ${value}`, err);
      return '0.00';
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-gray-500">Overview of your trading portfolio and activity</p>
      </div>

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 mb-1">Portfolio Value</p>
              <h2 className="text-2xl font-bold">${safeToFixed(portfolioValue)}</h2>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 mb-1">Daily Change</p>
              <h2 className={`text-2xl font-bold ${Number(dailyChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(dailyChange) >= 0 ? '+' : ''}{safeToFixed(dailyChange)}%
              </h2>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 mb-1">Active Strategies</p>
              <h2 className="text-2xl font-bold">{activeStrategies}</h2>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-500 mb-1">Open Positions</p>
              <h2 className="text-2xl font-bold">{activePositions}</h2>
            </div>
          </div>
          
          {/* Recent Trades */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Time</th>
                    <th className="py-2 px-4 border-b text-left">Symbol</th>
                    <th className="py-2 px-4 border-b text-left">Type</th>
                    <th className="py-2 px-4 border-b text-right">Amount</th>
                    <th className="py-2 px-4 border-b text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.length > 0 ? (
                    recentTrades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="py-2 px-4 border-b">
                          {new Date(trade.time).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-4 border-b">{trade.symbol}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b text-right">{safeToFixed(trade.amount, 4)}</td>
                        <td className="py-2 px-4 border-b text-right">${safeToFixed(trade.price)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">
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
    </div>
  );
};

export default Dashboard;
