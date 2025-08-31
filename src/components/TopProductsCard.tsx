
import React from 'react';
import { Trophy, Package } from 'lucide-react';

interface ProductSale {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsCardProps {
  topProducts: ProductSale[];
}

const TopProductsCard: React.FC<TopProductsCardProps> = ({ topProducts }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-cafeBlack text-center flex items-center justify-center gap-2">
        <Trophy size={20} className="text-yellow-500" />
        Produits les Plus Vendus
      </h3>
      
      {topProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Package size={48} className="mb-4 text-gray-300" />
          <p className="text-center">Aucune vente enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topProducts.slice(0, 5).map((product, index) => (
            <div key={product.name} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-400' : 'bg-cafeRed'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-cafeBlack">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} unités vendues</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-cafeRed">{product.revenue.toFixed(2)} MAD</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProductsCard;
