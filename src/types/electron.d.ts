export interface ElectronAPI {
  // App info
  getVersion: () => string;
  getPlatform: () => string;
  
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  
  // File system operations
  selectFile: () => Promise<string | null>;
  selectFolder: () => Promise<string | null>;
  
  // Printer operations
  listSerialPorts: () => Promise<any[]>;
  connectToPrinter: (port: string) => Promise<boolean>;
  printData: (data: string) => Promise<boolean>;
  listSystemPrinters: () => Promise<any[]>;
  
  // Storage operations
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  
  // Environment
  isElectron: boolean;
  isDev: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};