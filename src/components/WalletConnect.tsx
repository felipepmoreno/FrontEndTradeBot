import React, { useState } from 'react';
import { walletApi } from '../services/api';
import { useApp } from '../context/AppContext';

const WalletConnect: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWalletId, walletId } = useApp();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !apiSecret) {
      setError('API Key and Secret are required');
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      const response = await walletApi.connect(apiKey, apiSecret, true);
      setWalletId(response.data.wallet_id);
      
      // Clear form
      setApiKey('');
      setApiSecret('');
    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.response?.data?.detail || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletId(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Conectar Carteira</h2>
      
      {walletId ? (
        <div className="text-center">
          <p className="mb-4 text-green-600">
            Carteira conectada com sucesso!
          </p>
          <p className="mb-4 text-gray-600 text-sm">
            ID da Carteira: <span className="font-mono">{walletId.substring(0, 8)}...</span>
          </p>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Desconectar
          </button>
        </div>
      ) : (
        <form onSubmit={handleConnect}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
              API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Insira sua API Key da Binance"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiSecret">
              Secret Key
            </label>
            <input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Insira sua Secret Key da Binance"
              required
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isConnecting}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isConnecting ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WalletConnect;