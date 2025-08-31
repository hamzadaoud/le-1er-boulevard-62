import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Drink } from '../types';
import { getDrinks, updateDrink, addDrink, deleteDrink } from '../services/cafeService';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProductsPage: React.FC = () => {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("Tous");
  const [newDrink, setNewDrink] = useState<Partial<Drink>>({
    name: '',
    price: 0,
    category: 'Café',
    description: ''
  });
  const [showNewDrinkForm, setShowNewDrinkForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Recharger les données à chaque fois pour synchroniser entre admin et agent
  useEffect(() => {
    const refreshData = () => {
      setDrinks(getDrinks());
    };
    
    refreshData();
    
    // Vérifier les changements toutes les 2 secondes
    const interval = setInterval(refreshData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const categories = React.useMemo(() => {
    const cats = ["Tous", ...new Set(drinks.map(drink => drink.category))];
    return cats.sort();
  }, [drinks]);

  const filteredDrinks = React.useMemo(() => {
    return categoryFilter === "Tous" 
      ? drinks 
      : drinks.filter(drink => drink.category === categoryFilter);
  }, [drinks, categoryFilter]);

  const handleEditDrink = (drink: Drink) => {
    setEditingDrink({...drink});
  };

  const handleSaveEdit = () => {
    if (editingDrink) {
      const updatedDrinks = updateDrink(editingDrink);
      setDrinks(updatedDrinks);
      setEditingDrink(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingDrink(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingDrink) {
      setEditingDrink({
        ...editingDrink,
        [name]: name === 'price' ? parseFloat(value) : value
      });
    }
  };
  
  const handleNewDrinkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDrink({
      ...newDrink,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };
  
  const handleNewDrinkCategoryChange = (value: string) => {
    if (value === "Nouvelle") {
      setShowNewCategoryInput(true);
      setNewCategoryName('');
    } else {
      setNewDrink({
        ...newDrink,
        category: value
      });
      setShowNewCategoryInput(false);
    }
  };
  
  const handleCreateNewCategory = () => {
    if (newCategoryName.trim()) {
      setNewDrink({
        ...newDrink,
        category: newCategoryName.trim()
      });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };
  
  const handleAddDrink = () => {
    if (newDrink.name && newDrink.price && newDrink.category) {
      const updatedDrinks = addDrink({
        id: `drink_${Date.now()}`,
        name: newDrink.name,
        price: newDrink.price,
        category: newDrink.category,
        description: newDrink.description || ''
      });
      
      setDrinks(updatedDrinks);
      setNewDrink({
        name: '',
        price: 0,
        category: 'Café',
        description: ''
      });
      setShowNewDrinkForm(false);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };
  
  const handleDeleteDrink = (drinkId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      const updatedDrinks = deleteDrink(drinkId);
      setDrinks(updatedDrinks);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cafeBlack">Gestion des Produits</h1>
        <p className="text-gray-500">Ajoutez, modifiez ou supprimez des produits</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48">
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="border-cafeRed focus:ring-cafeRed">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <button 
            onClick={() => setShowNewDrinkForm(true)}
            className="flex items-center bg-cafeRed text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Nouveau Produit
          </button>
        </div>
        
        {showNewDrinkForm && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Ajouter un nouveau produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={newDrink.name}
                  onChange={handleNewDrinkChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cafeRed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                <input
                  type="number"
                  name="price"
                  value={newDrink.price}
                  onChange={handleNewDrinkChange}
                  step="0.1"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cafeRed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Select
                  value={newDrink.category}
                  onValueChange={handleNewDrinkCategoryChange}
                >
                  <SelectTrigger className="border-gray-300 focus:ring-cafeRed">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "Tous").map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    <SelectItem value="Nouvelle">+ Nouvelle Catégorie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showNewCategoryInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la nouvelle catégorie</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Smoothies, Desserts..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cafeRed"
                    />
                    <button 
                      onClick={handleCreateNewCategory}
                      className="px-3 py-2 bg-cafeRed text-white rounded-md hover:bg-red-700"
                    >
                      OK
                    </button>
                    <button 
                      onClick={() => setShowNewCategoryInput(false)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newDrink.description}
                  onChange={handleNewDrinkChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cafeRed"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              <button 
                onClick={() => {
                  setShowNewDrinkForm(false);
                  setShowNewCategoryInput(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddDrink}
                className="px-4 py-2 bg-cafeRed text-white rounded-md hover:bg-red-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border-b">Nom</th>
                <th className="text-left p-3 border-b">Catégorie</th>
                <th className="text-left p-3 border-b">Prix (MAD)</th>
                <th className="text-left p-3 border-b">Description</th>
                <th className="text-right p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrinks.map(drink => (
                <tr key={drink.id} className="border-b hover:bg-gray-50">
                  {editingDrink && editingDrink.id === drink.id ? (
                    <>
                      <td className="p-3">
                        <input 
                          type="text" 
                          name="name"
                          value={editingDrink.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          name="category"
                          value={editingDrink.category}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        >
                          {categories.filter(c => c !== "Tous").map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          name="price"
                          value={editingDrink.price}
                          onChange={handleInputChange}
                          step="0.1"
                          min="0"
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          name="description"
                          value={editingDrink.description || ''}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={handleSaveEdit}
                          className="inline-flex items-center text-green-600 hover:text-green-800 mr-3"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">{drink.name}</td>
                      <td className="p-3">{drink.category}</td>
                      <td className="p-3">{drink.price.toFixed(2)} MAD</td>
                      <td className="p-3">{drink.description}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleEditDrink(drink)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDrink(drink.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;