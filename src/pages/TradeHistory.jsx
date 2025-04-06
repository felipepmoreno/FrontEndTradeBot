import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination, 
  Typography, 
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/trades');
        setTrades(response.data);
      } catch (err) {
        console.error('Error fetching trade history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeHistory();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="trade-history-page">
      <Typography variant="h4" component="h1" className="mb-6">
        Trade History
      </Typography>

      {loading ? (
        <div className="flex justify-center my-12">
          <CircularProgress />
        </div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Profit/Loss</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.length > 0 ? (
                  (rowsPerPage > 0
                    ? trades.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : trades
                  ).map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{trade.strategy}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type}
                        </span>
                      </TableCell>
                      <TableCell>{trade.symbol}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell className={trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${trade.profit.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No trade history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={trades.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default TradeHistory;
