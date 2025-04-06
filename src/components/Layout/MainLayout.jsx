import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content-container">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
