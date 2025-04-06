// src/components/Dashboard/StrategyList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api'; // Ajuste conforme o seu backend

const StrategyList = ({ onCreateNew }) => {
  const [strategies, setStrategies] = useState([]);
  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar estratégias ao montar o componente
  useEffect(() => {
    fetchStrategies();
  }, []);

  // Buscar todas as estratégias
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/strategies`);
      
      if (response.data.success) {
        setStrategies(response.data.strategies);
      } else {
        setError(response.data.error || 'Falha ao buscar estratégias');
      }
    } catch (error) {
      console.error('Erro ao buscar estratégias:', error);
      setError('Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Ativar/desativar estratégia
  const handleToggleStrategy = async (strategyId, currentStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      const targetStatus = !currentStatus;
      
      const response = await axios.post(`${API_BASE_URL}/strategies/${strategyId}/toggle`, {
        active: targetStatus
      });
      
      if (response.data.success) {
        // Atualizar lista de estratégias
        setStrategies(prev => 
          prev.map(s => s.id === strategyId ? { ...s, active: targetStatus } : s)
        );
      } else {
        setError(response.data.error || `Falha ao ${targetStatus ? 'ativar' : 'desativar'} estratégia`);
      }
    } catch (error) {
      console.error(`Erro ao ${currentStatus ? 'desativar' : 'ativar'} estratégia:`, error);
      setError(`Falha ao ${currentStatus ? 'desativar' : 'ativar'} estratégia. Erro do servidor.`);
    } finally {
      setLoading(false);
    }
  };

  // Remover estratégia
  const handleDeleteStrategy = async (strategyId) => {
    if (confirmDelete !== strategyId) {
      // Primeiro clique: pedir confirmação
      setConfirmDelete(strategyId);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`${API_BASE_URL}/strategies/${strategyId}`);
      
      if (response.data.success) {
        // Atualizar lista de estratégias
        setStrategies(prev => prev.filter(s => s.id !== strategyId));
        setConfirmDelete(null);
      } else {
        setError(response.data.error || 'Falha ao excluir estratégia');
      }
    } catch (error) {
      console.error('Erro ao excluir estratégia:', error);
      setError('Falha na comunicação com o servidor ao excluir estratégia');
    } finally {
      setLoading(false);
    }
  };

  // Expandir/colapsar detalhes da estratégia
  const toggleExpand = (strategyId) => {
    if (expandedStrategy === strategyId) {
      setExpandedStrategy(null);
    } else {
      setExpandedStrategy(strategyId);
    }
  };

  // Renderizar parâmetros específicos da estratégia
  const renderStrategyParams = (strategy) => {
    switch (strategy.type) {
      case 'grid':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Limite Superior:</span> ${strategy.params.upperLimit}
            </div>
            <div>
              <span className="text-gray-500">Limite Inferior:</span> ${strategy.params.lowerLimit}
            </div>
            <div>
              <span className="text-gray-500">Níveis:</span> {strategy.params.levels}
            </div>
            <div>
              <span className="text-gray-500">Investimento:</span> ${strategy.params.totalInvestment}
            </div>
          </div>
        );

      case 'movingAverage':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Período Rápido:</span> {strategy.params.fastPeriod}
            </div>
            <div>
              <span className="text-gray-500">Período Lento:</span> {strategy.params.slowPeriod}
            </div>
            <div>
              <span className="text-gray-500">Volume:</span> {strategy.params.volume}
            </div>
            <div>
              <span className="text-gray-500">Pares:</span> {Array.isArray(strategy.pairs) ? strategy.pairs.join(', ') : strategy.pair}
            </div>
          </div>
        );

      case 'rsi':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Período:</span> {strategy.params.period}
            </div>
            <div>
              <span className="text-gray-500">Sobrecompra:</span> {strategy.params.overbought}
            </div>
            <div>
              <span className="text-gray-500">Sobrevenda:</span> {strategy.params.oversold}
            </div>
            <div>
              <span className="text-gray-500">Volume:</span> {strategy.params.volume}
            </div>
          </div>
        );

      case 'dca':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Valor Base:</span> ${strategy.params.baseAmount}
            </div>
            <div>
              <span className="text-gray-500">Intervalo:</span> {strategy.params.interval}
            </div>
            <div>
              <span className="text-gray-500">Máx. Posições:</span> {strategy.params.maxPositions}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Tipo de estratégia não reconhecido
          </div>
        );
    }
  };

  // Renderizar performance da estratégia
  const renderPerformance = (strategy) => {
    if (!strategy.performance) return null;
    
    return (
      <div className="flex flex-wrap justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-500">Lucro:</span> 
          <span className={strategy.performance.profit >= 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
            ${strategy.performance.profit.toFixed(2)}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Trades:</span> {strategy.performance.trades}
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Taxa de Sucesso:</span> {strategy.performance.successRate.toFixed(1)}%
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Estratégias</h2>
        <button 
          onClick={onCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
          disabled={loading}
        >
          Nova Estratégia
        </button>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Estado de carregamento */}
      {loading && (
        <div className="text-center p-4">
          <p className="text-gray-500">Carregando...</p>
        </div>
      )}
      
      {/* Sem estratégias */}
      {!loading && strategies.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded">
          <p className="text-gray-500">Nenhuma estratégia configurada.</p>
          <button 
            onClick={onCreateNew}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            Criar sua primeira estratégia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div 
              key={strategy.id} 
              className="border rounded p-4 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{strategy.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {strategy.type === 'grid' ? 'Grid Trading' : 
                     strategy.type === 'movingAverage' ? 'Médias Móveis' :
                     strategy.type === 'rsi' ? 'RSI' :
                     strategy.type === 'dca' ? 'DCA Inteligente' : 'Personalizada'}
                     {' - '}
                     {strategy.pair || (Array.isArray(strategy.pairs) && strategy.pairs.join(', '))}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex rounded-full h-3 w-3 ${strategy.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-sm">{strategy.active ? 'Ativo' : 'Inativo'}</span>
                  
                  <div className="flex ml-4">
                    <button
                      onClick={() => toggleExpand(strategy.id)}
                      className="text-gray-500 hover:text-gray-800"
                      aria-label="Expandir detalhes"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {expandedStrategy === strategy.id ? (
                          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {expandedStrategy === strategy.id && (
                <div className="mt-4 pt-4 border-t">
                  {renderStrategyParams(strategy)}
                  {renderPerformance(strategy)}
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleToggleStrategy(strategy.id, strategy.active)}
                      disabled={loading}
                      className={`px-3 py-1 rounded text-sm ${
                        strategy.active 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {strategy.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      disabled={loading}
                      className={`px-3 py-1 rounded text-sm ${
                        confirmDelete === strategy.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {confirmDelete === strategy.id ? 'Confirmar' : 'Excluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrategyList;