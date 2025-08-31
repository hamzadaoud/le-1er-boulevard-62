import { Table, TableOrder, OrderItem, Order } from '../types';
import { getCurrentUser, registerActivity } from './authService';

// Tables initiales par zone
const initialTables: Table[] = [
  // Salle principale
  { id: 't1', number: 1, zone: 'Salle', status: 'available' },
  { id: 't2', number: 2, zone: 'Salle', status: 'available' },
  { id: 't3', number: 3, zone: 'Salle', status: 'available' },
  { id: 't4', number: 4, zone: 'Salle', status: 'available' },
  { id: 't5', number: 5, zone: 'Salle', status: 'available' },
  { id: 't6', number: 6, zone: 'Salle', status: 'available' },
  { id: 't7', number: 7, zone: 'Salle', status: 'available' },
  { id: 't8', number: 8, zone: 'Salle', status: 'available' },
  { id: 't9', number: 9, zone: 'Salle', status: 'available' },
  { id: 't10', number: 10, zone: 'Salle', status: 'available' },
  
  // Mezzanine
  { id: 't11', number: 11, zone: 'Mezzanine', status: 'available' },
  { id: 't12', number: 12, zone: 'Mezzanine', status: 'available' },
  { id: 't13', number: 13, zone: 'Mezzanine', status: 'available' },
  { id: 't14', number: 14, zone: 'Mezzanine', status: 'available' },
  { id: 't15', number: 15, zone: 'Mezzanine', status: 'available' },
  { id: 't16', number: 16, zone: 'Mezzanine', status: 'available' },
  
  // Terrasse
  { id: 't17', number: 17, zone: 'Terrasse', status: 'available' },
  { id: 't18', number: 18, zone: 'Terrasse', status: 'available' },
  { id: 't19', number: 19, zone: 'Terrasse', status: 'available' },
  { id: 't20', number: 20, zone: 'Terrasse', status: 'available' },
  { id: 't21', number: 21, zone: 'Terrasse', status: 'available' },
  { id: 't22', number: 22, zone: 'Terrasse', status: 'available' }
];

// Initialiser le stockage
const initTableStorage = () => {
  if (!localStorage.getItem('tables')) {
    localStorage.setItem('tables', JSON.stringify(initialTables));
  }
  
  if (!localStorage.getItem('tableOrders')) {
    localStorage.setItem('tableOrders', JSON.stringify([]));
  }
};

// Récupérer les tables
export const getTables = (): Table[] => {
  initTableStorage();
  try {
    return JSON.parse(localStorage.getItem('tables') || '[]');
  } catch {
    return initialTables;
  }
};

// Récupérer les commandes de table
export const getTableOrders = (): TableOrder[] => {
  initTableStorage();
  try {
    return JSON.parse(localStorage.getItem('tableOrders') || '[]');
  } catch {
    return [];
  }
};

// Récupérer les tables par zone
export const getTablesByZone = () => {
  const tables = getTables();
  const zones: Record<string, Table[]> = {};
  
  tables.forEach(table => {
    if (!zones[table.zone]) {
      zones[table.zone] = [];
    }
    zones[table.zone].push(table);
  });
  
  // Trier les tables par numéro dans chaque zone
  Object.keys(zones).forEach(zone => {
    zones[zone].sort((a, b) => a.number - b.number);
  });
  
  return zones;
};

