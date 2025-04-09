import { useState } from 'react';
import { connectWallet } from '../services/api';

interface WalletConnectProps {
  onConnect: (walletId: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [useTestnet, setUseTestnet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !apiSecret) {
      setError('Por favor, preencha ambos API Key e API Secret');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await connectWallet(apiKey, apiSecret, useTestnet);
      
      if (response && response.wallet_id) {
        onConnect(response.wallet_id);
      } else {
        setError('Resposta inválida da API');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a Binance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Conectar Carteira</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Cole sua Binance API Key aqui"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-1">
            API Secret
          </label>
          <input
            type="password"
            id="apiSecret"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Cole seu Binance API Secret aqui"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="useTestnet"
              type="checkbox"
              checked={useTestnet}
              onChange={(e) => setUseTestnet(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="useTestnet" className="ml-2 block text-sm text-gray-700">
              Usar Testnet (recomendado)
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            A Testnet permite testar o bot sem usar dinheiro real. Obtenha credenciais de teste em <a href="https://testnet.binance.vision/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">testnet.binance.vision</a>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Conectando...' : 'Conectar'}
        </button>
      </form>
    </div>
  );
};

export default WalletConnect;