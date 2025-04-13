import { FileItem, ScanResult } from '../types/interfaces';

export interface IElectronAPI {
  startScan: (directoryPath?: string) => Promise<ScanResult>;
  getScanProgress: (callback: (progress: number) => void) => (() => void);
  organizeFiles: (files: string[]) => Promise<boolean>;
  undoLastMove: () => Promise<boolean>;
  getHistory: () => Promise<any[]>;
  selectDirectory: () => Promise<string | null>;
  getFileStats: (path: string) => Promise<any>;
  saveSettings: (settings: any) => Promise<void>;
  getSettings: () => Promise<any>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {}; 