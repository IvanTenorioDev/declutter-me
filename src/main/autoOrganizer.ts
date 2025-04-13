import fs from 'fs-extra';
import path from 'path';
import { homedir } from 'os';

interface MoveOperation {
  sourcePath: string;
  destinationPath: string;
  timestamp: Date;
}

export class AutoOrganizer {
  private history: MoveOperation[] = [];
  private readonly importantDocsPath: string;
  private readonly trashPath: string;

  constructor() {
    const home = homedir();
    this.importantDocsPath = path.join(home, 'Documents', 'Importantes');
    this.trashPath = path.join(home, 'Lixo_Liberar');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    await fs.ensureDir(this.importantDocsPath);
    await fs.ensureDir(this.trashPath);
  }

  private isFinancialDocument(fileName: string): boolean {
    const financialPatterns = [
      /extrato/i,
      /boleto/i,
      /fatura/i,
      /nf-?e?/i, // Nota Fiscal/NF-e
      /recibo/i
    ];
    return financialPatterns.some(pattern => pattern.test(fileName));
  }

  private isMeme(fileName: string): boolean {
    // Padrões comuns de nomes de arquivos de memes do WhatsApp
    const memePatterns = [
      /whatsapp.*image/i,
      /img-\d{8}-wa\d{4}/i,
      /meme/i
    ];
    return memePatterns.some(pattern => pattern.test(fileName));
  }

  private async moveFile(sourcePath: string, destinationDir: string): Promise<void> {
    const fileName = path.basename(sourcePath);
    const destinationPath = path.join(destinationDir, fileName);
    
    // Adicionar sufixo numérico se o arquivo já existir
    let finalPath = destinationPath;
    let counter = 1;
    while (await fs.pathExists(finalPath)) {
      const ext = path.extname(fileName);
      const base = path.basename(fileName, ext);
      finalPath = path.join(destinationDir, `${base}_${counter}${ext}`);
      counter++;
    }

    await fs.move(sourcePath, finalPath);
    
    this.history.push({
      sourcePath,
      destinationPath: finalPath,
      timestamp: new Date()
    });
  }

  async organizeFile(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    try {
      if (this.isFinancialDocument(fileName)) {
        const financialPath = path.join(this.importantDocsPath, 'Financeiros');
        await fs.ensureDir(financialPath);
        await this.moveFile(filePath, financialPath);
      } else if (this.isMeme(fileName)) {
        const memePath = path.join(this.trashPath, 'Memes');
        await fs.ensureDir(memePath);
        await this.moveFile(filePath, memePath);
      } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
        const docsPath = path.join(this.importantDocsPath, 'Documentos');
        await fs.ensureDir(docsPath);
        await this.moveFile(filePath, docsPath);
      }
    } catch (error) {
      console.error(`Erro ao organizar arquivo ${filePath}:`, error);
      throw error;
    }
  }

  async undoLastMove(): Promise<boolean> {
    const lastOperation = this.history.pop();
    if (!lastOperation) {
      return false;
    }

    try {
      await fs.move(lastOperation.destinationPath, lastOperation.sourcePath);
      return true;
    } catch (error) {
      console.error('Erro ao desfazer última operação:', error);
      // Readicionar a operação ao histórico se falhar
      this.history.push(lastOperation);
      return false;
    }
  }

  getHistory(): MoveOperation[] {
    return [...this.history];
  }

  // Limpar arquivos antigos da pasta Lixo_Liberar (mais de 7 dias)
  async cleanupTrash(): Promise<string[]> {
    const deletedFiles: string[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const files = await fs.readdir(this.trashPath);
      
      for (const file of files) {
        const filePath = path.join(this.trashPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < sevenDaysAgo) {
          await fs.remove(filePath);
          deletedFiles.push(filePath);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar pasta de lixo:', error);
    }

    return deletedFiles;
  }
} 