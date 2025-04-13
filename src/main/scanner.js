const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class FileScanner {
  constructor() {
    this.scanning = false;
    this.progress = 0;
    this.fileStats = {
      totalFiles: 0,
      totalSize: 0,
      duplicates: [],
      oldFiles: [],
      largeFiles: [],
      types: {}
    };
  }

  async scan(directoryPath) {
    if (this.scanning) {
      throw new Error('Já existe um scan em andamento');
    }

    if (!directoryPath) {
      throw new Error('Caminho do diretório não especificado');
    }

    this.scanning = true;
    this.progress = 0;
    this.fileStats = {
      totalFiles: 0,
      totalSize: 0,
      duplicates: [],
      oldFiles: [],
      largeFiles: [],
      types: {}
    };

    try {
      const dirExists = await fs.pathExists(directoryPath);
      if (!dirExists) {
        throw new Error(`Diretório não encontrado: ${directoryPath}`);
      }

      // Reset the file hashes map
      this.fileHashes = new Map();
      
      // Starting the scan
      await this.scanDirectory(directoryPath);
      
      // Find duplicates
      this.findDuplicates();
      
      // Set progress to 100% when finished
      this.progress = 100;

      return {
        totalFiles: this.fileStats.totalFiles,
        totalSize: this.fileStats.totalSize,
        duplicates: this.fileStats.duplicates,
        oldFiles: this.fileStats.oldFiles,
        largeFiles: this.fileStats.largeFiles,
        types: this.fileStats.types
      };
    } catch (error) {
      console.error('Erro durante o scan:', error);
      throw error;
    } finally {
      this.scanning = false;
    }
  }

  async scanDirectory(dirPath, currentDepth = 0) {
    const maxDepth = 20; // Prevent infinite recursion
    
    if (currentDepth > maxDepth) {
      console.warn(`Reached maximum scan depth (${maxDepth}) at: ${dirPath}`);
      return;
    }

    try {
      const items = await fs.readdir(dirPath);
      const totalItems = items.length;
      
      for (let i = 0; i < items.length; i++) {
        const itemName = items[i];
        const itemPath = path.join(dirPath, itemName);
        
        // Skip hidden files and folders (Unix-style)
        if (itemName.startsWith('.')) {
          continue;
        }
        
        try {
          const stats = await fs.stat(itemPath);
          
          if (stats.isDirectory()) {
            await this.scanDirectory(itemPath, currentDepth + 1);
          } else if (stats.isFile()) {
            await this.processFile(itemPath, stats);
          }
          
          // Update progress based on items processed
          this.progress = Math.min(99, Math.floor((i / totalItems) * 100));
        } catch (err) {
          console.error(`Error processing item: ${itemPath}`, err);
        }
      }
    } catch (err) {
      console.error(`Error reading directory: ${dirPath}`, err);
    }
  }
  
  async processFile(filePath, stats) {
    const fileSize = stats.size;
    const ext = path.extname(filePath).toLowerCase();
    const modified = stats.mtime;
    const now = new Date();
    const monthsOld = (now - modified) / (1000 * 60 * 60 * 24 * 30);
    
    // Update statistics
    this.fileStats.totalFiles++;
    this.fileStats.totalSize += fileSize;
    
    // Track file types
    if (!this.fileStats.types[ext]) {
      this.fileStats.types[ext] = {
        count: 0,
        size: 0
      };
    }
    this.fileStats.types[ext].count++;
    this.fileStats.types[ext].size += fileSize;
    
    // Identify old files (older than 1 year)
    if (monthsOld > 12) {
      this.fileStats.oldFiles.push({
        path: filePath,
        size: fileSize,
        modified
      });
    }
    
    // Identify large files (larger than 100MB)
    if (fileSize > 100 * 1024 * 1024) {
      this.fileStats.largeFiles.push({
        path: filePath,
        size: fileSize
      });
    }
    
    // Calculate file hash for duplicate detection
    if (fileSize > 0 && fileSize < 100 * 1024 * 1024) { // Skip empty files and very large files
      try {
        const hash = await this.getFileHash(filePath);
        
        if (!this.fileHashes.has(hash)) {
          this.fileHashes.set(hash, []);
        }
        
        this.fileHashes.get(hash).push({
          path: filePath,
          size: fileSize
        });
      } catch (err) {
        console.error(`Error hashing file: ${filePath}`, err);
      }
    }
  }
  
  async getFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', err => reject(err));
      
      stream.on('data', chunk => {
        hash.update(chunk);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });
  }
  
  findDuplicates() {
    for (const [hash, files] of this.fileHashes.entries()) {
      if (files.length > 1) {
        this.fileStats.duplicates.push({
          hash,
          files
        });
      }
    }
  }

  getProgress() {
    return this.progress;
  }
}

module.exports = { FileScanner }; 