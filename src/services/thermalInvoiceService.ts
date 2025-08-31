
import { ESCPOSFormatter } from '../utils/escposUtils';
import { Order } from '../types';

export const printThermalInvoice = (order: Order): void => {
  // Generate thermal invoice
  let invoice = ESCPOSFormatter.init();
  invoice += ESCPOSFormatter.setCharacterSet();
  invoice += ESCPOSFormatter.textNormal();
  invoice += ESCPOSFormatter.alignCenter();
  
  // Header
  invoice += ESCPOSFormatter.textLarge();
  invoice += ESCPOSFormatter.textBold();
  invoice += "LA PERLE ROUGE";
  invoice += ESCPOSFormatter.newLine();
  invoice += ESCPOSFormatter.textNormal();
  invoice += ESCPOSFormatter.textBoldOff();
  invoice += "123 Avenue des Cafés";
  invoice += ESCPOSFormatter.newLine();
  invoice += "75001 Paris, France";
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
  invoice += "À bientôt chez La Perle Rouge !";
  invoice += ESCPOSFormatter.multipleLines(6); // Added extra line breaks
  
  // Cut paper
  invoice += ESCPOSFormatter.cutPaper();
  
  // Print the invoice using thermal printer
  ESCPOSFormatter.print(invoice);
};
