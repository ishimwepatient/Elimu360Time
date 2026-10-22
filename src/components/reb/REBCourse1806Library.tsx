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
  Eye,
  X,
  Share2,
  Copy,
  Check,
  AlertCircle,
  School,
  Play
} from 'lucide-react';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';
import { downloadREBBookDirectly, openDirectREBLink } from '../../utils/directBookGenerator';
import { REB_OFFICIAL_CATALOG, REBBookMetadata } from '../../utils/rebBooksCatalog';

export const REBCourse1806Library: React.FC = () => {
  const { schoolProfile } = useElimu();
  const [activeTab, setActiveTab] = useState<'catalog' | 'portal'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Direct downloading state with exact feedback
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [isGeneratingSow, setIsGeneratingSow] = useState<string | null>(null);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [copiedBookId, setCopiedBookId] = useState<string | null>(null);

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

  // Extract unique subjects for filtering
  const availableSubjects = Array.from(new Set(REB_OFFICIAL_CATALOG.map(b => b.subject))).sort();

  /**
   * DIRECT BOOK DOWNLOAD HANDLER
   * Fetches the actual genuine REB textbook/guide from REB's eLearning site,
   * prepends the official Rwanda CBC / Elimu360 Front Page, stamps the subtle watermark,
   * and delivers the PDF straight to the teacher's downloads folder.
   */
  const handleDirectDownloadBook = async (book: REBBookMetadata) => {
    setDownloadingBookId(book.id);
    setDownloadSuccessNotice(null);

    try {
      await downloadREBBookDirectly(
        book,
        schoolProfile?.schoolName,
        schoolProfile?.teacherName,
        schoolProfile?.academicYear,
        schoolProfile?.district
      );
      setDownloadSuccessNotice(`Igitabo nyacyo cya REB "${book.title}" cyatangiye kumanurwa gifite igifuniko cy'ishuri na watermark!`);
      setTimeout(() => setDownloadSuccessNotice(null), 6000);
    } catch (err) {
      console.error('Direct download error:', err);
      // Fallback: open direct link immediately if network blocked proxy
      openDirectREBLink(book);
    } finally {
      setDownloadingBookId(null);
    }
  };

  /**
   * RUN DIRECT REB LINK HANDLER
   * Directly triggers or opens the exact link of the revised REB book from elearning.reb.rw
   */
  const handleRunExactRebLink = (book: REBBookMetadata) => {
    openDirectREBLink(book);
    setDownloadSuccessNotice(`Link y'igitabo cya REB "${book.title}" yafunguwe neza ako kanya!`);
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Shakisha igitabo, isomo (Ikinyarwanda, English, Mathematics, SET, SST, French...), cyangwa umwaka..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
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
                    onClick={() => setSelectedLevel(lvl)}
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
                    onClick={() => setSelectedClass(cls)}
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
                onChange={(e) => setSelectedType(e.target.value)}
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
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-700 dark:text-slate-200 text-[11px] font-bold focus:outline-none"
              >
                <option value="ALL">Amasomo Yose ({availableSubjects.length} Masomo)</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
            <span>
              Habonetse ibitabo <strong>{filteredItems.length}</strong> bya REB eLearning bihwanye n'ibyo wahisemo
            </span>
            <span>REB Course ID: 1806 • Revised 2026/2027</span>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                id={`book-${item.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {item.classGrade} • {item.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.type === 'STUDENT_BOOK' ? "Pupil's Book" : item.type === 'TEACHER_GUIDE' ? "Teacher's Guide" : item.type === 'SCHEME_OF_WORK' ? 'Scheme of Work' : item.type === 'SYLLABUS' ? 'Syllabus' : 'Distribution'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.edition}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold">
                      {item.size}
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4 space-y-2.5">
                  
                  {/* Primary Download Button: Fetches genuine REB book with custom cover page and watermark */}
                  <button
                    type="button"
                    onClick={() => handleDirectDownloadBook(item)}
                    disabled={downloadingBookId === item.id}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadingBookId === item.id 
                        ? 'Igitabo kirimo kumanurwa gifite igifuniko...' 
                        : 'Manura Igitabo n\'Igifuniko (.pdf)'}
                    </span>
                  </button>

                  {/* Secondary Run Exact REB Link Button */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunExactRebLink(item)}
                      className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Run exact link of this revised REB book from elearning.reb.rw"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-500" />
                      <span>Run REB Link</span>
                    </button>

                    {item.type === 'SCHEME_OF_WORK' ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadSchemeOfWorkDocx(item)}
                        disabled={isGeneratingSow === item.id}
                        className="py-2 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isGeneratingSow === item.id ? 'Word...' : 'Word (.docx)'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopyDirectLink(item)}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Copy direct REB link"
                      >
                        {copiedBookId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Yakopiwe!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopi Link</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

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

    </div>
  );
};
