
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-md transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-cafeRed text-2xl md:text-3xl flex justify-center">{icon}</div>
        <div className="flex-1 w-full">
          <h3 className="text-sm md:text-lg font-semibold text-gray-600 mb-2">{title}</h3>
          <p className="text-xl md:text-2xl font-bold text-cafeBlack">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
