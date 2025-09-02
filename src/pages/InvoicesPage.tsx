
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getOrders } from '../services/cafeService';
import { Printer } from 'lucide-react';
import { Order } from '../types';
import { printThermalInvoice } from '../services/printingService';
import PrinterSelectDialog from '../components/PrinterSelectDialog';
import { isElectron, electronStore } from '@/utils/electronUtils';

const InvoicesPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [pendingPrint, setPendingPrint] = useState<(() => void) | null>(null);
  
  useEffect(() => {
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
  }, []);
  
  const printInvoice = async (order: Order) => {
    if (isElectron()) {
      const type = await electronStore.get('printerType');
      if (!type) {
        setPendingPrint(() => () => printThermalInvoice(order));
        setPrinterDialogOpen(true);
        return;
      }
    }
    printThermalInvoice(order);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-cafeBlack">Factures</h1>
          <p className="text-gray-500">Toutes les commandes et factures</p>
        </div>
        
        <div className="rounded-lg bg-white p-4 md:p-6 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-center font-semibold text-cafeBlack">ID</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Date</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Agent</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Articles</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Total</th>
                  <th className="pb-3 text-center font-semibold text-cafeBlack">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <p className="text-2xl mb-2">📄</p>
                        <p>Aucune facture disponible</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-center text-sm">{order.id.substring(0, 8)}...</td>
                      <td className="py-3 text-center text-sm">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-3 text-center text-sm">{order.agentName}</td>
                      <td className="py-3 text-center text-sm">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} articles
                      </td>
                      <td className="py-3 text-center font-medium">{order.total.toFixed(2)} MAD</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => printInvoice(order)}
                          className="inline-flex items-center rounded-md bg-cafeRed px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                          <Printer size={14} className="mr-1" />
                          <span className="hidden sm:inline">Imprimer</span>
                          <span className="sm:hidden">📄</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PrinterSelectDialog
        open={printerDialogOpen}
        onOpenChange={setPrinterDialogOpen}
        onSaved={() => {
          const fn = pendingPrint;
          setPendingPrint(null);
          fn?.();
        }}
      />
    </DashboardLayout>
  );
};

export default InvoicesPage;
