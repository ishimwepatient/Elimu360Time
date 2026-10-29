import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  FileText, 
  FileDown, 
  Layers, 
  CheckSquare, 
  Square, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  Download, 
  ArrowRight,
  Filter,
  Sparkles,
  Calendar,
  School,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useElimu } from '../../context/ElimuContext';
import { LessonPlanData } from '../../types';
import { 
  renderLessonPlanToPdfDoc,
  exportPlansToCombinedDocx
} from '../../utils/combinedLessonPlanExport';
import { BulkExportModal } from './BulkExportModal';
import { LessonPlanViewModal } from './LessonPlanViewModal';

interface SavedPlansReExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLibrary?: () => void;
  onLoadPlanIntoGenerator?: (plan: LessonPlanData) => void;
}

export const SavedPlansReExportModal: React.FC<SavedPlansReExportModalProps> = ({
  isOpen,
  onClose,
  onNavigateToLibrary,
  onLoadPlanIntoGenerator
}) => {
  const { savedLessonPlans, plansLoading } = useElimu();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Selection for bulk actions
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  
  // Single plan modal / state
  const [viewingPlan, setViewingPlan] = useState<LessonPlanData | null>(null);
  const [exportingSingleId, setExportingSingleId] = useState<string | null>(null);
  const [exportingSingleFormat, setExportingSingleFormat] = useState<'pdf' | 'docx' | null>(null);

  // Bulk export modal state
  const [showBulkExportModal, setShowBulkExportModal] = useState<boolean>(false);
  const [bulkExportPlansList, setBulkExportPlansList] = useState<LessonPlanData[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Extract unique subjects & classes
  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(savedLessonPlans.map(p => p.subject).filter(Boolean)));
  }, [savedLessonPlans]);

  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(savedLessonPlans.map(p => p.classLevel).filter(Boolean)));
  }, [savedLessonPlans]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return savedLessonPlans.filter(p => {
      const matchesSearch = 
        !searchTerm.trim() ||
        p.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.unitTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.classLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = selectedSubject === 'ALL' || p.subject === selectedSubject;
      const matchesClass = selectedClass === 'ALL' || p.classLevel === selectedClass;

      return matchesSearch && matchesSubject && matchesClass;
    });
  }, [savedLessonPlans, searchTerm, selectedSubject, selectedClass]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelectPlan = (id: string) => {
    setSelectedPlanIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedPlanIds.length === filteredPlans.length && filteredPlans.length > 0) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(filteredPlans.map(p => p.id));
    }
  };

  // Single Plan Export to PDF
  const handleExportSinglePlanPdf = async (plan: LessonPlanData) => {
    setExportingSingleId(plan.id);
    setExportingSingleFormat('pdf');
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      renderLessonPlanToPdfDoc(doc, plan, true);
      const safeUnit = (plan.unitNumber || '1').replace(/[^a-zA-Z0-9]/g, '');
      const safeTitle = (plan.lessonTitle || 'Lesson').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 35);
      const filename = `LessonPlan_Unit${safeUnit}_${safeTitle}.pdf`;
      doc.save(filename);
      setStatusMessage({ text: `Downloaded official REB PDF: ${filename}`, type: 'success' });
    } catch (err) {
      console.error('Single PDF Export Error:', err);
      setStatusMessage({ text: 'Failed to download PDF. Please try again.', type: 'error' });
    } finally {
      setExportingSingleId(null);
      setExportingSingleFormat(null);
    }
  };

  // Single Plan Export to Word DOCX
  const handleExportSinglePlanDocx = async (plan: LessonPlanData) => {
    setExportingSingleId(plan.id);
    setExportingSingleFormat('docx');
    try {
      const safeUnit = (plan.unitNumber || '1').replace(/[^a-zA-Z0-9]/g, '');
      const safeTitle = (plan.lessonTitle || 'Lesson').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 35);
      const filename = await exportPlansToCombinedDocx([plan], `Unit_${safeUnit}_${safeTitle}`);
      setStatusMessage({ text: `Downloaded editable Word file (.docx): ${filename}`, type: 'success' });
    } catch (err) {
      console.error('Single DOCX Export Error:', err);
      setStatusMessage({ text: 'Failed to download Word document.', type: 'error' });
    } finally {
      setExportingSingleId(null);
      setExportingSingleFormat(null);
    }
  };

  // Trigger Bulk Export modal for chosen plans
  const handleOpenBulkExportModal = (plansToExport: LessonPlanData[]) => {
    if (plansToExport.length === 0) return;
    setBulkExportPlansList(plansToExport);
    setShowBulkExportModal(true);
  };

  // Load a plan directly into the generator form
  const handleLoadIntoGenerator = (plan: LessonPlanData) => {
    if (onLoadPlanIntoGenerator) {
      onLoadPlanIntoGenerator(plan);
      setStatusMessage({ text: `Loaded "${plan.lessonTitle}" into Lesson Plan Generator!`, type: 'success' });
      onClose();
    }
  };

  const selectedPlans = filteredPlans.filter(p => selectedPlanIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                  Reach Created Lesson Plans & Re-Export
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {savedLessonPlans.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Export again as individual files (PDF / Word) or in bulk (Combined 1 Document, Computer Folder, or ZIP).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToLibrary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToLibrary();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Go to full Saved Plans Library page"
              >
                <span>Full Cloud Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Notification */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs font-bold animate-fade-in ${
            statusMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' :
            statusMessage.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-300' :
            'bg-sky-950/80 border-sky-800 text-sky-300'
          }`}>
            <span>{statusMessage.text}</span>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/60 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search plans by topic, unit, subject, or class..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Subject Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Subjects ({uniqueSubjects.length})</option>
                {uniqueSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Classes ({uniqueClasses.length})</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Action Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition"
              >
                {selectedPlanIds.length === filteredPlans.length && filteredPlans.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {selectedPlanIds.length === filteredPlans.length && filteredPlans.length > 0
                    ? 'Deselect All'
                    : `Select All (${filteredPlans.length})`}
                </span>
              </button>

              {selectedPlanIds.length > 0 && (
                <span className="text-xs font-semibold text-amber-400">
                  {selectedPlanIds.length} plans selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export Selected in Bulk */}
              {selectedPlanIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleOpenBulkExportModal(selectedPlans)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Layers className="w-4 h-4 fill-slate-950" />
                  <span>Bulk Export Selected ({selectedPlanIds.length}) Plans</span>
                </button>
              ) : (
                filteredPlans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleOpenBulkExportModal(filteredPlans)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Export All Filtered ({filteredPlans.length}) in Bulk</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Plans List Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {plansLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading created lesson plans...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                {savedLessonPlans.length === 0 
                  ? 'No Created Lesson Plans Found Yet' 
                  : 'No Plans Match Your Search Filters'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {savedLessonPlans.length === 0
                  ? 'Plans you create using the AI Generator are automatically saved locally on your device for instant re-export anytime.'
                  : 'Try adjusting your search keywords or clearing subject/class filters.'}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSubject('ALL');
                    setSelectedClass('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPlans.map((plan) => {
                const isSelected = selectedPlanIds.includes(plan.id);
                const isBusyPdf = exportingSingleId === plan.id && exportingSingleFormat === 'pdf';
                const isBusyDocx = exportingSingleId === plan.id && exportingSingleFormat === 'docx';

                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Row: Checkbox, Unit & Subject Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectPlan(plan.id)}
                            className="cursor-pointer text-slate-400 hover:text-amber-400 transition"
                            title={isSelected ? 'Deselect plan' : 'Select plan for bulk export'}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/20">
                            Unit {plan.unitNumber || '1'} • {plan.lessonNumber || '1'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {plan.classLevel || 'P1'}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {plan.date}
                        </span>
                      </div>

                      {/* Lesson Title */}
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {plan.lessonTitle || 'Untitled Lesson'}
                      </h4>

                      {/* Unit Topic & Details */}
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        <strong>Topic:</strong> {plan.unitTitle || 'General Unit'}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="text-amber-400 font-medium">{plan.subject}</span>
                        <span>•</span>
                        <span>{plan.duration || '40 min'}</span>
                        {plan.teacherName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 truncate max-w-[120px]">{plan.teacherName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons: Single PDF, Single Word, View, Load to Editor */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Single PDF */}
                        <button
                          type="button"
                          onClick={() => handleExportSinglePlanPdf(plan)}
                          disabled={isBusyPdf}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Export single plan as official REB A4 PDF"
                        >
                          {isBusyPdf ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3 text-amber-400" />}
                          <span>PDF</span>
                        </button>

                        {/* Single DOCX Word */}
                        <button
                          type="button"
                          onClick={() => handleExportSinglePlanDocx(plan)}
                          disabled={isBusyDocx}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-900/50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Export single plan as editable Word document (.docx)"
                        >
                          {isBusyDocx ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3 text-blue-400" />}
                          <span>Word</span>
                        </button>

                        {/* Preview */}
                        <button
                          type="button"
                          onClick={() => setViewingPlan(plan)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                          title="View full table preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Load into Generator Form */}
                      {onLoadPlanIntoGenerator && (
                        <button
                          type="button"
                          onClick={() => handleLoadIntoGenerator(plan)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                          title="Load this plan's topic and settings into the generator editor to adapt or create new lessons"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Load in Editor</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>
              All forms supported: <strong>Combined 1 Document (PDF & Word)</strong>, <strong>Computer Folder</strong>, and <strong>ZIP Bundle</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {filteredPlans.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenBulkExportModal(selectedPlanIds.length > 0 ? selectedPlans : filteredPlans)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 fill-slate-950" />
                <span>Bulk Export Options ({selectedPlanIds.length > 0 ? selectedPlanIds.length : filteredPlans.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Funga (Close)
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Export Modal configured with chosen plans */}
      <BulkExportModal
        isOpen={showBulkExportModal}
        onClose={() => setShowBulkExportModal(false)}
        plans={bulkExportPlansList}
        unitNumber={bulkExportPlansList[0]?.unitNumber || '1'}
        unitTitle={bulkExportPlansList[0]?.unitTitle || 'Saved_Lesson_Plans'}
        onSuccess={(msg) => setStatusMessage({ text: msg, type: 'success' })}
      />

      {/* Plan Preview View Modal */}
      {viewingPlan && (
        <LessonPlanViewModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
        />
      )}
    </div>
  );
};
