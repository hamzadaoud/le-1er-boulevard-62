const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Optional imports for printer support (only available when installed)
let SerialPort, Store;
try {
  const serialport = require('serialport');
  SerialPort = serialport.SerialPort;
  Store = require('electron-store');
} catch (error) {
  console.log('Printer dependencies not installed. Serial printing will be unavailable.');
}

let mainWindow;

function createWindow() {
  // Create the browser windows
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:8080' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event listeners
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});

// Initialize electron store
let store;
try {
  store = Store ? new Store() : null;
} catch (error) {
  console.log('Electron store not available');
}

// Variables for printer connection
let printerPort = null;
let connectedPrinter = null;

// IPC Handlers

// Window controls
ipcMain.handle('window-minimize', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('window-maximize', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-close', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});

// File dialogs
ipcMain.handle('dialog-open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog-open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Store operations
ipcMain.handle('store-get', async (event, key) => {
  if (!store) return null;
  return store.get(key);
});

ipcMain.handle('store-set', async (event, key, value) => {
  if (!store) return;
  store.set(key, value);
});

ipcMain.handle('store-delete', async (event, key) => {
  if (!store) return;
  store.delete(key);
});

// Printer operations
ipcMain.handle('list-serial-ports', async () => {
  try {
    if (!SerialPort) return [];
    const ports = await SerialPort.list();
    return ports;
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
});

ipcMain.handle('connect-printer', async (event, portPath) => {
  try {
    if (!SerialPort) return false;
    
    if (connectedPrinter) {
      connectedPrinter.close();
    }
    
    connectedPrinter = new SerialPort({
      path: portPath,
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });
    
    printerPort = portPath;
    return true;
  } catch (error) {
    console.error('Error connecting to printer:', error);
    return false;
  }
});

// List available system printers
ipcMain.handle('list-system-printers', async () => {
  try {
    const printers = mainWindow.webContents.getPrinters();
    return printers.map(printer => ({
      name: printer.name,
      displayName: printer.displayName || printer.name,
      description: printer.description || '',
      status: printer.status || 0,
      isDefault: printer.isDefault || false
    }));
  } catch (error) {
    console.error('Error listing system printers:', error);
    return [];
  }
});

ipcMain.handle('print-data', async (event, data) => {
  try {
    // First try Windows system printers
    const printers = mainWindow.webContents.getPrinters();
    const thermalPrinter = printers.find(p => 
      p.name.toLowerCase().includes('thermal') || 
      p.name.toLowerCase().includes('receipt') ||
      p.name.toLowerCase().includes('ticket') ||
      p.name.toLowerCase().includes('generic') ||
      p.name.toLowerCase().includes('text only')
    );

    if (thermalPrinter) {
      console.log(`Found system printer: ${thermalPrinter.name}`);
      
      return new Promise((resolve) => {
        mainWindow.webContents.print({
          silent: true,
          printBackground: false,
          deviceName: thermalPrinter.name,
          margins: {
            marginType: 'none'
          },
          pageRanges: '',
          duplexMode: 'simplex',
          collate: false,
          copies: 1,
          header: '',
          footer: ''
        }, (success, failureReason) => {
          if (success) {
            console.log('Successfully printed to system printer');
            resolve(true);
          } else {
            console.error('Print failed:', failureReason);
            // Fallback to serial printer
            printToSerial(data).then(resolve);
          }
        });
      });
    } else {
      // Fallback to serial printer
      return await printToSerial(data);
    }
  } catch (error) {
    console.error('Error printing:', error);
    return false;
  }
});

// Helper function to print to serial printer
async function printToSerial(data) {
  try {
    if (!connectedPrinter || !connectedPrinter.isOpen) {
      console.error('No printer connected or printer not open');
      return false;
    }
    
    return new Promise((resolve, reject) => {
      connectedPrinter.write(data, (error) => {
        if (error) {
          console.error('Error writing to printer:', error);
          reject(false);
        } else {
          console.log('Data sent to printer successfully');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error in printToSerial:', error);
    return false;
  }
}