// ESC/POS command utilities for thermal printers - Enhanced for darker printing
import { printToElectronPrinter, isElectron, electronStore } from './electronUtils';

export class ESCPOSFormatter {
  // ESC/POS control commands
  static readonly ESC = '\x1b';
  static readonly GS = '\x1d';
  static readonly LF = '\n';
  static readonly CR = '\r';
  
  // Store the selected serial port to avoid repeated prompts
  private static selectedPort: any = null;
  
  // Initialize printer with enhanced settings for darker printing
  static init(): string {
    return this.ESC + '@' + // Initialize printer
           this.setPrintDensity(15) + // Maximum density for darker printing
           this.setHeatTime(120) + // Increase heat time for darker print
           this.setHeatInterval(50) + // Heat interval setting
           this.setCharacterSet();
  }
  
  // Print density control (0-15, higher = darker)
  static setPrintDensity(density: number = 15): string {
    const clampedDensity = Math.max(0, Math.min(15, density));
    return this.GS + '(' + 'K' + '\x02' + '\x00' + '\x30' + String.fromCharCode(clampedDensity);
  }
  
  // Heat time control (80-255, higher = darker but slower)
  static setHeatTime(heatTime: number = 120): string {
    const clampedHeat = Math.max(80, Math.min(255, heatTime));
    return this.ESC + '7' + String.fromCharCode(clampedHeat) + String.fromCharCode(40) + String.fromCharCode(200);
  }
  
  // Heat interval control (0-255)
  static setHeatInterval(interval: number = 50): string {
    const clampedInterval = Math.max(0, Math.min(255, interval));
    return this.ESC + '8' + String.fromCharCode(clampedInterval) + String.fromCharCode(2);
  }
  
  // Enhanced text emphasis for darker printing - FIXED
  static textEmphasisOn(): string {
    return this.ESC + 'G' + '\x01'; // Fixed: should be ESC G 1, not ESC G1
  }
  
  static textEmphasisOff(): string {
    return this.ESC + 'G' + '\x00'; // Fixed: should be ESC G 0, not ESC G0
  }
  
  // Double strike for even darker text - FIXED
  static doubleStrikeOn(): string {
    return this.ESC + 'g' + '\x01'; // Fixed: should be ESC g 1, not ESC g1
  }
  
  static doubleStrikeOff(): string {
    return this.ESC + 'g' + '\x00'; // Fixed: should be ESC g 0, not ESC g0
  }
  
  // Combination command for maximum darkness
  static textMaxDarkness(): string {
    return this.textBold() + this.textEmphasisOn() + this.doubleStrikeOn();
  }
  
  static textNormalDarkness(): string {
    return this.textBoldOff() + this.textEmphasisOff() + this.doubleStrikeOff() + this.textNormal();
  }
  
  // Text alignment
  static alignLeft(): string {
    return this.ESC + 'a' + '\x00';
  }
  
  static alignCenter(): string {
    return this.ESC + 'a' + '\x01';
  }
  
  static alignRight(): string {
    return this.ESC + 'a' + '\x02';
  }
  
  // Text size and style
  static textNormal(): string {
    return this.ESC + '!' + '\x00'; // Normal text
  }
  
  static textBold(): string {
    return this.ESC + 'E' + '\x01'; // Bold on
  }
  
  static textBoldOff(): string {
    return this.ESC + 'E' + '\x00'; // Bold off
  }
  
  static textDoubleHeight(): string {
    return this.ESC + '!' + '\x10'; // Double height
  }
  
  static textDoubleWidth(): string {
    return this.ESC + '!' + '\x20'; // Double width
  }
  
  static textLarge(): string {
    return this.ESC + '!' + '\x30'; // Double height + width
  }
  
  // Line feeds and spacing
  static newLine(): string {
    return this.LF;
  }
  
  static multipleLines(count: number): string {
    return this.LF.repeat(count);
  }
  
  static setLineSpacing(dots: number): string {
    return this.ESC + '3' + String.fromCharCode(dots);
  }
  
  // Paper cutting - RONGTA RP330 compatible commands
  static cutPaper(): string {
    // Use GS V 1 for full cut - standard for RONGTA RP330 series
    return this.GS + 'V' + String.fromCharCode(1);
  }
  
