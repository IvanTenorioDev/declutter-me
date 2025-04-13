interface IElectronAPI {
  // File scanning
  startScan: (directoryPath?: string) => Promise<any>;
  getScanProgress: (callback: (progress: number) => void) => () => void;
  
  // File organization
  organizeFiles: (files: string[]) => Promise<any>;
  undoLastMove: () => Promise<any>;
  getHistory: () => Promise<any>;
  
  // File system operations
  selectDirectory: () => Promise<string | null>;
  getFileStats: (path: string) => Promise<any>;
  
  // Settings management
  saveSettings: (settings: any) => Promise<boolean>;
  getSettings: () => Promise<any>;
  
  // App info
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {}; 