import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import TradingBotDashboard from './components/Dashboard/Trading';
import StrategiesList from './components/Strategy/StrategiesList';
import StrategyDetail from './components/Strategy/StrategyDetail';
import TradeHistory from './components/Trades/TradeHistory';
import Settings from './components/Settings/Settings';
import BacktestingPage from './components/Backtesting/BacktestingPage';
import Login from './components/Auth/Login';
import NotFound from './components/Layout/NotFound';

// Authentication check
const isAuthenticated = () => {
  // In a real implementation, check for JWT token or other auth method
  // For now we'll return true to allow free navigation
  return true;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {isAuthenticated() && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isAuthenticated() && <Navbar />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <TradingBotDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <TradingBotDashboard />
                </ProtectedRoute>
              } />
              <Route path="/strategies" element={
                <ProtectedRoute>
                  <StrategiesList />
                </ProtectedRoute>
              } />
              <Route path="/strategies/new" element={
                <ProtectedRoute>
                  <StrategyDetail />
                </ProtectedRoute>
              } />
              <Route path="/strategies/:id" element={
                <ProtectedRoute>
                  <StrategyDetail />
                </ProtectedRoute>
              } />
              <Route path="/strategies/:id/backtest" element={
                <ProtectedRoute>
                  <BacktestingPage />
                </ProtectedRoute>
              } />
              <Route path="/trades" element={
                <ProtectedRoute>
                  <TradeHistory />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default AppRouter;