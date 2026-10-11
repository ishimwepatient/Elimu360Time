import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileDown, 
  FolderDown, 
  Archive, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Check, 
  Info,
  ExternalLink
} from 'lucide-react';
import { LessonPlanData } from '../../types';
import { 
  exportPlansToCombinedPdf, 
  exportPlansToCombinedDocx, 
  exportPlansToBulkFolderHelper, 
  exportPlansToBulkZipHelper 
} from '../../utils/combinedLessonPlanExport';
import { TacticalAdCard } from '../ads/TacticalAdCard';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlanData[];
  unitNumber?: string;
  unitTitle?: string;
  onSuccess?: (msg: string) => void;
}

type ExportChoice = 'combined-pdf' | 'combined-docx' | 'folder' | 'zip';

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  isOpen,
  onClose,
  plans,
  unitNumber = '1',
  unitTitle = 'Lesson_Plans',
  onSuccess
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportChoice>('combined-pdf');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [completedMsg, setCompletedMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setCompletedMsg('');
    setProgressStatus('Initializing export engine...');

    const cleanUnitTitle = (unitTitle || 'Lesson_Plans').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const folderName = `Unit_${unitNumber}_${cleanUnitTitle}`;

    try {
      if (selectedFormat === 'combined-pdf') {
        setProgressStatus('Formatting single combined PDF with each plan on its page...');
        const filename = await exportPlansToCombinedPdf(plans, cleanUnitTitle, (cur, total) => {
          setProgressStatus(`Adding lesson plan ${cur} of ${total} to combined document...`);
        });
        const msg = `Successfully exported 1 combined PDF document (${plans.length} lesson plans, each on its page): ${filename}`;
        setCompletedMsg(msg);
        if (onSuccess) onSuccess(msg);
      } else if (selectedFormat === 'combined-docx') {
        setProgressStatus('Generating combined Word (.docx) document with page breaks...');
        const filename = await exportPlansToCombinedDocx(plans, cleanUnitTitle, (cur, total) => {
          setProgressStatus(`Compiling lesson plan ${cur} of ${total} into editable Word file...`);
        });
        const msg = `Successfully exported 1 combined Word DOCX file (${plans.length} lesson plans with page breaks): ${filename}`;
        setCompletedMsg(msg);
        if (onSuccess) onSuccess(msg);
      } else if (selectedFormat === 'folder') {
        setProgressStatus(`Preparing computer folder "${folderName}" without unzipping...`);
        const result = await exportPlansToBulkFolderHelper(plans, folderName, (cur, total) => {
          setProgressStatus(`Saving lesson plan ${cur} of ${total} directly to folder...`);
        });
        if (result.success) {
          setCompletedMsg(result.message);
          if (onSuccess) onSuccess(result.message);
        } else if (result.mode === 'cancelled') {
          setProgressStatus('Folder selection cancelled.');
        }
      } else if (selectedFormat === 'zip') {
        setProgressStatus('Creating compressed ZIP archive of all lesson plan PDFs...');
        const zipName = `${folderName}.zip`;
        await exportPlansToBulkZipHelper(plans, zipName);
        const msg = `Downloaded ZIP bundle containing ${plans.length} lesson plan PDFs: ${zipName}`;
        setCompletedMsg(msg);
        if (onSuccess) onSuccess(msg);
      }
    } catch (err: any) {
      console.error('Export execution error:', err);
      setProgressStatus('Export encountered an error. Please try another format.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative space-y-6 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> REB Export Center
            </span>
            <span className="text-xs font-bold text-slate-400">
              Unit {unitNumber} • {plans.length} Lesson Plans
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            Confirm Lesson Plan Export
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Choose how you want to export your <strong>{plans.length} lesson plans</strong>. You can export them all as <strong>one combined file</strong> where each lesson is placed on its own page, or export as separate individual files.
          </p>
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Select Preferred Export Format:
          </label>

          {/* Group 1: Single Combined File (All in 1 Document) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Option 1: Single Combined File (All in 1 Document)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Recommended for Printing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1A: Combined PDF */}
              <div
                onClick={() => setSelectedFormat('combined-pdf')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'combined-pdf'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-black text-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Combined PDF</h4>
                      <span className="text-[10px] text-slate-400">1 Document (.pdf)</span>
                    </div>
                  </div>
                  {selectedFormat === 'combined-pdf' && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-snug">
                  All {plans.length} lessons combined in order. Each lesson plan starts on its own fresh page.
                </p>
              </div>

              {/* Option 1B: Combined DOCX */}
              <div
                onClick={() => setSelectedFormat('combined-docx')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'combined-docx'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                      DOCX
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Combined Word DOCX</h4>
                      <span className="text-[10px] text-slate-400">Editable (.docx)</span>
                    </div>
                  </div>
                  {selectedFormat === 'combined-docx' && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-snug">
                  Fully editable Microsoft Word document. Separated by automatic page breaks for each plan.
                </p>
              </div>
            </div>
          </div>

          {/* Group 2: Separate Individual Files */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FolderDown className="w-3.5 h-3.5 text-slate-400" /> Option 2: Separate Individual Files (Bulk)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 2A: Computer Folder */}
              <div
                onClick={() => setSelectedFormat('folder')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'folder'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                      DIR
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Unit Computer Folder</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">No unzipping required</span>
                    </div>
                  </div>
                  {selectedFormat === 'folder' && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-snug">
                  Creates a real folder on your device named after the Unit with {plans.length} individual PDFs inside.
                </p>
              </div>

              {/* Option 2B: ZIP Archive */}
              <div
                onClick={() => setSelectedFormat('zip')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === 'zip'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                      ZIP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">ZIP Bundle Archive</h4>
                      <span className="text-[10px] text-slate-400">Compressed (.zip)</span>
                    </div>
                  </div>
                  {selectedFormat === 'zip' && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-snug">
                  Standard compressed ZIP archive containing all {plans.length} PDFs. Requires unzipping.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Ad Placement 1: Discrete, engaging educational offer right inside export popup */}
        <div className="pt-1">
          <TacticalAdCard slotIndex={0} compact={false} />
        </div>

        {/* Progress or Completion Banner */}
        {isExporting && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-400" />
            <span>{progressStatus || 'Processing documents...'}</span>
          </div>
        )}

        {completedMsg && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block">Download Complete:</strong>
              <span>{completedMsg}</span>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            {completedMsg ? 'Close Window' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting Plans...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 fill-slate-950" />
                <span>Export {plans.length} Lesson Plans Now</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
