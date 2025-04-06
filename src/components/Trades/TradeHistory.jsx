import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    pair: '',
    startDate: '',
    endDate: '',
    type: '',
    limit: 50
  });
  const [pairs, setPairs] = useState([]);

  // Fetch trades when filters change
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        
        // Construct query parameters
        const params = new URLSearchParams();
        if (filters.pair) params.append('symbol', filters.pair);
        if (filters.startDate) params.append('startTime', new Date(filters.startDate).getTime());
        if (filters.endDate) params.append('endTime', new Date(filters.endDate).getTime());
        if (filters.type) params.append('type', filters.type);
        if (filters.limit) params.append('limit', filters.limit);
        
        const response = await axios.get(`${API_BASE_URL}/trades?${params.toString()}`);
        
        if (response.data.success) {
          setTrades(response.data.trades || []);
        } else {
          setError(response.data.error || 'Failed to fetch trades');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trades:', error);
        setError('Failed to communicate with server');
        setLoading(false);
      }
    };
    
    fetchTrades();
  }, [filters]);
  
  // Fetch available trading pairs
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/pairs`);
        if (response.data.success) {
          setPairs(response.data.pairs || []);
        }
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
      }
    };
    
    fetchPairs();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      pair: '',
      startDate: '',
      endDate: '',
      type: '',
      limit: 50
    });
  };
  
  // Calculate totals
  const calculateTotals = () => {
    if (!trades.length) return { totalTrades: 0, winningTrades: 0, losingTrades: 0, profitSum: 0 };
    
    const winningTrades = trades.filter(trade => trade.profit > 0).length;
    const losingTrades = trades.filter(trade => trade.profit < 0).length;
    const profitSum = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    
    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      profitSum
    };
  };
  
  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Trade History
            </h2>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-md shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="pair" className="block text-sm font-medium text-gray-700">Trading Pair</label>
              <select
                id="pair"
                name="pair"
                value={filters.pair}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Pairs</option>
                {pairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700">Limit</label>
              <select
                id="limit"
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Total Trades</h3>
            <p className="text-2xl font-bold">{totals.totalTrades}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Winning Trades</h3>
            <p className="text-2xl font-bold text-green-600">
              {totals.winningTrades} ({totals.totalTrades ? ((totals.winningTrades / totals.totalTrades) * 100).toFixed(1) + '%' : '0%'})
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Losing Trades</h3>
            <p className="text-2xl font-bold text-red-600">
              {totals.losingTrades} ({totals.totalTrades ? ((totals.losingTrades / totals.totalTrades) * 100).toFixed(1) + '%' : '0%'})
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Total Profit</h3>
            <p className={`text-2xl font-bold ${totals.profitSum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.profitSum >= 0 ? '+' : ''}{totals.profitSum.toFixed(2)}%
            </p>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading trades...</p>
          </div>
        ) : (
          /* Trades Table */
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pair
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strategy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No trades found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  trades.map(trade => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.time ? format(new Date(trade.time), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}
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
                        ${Number(trade.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Number(trade.quantity).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(Number(trade.price) * Number(trade.quantity)).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        trade.profit > 0 ? 'text-green-600' : 
                        trade.profit < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {trade.profit ? `${trade.profit > 0 ? '+' : ''}${Number(trade.profit).toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.strategyName || 'Manual'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;