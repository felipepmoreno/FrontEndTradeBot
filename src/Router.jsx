import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import Strategies from "./pages/Strategies";
import MainLayout from "./components/Layout/MainLayout";
import NotFound from "./pages/NotFound";
import TradeHistory from "./pages/TradeHistory";
import Backtesting from "./pages/Backtesting";
import Settings from "./pages/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="strategies" element={<Strategies />} />
        <Route path="trades" element={<TradeHistory />} />
        <Route path="backtesting" element={<Backtesting />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;