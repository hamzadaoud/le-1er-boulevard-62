import { Order } from "../types";
import { ESCPOSFormatter } from "../utils/escposUtils";

export const generateThankYouMessage = (): string => {
  const messages = [
    "Merci pour votre visite! Nous esperons vous revoir tres bientot chez Le 1er Boulevard.",
    "Votre sourire est notre plus belle recompense. A tres vite chez Le 1er Boulevard!",
    "Le 1er Boulevard vous remercie de votre confiance. Au plaisir de vous servir a nouveau!",
    "Un cafe chez Le 1er Boulevard, c'est un moment de bonheur a partager. Revenez vite!",
    "Merci d'avoir choisi Le 1er Boulevard. Nous vous attendons pour votre prochaine pause cafe!"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

export const printThermalInvoice = (order: Order): void => {
  // Generate thermal invoice
  let invoice = ESCPOSFormatter.alignCenter();
  
  // Header
  invoice += ESCPOSFormatter.textLarge();
  invoice += ESCPOSFormatter.textBold();
  invoice += "Le 1er Boulevard";
  invoice += ESCPOSFormatter.newLine();
  invoice += ESCPOSFormatter.textNormal();
  invoice += ESCPOSFormatter.textBoldOff();
  invoice += "19 , Immeuble Jakar";
  invoice += ESCPOSFormatter.newLine();
  invoice += "Boulevard Mohammed V 40000, Marrakech";
  invoice += ESCPOSFormatter.newLine();
  invoice += "Tel: 01 23 45 67 89";
  invoice += ESCPOSFormatter.multipleLines(2);
  
  // Invoice title
  invoice += ESCPOSFormatter.textDoubleHeight();
  invoice += ESCPOSFormatter.textBold();
  invoice += "FACTURE";
  invoice += ESCPOSFormatter.textNormal();
  invoice += ESCPOSFormatter.textBoldOff();
  invoice += ESCPOSFormatter.newLine();
  
  // Invoice number (shortened)
  invoice += `N° ${order.id.substring(0, 8)}`;
  invoice += ESCPOSFormatter.multipleLines(2);
  
  // Date and agent info
  invoice += ESCPOSFormatter.alignCenter();
  invoice += `Date: ${new Date(order.date).toLocaleDateString('fr-FR')}`;
  invoice += ESCPOSFormatter.newLine();
  invoice += `Agent: ${order.agentName}`;
  invoice += ESCPOSFormatter.multipleLines(2);
  
  // Separator
  invoice += ESCPOSFormatter.horizontalLine('=', 32);
  invoice += ESCPOSFormatter.newLine();
  invoice += ESCPOSFormatter.textBold();
  invoice += "ARTICLES";
  invoice += ESCPOSFormatter.textBoldOff();
  invoice += ESCPOSFormatter.newLine();
  invoice += ESCPOSFormatter.horizontalLine('=', 32);
  invoice += ESCPOSFormatter.newLine();
  
  // Items
  invoice += ESCPOSFormatter.alignCenter();
  order.items.forEach((item, index) => {
    invoice += `${index + 1}. ${item.drinkName}`;
    invoice += ESCPOSFormatter.newLine();
    invoice += `${item.quantity} x ${ESCPOSFormatter.formatCurrency(item.unitPrice)}`;
    invoice += ESCPOSFormatter.newLine();
    invoice += `= ${ESCPOSFormatter.formatCurrency(item.quantity * item.unitPrice)}`;
    invoice += ESCPOSFormatter.newLine();
    invoice += ESCPOSFormatter.horizontalLine('-', 32);
    invoice += ESCPOSFormatter.newLine();
  });
  
  // Total
  invoice += ESCPOSFormatter.alignCenter();
  invoice += ESCPOSFormatter.textDoubleHeight();
  invoice += ESCPOSFormatter.textBold();
  invoice += `TOTAL: ${ESCPOSFormatter.formatCurrency(order.total)}`;
  invoice += ESCPOSFormatter.textNormal();
  invoice += ESCPOSFormatter.textBoldOff();
  invoice += ESCPOSFormatter.multipleLines(2);
  
  // Barcode
  invoice += ESCPOSFormatter.generateBarcode(order.id);
  invoice += ESCPOSFormatter.multipleLines(2);
  
  // Footer with additional line breaks
  invoice += ESCPOSFormatter.alignCenter();
  invoice += "Merci de votre confiance !";
  invoice += ESCPOSFormatter.multipleLines(2);
  invoice += "À bientôt chez Le 1er Boulevard !";
  invoice += ESCPOSFormatter.multipleLines(6);
  
  // Cut paper
  invoice += ESCPOSFormatter.cutPaper();
  
  // Print the invoice using thermal printer
  ESCPOSFormatter.print(invoice);
};

export const printReport = (
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

  // Generate thermal receipt
  let report = ESCPOSFormatter.alignCenter();
  
  // Header
  report += ESCPOSFormatter.textLarge();
  report += ESCPOSFormatter.textBold();
  report += "Le 1er Boulevard";
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.textBoldOff();
  report += "19 , Immeuble Jakar, Boulevard Mohammed V 40000, Marrakech";
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
  
  // Period and summary
  report += ESCPOSFormatter.alignCenter();
  report += ESCPOSFormatter.horizontalLine('=', 32);
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.textBold();
  report += "RÉSUMÉ GÉNÉRAL";
  report += ESCPOSFormatter.textBoldOff();
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.horizontalLine('=', 32);
  report += ESCPOSFormatter.newLine();
  
  report += ESCPOSFormatter.alignCenter();
  report += `${getPeriodLabel()}`;
  report += ESCPOSFormatter.newLine();
  report += `Total des revenus:`;
  report += ESCPOSFormatter.newLine();
  report += ESCPOSFormatter.textDoubleHeight();
  report += ESCPOSFormatter.textBold();
  report += `${ESCPOSFormatter.formatCurrency(totalRevenue)}`;
  report += ESCPOSFormatter.textNormal();
  report += ESCPOSFormatter.textBoldOff();
  report += ESCPOSFormatter.multipleLines(3);
  
  // Footer with additional line breaks
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

export const printTicket = (order: Order): void => {
  const thankYouMessage = generateThankYouMessage();
  
  // Generate customer ticket WITHOUT ESC/POS init commands (will be added by printBothTickets)
  let customerTicket = ESCPOSFormatter.alignCenter();
  
  // Header
  customerTicket += ESCPOSFormatter.textLarge();
  customerTicket += ESCPOSFormatter.textBold();
  customerTicket += "LE 1ER BOULEVARD";
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += ESCPOSFormatter.textNormal();
  customerTicket += ESCPOSFormatter.textBoldOff();
  customerTicket += "19 , Immeuble Jakar, Boulevard Mohammed V 40000, Marrakech";
  customerTicket += ESCPOSFormatter.newLine();
  {
    const tn: any = (order as any).tableNumber;
    if (tn !== undefined && tn !== null) {
      customerTicket += `TABLE ${tn}`;
      customerTicket += ESCPOSFormatter.multipleLines(1);
    }
  }
  
  // Date and server info
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += "Date: " + ESCPOSFormatter.formatDate(order.date);
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += "Serveur: " + order.agentName;
  customerTicket += ESCPOSFormatter.multipleLines(1);
  
  // Separator line
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += ESCPOSFormatter.horizontalLine('=', 32);
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += ESCPOSFormatter.textBold();
  customerTicket += "TICKET CLIENT";
  customerTicket += ESCPOSFormatter.textBoldOff();
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += ESCPOSFormatter.horizontalLine('=', 32);
  customerTicket += ESCPOSFormatter.newLine();
  
  // Items
  customerTicket += ESCPOSFormatter.alignCenter();
  order.items.forEach((item, index) => {
    customerTicket += `${index + 1}. ${item.drinkName}`;
    customerTicket += ESCPOSFormatter.newLine();
    customerTicket += `${item.quantity} x ${ESCPOSFormatter.formatCurrency(item.unitPrice)} = ${ESCPOSFormatter.formatCurrency(item.unitPrice * item.quantity)}`;
    customerTicket += ESCPOSFormatter.newLine();
    customerTicket += ESCPOSFormatter.horizontalLine('-', 32);
    customerTicket += ESCPOSFormatter.newLine();
  });
  
  // Total
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += ESCPOSFormatter.textDoubleHeight();
  customerTicket += ESCPOSFormatter.textBold();
  customerTicket += "TOTAL: " + ESCPOSFormatter.formatCurrency(order.total);
  customerTicket += ESCPOSFormatter.textNormal();
  customerTicket += ESCPOSFormatter.textBoldOff();
  customerTicket += ESCPOSFormatter.multipleLines(2);
  
  // Barcode
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += ESCPOSFormatter.generateBarcode(order.id);
  customerTicket += ESCPOSFormatter.newLine();
  
  // Thank you message
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += "Merci de votre visite !";
  customerTicket += ESCPOSFormatter.multipleLines(4);
  
  // Cut paper - this ends the first ticket
  customerTicket += ESCPOSFormatter.cutPaper();
  
  // Generate agent copy as completely separate document WITHOUT init commands (will be added by printBothTickets)  
  let agentCopy = ESCPOSFormatter.alignCenter();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += ESCPOSFormatter.horizontalLine('*', 32);
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += "NOUVELLE FEUILLE - AGENT";
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += ESCPOSFormatter.horizontalLine('*', 32);
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.newLine();
  
  agentCopy += ESCPOSFormatter.textLarge();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += "LE 1ER BOULEVARD";
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += ESCPOSFormatter.textNormal();
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += "COPIE AGENT";
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.newLine();
  {
    const tn: any = (order as any).tableNumber;
    if (tn !== undefined && tn !== null) {
      agentCopy += `TABLE ${tn}`;
      agentCopy += ESCPOSFormatter.multipleLines(1);
    }
  }
  
  // Agent info
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += "Date: " + ESCPOSFormatter.formatDate(order.date);
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += "Agent: " + order.agentName;
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += "Commande #: " + order.id;
  agentCopy += ESCPOSFormatter.multipleLines(1);
  
  // Products only
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += "ARTICLES:";
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += ESCPOSFormatter.horizontalLine('-', 32);
  agentCopy += ESCPOSFormatter.newLine();
  
  agentCopy += ESCPOSFormatter.alignCenter();
  order.items.forEach((item, index) => {
    agentCopy += `${index + 1}. ${item.drinkName} - Qte: ${item.quantity}`;
    agentCopy += ESCPOSFormatter.newLine();
  });
  
  agentCopy += ESCPOSFormatter.horizontalLine('-', 32);
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += "TOTAL: " + ESCPOSFormatter.formatCurrency(order.total);
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.multipleLines(2);
  
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += ESCPOSFormatter.generateBarcode(order.id);
  agentCopy += ESCPOSFormatter.multipleLines(4);
  
  // Cut paper - this ends the second ticket
  agentCopy += ESCPOSFormatter.cutPaper();
  
  // Use printBothTickets to ensure proper separation between tickets
  // This method will print them as two separate print jobs with a delay between them
  ESCPOSFormatter.printBothTickets(customerTicket, agentCopy);
};
