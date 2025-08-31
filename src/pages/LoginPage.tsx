import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authenticate, getCurrentUser } from '../services/authService';
import { LogIn } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
  const navigate = useNavigate();
  
  const user = getCurrentUser();
  
  useEffect(() => {
    // Enable scrolling for login page
    document.body.classList.add('login-page-scrollable');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('login-page-scrollable');
    };
  }, []);
  
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
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleKeyPress = (key: string) => {
    if (activeField === 'email') {
      setEmail(prev => prev + key);
    } else if (activeField === 'password') {
      setPassword(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    if (activeField === 'email') {
      setEmail(prev => prev.slice(0, -1));
    } else if (activeField === 'password') {
      setPassword(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cafeLightGray px-2 py-4">
      <div className="w-full max-w-sm">
        <AuthLayout title="Connexion">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-500 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-1 block text-xs font-medium text-cafeBlack text-center">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveField('email')}
                className="cafe-input w-full text-center text-sm h-8 px-2"
                placeholder="votre@email.com"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-cafeBlack text-center">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveField('password')}
                className="cafe-input w-full text-center text-sm h-8 px-2"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-cafeGold py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-600"
            >
              <LogIn size={16} className="mr-1" />
              Se connecter
            </button>
          </form>
        </AuthLayout>
      </div>
      
      {/* Virtual Keyboard - Now outside AuthLayout for better space management */}
      <div className="w-full max-w-sm mt-4">
        <VirtualKeyboard 
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          isPassword={activeField === 'password'}
        />
      </div>
    </div>
  );
};

export default LoginPage;
