import { Drink, Order, OrderItem, Revenue, TimeLog } from "../types";
import { getCurrentUser, registerActivity } from "./authService";

// Catalogue de boissonsddd
const initialDrinks: Drink[] = [
  {
    id: "1",
    name: "Café Normal",
    price: 2.0,
    category: "Café",
    description: "Un café traditionnel de qualité"
  },
  {
    id: "2",
    name: "Espresso",
    price: 2.5,
    category: "Café",
    description: "Un café fort et concentré"
  },
  {
    id: "3",
    name: "Cappuccino",
    price: 3.5,
    category: "Café",
    description: "Espresso, lait mousseux et cacao"
  },
  {
    id: "4",
    name: "Latte",
    price: 4.0,
    category: "Café",
    description: "Espresso avec beaucoup de lait"
  },
  {
    id: "5",
    name: "Thé Vert",
    price: 3.0,
    category: "Thé",
    description: "Thé vert bio"
  },
  {
    id: "6",
    name: "Jus d'Orange",
    price: 3.5,
    category: "Jus",
    description: "Pressé à la minute"
  },
  {
    id: "7",
    name: "Jus de Banane",
    price: 3.8,
    category: "Jus",
    description: "Onctueux et rafraîchissant"
  },
  {
    id: "8",
    name: "Panaché",
    price: 4.0,
    category: "Boisson",
    description: "Bière et limonade"
  },
  {
    id: "9",
    name: "Petit Déjeuner",
    price: 8.5,
    category: "Repas",
    description: "Café, jus d'orange et viennoiserie"
  },
  {
    id: "10",
    name: "Lait au Chocolat",
    price: 3.2,
    category: "Boisson",
    description: "Lait chaud avec du chocolat artisanal"
  },
  {
    id: "11",
    name: "Coca-Cola",
    price: 3.0,
    category: "Soda",
    description: "Classique et rafraîchissant"
  },
  {
    id: "12",
    name: "Fanta",
    price: 3.0,
    category: "Soda",
    description: "Saveur orange pétillante"
  },
  {
    id: "13",
    name: "Eau Minérale Plate",
    price: 2.5,
    category: "Eau",
    description: "Eau minérale naturelle"
  },
  {
    id: "14",
    name: "Eau Minérale Gazeuse",
    price: 2.7,
    category: "Eau",
    description: "Eau minérale pétillante"
  },
];

// Initialiser le stockage local si nécessaire
const initStorage = () => {
  // Ne plus réinitialiser automatiquement les produits
  const existingDrinks = localStorage.getItem("drinks");
  if (!existingDrinks) {
    localStorage.setItem("drinks", JSON.stringify(initialDrinks));
  }
  
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]));
  }
  
  if (!localStorage.getItem("timeLogs")) {
    localStorage.setItem("timeLogs", JSON.stringify([]));
  }
};

// Récupérer les données
export const getDrinks = (): Drink[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem("drinks") || "[]");
  } catch {
    return [];
  }
};

// Ajoutons les fonctions manquantes qui sont utilisées ailleurs
export const getOrders = (): Order[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem("orders") || "[]");
  } catch {
    return [];
  }
};

export const getTimeLogs = (): TimeLog[] => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem("timeLogs") || "[]");
  } catch {
    return [];
  }
};

// Nouvelles fonctions pour la gestion des produits
export const updateDrink = (updatedDrink: Drink): Drink[] => {
  const drinks = getDrinks();
  const updatedDrinks = drinks.map(drink => 
    drink.id === updatedDrink.id ? updatedDrink : drink
  );
  
  localStorage.setItem("drinks", JSON.stringify(updatedDrinks));
  registerActivity(`A modifié le produit: ${updatedDrink.name}`);
  
  return updatedDrinks;
};

export const addDrink = (newDrink: Drink): Drink[] => {
  const drinks = getDrinks();
  const updatedDrinks = [...drinks, newDrink];
  
  localStorage.setItem("drinks", JSON.stringify(updatedDrinks));
  registerActivity(`A ajouté un nouveau produit: ${newDrink.name}`);
  
  return updatedDrinks;
};

export const deleteDrink = (drinkId: string): Drink[] => {
  const drinks = getDrinks();
  const drinkToDelete = drinks.find(d => d.id === drinkId);
  const updatedDrinks = drinks.filter(drink => drink.id !== drinkId);
  
  localStorage.setItem("drinks", JSON.stringify(updatedDrinks));
  
  if (drinkToDelete) {
    registerActivity(`A supprimé le produit: ${drinkToDelete.name}`);
  }
  
  return updatedDrinks;
};

// Nouvelles fonctions pour les statistiques des produits
export const getTopSellingProducts = () => {
  const orders = getOrders();
  const drinks = getDrinks();
  
  const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.drinkId]) {
        productSales[item.drinkId] = {
          quantity: 0,
          revenue: 0,
          name: item.drinkName
        };
      }
      productSales[item.drinkId].quantity += item.quantity;
      productSales[item.drinkId].revenue += item.quantity * item.unitPrice;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
};

// Ajouter une commande
export const createOrder = (items: OrderItem[]): Order | null => {
  const user = getCurrentUser();
  
  if (!user) return null;
  
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 
    0
  );
  
  const newOrder: Order = {
    id: `order_${Date.now()}`,
    items,
    total,
    date: new Date(),
    agentId: user.id,
    agentName: user.name,
    completed: true
  };
  
  const orders = getOrders();
  orders.push(newOrder);
  
  localStorage.setItem("orders", JSON.stringify(orders));
  
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
  
  registerActivity(`A créé une commande de ${total.toFixed(2)} MAD`);
  
  return newOrder;
};

