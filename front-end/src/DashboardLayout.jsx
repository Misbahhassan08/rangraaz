import React from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', height: '100%', backgroundColor: 'black' }}>
        <Sidebar />
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