  static partialCut(): string {
    // Use GS V 0 for partial cut
    return this.GS + 'V' + String.fromCharCode(0);
  }
  
  // Character encoding
  static setCharacterSet(): string {
    return this.ESC + 'R' + '\x00'; // USA character set
  }
  
  // Enhanced barcode generation with darker settings
  static generateBarcode(data: string): string {
    const barcodeType = 73; // Code 128
    const height = 60; // Increased height for better visibility
    const width = 3; // Increased width for darker bars
    
    return this.GS + 'h' + String.fromCharCode(height) + // Set height
           this.GS + 'w' + String.fromCharCode(width) + // Set width
           this.GS + 'H' + '\x02' + // Print HRI below barcode
           this.GS + 'k' + String.fromCharCode(barcodeType) + 
           String.fromCharCode(data.length) + data;
  }
  
  // Horizontal line with emphasis for darker lines
  static horizontalLine(char: string = '-', width: number = 32): string {
    return this.textMaxDarkness() + char.repeat(width) + this.textNormalDarkness();
  }
  
  // Format currency
  static formatCurrency(amount: number): string {
    return amount.toFixed(2) + ' MAD';
  }
  
  // Format date for thermal printer
  static formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Helper method to wrap important text with maximum darkness
  static darkText(text: string): string {
    return this.textMaxDarkness() + text + this.textNormalDarkness();
  }
  
  // Helper method for medium darkness (just bold + emphasis)
  static mediumDarkText(text: string): string {
    return this.textBold() + this.textEmphasisOn() + text + this.textEmphasisOff() + this.textBoldOff();
  }
  
  // Print quality test pattern
  static generateTestPattern(): string {
    return this.init() +
           this.alignCenter() +
           this.textLarge() + this.darkText('TEST PATTERN') + this.newLine() +
           this.multipleLines(1) +
           this.textNormal() + 'Normal text darkness' + this.newLine() +
           this.mediumDarkText('Medium dark text') + this.newLine() +
           this.darkText('Maximum dark text') + this.newLine() +
           this.multipleLines(1) +
           this.horizontalLine('=', 32) + this.newLine() +
           this.generateBarcode('TEST123') + this.newLine() +
           this.multipleLines(3) +
           this.cutPaper();
  }
  
  // Print directly to thermal printer using Web Serial API or Electron
  static print(content: string): void {
    this.printDirectly(content);
  }

  // Print both tickets directly with enhanced settings for thermal printers
  static printBothTickets(clientTicket: string, agentTicket: string): void {
    // Prepend initialization and darkness settings to both tickets
    const enhancedClientTicket = this.init() + clientTicket;
    const enhancedAgentTicket = this.init() + agentTicket;
    
    // For table tickets, prioritize Electron thermal printing
    this.printTableTicketDirectly(enhancedClientTicket).then(() => {
      // Print agent ticket after a delay for physical separation
      setTimeout(() => {
        this.printTableTicketDirectly(enhancedAgentTicket);
      }, 2000);
    }).catch((error) => {
      console.error('Table ticket printing failed:', error);
      // In Electron, show configuration dialog instead of fallback
      if (isElectron()) {
        alert('Erreur d\'impression: Veuillez configurer votre imprimante thermique dans les paramètres de l\'application.');
      } else {
        // Only fallback to browser printing if not in Electron
        this.fallbackPrint(enhancedClientTicket + '\n\n--- COPIE AGENT ---\n\n' + enhancedAgentTicket);
      }
    });
  }
  
