import React from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 pb-6 pt-20 lg:h-screen lg:overflow-y-auto lg:px-6 lg:pt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
