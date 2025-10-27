import chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import notifier from 'node-notifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const RAW_MATERIALS_DIR = path.join(PROJECT_ROOT, 'raw-materials');
const CONFIG_FILE = path.join(PROJECT_ROOT, '.ocrconfig.json');

interface WatcherConfig {
  watchEnabled: boolean;
  debounceMs: number;
  autoCompile: boolean;
  notifications: boolean;
  ignorePatterns: string[];
}

const DEFAULT_CONFIG: WatcherConfig = {
  watchEnabled: true,
  debounceMs: 2000,
  autoCompile: true,
  notifications: true,
  ignorePatterns: ['*.tmp', '*.processing', '*.DS_Store'],
};

/**
 * Watcher automatique pour le dossier raw-materials
 */
class OCRWatcher {
  private config: WatcherConfig;
  private processingFiles: Set<string> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Charge la configuration
   */
  private loadConfig(): WatcherConfig {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
      } catch (error) {
        console.warn('⚠️ Erreur lecture config, utilisation valeurs par défaut');
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  }

  /**
   * Sauvegarde la configuration
   */
  private saveConfig(): void {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  /**
   * Vérifie si le fichier doit être traité
   */
  private shouldProcess(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const supportedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

    if (!supportedExtensions.includes(ext)) {
      return false;
    }

    // Vérifier les patterns à ignorer
    const basename = path.basename(filePath);
    for (const pattern of this.config.ignorePatterns) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(basename)) {
        return false;
      }
    }

    // Vérifier si déjà en traitement
    if (this.processingFiles.has(filePath)) {
      return false;
    }

    return true;
  }

  /**
   * Détecte la catégorie selon le sous-dossier
   */
  private detectCategory(filePath: string): string {
    if (filePath.includes('concours-2024')) return 'concours_2024';
    if (filePath.includes('concours-2025')) return 'concours_2025';
    if (filePath.includes('cours')) return 'cours';
    return 'cours';
  }

  /**
   * Traite un fichier détecté
   */
  private async processFile(filePath: string): Promise<void> {
    if (!this.shouldProcess(filePath)) {
      return;
    }

    // Marquer le fichier comme en traitement
    this.processingFiles.add(filePath);

    const fileName = path.basename(filePath);
    console.log(`\n📥 Nouveau fichier détecté: ${fileName}`);

    // Renommer temporairement pour éviter re-détection
    const processingPath = `${filePath}.processing`;
    
    try {
      fs.renameSync(filePath, processingPath);
    } catch (error) {
      console.error('❌ Erreur lors du marquage du fichier');
      this.processingFiles.delete(filePath);
      return;
    }

    const category = this.detectCategory(filePath);

    // Lancer l'OCR via le script ocrToMarkdown
    const ocrProcess = spawn(
      'npx',
      [
        'tsx',
        'scripts/ocrToMarkdown.ts',
        '--input',
        processingPath,
        '--category',
        category,
        '--no-interactive',
      ],
      {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
      }
    );

    ocrProcess.on('close', async (code) => {
      // Restaurer le nom original
      try {
        if (fs.existsSync(processingPath)) {
          fs.renameSync(processingPath, filePath);
        }
      } catch (error) {
        console.error('⚠️ Impossible de restaurer le nom du fichier');
      }

      this.processingFiles.delete(filePath);

      if (code === 0) {
        console.log(`✅ OCR terminé: ${fileName}\n`);

        // Lancer la compilation si activée
        if (this.config.autoCompile) {
          console.log('⚙️ Lancement de la compilation...\n');
          await this.runCompilation();
        }

        // Notification desktop
        if (this.config.notifications) {
          notifier.notify({
            title: 'OCR Terminé',
            message: `${fileName} converti en Markdown`,
            sound: true,
          });
        }
      } else {
        console.error(`❌ Erreur lors du traitement de ${fileName}\n`);

        if (this.config.notifications) {
          notifier.notify({
            title: 'OCR Échoué',
            message: `Erreur lors du traitement de ${fileName}`,
            sound: true,
          });
        }
      }
    });
  }

  /**
   * Lance la compilation des modules
   */
  private async runCompilation(): Promise<void> {
    return new Promise((resolve, reject) => {
      const compileProcess = spawn('npm', ['run', 'compile'], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
      });

      compileProcess.on('close', (code) => {
        if (code === 0) {
          console.log('🎉 Pipeline complet terminé !\n');
          resolve();
        } else {
          console.error('❌ Erreur lors de la compilation\n');
          reject(new Error('Compilation failed'));
        }
      });
    });
  }

  /**
   * Démarre le watcher
   */
  start(): void {
    if (!this.config.watchEnabled) {
      console.log('⚠️ Watcher désactivé dans la configuration');
      return;
    }

    // Vérifier que le dossier existe
    if (!fs.existsSync(RAW_MATERIALS_DIR)) {
      console.error(`❌ Dossier raw-materials introuvable: ${RAW_MATERIALS_DIR}`);
      console.log('💡 Lancez d\'abord: npm run ocr -- --help');
      process.exit(1);
    }

    console.log('🚀 Démarrage du watcher OCR...\n');
    console.log(`📂 Surveillance: ${RAW_MATERIALS_DIR}`);
    console.log(`⏱️  Debounce: ${this.config.debounceMs}ms`);
    console.log(`⚙️  Auto-compilation: ${this.config.autoCompile ? '✅' : '❌'}`);
    console.log(`🔔 Notifications: ${this.config.notifications ? '✅' : '❌'}\n`);
    console.log('─'.repeat(70));
    console.log('👀 En attente de nouveaux fichiers...');
    console.log('   Glissez vos PDFs/images dans raw-materials/');
    console.log('   Ctrl+C pour arrêter\n');

    const watcher = chokidar.watch(RAW_MATERIALS_DIR, {
      ignored: (filepath: string) => {
        const basename = path.basename(filepath);
        return (
          basename.startsWith('.') ||
          this.config.ignorePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(basename);
          })
        );
      },
      persistent: true,
      ignoreInitial: true, // Ne pas traiter les fichiers existants
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    watcher.on('add', (filePath: string) => {
      // Debounce pour éviter traitements multiples
      if (this.debounceTimers.has(filePath)) {
        clearTimeout(this.debounceTimers.get(filePath)!);
      }

      const timer = setTimeout(() => {
        this.processFile(filePath);
        this.debounceTimers.delete(filePath);
      }, this.config.debounceMs);

      this.debounceTimers.set(filePath, timer);
    });

    watcher.on('error', (error) => {
      console.error('❌ Erreur watcher:', error);
    });

    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Arrêt du watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

/**
 * Point d'entrée
 */
function main() {
  const watcher = new OCRWatcher();
  watcher.start();
}

main();

