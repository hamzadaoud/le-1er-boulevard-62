import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRevenues } from '../services/cafeService';
import { printReport } from '../services/printingService';
import PrinterSelectDialog from '../components/PrinterSelectDialog';
import { isElectron, electronStore } from '@/utils/electronUtils';

const AgentReportsPage: React.FC = () => {
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [pendingPrint, setPendingPrint] = useState<(() => void) | null>(null);

  const handlePrintDailyReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const revenues = getRevenues();
    const todayRevenues = revenues.filter(r => r.date === today);
    const totalRevenue = todayRevenues.reduce((sum, r) => sum + r.amount, 0);

    if (isElectron()) {
      const type = await electronStore.get('printerType');
      if (!type) {
        setPendingPrint(() => () => printReport(todayRevenues, 'day', today, today, totalRevenue));
        setPrinterDialogOpen(true);
        return;
      }
    }

    printReport(todayRevenues, 'day', today, today, totalRevenue);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cafeBlack mb-2">
          Rapports Journaliers
        </h1>
        <p className="text-gray-500">
          Impression des rapports de revenus journaliers
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Section Rapport Journalier */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-cafeRed mr-2" />
            <h2 className="text-xl font-semibold text-cafeBlack">
              Rapport du Jour
            </h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Imprimez le rapport de revenus pour la journée en cours avec tous les détails des ventes et transactions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePrintDailyReport}
                className="bg-cafeRed text-white hover:bg-red-700 flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer Rapport Journalier
              </Button>
              
              <div className="text-sm text-gray-500 flex items-center">
                <span className="mr-2">📅</span>
                Date: {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>

        {/* Section Informations */}
        <div className="rounded-lg bg-cafeLightGray p-6">
          <h3 className="text-lg font-semibold text-cafeBlack mb-3">
            Informations sur le Rapport
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Contenu du rapport :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Total des ventes de la journée</li>
                <li>• Détail par produit</li>
                <li>• Nombre de transactions</li>
                <li>• Heure de génération</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Format :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Format d'impression optimisé</li>
                <li>• Données mises à jour en temps réel</li>
                <li>• Compatible avec toutes les imprimantes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentReportsPage;