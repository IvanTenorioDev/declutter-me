import { contextBridge, ipcRenderer } from 'electron';

// Expose APIs from Electron to the renderer process
contextBridge.exposeInMainWorld(
  'electron',
  {
    // File scanning
    startScan: (directoryPath?: string) => ipcRenderer.invoke('start-scan', directoryPath),
    getScanProgress: (callback: (progress: number) => void) => {
      const subscription = (_event: any, progress: number) => callback(progress);
      ipcRenderer.on('scan-progress', subscription);
      const unsubscribe = () => {
        ipcRenderer.removeListener('scan-progress', subscription);
      };
      return unsubscribe;
    },
    
    // File organization
    organizeFiles: (files: string[]) => ipcRenderer.invoke('organize-files', files),
    undoLastMove: () => ipcRenderer.invoke('undo-last-move'),
    getHistory: () => ipcRenderer.invoke('get-history'),
    
    // File system operations
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getFileStats: (path: string) => ipcRenderer.invoke('get-file-stats', path),
    
    // Settings management
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  }
); 