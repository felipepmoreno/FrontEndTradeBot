import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import { Pause, BarChart, Info } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ActiveStrategies = ({ strategies = [] }) => {
  const theme = useTheme();

  if (!strategies || strategies.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="textSecondary">Nenhuma estratégia ativa</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: '100%', overflow: 'auto', pb: 0 }}>
      {strategies.map((strategy) => (
        <ListItem key={strategy.id} divider>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography variant="body1" component="span" fontWeight="medium">
                  {strategy.name}
                </Typography>
                <Chip
                  size="small"
                  label={strategy.type}
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
            secondary={
              <React.Fragment>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="span"
                >
                  {Array.isArray(strategy.pairs) 
                    ? strategy.pairs.join(', ') 
                    : strategy.pair}
                </Typography>
                {strategy.performance && (
                  <Typography
                    variant="body2"
                    component="span"
                    color={
                      strategy.performance.profit >= 0
                        ? 'success.main'
                        : 'error.main'
                    }
                    sx={{ ml: 1 }}
                  >
                    ({strategy.performance.profit >= 0 ? '+' : ''}
                    {strategy.performance.profit.toFixed(2)}%)
                  </Typography>
                )}
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <Box>
              <Tooltip title="Ver detalhes">
                <IconButton 
                  size="small"
                  component={Link} 
                  to={`/strategies/${strategy.id}`}
                >
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ver performance">
                <IconButton 
                  size="small"
                  component={Link} 
                  to={`/strategies/${strategy.id}/performance`}
                >
                  <BarChart fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Pausar estratégia">
                <IconButton size="small">
                  <Pause fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default ActiveStrategies;
