export interface FileItem {
  path: string;
  size: number;
  modifiedAt?: Date;
  createdAt?: Date;
  isDirectory?: boolean;
  extension?: string;
  hash?: string;
}

export interface ScanResult {
  totalFiles: number;
  totalSize: number;
  duplicates: Array<{
    hash: string;
    files: Array<FileItem>;
  }>;
  oldFiles: Array<FileItem>;
  largeFiles: Array<FileItem>;
  types: Record<string, {
    count: number;
    size: number;
  }>;
}

export interface MoveOperation {
  originalPath: string;
  destinationPath: string;
  timestamp: Date;
}

export interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  autoOrganize: boolean;
  scanOnStartup: boolean;
  defaultDirectory?: string;
}

export interface FileStats {
  total: number;
  byType: Record<string, number>;
} 