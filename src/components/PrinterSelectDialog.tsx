import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { isElectron, listSystemPrinters, listSerialPorts, electronStore } from '@/utils/electronUtils';

interface PrinterSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

// Lightweight printer selection dialog (Electron-first)
const PrinterSelectDialog: React.FC<PrinterSelectDialogProps> = ({ open, onOpenChange, onSaved }) => {
  const [printerType, setPrinterType] = useState<'serial' | 'system'>('serial');
  const [systemPrinters, setSystemPrinters] = useState<string[]>([]);
  const [selectedSystemPrinter, setSelectedSystemPrinter] = useState<string>('');
  const [serialPorts, setSerialPorts] = useState<{ id: string; label: string }[]>([]);
  const [selectedSerialPort, setSelectedSerialPort] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        // Load saved config
        const savedType = (await electronStore.get('printerType')) as 'serial' | 'system' | null;
        const savedSystem = (await electronStore.get('selectedSystemPrinter')) as string | null;
        const savedSerial = (await electronStore.get('selectedSerialPort')) as string | null;
        if (savedType === 'system' || savedType === 'serial') setPrinterType(savedType);
        if (savedSystem) setSelectedSystemPrinter(savedSystem);
        if (savedSerial) setSelectedSerialPort(savedSerial);

        if (isElectron()) {
          // Fetch system printers via Electron
          const printers = await listSystemPrinters();
          if (Array.isArray(printers)) {
            const names = printers.map((p: any) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
            setSystemPrinters(names);
            if (!savedSystem && names[0]) setSelectedSystemPrinter(names[0]);
          }
          // Fetch serial ports via Electron if available
          const ports = await listSerialPorts();
          if (Array.isArray(ports)) {
            const normalized = ports.map((p: any, idx: number) => ({
              id: p?.path || p?.comName || p?.friendlyName || String(idx),
              label: p?.friendlyName || p?.path || p?.comName || `Port ${idx + 1}`,
            }));
            setSerialPorts(normalized);
            if (!savedSerial && normalized[0]) setSelectedSerialPort(normalized[0].id);
          }
        } else {
          // Browser: we can only offer Serial via Web Serial API (if supported)
          if ('serial' in navigator) {
            setPrinterType('serial');
          } else {
            setPrinterType('system');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await electronStore.set('printerType', printerType);
      if (printerType === 'system') {
        await electronStore.set('selectedSystemPrinter', selectedSystemPrinter);
      } else {
        await electronStore.set('selectedSerialPort', selectedSerialPort);
      }
      onOpenChange(false);
      onSaved?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choisir l'imprimante</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Type d'imprimante</Label>
            <RadioGroup value={printerType} onValueChange={(v) => setPrinterType(v as any)} className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="serial" id="printer-serial" />
                <Label htmlFor="printer-serial">Thermique (USB/Serial)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="system" id="printer-system" />
                <Label htmlFor="printer-system">Imprimante système</Label>
              </div>
            </RadioGroup>
          </div>

          {printerType === 'system' && (
            <div>
              <Label className="mb-2 block">Sélectionnez une imprimante</Label>
              <Select value={selectedSystemPrinter} onValueChange={setSelectedSystemPrinter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une imprimante" />
                </SelectTrigger>
                <SelectContent>
                  {systemPrinters.length === 0 ? (
                    <SelectItem value="">Aucune imprimante trouvée</SelectItem>
                  ) : (
                    systemPrinters.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!isElectron() && (
                <p className="text-xs text-muted-foreground mt-2">Dans le navigateur, la sélection exacte dépendra de la boîte de dialogue d'impression du système.</p>
              )}
            </div>
          )}

          {printerType === 'serial' && (
            <div>
              <Label className="mb-2 block">Sélectionnez le port de l'imprimante thermique</Label>
              <Select value={selectedSerialPort} onValueChange={setSelectedSerialPort}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un port" />
                </SelectTrigger>
                <SelectContent>
                  {serialPorts.length === 0 ? (
                    <SelectItem value="">Aucun port détecté</SelectItem>
                  ) : (
                    serialPorts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!isElectron() && (
                <p className="text-xs text-muted-foreground mt-2">Si aucun port n'apparaît, branchez l'imprimante et autorisez l'accès au port via le navigateur.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
          <Button onClick={handleSave} disabled={loading || (printerType === 'system' ? !selectedSystemPrinter : !selectedSerialPort)}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrinterSelectDialog;
