// Elimu Intelligent File Watcher
// Requests permission to access the teacher's local documents folder (e.g. Lesson Notes, Past Papers, Downloads).
// Periodically scans for new files and intelligently prompts the educator to convert them to Word/PDF.

import { notificationEngine } from './notificationSystem';

interface SeenFileEntry {
  name: string;
  size: number;
  lastModified: number;
  detectedAt: number;
}

const SEEN_FILES_STORAGE_KEY = 'elimu_watched_seen_files';
const FOLDER_NAME_KEY = 'elimu_watched_folder_name';

class IntelligentFileWatcher {
  private directoryHandle: any = null;
  private scanInterval: any = null;
  private isScanning = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initFromStorage();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  public isConnected(): boolean {
    return this.directoryHandle !== null;
  }

  public getConnectedFolderName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(FOLDER_NAME_KEY);
  }

  private initFromStorage() {
    // If previously connected folder name exists, start scanner polling
    const folderName = this.getConnectedFolderName();
    if (folderName) {
      this.startPolling();
    }
  }

  // Request user permission to access their teaching documents directory
  public async requestFolderAccess(): Promise<{ success: boolean; folderName?: string; error?: string }> {
    if (!this.isSupported()) {
      return { 
        success: false, 
        error: "Mudasobwa cyangwa mushakisha (browser) yawe ntishyigikiye Directory Picker. Koresha uburyo bwo guhitamo inyandiko muri Converter." 
      };
    }

    try {
      // Prompt user to pick a folder (e.g. Documents, Downloads, Amasomo)
      const handle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'documents'
      });

      this.directoryHandle = handle;
      const folderName = handle.name || 'Ububiko bw’Inyandiko';
      localStorage.setItem(FOLDER_NAME_KEY, folderName);

      // Perform initial baseline scan
      await this.scanDirectory(true);

      // Start periodic background scanner
      this.startPolling();
      this.notify();

      // Dispatch smart confirmation notification
      notificationEngine.sendLockScreenNotification({
        title: `📂 Ububiko bw’Inyandiko Bwahujwe: ${folderName}!`,
        body: `Elimu Smart Assistant izajya ikugenzurira inyandiko nshya (PDF, Word, Amashusho) ikubaze niba wifuza kuzihindura.`,
        tab: 'converter',
        tag: 'file-watcher-connected'
      });

      return { success: true, folderName };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Waretse guhitamo ububiko.' };
      }
      console.error('Error selecting directory:', err);
      return { success: false, error: 'Ntibyashobotse guhuza ububiko. Ongera ugerageze.' };
    }
  }

  public disconnectFolder() {
    this.directoryHandle = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FOLDER_NAME_KEY);
    }
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.notify();
  }

  public startPolling() {
    if (this.scanInterval) clearInterval(this.scanInterval);
    // Scan every 45 seconds when window is active
    this.scanInterval = setInterval(() => {
      this.scanDirectory(false);
    }, 45000);
  }

  private getSeenFiles(): Record<string, SeenFileEntry> {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(SEEN_FILES_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveSeenFiles(seen: Record<string, SeenFileEntry>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SEEN_FILES_STORAGE_KEY, JSON.stringify(seen));
  }

  // Scan directory for new, un-converted files
  public async scanDirectory(isInitialBaseline = false): Promise<number> {
    if (!this.directoryHandle || this.isScanning) return 0;

    // Check if file watcher is disabled in settings
    const settings = notificationEngine.getSettings();
    if (!settings.fileWatcherEnabled) return 0;

    this.isScanning = true;
    let newFilesFound = 0;

    try {
      // Verify or re-request permission if browser downgraded it
      const permission = await this.directoryHandle.queryPermission({ mode: 'read' });
      if (permission !== 'granted') {
        this.isScanning = false;
        return 0;
      }

      const seen = this.getSeenFiles();
      const currentFiles: SeenFileEntry[] = [];
      const supportedExtensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.png', '.jpg', '.jpeg', '.txt'];

      for await (const entry of this.directoryHandle.values()) {
        if (entry.kind === 'file') {
          const lowerName = entry.name.toLowerCase();
          const hasSupportedExt = supportedExtensions.some(ext => lowerName.endsWith(ext));
          
          if (hasSupportedExt && !lowerName.startsWith('~$') && !lowerName.startsWith('.')) {
            const file = await entry.getFile();
            currentFiles.push({
              name: file.name,
              size: file.size,
              lastModified: file.lastModified,
              detectedAt: Date.now()
            });
          }
        }
      }

      // If initial baseline, just store all current files so we only alert on genuinely new additions
      if (isInitialBaseline) {
        currentFiles.forEach(f => {
          seen[f.name] = f;
        });
        this.saveSeenFiles(seen);
        this.isScanning = false;
        return 0;
      }

      // Check for newly added documents
      for (const file of currentFiles) {
        const existing = seen[file.name];
        const isNew = !existing;
        const isModified = existing && (file.lastModified - existing.lastModified > 3000);

        if (isNew || isModified) {
          seen[file.name] = file;
          newFilesFound++;

          // Trigger intelligent conversion recommendation notification
          this.alertNewFileDetected(file.name);
        }
      }

      if (newFilesFound > 0) {
        this.saveSeenFiles(seen);
      }
    } catch (e) {
      console.warn('Intelligent file scanner notice:', e);
    } finally {
      this.isScanning = false;
    }

    return newFilesFound;
  }

  private alertNewFileDetected(fileName: string) {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isWord = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');
    const isImage = fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg');
    const isPpt = fileName.toLowerCase().endsWith('.pptx') || fileName.toLowerCase().endsWith('.ppt');

    let actionPrompt = "Wifuza kuyihindura muri Word cyangwa PDF ngo uyinonosore?";
    if (isPdf) {
      actionPrompt = "Waba wifuza kuyihindura muri Word (.docx) ngo ukosore ibizamini cyangwa notes byoroshye?";
    } else if (isWord) {
      actionPrompt = "Waba wifuza kuyihindura muri PDF yujuje ubuziranenge bwa REB ngo uyisangize abanyeshuri?";
    } else if (isImage) {
      actionPrompt = "Waba wifuza guhuza aya mashusho akavamo igitabo cya PDF cy'amasomo?";
    } else if (isPpt) {
      actionPrompt = "Waba wifuza guhindura izi slides z'amasomo muri PDF yo gusoma byoroshye?";
    }

    notificationEngine.sendLockScreenNotification({
      title: `📄 Inyandiko Nshya: ${fileName}`,
      body: `Mwarimu, twabonye inyandiko nshya '${fileName}'. ${actionPrompt}`,
      tab: 'converter',
      tag: 'new-file-' + Date.now()
    });
  }
}

export const intelligentFileWatcher = new IntelligentFileWatcher();
