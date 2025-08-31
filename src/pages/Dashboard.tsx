
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import TopProductsCard from '../components/TopProductsCard';
import MoneyCalculatorCard from '../components/MoneyCalculatorCard';
import { Activity, BarChart2, Calendar, Coffee, CreditCard, User, Users } from 'lucide-react';
import { getOrders, getRevenues, getTimeLogs, getTopSellingProducts } from '../services/cafeService';
import { getStoredActivities } from '../services/authService';

const Dashboard: React.FC = () => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const orders = getOrders();
      setOrdersCount(orders.length);
      
      const revenues = getRevenues();
      const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
      setRevenue(totalRevenue);
      
      const timeLogs = getTimeLogs();
      const today = new Date().toISOString().split('T')[0];
      const activeToday = new Set(
        timeLogs
          .filter(log => log.date === today)
          .map(log => log.userId)
      );
      setActiveUsers(activeToday.size);
      
      const activities = getStoredActivities().slice(0, 10);
      setRecentActivities(activities);
      
      const products = getTopSellingProducts();
      setTopProducts(products);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cafeBlack">Tableau de Bord</h1>
        <p className="text-gray-500">Bienvenue sur votre tableau de bord de La Perle Rouge</p>
      </div>
      
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Commandes Totales" 
          value={ordersCount} 
          icon={<Coffee size={24} />} 
        />
        <StatCard 
          title="Revenu Total" 
          value={`${revenue.toFixed(2)} MAD`} 
          icon={<CreditCard size={24} />} 
        />
        <StatCard 
          title="Agents Actifs Aujourd'hui" 
          value={activeUsers} 
          icon={<Users size={24} />} 
        />
        <StatCard 
          title="Activités Récentes" 
          value={recentActivities.length} 
          icon={<Activity size={24} />} 
        />
      </div>
      
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductsCard topProducts={topProducts} />
        <MoneyCalculatorCard totalAmount={revenue} />
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-cafeBlack text-center">Activités Récentes</h2>
        <div className="rounded-lg bg-white p-6 shadow-md mx-auto max-w-4xl">
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <User size={48} className="mb-4 text-gray-300" />
              <p className="text-center">Aucune activité récente</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cafeRed text-white flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cafeBlack">{activity.userName}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
