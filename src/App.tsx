
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { getCurrentUser } from './services/authService';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import TableOrdersPage from './pages/TableOrdersPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import AgentsPage from './pages/AgentsPage';
import AgentManagementPage from './pages/AgentManagementPage';
import InvoicesPage from './pages/InvoicesPage';
import RevenuePage from './pages/RevenuePage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProductsPage from './pages/ProductsPage';
import AgentReportsPage from './pages/AgentReportsPage';
import SettingsPage from './pages/SettingsPage';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Composant pour les routes admin uniquement
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/table-orders" element={<ProtectedRoute><TableOrdersPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/time-tracking" element={<ProtectedRoute><TimeTrackingPage /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
        <Route path="/agent-management" element={<AdminRoute><AgentManagementPage /></AdminRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
        <Route path="/revenue" element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
        <Route path="/agent-reports" element={<ProtectedRoute><AgentReportsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
