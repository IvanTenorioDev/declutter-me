import fs from 'fs-extra';
import path from 'path';
import md5 from 'md5';
import { homedir } from 'os';

interface ScanResult {
  duplicates: string[];
  oldScreenshots: string[];
  temporaryFiles: string[];
  totalSize: number;
  freeableSpace: number;
}

interface FileInfo {
  path: string;
  hash: string;
  size: number;
  modifiedTime: Date;
}

export class FileScanner {
  private hashMap: Map<string, string[]> = new Map();
  private defaultPaths: string[];

  constructor() {
    const home = homedir();
    this.defaultPaths = [
      path.join(home, 'Downloads'),
      path.join(home, 'Documents'),
      path.join(home, 'Desktop')
    ];
  }

  private async calculateHash(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return md5(buffer);
  }

  private isScreenshot(fileName: string): boolean {
    const screenshotPatterns = [
      /screenshot/i,
      /captura/i,
      /print/i
    ];
    return screenshotPatterns.some(pattern => pattern.test(fileName));
  }

  private isTemporary(fileName: string): boolean {
    const tempExtensions = ['.tmp', '.log', '.temp'];
    return tempExtensions.includes(path.extname(fileName).toLowerCase());
  }

  async scanDirectory(dirPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(dirPath, entry.name);
        const stats = await fs.stat(filePath);
        const hash = await this.calculateHash(filePath);

        files.push({
          path: filePath,
          hash,
          size: stats.size,
          modifiedTime: stats.mtime
        });
      }
    }

    return files;
  }

  async scan(): Promise<ScanResult> {
    const result: ScanResult = {
      duplicates: [],
      oldScreenshots: [],
      temporaryFiles: [],
      totalSize: 0,
      freeableSpace: 0
    };

    for (const dirPath of this.defaultPaths) {
      try {
        const files = await this.scanDirectory(dirPath);

        for (const file of files) {
          result.totalSize += file.size;

          // Verificar duplicados
          const existing = this.hashMap.get(file.hash) || [];
          if (existing.length > 0) {
            result.duplicates.push(file.path);
            result.freeableSpace += file.size;
          }
          this.hashMap.set(file.hash, [...existing, file.path]);

          // Verificar screenshots antigos
          const fileName = path.basename(file.path);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          if (this.isScreenshot(fileName) && file.modifiedTime < thirtyDaysAgo) {
            result.oldScreenshots.push(file.path);
            result.freeableSpace += file.size;
          }

          // Verificar arquivos temporários
          if (this.isTemporary(fileName)) {
            result.temporaryFiles.push(file.path);
            result.freeableSpace += file.size;
          }
        }
      } catch (error) {
        console.error(`Erro ao escanear ${dirPath}:`, error);
      }
    }

    return result;
  }
} 