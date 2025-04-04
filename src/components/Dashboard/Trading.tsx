import React from 'react';

const TradingBotDashboard = () => {
  // Dados mockados para visualização
  const portfolioValue = 15742.38;
  const dailyChange = 3.24;
  const activeStrategies = 3;
  const activePositions = 5;
  const recentTrades = [
    { id: 1, pair: 'BTC/USDT', type: 'BUY', amount: 0.05, price: 38420.50, time: '14:32:45', profit: null },
    { id: 2, pair: 'ETH/USDT', type: 'SELL', amount: 1.2, price: 2105.75, time: '13:45:12', profit: '+2.3%' },
    { id: 3, pair: 'SOL/USDT', type: 'BUY', amount: 12, price: 103.42, time: '12:30:05', profit: null },
    { id: 4, pair: 'BNB/USDT', type: 'SELL', amount: 2.5, price: 412.80, time: '11:22:36', profit: '-0.8%' },
    { id: 5, pair: 'ADA/USDT', type: 'BUY', amount: 500, price: 0.58, time: '10:15:22', profit: null },
  ];
  
  const strategies = [
    { id: 1, name: 'Grid Trading BTC', status: 'Ativo', dailyReturn: '+1.2%', pairCount: 1 },
    { id: 2, name: 'DCA ETH Semanal', status: 'Ativo', dailyReturn: '+0.8%', pairCount: 1 },
    { id: 3, name: 'Médias Móveis Multi-Pares', status: 'Ativo', dailyReturn: '+1.4%', pairCount: 3 },
    { id: 4, name: 'RSI Scalping', status: 'Inativo', dailyReturn: '0%', pairCount: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CryptoTradeBot</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-700 px-3 py-1 rounded">
              <span className="font-medium">Status:</span> Operando
            </div>
            <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
              Parar Bot
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Valor do Portfólio</h3>
            <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Variação Diária</h3>
            <p className={`text-2xl font-bold ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dailyChange >= 0 ? '+' : ''}{dailyChange}%
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Estratégias Ativas</h3>
            <p className="text-2xl font-bold">{activeStrategies}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-gray-500 text-sm">Posições Abertas</h3>
            <p className="text-2xl font-bold">{activePositions}</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Performance do Portfólio</h2>
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Performance (TradingView Chart)</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Alocação de Ativos</h2>
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de Alocação (Pie Chart)</p>
            </div>
          </div>
        </div>

        {/* Active Strategies */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Estratégias</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Nova Estratégia
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retorno Diário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {strategies.map((strategy) => (
                  <tr key={strategy.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{strategy.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        strategy.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {strategy.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      parseFloat(strategy.dailyReturn) > 0 ? 'text-green-500' : 
                      parseFloat(strategy.dailyReturn) < 0 ? 'text-red-500' : ''
                    }`}>
                      {strategy.dailyReturn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{strategy.pairCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                      <button className={`${
                        strategy.status === 'Ativo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}>
                        {strategy.status === 'Ativo' ? 'Parar' : 'Iniciar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Trades Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Par</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro/Perda</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{trade.pair}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{trade.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${trade.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{trade.time}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      trade.profit && trade.profit.startsWith('+') ? 'text-green-500' :
                      trade.profit && trade.profit.startsWith('-') ? 'text-red-500' : ''
                    }`}>
                      {trade.profit || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TradingBotDashboard;