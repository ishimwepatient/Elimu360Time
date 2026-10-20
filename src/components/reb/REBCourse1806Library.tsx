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
  ChevronRight
} from 'lucide-react';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';

interface REBBookItem {
  id: string;
  title: string;
  level: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL';
  classGrade: string; // P1-P6, S1-S6
  subject: string;
  type: 'STUDENT_BOOK' | 'TEACHER_GUIDE' | 'SYLLABUS' | 'SCHEME_OF_WORK';
  edition: string; // e.g. "Revised 2024/2025 Edition"
  size: string;
  downloadUrl: string;
  description: string;
}

const REB_MATERIALS_CATALOG: REBBookItem[] = [
  // --- PRIMARY REVISED TEXTBOOKS & SCHEMES ---
  {
    id: 'reb_p1_ik',
    title: 'Ikinyarwanda - Igitabo cy\'Umunyeshuri (P1)',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '14.2 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Igitabo cy\'Ikinyarwanda cy\'umwaka wa mbere w\'amashuri abanza gikurikije integanyanyigisho ivuguruye ya CBC.'
  },
  {
    id: 'reb_p1_ik_tg',
    title: 'Ikinyarwanda - Umuyoboro w\'Umwarimu (P1)',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'TEACHER_GUIDE',
    edition: 'REB Revised Edition 2024',
    size: '18.5 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Amabwiriza y\'imfashanyigisho, imyitozo no gutegura amasomo ya buri munsi ku mwarimu wa P1.'
  },
  {
    id: 'reb_p1_ik_sow',
    title: 'Gahunda y\'Igifatizo y\'Amasomo (Scheme of Work) - Ikinyarwanda P1',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB Template (Term 1, 2, 3)',
    size: '250 KB (Word .docx)',
    downloadUrl: '#sow',
    description: 'Imbonerahamwe yuzuye y\'ibyumweru byose n\'intego z\'isomo (Knowledge, Skills & Attitudes) z\'Ikinyarwanda P1.'
  },
  {
    id: 'reb_p2_math',
    title: 'Imibare - Igitabo cy\'Umunyeshuri (P2)',
    level: 'PRIMARY',
    classGrade: 'P2',
    subject: 'Imibare (Mathematics)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '16.8 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Imibare, kubara, kuteranya, gukuramo no gukemura ibibazo bikorwa mu mashuri abanza.'
  },
  {
    id: 'reb_p3_set',
    title: 'Ibyerekeye Ibidukikije n\'Ubuzima (SET) - P3',
    level: 'PRIMARY',
    classGrade: 'P3',
    subject: 'Science & Elementary Technology (SET)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '21.0 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Isuku, ubuzima, ibidukikije, ikoranabuhanga n\'ubuhinzi mu mashuri abanza.'
  },
  {
    id: 'reb_p4_eng',
    title: 'English for Rwandan Schools - Pupil\'s Book (P4)',
    level: 'PRIMARY',
    classGrade: 'P4',
    subject: 'English Language',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '19.4 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Official REB CBC English Course for Primary 4 with comprehension, grammar and phonics exercises.'
  },
  {
    id: 'reb_p5_sst',
    title: 'Social and Religious Studies (SRS) - Pupil\'s Book (P5)',
    level: 'PRIMARY',
    classGrade: 'P5',
    subject: 'Social & Religious Studies (SRS / SST)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '22.3 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Geography of Rwanda, East African Community, civics, culture and national values.'
  },
  {
    id: 'reb_p6_math_sow',
    title: 'Scheme of Work - Primary 6 Mathematics (Terms 1, 2 & 3)',
    level: 'PRIMARY',
    classGrade: 'P6',
    subject: 'Imibare (Mathematics)',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB Template (P6 National Preparation)',
    size: '320 KB (Word .docx)',
    downloadUrl: '#sow',
    description: 'Comprehensive weekly breakdown of curriculum units, competences, and periods for Primary 6 national examination classes.'
  },

  // --- SECONDARY O-LEVEL (S1 - S3) ---
  {
    id: 'reb_s1_math',
    title: 'Mathematics - Student\'s Book (Senior 1)',
    level: 'O_LEVEL',
    classGrade: 'S1',
    subject: 'Mathematics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '28.1 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Set theory, algebra, integers, fractions, geometry and statistics for Lower Secondary.'
  },
  {
    id: 'reb_s1_phy',
    title: 'Physics - Student\'s Book (Senior 1)',
    level: 'O_LEVEL',
    classGrade: 'S1',
    subject: 'Physics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '24.5 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Introduction to physics, measurement, states of matter, density and simple machines.'
  },
  {
    id: 'reb_s2_chem',
    title: 'Chemistry - Student\'s Book (Senior 2)',
    level: 'O_LEVEL',
    classGrade: 'S2',
    subject: 'Chemistry',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '26.8 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Atomic structure, bonding, air and water composition, acids, bases and indicators.'
  },
  {
    id: 'reb_s2_bio',
    title: 'Biology - Student\'s Book (Senior 2)',
    level: 'O_LEVEL',
    classGrade: 'S2',
    subject: 'Biology',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '31.2 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Classification of living organisms, transport in plants and animals, human digestive system.'
  },
  {
    id: 'reb_s3_ent_sow',
    title: 'Scheme of Work - Senior 3 Entrepreneurship (Terms 1, 2 & 3)',
    level: 'O_LEVEL',
    classGrade: 'S3',
    subject: 'Entrepreneurship',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB Template',
    size: '290 KB (Word .docx)',
    downloadUrl: '#sow',
    description: 'Business plans, financial recording, taxation in Rwanda and project management for national candidates.'
  },
  {
    id: 'reb_s3_ict',
    title: 'Computer Science & ICT - Student\'s Book (Senior 3)',
    level: 'O_LEVEL',
    classGrade: 'S3',
    subject: 'Computer Science & ICT',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '29.7 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Spreadsheets, databases, programming logic, web design and cyber hygiene in Rwanda.'
  },

  // --- SECONDARY A-LEVEL (S4 - S6) ---
  {
    id: 'reb_s4_adv_math',
    title: 'Advanced Mathematics - Student\'s Book (Senior 4)',
    level: 'A_LEVEL',
    classGrade: 'S4',
    subject: 'Mathematics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '34.2 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Numerical functions, trigonometry, vectors in 2D and 3D, and probability.'
  },
  {
    id: 'reb_s5_adv_phy',
    title: 'Physics for Advanced Level - Student\'s Book (Senior 5)',
    level: 'A_LEVEL',
    classGrade: 'S5',
    subject: 'Physics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024',
    size: '38.0 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Rotational dynamics, gravitation, thermodynamics, geometrical optics, and wave motion.'
  },
  {
    id: 'reb_s6_cbc_syllabus',
    title: 'REB Competency-Based Curriculum Framework & National Syllabi',
    level: 'A_LEVEL',
    classGrade: 'S6',
    subject: 'Official Syllabi',
    type: 'SYLLABUS',
    edition: 'Official Policy Document',
    size: '12.4 MB',
    downloadUrl: 'https://elearning.reb.rw/course/view.php?id=1806',
    description: 'Official comprehensive policy framework outlining competences, assessment modes and learning outcomes across all levels.'
  }
];

