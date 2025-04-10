import React from 'react';
import { useApp } from '../context/AppContext';

const WalletBalance: React.FC = () => {
  const { balances, refreshBalances, isLoading, walletId, error } = useApp();

  const handleRefresh = () => {
    refreshBalances();
  };

  // Filter to only show common crypto assets
  const relevantBalances = balances?.balances.filter(
    balance => 
      parseFloat(balance.free.toString()) > 0 || 
      parseFloat(balance.locked.toString()) > 0
  ).slice(0, 8);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Saldo da Carteira</h2>
        <button 
          onClick={handleRefresh}
          disabled={isLoading || !walletId}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-sm flex items-center"
        >
          {isLoading ? (
            <span>Atualizando...</span>
          ) : (
            <span>Atualizar</span>
          )}
        </button>
      </div>

      {!walletId && (
        <div className="text-center py-8 text-gray-500">
          Conecte sua carteira para ver os saldos
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {walletId && balances && (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Ativo</th>
                  <th className="py-2 px-4 text-right">Disponível</th>
                  <th className="py-2 px-4 text-right">Em Uso</th>
                </tr>
              </thead>
              <tbody>
                {relevantBalances && relevantBalances.length > 0 ? (
                  relevantBalances.map((balance) => (
                    <tr key={balance.asset} className="border-t border-gray-200">
                      <td className="py-2 px-4 font-medium">{balance.asset}</td>
                      <td className="py-2 px-4 text-right">{parseFloat(balance.free.toString()).toFixed(8)}</td>
                      <td className="py-2 px-4 text-right">{parseFloat(balance.locked.toString()).toFixed(8)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      Nenhum saldo encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right">
            Última atualização: {new Date(balances.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;