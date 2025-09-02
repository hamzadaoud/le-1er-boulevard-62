import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getRevenues, clearAllActivities, clearAllSystemData } from '../services/cafeService';
import { printThermalRevenueReport } from '../services/thermalRevenueService';
import { checkIsAdmin } from '../services/authService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, Calendar, Printer, Trash2, Database } from 'lucide-react';
import PrinterSelectDialog from '../components/PrinterSelectDialog';
import { isElectron, electronStore } from '@/utils/electronUtils';

const RevenuePage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [periodType, setPeriodType] = useState<'day' | 'month' | 'year' | 'custom'>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    setIsAdmin(checkIsAdmin());

    const refresh = () => {
      if (periodType === 'custom' && startDate && endDate) {
        filterByPeriod('custom', startDate, endDate);
      } else {
        filterByPeriod(periodType);
      }
    };

    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [periodType, startDate, endDate]);
  
  const filterByPeriod = (period: 'day' | 'month' | 'year' | 'custom', customStart?: string, customEnd?: string) => {
    const revenues = getRevenues();
    let filtered = [];
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (period) {
      case 'day':
        filtered = revenues.filter(item => item.date === todayStr);
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
        
      case 'month':
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        filtered = revenues.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() === currentMonth && 
                 itemDate.getFullYear() === currentYear;
        });
        setStartDate(new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]);
        setEndDate(new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]);
        break;
        
      case 'year':
        const year = today.getFullYear();
        filtered = revenues.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === year;
        });
        setStartDate(new Date(year, 0, 1).toISOString().split('T')[0]);
        setEndDate(new Date(year, 11, 31).toISOString().split('T')[0]);
        break;
        
      case 'custom':
        if (customStart && customEnd) {
          filtered = revenues.filter(item => {
            return item.date >= customStart && item.date <= customEnd;
          });
          setStartDate(customStart);
          setEndDate(customEnd);
        }
        break;
    }
    
    setPeriodType(period);
    setFilteredData(filtered);
    
    const total = filtered.reduce((sum, item) => sum + item.amount, 0);
    setTotalRevenue(total);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };
  
  const chartData = filteredData.map(item => ({
    name: formatDate(item.date),
    revenue: item.amount
  })).slice(0, 20); // Limit to 20 items for better visualization
  
  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      filterByPeriod('custom', startDate, endDate);
    }
  };
  
  const handlePrintReport = () => {
    printThermalRevenueReport(filteredData, periodType, startDate, endDate, totalRevenue);
  };

  const handleClearActivities = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider toutes les activités ? Cette action est irréversible.')) {
      try {
        clearAllActivities();
        alert('Toutes les activités ont été supprimées avec succès.');
      } catch (error) {
        alert('Erreur: Seuls les administrateurs peuvent effectuer cette action.');
      }
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider TOUTES les données du système (commandes, revenus, logs, activités) ? Cette action est IRRÉVERSIBLE.')) {
      if (window.confirm('ATTENTION: Cette action supprimera définitivement toutes les commandes, revenus, pointages et activités. Confirmez-vous ?')) {
        try {
          clearAllSystemData();
          // Recharger la page pour afficher les données mises à jour
          window.location.reload();
        } catch (error) {
          alert('Erreur: Seuls les administrateurs peuvent effectuer cette action.');
        }
      }
    }
  };
  
  return (
    <DashboardLayout requireAdmin={true}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-cafeBlack">Revenus</h1>
          <p className="text-gray-500">Analyse des revenus du café</p>
        </div>
        
        {/* Actions rapides pour admin */}
        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 rounded-md bg-cafeRed px-4 py-2 text-white hover:bg-red-700 transition-colors"
            >
              <Printer size={16} />
              Imprimer le Rapport
            </button>
            <button
              onClick={handleClearActivities}
              className="flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 transition-colors"
            >
              <Trash2 size={16} />
              Vider les Activités
            </button>
            <button
              onClick={handleClearAllData}
              className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
            >
              <Database size={16} />
              Vider Toutes les Données
            </button>
          </div>
        )}
        
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            <button
              onClick={() => filterByPeriod('day')}
              className={`flex items-center gap-2 rounded-md px-3 md:px-4 py-2 text-sm md:text-base ${periodType === 'day' ? 'bg-cafeRed text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Aujourd'hui</span>
              <span className="sm:hidden">Jour</span>
            </button>
            
            <button
              onClick={() => filterByPeriod('month')}
              className={`flex items-center gap-2 rounded-md px-3 md:px-4 py-2 text-sm md:text-base ${periodType === 'month' ? 'bg-cafeRed text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Ce mois</span>
              <span className="sm:hidden">Mois</span>
            </button>
            
            <button
              onClick={() => filterByPeriod('year')}
              className={`flex items-center gap-2 rounded-md px-3 md:px-4 py-2 text-sm md:text-base ${periodType === 'year' ? 'bg-cafeRed text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Cette année</span>
              <span className="sm:hidden">Année</span>
            </button>
            
            <div className={`flex flex-col sm:flex-row items-center gap-2 rounded-md px-3 md:px-4 py-2 ${periodType === 'custom' ? 'bg-cafeRed text-white' : 'bg-gray-100 text-gray-700'}`}>
              <span className="text-sm">Personnalisé:</span>
              <div className="flex flex-wrap gap-1 md:gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriodType('custom');
                    if (e.target.value && endDate) {
                      setTimeout(() => filterByPeriod('custom', e.target.value, endDate), 100);
                    }
                  }}
                  className="rounded border px-2 py-1 text-sm bg-white text-gray-700 w-32"
                />
                <span className="text-xs">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriodType('custom');
                    if (startDate && e.target.value) {
                      setTimeout(() => filterByPeriod('custom', startDate, e.target.value), 100);
                    }
                  }}
                  className="rounded border px-2 py-1 text-sm bg-white text-gray-700 w-32"
                />
                <button
                  onClick={() => {
                    if (startDate && endDate) {
                      setPeriodType('custom');
                      filterByPeriod('custom', startDate, endDate);
                    }
                  }}
                  className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-800"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8 grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-4 md:p-6 shadow-md text-center">
            <h2 className="mb-2 text-sm md:text-lg font-medium text-gray-500">Revenu Total</h2>
            <p className="text-xl md:text-3xl font-bold text-cafeRed">{totalRevenue.toFixed(2)} MAD</p>
          </div>
          
          <div className="rounded-lg bg-white p-4 md:p-6 shadow-md text-center">
            <h2 className="mb-2 text-sm md:text-lg font-medium text-gray-500">Période</h2>
            <p className="text-sm md:text-lg font-bold text-cafeBlack">
              {startDate === endDate 
                ? formatDate(startDate) 
                : `${formatDate(startDate)} - ${formatDate(endDate)}`}
            </p>
          </div>
          
          <div className="rounded-lg bg-white p-4 md:p-6 shadow-md text-center md:col-span-2 lg:col-span-1">
            <h2 className="mb-2 text-sm md:text-lg font-medium text-gray-500">Moyenne Journalière</h2>
            <p className="text-xl md:text-3xl font-bold text-cafeBlack">
              {filteredData.length ? (totalRevenue / filteredData.length).toFixed(2) : 0} MAD
            </p>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 md:p-6 shadow-md">
          <h2 className="mb-6 text-lg md:text-xl font-semibold text-cafeBlack text-center">Évolution des Revenus</h2>
          
          {chartData.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`${value} MAD`, 'Revenu']}
                  />
                  <Bar dataKey="revenue" fill="#e63946" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 md:h-80 items-center justify-center text-gray-500 text-center">
              <div>
                <p className="text-lg mb-2">📊</p>
                <p>Aucune donnée de revenu disponible pour cette période</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 rounded-lg bg-white p-4 md:p-6 shadow-md">
          <h2 className="mb-4 text-lg md:text-xl font-semibold text-cafeBlack text-center">Détails des Revenus</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left font-semibold text-cafeBlack text-center">Date</th>
                  <th className="pb-3 text-right font-semibold text-cafeBlack text-center">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">
                      Aucune donnée de revenu disponible pour cette période
                    </td>
                  </tr>
                ) : (
                  filteredData.map((revenue, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-center">{new Date(revenue.date).toLocaleDateString()}</td>
                      <td className="py-3 text-center font-medium">{revenue.amount.toFixed(2)} MAD</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RevenuePage;
