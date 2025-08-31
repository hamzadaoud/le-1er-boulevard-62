import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Printer, Settings, Wifi, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  listSerialPorts, 
  listSystemPrinters, 
  connectToPrinter,
  isElectron,
  electronStore 
} from '../utils/electronUtils';

const SettingsPage: React.FC = () => {
  const [serialPorts, setSerialPorts] = useState<any[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [selectedSerialPort, setSelectedSerialPort] = useState<string>('');
  const [selectedSystemPrinter, setSelectedSystemPrinter] = useState<string>('');
  const [currentPrinterType, setCurrentPrinterType] = useState<'serial' | 'system'>('serial');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadSavedSettings();
    refreshPrinters();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedPrinterType = await electronStore.get('printerType') || 'serial';
      const savedSerialPort = await electronStore.get('selectedSerialPort') || '';
      const savedSystemPrinter = await electronStore.get('selectedSystemPrinter') || '';
      
      setCurrentPrinterType(savedPrinterType);
      setSelectedSerialPort(savedSerialPort);
      setSelectedSystemPrinter(savedSystemPrinter);
      
      // Check if printer is connected
      if (savedSerialPort || savedSystemPrinter) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading printer settings:', error);
    }
  };

  const refreshPrinters = async () => {
    setIsLoading(true);
    try {
      if (isElectron()) {
        const [ports, printers] = await Promise.all([
          listSerialPorts(),
          listSystemPrinters()
        ]);
        setSerialPorts(ports || []);
        setSystemPrinters(printers || []);
      }
    } catch (error) {
      console.error('Error refreshing printers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des imprimantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!selectedSerialPort && !selectedSystemPrinter) {
      toast({
        title: "Aucune imprimante sélectionnée",
        description: "Veuillez sélectionner une imprimante avant de tester la connexion",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (currentPrinterType === 'serial' && selectedSerialPort) {
        const success = await connectToPrinter(selectedSerialPort);
        if (success) {
          setIsConnected(true);
          toast({
            title: "Connexion réussie",
            description: "L'imprimante thermique est connectée",
          });
        } else {
          throw new Error('Connection failed');
        }
      } else if (currentPrinterType === 'system' && selectedSystemPrinter) {
        // For system printers, we assume they're available if selected
        setIsConnected(true);
        toast({
          title: "Imprimante système sélectionnée",
          description: "L'imprimante système est configurée",
        });
      }
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à l'imprimante",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await electronStore.set('printerType', currentPrinterType);
      await electronStore.set('selectedSerialPort', selectedSerialPort);
      await electronStore.set('selectedSystemPrinter', selectedSystemPrinter);
      
      toast({
        title: "Paramètres sauvegardés",
        description: "La configuration de l'imprimante a été sauvegardée",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Configuration de l'Imprimante
            </CardTitle>
            <CardDescription>
              Configurez votre imprimante thermique pour l'impression automatique des tickets et factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connectée
                    </Badge>
                  </>
                ) : (
                  <>
                    <Wifi className="w-5 h-5 text-red-500" />
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Non connectée
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Printer Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'imprimante</label>
              <Select
                value={currentPrinterType}
                onValueChange={(value: 'serial' | 'system') => setCurrentPrinterType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serial">Imprimante Thermique (USB/Série)</SelectItem>
                  <SelectItem value="system">Imprimante Système</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Serial Port Selection */}
            {currentPrinterType === 'serial' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Port Série</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshPrinters}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
                <Select
                  value={selectedSerialPort}
                  onValueChange={setSelectedSerialPort}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un port série" />
                  </SelectTrigger>
                  <SelectContent>
                    {serialPorts.map((port, index) => (
                      <SelectItem key={index} value={port.path || port}>
                        {port.path || port} {port.manufacturer && `(${port.manufacturer})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* System Printer Selection */}
            {currentPrinterType === 'system' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Imprimante Système</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshPrinters}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
                <Select
                  value={selectedSystemPrinter}
                  onValueChange={setSelectedSystemPrinter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une imprimante" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemPrinters.map((printer, index) => (
                      <SelectItem key={index} value={printer.name || printer}>
                        {printer.displayName || printer.name || printer}
                        {printer.status && ` (${printer.status})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={testConnection} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                Tester la Connexion
              </Button>
              <Button onClick={saveSettings} variant="outline">
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>
              Informations sur la configuration de l'imprimante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Les tickets seront imprimés automatiquement sur l'imprimante sélectionnée</p>
              <p>• Pour les imprimantes thermiques USB, assurez-vous que les pilotes sont installés</p>
              <p>• La configuration est sauvegardée globalement pour toute l'application</p>
              <p>• En cas de problème, vérifiez que l'imprimante est allumée et connectée</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;