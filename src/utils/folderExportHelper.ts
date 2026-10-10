/**
 * Folder Export Helper for Bulk Lesson Plans
 * 
 * Supports:
 * 1. Native File System Access API (window.showDirectoryPicker)
 *    Creates an actual real directory on the user's hard drive / USB drive named after the Unit,
 *    and writes each Lesson Plan PDF directly inside it without any zipping.
 * 2. Sequential individual file download fallback for browsers that do not support showDirectoryPicker,
 *    or when the user cancels the directory picker.
 * 3. Standard ZIP option as an additional backup choice for users who prefer archives.
 */

import { saveAs } from 'file-saver';

export interface FileToSave {
  filename: string;
  blob: Blob;
}

export async function exportFilesToNativeFolder(
  folderName: string,
  files: FileToSave[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; mode: 'folder' | 'batch_download' | 'cancelled'; message: string }> {
  const sanitizedFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'REB_Lesson_Plans';

  // Check if showDirectoryPicker is supported in this browser
  if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
    try {
      // Prompt user to pick where to create/save the folder
      // @ts-ignore
      const parentDirHandle = await window.showDirectoryPicker({
        id: 'reb_lesson_plans_export',
        mode: 'readwrite',
        startIn: 'documents'
      });

      // Create a subfolder with the unit title
      const unitFolderHandle = await parentDirHandle.getDirectoryHandle(sanitizedFolderName, { create: true });

      // Save each PDF directly inside the folder
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileHandle = await unitFolderHandle.getFileHandle(file.filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.blob);
        await writable.close();
        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      }

      return {
        success: true,
        mode: 'folder',
        message: `Successfully created folder "${sanitizedFolderName}" with ${files.length} ready-to-use lesson plan PDFs inside it! No unzipping needed.`
      };
    } catch (err: any) {
      // User cancelled picker or browser denied permission
      if (err.name === 'AbortError') {
        return {
          success: false,
          mode: 'cancelled',
          message: 'Folder selection was cancelled. No files were written.'
        };
      }
      console.warn('showDirectoryPicker failed or denied, falling back to direct sequential downloads:', err);
      // Fall through to sequential download fallback
    }
  }

  // Fallback: Sequentially download each file with a brief interval so user browser saves them all in Downloads
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    saveAs(file.blob, `${sanitizedFolderName}_${file.filename}`);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    // Small stagger to prevent browser popup blockers from choking
    if (i < files.length - 1) {
      await new Promise(res => setTimeout(res, 350));
    }
  }

  return {
    success: true,
    mode: 'batch_download',
    message: `Directly downloaded ${files.length} lesson plan PDFs into your Downloads folder ready for opening without unzipping!`
  };
}
