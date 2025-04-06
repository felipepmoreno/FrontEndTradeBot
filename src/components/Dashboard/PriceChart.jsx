// src/components/Dashboard/PriceChart.jsx

import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { useKlineWebSocket } from '../../hooks/useWebSocket';
import binanceService from '../../services/BinanceService';

const PriceChart = ({ symbol = 'BTCUSDT', timeframe = '1h', height = 400 }) => {
  const chartContainerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [candleSeries, setCandleSeries] = useState(null);
  const [volumeSeries, setVolumeSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Receber dados em tempo real via WebSocket
  const klineData = useKlineWebSocket(symbol, timeframe);
  
  // Carregar dados históricos ao montar o componente ou quando mudar o par/timeframe
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Buscar dados históricos da Binance (últimos 100 candles)
        const response = await binanceService.getKlines(symbol, timeframe, { limit: 500 });
        
        if (!response.success) {
          throw new Error(response.error || 'Falha ao buscar dados históricos');
        }
        
        if (candleSeries && volumeSeries) {
          // Formatar dados para o gráfico de candles
          const candleData = response.data.map(candle => ({
            time: candle.time / 1000,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
          }));
          
          // Formatar dados para o gráfico de volume
          const volumeData = response.data.map(candle => ({
            time: candle.time / 1000,
            value: candle.volume,
            color: candle.close >= candle.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)'
          }));
          
          // Definir dados das séries
          candleSeries.setData(candleData);
          volumeSeries.setData(volumeData);
          
          // Ajustar visualização para mostrar os dados mais recentes
          chartInstance.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Erro ao buscar dados históricos:', error);
        setError('Não foi possível carregar os dados do gráfico. ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (candleSeries && volumeSeries) {
      fetchHistoricalData();
    }
  }, [symbol, timeframe, candleSeries, volumeSeries, chartInstance]);
  
  // Atualizar com dados em tempo real do WebSocket
  useEffect(() => {
    if (klineData && candleSeries && volumeSeries) {
      // Verificar se os dados do WebSocket são para o par e timeframe corretos
      if (klineData.s === symbol && klineData.k && klineData.k.i === timeframe) {
        const candleUpdate = {
          time: klineData.k.t / 1000,
          open: parseFloat(klineData.k.o),
          high: parseFloat(klineData.k.h),
          low: parseFloat(klineData.k.l),
          close: parseFloat(klineData.k.c)
        };
        
        const volumeUpdate = {
          time: klineData.k.t / 1000,
          value: parseFloat(klineData.k.v),
          color: parseFloat(klineData.k.c) >= parseFloat(klineData.k.o) 
            ? 'rgba(76, 175, 80, 0.5)' 
            : 'rgba(255, 82, 82, 0.5)'
        };
        
        // Atualizar séries
        candleSeries.update(candleUpdate);
        volumeSeries.update(volumeUpdate);
      }
    }
  }, [klineData, candleSeries, volumeSeries, symbol, timeframe]);
  
  // Criar e configurar o gráfico
  useEffect(() => {
    if (chartContainerRef.current && !chartInstance) {
      // Criar instância do gráfico
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333',
        },
        grid: {
          vertLines: { color: 'rgba(220, 220, 220, 0.8)' },
          horzLines: { color: 'rgba(220, 220, 220, 0.8)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 1)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 1)',
          timeVisible: true,
          secondsVisible: false
        },
      });
      
      // Adicionar série de candles
      const newCandleSeries = chart.addCandlestickSeries({
        upColor: '#4CAF50',
        downColor: '#FF5252',
        borderDownColor: '#FF5252',
        borderUpColor: '#4CAF50',
        wickDownColor: '#FF5252',
        wickUpColor: '#4CAF50',
      });
      
      // Adicionar série de volume
      const newVolumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      
      // Salvar referências
      setChartInstance(chart);
      setCandleSeries(newCandleSeries);
      setVolumeSeries(newVolumeSeries);
      
      // Responsividade
      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup ao desmontar o componente
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        setChartInstance(null);
        setCandleSeries(null);
        setVolumeSeries(null);
      };
    }
  }, [chartContainerRef, chartInstance, height]);
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-indigo-600">Carregando dados...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-red-600">{error}</div>
        </div>
      )}
      
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};

export default PriceChart;