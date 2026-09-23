import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  AlertCircle,
  HelpCircle,
  Archive,
  BookOpen,
  Layers
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { ClassRoom, Student, StudentReportCard, ArchivedClass } from '../../types';
import { OfficialRwandanReportModal } from './OfficialRwandanReportModal';
import { 
  generateClassReportCards, 
  downloadClassReportsPdf, 
  downloadSingleStudentPdf,
  validateReportGenerationPrerequisites
} from '../../utils/reportCardGenerator';

interface GeneratedReportRecord {
  id: string;
  generatedOn: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  type: 'Termly / Progressive Report' | 'Midterm Report' | 'Annual Report' | '2nd Sitting Test Report' | 'Special / Test Report' | string;
  specialAssessmentType?: string;
  downloads: number;
}

export const ReportsGeneration: React.FC = () => {
  const { 
    currentUser,
    activeSchool, 
    classes, 
    students, 
    grades, 
    subjects,
    setCurrentView,
    archivedClasses,
    registeredAcademicYears
  } = useElimu();

  // Navigation tabs for Current Year vs Past Academic Archives
  const [activeSubTab, setActiveSubTab] = useState<'CURRENT_YEAR' | 'PAST_ARCHIVES'>('CURRENT_YEAR');

  // Generator form state
  const [reportType, setReportType] = useState<string>('Termly / Progressive Report');
  const [specialAssessmentType, setSpecialAssessmentType] = useState<string>('End of Unit Test');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>(activeSchool.active_term || 'Term 1');
  const [notificationOption, setNotificationOption] = useState<'NOTIFY' | 'DONT_NOTIFY'>('DONT_NOTIFY');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [includeDecisions, setIncludeDecisions] = useState<boolean>(true);

  // Deliberation Configuration State
  const [promotionCutoff, setPromotionCutoff] = useState<number>(65);
  const [secondSittingEnabled, setSecondSittingEnabled] = useState<boolean>(true);
  const [secondSittingMinCutoff, setSecondSittingMinCutoff] = useState<number>(50);
  const [studentOverrides, setStudentOverrides] = useState<Record<string, 'AUTOMATIC' | 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE'>>({});

  // Archive retrieval states
  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>('');
  const [selectedArchiveClassId, setSelectedArchiveClassId] = useState<string>('');
  const [archiveSearchTerm, setArchiveSearchTerm] = useState<string>('');

  // Keep selectedTerm in sync with school active term by default
  React.useEffect(() => {
    if (activeSchool.active_term) {
      setSelectedTerm(activeSchool.active_term);
    }
  }, [activeSchool.active_term]);

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal view for preview/print
  const [activeReportModal, setActiveReportModal] = useState<{
    report: StudentReportCard;
    type: 'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL';
  } | null>(null);

  // STRICT ACCESS RESTRICTION: Super Admin and Teachers cannot generate official report cards
  if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'TEACHER') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/20">
            Institutional Policy Constraint
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Academic Report Generation Restricted
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            {currentUser.role === 'TEACHER' ? (
              <>
                Teachers are strictly authorized to submit marks and track student assessments in their assigned subjects. Generating official institutional report cards is strictly reserved for the <strong>Director of Studies (DOS)</strong> and <strong>School Director / Headmaster</strong>.
              </>
            ) : (
              <>
                As the Super Admin, your authority is strictly scoped to platform infrastructure, multi-tenant school onboarding, and master account purge operations. Generating official student report cards is sovereign to the <strong>Director of Studies (DOS)</strong> and <strong>School Director / Headmaster</strong> of {activeSchool.name}.
              </>
            )}
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('DASHBOARD')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter active classes strictly registered for this school
  const activeClasses = useMemo(() => {
    return classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all');
  }, [classes, activeSchool.id]);

  // Filter active students strictly registered for this school
  const activeStudents = useMemo(() => {
    return students.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
  }, [students, activeSchool.id]);

  // Available students for chosen class
  const classStudents = useMemo(() => {
    if (selectedClassId === 'ALL') return activeStudents;
    return activeStudents.filter(s => s.class_id === selectedClassId);
  }, [selectedClassId, activeStudents]);

  // Extract list of explicitly archived academic years (from deliberated classes)
  const archivedYears = useMemo(() => {
    const yearsFromArchives = archivedClasses.map(ac => ac.academic_year);
    const combined = Array.from(new Set(yearsFromArchives.filter(Boolean)));
    return combined.sort((a, b) => b.localeCompare(a));
  }, [archivedClasses]);

  // Auto-select latest archived year if none chosen
  React.useEffect(() => {
    if (!selectedArchiveYear && archivedYears.length > 0) {
      setSelectedArchiveYear(archivedYears[0]);
    }
  }, [archivedYears, selectedArchiveYear]);

  // Extract classes explicitly archived for the chosen academic year (strictly deliberated classes)
  const archivedClassesForYear = useMemo(() => {
    if (!selectedArchiveYear) return [];
    return archivedClasses.filter(ac => ac.academic_year === selectedArchiveYear);
  }, [archivedClasses, selectedArchiveYear]);

  // Auto-select first class when archivedClassesForYear changes
  React.useEffect(() => {
    if (archivedClassesForYear.length > 0) {
      const exists = archivedClassesForYear.some(ac => ac.class_id === selectedArchiveClassId);
      if (!exists) {
        setSelectedArchiveClassId(archivedClassesForYear[0].class_id);
      }
    } else {
      setSelectedArchiveClassId('');
    }
  }, [archivedClassesForYear, selectedArchiveClassId]);

  // Locate the specific archived class record
  const activeArchivedClass = useMemo(() => {
    return archivedClassesForYear.find(ac => ac.class_id === selectedArchiveClassId);
  }, [archivedClassesForYear, selectedArchiveClassId]);

  // Filter archived student list based on user search
  const filteredArchivedReports = useMemo(() => {
    if (!activeArchivedClass) return [];
    return activeArchivedClass.reports.filter(rep => {
      const name = `${rep.student.first_name} ${rep.student.last_name}`.toLowerCase();
      const reg = (rep.student.registration_number || '').toLowerCase();
      return name.includes(archiveSearchTerm.toLowerCase()) || reg.includes(archiveSearchTerm.toLowerCase());
    });
  }, [activeArchivedClass, archiveSearchTerm]);

  // Handle entire class archived report PDF compilation
  const handleDownloadArchivedClassPdf = async () => {
    if (!activeArchivedClass) return;
    setIsGenerating(true);
    setProgressStatus(`Compiling archived annual reports for class "${activeArchivedClass.class_name}"...`);
    try {
      const mockClassRoom = classes.find(c => c.id === activeArchivedClass.class_id) || {
        id: activeArchivedClass.class_id,
        name: activeArchivedClass.class_name,
        stream: 'A',
        level_name: 'Secondary',
        school_id: activeSchool.id
      } as ClassRoom;

      await downloadClassReportsPdf({
        classRoom: mockClassRoom,
        term: 'Term 3',
        reports: activeArchivedClass.reports,
        school: activeSchool,
        reportMode: 'ANNUAL',
        onProgress: (current, total) => {
          setProgressStatus(`Compiling PDF: Archived Student ${current} of ${total}...`);
        }
      });
      setGenerationSuccess(`Archived annual reports for class ${activeArchivedClass.class_name} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      setGenerationError('Failed to generate PDF for archived class.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  // Handle single student archived report PDF compilation
  const handleDownloadArchivedSinglePdf = async (report: StudentReportCard) => {
    setIsGenerating(true);
    setProgressStatus(`Compiling archived annual report for ${report.student.first_name}...`);
    try {
      await downloadSingleStudentPdf({
        report,
        school: activeSchool
      });
      setGenerationSuccess(`Archived annual report for ${report.student.first_name} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      setGenerationError('Failed to generate PDF for archived student.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  // Initial Seed Recent Reports
  const [recentReports, setRecentReports] = useState<GeneratedReportRecord[]>([]);

  // Map user reportType string to generator enum
  const getMappedReportType = (typeStr: string): 'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL' => {
    if (typeStr.includes('Midterm')) return 'MIDTERM';
    if (typeStr.includes('Annual')) return 'ANNUAL';
    if (typeStr.includes('Special') || typeStr.includes('2nd Sitting')) return 'SPECIAL';
    return 'PROGRESSIVE';
  };

  // Helper to compile report cards for a class or student
  const getCompiledCards = (classId: string, studentId: string, overrideType?: string, overrideSpecialAssessment?: string) => {
    if (activeClasses.length === 0 || activeStudents.length === 0) {
      return { targetClass: activeClasses[0], targetStudents: [], cards: [] };
    }

    const targetClass = classId === 'ALL'
      ? activeClasses[0]
      : (activeClasses.find(c => c.id === classId) || activeClasses[0]);

    let targetStudents = activeStudents;
    if (studentId !== 'ALL') {
      targetStudents = activeStudents.filter(s => s.id === studentId);
    } else if (classId !== 'ALL') {
      targetStudents = activeStudents.filter(s => s.class_id === classId);
    }
    if (targetStudents.length === 0) {
      return { targetClass, targetStudents: [], cards: [] };
    }

    const activeSubjects = subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
    const effectiveReportType = overrideType || reportType;
    const mapped = getMappedReportType(effectiveReportType);
    const resolvedSpecialAssessment = overrideSpecialAssessment || (reportType.includes('2nd Sitting') ? '2nd Sitting' : specialAssessmentType);

    const cards = generateClassReportCards({
      selectedClass: targetClass,
      students: targetStudents,
      grades: grades,
      subjects: activeSubjects,
      term: selectedTerm,
      academicYear: activeSchool.active_academic_year || '2026',
      reportMode: mapped === 'ANNUAL' ? 'ANNUAL' : 'TERMINAL',
      reportType: mapped,
      specialAssessmentType: resolvedSpecialAssessment,
      school: activeSchool,
      includeDecisions: includeDecisions,
      hideDecisions: !includeDecisions,
      deliberationSettings: {
        promotionCutoff,
        secondSittingEnabled,
        secondSittingMinCutoff,
        studentOverrides
      }
    });

    return { targetClass, targetStudents, cards };
  };

  // Handle Generate: Direct automatic PDF download with no popup
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerationError(null);
    setGenerationSuccess(null);

    // 1. Determine target class
    const targetClass = selectedClassId === 'ALL' 
    ? activeClasses[0] 
    : activeClasses.find(c => c.id === selectedClassId);

    if (!targetClass) {
      setGenerationError('Report Generation Blocked: Please select a valid class.');
      return;
    }

    // 2. Validate prerequisites strictly with mathematical rules
    const validation = validateReportGenerationPrerequisites({
      reportType: (reportType.includes('2nd Sitting') ? 'Special / Test Report' : reportType) as 'Termly / Progressive Report' | 'Midterm Report' | 'Annual Report' | 'Special / Test Report',
      specialAssessmentType: reportType.includes('2nd Sitting') ? '2nd Sitting' : specialAssessmentType,
      selectedClass: targetClass,
      students: activeStudents,
      grades,
      term: selectedTerm,
      schoolId: activeSchool.id
    });

    if (!validation.isValid) {
      setGenerationError(validation.errorMessage || 'Report generation blocked due to prerequisite validation.');
      return;
    }

    setIsGenerating(true);
    setProgressStatus('Initializing official report compilation with Rwandan MINEDUC mathematical scaling...');

    try {
      const { cards } = getCompiledCards(selectedClassId, selectedStudentId);
      const clsName = selectedClassId === 'ALL' ? 'All' : (activeClasses.find(c => c.id === selectedClassId)?.name || 'P1');
      const chosenStudent = activeStudents.find(s => s.id === selectedStudentId);
      const stName = selectedStudentId === 'ALL' ? 'All' : (chosenStudent ? `${chosenStudent.first_name} ${chosenStudent.last_name} (${chosenStudent.registration_number})` : 'All');

      if (selectedStudentId !== 'ALL' && cards.length > 0) {
        setProgressStatus(`Compiling official report card for ${stName}...`);
        await downloadSingleStudentPdf({
          report: cards[0],
          school: activeSchool
        });
      } else {
        await downloadClassReportsPdf({
          classRoom: targetClass,
          term: selectedTerm,
          reports: cards,
          school: activeSchool,
          reportMode: reportType.includes('Annual') ? 'ANNUAL' : 'TERMINAL',
          onProgress: (current, total) => {
            setProgressStatus(`Compiling PDF: Student ${current} of ${total} (Rank ${current})...`);
          }
        });
      }

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newRecord: GeneratedReportRecord = {
        id: `rep-${Date.now()}`,
        generatedOn: timestamp,
        classId: selectedClassId,
        className: clsName,
        studentId: selectedStudentId,
        studentName: stName,
        type: reportType,
        specialAssessmentType: reportType === 'Special / Test Report' ? specialAssessmentType : undefined,
        downloads: 1
      };

      setRecentReports(prev => [newRecord, ...prev]);
      setGenerationSuccess(`Official ${reportType} generated and downloaded as PDF for ${clsName} (${stName}) with proportional marks and verified ranking.`);

      setTimeout(() => setGenerationSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF reports:', err);
      setGenerationError('Failed to generate report cards. Please verify data integrity.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  // Live Template Preview for Director / DOS
  const handlePreviewTemplate = () => {
    const { cards } = getCompiledCards(selectedClassId === 'ALL' ? (activeClasses[0]?.id || 'cls-p1') : selectedClassId, selectedStudentId);
    if (cards.length > 0) {
      setActiveReportModal({
        report: cards[0],
        type: getMappedReportType(reportType)
      });
    }
  };

  // Handle Download from table: Direct automatic PDF download with no popup
  const handleDownload = async (rec: GeneratedReportRecord) => {
    setRecentReports(prev => prev.map(r => r.id === rec.id ? { ...r, downloads: r.downloads + 1 } : r));
    setIsGenerating(true);
    setProgressStatus(`Downloading ${rec.type} for ${rec.className}...`);

    try {
      const { targetClass, cards } = getCompiledCards(rec.classId, rec.studentId, rec.type, rec.specialAssessmentType);

      if (rec.studentId !== 'ALL' && cards.length > 0) {
        await downloadSingleStudentPdf({
          report: cards[0],
          school: activeSchool
        });
      } else {
        await downloadClassReportsPdf({
          classRoom: targetClass,
          term: activeSchool.active_term || 'Term 1',
          reports: cards,
          school: activeSchool,
          reportMode: rec.type.includes('Annual') ? 'ANNUAL' : 'TERMINAL',
          onProgress: (current, total) => {
            setProgressStatus(`Rendering PDF: Student ${current} of ${total} (Rank ${current})...`);
          }
        });
      }
    } catch (err) {
      console.error('Error downloading report PDF:', err);
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  // Optional online preview modal for inspection
  const handlePreviewOnline = (rec: GeneratedReportRecord) => {
    const { cards } = getCompiledCards(rec.classId, rec.studentId, rec.type, rec.specialAssessmentType);
    if (cards.length > 0) {
      setActiveReportModal({
        report: cards[0],
        type: getMappedReportType(rec.type)
      });
    }
  };

  // Delete
  const handleDeleteReport = (id: string) => {
    setRecentReports(prev => prev.filter(r => r.id !== id));
    setDeleteConfirmId(null);
  };

  // Filtered & Paginated Reports
  const filteredReports = useMemo(() => {
    return recentReports.filter(r => 
      r.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.generatedOn.includes(searchTerm)
    );
  }, [recentReports, searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / recordsPerPage) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Academic Performance Engine · Reports Generation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide font-display mt-0.5">
            Reports Generation & Deliberation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Produce official Rwandan report cards (Midterm, Termly Progressive, Annual, and Special Test) with authentic MINEDUC mathematical scaling and verified signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Activation Code: <span className="font-mono font-bold text-blue-800">{activeSchool.code || 'U6CRG'}</span>
          </span>
        </div>
      </div>

      {progressStatus && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-3 shadow-sm animate-pulse">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <div className="font-semibold">{progressStatus}</div>
        </div>
      )}

      {generationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-950">Academic Integrity Rule Enforcement</div>
            <p className="text-rose-800 leading-relaxed">{generationError}</p>
          </div>
          <button onClick={() => setGenerationError(null)} className="ml-auto text-rose-700 hover:text-rose-950 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {generationSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{generationSuccess}</span>
          </div>
          <button onClick={() => setGenerationSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB SYSTEM & CONTENT ROUTING
          ========================================================================= */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('CURRENT_YEAR')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeSubTab === 'CURRENT_YEAR'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Current Operations ({activeSchool.active_academic_year || 'Current Year'})
        </button>
        <button
          onClick={() => setActiveSubTab('PAST_ARCHIVES')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'PAST_ARCHIVES'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Archive className="w-4 h-4 text-blue-600" />
          <span>Academic Archives</span>
          {archivedClasses.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
              {archivedClasses.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'CURRENT_YEAR' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Generate New Report (Spans 4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Generate New Report
            </h2>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              {/* Type Select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Report Type:
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value="Termly / Progressive Report">Termly / Progressive Report (M.T + EX)</option>
                  <option value="Midterm Report">Midterm Report (M.T Only)</option>
                  <option value="Annual Report">Annual Report (3 Terms Summary + Deliberation)</option>
                  <option value="2nd Sitting Test Report">2nd Sitting Test Report (Remedial / Retake)</option>
                  <option value="Special / Test Report">Special / Test Report</option>
                </select>
              </div>

              {/* Term Select */}
              {reportType !== 'Annual Report' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Term / Session:
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 font-mono"
                  >
                    {(registeredAcademicYears?.find(y => y.academic_year.toLowerCase() === activeSchool.active_academic_year?.toLowerCase())?.terms || ['Term 1', 'Term 2', 'Term 3']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Special Assessment Type Sub-Select */}
              {reportType === 'Special / Test Report' && (
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                  <label className="block text-blue-950 font-bold mb-1">
                    Assessment Sub-Type:
                  </label>
                  <select
                    value={specialAssessmentType}
                    onChange={(e) => setSpecialAssessmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-blue-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="End of Unit Test">End of Unit Test</option>
                    <option value="Quiz">Quiz</option>
                    <option value="2nd Sitting">2nd Sitting (Special Retake)</option>
                    <option value="Continuous Assessment Test (CAT)">Continuous Assessment Test (CAT)</option>
                  </select>
                  <span className="text-[10px] text-blue-700 block mt-1">
                    Only marks registered under this assessment type will be processed.
                  </span>
                </div>
              )}

              {/* Class Select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Class:
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentId('ALL');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Registered Classes</option>
                  {activeClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Students Select (Disambiguated by Code) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Students:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Students in Roster</option>
                  {classStudents.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.first_name} {st.last_name} ({st.registration_number || st.id.slice(0, 6)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deliberation Configuration Panel for Annual Reports */}
              {reportType === 'Annual Report' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="toggle-decisions"
                      type="checkbox"
                      checked={includeDecisions}
                      onChange={(e) => setIncludeDecisions(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="toggle-decisions" className="block text-amber-950 font-bold mb-0.5 cursor-pointer select-none text-xs">
                        Include Deliberation Decisions on Exported Reports
                      </label>
                      <p className="text-[10px] text-amber-800 leading-relaxed">
                        Prints official promotion/2nd sitting choices and council decisions directly on report cards.
                      </p>
                    </div>
                  </div>

                  {includeDecisions && (
                    <div className="pt-2 border-t border-amber-200/80 space-y-3 text-xs">
                      <div>
                        <label className="block text-amber-950 font-bold mb-1 text-[11px]">
                          Deliberation Mode:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSecondSittingEnabled(true)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                              secondSittingEnabled
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            3-Tier (Promoted, 2nd Sitting, Repeat)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSecondSittingEnabled(false)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                              !secondSittingEnabled
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            2-Tier (Promoted, Repeat Only)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1 text-[10.5px]">
                            Promoted Cutoff (x ≥ %):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={promotionCutoff}
                            onChange={(e) => setPromotionCutoff(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {secondSittingEnabled && (
                          <div>
                            <label className="block text-slate-800 font-bold mb-1 text-[10.5px]">
                              2nd Sitting Min %:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={promotionCutoff}
                              value={secondSittingMinCutoff}
                              onChange={(e) => setSecondSittingMinCutoff(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                            />
                          </div>
                        )}
                      </div>

                      <div className="bg-white/80 rounded-lg p-2 border border-amber-200 text-[10px] text-amber-900 space-y-0.5">
                        <span className="font-bold block">Current Criteria Rule:</span>
                        <span>
                          {secondSittingEnabled
                            ? `x ≥ ${promotionCutoff}% → Promoted | ${secondSittingMinCutoff}% ≤ x < ${promotionCutoff}% → 2nd Sitting | x < ${secondSittingMinCutoff}% → Repeat`
                            : `x ≥ ${promotionCutoff}% → Promoted | x < ${promotionCutoff}% → Repeat`}
                        </span>
                      </div>

                      {/* Student Deliberation Overrides Matrix */}
                      {classStudents.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-amber-950 font-bold text-[11px]">
                            Student Deliberation Overrides ({classStudents.length} Students):
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Apply &quot;Promote Anywhere&quot; or &quot;Repeat Anywhere&quot; (for poor conduct / discipline) to specific students.
                          </p>

                          <div className="max-h-40 overflow-y-auto border border-amber-200 rounded-lg bg-white divide-y divide-slate-100">
                            {classStudents.slice(0, 20).map(st => {
                              const currOverride = studentOverrides[st.id] || 'AUTOMATIC';
                              const conductScore = st.conduct_score ?? 40;

                              return (
                                <div key={st.id} className="p-2 flex items-center justify-between text-[10.5px] gap-2">
                                  <div className="truncate">
                                    <span className="font-bold text-slate-900">{st.first_name} {st.last_name}</span>
                                    <span className="text-[9.5px] text-slate-500 block">
                                      Conduct: <strong className={conductScore < 20 ? 'text-rose-600 font-bold' : 'text-slate-700'}>{conductScore}/40</strong>
                                    </span>
                                  </div>

                                  <select
                                    value={currOverride}
                                    onChange={(e) => {
                                      const val = e.target.value as 'AUTOMATIC' | 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE';
                                      setStudentOverrides(prev => ({
                                        ...prev,
                                        [st.id]: val
                                      }));
                                    }}
                                    className="px-2 py-1 rounded border border-slate-300 text-[10px] font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-amber-600 shrink-0"
                                  >
                                    <option value="AUTOMATIC">Automatic (Cutoffs)</option>
                                    <option value="PROMOTE_ANYWHERE">Promote Anywhere (Council)</option>
                                    <option value="REPEAT_ANYWHERE">Repeat Anywhere (Disciplinary)</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* When finish radio options */}
              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-2">
                  When finish:
                </label>
                <div className="space-y-2 text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="whenFinish"
                      value="NOTIFY"
                      checked={notificationOption === 'NOTIFY'}
                      onChange={() => setNotificationOption('NOTIFY')}
                      className="text-blue-600"
                    />
                    <span>Notify me via email with link to download</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="whenFinish"
                      value="DONT_NOTIFY"
                      checked={notificationOption === 'DONT_NOTIFY'}
                      onChange={() => setNotificationOption('DONT_NOTIFY')}
                      className="text-blue-600"
                    />
                    <span>Don&apos;t notify</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Compiling Marks & Positions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Download Official Report</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePreviewTemplate}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Preview Report Card Template</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>Rwandan Standard Mathematical Rules:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Assigned subjects only: unassigned subjects are strictly excluded.</li>
              <li>1 Period = 10 Max Marks (e.g. 5 periods = 50 Marks; 6 periods = 60 Marks).</li>
              <li>Marks entered out of 100 are automatically converted proportionally.</li>
              <li>Termly Progressive requires both M.T and EX recorded.</li>
              <li>Annual reports aggregate all 3 completed terms.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL: Recent Generated Reports (Spans 8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
              Recent Generated Reports
            </h2>

            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-slate-500">records per page</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search here..."
                    className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProgressStatus('Synchronizing verified examination records...');
                    setTimeout(() => setProgressStatus(null), 800);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sync verified reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Generated on</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-2 text-center">Downloads</th>
                  <th className="py-2.5 px-3 text-center">Download Reports</th>
                  <th className="py-2.5 px-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No generated reports match your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{rec.generatedOn}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{rec.className}</td>
                      <td className="py-2.5 px-3 font-medium">{rec.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {rec.type}
                        {rec.specialAssessmentType && (
                          <span className="block text-[10px] text-blue-600 font-semibold">({rec.specialAssessmentType})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600">{rec.downloads}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDownload(rec)}
                            title="Direct PDF Download"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </button>
                          <button
                            onClick={() => handlePreviewOnline(rec)}
                            title="Inspect in Modal"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {deleteConfirmId === rec.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDeleteReport(rec.id)}
                              className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded hover:bg-rose-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(rec.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredReports.length)} of {filteredReports.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Year Selector */}
          <div className="flex-1 space-y-1">
            <label className="block text-slate-750 font-bold text-xs uppercase tracking-wider">
              Select Past Academic Year:
            </label>
            <select
              value={selectedArchiveYear}
              onChange={(e) => {
                setSelectedArchiveYear(e.target.value);
                setSelectedArchiveClassId(''); // Reset class choice when year changes
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 font-mono text-xs"
            >
              <option value="">-- Choose Academic Year --</option>
              {archivedYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Class Selector */}
          <div className="flex-1 space-y-1">
            <label className="block text-slate-755 font-bold text-xs uppercase tracking-wider">
              Select Archived Class:
            </label>
            <select
              disabled={!selectedArchiveYear}
              value={selectedArchiveClassId}
              onChange={(e) => setSelectedArchiveClassId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Choose Class --</option>
              {archivedClassesForYear.map(ac => (
                <option key={ac.class_id} value={ac.class_id}>
                  {ac.class_name} ({ac.reports.length} Student Reports)
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedArchiveYear && (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Past Archives Searcher</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Select an archived Academic Year from the dropdown above to retrieve, view, and print historical annual report cards.
            </p>
            {archivedClasses.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200 inline-block font-medium">
                Notice: No classes have been archived yet. Go to the Deliberation Board under "Class & Session Manager" to archive classes at the end of an academic year.
              </div>
            )}
          </div>
        )}

        {selectedArchiveYear && !selectedArchiveClassId && (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
            <Layers className="w-10 h-10 text-blue-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Archived Year: {selectedArchiveYear}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Now select one of the classes that were archived during this year to view the full student list.
            </p>
          </div>
        )}

        {activeArchivedClass && (
          <div className="space-y-4">
            {/* Stats & Actions card */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-850">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Archived Academic Record</div>
                <h3 className="text-lg font-black text-white mt-1 uppercase">
                  {activeArchivedClass.class_name} · Year {activeArchivedClass.academic_year}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Archived on {new Date(activeArchivedClass.archived_at).toLocaleDateString()} · Contains {activeArchivedClass.reports.length} Student Profiles
                </p>
              </div>
              <button
                onClick={handleDownloadArchivedClassPdf}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete Class PDF</span>
              </button>
            </div>

            {/* Student Filtering */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search archived students by name or registration number..."
                  value={archiveSearchTerm}
                  onChange={(e) => setArchiveSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>
            </div>

            {/* Student archived reports table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Reg Number</th>
                    <th className="py-3 px-4 text-center">Class Rank</th>
                    <th className="py-3 px-4 text-center">Annual Average</th>
                    <th className="py-3 px-4 text-center">Decision</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredArchivedReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                        No students match the search query in this archived class.
                      </td>
                    </tr>
                  ) : (
                    filteredArchivedReports.map((rep) => (
                      <tr key={rep.student.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {rep.student.first_name} {rep.student.last_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {rep.student.registration_number || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-blue-700">
                          {(rep.annualSummary?.annualRank || rep.classRank)} / {activeArchivedClass.reports.length}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-900">
                          {(rep.annualSummary?.annualAveragePercentage || rep.overallAveragePercentage) ? (rep.annualSummary?.annualAveragePercentage || rep.overallAveragePercentage).toFixed(1) : 'N/A'}/100
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            (rep.annualSummary?.deliberationDecision || 'PROMOTED') === 'PROMOTED' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : (rep.annualSummary?.deliberationDecision || 'PROMOTED') === 'RETAINED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {rep.annualSummary?.deliberationDecision || 'PROMOTED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveReportModal({ report: rep, type: 'ANNUAL' })}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleDownloadArchivedSinglePdf(rep)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-blue-100"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Official Rwandan Report Modal (Preview / Print) */}
      {activeReportModal && (
        <OfficialRwandanReportModal
          report={activeReportModal.report}
          school={activeSchool}
          reportType={activeReportModal.type}
          onClose={() => setActiveReportModal(null)}
        />
      )}

    </div>
  );
};
