const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // File system operations (if needed later)
  selectFile: () => ipcRenderer.invoke('dialog-open-file'),
  selectFolder: () => ipcRenderer.invoke('dialog-open-folder'),
  
  // Printer operations (for thermal printing)
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  connectToPrinter: (port) => ipcRenderer.invoke('connect-printer', port),
  printData: (data) => ipcRenderer.invoke('print-data', data),
  listSystemPrinters: () => ipcRenderer.invoke('list-system-printers'),
  
  // Storage operations
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // Environment
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development'
});

// Log that preload script has loaded
console.log('Preload script loaded successfully');