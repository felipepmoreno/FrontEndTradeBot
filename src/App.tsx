import { useState, useEffect } from 'react'
import Header from './components/Header'
import ApiStatus from './components/ApiStatus'
import WalletConnect from './components/WalletConnect'
import WalletBalance from './components/WalletBalance'
import TradingOperations from './components/TradingOperations'
import BotControl from './components/BotControl'

function App() {
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trading' | 'bot'>('trading')
  
  // Check if we have a saved wallet ID in localStorage
  useEffect(() => {
    const savedWalletId = localStorage.getItem('tradebot_wallet_id')
    if (savedWalletId) {
      setWalletId(savedWalletId)
    }
  }, [])

  // Handle wallet connection
  const handleWalletConnect = (id: string) => {
    setWalletId(id)
    localStorage.setItem('tradebot_wallet_id', id)
  }

  // Handle wallet disconnection
  const handleDisconnect = () => {
    setWalletId(null)
    localStorage.removeItem('tradebot_wallet_id')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Trading Bot Binance</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* API Status */}
          <div className="lg:col-span-1">
            <div className="card bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-semibold mb-4">Status da API</h2>
              <ApiStatus onStatusChange={setIsApiConnected} />
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className="lg:col-span-2">
            {walletId ? (
              <div className="card bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Carteira Conectada</h2>
                  <button 
                    onClick={handleDisconnect}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 focus:outline-none"
                  >
                    Desconectar
                  </button>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600">ID da Carteira:</span>
                  <span className="ml-2 font-mono">{walletId.substring(0, 12)}...</span>
                </div>
              </div>
            ) : (
              <WalletConnect onConnect={handleWalletConnect} />
            )}
          </div>
        </div>

        {/* Only show wallet balance and trading features if wallet is connected */}
        {walletId && (
          <>
            <div className="mb-8">
              <WalletBalance walletId={walletId} />
            </div>
            
            <div className="mb-4 border-b pb-2">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('trading')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'trading' 
                      ? 'border-b-2 border-indigo-600 text-indigo-600' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Trading Manual
                </button>
                <button
                  onClick={() => setActiveTab('bot')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'bot' 
                      ? 'border-b-2 border-indigo-600 text-indigo-600' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Bot de Trading
                </button>
              </div>
            </div>
            
            {activeTab === 'trading' && (
              <TradingOperations walletId={walletId} />
            )}
            
            {activeTab === 'bot' && (
              <BotControl walletId={walletId} />
            )}
          </>
        )}

        {/* Help section visible when no wallet is connected */}
        {!walletId && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Como começar</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Crie uma conta na <a href="https://testnet.binance.vision/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Binance TestNet</a></li>
              <li>Gere uma API Key e API Secret para utilizar no bot</li>
              <li>Conecte sua carteira utilizando suas credenciais geradas</li>
              <li>Comece a operar manualmente ou configure o bot para operar automaticamente</li>
            </ol>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Este é um ambiente de testes usando a Binance TestNet. Não utilize API Keys da sua conta real da Binance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            Trading Bot Binance © {new Date().getFullYear()} - Desenvolvido para fins educacionais
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
