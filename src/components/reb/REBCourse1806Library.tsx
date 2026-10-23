import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  Calendar,
  Award,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  Share2,
  Copy,
  Check,
  AlertCircle,
  School,
  Play,
  Square,
  CheckSquare,
  FolderArchive,
  ListPlus,
  Loader2
} from 'lucide-react';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';
import { 
  downloadREBBookDirectly, 
  openDirectREBLink, 
  generateBrandedCoverPdf,
  compileAndDownloadBatchREBBooks 
} from '../../utils/directBookGenerator';
import { REB_OFFICIAL_CATALOG, REBBookMetadata } from '../../utils/rebBooksCatalog';

export const REBCourse1806Library: React.FC = () => {
  const { schoolProfile } = useElimu();
  const [activeTab, setActiveTab] = useState<'catalog' | 'portal'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Multi-book selection state
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());

  // Concurrent per-book downloading tracking map (allows multiple books to download simultaneously!)
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, { message: string; percent: number }>>({});

  // Batch download progress modal / banner state
  const [batchProgress, setBatchProgress] = useState<{
    active: boolean;
    current: number;
    total: number;
    currentTitle: string;
    stepMessage: string;
    percent: number;
  } | null>(null);

  const [isGeneratingSow, setIsGeneratingSow] = useState<string | null>(null);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [copiedBookId, setCopiedBookId] = useState<string | null>(null);

  // Pagination State for displaying a compact curated list of some few books
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Preview Modal State
  const [previewBook, setPreviewBook] = useState<REBBookMetadata | null>(null);

  const filteredItems = REB_OFFICIAL_CATALOG.filter(item => {
    if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
    if (selectedClass !== 'ALL' && item.classGrade !== selectedClass) return false;
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    if (selectedSubject !== 'ALL' && item.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.classGrade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Extract unique subjects for filtering
  const availableSubjects = Array.from(new Set(REB_OFFICIAL_CATALOG.map(b => b.subject))).sort();

  // Selection toggle handlers
  const handleToggleSelectBook = (id: string) => {
    setSelectedBookIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedBookIds(new Set(filteredItems.map(b => b.id)));
  };

  const handleClearSelection = () => {
    setSelectedBookIds(new Set());
  };

  const handleSelectByClass = (classGrade: string) => {
    const classBooks = REB_OFFICIAL_CATALOG.filter(b => b.classGrade === classGrade);
    setSelectedBookIds(new Set(classBooks.map(b => b.id)));
  };

  /**
   * DIRECT BOOK DOWNLOAD HANDLER (Non-blocking & Concurrent)
   * Allows teachers to click download on multiple books in parallel!
   */
  const handleDirectDownloadBook = async (book: REBBookMetadata) => {
    setDownloadProgressMap(prev => ({
      ...prev,
      [book.id]: { message: 'Kureba niba gihari...', percent: 10 }
    }));
    setDownloadSuccessNotice(null);

    try {
      const res = await downloadREBBookDirectly(
        book,
        schoolProfile?.schoolName,
        schoolProfile?.teacherName,
        schoolProfile?.academicYear,
        schoolProfile?.district,
        (msg, pct) => {
          setDownloadProgressMap(prev => ({
            ...prev,
            [book.id]: { message: msg, percent: pct }
          }));
        }
      );
      setDownloadSuccessNotice(res.message);
      setTimeout(() => setDownloadSuccessNotice(null), 6000);
    } catch (err: any) {
      console.error('Direct download error:', err);
      openDirectREBLink(book);
      setDownloadSuccessNotice(`Igitabo cya REB "${book.title}" cyatangiye kumanurwa kuri elearning.reb.rw!`);
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } finally {
      setDownloadProgressMap(prev => {
        const next = { ...prev };
        delete next[book.id];
        return next;
      });
    }
  };

  /**
   * BATCH DOWNLOAD HANDLER
   * Compiles multiple selected books into a single ZIP file or downloads in queue
   */
  const handleBatchDownload = async (asZip: boolean) => {
    const selectedBooks = REB_OFFICIAL_CATALOG.filter(b => selectedBookIds.has(b.id));
    if (selectedBooks.length === 0) return;

    setBatchProgress({
      active: true,
      current: 1,
      total: selectedBooks.length,
      currentTitle: selectedBooks[0].title,
      stepMessage: 'Gutangira kumanura ibitabo byatoranyijwe...',
      percent: 5
    });

    try {
      const res = await compileAndDownloadBatchREBBooks(
        selectedBooks,
        schoolProfile,
        (current, total, currentTitle, stepMessage, overallPercent) => {
          setBatchProgress({
            active: true,
            current,
            total,
            currentTitle,
            stepMessage,
            percent: overallPercent
          });
        },
        asZip
      );

      setDownloadSuccessNotice(res.message);
      setTimeout(() => setDownloadSuccessNotice(null), 8000);
      setSelectedBookIds(new Set());
    } catch (err: any) {
      console.error('Batch download error:', err);
      alert('Habaye ikibazo mu kumanura ibitabo byose hamwe. Ongera ugerageze.');
    } finally {
      setBatchProgress(null);
    }
  };

  /**
   * Direct Branded Cover Page PDF download
   */
  const handleDownloadCoverOnly = async (book: REBBookMetadata) => {
    try {
      const coverBytes = await generateBrandedCoverPdf(
        book,
        schoolProfile?.schoolName,
        schoolProfile?.teacherName,
        schoolProfile?.academicYear,
        schoolProfile?.district
      );
      const cleanName = book.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      saveAs(new Blob([coverBytes], { type: 'application/pdf' }), `Elimu360_Igifuniko_${book.classGrade}_${cleanName}.pdf`);
      setDownloadSuccessNotice(`Igifuniko cy'umwimerere cy'ishuri kuri "${book.title}" cyamanuwe neza muri PDF!`);
      setTimeout(() => setDownloadSuccessNotice(null), 4000);
    } catch (e) {
      console.error('Error generating cover:', e);
    }
  };

  /**
   * Direct Scheme of Work Word (.docx) generation & download
   */
  const handleDownloadSchemeOfWorkDocx = async (item: REBBookMetadata) => {
    setIsGeneratingSow(item.id);
    setDownloadSuccessNotice(null);

    try {
      const borderThin = { style: BorderStyle.SINGLE, size: 6, color: '64748B' };
      const cellBorders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

      const schoolNameVal = schoolProfile.schoolName || 'GS Rwanda Amahoro';
      const teacherNameVal = schoolProfile.teacherName || 'Umwarimu';
      const academicYearVal = schoolProfile.academicYear || '2026 - 2027';

      // Meta header table
      const metaTable = new Table({
        width: { size: 10400, type: WidthType.DXA },
        borders: cellBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5200, type: WidthType.DXA },
                shading: { fill: 'F1F5F9' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Ishuri (School): ', bold: true, size: 20 }),
                      new TextRun({ text: schoolNameVal, size: 20, bold: true })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Umwarimu (Teacher): ', bold: true, size: 18 }),
                      new TextRun({ text: teacherNameVal, size: 18 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 5200, type: WidthType.DXA },
                shading: { fill: 'F1F5F9' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Isomo (Subject): ${item.subject}`, bold: true, size: 20 })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Umwaka (Class): ${item.classGrade} | Umwaka w'Amashuri: ${academicYearVal}`, size: 18 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      // Scheme of work content rows
      const columnHeaders = [
        'Week / Dates',
        'Unit No & Title',
        'Key Unit Competence',
        'Periods',
        'Learning Objectives (Knowledge, Skills, Attitudes)',
        'Learning Activities & Methodology',
        'References & Materials'
      ];
      const columnWidths = [1200, 1600, 1800, 1000, 2000, 1600, 1200];

      const sampleWeeks = [
        {
          week: 'Week 1',
          unit: 'Unit 1: Diagnostic Baseline & Introduction',
          competence: 'Learners demonstrate foundational prerequisite mastery.',
          periods: '4 Periods',
          objectives: 'Knowledge: Identify key terms.\nSkills: Solve introductory problems.\nAttitudes: Collaborative teamwork.',
          activities: 'Diagnostic Think-Pair-Share and interactive plenary board modeling.',
          materials: `REB ${item.subject} Book (${item.classGrade}), flashcards.`
        },
        {
          week: 'Week 2',
          unit: 'Unit 1: Practical Concepts & Rwandan Context',
          competence: 'Learners systematically analyze structural mechanisms and real-life tasks.',
          periods: '4 Periods',
          objectives: 'Knowledge: Explain procedural rules.\nSkills: Calculate and apply concepts.\nAttitudes: Environmental awareness.',
          activities: 'Small heterogeneous group workshops, guided discovery presentations.',
          materials: 'Chalkboard, real concrete objects, REB Teacher Guide.'
        },
        {
          week: 'Week 3',
          unit: 'Unit 2: Analytical Progression & Synthesis',
          competence: 'Learners evaluate multiple viewpoints and demonstrate critical thinking.',
          periods: '4 Periods',
          objectives: 'Knowledge: Contrast characteristics.\nSkills: Construct graphical models.\nAttitudes: Mutual respect.',
          activities: 'Case study analysis, station rotation lab, peer assessment exit tickets.',
          materials: 'Reference texts, digital projector, graph books.'
        },
        {
          week: 'Week 4',
          unit: 'Unit 2: Remediation & Formative Assessment',
          competence: 'Learners consolidate unit competences in individual formative tasks.',
          periods: '4 Periods',
          objectives: 'Knowledge: Recall all indicators.\nSkills: Solve multi-step problems.\nAttitudes: Self-reliance.',
          activities: 'Diagnostic speed drill, differentiated scaffolding, end-of-unit quiz.',
          materials: 'REB Assessment criteria grid, answer sheets.'
        }
      ];

      const rows: TableRow[] = [
        new TableRow({
          children: columnHeaders.map((h, i) => new TableCell({
            width: { size: columnWidths[i], type: WidthType.DXA },
            shading: { fill: 'E2E8F0' },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 16 })] })]
          }))
        })
      ];

      sampleWeeks.forEach(w => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({ width: { size: columnWidths[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.week, bold: true, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[1], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.unit, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[2], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.competence, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[3], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.periods, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[4], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.objectives, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[5], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.activities, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[6], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.materials, size: 16 })] })] }),
            ]
          })
        );
      });

      const sowTable = new Table({
        width: { size: 10400, type: WidthType.DXA },
        borders: cellBorders,
        rows: rows
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 16838, height: 11906 },
                margin: { top: 720, bottom: 720, left: 720, right: 720 }
              }
            },
            children: [
              new Paragraph({
                text: 'REPUBLIC OF RWANDA - RWANDA BASIC EDUCATION BOARD (REB)',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                text: `OFFICIAL COMPETENCE-BASED SCHEME OF WORK (GAHUNDA Y'AMASOMO) - ${item.classGrade} ${item.subject.toUpperCase()}`,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 }
              }),
              metaTable,
              new Paragraph({ spacing: { after: 140 } }),
              sowTable,
              new Paragraph({ spacing: { after: 200 } }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Teacher's Signature: .......................................      Dean of Studies / Headteacher: .......................................      Date: ${new Date().toLocaleDateString()}`, italics: true, size: 16 })
                ]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `REB_Scheme_of_Work_${item.classGrade}_${item.subject.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
      setDownloadSuccessNotice(`Gahunda y'Amasomo cya "${item.title}" yamanuwe neza muri Microsoft Word (.docx)!`);
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } catch (err) {
      console.error('SOW Generation Error:', err);
      alert('Could not generate Scheme of Work docx. Please retry.');
    } finally {
      setIsGeneratingSow(null);
    }
  };

  const handleCopyDirectLink = (book: REBBookMetadata) => {
    const directUrl = book.downloadUrl;
    navigator.clipboard.writeText(directUrl).then(() => {
      setCopiedBookId(book.id);
      setTimeout(() => setCopiedBookId(null), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Award className="w-4 h-4" /> REB eLearning Direct Books
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> REB Course 1806 Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider border border-sky-500/30">
              <Download className="w-4 h-4" /> 167+ Genuine Revised Textbooks & Guides
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight">
            Ibitabo Nyabyo Byavuguruwe bya REB muri PDF <br />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Authentic REB Textbooks with Custom Front Cover & Watermark
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Ntabwo twandika ibitabo, byandikwa na REB! Sisitemu yacu ikuzanira ibitabo nyabyo bya REB bivuye kuri <strong>elearning.reb.rw</strong> (Course 1806). Iyo ukanze download, izana igitabo nyacyo cya REB ikakongereraho igifuniko cy'ishuri ryawe n'umwarimu n'ikirango cya Elimu360!
          </p>

          {/* Tab Navigation */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ibitabo Byose bya REB ({filteredItems.length} Byabonetse)</span>
            </button>

            <button
              onClick={() => setActiveTab('portal')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Live REB eLearning Course 1806 Web Viewer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="flex-1">{downloadSuccessNotice}</span>
          <button 
            onClick={() => setDownloadSuccessNotice(null)} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Official Guarantee Notice Card */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <strong className="block font-black">Icyemezo cy'Uburezi bw'u Rwanda (REB CBC Verified):</strong>
            <span>Ibi bitabo byose ni ibyavuguruwe by'umwimerere byakuwe ku rubuga rwa REB elearning.reb.rw. Buri gitabo gishyirwaho igifuniko gifite amakuru y'ishuri ryawe n'ikirango cy'umwarimu!</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800/60 font-black text-[11px] text-amber-900 dark:text-amber-100">
            {schoolProfile.schoolName || 'Ishuri: GS Rwanda Amahoro'}
          </span>
        </div>
      </div>

      {/* Mode 1: Catalog & Direct Downloads inside the system */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Shakisha igitabo, isomo (Ikinyarwanda, English, Mathematics, SET, SST, French...), cyangwa umwaka..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              
              {/* Level Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {(['ALL', 'PRIMARY', 'O_LEVEL', 'A_LEVEL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Ibyiciro Byose' : lvl === 'PRIMARY' ? 'Abanza (P1-P6)' : lvl === 'O_LEVEL' ? 'O-Level (S1-S3)' : 'A-Level (S4-S6)'}
                  </button>
                ))}
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
                {(['ALL', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4'] as const).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition shrink-0 cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cls === 'ALL' ? 'Imyaka Yose' : cls}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-200 text-[11px] font-bold focus:outline-none"
              >
                <option value="ALL">Ubwoko Bwose (Student Book, Teacher Guide, Syllabi, Schemes)</option>
                <option value="STUDENT_BOOK">Ibitabo by'Abanyeshuri (Student Books / PB)</option>
                <option value="TEACHER_GUIDE">Imiyoboro y'Abarimu (Teacher Guides / TG)</option>
                <option value="SCHEME_OF_WORK">Gahunda z'Amasomo (Schemes of Work)</option>
                <option value="SYLLABUS">Integanyanyigisho za REB (Syllabi)</option>
                <option value="CONTENT_DISTRIBUTION">Ingengabyigwa (Content Distribution)</option>
              </select>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-200 text-[11px] font-bold focus:outline-none"
              >
                <option value="ALL">Amasomo Yose ({availableSubjects.length} Masomo)</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

            </div>
          </div>

          {/* Batch Selection & Multi-Book Action Toolbar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-800 dark:text-amber-300 flex items-center gap-1.5 mr-1">
                <ListPlus className="w-4 h-4 text-amber-500" />
                <span>Kumanura Ibitabo Byinshi (Batch):</span>
              </span>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Hitamo Byose Kuri Paji ({filteredItems.length})</span>
              </button>

              {selectedBookIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span>Kureka ({selectedBookIds.size})</span>
                </button>
              )}
            </div>

            {/* Quick Class Presets for instant single-click batch selection */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
              <span className="text-[10px] font-bold text-slate-400 mr-1 shrink-0">Hitamo Umwaka:</span>
              {(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3'] as const).map(cls => {
                const count = REB_OFFICIAL_CATALOG.filter(b => b.classGrade === cls).length;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleSelectByClass(cls)}
                    className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                    title={`Hitamo ibitabo byose bya ${cls} (${count})`}
                  >
                    {cls} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar with Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1 font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span>
                Ibyerekanwa: <strong className="text-slate-900 dark:text-white">{(safeCurrentPage - 1) * pageSize + 1} - {Math.min(safeCurrentPage * pageSize, filteredItems.length)}</strong> kuri <strong>{filteredItems.length}</strong>
              </span>
              {selectedBookIds.size > 0 && (
                <span className="font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {selectedBookIds.size} Byatoranyijwe
                </span>
              )}
            </div>

            {/* Pagination Controls Header */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Ku paji:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Paji ibanza"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    {safeCurrentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Paji ikurikira"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Catalog Grid with Compact Book Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedItems.map((item) => {
              const isSelected = selectedBookIds.has(item.id);
              const itemProgress = downloadProgressMap[item.id];
              const isDownloadingThis = Boolean(itemProgress);

              return (
                <div 
                  key={item.id}
                  id={`book-${item.id}`}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition group relative ${
                    isSelected 
                      ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Checkbox & Category Badges */}
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectBook(item.id)}
                        className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                        }`}
                        title={isSelected ? 'Kureka guhitamo' : 'Hitamo iki gitabo muri batch'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3 h-3 text-slate-950" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{isSelected ? 'Cyatoranyijwe' : 'Hitamo'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {item.classGrade} • {item.subject}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.type === 'STUDENT_BOOK' ? 'PB' : item.type === 'TEACHER_GUIDE' ? 'TG' : item.type === 'SCHEME_OF_WORK' ? 'SOW' : 'Syllabus'}
                        </span>
                      </div>
                    </div>

                    {/* Book Title (Compact, 2-line clamp) */}
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Compact Metadata Row (Edition & Size, No Long Description) */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>REB CBC 2026/2027</span>
                      </div>
                      <span className="font-mono font-medium">{item.size}</span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 space-y-2">
                    
                    {/* Primary Branded Book Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDirectDownloadBook(item)}
                      disabled={isDownloadingThis}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] shadow-sm transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-90"
                    >
                      <div className="flex items-center gap-1.5">
                        <Download className={`w-3.5 h-3.5 ${isDownloadingThis ? 'animate-bounce text-amber-300' : ''}`} />
                        <span className="line-clamp-1">
                          {isDownloadingThis 
                            ? (itemProgress.message || 'Gufatanya igitabo...') 
                            : "Manura Igitabo n'Igifuniko (.pdf)"}
                        </span>
                      </div>
                      {isDownloadingThis && (
                        <div className="w-full bg-emerald-950/40 rounded-full h-1 overflow-hidden">
                          <div 
                            className="bg-amber-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${itemProgress.percent || 20}%` }}
                          />
                        </div>
                      )}
                    </button>

                    {/* Secondary Actions: Scheme of Work Word file or Cover-only */}
                    <div className="flex items-center gap-1.5">
                      {item.type === 'SCHEME_OF_WORK' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDownloadSchemeOfWorkDocx(item)}
                            disabled={isGeneratingSow === item.id}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Manura Gahunda y'Amasomo muri Microsoft Word"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{isGeneratingSow === item.id ? 'Word...' : 'Word (.docx)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadCoverOnly(item)}
                            className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                            title="Manura igifuniko cyonyine cy'ishuri (.pdf)"
                          >
                            <span>Igifuniko</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDownloadCoverOnly(item)}
                          className="w-full py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                          title="Manura igifuniko cyonyine cy'ishuri na mwarimu muri PDF"
                        >
                          <FileText className="w-3 h-3 text-amber-500" />
                          <span>Manura Igifuniko Cyonyine (.pdf)</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Paji <strong>{safeCurrentPage}</strong> kuri <strong>{totalPages}</strong> (Ibitabo {filteredItems.length} Byose)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Ibanza</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (safeCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (safeCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = safeCurrentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          safeCurrentPage === pageNum
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Ikuriyeho</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Ad banner integration */}
          <div className="pt-4">
            <AdsterraNativeBanner />
          </div>
        </div>
      )}

      {/* Mode 2: Live REB e-Learning Portal View for Course 1806 */}
      {activeTab === 'portal' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Ubu urimo kureba urubuga rwa REB e-Learning Course 1806 muri sisitemu. Ushobora kumanura ibitabo byose cyangwa kubifungura mu idirishya rishya.
              </span>
            </div>
            <a
              href="https://elearning.reb.rw/course/view.php?id=1806"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Fungura mu idirishya rishya</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded iFrame with graceful fallback */}
          <div className="w-full h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
            <iframe
              src="https://elearning.reb.rw/course/view.php?id=1806"
              title="REB e-Learning CBC Course 1806"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Floating Sticky Batch Action Dock (Appears when books are selected) */}
      {selectedBookIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg shadow-md shrink-0">
              {selectedBookIds.size}
            </span>
            <div>
              <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                <span>{selectedBookIds.size} {selectedBookIds.size === 1 ? 'Igitabo Cyatoranyijwe' : 'Ibitabo Byatoranyijwe'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase">Batch Ready</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Buri gitabo gishyirwaho igifuniko cy'ishuri na QR Code muri dosiye imwe!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleBatchDownload(true)}
              disabled={Boolean(batchProgress?.active)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Manura ibitabo byose byatoranyijwe byose hamwe muri dosiye imwe ya ZIP"
            >
              <FolderArchive className="w-4 h-4 text-slate-950" />
              <span>Manura Muri ZIP (.zip)</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchDownload(false)}
              disabled={Boolean(batchProgress?.active)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Manura kimwe ku kindi mu buryo bwikurikira"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Queue</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Kureka guhitamo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Download Progress Modal */}
      {batchProgress?.active && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm sm:text-base">
                <FolderArchive className="w-6 h-6 animate-pulse text-amber-400 shrink-0" />
                <span>Kumanura Ibitabo Byinshi bya REB ({batchProgress.current} / {batchProgress.total})</span>
              </div>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950">
                {batchProgress.percent}%
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Igitabo Kirimo Gutunganywa:</span>
              <p className="text-xs sm:text-sm text-white font-bold truncate">
                {batchProgress.currentTitle}
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                  <span className="truncate">{batchProgress.stepMessage}</span>
                </span>
                <span className="shrink-0 text-slate-400">REB Course 1806</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic pt-1">
              Ntufunge iri dirishya, amapaji n'ibifuniko birimo gufatanyirizwa hamwe ku gikoresho cyawe mu buryo bwihuse.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
