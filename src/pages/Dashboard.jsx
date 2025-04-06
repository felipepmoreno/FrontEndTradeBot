import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  useTheme
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  TrendingUp, 
  ShowChart, 
  Alarm, 
  ArrowUpward,
  ArrowDownward 
} from "@mui/icons-material";
import PortfolioChart from "./charts/PortfolioChart";
import StrategyPerformance from "./charts/StrategyPerformance";
import TradingPairs from "./trading/TradingPairs";
import ActiveStrategies from "./trading/ActiveStrategies";
import RecentTrades from "./trading/RecentTrades";
import AlertsWidget from "./widgets/AlertsWidget";

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [activePairs, setActivePairs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Função para carregar dados do portfolio
  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/portfolio');
      setPortfolioData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados do portfólio:", error);
      setLoading(false);
    }
  };

  // Função para carregar estratégias ativas
  const loadStrategies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/strategies');
      setStrategies(response.data.filter(strategy => strategy.active));
    } catch (error) {
      console.error("Erro ao carregar estratégias:", error);
    }
  };

  // Função para carregar trades recentes
  const loadRecentTrades = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trades/recent');
      setRecentTrades(response.data);
    } catch (error) {
      console.error("Erro ao carregar trades recentes:", error);
    }
  };

  // Função para carregar pares ativos
  const loadActivePairs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pairs/active');
      setActivePairs(response.data);
    } catch (error) {
      console.error("Erro ao carregar pares ativos:", error);
    }
  };

  // Função para carregar alertas
  const loadAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await loadPortfolioData();
      await loadStrategies();
      await loadRecentTrades();
      await loadActivePairs();
      await loadAlerts();
    };

    fetchAllData();

    // Atualizar dados a cada 30 segundos
    const intervalId = setInterval(fetchAllData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Resumo do Portfolio */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Portfolio Total
              </Typography>
              <Box display="flex" alignItems="center">
                <AccountBalanceWallet color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {portfolioData && formatCurrency(portfolioData.totalBalance)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Variação 24h
              </Typography>
              <Box display="flex" alignItems="center">
                {portfolioData && portfolioData.dailyChange >= 0 ? (
                  <ArrowUpward sx={{ color: 'success.main', mr: 1 }} />
                ) : (
                  <ArrowDownward sx={{ color: 'error.main', mr: 1 }} />
                )}
                <Typography 
                  variant="h5" 
                  component="div"
                  color={portfolioData && portfolioData.dailyChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {portfolioData && `${portfolioData.dailyChange.toFixed(2)}%`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Estratégias Ativas
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {strategies.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Alertas
              </Typography>
              <Box display="flex" alignItems="center">
                <Alarm color={alerts.length > 0 ? "error" : "primary"} sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {alerts.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de Portfolio */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 360 }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Evolução do Portfolio
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <PortfolioChart data={portfolioData?.historyData || []} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 360 }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Performance por Estratégia
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <StrategyPerformance data={strategies} />
          </Paper>
        </Grid>
      </Grid>

      {/* Estratégias, Pares e Trades */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Estratégias Ativas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ActiveStrategies strategies={strategies} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Pares Monitorados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TradingPairs pairs={activePairs} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Trades Recentes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <RecentTrades trades={recentTrades} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Alertas e Notificações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <AlertsWidget alerts={alerts} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;