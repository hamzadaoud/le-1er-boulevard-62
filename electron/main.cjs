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
  // 🔒 Production-secure window
  mainWindow = new BrowserWindow({
    fullscreen: true,             // Force fullscreen
    frame: false,                 // Remove close/min/max buttons
    resizable: false,             // Prevent resizing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.removeMenu(); // 🔒 Disable menus in production
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 🔒 Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:8080' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
}

// 🔒 Removed createMenu() → No menus in production

// App event listeners
app.whenReady().then(() => {
  createWindow();

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
    event.preventDefault();
    callback(true);
  } else {
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

// IPC Handlers for window controls (used if you add your own UI buttons)
ipcMain.handle('window-minimize', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('window-maximize', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
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
    filters: [{ name: 'All Files', extensions: ['*'] }]
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
    return await SerialPort.list();
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
});

ipcMain.handle('connect-printer', async (event, portPath) => {
  try {
    if (!SerialPort) return false;
    if (connectedPrinter) connectedPrinter.close();

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
    const printers = mainWindow.webContents.getPrinters();
    const thermalPrinter = printers.find(p =>
      ['thermal', 'receipt', 'ticket', 'generic', 'text only']
        .some(keyword => p.name.toLowerCase().includes(keyword))
    );

    if (thermalPrinter) {
      console.log(`Found system printer: ${thermalPrinter.name}`);
      return new Promise(resolve => {
        mainWindow.webContents.print({
          silent: true,
          deviceName: thermalPrinter.name,
          margins: { marginType: 'none' },
          copies: 1
        }, (success, failureReason) => {
          if (success) resolve(true);
          else {
            console.error('Print failed:', failureReason);
            printToSerial(data).then(resolve);
          }
        });
      });
    } else {
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
