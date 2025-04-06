import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Box, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useNavigate } from 'react-router-dom';
import { fetchStrategies, updateStrategy, deleteStrategy } from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

const Strategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch strategies data
  useEffect(() => {
    const getStrategies = async () => {
      try {
        setLoading(true);
        const data = await fetchStrategies();
        // Ensure strategies is always an array
        setStrategies(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching strategies:', err);
        setError('Failed to load strategies. Please try again later.');
        // Initialize as empty array to prevent map errors
        setStrategies([]);
      } finally {
        setLoading(false);
      }
    };

    getStrategies();
  }, []);

  const handleCreateStrategy = () => {
    navigate('/strategies/new');
  };

  const handleEditStrategy = (id) => {
    navigate(`/strategies/edit/${id}`);
  };

  const handleToggleStrategy = async (id, currentStatus) => {
    try {
      await updateStrategy(id, { active: !currentStatus });
      
      // Update local state
      setStrategies(strategies.map(strategy => 
        strategy.id === id ? { ...strategy, active: !currentStatus } : strategy
      ));
    } catch (error) {
      console.error('Error toggling strategy:', error);
      setError('Failed to update strategy status. Please try again.');
    }
  };

  const handleDeleteStrategy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) {
      return;
    }
    
    try {
      await deleteStrategy(id);
      // Remove from local state
      setStrategies(strategies.filter(strategy => strategy.id !== id));
    } catch (error) {
      console.error('Error deleting strategy:', error);
      setError('Failed to delete strategy. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Trading Strategies
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleCreateStrategy}
        >
          Create Strategy
        </Button>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            {strategies.length === 0 ? (
              <Typography variant="body1" align="center" py={4}>
                No strategies found. Create your first strategy to get started.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Pair</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {strategies.map((strategy) => (
                      <TableRow key={strategy.id}>
                        <TableCell>{strategy.name}</TableCell>
                        <TableCell>{strategy.type}</TableCell>
                        <TableCell>{strategy.pair}</TableCell>
                        <TableCell>
                          {strategy.active ? (
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', marginRight: '4px' }}>●</span> Active
                            </Box>
                          ) : (
                            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', marginRight: '4px' }}>●</span> Inactive
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            onClick={() => handleToggleStrategy(strategy.id, strategy.active)}
                            color={strategy.active ? 'warning' : 'success'}
                          >
                            {strategy.active ? <PauseIcon /> : <PlayArrowIcon />}
                          </IconButton>
                          <IconButton 
                            onClick={() => handleEditStrategy(strategy.id)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteStrategy(strategy.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Wrap with ErrorBoundary
export default function StrategiesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Strategies />
    </ErrorBoundary>
  );
}
