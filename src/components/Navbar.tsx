
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { User } from '../types';
import { LogOut } from 'lucide-react';
import { logout } from '../services/authService';

interface NavbarProps {
  user: User;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md">
      <div className="flex items-center justify-between px-3 md:px-4 py-3">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 text-center">
          <span className="text-cafeBlack text-sm md:text-base text-center">
            <span className="block md:inline">{user.name}</span>
            <span className="block md:inline text-cafeRed">({user.role === 'admin' ? 'Admin' : 'Agent'})</span>
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center text-cafeRed hover:text-red-700 p-1"
            title="Déconnexion"
          >
            <LogOut size={18} className="md:hidden" />
            <LogOut size={20} className="hidden md:block" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
