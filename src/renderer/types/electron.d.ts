interface IElectronAPI {
  startScan: () => Promise<void>;
  getScanProgress: (callback: (progress: number) => void) => () => void;
  organizeFiles: (files: string[]) => Promise<void>;
  undoLastMove: () => Promise<void>;
  getHistory: () => Promise<any>;
  selectDirectory: () => Promise<string>;
  getFileStats: (path: string) => Promise<any>;
  saveSettings: (settings: any) => Promise<void>;
  getSettings: () => Promise<any>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {}; 