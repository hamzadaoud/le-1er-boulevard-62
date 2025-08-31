
import { Order } from "../types";
import { ESCPOSFormatter } from "../utils/escposUtils";

export const generateThankYouMessage = (): string => {
  const messages = [
    "Merci pour votre visite! Nous esperons vous revoir tres bientot chez La Perle Rouge.",
    "Votre sourire est notre plus belle recompense. A tres vite chez La Perle Rouge!",
    "La Perle Rouge vous remercie de votre confiance. Au plaisir de vous servir a nouveau!",
    "Un cafe chez La Perle Rouge, c'est un moment de bonheur a partager. Revenez vite!",
    "Merci d'avoir choisi La Perle Rouge. Nous vous attendons pour votre prochaine pause cafe!"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

export const printTicket = (order: Order): void => {
  const thankYouMessage = generateThankYouMessage();
  
  // Generate customer ticket with ESC/POS commands
  let customerTicket = ESCPOSFormatter.init();
  customerTicket += ESCPOSFormatter.setCharacterSet();
  customerTicket += ESCPOSFormatter.textNormal();
  customerTicket += ESCPOSFormatter.alignCenter();
  
  // Header
  customerTicket += ESCPOSFormatter.textLarge();
  customerTicket += ESCPOSFormatter.textBold();
  customerTicket += "LA PERLE ROUGE";
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += ESCPOSFormatter.textNormal();
  customerTicket += ESCPOSFormatter.textBoldOff();
  customerTicket += "Cafe • Restaurant";
  customerTicket += ESCPOSFormatter.multipleLines(2);
  
  // Date and server info
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += "Date: " + ESCPOSFormatter.formatDate(order.date);
  customerTicket += ESCPOSFormatter.newLine();
  customerTicket += "Serveur: " + order.agentName;
  customerTicket += ESCPOSFormatter.multipleLines(2);
  
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
  customerTicket += ESCPOSFormatter.multipleLines(2);
  
  // Thank you message
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += thankYouMessage.substring(0, 100); // Limit message length
  customerTicket += ESCPOSFormatter.multipleLines(2);
  
  // Footer with additional line breaks
  customerTicket += ESCPOSFormatter.alignCenter();
  customerTicket += "Merci de votre visite!";
  customerTicket += ESCPOSFormatter.multipleLines(3); // Added extra line breaks
  customerTicket += "DOHA ABOUAB MARRAKECH";
  customerTicket += ESCPOSFormatter.multipleLines(4);
  
  // Cut paper
  customerTicket += ESCPOSFormatter.cutPaper();
  
  // Generate agent copy with additional line breaks
  let agentCopy = ESCPOSFormatter.init();
  agentCopy += ESCPOSFormatter.setCharacterSet();
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += ESCPOSFormatter.textBold();
  agentCopy += "LA PERLE ROUGE";
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += "COPIE AGENT";
  agentCopy += ESCPOSFormatter.textBoldOff();
  agentCopy += ESCPOSFormatter.multipleLines(2);
  
  // Agent info
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += "Date: " + ESCPOSFormatter.formatDate(order.date);
  agentCopy += ESCPOSFormatter.newLine();
  agentCopy += "Agent: " + order.agentName;
  agentCopy += ESCPOSFormatter.multipleLines(2);
  
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
  
  agentCopy += ESCPOSFormatter.multipleLines(4); // Added extra line breaks for agent copy
  agentCopy += ESCPOSFormatter.alignCenter();
  agentCopy += ESCPOSFormatter.generateBarcode(order.id);
  agentCopy += ESCPOSFormatter.multipleLines(4);
  agentCopy += ESCPOSFormatter.cutPaper();
  
  // Print both tickets in the same window
  ESCPOSFormatter.printBothTickets(customerTicket, agentCopy);
};
