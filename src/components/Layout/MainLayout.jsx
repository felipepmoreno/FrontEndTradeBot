import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { ErrorBoundary } from '../../utils/ErrorBoundary';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary fallback={<p className="text-red-500 p-4">Something went wrong with the application. Please reload the page.</p>}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default MainLayout;
