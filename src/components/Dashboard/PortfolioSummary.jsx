// src/components/Dashboard/PortfolioSummary.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTickerWebSocket } from '../../hooks/useWebSocket';
import binanceService from '../../services/BinanceService';

const API_BASE_URL = '/api'; // Ajuste conforme o seu backend

const PortfolioSummary = () => {
  const [portfolio, setPortfolio] = useState({
    totalBalance: 0,
    availableBalance: 0,
    assets: {},
    positions: {},
    performance: {
      totalProfit: 0,
      totalProfitPercentage: 0,
      dailyProfit: 0,
      dailyProfitPercentage: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbols, setSymbols] = useState([]);
  
  // Obter dados em tempo real dos preços via WebSocket
  const tickerData = useTickerWebSocket(symbols);
  
  // Buscar dados do portfólio ao montar o componente
  useEffect(() => {
    fetchPortfolio();
    
    // Atualizar a cada minuto
    const intervalId = setInterval(() => {
      fetchPortfolio();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Buscar dados do portfólio via API
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados do backend
      const response = await axios.get(`${API_BASE_URL}/portfolio`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Falha ao buscar dados do portfólio');
      }
      
      const portfolioData = response.data.portfolio;
      
      // Atualizar portfólio
      setPortfolio(portfolioData);
      
      // Atualizar lista de símbolos para o WebSocket
      updateSymbolsList(portfolioData);
      
    } catch (error) {
      console.error('Erro ao buscar portfólio:', error);
      setError('Falha ao buscar dados do portfólio. Tentando obter diretamente da Binance...');
      
      // Tentar obter direto da Binance como fallback
      try {
        await fetchPortfolioFromBinance();
      } catch (binanceError) {
        console.error('Erro ao buscar portfólio da Binance:', binanceError);
        setError('Não foi possível buscar dados do portfólio. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar portfólio diretamente da Binance (como fallback)
  const fetchPortfolioFromBinance = async () => {
    const accountInfo = await binanceService.getAccountInfo();
    
    if (!accountInfo.success) {
      throw new Error(accountInfo.error || 'Falha ao buscar dados da conta Binance');
    }
    
    // Processar dados da conta
    const assets = {};
    let totalBalance = 0;
    let availableBalance = 0;
    const newSymbols = [];
    
    // Filtrar apenas ativos com saldo
    const balances = accountInfo.data.balances.filter(
      balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
    
    // Processar cada saldo
    for (const balance of balances) {
      const asset = balance.asset;
      const free = parseFloat(balance.free);
      const locked = parseFloat(balance.locked);
      const total = free + locked;
      
      // Não incluir ativos com valor muito pequeno
      if (total < 0.00001) continue;
      
      // Adicionar símbolo para WebSocket (exceto stablecoins)
      if (asset !== 'USDT' && asset !== 'BUSD' && asset !== 'USDC' && asset !== 'DAI') {
        newSymbols.push(`${asset}USDT`);
      }
      
      // Adicionar ao objeto de ativos
      assets[asset] = {
        free,
        locked,
        total
      };
      
      // Contar stablecoins como saldo disponível
      if (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'DAI') {
        availableBalance += free;
      }
    }
    
    // Atualizar símbolos para WebSocket
    setSymbols(newSymbols);
    
    // Atualizar portfólio com dados básicos
    // (valores em USD serão calculados quando os preços chegarem via WebSocket)
    setPortfolio(prev => ({
      ...prev,
      assets,
      availableBalance
    }));
  };
  
  // Extrair símbolos únicos para acompanhar via WebSocket
  const updateSymbolsList = (portfolioData) => {
    const newSymbols = [];
    
    // Adicionar símbolos dos ativos (exceto stablecoins)
    Object.keys(portfolioData.assets).forEach(asset => {
      if (asset !== 'USDT' && asset !== 'BUSD' && asset !== 'USDC' && asset !== 'DAI') {
        newSymbols.push(`${asset}USDT`);
      }
    });
    
    // Adicionar símbolos das posições abertas
    Object.keys(portfolioData.positions).forEach(pair => {
      if (!newSymbols.includes(pair)) {
        newSymbols.push(pair);
      }
    });
    
    setSymbols(newSymbols);
  };
  
  // Atualizar valores dos ativos quando os preços mudam via WebSocket
  useEffect(() => {
    if (Object.keys(tickerData).length > 0) {
      // Clonar portfólio atual
      const updatedPortfolio = {...portfolio};
      let totalValue = 0;
      
      // Atualizar valor dos ativos
      Object.keys(updatedPortfolio.assets).forEach(asset => {
        const assetData = updatedPortfolio.assets[asset];
        let assetValue = 0;
        
        if (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'DAI') {
          // Stablecoins valem 1:1 com USD
          assetValue = assetData.total;
        } else {
          // Outros ativos precisam de conversão
          const ticker = tickerData[`${asset}USDT`];
          if (ticker) {
            const price = parseFloat(ticker.c); // 'c' é o preço atual no formato de ticker
            assetValue = assetData.total * price;
            
            // Atualizar valor do ativo
            updatedPortfolio.assets[asset] = {
              ...assetData,
              usdValue: assetValue,
              currentPrice: price
            };
          }
        }
        
        // Adicionar ao valor total
        totalValue += assetValue;
      });
      
      // Atualizar valor total e disponível
      updatedPortfolio.totalBalance = totalValue;
      
      // Atualizar posições abertas
      Object.keys(updatedPortfolio.positions).forEach(pair => {
        const position = updatedPortfolio.positions[pair];
        const ticker = tickerData[pair];
        
        if (ticker) {
          const currentPrice = parseFloat(ticker.c);
          const entryPrice = position.entryPrice;
          const amount = position.amount;
          
          // Calcular P&L
          const pnl = (currentPrice - entryPrice) * amount;
          const pnlPercentage = ((currentPrice / entryPrice) - 1) * 100;
          
          // Atualizar posição
          updatedPortfolio.positions[pair] = {
            ...position,
            currentPrice,
            pnl,
            pnlPercentage
          };
        }
      });
      
      // Atualizar portfólio
      setPortfolio(updatedPortfolio);
    }
  }, [tickerData]);
  
  // Renderizar cards de resumo do portfólio
  const renderSummaryCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Valor Total do Portfólio</h3>
          <p className="text-2xl font-bold">${portfolio.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={`text-sm ${portfolio.performance.totalProfitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolio.performance.totalProfitPercentage >= 0 ? '+' : ''}{portfolio.performance.totalProfitPercentage.toFixed(2)}% total
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Saldo Disponível</h3>
          <p className="text-2xl font-bold">${portfolio.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="text-sm text-gray-500">
            Para novas operações
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Variação Diária</h3>
          <p className={`text-2xl font-bold ${portfolio.performance.dailyProfitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolio.performance.dailyProfitPercentage >= 0 ? '+' : ''}{portfolio.performance.dailyProfitPercentage.toFixed(2)}%
          </p>
          <div className={`text-sm ${portfolio.performance.dailyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolio.performance.dailyProfit >= 0 ? '+' : ''}${portfolio.performance.dailyProfit.toFixed(2)} hoje
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Posições Abertas</h3>
          <p className="text-2xl font-bold">{Object.keys(portfolio.positions).length}</p>
          <div className="text-sm text-gray-500">
            Em {Object.keys(portfolio.positions).length} pares
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar lista de ativos
  const renderAssets = () => {
    const assetKeys = Object.keys(portfolio.assets);
    
    if (assetKeys.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-gray-500">Nenhum ativo no portfólio.</p>
        </div>
      );
    }
    
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Atual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alocação</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assetKeys.map(asset => {
            const assetData = portfolio.assets[asset];
            const currentPrice = assetData.currentPrice || 
              (asset !== 'USDT' && tickerData[`${asset}USDT`] 
                ? parseFloat(tickerData[`${asset}USDT`].c) 
                : (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'DAI') ? 1 : 0);
              
            const totalValue = (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'DAI')
              ? assetData.total 
              : assetData.total * currentPrice;
              
            const allocation = portfolio.totalBalance > 0 
              ? (totalValue / portfolio.totalBalance) * 100 
              : 0;
            
            return (
              <tr key={asset}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{asset}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(asset === 'USDT' || asset === 'BUSD' || asset === 'USDC' || asset === 'DAI')
                    ? assetData.total.toFixed(2)
                    : assetData.total.toFixed(8)
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(asset !== 'USDT' && asset !== 'BUSD' && asset !== 'USDC' && asset !== 'DAI') 
                    ? `$${currentPrice.toFixed(2)}` 
                    : '$1.00'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${totalValue.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{allocation.toFixed(1)}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${allocation}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  
  // Renderizar posições abertas
  const renderPositions = () => {
    const positionKeys = Object.keys(portfolio.positions);
    
    if (positionKeys.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-gray-500">Nenhuma posição aberta.</p>
        </div>
      );
    }
    
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Par</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Entrada</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Atual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {positionKeys.map(pair => {
            const position = portfolio.positions[pair];
            const currentPrice = position.currentPrice || 
              (tickerData[pair] ? parseFloat(tickerData[pair].c) : position.entryPrice);
              
            const pnl = position.pnl || ((currentPrice - position.entryPrice) * position.amount);
            const pnlPercentage = position.pnlPercentage || (((currentPrice / position.entryPrice) - 1) * 100);
            
            return (
              <tr key={pair}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{pair}</td>
                <td className="px-6 py-4 whitespace-nowrap">{position.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">${position.entryPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">${currentPrice.toFixed(2)}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };
  
  return (
    <div>
      {/* Estado de carregamento */}
      {loading && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <p className="text-center text-gray-500">Carregando dados do portfólio...</p>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Cards de Resumo */}
      {renderSummaryCards()}
      
      {/* Visão Geral do Portfólio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ativos */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Ativos</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center p-4 text-gray-500">Carregando ativos...</p>
            ) : (
              renderAssets()
            )}
          </div>
        </div>
        
        {/* Posições Abertas */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Posições Abertas</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center p-4 text-gray-500">Carregando posições...</p>
            ) : (
              renderPositions()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;