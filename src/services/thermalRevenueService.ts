
import { ESCPOSFormatter } from '../utils/escposUtils';
import { getOrders } from './cafeService';

export const printThermalRevenueReport = (
  filteredData: any[], 
  periodType: string, 
  startDate: string, 
  endDate: string, 
  totalRevenue: number
): void => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateTime: string | Date) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return `Période: ${formatDate(startDate)} - ${formatDate(endDate)}`;
      default:
        return 'Période inconnue';
    }
  };

  // Get detailed orders for the period
  const allOrders = getOrders();
  const filteredOrders = allOrders.filter(order => {
    const orderDate = new Date(order.date).toISOString().split('T')[0];
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  // Group orders by agent
  const ordersByAgent = filteredOrders.reduce((acc: any, order) => {
    if (!acc[order.agentName]) {
      acc[order.agentName] = {
        orders: [],
        totalRevenue: 0,
        totalOrders: 0
      };
    }
    acc[order.agentName].orders.push(order);
    acc[order.agentName].totalRevenue += order.total;
    acc[order.agentName].totalOrders += 1;
    return acc;
  }, {});

  // Generate thermal receipt
  let report = ESCPOSFormatter.init();
  report += ESCPOSFormatter.setCharacterSet();
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.alignCenter();
  
  // Header
  report += ESCPOSFormatter.textLarge();
  report += ESCPOSFormatter.textBold();
  report += "LE 1ER BOULEVARD";
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.textBoldOff();
  report += "GUELIZ";
  report += ESCPOSFormatter.multipleLines(2);
  
  // Report title
  report += ESCPOSFormatter.textDoubleHeight();
  report += ESCPOSFormatter.textBold();
  report += "RAPPORT DETAILLE";
  report += ESCPOSFormatter.newLine();
  report += "DES REVENUS";
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.textBoldOff();
  report += ESCPOSFormatter.multipleLines(2);
  
  // Generation date
  report += ESCPOSFormatter.alignCenter();
  report += `Généré le: ${new Date().toLocaleDateString('fr-FR')}`;
  report += ESCPOSFormatter.newLine();
  report += `à ${new Date().toLocaleTimeString('fr-FR')}`;
  report += ESCPOSFormatter.multipleLines(2);
  
  // Separator
  report += ESCPOSFormatter.horizontalLine('=', 32);
  report += ESCPOSFormatter.newLine();
  
  // Period and summary
  report += ESCPOSFormatter.alignLeft();
  report += ESCPOSFormatter.textBold();
  report += "RÉSUMÉ GÉNÉRAL";
  report += ESCPOSFormatter.textBoldOff();
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.horizontalLine('-', 32);
  report += ESCPOSFormatter.newLine();
  
  report += `Période: ${getPeriodLabel()}`;
  report += ESCPOSFormatter.newLine();
  report += `Nombre de commandes: ${totalOrders}`;
  report += ESCPOSFormatter.newLine();
  report += `Articles vendus: ${totalItems}`;
  report += ESCPOSFormatter.newLine();
  report += `Nombre d'agents: ${Object.keys(ordersByAgent).length}`;
  report += ESCPOSFormatter.newLine();
  if (totalOrders > 0) {
    report += `Panier moyen: ${(totalRevenue / totalOrders).toFixed(2)} MAD`;
    report += ESCPOSFormatter.newLine();
  }
  report += ESCPOSFormatter.multipleLines(1);
  
  // Total revenue
  report += ESCPOSFormatter.alignCenter();
  report += ESCPOSFormatter.textDoubleHeight();
  report += ESCPOSFormatter.textBold();
  report += `TOTAL: ${ESCPOSFormatter.formatCurrency(totalRevenue)}`;
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.textBoldOff();
  report += ESCPOSFormatter.multipleLines(2);

  // Agents performance section
  if (Object.keys(ordersByAgent).length > 0) {
    report += ESCPOSFormatter.alignCenter();
    report += ESCPOSFormatter.horizontalLine('=', 32);
    report += ESCPOSFormatter.newLine();
    report += ESCPOSFormatter.textBold();
    report += "PERFORMANCE PAR AGENT";
    report += ESCPOSFormatter.textBoldOff();
    report += ESCPOSFormatter.newLine();
    report += ESCPOSFormatter.horizontalLine('=', 32);
    report += ESCPOSFormatter.newLine();
    
    report += ESCPOSFormatter.alignLeft();
    Object.entries(ordersByAgent).forEach(([agentName, data]: [string, any]) => {
      report += ESCPOSFormatter.textBold();
      report += `${agentName}`;
      report += ESCPOSFormatter.textBoldOff();
      report += ESCPOSFormatter.newLine();
      report += `  Commandes: ${data.totalOrders}`;
      report += ESCPOSFormatter.newLine();
      report += `  Revenus: ${ESCPOSFormatter.formatCurrency(data.totalRevenue)}`;
      report += ESCPOSFormatter.newLine();
      report += `  Moyenne: ${(data.totalRevenue / data.totalOrders).toFixed(2)} MAD`;
      report += ESCPOSFormatter.newLine();
      report += ESCPOSFormatter.horizontalLine('-', 32);
      report += ESCPOSFormatter.newLine();
    });
  }
  
  // Detailed orders section
  if (filteredOrders.length > 0) {
    report += ESCPOSFormatter.alignCenter();
    report += ESCPOSFormatter.horizontalLine('=', 32);
    report += ESCPOSFormatter.newLine();
    report += ESCPOSFormatter.textBold();
    report += "DÉTAIL DES COMMANDES";
    report += ESCPOSFormatter.textBoldOff();
    report += ESCPOSFormatter.newLine();
    report += ESCPOSFormatter.horizontalLine('=', 32);
    report += ESCPOSFormatter.newLine();
    
    report += ESCPOSFormatter.alignLeft();
    
    // Sort orders by date
    const sortedOrders = [...filteredOrders].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedOrders.forEach((order, index) => {
      report += ESCPOSFormatter.textBold();
      report += `COMMANDE #${index + 1}`;
      report += ESCPOSFormatter.textBoldOff();
      report += ESCPOSFormatter.newLine();
      report += `Date: ${formatDateTime(order.date)}`;
      report += ESCPOSFormatter.newLine();
      report += `Agent: ${order.agentName}`;
      report += ESCPOSFormatter.newLine();
      report += `ID: ${order.id}`;
      report += ESCPOSFormatter.newLine();
      report += ESCPOSFormatter.horizontalLine('-', 32);
      report += ESCPOSFormatter.newLine();
      
      // Order items
      order.items.forEach((item: any) => {
        const itemTotal = item.quantity * item.unitPrice;
        report += `${item.quantity}x ${item.drinkName}`;
        report += ESCPOSFormatter.newLine();
        report += `   ${item.unitPrice.toFixed(2)} MAD x ${item.quantity} = ${itemTotal.toFixed(2)} MAD`;
        report += ESCPOSFormatter.newLine();
      });
      
      report += ESCPOSFormatter.horizontalLine('-', 32);
      report += ESCPOSFormatter.newLine();
      report += ESCPOSFormatter.textBold();
      report += `TOTAL: ${ESCPOSFormatter.formatCurrency(order.total)}`;
      report += ESCPOSFormatter.textBoldOff();
      report += ESCPOSFormatter.multipleLines(2);
    });
  }
  
  // Footer with additional line breaks
  report += ESCPOSFormatter.multipleLines(1);
  report += ESCPOSFormatter.alignCenter();
  report += "Rapport généré automatiquement";
  report += ESCPOSFormatter.newLine();
  report += "par le système de gestion";
  report += ESCPOSFormatter.multipleLines(6);
  
  // Cut paper
  report += ESCPOSFormatter.cutPaper();
  
  // Print the report using thermal printer
  ESCPOSFormatter.print(report);
};
