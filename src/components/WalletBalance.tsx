import { useState, useEffect } from 'react';
import { getWalletBalance } from '../services/api';

interface WalletBalanceProps {
  walletId: string;
}

interface Asset {
  asset: string;
  free: string;
  locked: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ walletId }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getWalletBalance(walletId);
      
      // Sort by asset value (free amount)
      const sortedAssets = data.balances
        .filter((asset: Asset) => 
          parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0
        )
        .sort((a: Asset, b: Asset) => 
          parseFloat(b.free) - parseFloat(a.free)
        );
      
      setAssets(sortedAssets);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar saldos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletId) {
      fetchBalances();
    }
  }, [walletId]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (num === 0) return '0';
    
    if (num < 0.001) {
      return num.toExponential(4);
    }
    
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Saldo da Carteira</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBalances}
            disabled={isLoading}
            className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded text-sm focus:outline-none"
            title="Atualizar saldos"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="text-xs text-gray-500 mb-3">
          Última atualização: {lastUpdated.toLocaleString()}
        </p>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && !assets.length ? (
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-500">Carregando saldos...</span>
        </div>
      ) : assets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ativo
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponível
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Em uso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.asset}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {asset.asset}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(asset.free)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(asset.locked)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Nenhum ativo encontrado. Se você acabou de conectar sua carteira, talvez precise depositar fundos.
        </div>
      )}
    </div>
  );
};

export default WalletBalance;