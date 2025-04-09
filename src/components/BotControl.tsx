import { useState, useEffect, useCallback } from 'react';
import { startBot, stopBot, getBotStatus } from '../services/api';

interface BotControlProps {
  walletId: string;
}

interface BotConfig {
  symbol: string;
  interval_seconds: number;
  max_amount: number;
  wallet_id: string;
  strategy: string;
  buy_threshold?: number;
  sell_threshold?: number;
}

interface BotStatus {
  status: 'stopped' | 'running' | 'error';
  symbol: string | null;
  wallet_id: string | null;
  start_time: string | null;
  last_operation: string | null;
  error_message: string | null;
  config: BotConfig | null;
  timestamp: string;
}

const BotControl: React.FC<BotControlProps> = ({ walletId }) => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [maxAmount, setMaxAmount] = useState('100');
  const [strategy, setStrategy] = useState('simple');
  const [buyThreshold, setBuyThreshold] = useState('0.5');
  const [sellThreshold, setSellThreshold] = useState('1.0');
  
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusRefreshInterval, setStatusRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  const commonSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
    'XRPUSDT', 'DOTUSDT', 'LTCUSDT', 'LINKUSDT', 'BCHUSDT'
  ];

  // Function to fetch bot status
  const fetchBotStatus = useCallback(async () => {
    try {
      const status = await getBotStatus();
      setBotStatus(status);
    } catch (err) {
      console.error('Error fetching bot status:', err);
      // Don't set error message on status check failures to avoid cluttering the UI
    }
  }, []);

  // Setup auto-refresh of status when bot is running
  useEffect(() => {
    // If bot is running, start polling for status updates
    if (botStatus?.status === 'running' && !statusRefreshInterval) {
      const interval = setInterval(fetchBotStatus, 5000); // Update every 5 seconds
      setStatusRefreshInterval(interval);
    } 
    // If bot is not running, clear the interval
    else if (botStatus?.status !== 'running' && statusRefreshInterval) {
      clearInterval(statusRefreshInterval);
      setStatusRefreshInterval(null);
    }

    // Cleanup on unmount
    return () => {
      if (statusRefreshInterval) {
        clearInterval(statusRefreshInterval);
      }
    };
  }, [botStatus?.status, statusRefreshInterval, fetchBotStatus]);

  // Initial status check
  useEffect(() => {
    fetchBotStatus();
  }, [fetchBotStatus]);

  const handleStartBot = async () => {
    if (!walletId) {
      setError('Carteira não conectada. Conecte uma carteira primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config: BotConfig = {
        symbol,
        interval_seconds: intervalSeconds,
        max_amount: parseFloat(maxAmount),
        wallet_id: walletId,
        strategy,
        buy_threshold: parseFloat(buyThreshold),
        sell_threshold: parseFloat(sellThreshold)
      };

      await startBot(config);
      await fetchBotStatus(); // Update status after starting
      
    } catch (err) {
      console.error('Error starting bot:', err);
      setError(err instanceof Error ? err.message : 'Erro ao iniciar o bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await stopBot();
      await fetchBotStatus(); // Update status after stopping
      
    } catch (err) {
      console.error('Error stopping bot:', err);
      setError(err instanceof Error ? err.message : 'Erro ao parar o bot');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'N/A';
    return new Date(dateTimeStr).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Controle do Bot</h2>
      
      {/* Bot Status Display */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-2">Status do Bot</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Status:</span>
            <span className={`ml-2 font-medium ${
              botStatus?.status === 'running' ? 'text-green-600' : 
              botStatus?.status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {botStatus?.status === 'running' ? 'Em execução' : 
               botStatus?.status === 'error' ? 'Erro' : 
               botStatus?.status === 'stopped' ? 'Parado' : 'Desconhecido'}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Par:</span>
            <span className="ml-2">{botStatus?.symbol || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Carteira:</span>
            <span className="ml-2">{botStatus?.wallet_id ? botStatus.wallet_id.substring(0, 8) + '...' : 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 font-medium">Início:</span>
            <span className="ml-2">{formatDateTime(botStatus?.start_time || null)}</span>
          </div>
        </div>
        
        {botStatus?.last_operation && (
          <div className="mt-3 text-sm">
            <span className="text-gray-600 font-medium">Última operação:</span>
            <span className="ml-2">{botStatus.last_operation}</span>
          </div>
        )}
        
        {botStatus?.error_message && (
          <div className="mt-3 text-sm text-red-600">
            <span className="font-medium">Erro:</span>
            <span className="ml-2">{botStatus.error_message}</span>
          </div>
        )}
      </div>

      {/* Bot Configuration Form */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Configuração do Bot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="botSymbol" className="block text-sm font-medium text-gray-700 mb-1">
              Par de Trading
            </label>
            <select
              id="botSymbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={botStatus && botStatus.status === 'running' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {commonSymbols.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-1">
              Estratégia
            </label>
            <select
              id="strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={(botStatus?.status as string) === 'running' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="simple">Simples</option>
              <option value="grid">Grid Trading</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="intervalSeconds" className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo (segundos)
            </label>
            <input
              type="number"
              id="intervalSeconds"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 60)}
              min="5"
              max="3600"
              disabled={(botStatus?.status as string) === 'running' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Máximo (USDT)
            </label>
            <input
              type="text"
              id="maxAmount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              disabled={(botStatus?.status as string) === 'running' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="buyThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Limiar de Compra (%)
            </label>
            <input
              type="text"
              id="buyThreshold"
              value={buyThreshold}
              onChange={(e) => setBuyThreshold(e.target.value.replace(/[^0-9.]/g, ''))}
              disabled={botStatus?.status === 'running' as string || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="sellThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Limiar de Venda (%)
            </label>
            <input
              type="text"
              id="sellThreshold"
              value={sellThreshold}
              onChange={(e) => setSellThreshold(e.target.value.replace(/[^0-9.]/g, ''))}
              disabled={botStatus?.status === 'running' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          {botStatus?.status !== 'running' ? (
            <button
              onClick={handleStartBot}
              disabled={botStatus?.status === 'running' as string || isLoading}
              className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
              ${isLoading || !walletId ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Bot'}
            </button>
          ) : (
            <button
              onClick={handleStopBot}
              disabled={botStatus?.status === 'running' as string || isLoading}
              className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
              ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              {isLoading ? 'Parando...' : 'Parar Bot'}
            </button>
          )}
          
          <button
            onClick={fetchBotStatus}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Atualizar Status
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p className="mb-1">
          <strong>Importante:</strong> Configure cuidadosamente o bot antes de iniciá-lo.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Limiar de Compra: porcentagem de queda para acionar compra</li>
          <li>Limiar de Venda: porcentagem de aumento para acionar venda</li>
          <li>Defina o valor máximo de acordo com o saldo disponível na sua carteira</li>
        </ul>
      </div>
    </div>
  );
};

export default BotControl;