import React from 'react';
import { useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

const StrategyPerformance = ({ data = [] }) => {
  const theme = useTheme();
  
  // Process data for chart
  const chartData = data
    .filter(strategy => strategy.performance && strategy.active)
    .map(strategy => ({
      name: strategy.name,
      value: Math.abs(strategy.performance.profit || 0), // Use absolute value for pie size
      actualValue: strategy.performance.profit || 0, // Keep the actual value for display
      color: strategy.performance.profit >= 0 ? theme.palette.success.main : theme.palette.error.main
    }));
  
  // If no data, show placeholder message
  if (chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="textSecondary">
          Nenhuma estratégia ativa encontrada
        </Typography>
      </Box>
    );
  }
  
  // Custom tooltip to show profit/loss
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">{data.name}</Typography>
          <Typography
            variant="body2"
            color={data.actualValue >= 0 ? 'success.main' : 'error.main'}
          >
            {`Profit: ${data.actualValue >= 0 ? '+' : ''}${data.actualValue.toFixed(2)}%`}
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StrategyPerformance;
