import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, SaveIcon, TrashIcon } from '@heroicons/react/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StrategyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [strategyTypes, setStrategyTypes] = useState([]);
  const [availablePairs, setAvailablePairs] = useState([]);
  const [availableTimeframes, setAvailableTimeframes] = useState(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);
  
  const [strategy, setStrategy] = useState({
    name: '',
    description: '',
    type: '',
    pair: 'BTCUSDT',
    active: false,
    timeframes: ['1h'],
    parameters: {},
    riskSettings: {
      maxPositionSize: 0,
      stopLoss: 0,
      takeProfit: 0,
      trailingStop: false,
      trailingStopPercent: 0
    }
  });

  // Fetch available strategy types and trading pairs
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch strategy types
        const typesResponse = await axios.get(`${API_BASE_URL}/strategies/types`);
        if (typesResponse.data.success) {
          setStrategyTypes(typesResponse.data.types || []);
          // Set a default type if available
          if (typesResponse.data.types?.length && isNew) {
            setStrategy(prev => ({
              ...prev,
              type: typesResponse.data.types[0]
            }));
          }
        }
        
        // Fetch available pairs
        const pairsResponse = await axios.get(`${API_BASE_URL}/market/pairs`);
        if (pairsResponse.data.success) {
          setAvailablePairs(pairsResponse.data.pairs || []);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    
    fetchMetadata();
  }, [isNew]);

  // Fetch strategy data if editing existing
  useEffect(() => {
    if (!isNew) {
      const fetchStrategy = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await axios.get(`${API_BASE_URL}/strategies/${id}`);
          
          if (response.data.success) {
            setStrategy(response.data.strategy);
          } else {
            setError(response.data.error || 'Failed to fetch strategy data');
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching strategy:', error);
          setError('Failed to communicate with server');
          setLoading(false);
        }
      };
      
      fetchStrategy();
    }
  }, [id, isNew]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setStrategy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle parameter changes
  const handleParameterChange = (param, value) => {
    setStrategy(prev => ({
      ...prev,
      parameters: {
        ...(prev.parameters || {}),
        [param]: value
      }
    }));
  };

  // Handle risk setting changes
  const handleRiskSettingChange = (setting, value) => {
    setStrategy(prev => ({
      ...prev,
      riskSettings: {
        ...(prev.riskSettings || {}),
        [setting]: value
      }
    }));
  };

  // Handle timeframe selection
  const handleTimeframeToggle = (timeframe) => {
    setStrategy(prev => {
      const currentTimeframes = Array.isArray(prev.timeframes) ? [...prev.timeframes] : [];
      
      if (currentTimeframes.includes(timeframe)) {
        return {
          ...prev,
          timeframes: currentTimeframes.filter(tf => tf !== timeframe)
        };
      } else {
        return {
          ...prev,
          timeframes: [...currentTimeframes, timeframe]
        };
      }
    });
  };

  // Save strategy
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate required fields
      if (!strategy.name || !strategy.type || !strategy.pair) {
        setError('Required fields: Name, Type, and Trading Pair');
        setSaving(false);
        return;
      }
      
      // Validate at least one timeframe
      if (!strategy.timeframes.length) {
        setError('At least one timeframe must be selected');
        setSaving(false);
        return;
      }
      
      const endpoint = isNew 
        ? `${API_BASE_URL}/strategies` 
        : `${API_BASE_URL}/strategies/${id}`;
      
      const method = isNew ? 'post' : 'put';
      
      const response = await axios[method](endpoint, { strategy });
      
      if (response.data.success) {
        setSuccess('Strategy saved successfully');
        if (isNew) {
          // Navigate to edit mode for new strategy
          navigate(`/strategies/${response.data.strategyId}`);
        }
      } else {
        setError(response.data.error || 'Failed to save strategy');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving strategy:', error);
      setError('Failed to save strategy');
      setSaving(false);
    }
  };

  // Delete strategy
  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Are you sure you want to delete this strategy? This cannot be undone.')) {
      try {
        setLoading(true);
        
        const response = await axios.delete(`${API_BASE_URL}/strategies/${id}`);
        
        if (response.data.success) {
          navigate('/strategies');
        } else {
          setError(response.data.error || 'Failed to delete strategy');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error deleting strategy:', error);
        setError('Failed to delete strategy');
        setLoading(false);
      }
    }
  };

  // Render parameters based on strategy type
  const renderParameters = () => {
    // Different strategy types may have different parameters
    const parameterConfig = {
      'MA Crossover': [
        { name: 'shortPeriod', label: 'Short MA Period', type: 'number', default: 9 },
        { name: 'longPeriod', label: 'Long MA Period', type: 'number', default: 21 },
        { name: 'maType', label: 'MA Type', type: 'select', 
          options: ['SMA', 'EMA', 'WMA'], default: 'SMA' }
      ],
      'RSI': [
        { name: 'period', label: 'RSI Period', type: 'number', default: 14 },
        { name: 'overbought', label: 'Overbought Level', type: 'number', default: 70 },
        { name: 'oversold', label: 'Oversold Level', type: 'number', default: 30 }
      ],
      'MACD': [
        { name: 'fastPeriod', label: 'Fast Period', type: 'number', default: 12 },
        { name: 'slowPeriod', label: 'Slow Period', type: 'number', default: 26 },
        { name: 'signalPeriod', label: 'Signal Period', type: 'number', default: 9 }
      ],
      'Bollinger Bands': [
        { name: 'period', label: 'Period', type: 'number', default: 20 },
        { name: 'stdDev', label: 'Standard Deviation', type: 'number', default: 2 }
      ],
      'Grid Trading': [
        { name: 'upperPrice', label: 'Upper Price', type: 'number', default: 0 },
        { name: 'lowerPrice', label: 'Lower Price', type: 'number', default: 0 },
        { name: 'gridLevels', label: 'Grid Levels', type: 'number', default: 5 },
        { name: 'investmentAmount', label: 'Investment Amount', type: 'number', default: 100 }
      ],
      // Add more strategy types here
    };

    // Get parameters for the selected strategy type
    const params = parameterConfig[strategy.type] || [];

    // Initialize default values if they don't exist yet
    useEffect(() => {
      if (strategy.type && parameterConfig[strategy.type]) {
        setStrategy(prev => {
          const newParams = { ...prev.parameters };
          parameterConfig[strategy.type].forEach(param => {
            if (newParams[param.name] === undefined) {
              newParams[param.name] = param.default;
            }
          });
          return { ...prev, parameters: newParams };
        });
      }
    }, [strategy.type]);

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {params.map(param => (
          <div key={param.name}>
            <label htmlFor={param.name} className="block text-sm font-medium text-gray-700">
              {param.label}
            </label>
            {param.type === 'select' ? (
              <select
                id={param.name}
                name={param.name}
                value={strategy.parameters[param.name] || param.default}
                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {param.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={param.type}
                name={param.name}
                id={param.name}
                value={strategy.parameters[param.name] || param.default}
                onChange={(e) => {
                  const value = param.type === 'number' 
                    ? parseFloat(e.target.value) 
                    : e.target.value;
                  handleParameterChange(param.name, value);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isNew ? 'Create Strategy' : 'Edit Strategy'}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/strategies"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to List
            </Link>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <SaveIcon className="-ml-1 mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p>{success}</p>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading strategy...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Basic Strategy Information */}
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    General information about the trading strategy.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Strategy Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={strategy.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="strategyType" className="block text-sm font-medium text-gray-700">
                    Strategy Type *
                  </label>
                  <select
                    id="strategyType"
                    name="type"
                    value={strategy.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a type</option>
                    {strategyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={strategy.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="pair" className="block text-sm font-medium text-gray-700">
                    Trading Pair *
                  </label>
                  <select
                    id="pair"
                    name="pair"
                    value={strategy.pair}
                    onChange={(e) => handleInputChange('pair', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    {availablePairs.length === 0 ? (
                      <option value="BTCUSDT">BTCUSDT</option>
                    ) : (
                      availablePairs.map(pair => (
                        <option key={pair} value={pair}>{pair}</option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={strategy.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="active" className="font-medium text-gray-700">
                        Active
                      </label>
                      <p className="text-gray-500">Enable this strategy for automatic trading</p>
                    </div>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Timeframes *
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableTimeframes.map(timeframe => (
                      <button
                        key={timeframe}
                        type="button"
                        onClick={() => handleTimeframeToggle(timeframe)}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          strategy.timeframes.includes(timeframe)
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Select timeframes for the strategy to operate on
                  </p>
                </div>
                
                {/* Strategy-specific parameters */}
                {strategy.type && (
                  <>
                    <div className="sm:col-span-2 border-t border-gray-200 pt-5 mt-5">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Strategy Parameters</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Configure specific parameters for this strategy type.
                      </p>
                    </div>
                    
                    {renderParameters()}
                  </>
                )}
                
                {/* Risk Management Settings */}
                <div className="sm:col-span-2 border-t border-gray-200 pt-5 mt-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Risk Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure risk management settings for this strategy.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="maxPositionSize" className="block text-sm font-medium text-gray-700">
                    Max Position Size (% of capital)
                  </label>
                  <input
                    type="number"
                    name="maxPositionSize"
                    id="maxPositionSize"
                    value={strategy.riskSettings?.maxPositionSize || 0}
                    onChange={(e) => handleRiskSettingChange('maxPositionSize', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-700">
                    Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    name="stopLoss"
                    id="stopLoss"
                    value={strategy.riskSettings?.stopLoss || 0}
                    onChange={(e) => handleRiskSettingChange('stopLoss', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    0 = No stop loss, otherwise % below entry price
                  </p>
                </div>
                
                <div>
                  <label htmlFor="takeProfit" className="block text-sm font-medium text-gray-700">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    name="takeProfit"
                    id="takeProfit"
                    value={strategy.riskSettings?.takeProfit || 0}
                    onChange={(e) => handleRiskSettingChange('takeProfit', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    0 = No take profit, otherwise % above entry price
                  </p>
                </div>
                
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="trailingStop"
                        name="trailingStop"
                        type="checkbox"
                        checked={strategy.riskSettings?.trailingStop || false}
                        onChange={(e) => handleRiskSettingChange('trailingStop', e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="trailingStop" className="font-medium text-gray-700">
                        Use Trailing Stop
                      </label>
                      <p className="text-gray-500">
                        Stop loss will trail price by the percentage below
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="trailingStopPercent" className="block text-sm font-medium text-gray-700">
                    Trailing Stop (%)
                  </label>
                  <input
                    type="number"
                    name="trailingStopPercent"
                    id="trailingStopPercent"
                    value={strategy.riskSettings?.trailingStopPercent || 0}
                    onChange={(e) => handleRiskSettingChange('trailingStopPercent', parseFloat(e.target.value))}
                    disabled={!strategy.riskSettings?.trailingStop}
                    min="0.1"
                    step="0.1"
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      !strategy.riskSettings?.trailingStop ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyDetail;