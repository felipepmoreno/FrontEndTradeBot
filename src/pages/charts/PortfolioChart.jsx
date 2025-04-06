import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'dd/MM/yy');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const PortfolioChart = ({ data = [] }) => {
  const theme = useTheme();
  
  // Ensure we have data to display
  const chartData = data.length > 0 
    ? data 
    : [{ timestamp: new Date(), totalBalance: 0 }];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatDate} 
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)} 
          tick={{ fill: theme.palette.text.secondary }}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(value)}
          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy HH:mm')} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="totalBalance" 
          name="Balanço Total"
          stroke={theme.palette.primary.main} 
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, fill: theme.palette.background.paper }} 
          activeDot={{ r: 5 }} 
        />
        {chartData[0]?.unrealizedProfit !== undefined && (
          <Line 
            type="monotone" 
            dataKey="unrealizedProfit" 
            name="Lucro Não Realizado"
            stroke={theme.palette.secondary.main} 
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: theme.palette.background.paper }} 
            activeDot={{ r: 5 }} 
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;
