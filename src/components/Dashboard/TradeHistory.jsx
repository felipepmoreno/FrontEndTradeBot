// src/components/Dashboard/TradeHistory.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Spinner, Form, Button, Row, Col } from 'react-bootstrap';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { API_BASE_URL } from '../../config/apiConfig';

const TradeHistory = ({ limit = 10, showFilters = true }) => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    symbol: '',
    type: '',
    dateRange: 'all', // 'all', 'today', 'week', 'month'
    strategyId: ''
  });

  useEffect(() => {
    // Inicializar buscando trades
    fetchTrades();
  }, [limit]);

  useEffect(() => {
    // Filtrar trades quando os filtros ou trades mudam
    if (!trades.length) return;
    
    let filtered = [...trades];
    
    // Aplicar filtro por símbolo
    if (filters.symbol) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }
    
    // Aplicar filtro por tipo (BUY/SELL)
    if (filters.type) {
      filtered = filtered.filter(trade => trade.type === filters.type);
    }
    
    // Aplicar filtro por estratégia
    if (filters.strategyId) {
      filtered = filtered.filter(trade => trade.strategyId === filters.strategyId);
    }
    
    // Aplicar filtro por data
    let startDate = new Date(0);
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(trade => new Date(trade.time) >= startDate);
    }
    
    // Limitar quantidade de trades exibidos
    filtered = filtered.slice(0, limit);
    
    setFilteredTrades(filtered);
  }, [trades, filters, limit]);
  
  // Buscar trades com filtros do backend
  const fetchTrades = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parâmetros da consulta
      const params = {
        ...customFilters,
        limit: limit || 10
      };
      
      // Converter filtros para querystring
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      // Fazer a requisição
      const response = await axios.get(`${API_BASE_URL}/trades?${queryParams}`);
      
      if (response.data && response.data.success) {
        setTrades(response.data.data || []);
      } else {
        setError('Erro ao carregar operações');
      }
    } catch (error) {
      console.error('Erro ao buscar trades:', error);
      setError('Erro ao carregar operações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      symbol: '',
      type: '',
      dateRange: 'all',
      strategyId: ''
    });
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Histórico de Operações</h5>
      </Card.Header>
      
      {showFilters && (
        <Card.Body className="border-bottom py-3">
          <Row>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Par</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: BTCUSDT"
                  value={filters.symbol}
                  onChange={(e) => handleFilterChange('symbol', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="BUY">Compra</option>
                  <option value="SELL">Venda</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Período</Form.Label>
                <Form.Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="all">Todo Período</option>
                  <option value="today">Hoje</option>
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mês</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Estratégia</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ID da estratégia"
                  value={filters.strategyId}
                  onChange={(e) => handleFilterChange('strategyId', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2"
              onClick={resetFilters}
            >
              Limpar Filtros
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => fetchTrades(filters)}
            >
              Aplicar Filtros
            </Button>
          </div>
        </Card.Body>
      )}
      
      <Card.Body className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Carregando operações...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <p>{error}</p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => fetchTrades()}
            >
              Tentar Novamente
            </Button>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Nenhuma operação encontrada.</p>
          </div>
        ) : (
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Par</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Lucro</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id}>
                  <td>{formatDateTime(trade.time)}</td>
                  <td>{trade.symbol}</td>
                  <td>
                    <Badge bg={trade.type === 'BUY' ? 'success' : 'danger'}>
                      {trade.type === 'BUY' ? 'Compra' : 'Venda'}
                    </Badge>
                  </td>
                  <td>{formatCurrency(trade.price, '')}</td>
                  <td>{trade.quantity}</td>
                  <td>{formatCurrency(trade.price * trade.quantity, '')}</td>
                  <td className={trade.profit > 0 ? 'text-success' : (trade.profit < 0 ? 'text-danger' : '')}>
                    {trade.profit ? formatCurrency(trade.profit, '') : '-'}
                  </td>
                  <td>
                    <Badge bg={
                      trade.status === 'COMPLETED' ? 'success' :
                      trade.status === 'PENDING' ? 'warning' :
                      'secondary'
                    }>
                      {trade.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default TradeHistory;