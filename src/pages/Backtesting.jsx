import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  CircularProgress 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const Backtesting = () => {
  const [strategy, setStrategy] = useState('');
  const [symbol, setSymbol] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!strategy || !symbol || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setRunning(true);
      
      const response = await axios.post('/api/backtest', {
        strategy,
        symbol,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        initialCapital
      });
      
      setResults(response.data);
    } catch (error) {
      console.error('Backtesting error:', error);
      alert('An error occurred during backtesting. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="backtesting-page">
      <Typography variant="h4" component="h1" className="mb-6">
        Strategy Backtesting
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" className="mb-4">
                Backtest Parameters
              </Typography>

              <FormControl fullWidth className="mb-4">
                <InputLabel>Strategy</InputLabel>
                <Select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  label="Strategy"
                  required
                >
                  <MenuItem value="macd">MACD Strategy</MenuItem>
                  <MenuItem value="gridTrading">Grid Trading</MenuItem>
                  <MenuItem value="movingAverage">Moving Average Crossover</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth className="mb-4">
                <InputLabel>Symbol</InputLabel>
                <Select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  label="Symbol"
                  required
                >
                  <MenuItem value="BTCUSDT">BTC/USDT</MenuItem>
                  <MenuItem value="ETHUSDT">ETH/USDT</MenuItem>
                  <MenuItem value="SOLUSDT">SOL/USDT</MenuItem>
                  <MenuItem value="BNBUSDT">BNB/USDT</MenuItem>
                </Select>
              </FormControl>

              <div className="mb-4">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </div>

              <div className="mb-4">
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </div>

              <TextField
                fullWidth
                label="Initial Capital (USDT)"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="mb-6"
                inputProps={{ min: 100 }}
              />

              <Button 
                variant="contained" 
                color="primary" 
                type="submit" 
                fullWidth 
                disabled={running}
              >
                {running ? <CircularProgress size={24} /> : 'Run Backtest'}
              </Button>
            </form>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="p-6 h-full">
            <Typography variant="h6" className="mb-4">
              Backtest Results
            </Typography>

            {running && (
              <div className="flex flex-col items-center justify-center h-64">
                <CircularProgress />
                <Typography variant="body2" className="mt-4">
                  Running backtest...
                </Typography>
              </div>
            )}

            {!running && !results && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <Typography>
                  Run a backtest to see results
                </Typography>
              </div>
            )}

            {!running && results && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Total Return
                    </Typography>
                    <Typography variant="h6" className={results.performance.totalProfitPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {results.performance.totalProfitPct.toFixed(2)}%
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Profit/Loss
                    </Typography>
                    <Typography variant="h6" className={results.performance.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${results.performance.totalProfit.toFixed(2)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Win Rate
                    </Typography>
                    <Typography variant="h6">
                      {results.performance.winRate.toFixed(2)}%
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Total Trades
                    </Typography>
                    <Typography variant="h6">
                      {results.performance.totalTrades}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Max Drawdown
                    </Typography>
                    <Typography variant="h6" className="text-red-600">
                      {results.performance.maxDrawdown.toFixed(2)}%
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-500">
                      Profit Factor
                    </Typography>
                    <Typography variant="h6">
                      {results.performance.profitFactor.toFixed(2)}
                    </Typography>
                  </div>
                </div>

                {/* A chart would go here in a real implementation */}
                <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                  <Typography className="text-gray-500">
                    Equity Curve Chart
                  </Typography>
                </div>
              </div>
            )}
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Backtesting;
