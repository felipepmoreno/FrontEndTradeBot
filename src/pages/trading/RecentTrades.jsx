import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Typography, Box } from '@mui/material';

const RecentTrades = ({ trades = [] }) => {
  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '$0.00';
    }
    return `$${Number(amount).toFixed(2)}`;
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper for safely handling profit display
  const formatProfit = (profit) => {
    if (profit === undefined || profit === null) return null;
    
    try {
      return (
        <Typography
          variant="body2"
          color={
            profit > 0
              ? 'success.main'
              : profit < 0
              ? 'error.main'
              : 'text.secondary'
          }
        >
          {profit > 0 ? '+' : ''}
          {Number(profit).toFixed(2)}%
        </Typography>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <List sx={{ maxHeight: '100%', overflow: 'auto', pb: 0 }}>
      {trades.length > 0 ? (
        trades.map((trade) => (
          <ListItem key={trade.id || `trade-${Math.random()}`} divider>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Typography
                    variant="body1"
                    component="span"
                    color={trade.type === 'BUY' ? 'success.main' : 'error.main'}
                  >
                    {trade.type === 'BUY' ? 'Compra' : 'Venda'}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="span"
                    fontWeight="medium"
                    sx={{ ml: 1 }}
                  >
                    {trade.symbol || 'Unknown'}
                  </Typography>
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography variant="body2" color="textSecondary">
                    {formatTime(trade.time || trade.timestamp)} via{' '}
                    {trade.strategyName || 'Manual'}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <Box textAlign="right">
                <Typography variant="body2">{formatCurrency(trade.price)}</Typography>
                {formatProfit(trade.profit)}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText
            primary="No recent trades"
            secondary="Trades will appear here when available"
          />
        </ListItem>
      )}
    </List>
  );
};

export default RecentTrades;
