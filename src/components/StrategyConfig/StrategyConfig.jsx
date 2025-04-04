import React, { useState } from 'react';

const StrategyConfiguration = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('grid');
  const [formValues, setFormValues] = useState({
    // Grid Trading
    gridUpperLimit: 40000,
    gridLowerLimit: 35000,
    gridLevels: 5,
    gridTotalInvestment: 1000,
    
    // Moving Average
    maFastPeriod: 9,
    maSlowPeriod: 21,
    maVolume: 0.1,
    
    // RSI
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    rsiVolume: 0.1,
    
    // DCA
    dcaBaseAmount: 100,
    dcaInterval: 'weekly',
    dcaMaxPositions: 10,
    
    // Common
    tradingPair: 'BTC/USDT',
    takeProfitPercentage: 3,
    stopLossPercentage: 2,
    maxOpenPositions: 5,
    reinvestProfits: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui seria implementada a lógica para salvar a estratégia
    console.log('Estratégia salva:', selectedStrategy, formValues);
    alert('Estratégia configurada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <div className="bg-white rounded shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Configuração de Estratégias</h1>
          
          {/* Strategy Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Selecione a Estratégia</label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <button 
                type="button"
                className={`p-4 rounded border ${selectedStrategy === 'grid' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedStrategy('grid')}
              >
                <div className="font-medium">Grid Trading</div>
                <div className="text-xs text-gray-500 mt-1">Ideal para mercados laterais</div>
              </button>
              
              <button 
                type="button"
                className={`p-4 rounded border ${selectedStrategy === 'movingAverage' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedStrategy('movingAverage')}
              >
                <div className="font-medium">Médias Móveis</div>
                <div className="text-xs text-gray-500 mt-1">Análise técnica básica</div>
              </button>
              
              <button 
                type="button"
                className={`p-4 rounded border ${selectedStrategy === 'rsi' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedStrategy('rsi')}
              >
                <div className="font-medium">RSI</div>
                <div className="text-xs text-gray-500 mt-1">Indicador de momentum</div>
              </button>
              
              <button 
                type="button"
                className={`p-4 rounded border ${selectedStrategy === 'dca' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedStrategy('dca')}
              >
                <div className="font-medium">DCA Inteligente</div>
                <div className="text-xs text-gray-500 mt-1">Compras periódicas</div>
              </button>
              
              <button 
                type="button"
                className={`p-4 rounded border ${selectedStrategy === 'custom' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'}`}
                onClick={() => setSelectedStrategy('custom')}
              >
                <div className="font-medium">Personalizada</div>
                <div className="text-xs text-gray-500 mt-1">Combine indicadores</div>
              </button>
            </div>
          </div>
          
          {/* Strategy Form */}
          <form onSubmit={handleSubmit}>
            {/* Common Settings */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Configurações Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Par de Trading</label>
                  <select 
                    name="tradingPair"
                    value={formValues.tradingPair}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                    <option value="BNB/USDT">BNB/USDT</option>
                    <option value="ADA/USDT">ADA/USDT</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Máximo de Posições Abertas</label>
                  <input 
                    type="number"
                    name="maxOpenPositions"
                    value={formValues.maxOpenPositions}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Take Profit (%)</label>
                  <input 
                    type="number"
                    name="takeProfitPercentage"
                    value={formValues.takeProfitPercentage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Stop Loss (%)</label>
                  <input 
                    type="number"
                    name="stopLossPercentage"
                    value={formValues.stopLossPercentage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      name="reinvestProfits"
                      checked={formValues.reinvestProfits}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Reinvestir lucros automaticamente</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Strategy Specific Settings */}
            {selectedStrategy === 'grid' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Configurações de Grid Trading</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Limite Superior ($)</label>
                    <input 
                      type="number"
                      name="gridUpperLimit"
                      value={formValues.gridUpperLimit}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Limite Inferior ($)</label>
                    <input 
                      type="number"
                      name="gridLowerLimit"
                      value={formValues.gridLowerLimit}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Número de Níveis</label>
                    <input 
                      type="number"
                      name="gridLevels"
                      value={formValues.gridLevels}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="2"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Investimento Total ($)</label>
                    <input 
                      type="number"
                      name="gridTotalInvestment"
                      value={formValues.gridTotalInvestment}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="10"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-medium mb-2">Prévia da Estratégia Grid</h3>
                  <div className="flex justify-between">
                    <div>Intervalo de Grid:</div>
                    <div>${formValues.gridLowerLimit} - ${formValues.gridUpperLimit}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Tamanho de cada nível:</div>
                    <div>${(formValues.gridTotalInvestment / formValues.gridLevels).toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Distância entre níveis:</div>
                    <div>${((formValues.gridUpperLimit - formValues.gridLowerLimit) / (formValues.gridLevels - 1)).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedStrategy === 'movingAverage' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Configurações de Médias Móveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Período da Média Rápida</label>
                    <input 
                      type="number"
                      name="maFastPeriod"
                      value={formValues.maFastPeriod}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Período da Média Lenta</label>
                    <input 
                      type="number"
                      name="maSlowPeriod"
                      value={formValues.maSlowPeriod}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="1"
                      max="200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Volume por Operação</label>
                    <input 
                      type="number"
                      name="maVolume"
                      value={formValues.maVolume}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedStrategy === 'rsi' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Configurações de RSI</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Período do RSI</label>
                    <input 
                      type="number"
                      name="rsiPeriod"
                      value={formValues.rsiPeriod}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Nível de Sobrecompra</label>
                    <input 
                      type="number"
                      name="rsiOverbought"
                      value={formValues.rsiOverbought}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="50"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Nível de Sobrevenda</label>
                    <input 
                      type="number"
                      name="rsiOversold"
                      value={formValues.rsiOversold}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Volume por Operação</label>
                    <input 
                      type="number"
                      name="rsiVolume"
                      value={formValues.rsiVolume}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedStrategy === 'dca' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Configurações de DCA Inteligente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Valor Base por Compra ($)</label>
                    <input 
                      type="number"
                      name="dcaBaseAmount"
                      value={formValues.dcaBaseAmount}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Intervalo</label>
                    <select 
                      name="dcaInterval"
                      value={formValues.dcaInterval}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quinzenal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Máximo de Posições</label>
                    <input 
                      type="number"
                      name="dcaMaxPositions"
                      value={formValues.dcaMaxPositions}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedStrategy === 'custom' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Estratégia Personalizada</h2>
                <p className="mb-4">Combine diferentes indicadores e defina regras personalizadas:</p>
                
                <div className="p-4 bg-gray-100 rounded mb-4">
                  <h3 className="font-medium mb-2">Indicadores Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Médias Móveis (SMA/EMA)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>RSI</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>MACD</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Bollinger Bands</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Suporte/Resistência</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Volume</span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded">
                  <p>Esta opção permite configurar estratégias avançadas combinando múltiplos indicadores.</p>
                  <p className="mt-2 text-indigo-600">Funcionalidade em desenvolvimento. Em breve você poderá criar suas próprias estratégias personalizadas!</p>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Salvar Estratégia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StrategyConfiguration;