import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Coffee, Printer, Milk, Banana, GlassWater, Beer, Sandwich } from 'lucide-react';
import { Drink, OrderItem } from '../types';
import { createOrder, getDrinks } from '../services/cafeService';
import { printTicket } from '../services/printingService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrdersPage: React.FC = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [drinks] = useState<Drink[]>(getDrinks());
  const [categoryFilter, setCategoryFilter] = useState<string>("Tous");
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  
  const categories = useMemo(() => {
    const cats = ["Tous", ...new Set(drinks.map(drink => drink.category))];
    return cats.sort();
  }, [drinks]);
  
  const filteredDrinks = useMemo(() => {
    return categoryFilter === "Tous" 
      ? drinks 
      : drinks.filter(drink => drink.category === categoryFilter);
  }, [drinks, categoryFilter]);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Café": return <Coffee className="h-5 w-5" />;
      case "Jus": return <Banana className="h-5 w-5" />;
      case "Soda": return <Beer className="h-5 w-5" />;
      case "Boisson": return <Milk className="h-5 w-5" />;
      case "Eau": return <GlassWater className="h-5 w-5" />;
      case "Repas": return <Sandwich className="h-5 w-5" />;
      default: return <Coffee className="h-5 w-5" />;
    }
  };

  const toggleDescription = (drinkId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [drinkId]: !prev[drinkId]
    }));
  };

  const truncateDescription = (description: string, maxLength: number = 50) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };
  
  const addToCart = (drink: Drink) => {
    const existingItem = cart.find(item => item.drinkId === drink.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.drinkId === drink.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([
        ...cart, 
        {
          drinkId: drink.id,
          drinkName: drink.name,
          quantity: 1,
          unitPrice: drink.price
        }
      ]);
    }
  };
  
  const removeFromCart = (drinkId: string) => {
    setCart(cart.filter(item => item.drinkId !== drinkId));
  };
  
  const updateQuantity = (drinkId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(drinkId);
      return;
    }
    
    setCart(cart.map(item => 
      item.drinkId === drinkId ? { ...item, quantity } : item
    ));
  };
  
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };
  
  const submitOrder = () => {
    if (cart.length === 0) {
      alert("Veuillez ajouter au moins une boisson au panier.");
      return;
    }
    
    const order = createOrder(cart);
    
    if (order) {
      printTicket(order);
      setCart([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-cafeBlack">Commandes</h1>
        <p className="text-gray-500">Créez une nouvelle commande</p>
      </div>
      
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-cafeBlack text-center sm:text-left">Menu</h2>
            <div className="w-full sm:w-48">
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="border-cafeRed focus:ring-cafeRed">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center justify-center">
                        {category !== "Tous" && getCategoryIcon(category)}
                        <span className="ml-2">{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {filteredDrinks.map((drink) => (
              <div 
                key={drink.id} 
                className="rounded-lg bg-white p-4 shadow-md transition-transform duration-300 hover:scale-105 w-full max-w-sm flex flex-col h-full"
              >
                <div className="mb-3 flex flex-col items-center text-center gap-2 flex-grow">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex justify-center">{getCategoryIcon(drink.category)}</div>
                    <h3 className="font-medium text-center">{drink.name}</h3>
                  </div>
                  <span className="text-cafeRed font-semibold text-center">{drink.price.toFixed(2)} MAD</span>
                  
                  {drink.description && (
                    <div className="text-sm text-gray-500 text-center flex-grow">
                      <p>
                        {expandedDescriptions[drink.id] 
                          ? drink.description 
                          : truncateDescription(drink.description)
                        }
                        {drink.description.length > 50 && (
                          <button
                            onClick={() => toggleDescription(drink.id)}
                            className="ml-1 text-cafeRed hover:underline focus:outline-none"
                          >
                            {expandedDescriptions[drink.id] ? "Moins" : "Lire plus"}
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex justify-center">
                  <button
                    onClick={() => addToCart(drink)}
                    className="w-full max-w-[200px] h-10 rounded-md bg-cafeRed text-white transition-colors hover:bg-red-700 text-center font-medium"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-96">
          <h2 className="mb-4 text-xl font-semibold text-cafeBlack text-center lg:text-left">Panier</h2>
          
          <div className="rounded-lg bg-white p-4 shadow-md">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-center">
                <div className="flex justify-center mb-2">
                  <Coffee size={48} />
                </div>
                <p className="text-center">Votre panier est vide</p>
              </div>
            ) : (
              <>
                <div className="mb-4 max-h-72 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.drinkId} className="mb-3 flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 gap-2">
                      <div className="text-center sm:text-left w-full sm:w-auto">
                        <p className="font-medium text-center sm:text-left">{item.drinkName}</p>
                        <p className="text-sm text-gray-500 text-center sm:text-left">{item.unitPrice.toFixed(2)} MAD / unité</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => updateQuantity(item.drinkId, item.quantity - 1)}
                          className="h-8 w-8 rounded-md bg-gray-100 text-cafeBlack hover:bg-gray-200 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.drinkId, item.quantity + 1)}
                          className="h-8 w-8 rounded-md bg-gray-100 text-cafeBlack hover:bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-4 border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-center">Total:</span>
                    <span className="font-semibold text-cafeRed text-center">{calculateTotal().toFixed(2)} MAD</span>
                  </div>
                </div>
                
                <button
                  onClick={submitOrder}
                  className="flex w-full items-center justify-center rounded-md bg-cafeRed py-3 font-medium text-white transition-colors hover:bg-red-700"
                >
                  <div className="flex justify-center mr-2">
                    <Printer size={18} />
                  </div>
                  Valider et Imprimer Ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
