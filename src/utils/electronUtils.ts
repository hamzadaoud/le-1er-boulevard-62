// Utility functions for Electron integration
export const isElectron = (): boolean => {
  return !!(window.electronAPI?.isElectron);
};

export const isElectronDev = (): boolean => {
  return !!(window.electronAPI?.isDev);
};

export const getElectronVersion = (): string | null => {
  return window.electronAPI?.getVersion() || null;
};

export const getPlatform = (): string => {
  return window.electronAPI?.getPlatform() || 'web';
};

// Window controls for Electron
export const minimizeWindow = async (): Promise<void> => {
  if (isElectron()) {
    await window.electronAPI?.minimize();
  }
};

export const maximizeWindow = async (): Promise<void> => {
  if (isElectron()) {
    await window.electronAPI?.maximize();
  }
};

export const closeWindow = async (): Promise<void> => {
  if (isElectron()) {
    await window.electronAPI?.close();
  }
};

// File operations for Electron
export const selectFile = async (): Promise<string | null> => {
  if (isElectron()) {
    return await window.electronAPI?.selectFile() || null;
  }
  return null;
};

export const selectFolder = async (): Promise<string | null> => {
  if (isElectron()) {
    return await window.electronAPI?.selectFolder() || null;
  }
  return null;
};

// Storage operations for Electron
export const electronStore = {
  get: async (key: string): Promise<any> => {
    if (isElectron()) {
      return await window.electronAPI?.store.get(key);
    }
    return localStorage.getItem(key);
  },
  
  set: async (key: string, value: any): Promise<void> => {
    if (isElectron()) {
      await window.electronAPI?.store.set(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  
  delete: async (key: string): Promise<void> => {
    if (isElectron()) {
      await window.electronAPI?.store.delete(key);
    } else {
      localStorage.removeItem(key);
    }
  }
};

// Printer operations for Electron
export const listSerialPorts = async (): Promise<any[]> => {
  if (isElectron()) {
    return await window.electronAPI?.listSerialPorts() || [];
  }
  return [];
};

export const connectToPrinter = async (port: string): Promise<boolean> => {
  if (isElectron()) {
    return await window.electronAPI?.connectToPrinter(port) || false;
  }
  return false;
};

export const printToElectronPrinter = async (data: string): Promise<boolean> => {
  if (isElectron()) {
    return await window.electronAPI?.printData(data) || false;
  }
  return false;
};

export const listSystemPrinters = async (): Promise<any[]> => {
  if (isElectron()) {
    return await window.electronAPI?.listSystemPrinters() || [];
  }
  return [];
};