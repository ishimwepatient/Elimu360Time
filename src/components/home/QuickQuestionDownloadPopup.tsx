import React, { useState } from 'react';
import { 
  X, 
  Download, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getQuickClassSubjectQuestions, 
  AVAILABLE_SUBJECTS, 
  AVAILABLE_CLASSES,
  AVAILABLE_YEARS 
} from '../../utils/kinyarwandaQuestionBankData';
import { exportQuestionsToDocx, exportQuestionsToPdf } from '../../utils/quizExportHelper';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';

interface QuickQuestionDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullQuestionBank?: () => void;
}

export const QuickQuestionDownloadPopup: React.FC<QuickQuestionDownloadPopupProps> = ({
  isOpen,
  onClose,
  onOpenFullQuestionBank
}) => {
  const { schoolProfile } = useElimu();
  const [selectedSubject, setSelectedSubject] = useState<string>('Ikinyarwanda');
  const [selectedClass, setSelectedClass] = useState<string>('P6');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (format: 'docx' | 'pdf') => {
    setIsExporting(true);
    setDownloadSuccess(null);

    try {
      const questions = getQuickClassSubjectQuestions(selectedClass, selectedSubject, selectedYear, 20);
      
      if (questions.length === 0) {
        alert('Nta bibazo byabonetse kuri iri somo n\'uyu mwaka. Gerageza guhitamo indi myaka.');
        setIsExporting(false);
        return;
      }

      const examOptions = {
        schoolName: schoolProfile.schoolName || 'GS Rwanda Amahoro',
        examTitle: `ISUZUMABUMENYI RYA ${selectedSubject.toUpperCase()} (${selectedYear})`,
        subject: selectedSubject,
        classLevel: selectedClass,
        term: 'Igihembwe cya 1 (Term 1)',
        duration: 'Iminota 60 (1h 00min)',
        includeAnswers: includeAnswers
      };

      if (format === 'docx') {
        await exportQuestionsToDocx(questions, examOptions);
        setDownloadSuccess(`Wamanuye neza ikizamini cya ${selectedSubject} (${selectedClass}) muri Microsoft Word!`);
      } else {
        exportQuestionsToPdf(questions, examOptions);
        setDownloadSuccess(`Wamanuye neza ikizamini cya ${selectedSubject} (${selectedClass}) muri PDF!`);
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Habaye ikosa mu kumanura ikizamini. Ongera ugerageze.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-sky-500/15 dark:from-amber-500/25 dark:via-emerald-500/25 dark:to-sky-500/25 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">
                  Manura Ibibazo n'Ibizamini
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  CBC Format
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Hitamo umwaka w'amashuri n'isomo kugira ngo umanure ikizamini cyuzuye ako kanya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Success notice */}
          {downloadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Step 1: Select Subject */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              1. Hitamo Isomo (Choose Subject)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_SUBJECTS.slice(0, 9).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition text-left truncate cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Class (Primary & Secondary) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              2. Hitamo Umwaka w'Amashuri (Choose Class Level)
            </label>
            
            {/* Primary Level */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Amashuri Abanza (Primary):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-2 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                      selectedClass === cls
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Level */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Amashuri Yisumbuye (Secondary O/A-Level):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-2 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                      selectedClass === cls
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Exam Year & Marking Scheme Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                Umwaka w'Ikizamini (Exam Year)
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>{y} Examination Paper</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-400 focus:ring-amber-500 cursor-pointer"
                />
                <span>Shyiraho Ibisubizo n'Ikosora (With Marking Scheme)</span>
              </label>
            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload('docx')}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Manura muri Microsoft Word (.docx)</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload('pdf')}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Manura muri PDF Doc</span>
            </button>
          </div>

          {/* Required Ads Section Placed Near the Download Form */}
          <div className="pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-2 text-center">
                Educational Sponsor & Sponsored Partner
              </span>
              <AdsterraNativeBanner />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            REB CBC Standard Exam Format
          </span>
          {onOpenFullQuestionBank && (
            <button
              onClick={() => {
                onClose();
                onOpenFullQuestionBank();
              }}
              className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Fungura Ikigega Cyose cy'Ibibazo (3,000+)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
