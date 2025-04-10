import React, { useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import WalletBalance from './components/WalletBalance';
import BotControl from './components/BotControl';
import OrderHistory from './components/OrderHistory';
import { useApp } from './context/AppContext';

const App: React.FC = () => {
  const { walletId, refreshOrders, refreshBotStatus, refreshBalances } = useApp();

  // Atualiza os dados ao montar o componente se já estiver conectado a uma carteira
  useEffect(() => {
    if (walletId) {
      refreshBalances();
      refreshOrders();
      refreshBotStatus();
    }
  }, [walletId]);

  return (
    <div className="container mx-auto p-4 text-gray-800">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Trading Bot Binance</h1>
        <p className="text-gray-600">Conecte sua carteira e comece a operar automaticamente</p>
      </header>

      <main>
        <WalletConnect />
        {walletId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletBalance />
              <BotControl />
            </div>
            <OrderHistory />
          </>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Trading Bot Binance &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Use por sua conta e risco. Não nos responsabilizamos por perdas financeiras.</p>
      </footer>
    </div>
  );
};

export default App;