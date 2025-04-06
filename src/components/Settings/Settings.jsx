import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    api: {
      binanceApiKey: '',
      binanceApiSecret: '',
      testMode: false
    },
    risk: {
      maxDailyLoss: 3.0,
      maxPositionSize: 5.0,
      maxOpenPositions: 10,
      maxLeveragePerTrade: 1.0,
      stopLossRequired: true,
      maxRiskPerTrade: 1.0,
      volatilityMultiplier: 1.0,
      maxConcentrationPerAsset: 15.0,
      minRiskRewardRatio: 1.5,
      highVolatilityThreshold: 5.0
    },
    notifications: {
      emailEnabled: false,
      emailAddress: '',
      telegramEnabled: false,
      telegramChatId: '',
      notifyOnTrade: true,
      notifyOnError: true,
      notifyDailyReport: true
    },
    system: {
      loggingLevel: 'info',
      autoStart: false,
      maintenanceMode: false,
      backupInterval: 24
    }
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/settings`);
        
        if (response.data.success) {
          setSettings(response.data.settings);
        } else {
          setError(response.data.error || 'Failed to fetch settings');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to communicate with server');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (category, setting, value) => {
    // For checkboxes and number inputs, handle the conversion
    if (typeof settings[category][setting] === 'boolean') {
      value = Boolean(value);
    } else if (typeof settings[category][setting] === 'number') {
      value = Number(value);
    }

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(`${API_BASE_URL}/settings`, { settings });
      
      if (response.data.success) {
        setSuccess('Settings saved successfully');
      } else {
        setError(response.data.error || 'Failed to save settings');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to communicate with server');
      setSaving(false);
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(`${API_BASE_URL}/settings/test-api`, {
        apiKey: settings.api.binanceApiKey,
        apiSecret: settings.api.binanceApiSecret,
        testMode: settings.api.testMode
      });
      
      if (response.data.success) {
        setSuccess('API connection successful!');
      } else {
        setError(response.data.error || 'API connection failed');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error testing API connection:', error);
      setError('Failed to test API connection');
      setLoading(false);
    }
  };

  // Create backup
  const createBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(`${API_BASE_URL}/settings/backup`);
      
      if (response.data.success) {
        setSuccess('Backup created successfully');
      } else {
        setError(response.data.error || 'Failed to create backup');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      setError('Failed to create backup');
      setLoading(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        const response = await axios.post(`${API_BASE_URL}/settings/reset`);
        
        if (response.data.success) {
          setSettings(response.data.settings);
          setSuccess('Settings reset to defaults');
        } else {
          setError(response.data.error || 'Failed to reset settings');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error resetting settings:', error);
        setError('Failed to reset settings');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Settings
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={createBackup}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading || saving}
            >
              Create Backup
            </button>
            <button
              type="button"
              onClick={resetSettings}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading || saving}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading || saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
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
            <p className="text-lg">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Settings */}
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  API Configuration
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure your Binance API credentials for trading
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="binanceApiKey" className="block text-sm font-medium text-gray-700">
                      Binance API Key
                    </label>
                    <input
                      type="password"
                      name="binanceApiKey"
                      id="binanceApiKey"
                      value={settings.api.binanceApiKey}
                      onChange={(e) => handleInputChange('api', 'binanceApiKey', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="binanceApiSecret" className="block text-sm font-medium text-gray-700">
                      Binance API Secret
                    </label>
                    <input
                      type="password"
                      name="binanceApiSecret"
                      id="binanceApiSecret"
                      value={settings.api.binanceApiSecret}
                      onChange={(e) => handleInputChange('api', 'binanceApiSecret', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="testMode"
                          name="testMode"
                          type="checkbox"
                          checked={settings.api.testMode}
                          onChange={(e) => handleInputChange('api', 'testMode', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="testMode" className="font-medium text-gray-700">
                          Test Mode (Use Binance Testnet)
                        </label>
                        <p className="text-gray-500">
                          When enabled, all trading will occur on the Binance testnet instead of the live exchange.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={testApiConnection}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={loading || saving}
                  >
                    Test API Connection
                  </button>
                </div>
              </div>
            </div>
            
            {/* Risk Management Settings */}
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Risk Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure risk parameters to protect your capital
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="maxDailyLoss" className="block text-sm font-medium text-gray-700">
                      Max Daily Loss (%)
                    </label>
                    <input
                      type="number"
                      name="maxDailyLoss"
                      id="maxDailyLoss"
                      value={settings.risk.maxDailyLoss}
                      onChange={(e) => handleInputChange('risk', 'maxDailyLoss', e.target.value)}
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPositionSize" className="block text-sm font-medium text-gray-700">
                      Max Position Size (%)
                    </label>
                    <input
                      type="number"
                      name="maxPositionSize"
                      id="maxPositionSize"
                      value={settings.risk.maxPositionSize}
                      onChange={(e) => handleInputChange('risk', 'maxPositionSize', e.target.value)}
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxOpenPositions" className="block text-sm font-medium text-gray-700">
                      Max Open Positions
                    </label>
                    <input
                      type="number"
                      name="maxOpenPositions"
                      id="maxOpenPositions"
                      value={settings.risk.maxOpenPositions}
                      onChange={(e) => handleInputChange('risk', 'maxOpenPositions', e.target.value)}
                      min="1"
                      step="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxLeveragePerTrade" className="block text-sm font-medium text-gray-700">
                      Max Leverage Per Trade
                    </label>
                    <input
                      type="number"
                      name="maxLeveragePerTrade"
                      id="maxLeveragePerTrade"
                      value={settings.risk.maxLeveragePerTrade}
                      onChange={(e) => handleInputChange('risk', 'maxLeveragePerTrade', e.target.value)}
                      min="1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxRiskPerTrade" className="block text-sm font-medium text-gray-700">
                      Max Risk Per Trade (%)
                    </label>
                    <input
                      type="number"
                      name="maxRiskPerTrade"
                      id="maxRiskPerTrade"
                      value={settings.risk.maxRiskPerTrade}
                      onChange={(e) => handleInputChange('risk', 'maxRiskPerTrade', e.target.value)}
                      min="0.1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxConcentrationPerAsset" className="block text-sm font-medium text-gray-700">
                      Max Concentration Per Asset (%)
                    </label>
                    <input
                      type="number"
                      name="maxConcentrationPerAsset"
                      id="maxConcentrationPerAsset"
                      value={settings.risk.maxConcentrationPerAsset}
                      onChange={(e) => handleInputChange('risk', 'maxConcentrationPerAsset', e.target.value)}
                      min="1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="minRiskRewardRatio" className="block text-sm font-medium text-gray-700">
                      Min Risk-Reward Ratio
                    </label>
                    <input
                      type="number"
                      name="minRiskRewardRatio"
                      id="minRiskRewardRatio"
                      value={settings.risk.minRiskRewardRatio}
                      onChange={(e) => handleInputChange('risk', 'minRiskRewardRatio', e.target.value)}
                      min="0.1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="volatilityMultiplier" className="block text-sm font-medium text-gray-700">
                      Volatility Multiplier
                    </label>
                    <input
                      type="number"
                      name="volatilityMultiplier"
                      id="volatilityMultiplier"
                      value={settings.risk.volatilityMultiplier}
                      onChange={(e) => handleInputChange('risk', 'volatilityMultiplier', e.target.value)}
                      min="0.1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="highVolatilityThreshold" className="block text-sm font-medium text-gray-700">
                      High Volatility Threshold (%)
                    </label>
                    <input
                      type="number"
                      name="highVolatilityThreshold"
                      id="highVolatilityThreshold"
                      value={settings.risk.highVolatilityThreshold}
                      onChange={(e) => handleInputChange('risk', 'highVolatilityThreshold', e.target.value)}
                      min="1"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="stopLossRequired"
                          name="stopLossRequired"
                          type="checkbox"
                          checked={settings.risk.stopLossRequired}
                          onChange={(e) => handleInputChange('risk', 'stopLossRequired', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="stopLossRequired" className="font-medium text-gray-700">
                          Require Stop Loss for All Trades
                        </label>
                        <p className="text-gray-500">
                          When enabled, all trades must include a stop loss order.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notifications
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure how and when you receive notifications
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="emailEnabled"
                          name="emailEnabled"
                          type="checkbox"
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) => handleInputChange('notifications', 'emailEnabled', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailEnabled" className="font-medium text-gray-700">
                          Enable Email Notifications
                        </label>
                      </div>
                    </div>
                    <div className={!settings.notifications.emailEnabled ? 'opacity-50' : ''}>
                      <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        value={settings.notifications.emailAddress}
                        onChange={(e) => handleInputChange('notifications', 'emailAddress', e.target.value)}
                        disabled={!settings.notifications.emailEnabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="telegramEnabled"
                          name="telegramEnabled"
                          type="checkbox"
                          checked={settings.notifications.telegramEnabled}
                          onChange={(e) => handleInputChange('notifications', 'telegramEnabled', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="telegramEnabled" className="font-medium text-gray-700">
                          Enable Telegram Notifications
                        </label>
                      </div>
                    </div>
                    <div className={!settings.notifications.telegramEnabled ? 'opacity-50' : ''}>
                      <label htmlFor="telegramChatId" className="block text-sm font-medium text-gray-700">
                        Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        name="telegramChatId"
                        id="telegramChatId"
                        value={settings.notifications.telegramChatId}
                        onChange={(e) => handleInputChange('notifications', 'telegramChatId', e.target.value)}
                        disabled={!settings.notifications.telegramEnabled}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="notifyOnTrade"
                          name="notifyOnTrade"
                          type="checkbox"
                          checked={settings.notifications.notifyOnTrade}
                          onChange={(e) => handleInputChange('notifications', 'notifyOnTrade', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnTrade" className="font-medium text-gray-700">
                          Notify on Trade Execution
                        </label>
                        <p className="text-gray-500">
                          Receive notifications when trades are opened or closed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="notifyOnError"
                          name="notifyOnError"
                          type="checkbox"
                          checked={settings.notifications.notifyOnError}
                          onChange={(e) => handleInputChange('notifications', 'notifyOnError', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnError" className="font-medium text-gray-700">
                          Notify on Errors
                        </label>
                        <p className="text-gray-500">
                          Receive notifications about system errors and warnings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifyDailyReport"
                          name="notifyDailyReport"
                          type="checkbox"
                          checked={settings.notifications.notifyDailyReport}
                          onChange={(e) => handleInputChange('notifications', 'notifyDailyReport', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyDailyReport" className="font-medium text-gray-700">
                          Daily Performance Report
                        </label>
                        <p className="text-gray-500">
                          Receive a daily summary of trading performance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* System Settings */}
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  System Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure general system behavior
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="loggingLevel" className="block text-sm font-medium text-gray-700">
                      Logging Level
                    </label>
                    <select
                      id="loggingLevel"
                      name="loggingLevel"
                      value={settings.system.loggingLevel}
                      onChange={(e) => handleInputChange('system', 'loggingLevel', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="backupInterval" className="block text-sm font-medium text-gray-700">
                      Backup Interval (hours)
                    </label>
                    <input
                      type="number"
                      name="backupInterval"
                      id="backupInterval"
                      value={settings.system.backupInterval}
                      onChange={(e) => handleInputChange('system', 'backupInterval', e.target.value)}
                      min="1"
                      step="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <input
                          id="autoStart"
                          name="autoStart"
                          type="checkbox"
                          checked={settings.system.autoStart}
                          onChange={(e) => handleInputChange('system', 'autoStart', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="autoStart" className="font-medium text-gray-700">
                          Auto-start Trading Engine
                        </label>
                        <p className="text-gray-500">
                          Automatically start the trading engine when the application launches
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="maintenanceMode"
                          name="maintenanceMode"
                          type="checkbox"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                          Maintenance Mode
                        </label>
                        <p className="text-gray-500">
                          When enabled, the trading engine will not execute any trades, but will continue to monitor the market
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;