  // Specialized printing method for table tickets that prioritizes thermal printing
  private static async printTableTicketDirectly(content: string): Promise<void> {
    // Get saved printer settings
    const printerType = await electronStore.get('printerType') || 'serial';
    const savedSerialPort = await electronStore.get('selectedSerialPort');
    
    // Try Electron printing first if available (highest priority for table tickets)
    if (isElectron()) {
      try {
        console.log('[TABLE TICKET] Printing via Electron thermal printer...');
        const success = await printToElectronPrinter(content);
        if (success) {
          console.log('Table ticket printed successfully via Electron');
          return;
        } else {
          throw new Error('Electron printing returned false');
        }
      } catch (error) {
        console.error('Electron printing failed for table ticket:', error);
        throw error; // Don't continue to other methods for table tickets in Electron
      }
    }
    
    // Use Web Serial API for thermal printers (browser mode only)
    if ('serial' in navigator && printerType === 'serial') {
      try {
        let portToUse = this.selectedPort;
        
        // Use saved port if available and no port currently selected
        if (!portToUse && savedSerialPort) {
          console.log(`[TABLE TICKET] Using saved serial port: ${savedSerialPort}`);
          const availablePorts = await (navigator as any).serial.getPorts();
          portToUse = availablePorts.find((port: any) => port.getInfo().usbVendorId || port.path === savedSerialPort);
          
          if (!portToUse) {
            console.log('[TABLE TICKET] Requesting thermal printer port selection...');
            portToUse = await (navigator as any).serial.requestPort();
          }
          
          this.selectedPort = portToUse;
        } else if (!portToUse) {
          console.log('[TABLE TICKET] Requesting serial port for thermal printer...');
          portToUse = await (navigator as any).serial.requestPort();
          this.selectedPort = portToUse;
        }
        
        // Check if port is already open, if not open it with optimal settings
        if (!portToUse.readable) {
          await portToUse.open({ 
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          });
        }
        
        const writer = portToUse.writable.getWriter();
        const encoder = new TextEncoder();
        
        // Send raw ESC/POS content for table tickets
        await writer.write(encoder.encode(content));
        await writer.close();
        
        console.log('Table ticket printed successfully via Serial API');
        return;
      } catch (error) {
        console.error('Serial printing failed for table ticket:', error);
        this.selectedPort = null;
        throw error;
      }
    }
    
    // If we reach here, no thermal printer is available
    throw new Error('No thermal printer configured for table tickets');
  }
  
  private static async printDirectly(content: string): Promise<void> {
    // Get saved printer settings
    const printerType = await electronStore.get('printerType') || 'serial';
    const savedSerialPort = await electronStore.get('selectedSerialPort');
    const savedSystemPrinter = await electronStore.get('selectedSystemPrinter');
    
    // Try Electron printing first if available
    if (isElectron()) {
      try {
        console.log('[ESCPOS] Printing via Electron...');
        const success = await printToElectronPrinter(content);
        if (success) {
          console.log('Ticket printed successfully via Electron');
          return;
        }
      } catch (error) {
        console.warn('Electron printing failed, trying other methods:', error);
      }
    }
    
    // Use saved printer settings for Web Serial API (browser or Electron with Web Serial)
    if ('serial' in navigator && printerType === 'serial') {
      try {
        let portToUse = this.selectedPort;
        
        // Use saved port if available and no port currently selected
        if (!portToUse && savedSerialPort) {
          console.log(`[ESCPOS] Using saved serial port: ${savedSerialPort}`);
          // Request the specific saved port
          const availablePorts = await (navigator as any).serial.getPorts();
          portToUse = availablePorts.find((port: any) => port.getInfo().usbVendorId || port.path === savedSerialPort);
          
          if (!portToUse) {
            console.log('[ESCPOS] Saved port not found, requesting port selection...');
            portToUse = await (navigator as any).serial.requestPort();
          }
          
          this.selectedPort = portToUse;
        } else if (!portToUse) {
          console.log('[ESCPOS] Requesting serial port for thermal printer...');
          portToUse = await (navigator as any).serial.requestPort();
          this.selectedPort = portToUse;
        }
        
        // Check if port is already open, if not open it with optimal settings
        if (!portToUse.readable) {
          await portToUse.open({ 
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          });
        }
        
        const writer = portToUse.writable.getWriter();
        const encoder = new TextEncoder();
        
        // Send raw ESC/POS content with enhanced darkness settings
        await writer.write(encoder.encode(content));
        await writer.close();
        
        console.log('Ticket printed successfully via Serial API with enhanced darkness settings');
        return;
      } catch (error) {
        console.warn('Serial printing failed:', error);
        // Reset port on error
        this.selectedPort = null;
        
        // In Electron, show error dialog, in browser continue to fallback
        if (isElectron()) {
          alert('Erreur d\'impression: Impossible de se connecter à l\'imprimante thermique. Vérifiez la connexion USB ou configurez l\'imprimante dans les paramètres.');
          throw error;
        } else {
          console.log('Falling back to browser printing...');
        }
      }
    } else if (printerType === 'system' && savedSystemPrinter) {
      console.log(`[ESCPOS] Using system printer: ${savedSystemPrinter}`);
      // For system printers, use browser printing with the saved printer
      this.fallbackPrint(content, savedSystemPrinter);
      return;
    } else {
      console.log('No specific printer configured, using fallback printing method');
    }
    
    // Final fallback to browser printing
    this.fallbackPrint(content);
  }
  
