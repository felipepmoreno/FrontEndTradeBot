import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Button,
  useTheme,
  Chip
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  NotificationImportant
} from '@mui/icons-material';
import { formatDate } from '../../utils/dateUtils';

const AlertsWidget = ({ alerts = [] }) => {
  const theme = useTheme();

  // Helper to get icon based on severity
  const getAlertIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <NotificationImportant color="action" />;
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Sem data';
    return formatDate(timestamp, 'dd/MM HH:mm');
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={3}
      >
        <CheckCircle sx={{ color: theme.palette.success.light, fontSize: 40, mb: 2 }} />
        <Typography color="textSecondary" textAlign="center">
          Nenhum alerta no momento
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List>
        {alerts.slice(0, 5).map((alert) => (
          <ListItem key={alert.id} divider>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getAlertIcon(alert.severity)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" component="span">
                    {alert.title}
                  </Typography>
                  {alert.pair && (
                    <Chip
                      size="small"
                      label={alert.pair}
                      sx={{ ml: 1, height: 20 }}
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box component="span" display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" component="span">
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="span">
                    {formatTime(alert.timestamp)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {alerts.length > 5 && (
        <Box display="flex" justifyContent="center" mt={1}>
          <Button size="small" color="primary">
            Ver todos ({alerts.length} alertas)
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AlertsWidget;
