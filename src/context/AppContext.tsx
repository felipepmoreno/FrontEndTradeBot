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
  const [walletId, setWalletId] = useState<string | null>(
    localStorage.getItem('walletId')
  );
  const [balances, setBalances] = useState<WalletBalanceResponse | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatusResponse | null>(null);
  const [orders, setOrders] = useState<OrderList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTCUSDT');

  // Save wallet ID to localStorage when it changes
  useEffect(() => {
    if (walletId) {
      localStorage.setItem('walletId', walletId);
    } else {
      localStorage.removeItem('walletId');
    }
  }, [walletId]);

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
  }, []);

  // Refresh balances
  const refreshBalances = async () => {
    if (!walletId) return;
    
    try {
      setIsLoading(true);
      const response = await walletApi.getBalance(walletId);
      setBalances(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setError('Failed to fetch wallet balances');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh bot status
  const refreshBotStatus = async () => {
    try {
      const response = await botApi.getStatus();
      setBotStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bot status:', err);
      setError('Failed to fetch bot status');
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    if (!walletId) return;
    
    try {
      setIsLoading(true);
      const response = await tradingApi.getOrders(walletId, activeSymbol);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders');
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
      console.error('Failed to start bot:', err);
      setError(err.response?.data?.detail || 'Failed to start bot');
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
      console.error('Failed to stop bot:', err);
      setError(err.response?.data?.detail || 'Failed to stop bot');
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