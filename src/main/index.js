const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { FileScanner } = require('./scanner');
const { AutoOrganizer } = require('./autoOrganizer');
const fs = require('fs-extra');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;
const scanner = new FileScanner();
const organizer = new AutoOrganizer();

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: true,
      devTools: true,
      sandbox: false,
    },
  });

  // Load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development mode.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Log any errors that occur during page load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar página:', errorCode, errorDescription);
    // Try to reload after a short delay
    setTimeout(() => {
      console.log('Tentando carregar novamente...');
      mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    }, 1000);
  });

  // Log console messages from the renderer process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer Log (${level}):`, message);
  });
};

// IPC handlers
ipcMain.handle('start-scan', async (event, directoryPath) => {
  try {
    // Start sending progress updates
    const progressInterval = setInterval(() => {
      if (mainWindow) {
        const progress = scanner.getProgress();
        mainWindow.webContents.send('scan-progress', progress);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }
    }, 100);

    // Start scanning
    const result = await scanner.scan(directoryPath);
    return result;
  } catch (error) {
    console.error('Erro ao escanear:', error);
    throw error;
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

ipcMain.handle('get-file-stats', async (event, path) => {
  try {
    const stats = await fs.stat(path);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isDirectory: stats.isDirectory(),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do arquivo:', error);
    throw error;
  }
});

ipcMain.handle('organize-files', async (event, files) => {
  try {
    const results = [];
    for (const file of files) {
      const result = await organizer.organizeFile(file);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Erro ao organizar arquivos:', error);
    throw error;
  }
});

ipcMain.handle('undo-last-move', async () => {
  try {
    return await organizer.undoLastMove();
  } catch (error) {
    console.error('Erro ao desfazer última ação:', error);
    throw error;
  }
});

ipcMain.handle('get-history', async () => {
  return organizer.getHistory();
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    await fs.writeJson(settingsPath, settings, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
});

ipcMain.handle('get-settings', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    
    if (await fs.pathExists(settingsPath)) {
      return await fs.readJson(settingsPath);
    }
    
    // Default settings
    return {
      language: app.getLocale() || 'pt-BR',
      theme: 'light',
      autoOrganize: false,
      scanOnStartup: false,
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    // Return default settings on error
    return {
      language: 'pt-BR',
      theme: 'light',
      autoOrganize: false,
      scanOnStartup: false,
    };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 