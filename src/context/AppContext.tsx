import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  WalletBalanceResponse, 
  BotStatusResponse, 
  OrderList, 
  BotStatus, 
  BotConfig 
} from '../types';
import { walletApi, botApi, tradingApi } from '../services/api';

interface AppContextType {
  walletId: string | null;
  setWalletId: (id: string | null) => void;
  balances: WalletBalanceResponse | null;
  refreshBalances: () => Promise<void>;
  botStatus: BotStatusResponse | null;
  refreshBotStatus: () => Promise<void>;
  orders: OrderList | null;
  refreshOrders: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  startBot: (config: BotConfig) => Promise<void>;
  stopBot: () => Promise<void>;
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State variables
  const [walletId, setWalletIdState] = useState<string | null>(
    localStorage.getItem('walletId')
  );
  const [balances, setBalances] = useState<WalletBalanceResponse | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatusResponse | null>(null);
  const [orders, setOrders] = useState<OrderList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTCUSDT');

  // Função para atualizar wallet ID no estado e localStorage
  const setWalletId = (id: string | null) => {
    setWalletIdState(id);
    if (id) {
      localStorage.setItem('walletId', id);
    } else {
      localStorage.removeItem('walletId');
    }
  };

  // Auto-refresh balances every minute if wallet is connected
  useEffect(() => {
    if (walletId) {
      refreshBalances();
      const intervalId = setInterval(() => {
        refreshBalances();
      }, 60000); // Every minute
      
      return () => clearInterval(intervalId);
    }
  }, [walletId]);

  // Auto-refresh bot status every 5 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (walletId) {
        refreshBotStatus();
      }
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [walletId]);

  // Refresh balances
  const refreshBalances = async () => {
    if (!walletId) return;
    
    try {
      setIsLoading(true);
      const response = await walletApi.getBalance(walletId);
      
      // Verificando se a resposta contém os dados esperados
      if (response.data && Array.isArray(response.data.balances)) {
        setBalances(response.data);
        setError(null);
      } else {
        console.error('Formato de resposta inválido para balances:', response.data);
        setError('Formato de resposta do saldo inválido');
      }
    } catch (err: any) {
      console.error('Erro ao buscar saldos:', err);
      if (err.response) {
        setError(`Erro ao buscar saldos: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError('Erro ao buscar saldos da carteira');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh bot status
  const refreshBotStatus = async () => {
    try {
      const response = await botApi.getStatus();
      
      if (response.data && response.data.status) {
        setBotStatus(response.data);
        setError(null);
      } else {
        console.error('Formato de resposta inválido para status do bot:', response.data);
        setError('Formato de resposta do status do bot inválido');
      }
    } catch (err: any) {
      console.error('Erro ao buscar status do bot:', err);
      if (err.response) {
        setError(`Erro ao buscar status do bot: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError('Erro ao buscar status do bot');
      }
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    if (!walletId) return;
    
    try {
      setIsLoading(true);
      const response = await tradingApi.getOrders(walletId, activeSymbol);
      
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data);
        setError(null);
      } else {
        console.error('Formato de resposta inválido para ordens:', response.data);
        setError('Formato de resposta de ordens inválido');
      }
    } catch (err: any) {
      console.error('Erro ao buscar ordens:', err);
      if (err.response) {
        setError(`Erro ao buscar ordens: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError('Erro ao buscar ordens');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start bot
  const startBot = async (config: BotConfig) => {
    try {
      setIsLoading(true);
      await botApi.start(
        config.wallet_id,
        config.symbol,
        config.max_amount,
        config.interval_seconds,
        config.strategy,
        config.buy_threshold,
        config.sell_threshold
      );
      await refreshBotStatus();
      setError(null);
    } catch (err: any) {
      console.error('Erro ao iniciar bot:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response) {
        setError(`Erro ao iniciar bot: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError('Erro ao iniciar bot');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Stop bot
  const stopBot = async () => {
    try {
      setIsLoading(true);
      await botApi.stop();
      await refreshBotStatus();
      setError(null);
    } catch (err: any) {
      console.error('Erro ao parar bot:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response) {
        setError(`Erro ao parar bot: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError('Erro ao parar bot');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    walletId,
    setWalletId,
    balances,
    refreshBalances,
    botStatus,
    refreshBotStatus,
    orders,
    refreshOrders,
    isLoading,
    error,
    startBot,
    stopBot,
    activeSymbol,
    setActiveSymbol,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the App context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};