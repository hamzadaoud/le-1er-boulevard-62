
import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';
import { checkIsAdmin, getCurrentUser } from '../services/authService';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !checkIsAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen flex-col w-full">
      <Navbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
        <main className="flex-1 overflow-auto bg-cafeLightGray p-3 md:p-6">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
