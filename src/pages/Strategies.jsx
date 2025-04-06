import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const Strategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/strategies');
        setStrategies(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load strategies. Please try again later.');
        console.error('Error fetching strategies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return (
    <div className="strategies-page">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Trading Strategies
        </Typography>
        <Button variant="contained" color="primary">
          New Strategy
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <CircularProgress />
        </div>
      ) : error ? (
        <Card className="p-4 bg-red-50 text-red-700 border border-red-200">
          {error}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.length > 0 ? (
            strategies.map((strategy) => (
              <Card key={strategy.id} className="p-4">
                <Typography variant="h6">{strategy.name}</Typography>
                <Typography variant="body2" className="text-gray-600 mt-1">
                  {strategy.description}
                </Typography>
                <div className="mt-3 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${strategy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {strategy.active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="outlined" size="small">
                    Edit
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 col-span-3">
              <Typography className="text-center text-gray-500">
                No strategies found. Create your first strategy to get started.
              </Typography>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Strategies;
