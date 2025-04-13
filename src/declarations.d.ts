declare module '*.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

// Variáveis globais do Webpack
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

interface Window {
  electron: {
    startScan: () => Promise<void>;
    getScanProgress: (callback: (progress: number) => void) => void;
    organizeFiles: (files: string[]) => Promise<void>;
    undoLastMove: () => Promise<boolean>;
    getHistory: () => Promise<MoveOperation[]>;
    selectDirectory: () => Promise<string>;
    getFileStats: (path: string) => Promise<any>;
    saveSettings: (settings: any) => Promise<void>;
    getSettings: () => Promise<any>;
  };
}

interface MoveOperation {
  sourcePath: string;
  destinationPath: string;
  timestamp: Date;
}

interface ScanResult {
  duplicates: string[];
  oldScreenshots: string[];
  temporaryFiles: string[];
  totalSize: number;
  freeableSpace: number;
} 