
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cafeLightGray">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="cafe-card text-center">
          <div className="mb-6 flex justify-center text-cafeRed">
            <AlertTriangle size={64} />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-cafeBlack">Accès non autorisé</h1>
          <p className="mb-6 text-gray-500">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="flex justify-center">
            <Link
              to="/dashboard"
              className="rounded-md bg-cafeRed px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
