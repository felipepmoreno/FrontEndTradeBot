import { useState, useEffect } from 'react'
import { checkApiHealth } from '../services/api'

const ApiStatus = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = async () => {
    setStatus('loading')
    try {
      await checkApiHealth()
      setStatus('connected')
    } catch (error) {
      setStatus('error')
      console.error('API health check failed:', error)
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div>
      <div className="flex items-center mb-4">
        <div 
          className={`w-4 h-4 rounded-full mr-2 ${
            status === 'connected' ? 'bg-green-500' : 
            status === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        ></div>
        <span>
          {status === 'connected' ? 'Conectado ao Backend' : 
           status === 'loading' ? 'Verificando conexão...' : 'Erro ao conectar com o Backend'}
        </span>
      </div>
      
      {lastChecked && (
        <p className="text-sm text-gray-500">
          Última verificação: {lastChecked.toLocaleTimeString()}
        </p>
      )}
      
      <button 
        className="btn btn-primary mt-3" 
        onClick={checkStatus}
        disabled={status === 'loading'}
      >
        Verificar Novamente
      </button>
    </div>
  )
}

export default ApiStatus
