import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';

const RecentTrades = ({ trades = [] }) => {
  const theme = useTheme();

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  if (!trades || trades.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="textSecondary">Nenhuma operação recente</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: '100%', overflow: 'auto', pb: 0 }}>
      {trades.map((trade) => (
        <ListItem key={trade.id} divider>
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
                  {trade.symbol}
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
              {trade.profit !== undefined && (
                <Typography
                  variant="body2"
                  color={
                    trade.profit > 0
                      ? 'success.main'
                      : trade.profit < 0
                      ? 'error.main'
                      : 'text.secondary'
                  }
                >
                  {trade.profit > 0 ? '+' : ''}
                  {trade.profit.toFixed(2)}%
                </Typography>
              )}
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default RecentTrades;
