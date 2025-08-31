
import React from 'react';
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="w-full animate-fadeIn">
      <div className="mb-6 md:mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="cafe-card text-center">
        <h1 className="mb-6 text-xl md:text-2xl font-bold text-cafeBlack text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
