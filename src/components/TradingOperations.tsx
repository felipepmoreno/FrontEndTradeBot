import { useState, useEffect } from 'react';
import { placeBuyOrder, placeSellOrder, getOrders } from '../services/api';

interface TradingOperationsProps {
  walletId: string;
}

interface Order {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: string;
  origQty: string;
  status: string;
  time: number;
}

const TRADING_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
  'DOGEUSDT', 'DOTUSDT', 'LTCUSDT', 'LINKUSDT', 'SOLUSDT'
];

const TradingOperations: React.FC<TradingOperationsProps> = ({ walletId }) => {
  // Order form state
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [isMarketOrder, setIsMarketOrder] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Orders history state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Fetch order history on component mount
  useEffect(() => {
    fetchOrders();
  }, [walletId]);

  // Fetch order history
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    
    try {
      const response = await getOrders(walletId);
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError(err instanceof Error ? err.message : 'Erro ao buscar ordens');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Handle buy order submission
  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder('buy');
  };

  // Handle sell order submission
  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder('sell');
  };

  // Common function for placing orders
  const placeOrder = async (side: 'buy' | 'sell') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedPair || !quantity || (parseFloat(quantity) <= 0)) {
      setError('Por favor, preencha o par de trading e a quantidade');
      setIsLoading(false);
      return;
    }

    if (!isMarketOrder && (!price || parseFloat(price) <= 0)) {
      setError('Por favor, defina um preço para ordem limitada');
      setIsLoading(false);
      return;
    }

    const orderData = {
      symbol: selectedPair,
      quantity: parseFloat(quantity),
      wallet_id: walletId,
      price: isMarketOrder ? undefined : parseFloat(price),
    };

    try {
      const orderFn = side === 'buy' ? placeBuyOrder : placeSellOrder;
      const response = await orderFn(orderData);
      
      setSuccess(`Ordem de ${side === 'buy' ? 'compra' : 'venda'} colocada com sucesso! ID: ${response.orderId}`);
      
      // Reset form fields
      setQuantity('');
      setPrice('');
      
      // Refresh orders after a short delay
      setTimeout(fetchOrders, 1000);
      
    } catch (err) {
      console.error(`Error placing ${side} order:`, err);
      setError(err instanceof Error ? err.message : `Erro ao colocar ordem de ${side === 'buy' ? 'compra' : 'venda'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Order Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Trading Manual</h2>
        
        <form>
          <div className="mb-4">
            <label htmlFor="tradingPair" className="block text-sm font-medium text-gray-700 mb-1">
              Par de Trading
            </label>
            <select
              id="tradingPair"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {TRADING_PAIRS.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading}
              min="0"
              step="0.0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 0.001"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="orderType"
                type="checkbox"
                checked={isMarketOrder}
                onChange={() => setIsMarketOrder(!isMarketOrder)}
                disabled={isLoading}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="orderType" className="ml-2 block text-sm text-gray-700">
                Ordem a Mercado (preço atual)
              </label>
            </div>
          </div>
          
          {!isMarketOrder && (
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Preço Limite
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Preço unitário"
              />
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleBuy}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? 'Processando...' : 'Comprar'}
            </button>
            <button
              type="button"
              onClick={handleSell}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isLoading ? 'Processando...' : 'Vender'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Histórico de Ordens</h2>
          <button
            onClick={fetchOrders}
            disabled={isLoadingOrders}
            className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded text-sm focus:outline-none"
          >
            {isLoadingOrders ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
        
        {ordersError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {ordersError}
          </div>
        )}
        
        {isLoadingOrders && !orders.length ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-gray-500">Carregando ordens...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Símbolo
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} title={`Data: ${formatDate(order.time)}\nID: ${order.orderId}`}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {order.symbol}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`font-medium ${order.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.side === 'BUY' ? 'Compra' : 'Venda'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {parseFloat(order.origQty).toFixed(5)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {parseFloat(order.price).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                        order.status === 'FILLED' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'CANCELED' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Nenhuma ordem encontrada. Faça sua primeira operação!
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingOperations;