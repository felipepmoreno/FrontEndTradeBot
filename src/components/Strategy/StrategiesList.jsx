import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusIcon, 
  LightningBoltIcon, 
  PlayIcon, 
  PauseIcon,
  TrashIcon,
  PencilIcon,
  ChartBarIcon
} from '@heroicons/react/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StrategiesList = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [strategyTypes, setStrategyTypes] = useState([]);

  // Fetch strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/strategies`);
        
        if (response.data.success) {
          setStrategies(response.data.strategies || []);
        } else {
          setError(response.data.error || 'Failed to fetch strategies');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching strategies:', error);
        setError('Failed to communicate with server');
        setLoading(false);
      }
    };

    const fetchStrategyTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/strategies/types`);
        
        if (response.data.success) {
          setStrategyTypes(response.data.types || []);
        }
      } catch (error) {
        console.error('Error fetching strategy types:', error);
      }
    };

    fetchStrategies();
    fetchStrategyTypes();
  }, []);

  // Toggle strategy active state
  const toggleStrategyActive = async (strategyId, currentActiveState) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/strategies/${strategyId}/toggle`, {
        active: !currentActiveState
      });
      
      if (response.data.success || (response.status === 200 && response.data.id)) {
        // Update local state
        setStrategies(strategies.map(strategy => 
          strategy.id === strategyId ? {...strategy, active: !currentActiveState} : strategy
        ));
      } else {
        setError(response.data.error || 'Failed to toggle strategy status');
      }
    } catch (error) {
      console.error('Error toggling strategy:', error);
      setError('Failed to communicate with server');
    }
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
    if (window.confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/strategies/${strategyId}`);
        
        if (response.data.success || response.status === 204) {
          // Remove from local state
          setStrategies(strategies.filter(strategy => strategy.id !== strategyId));
        } else {
          setError(response.data.error || 'Failed to delete strategy');
        }
      } catch (error) {
        console.error('Error deleting strategy:', error);
        setError('Failed to communicate with server');
      }
    }
  };

  // Filter strategies if needed
  const filteredStrategies = showActiveOnly 
    ? strategies.filter(strategy => strategy.active)
    : strategies;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Trading Strategies
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/strategies/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Strategy
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 mb-6">
          <div className="flex items-center">
            <input
              id="show-active-only"
              name="show-active-only"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={showActiveOnly}
              onChange={() => setShowActiveOnly(!showActiveOnly)}
            />
            <label htmlFor="show-active-only" className="ml-2 block text-sm text-gray-900">
              Show active strategies only
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon */}
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Strategy list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {filteredStrategies.length === 0 ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-gray-500 text-lg">
                    {showActiveOnly 
                      ? 'No active strategies. Toggle the filter or create a new strategy.'
                      : 'No strategies found. Create your first strategy to start trading.'}
                  </p>
                  <Link
                    to="/strategies/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create Strategy
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredStrategies.map((strategy) => (
                    <li key={strategy.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-medium text-indigo-600 truncate">
                              {strategy.name}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <LightningBoltIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <p>Type: {strategy.type || 'Custom'}</p>
                              <span className="mx-2">•</span>
                              <p>Pair: {strategy.pair}</p>
                              {strategy.timeframe && (
                                <>
                                  <span className="mx-2">•</span>
                                  <p>Timeframe: {strategy.timeframe}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-end">
                            <div className="flex items-center">
                              <span 
                                className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${
                                  strategy.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {strategy.active ? 'Active' : 'Inactive'}
                              </span>

                              <button
                                onClick={() => toggleStrategyActive(strategy.id, strategy.active)}
                                className={`mr-2 inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white ${
                                  strategy.active 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                              >
                                {strategy.active ? (
                                  <PauseIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                  <PlayIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                              </button>

                              <Link
                                to={`/strategies/${strategy.id}`}
                                className="mr-2 inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              </Link>

                              <Link
                                to={`/strategies/${strategy.id}/performance`}
                                className="mr-2 inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                              </Link>

                              <button
                                onClick={() => deleteStrategy(strategy.id)}
                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StrategiesList;