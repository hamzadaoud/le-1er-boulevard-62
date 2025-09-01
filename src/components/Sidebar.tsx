
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, User, Users, Receipt, Calendar, BarChart2, Activity, Tags, Settings } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  user: UserType;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const isAdmin = user.role === 'admin';
  
  const links: SidebarLink[] = [
    {
      to: '/dashboard',
      label: 'Tableau de Bord',
      icon: <Activity size={20} />,
    },
    {
      to: '/table-orders',
      label: 'Commandes Tables',
      icon: <Users size={20} />,
    },
    {
      to: '/products',
      label: 'Produits',
      icon: <Tags size={20} />,
    },
    {
      to: '/time-tracking',
      label: 'Pointage',
      icon: <Calendar size={20} />,
    },
    {
      to: '/agent-management',
      label: 'Gestion Agents',
      icon: <User size={20} />,
      adminOnly: true,
    },
    {
      to: '/invoices',
      label: 'Factures',
      icon: <Receipt size={20} />,
      adminOnly: false,
    },
    {
      to: '/revenue',
      label: 'Revenus',
      icon: <BarChart2 size={20} />,
      adminOnly: true,
    },
    {
      to: '/agent-reports',
      label: 'Rapports',
      icon: <Receipt size={20} />,
      adminOnly: false,
    },
    {
      to: '/profile',
      label: 'Mon Profil',
      icon: <User size={20} />,
    },
    {
      to: '/settings',
      label: 'Paramètres',
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ];
  
  const filteredLinks = links.filter(link => !link.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-cafeBlack">
      <div className="py-4">
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center justify-center md:justify-start px-4 py-3 transition-colors text-center ${
                isActive
                  ? 'bg-cafeRed text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="flex justify-center md:mr-3">{link.icon}</span>
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
