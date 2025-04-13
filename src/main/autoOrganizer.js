const fs = require('fs-extra');
const path = require('path');

class AutoOrganizer {
  constructor() {
    this.history = [];
    this.categories = {
      documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
      images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff', '.ico'],
      audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'],
      video: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg'],
      archives: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso'],
      code: ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.cs', '.php', '.html', '.css', '.jsx', '.tsx', '.json', '.xml', '.yml', '.yaml'],
      executables: ['.exe', '.msi', '.app', '.dmg', '.deb', '.rpm'],
    };
  }

  async organizeFile(filePath) {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        throw new Error('Não é possível organizar diretórios, apenas arquivos');
      }

      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      const baseDir = path.dirname(filePath);
      
      // Determine category based on file extension
      let category = 'outros';
      for (const [cat, extensions] of Object.entries(this.categories)) {
        if (extensions.includes(ext)) {
          category = cat;
          break;
        }
      }
      
      // Create category directory if it doesn't exist
      const categoryDir = path.join(baseDir, category);
      await fs.ensureDir(categoryDir);
      
      // Build destination path and ensure it doesn't already exist
      let destPath = path.join(categoryDir, fileName);
      let counter = 1;
      
      while (await fs.pathExists(destPath)) {
        const fileNameWithoutExt = path.basename(fileName, ext);
        destPath = path.join(categoryDir, `${fileNameWithoutExt} (${counter})${ext}`);
        counter++;
      }
      
      // Store action in history before moving
      const action = {
        originalPath: filePath,
        destinationPath: destPath,
        timestamp: new Date()
      };
      
      // Move the file
      await fs.move(filePath, destPath);
      
      // Add action to history after successful move
      this.history.push(action);
      
      return {
        success: true,
        file: fileName,
        category,
        from: filePath,
        to: destPath
      };
    } catch (error) {
      console.error(`Erro ao organizar arquivo ${filePath}:`, error);
      throw error;
    }
  }

  async organizeDirectory(directoryPath, options = {}) {
    try {
      if (!await fs.pathExists(directoryPath)) {
        throw new Error(`Diretório não encontrado: ${directoryPath}`);
      }

      const stats = await fs.stat(directoryPath);
      if (!stats.isDirectory()) {
        throw new Error('O caminho fornecido não é um diretório');
      }

      const files = await fs.readdir(directoryPath);
      const results = [];
      
      // Filter out directories if needed
      const filePaths = [];
      for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const fileStats = await fs.stat(fullPath);
        
        if (fileStats.isFile()) {
          filePaths.push(fullPath);
        }
      }
      
      // Organize each file
      for (const filePath of filePaths) {
        try {
          const result = await this.organizeFile(filePath);
          results.push(result);
        } catch (error) {
          console.error(`Falha ao organizar ${filePath}:`, error);
          results.push({
            success: false,
            file: path.basename(filePath),
            error: error.message
          });
        }
      }
      
      return {
        totalProcessed: filePaths.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error(`Erro ao organizar diretório ${directoryPath}:`, error);
      throw error;
    }
  }

  async undoLastMove() {
    if (this.history.length === 0) {
      throw new Error('Não há operações para desfazer');
    }
    
    const lastAction = this.history.pop();
    
    try {
      // Check if the file is still at the destination
      if (!await fs.pathExists(lastAction.destinationPath)) {
        throw new Error(`Arquivo não encontrado no destino: ${lastAction.destinationPath}`);
      }
      
      // Ensure original directory exists
      await fs.ensureDir(path.dirname(lastAction.originalPath));
      
      // Move the file back to its original location
      await fs.move(lastAction.destinationPath, lastAction.originalPath, { overwrite: true });
      
      return {
        success: true,
        file: path.basename(lastAction.destinationPath),
        from: lastAction.destinationPath,
        to: lastAction.originalPath
      };
    } catch (error) {
      // Re-add the action to history since the undo failed
      this.history.push(lastAction);
      console.error('Erro ao desfazer operação:', error);
      throw error;
    }
  }

  getHistory() {
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
    return { success: true };
  }
}

module.exports = { AutoOrganizer }; 