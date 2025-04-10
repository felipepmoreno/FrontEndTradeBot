import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderResponse, OrderSide, OrderStatus } from '../types';

const OrderHistory: React.FC = () => {
  const { orders, refreshOrders, walletId, isLoading, activeSymbol, setActiveSymbol } = useApp();
  const [page, setPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (walletId) {
      refreshOrders();
    }
  }, [walletId, activeSymbol]);

  const handleRefresh = () => {
    refreshOrders();
  };

  // Função para renderizar o status da ordem com cores diferentes
  const renderStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.FILLED:
        return <span className="text-green-600">{status}</span>;
      case OrderStatus.CANCELED:
      case OrderStatus.REJECTED:
      case OrderStatus.EXPIRED:
        return <span className="text-red-500">{status}</span>;
      case OrderStatus.PARTIALLY_FILLED:
        return <span className="text-yellow-500">{status}</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  // Função para formatar o valor
  const formatValue = (order: OrderResponse) => {
    const value = order.price 
      ? (order.price * order.quantity) 
      : order.cumulative_quote_quantity;
    
    return `${value.toFixed(2)} USDT`;
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  // Paginação
  const totalPages = orders?.orders 
    ? Math.ceil(orders.orders.length / ordersPerPage) 
    : 0;
  
  const paginatedOrders = orders?.orders 
    ? orders.orders.slice((page - 1) * ordersPerPage, page * ordersPerPage) 
    : [];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Últimas Operações</h2>
        <div className="flex items-center">
          <select
            value={activeSymbol}
            onChange={(e) => setActiveSymbol(e.target.value)}
            className="mr-2 border rounded p-1"
          >
            <option value="BTCUSDT">BTCUSDT</option>
            <option value="ETHUSDT">ETHUSDT</option>
            <option value="BNBUSDT">BNBUSDT</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={isLoading || !walletId}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-sm flex items-center"
          >
            {isLoading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {!walletId && (
        <div className="text-center py-8 text-gray-500">
          Conecte sua carteira para ver o histórico de operações
        </div>
      )}

      {walletId && (!orders?.orders || orders.orders.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma operação encontrada
        </div>
      )}

      {walletId && orders?.orders && orders.orders.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Tipo</th>
                  <th className="py-2 px-4 text-left">Par</th>
                  <th className="py-2 px-4 text-right">Quantidade</th>
                  <th className="py-2 px-4 text-right">Valor</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.order_id} className="border-t border-gray-200">
                    <td className={`py-2 px-4 ${order.side === OrderSide.BUY ? 'text-green-600' : 'text-red-500'} font-medium`}>
                      {order.side === OrderSide.BUY ? 'Compra' : 'Venda'}
                    </td>
                    <td className="py-2 px-4">{order.symbol}</td>
                    <td className="py-2 px-4 text-right">{order.quantity.toFixed(8)}</td>
                    <td className="py-2 px-4 text-right">{formatValue(order)}</td>
                    <td className="py-2 px-4">{renderStatus(order.status)}</td>
                    <td className="py-2 px-4">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação simples */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Anterior
              </button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {orders && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          Última atualização: {new Date(orders.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;