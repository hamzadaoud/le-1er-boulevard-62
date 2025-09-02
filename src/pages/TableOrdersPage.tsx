import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Coffee, Printer, Milk, Banana, GlassWater, Beer, Sandwich, Users, MapPin } from 'lucide-react';
import { Drink, OrderItem } from '../types';
import { getDrinks } from '../services/cafeService';
import { getTables, getTablesByZone, createTableOrder, completeTableOrder } from '../services/tableService';
import { printTableTicket } from '../services/ticketTableService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrinterSelectDialog from '../components/PrinterSelectDialog';
import { isElectron, electronStore } from '@/utils/electronUtils';

const TableOrdersPage: React.FC = () => {
  // Panier séparé par table
  const [tablesCarts, setTablesCarts] = useState<{ [tableId: string]: OrderItem[] }>({});
  const [drinks, setDrinks] = useState<Drink[]>(getDrinks());
  const [categoryFilter, setCategoryFilter] = useState<string>("Tous");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [printedTables, setPrintedTables] = useState<Set<string>>(new Set());
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Panier de la table actuelle
  const cart = tablesCarts[selectedTable] || [];

  // Synchroniser les produits automatiquement
  React.useEffect(() => {
    const refreshDrinks = () => {
      setDrinks(getDrinks());
    };
    
    // Vérifier les changements toutes les 2 secondes
    const interval = setInterval(refreshDrinks, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fonction pour changer de table (conserver le panier)
  const handleTableSelection = (tableId: string) => {
    setSelectedTable(tableId);
  };
  
  const tables = getTables();
  const tablesByZone = getTablesByZone();
  
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
  
  // Fonction pour mettre à jour le panier d'une table spécifique
  const updateTableCart = (tableId: string, newCart: OrderItem[]) => {
    setTablesCarts(prev => ({
      ...prev,
      [tableId]: newCart
    }));
  };

  const addToCart = (drink: Drink) => {
    if (!selectedTable) {
      alert("Veuillez d'abord sélectionner une table.");
      return;
    }
    
    const existingItem = cart.find(item => item.drinkId === drink.id);
    
    if (existingItem) {
      const newCart = cart.map(item => 
        item.drinkId === drink.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      updateTableCart(selectedTable, newCart);
    } else {
      const newCart = [
        ...cart, 
        {
          drinkId: drink.id,
          drinkName: drink.name,
          quantity: 1,
          unitPrice: drink.price
        }
      ];
      updateTableCart(selectedTable, newCart);
    }
  };
  
  const removeFromCart = (drinkId: string) => {
    const newCart = cart.filter(item => item.drinkId !== drinkId);
    updateTableCart(selectedTable, newCart);
  };
  
  const updateQuantity = (drinkId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(drinkId);
      return;
    }
    
    const newCart = cart.map(item => 
      item.drinkId === drinkId ? { ...item, quantity } : item
    );
    updateTableCart(selectedTable, newCart);
  };
  
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };
  
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Veuillez ajouter au moins une boisson au panier.");
      return;
    }
    
    if (!selectedTable) {
      alert("Veuillez sélectionner une table.");
      return;
    }
    
    const order = createTableOrder(selectedTable, cart);
    
    if (order) {
      if (isElectron()) {
        const type = await electronStore.get('printerType');
        if (!type) {
          setPendingAction(() => () => {
            printTableTicket(order);
            setPrintedTables(prev => new Set(prev).add(selectedTable));
            updateTableCart(selectedTable, []);
          });
          setPrinterDialogOpen(true);
          return;
        }
      }
      printTableTicket(order);
      // Marquer la table comme imprimée
      setPrintedTables(prev => new Set(prev).add(selectedTable));
      // Vider seulement le panier après impression
      updateTableCart(selectedTable, []);
    }
  };

  const clearTable = () => {
    if (!selectedTable) {
      alert("Veuillez sélectionner une table.");
      return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir vider cette table ?")) {
      // Mettre la table en statut 'available' (verte)
      const tables = getTables();
      const updatedTables = tables.map(t => 
        t.id === selectedTable ? { ...t, status: 'available' as const } : t
      );
      localStorage.setItem('tables', JSON.stringify(updatedTables));
      
      // Vider le panier de la table
      updateTableCart(selectedTable, []);
      
      // Retirer la table de la liste des tables imprimées
      setPrintedTables(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedTable);
        return newSet;
      });
      
      // Déselectionner la table
      setSelectedTable("");
    }
  };

  const selectedTableInfo = selectedTable ? tables.find(t => t.id === selectedTable) : null;

  return (
    <DashboardLayout>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-cafeBlack">Commandes par Table</h1>
        <p className="text-gray-500">Créez une nouvelle commande pour une table</p>
      </div>

      {/* Sélection de la table */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cafeGold">
              <Users className="h-5 w-5" />
              Sélection de la Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                <div key={zone} className="space-y-2">
                  <h3 className="font-semibold text-cafeGold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {zone}
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {zoneTables.map(table => (
                      <Button
                        key={table.id}
                        variant={selectedTable === table.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTableSelection(table.id)}
                        disabled={table.status === 'occupied'}
                        className={`
                          ${table.status === 'occupied' 
                            ? 'bg-red-500 text-white border-red-500 cursor-not-allowed hover:bg-red-500' 
                            : table.status === 'ordering'
                              ? 'bg-red-500 text-white border-red-500'
                              : table.status === 'available'
                                ? (tablesCarts[table.id] && tablesCarts[table.id].length > 0)
                                  ? 'bg-red-500 text-white border-red-500'
                                  : selectedTable === table.id 
                                    ? 'bg-cafeGold text-black'
                                    : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                : 'border-cafeGold hover:bg-cafeGold hover:text-black'
                          }
                        `}
                      >
                        {table.number}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedTableInfo && (
              <div className="mt-4 p-3 bg-cafeGold/10 border border-cafeGold rounded-lg">
                <p className="text-cafeGold font-semibold">
                  Table sélectionnée: {selectedTableInfo.number} ({selectedTableInfo.zone})
                  {cart.length > 0 && (
                    <span className="ml-2 text-red-600 font-bold">- Commande en cours</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
                <SelectTrigger className="border-cafeGold focus:ring-cafeGold">
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
                className="rounded-lg bg-white p-4 shadow-md transition-transform duration-300 hover:scale-105 w-full max-w-sm flex flex-col h-full border border-cafeGold/20"
              >
                <div className="mb-3 flex flex-col items-center text-center gap-2 flex-grow">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex justify-center text-cafeGold">{getCategoryIcon(drink.category)}</div>
                    <h3 className="font-medium text-center">{drink.name}</h3>
                  </div>
                  <span className="text-cafeGold font-semibold text-center">{drink.price.toFixed(2)} MAD</span>
                  
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
                            className="ml-1 text-cafeGold hover:underline focus:outline-none"
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
                    className="w-full max-w-[200px] h-10 rounded-md bg-cafeGold text-black transition-colors hover:bg-yellow-600 text-center font-medium"
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
          
          <div className="rounded-lg bg-white p-4 shadow-md border border-cafeGold/20">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-center">
                <div className="flex justify-center mb-2">
                  <Coffee size={48} className="text-cafeGold" />
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
                    <span className="font-semibold text-cafeGold text-center">{calculateTotal().toFixed(2)} MAD</span>
                  </div>
                </div>
                
                <button
                  onClick={submitOrder}
                  disabled={!selectedTable}
                  className={`flex w-full items-center justify-center rounded-md py-3 mb-2 font-medium text-black transition-colors ${
                    selectedTable 
                      ? 'bg-cafeGold hover:bg-yellow-600' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-center mr-2">
                    <Printer size={18} />
                  </div>
                  Imprimer Ticket
                </button>
                
                {cart.length > 0 && (
                  <button
                    onClick={clearTable}
                    className="flex w-full items-center justify-center rounded-md py-3 font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Vider la Table
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <PrinterSelectDialog
        open={printerDialogOpen}
        onOpenChange={setPrinterDialogOpen}
        onSaved={() => {
          const fn = pendingAction;
          setPendingAction(null);
          fn?.();
        }}
      />
    </DashboardLayout>
  );
};

export default TableOrdersPage;