// Créer une commande pour une table
export const createTableOrder = (tableId: string, items: OrderItem[]): TableOrder | null => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const tables = getTables();
  const table = tables.find(t => t.id === tableId);
  if (!table) return null;
  
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  
  const newOrder: TableOrder = {
    id: `tableorder_${Date.now()}`,
    tableId,
    tableNumber: table.number,
    items,
    total,
    date: new Date(),
    agentId: user.id,
    agentName: user.name,
    status: 'pending'
  };
  
  // Mettre à jour le statut de la table (en cours de commande)
  const updatedTables = tables.map(t => 
    t.id === tableId 
      ? { ...t, status: 'ordering' as const, currentOrderId: newOrder.id }
      : t
  );
  
  const orders = getTableOrders();
  orders.push(newOrder);
  
  localStorage.setItem('tables', JSON.stringify(updatedTables));
  localStorage.setItem('tableOrders', JSON.stringify(orders));
  
  // Enregistrer immédiatement dans les données du tableau de bord
  try {
    const storedOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const normalOrder: Order = {
      id: `order_${Date.now()}`,
      items: items,
      total: total,
      date: new Date(),
      agentId: user.id,
      agentName: user.name,
      completed: false, // Pas encore finalisée
    };
    storedOrders.push(normalOrder);
    localStorage.setItem('orders', JSON.stringify(storedOrders));
    
    // Enregistrer aussi dans les revenus pour le tableau de bord
    const revenues = JSON.parse(localStorage.getItem('revenues') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const existingRevenue = revenues.find((r: any) => r.date === today);
    
    if (existingRevenue) {
      existingRevenue.amount += total;
    } else {
      revenues.push({
        date: today,
        amount: total
      });
    }
    localStorage.setItem('revenues', JSON.stringify(revenues));
  } catch (e) {
    console.error('Erreur lors de l\'enregistrement des données du tableau de bord:', e);
  }
  
  registerActivity(`A créé une commande pour la table ${table.number} (${table.zone}) - ${total.toFixed(2)} MAD`);
  
  return newOrder;
};

// Finaliser une commande de table (impression du ticket)
export const completeTableOrder = (orderId: string): boolean => {
  const orders = getTableOrders();
  const tables = getTables();
  
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return false;
  
  const order = orders[orderIndex];
  
  // Marquer la commande comme terminée
  orders[orderIndex].status = 'completed';
  
  // Libérer la table
  const updatedTables = tables.map(t => 
    t.id === order.tableId 
      ? { ...t, status: 'available' as const, currentOrderId: undefined }
      : t
  );
  
  localStorage.setItem('tables', JSON.stringify(updatedTables));
  localStorage.setItem('tableOrders', JSON.stringify(orders));
  
  // Enregistrer également une commande "globale" pour les statistiques et revenus du tableau de bord
  try {
    const storedOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const normalOrder: Order = {
      id: `order_${Date.now()}`,
      items: order.items,
      total: order.total,
      date: order.date,
      agentId: order.agentId,
      agentName: order.agentName,
      completed: true,
    };
    storedOrders.push(normalOrder);
    localStorage.setItem('orders', JSON.stringify(storedOrders));
    
    // Enregistrer aussi dans les revenus pour le tableau de bord
    const revenues = JSON.parse(localStorage.getItem('revenues') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const existingRevenue = revenues.find((r: any) => r.date === today);
    
    if (existingRevenue) {
      existingRevenue.amount += order.total;
    } else {
      revenues.push({
        date: today,
        amount: order.total
      });
    }
    localStorage.setItem('revenues', JSON.stringify(revenues));
  } catch (e) {
    // Fallback en cas d'erreur de parsing
    const normalOrder: Order = {
      id: `order_${Date.now()}`,
      items: order.items,
      total: order.total,
      date: order.date,
      agentId: order.agentId,
      agentName: order.agentName,
      completed: true,
    };
    localStorage.setItem('orders', JSON.stringify([normalOrder]));
    localStorage.setItem('revenues', JSON.stringify([{
      date: new Date().toISOString().split('T')[0],
      amount: order.total
    }]));
  }
  
  registerActivity(`A finalisé la commande de la table ${order.tableNumber} - ${order.total.toFixed(2)} MAD`);
  
  return true;
};

// Annuler une commande de table
export const cancelTableOrder = (orderId: string): boolean => {
  const orders = getTableOrders();
  const tables = getTables();
  
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;
  
  // Supprimer la commande
  const updatedOrders = orders.filter(o => o.id !== orderId);
  
  // Libérer la table
  const updatedTables = tables.map(t => 
    t.id === order.tableId 
      ? { ...t, status: 'available' as const, currentOrderId: undefined }
      : t
  );
  
  localStorage.setItem('tables', JSON.stringify(updatedTables));
  localStorage.setItem('tableOrders', JSON.stringify(updatedOrders));
  
  registerActivity(`A annulé la commande de la table ${order.tableNumber}`);
  
  return true;
};

// Obtenir les zones disponibles
export const getZones = (): string[] => {
  const tables = getTables();
  return [...new Set(tables.map(t => t.zone))].sort();
};