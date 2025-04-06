// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';

// Import your page components
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import TradeHistory from './pages/TradeHistory';
import Backtesting from './pages/Backtesting';
import Settings from './pages/Settings';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="trades" element={<TradeHistory />} />
        <Route path="backtesting" element={<Backtesting />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;