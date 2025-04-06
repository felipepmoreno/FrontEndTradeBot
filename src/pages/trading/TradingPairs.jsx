import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Chip,
  Box,
  useTheme
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const TradingPairs = ({ pairs = [] }) => {
  const theme = useTheme();

  // Helper function to determine price movement icon
  const getPriceIcon = (priceChange) => {
    if (priceChange > 0) {
      return <TrendingUp sx={{ color: 'success.main' }} />;
    } else if (priceChange < 0) {
      return <TrendingDown sx={{ color: 'error.main' }} />;
    } else {
      return <TrendingFlat sx={{ color: 'text.secondary' }} />;
    }
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  if (!pairs || pairs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="textSecondary">Nenhum par de negociação ativo</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: '100%', overflow: 'auto', pb: 0 }}>
      {pairs.map((pair) => (
        <ListItem key={pair.symbol} divider>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography variant="body1" component="span" fontWeight="medium">
                  {pair.symbol}
                </Typography>
                <Chip
                  size="small"
                  label={pair.strategies ? `${pair.strategies} estratégias` : 'Manual'}
                  color={pair.strategies ? 'primary' : 'default'}
                  variant="outlined"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
            secondary={
              <Typography variant="body2" color="textSecondary">
                {formatPrice(pair.price)}
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <Box display="flex" alignItems="center">
              {getPriceIcon(pair.priceChange)}
              <Typography
                variant="body2"
                color={
                  pair.priceChange > 0
                    ? 'success.main'
                    : pair.priceChange < 0
                    ? 'error.main'
                    : 'text.secondary'
                }
                sx={{ ml: 1 }}
              >
                {pair.priceChange > 0 ? '+' : ''}
                {pair.priceChange}%
              </Typography>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default TradingPairs;
