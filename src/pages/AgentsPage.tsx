
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRevenues } from '../services/cafeService';
import { printThermalRevenueReport } from '../services/thermalRevenueService';
import { checkIsAdmin } from '../services/authService';

const AgentsPage: React.FC = () => {
  const handlePrintDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const revenues = getRevenues();
    const todayRevenues = revenues.filter(r => r.date === today);
    const totalRevenue = todayRevenues.reduce((sum, r) => sum + r.amount, 0);
    
    printThermalRevenueReport(todayRevenues, 'day', today, today, totalRevenue);
  };

  // Données des agents (normalement à récupérer depuis une API/BDD)
  const agents = [
    {
      id: "admin1",
      name: "Mostapha",
      email: "Mostapha@perle-rouge.com",
      role: "admin",
      avatar: "MD",
      status: "active",
    },
    {
      id: "agent1",
      name: "Aziz",
      email: "Aziz@perle-rouge.com",
      role: "agent",
      avatar: "AZ",
      status: "active",
    },
    {
      id: "agent2",
      name: "Noureddine",
      email: "Noureddine@perle-rouge.com",
      role: "agent",
      avatar: "ND",
      status: "active",
    }
  ];

  const isAdmin = checkIsAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cafeBlack">
            {isAdmin ? "Gestion des Agents" : "Équipe de La Perle Rouge"}
          </h1>
          <p className="text-gray-500">
            {isAdmin ? "Liste des employés de La Perle Rouge" : "Liste de l'équipe et impression de rapport journalier"}
          </p>
        </div>
        <Button
          onClick={handlePrintDailyReport}
          className="bg-cafeRed text-white hover:bg-red-700"
        >
          <Printer className="h-4 w-4 mr-2" />
          Rapport Journalier
        </Button>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-semibold text-cafeBlack">Agent</th>
                <th className="pb-3 text-left font-semibold text-cafeBlack">Email</th>
                <th className="pb-3 text-left font-semibold text-cafeBlack">Rôle</th>
                <th className="pb-3 text-left font-semibold text-cafeBlack">Statut</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-cafeRed text-white">
                        {agent.avatar}
                      </div>
                      <span>{agent.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      {agent.email}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      agent.role === 'admin' 
                        ? 'bg-cafeRed text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {agent.role === 'admin' ? 'Administrateur' : 'Agent'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isAdmin && (
          <div className="mt-6 flex justify-center">
            <button
              className="rounded-md bg-cafeRed px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
              onClick={() => alert("La fonctionnalité d'ajout d'agent sera disponible prochainement")}
            >
              <User size={18} className="mr-2 inline" />
              Ajouter un agent
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentsPage;