  private static fallbackPrint(content: string, printerName?: string): void {
    // Clean content for printing
    const cleanContent = this.cleanContentForBrowser(content);
    
    // Create a new window for printing instead of iframe (more reliable)
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Rapport d'impression</title>
          <style>
            @page { 
              margin: 10mm; 
              size: A4;
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              line-height: 1.4;
              margin: 0;
              padding: 10mm;
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              background: white;
            }
            .report-content {
              white-space: pre-line;
              max-width: 100%;
              word-wrap: break-word;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .section {
              margin: 15px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
              Imprimer ce rapport
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">
              Fermer
            </button>
          </div>
          <div class="report-content">${cleanContent}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-focus and trigger print dialog after content loads
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (error) {
          console.warn('Auto-print failed:', error);
          alert('La fenêtre d\'impression a été ouverte. Cliquez sur "Imprimer ce rapport" pour imprimer.');
        }
      }, 500);
    } else {
      // Fallback if popup is blocked
      alert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups ne sont pas bloqués.');
      
      // Try direct browser print as last resort
      const printContent = document.createElement('div');
      printContent.innerHTML = `<pre style="font-family: monospace; white-space: pre-line;">${cleanContent}</pre>`;
      printContent.style.display = 'none';
      document.body.appendChild(printContent);
      
      setTimeout(() => {
        window.print();
        document.body.removeChild(printContent);
      }, 100);
    }
  }

  // FIXED: Comprehensive content cleaning for browser display
  private static cleanContentForBrowser(content: string): string {
    return content
      // Remove initialization commands
      .replace(/\x1b@/g, '')
      
      // Remove print density and heat settings (GS commands)
      .replace(/\x1d\(K[\x00-\xFF]{2}0[\x00-\xFF]/g, '') // GS ( K commands for density
      .replace(/\x1b7[\x00-\xFF]{3}/g, '') // Heat time ESC 7
      .replace(/\x1b8[\x00-\xFF]{2}/g, '') // Heat interval ESC 8
      
      // Remove character set commands
      .replace(/\x1bR[\x00-\xFF]/g, '')
      
      // Remove text formatting commands
      .replace(/\x1b![\x00-\xFF]/g, '') // Text size/style commands
      .replace(/\x1bE[\x00-\x01]/g, '') // Bold on/off
      .replace(/\x1bG[\x00-\x01]/g, '') // Emphasis on/off  
      .replace(/\x1bg[\x00-\x01]/g, '') // Double strike on/off
      
      // Remove alignment commands
      .replace(/\x1ba[\x00-\x02]/g, '')
      
      // Remove line spacing commands
      .replace(/\x1b3[\x00-\xFF]/g, '')
      
      // Remove barcode commands (comprehensive)
      .replace(/\x1dh[\x00-\xFF]/g, '') // Barcode height
      .replace(/\x1dw[\x00-\xFF]/g, '') // Barcode width
      .replace(/\x1dH[\x00-\xFF]/g, '') // HRI position
      .replace(/\x1dk[\x00-\xFF][\x00-\xFF]*?/g, '') // Barcode data
      
      // Remove paper cut commands
      .replace(/\x1dV[\x00-\x01]/g, '')
      
      // Remove any remaining ESC/POS control sequences
      .replace(/\x1b[\x20-\x7F]?[\x00-\xFF]*/g, '') // ESC commands
      .replace(/\x1d[\x20-\x7F]?[\x00-\xFF]*/g, '') // GS commands
      
      // Remove all non-printable characters except newlines and tabs
      .replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, '')
      
      // Clean up formatting
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Convert remaining CR to LF
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
      .trim(); // Remove leading/trailing whitespace
  }
}
