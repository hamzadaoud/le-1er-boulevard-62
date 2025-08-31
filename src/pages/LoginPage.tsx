
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authenticate, getCurrentUser } from '../services/authService';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const user = getCurrentUser();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    const user = authenticate(email, password);
    
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cafeLightGray px-4">
      <div className="w-full max-w-md">
        <AuthLayout title="Connexion">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-2 block text-sm font-medium text-cafeBlack text-center">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cafe-input w-full text-center"
                placeholder="votre@email.com"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-cafeBlack text-center">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cafe-input w-full text-center"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-cafeGold py-3 font-medium text-black transition-colors hover:bg-yellow-600"
            >
              <LogIn size={18} className="mr-2" />
              Se connecter
            </button>
          </form>
        </AuthLayout>
      </div>
    </div>
  );
};

export default LoginPage;
