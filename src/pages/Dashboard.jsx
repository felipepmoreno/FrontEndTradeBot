import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, CircularProgress } from '@mui/material';
import { apiRequest, get } from '../utils/api';
import { ENDPOINTS } from '../config/apiConfig'; // Import ENDPOINTS from your config

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeStrategies: 0,
    totalProfit: 0,
    todayPerformance: 0,
    openPositions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fix: Swap the parameter order or use the get() helper method
        const response = await apiRequest('GET', ENDPOINTS.PORTFOLIO);
        // Alternative approach:
        // const response = await get(ENDPOINTS.PORTFOLIO);
        
        setDashboardData(response.data || {
          activeStrategies: 0,
          totalProfit: 0,
          todayPerformance: 0,
          openPositions: 0
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not connect to server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to safely format numbers
  const safeToFixed = (value, digits = 2) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(digits);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Typography variant="h4" component="h1" className="mb-6">
        Trading Dashboard
      </Typography>

      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
          {error}
        </div>
      )}

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Active Strategies
            </Typography>
            <Typography variant="h4" className="mt-2">
              {dashboardData.activeStrategies || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Total Profit
            </Typography>
            <Typography 
              variant="h4" 
              className={`mt-2 ${Number(dashboardData.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${safeToFixed(dashboardData.totalProfit)}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Today's Performance
            </Typography>
            <Typography 
              variant="h4" 
              className={`mt-2 ${Number(dashboardData.todayPerformance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {Number(dashboardData.todayPerformance || 0) > 0 ? '+' : ''}{safeToFixed(dashboardData.todayPerformance)}%
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Open Positions
            </Typography>
            <Typography variant="h4" className="mt-2">
              {dashboardData.openPositions || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="p-4">
            <Typography variant="h6" className="mb-4">
              Recent Activity
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              No recent activity to display.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;