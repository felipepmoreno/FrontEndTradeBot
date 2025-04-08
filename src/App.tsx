import { useState } from 'react'
import Header from './components/Header'
import ApiStatus from './components/ApiStatus'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Trading Bot Binance</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Status da API</h2>
            <ApiStatus />
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Informações</h2>
            <p className="text-gray-600">
              Esta é uma aplicação de trading bot para Binance TestNet. 
              Use esta interface para conectar sua carteira e controlar o bot.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
