
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getCurrentUser } from '../services/authService';
import { User, Mail, Clock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-cafeBlack">Mon Profil</h1>
          <p className="text-gray-500">Informations personnelles</p>
        </div>
        
        <div className="mb-8 rounded-lg bg-white p-6 md:p-8 shadow-md">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-cafeRed text-2xl md:text-3xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <h2 className="mb-2 text-xl md:text-2xl font-bold text-cafeBlack">{user.name}</h2>
            <p className="mb-4 text-gray-500">{user.role === 'admin' ? 'Administrateur' : 'Agent'}</p>
            
            <div className="w-full max-w-md space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="flex flex-col items-center">
                  <Mail size={18} className="mb-2 text-cafeRed" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium break-all">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="flex flex-col items-center">
                  <User size={18} className="mb-2 text-cafeRed" />
                  <div>
                    <p className="text-sm text-gray-500">Identifiant</p>
                    <p className="font-medium">{user.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="flex flex-col items-center">
                  <Clock size={18} className="mb-2 text-cafeRed" />
                  <div>
                    <p className="text-sm text-gray-500">Dernière connexion</p>
                    <p className="font-medium text-sm">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="rounded-md bg-cafeRed px-4 md:px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 text-sm md:text-base"
            onClick={() => alert("La fonctionnalité de mise à jour du profil sera disponible prochainement")}
          >
            Mettre à jour mon profil
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