// Pointer une arrivée
export const clockIn = (): TimeLog | null => {
  const user = getCurrentUser();
  
  if (!user) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const logs = getTimeLogs();
  
  // Vérifier si l'utilisateur a déjà pointé aujourd'hui
  const existingLog = logs.find(
    log => log.userId === user.id && log.date === today && !log.clockOut
  );
  
  if (existingLog) {
    return existingLog;
  }
  
  const newLog: TimeLog = {
    id: `log_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    clockIn: new Date(),
    date: today
  };
  
  logs.push(newLog);
  localStorage.setItem("timeLogs", JSON.stringify(logs));
  registerActivity("A pointé son arrivée");
  
  return newLog;
};

// Pointer un départ
export const clockOut = (): TimeLog | null => {
  const user = getCurrentUser();
  
  if (!user) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const logs = getTimeLogs();
  
  const logIndex = logs.findIndex(
    log => log.userId === user.id && log.date === today && !log.clockOut
  );
  
  if (logIndex === -1) return null;
  
  logs[logIndex].clockOut = new Date();
  localStorage.setItem("timeLogs", JSON.stringify(logs));
  registerActivity("A pointé son départ");
  
  return logs[logIndex];
};

// Obtenir les revenus
export const getRevenues = (): Revenue[] => {
  const orders = getOrders();
  
  const revenueMap: Record<string, number> = {};
  
  orders.forEach(order => {
    const date = new Date(order.date).toISOString().split('T')[0];
    if (!revenueMap[date]) {
      revenueMap[date] = 0;
    }
    revenueMap[date] += order.total;
  });
  
  return Object.entries(revenueMap).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Nouvelle fonction pour vider toutes les activités
export const clearAllActivities = (): void => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Seuls les administrateurs peuvent vider les activités');
  }
  
  localStorage.removeItem("activities");
  localStorage.removeItem("loginActivities");
  registerActivity("A vidé toutes les activités du système");
};

// Nouvelle fonction pour vider toutes les données du système
export const clearAllSystemData = (): void => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Seuls les administrateurs peuvent vider toutes les données');
  }
  
  // Sauvegarder les produits actuels avant de vider les données
  const currentDrinks = localStorage.getItem("drinks");
  
  // Vider toutes les données sauf les utilisateurs et les produits
  localStorage.removeItem("orders");
  localStorage.removeItem("timeLogs");
  localStorage.removeItem("activities");
  localStorage.removeItem("loginActivities");
  
  // Restaurer les produits (conserver tous les articles du menu, y compris les salades, etc.)
  if (currentDrinks) {
    localStorage.setItem("drinks", currentDrinks);
  } else {
    // Seulement si aucun produit n'existe, utiliser les valeurs par défaut
    localStorage.setItem("drinks", JSON.stringify(initialDrinks));
  }
  
  registerActivity("A vidé toutes les données du système (produits préservés)");
};

// Nouvelle fonction pour imprimer un rapport de revenus
export const printRevenueReport = (filteredData: any[], periodType: string, startDate: string, endDate: string, totalRevenue: number): void => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'day':
        return `Jour: ${formatDate(startDate)}`;
      case 'month':
        return `Mois: ${new Date(startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      case 'year':
        return `Année: ${new Date(startDate).getFullYear()}`;
      case 'custom':
        return `Période personnalisée: ${formatDate(startDate)} - ${formatDate(endDate)}`;
      default:
        return 'Période inconnue';
    }
  };

  const reportContent = `
    <html>
    <head>
      <title>Rapport de Revenus - Le 1er Boulevard</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .cafe-name {
          font-size: 2rem;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 1.5rem;
          color: #333;
        }
        .summary {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        .total-revenue {
          font-size: 1.5rem;
          font-weight: bold;
          color: #000;
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .details-table th,
        .details-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .details-table th {
          background-color: #000;
          color: white;
          font-weight: bold;
        }
        .details-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="cafe-name">Le 1er Boulevard</div>
        <div class="report-title">Rapport de Revenus</div>
        <div style="color: #666; margin-top: 10px;">
          Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <span><strong>Période:</strong></span>
          <span>${getPeriodLabel()}</span>
        </div>
        <div class="summary-item">
          <span><strong>Nombre de jours:</strong></span>
          <span>${filteredData.length}</span>
        </div>
        <div class="summary-item">
          <span><strong>Moyenne journalière:</strong></span>
          <span>${filteredData.length ? (totalRevenue / filteredData.length).toFixed(2) : 0} MAD</span>
        </div>
        <div class="summary-item total-revenue">
          <span><strong>REVENU TOTAL:</strong></span>
          <span>${totalRevenue.toFixed(2)} MAD</span>
        </div>
      </div>

      <table class="details-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Revenu (MAD)</th>
          </tr>
        </thead>
        <tbody>
          ${filteredData.length === 0 ? 
            '<tr><td colspan="2" style="text-align: center; color: #666;">Aucune donnée disponible pour cette période</td></tr>' :
            filteredData.map(revenue => `
              <tr>
                <td>${formatDate(revenue.date)}</td>
                <td style="text-align: right; font-weight: bold;">${revenue.amount.toFixed(2)} MAD</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>

      <div class="footer">
        <p>Ce rapport a été généré automatiquement par le système de gestion de Le 1er Boulevard</p>
        <p>Pour toute question, veuillez contacter l'administration</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(reportContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    alert("Veuillez autoriser les fenêtres popup pour imprimer le rapport.");
  }
};