export const REBCourse1806Library: React.FC = () => {
  const { schoolProfile } = useElimu();
  const [activeTab, setActiveTab] = useState<'catalog' | 'portal'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isGeneratingSow, setIsGeneratingSow] = useState<string | null>(null);

  const filteredItems = REB_MATERIALS_CATALOG.filter(item => {
    if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
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

  /**
   * Generates a fully formatted, official REB Scheme of Work Word (.docx) document
   * pre-populated with school & teacher profile, eliminating the need to leave the system!
   */
  const handleDownloadSchemeOfWorkDocx = async (item: REBBookItem) => {
    setIsGeneratingSow(item.id);

    try {
      const borderThin = { style: BorderStyle.SINGLE, size: 6, color: '64748B' };
      const cellBorders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

      const schoolNameVal = schoolProfile.schoolName || 'GS Rwanda Amahoro';
      const teacherNameVal = schoolProfile.teacherName || 'Umwarimu';
      const academicYearVal = schoolProfile.academicYear || '2025 - 2026';

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
                      new TextRun({ text: `Umwaka (Class): ${item.classGrade} | Umwaka: ${academicYearVal}`, size: 18 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      // Scheme of work content rows (Official REB CBC 7-Column Layout)
      const columnHeaders = [
        'Week / Dates',
        'Unit No & Title',
        'Key Unit Competence',
        'Lessons / Periods',
        'Learning Objectives (Knowledge, Skills, Attitudes)',
        'Learning Activities & Methodologies',
        'Learning Materials & References'
      ];
      const columnWidths = [1200, 1600, 1800, 1000, 2000, 1600, 1200]; // total = 10400

      const sampleWeeks = [
        {
          week: 'Week 1',
          unit: 'Unit 1: Introduction & Diagnostic Baseline',
          competence: 'Learners demonstrate mastery of foundational prerequisite knowledge and collaborative group norms.',
          periods: '4 Periods',
          objectives: 'Knowledge: Identify key terminologies.\nSkills: Formulate definitions and solve introductory exercises.\nAttitudes: Show teamwork and active curiosity.',
          activities: 'Interactive plenary discussion, Diagnostic Think-Pair-Share, Baseline quiz and chalkboard modeling.',
          materials: `REB ${item.subject} Student\'s Book ${item.classGrade}, wall charts, locally made flashcards.`
        },
        {
          week: 'Week 2',
          unit: 'Unit 1: Core Principles & Practical Application',
          competence: 'Learners systematically analyze structural mechanisms and execute contextual problem-solving tasks.',
          periods: '4 Periods',
          objectives: 'Knowledge: Explain procedural algorithms and rules.\nSkills: Calculate and apply concepts to real-life Rwandan scenarios.\nAttitudes: Foster environmental and civic consciousness.',
          activities: 'Small heterogeneous group workshops, practical guided discovery, student board presentations.',
          materials: 'Chalkboard, real concrete objects, differentiated exercise worksheets, REB Teacher Guide.'
        },
        {
          week: 'Week 3',
          unit: 'Unit 2: Analytical Progression & Synthesis',
          competence: 'Learners evaluate multiple viewpoints and demonstrate critical thinking in cooperative groups.',
          periods: '4 Periods',
          objectives: 'Knowledge: State and compare contrasting characteristics.\nSkills: Construct graphical models and defend solutions.\nAttitudes: Mutual respect, active listening.',
          activities: 'Case study analysis, station rotation lab, peer-critique and formative self-assessment exit tickets.',
          materials: 'Reference texts, digital projector or flipcharts, graph books, markers.'
        },
        {
          week: 'Week 4',
          unit: 'Unit 2: Review, Remediation & Formative Assessment',
          competence: 'Learners consolidate unit competences and demonstrate mastery in individual formative assessment.',
          periods: '4 Periods',
          objectives: 'Knowledge: Recall all unit indicators.\nSkills: Solve complex multi-step problems accurately.\nAttitudes: Confidence, self-reliance.',
          activities: 'Speed diagnostic drill, targeted scaffolding for struggling pupils, extension tasks, end-of-unit quiz.',
          materials: 'REB Assessment criteria grid, individual assessment answer sheets.'
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
                size: { width: 16838, height: 11906 }, // A4 Landscape for standard Scheme of Work
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
                  new TextRun({ text: `Teacher\'s Signature: .......................................      Dean of Studies / Headteacher: .......................................      Date: ${new Date().toLocaleDateString()}`, italics: true, size: 16 })
                ]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `REB_Scheme_of_Work_${item.classGrade}_${item.subject.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
    } catch (err) {
      console.error('SOW Generation Error:', err);
      alert('Could not generate Scheme of Work docx. Please retry.');
    } finally {
      setIsGeneratingSow(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Award className="w-4 h-4" /> REB e-Learning Official Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> Course ID: 1806 Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight">
            Ibitabo Byavuguruwe na Gahunda z'Amasomo <br />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              REB Revised Textbooks & Schemes of Work
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Aha ushobora kumanura ibitabo byose by'abanyeshuri byavuguruwe na REB, ibitabo by'umwarimu (Teacher Guides), n'ingero z'imbonerahamwe za gahunda z'amasomo (Schemes of Work) muri Word (.docx) ako kanya utiriwe uva muri sisitemu!
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
              <span>Ibitabo na Gahunda zo Kumanura (Digital Library)</span>
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
              <span>Urubuga rwa REB Course 1806 (Live Portal View)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Catalog & Direct Downloads inside the system */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Shakisha igitabo, isomo (Ikinyarwanda, Imibare, Physics, Chemistry...), cyangwa umwaka..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">Ibyiciro Byose (All Levels)</option>
                <option value="PRIMARY">Amashuri Abanza (Primary P1 - P6)</option>
                <option value="O_LEVEL">Icyiciro Rusange (O-Level S1 - S3)</option>
                <option value="A_LEVEL">Icyiciro Gikuru (A-Level S4 - S6)</option>
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">Ubwoko Bwose bw'Ibikoresho</option>
                <option value="STUDENT_BOOK">Ibitabo by'Abanyeshuri (Student Books)</option>
                <option value="TEACHER_GUIDE">Ibitabo by'Abarimu (Teacher Guides)</option>
                <option value="SCHEME_OF_WORK">Gahunda z'Amasomo (Schemes of Work Word .docx)</option>
                <option value="SYLLABUS">Integanyanyigisho ya REB (CBC Syllabi)</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {item.classGrade} • {item.subject}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {item.size}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.edition}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                  {item.type === 'SCHEME_OF_WORK' ? (
                    <button
                      onClick={() => handleDownloadSchemeOfWorkDocx(item)}
                      disabled={isGeneratingSow === item.id}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isGeneratingSow === item.id ? 'Turimo gukora Word...' : 'Manura Gahunda (Word .docx)'}</span>
                    </button>
                  ) : (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manura Igitabo cya REB</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
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
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
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
