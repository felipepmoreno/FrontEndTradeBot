import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeStrategies: 0,
    totalProfit: 0,
    todayPerformance: 0,
    openPositions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an actual API call
        const response = await axios.get('/api/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // For demo purposes, simulate updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Active Strategies
            </Typography>
            <Typography variant="h4" className="mt-2">
              {dashboardData.activeStrategies}
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
              className={`mt-2 ${dashboardData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${dashboardData.totalProfit.toFixed(2)}
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
              className={`mt-2 ${dashboardData.todayPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {dashboardData.todayPerformance > 0 ? '+' : ''}{dashboardData.todayPerformance.toFixed(2)}%
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card className="p-4 h-full">
            <Typography variant="subtitle2" className="text-gray-500">
              Open Positions
            </Typography>
            <Typography variant="h4" className="mt-2">
              {dashboardData.openPositions}
            </Typography>
          </Card>
        </Grid>

        {/* Charts and additional content would go here */}
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