import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, LogIn, LogOut, Users } from 'lucide-react';
import { TimeLog, LoginActivity, Order } from '../types';
import { clockIn, clockOut, getTimeLogs, getOrders } from '../services/cafeService';
import { getCurrentUser, getStoredLoginActivities } from '../services/authService';

const TimeTrackingPage: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentLog, setCurrentLog] = useState<TimeLog | null>(null);
  
  const user = getCurrentUser();
  
  useEffect(() => {
    const logs = getTimeLogs();
    setTimeLogs(logs);
    
    // Charger les activités de connexion pour l'admin
    if (user?.role === 'admin') {
      const loginActivitiesData = getStoredLoginActivities();
      setLoginActivities(loginActivitiesData);
      
      const ordersData = getOrders();
      setOrders(ordersData);
    }
    
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const userLog = logs.find(
        log => log.userId === user.id && 
        log.date === today && 
        !log.clockOut
      );
      
      if (userLog) {
        setIsClockedIn(true);
        setCurrentLog(userLog);
      }
    }
  }, []);
  
  const handleClockIn = () => {
    const log = clockIn();
    if (log) {
      setTimeLogs([...timeLogs, log]);
      setIsClockedIn(true);
      setCurrentLog(log);
    }
  };
  
  const handleClockOut = () => {
    const log = clockOut();
    if (log) {
      setTimeLogs(timeLogs.map(l => 
        l.id === log.id ? log : l
      ));
      setIsClockedIn(false);
      setCurrentLog(null);
    }
  };
  
  // Filtrer les logs de l'utilisateur actuel pour les agents
  // Les administrateurs voient tous les logs
  const filteredLogs = user?.role === 'admin' 
    ? timeLogs 
    : timeLogs.filter(log => log.userId === user?.id);
  
  // Trier les logs par date, du plus récent au plus ancien
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    return new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime();
  });
  
  // Trier les activités de connexion par date
  const sortedLoginActivities = [...loginActivities].sort((a, b) => {
    return new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime();
  });
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (clockIn: Date, clockOut?: Date) => {
    if (!clockOut) return 'En cours';
    
    const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}min`;
  };
  
  // Fonction pour obtenir le nombre de tickets par agent
  const getTicketsByAgent = (userId: string, date: string) => {
    return orders.filter(order => 
      order.agentId === userId && 
      new Date(order.date).toISOString().split('T')[0] === date
    ).length;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-cafeBlack">Pointage</h1>
        <p className="text-gray-500">Gérez vos heures de travail</p>
      </div>
      
      <div className="mb-8 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-cafeBlack text-center">Pointage Journalier</h2>
          
          {currentLog && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 text-center">
              <p>Vous êtes actuellement pointé depuis {formatTime(currentLog.clockIn)}</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn}
              className={`flex items-center rounded-md px-6 py-3 font-medium text-white ${
                isClockedIn 
                  ? 'cursor-not-allowed bg-gray-400' 
                  : 'bg-cafeRed hover:bg-red-700'
              }`}
            >
              <LogIn size={18} className="mr-2" />
              Pointer Arrivée
            </button>
            
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className={`flex items-center rounded-md px-6 py-3 font-medium text-white ${
                !isClockedIn 
                  ? 'cursor-not-allowed bg-gray-400' 
                  : 'bg-cafeBlack hover:bg-gray-700'
              }`}
            >
              <LogOut size={18} className="mr-2" />
              Pointer Départ
            </button>
          </div>
        </div>
        
        <div className="w-full lg:w-96">
          <h2 className="mb-4 text-xl font-semibold text-cafeBlack text-center">Calendrier</h2>
          
          <div className="rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-col items-center justify-center py-4 text-cafeRed">
              <Calendar size={48} className="mb-2" />
              <p className="text-xl font-bold text-center">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section des connexions pour l'admin */}
      {user?.role === 'admin' && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-cafeBlack text-center">
            Connexions des Agents
          </h2>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-center font-semibold text-cafeBlack">Agent</th>
                    <th className="pb-3 text-center font-semibold text-cafeBlack">Date</th>
                    <th className="pb-3 text-center font-semibold text-cafeBlack">Heure de Connexion</th>
                    <th className="pb-3 text-center font-semibold text-cafeBlack">Tickets Réalisés</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLoginActivities.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-center">{activity.userName}</td>
                      <td className="py-3 text-center">{new Date(activity.date).toLocaleDateString()}</td>
                      <td className="py-3 text-center">{formatTime(activity.loginTime)}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cafeRed text-white">
                          {getTicketsByAgent(activity.userId, activity.date)} tickets
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sortedLoginActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Aucune connexion enregistrée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="mb-4 text-xl font-semibold text-cafeBlack text-center">
          {user?.role === 'admin' ? 'Tous les Pointages' : 'Mes Pointages'}
        </h2>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  {user?.role === 'admin' && (
                    <th className="pb-3 text-center font-semibold text-cafeBlack">Agent</th>
                  )}
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Date</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Arrivée</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Départ</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Durée</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 last:border-0">
                    {user?.role === 'admin' && (
                      <td className="py-3 text-center">{log.userName}</td>
                    )}
                    <td className="py-3 text-center">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="py-3 text-center">{formatTime(log.clockIn)}</td>
                    <td className="py-3 text-center">{log.clockOut ? formatTime(log.clockOut) : 'En cours'}</td>
                    <td className="py-3 text-center">{formatDuration(log.clockIn, log.clockOut)}</td>
                  </tr>
                ))}
                {sortedLogs.length === 0 && (
                  <tr>
                    <td 
                      colSpan={user?.role === 'admin' ? 5 : 4} 
                      className="py-4 text-center text-gray-500"
                    >
                      Aucun pointage enregistré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;
