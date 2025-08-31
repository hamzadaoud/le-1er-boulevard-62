
import React from 'react';
import { Banknote, Coins } from 'lucide-react';

interface MoneyBreakdownProps {
  totalAmount: number;
}

const MoneyCalculatorCard: React.FC<MoneyBreakdownProps> = ({ totalAmount }) => {
  const calculateBillBreakdown = (amount: number) => {
    const bills = [200, 100, 50, 20, 10, 5, 2, 1];
    const breakdown: { [key: number]: number } = {};
    let remaining = Math.floor(amount);
    
    bills.forEach(bill => {
      if (remaining >= bill) {
        breakdown[bill] = Math.floor(remaining / bill);
        remaining = remaining % bill;
      }
    });
    
    return breakdown;
  };

  const billBreakdown = calculateBillBreakdown(totalAmount);
  const hasBreakdown = Object.keys(billBreakdown).length > 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-cafeBlack text-center flex items-center justify-center gap-2">
        <Banknote size={20} className="text-green-600" />
        Répartition en Billets
      </h3>
      
      <div className="mb-4 text-center">
        <p className="text-2xl font-bold text-cafeRed">{totalAmount.toFixed(2)} MAD</p>
      </div>
      
      {!hasBreakdown ? (
        <div className="flex flex-col items-center justify-center py-4 text-gray-500">
          <Coins size={32} className="mb-2 text-gray-300" />
          <p className="text-center text-sm">Aucun montant à répartir</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(billBreakdown)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([denomination, count]) => (
            <div key={denomination} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${
                  Number(denomination) >= 100 ? 'bg-blue-600' :
                  Number(denomination) >= 20 ? 'bg-green-600' :
                  Number(denomination) >= 5 ? 'bg-orange-500' : 'bg-gray-500'
                }`}>
                  {Number(denomination) >= 10 ? denomination : <Coins size={12} />}
                </div>
                <span className="text-sm font-medium">
                  {Number(denomination)} MAD
                </span>
              </div>
              <span className="text-sm font-bold text-cafeBlack">
                × {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoneyCalculatorCard;
