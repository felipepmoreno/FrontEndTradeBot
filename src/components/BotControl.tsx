import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BotStatus, BotStrategy } from '../types';

const TRADING_PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'];

const BotControl: React.FC = () => {
  const { walletId, refreshOrders, startBot, stopBot, botStatus: contextBotStatus, refreshBotStatus } = useApp();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [maxAmount, setMaxAmount] = useState<number>(100);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [buyThreshold, setBuyThreshold] = useState<number>(0.5);
  const [sellThreshold, setSellThreshold] = useState<number>(1.0);
  const [strategy, setStrategy] = useState<BotStrategy>(BotStrategy.SIMPLE);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get bot status on component mount and periodically
  useEffect(() => {
    refreshBotStatus();
    
    const intervalId = setInterval(() => {
      refreshBotStatus();
    }, 5000);  // Poll every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Update form fields when bot status changes
  useEffect(() => {
    if (contextBotStatus?.status === 'running' && contextBotStatus.config) {
      const config = contextBotStatus.config;
      setSymbol(config.symbol || 'BTCUSDT');
      setMaxAmount(config.max_amount || 100);
      setIntervalSeconds(config.interval_seconds || 60);
      setBuyThreshold(config.buy_threshold || 0.5);
      setSellThreshold(config.sell_threshold || 1.0);
      setStrategy(config.strategy || BotStrategy.SIMPLE);
    }
  }, [contextBotStatus]);

  const handleStartBot = async () => {
    if (!walletId) {
      setError("Por favor, conecte sua carteira antes de iniciar o bot");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await startBot({
        symbol,
        wallet_id: walletId,
        max_amount: maxAmount,
        interval_seconds: intervalSeconds,
        buy_threshold: buyThreshold,
        sell_threshold: sellThreshold,
        strategy
      });
      
      // Refresh orders to show any new activity
      refreshOrders();
    } catch (err: any) {
      console.error("Failed to start bot:", err);
      setError(err.response?.data?.detail || 'Falha ao iniciar o bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await stopBot();
      // Refresh orders to show any new activity
      refreshOrders();
    } catch (err: any) {
      console.error("Failed to stop bot:", err);
      setError(err.response?.data?.detail || 'Falha ao parar o bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Status indicator color
  const getStatusColor = () => {
    if (!contextBotStatus) return 'bg-gray-500';
    switch (contextBotStatus.status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'error':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!contextBotStatus) return 'Carregando...';
    switch (contextBotStatus.status) {
      case 'running':
        return 'Ativo';
      case 'stopped':
        return 'Parado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Controle do Bot</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {contextBotStatus?.error_message && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Erro do bot: {contextBotStatus.error_message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Par de Trading
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {TRADING_PAIRS.map((pair) => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Estratégia
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as BotStrategy)}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={BotStrategy.SIMPLE}>Simples</option>
            <option value={BotStrategy.GRID}>Grid</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Valor Máximo (USDT)
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={maxAmount}
            onChange={(e) => setMaxAmount(Number(e.target.value))}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Intervalo (segundos)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Limiar de Compra (%)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={buyThreshold}
            onChange={(e) => setBuyThreshold(Number(e.target.value))}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Limiar de Venda (%)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={sellThreshold}
            onChange={(e) => setSellThreshold(Number(e.target.value))}
            disabled={contextBotStatus?.status === 'running' || isLoading}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
          <span className="text-gray-700 font-medium">Status: {getStatusText()}</span>
        </div>
        {contextBotStatus?.last_operation && (
          <div className="text-sm text-gray-600 mt-2">
            Última operação: {contextBotStatus.last_operation}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleStartBot}
          disabled={!walletId || contextBotStatus?.status === 'running' || isLoading}
          className={`w-1/2 py-3 px-4 rounded font-bold ${
            !walletId || contextBotStatus?.status === 'running' || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isLoading && contextBotStatus?.status !== 'running' ? 'Iniciando...' : 'Iniciar Bot'}
        </button>

        <button
          onClick={handleStopBot}
          disabled={contextBotStatus?.status !== 'running' || isLoading}
          className={`w-1/2 py-3 px-4 rounded font-bold ${
            contextBotStatus?.status !== 'running' || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isLoading && contextBotStatus?.status === 'running' ? 'Parando...' : 'Parar Bot'}
        </button>
      </div>
    </div>
  );
};

export default BotControl;