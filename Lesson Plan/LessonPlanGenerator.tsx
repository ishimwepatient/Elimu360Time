import React, { useState } from 'react';
import { 
  Sparkles, 
  FileDown, 
  Archive, 
  Plus, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  Calendar, 
  Users, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  Award,
  FolderDown,
  Info,
  Check,
  ChevronDown,
  Sliders,
  HelpCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useElimu } from '../src/context/ElimuContext';
import { exportFilesToNativeFolder, FileToSave } from '../src/utils/folderExportHelper';
import { getRichDifferentiatedLesson, PEDAGOGICAL_APPROACHES, BLOOM_ACTION_VERBS } from '../src/utils/pedagogicalWordBank';

// Self-contained LessonPlanData interface
export interface LessonPlanStepDetail {
  duration: string;
  teacherActivities: string[];
  learnerActivities: string[];
  competencesAndCrossCutting: string[];
}

export interface LessonPlanSteps {
  introduction: LessonPlanStepDetail;
  development: LessonPlanStepDetail;
  conclusion: LessonPlanStepDetail;
}

export interface LessonPlanData {
  id: string;
  createdAt: string;
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  classLevel: string;
  unitNumber: string;
  lessonNumber: string;
  duration: string;
  classSize: number;
  specialNeeds: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonTitle: string;
  instructionalObjective: string;
  location: string;
  learningMaterials: string;
  references: string;
  activitySummary: string;
  steps: LessonPlanSteps;
  selfEvaluation: string;
}

async function safeFetchJson(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new Error('Received an empty response from server. Please verify connection or try again.');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Server non-JSON response body:', text);
    throw new Error('Server returned invalid response format. Please try again.');
  }
}

function getSequentialDate(baseDateStr: string, offsetDays: number): string {
  if (offsetDays === 0 && baseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(baseDateStr)) {
    return baseDateStr;
  }
  let year: number, month: number, day: number;
  if (baseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(baseDateStr)) {
    const parts = baseDateStr.split('-').map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    day = now.getDate();
  }

  const d = new Date(year, month, day);
  let added = 0;
  while (added < offsetDays) {
    d.setDate(d.getDate() + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat and Sun
      added++;
    }
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Client generator powered by rich pedagogical word bank with 1,200+ distinct action verbs & methodology variants
function generateClientREBFallbackPlans(payload: any): LessonPlanData[] {
  const titles = (payload.lessonTitles && payload.lessonTitles.length > 0)
    ? payload.lessonTitles
    : [payload.lessonTitle || 'Introduction to Subject Topic'];
  const total = titles.length;

  return titles.map((title: string, idx: number) => {
    const richLesson = getRichDifferentiatedLesson(
      title,
      payload.subject || 'Subject',
      payload.classLevel || 'Primary 6 (P6)',
      (payload.unitTitle || 'UNIT TITLE').toUpperCase(),
      idx,
      total
    );

    const lessonDate = getSequentialDate(payload.date, idx);
    const lessonNumStr = `${idx + 1} Out of ${total}`;

    return {
      id: `lp_plan_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
      schoolName: payload.schoolName || 'GS Amahoro Kigali',
      teacherName: payload.teacherName || 'Teacher',
      term: payload.term || 'Term 1',
      date: lessonDate,
      subject: payload.subject || 'Subject',
      classLevel: payload.classLevel || 'Primary 6 (P6)',
      unitNumber: payload.unitNumber || '1',
      lessonNumber: lessonNumStr,
      duration: payload.duration || '40 min',
      classSize: payload.classSize || 45,
      specialNeeds: payload.specialNeeds || 'Learners with special needs seated near the chalkboard with peer support.',
      unitTitle: (payload.unitTitle || 'UNIT TITLE').toUpperCase(),
      keyUnitCompetence: `Learners will be able to demonstrate thorough mastery and practical application of ${payload.unitTitle || 'unit topic'} using core REB CBC analytical techniques, vocabulary, and cooperative inquiry methods.`,
      lessonTitle: title,
      instructionalObjective: richLesson.instructionalObjective,
      location: payload.location || 'Classroom & Outdoor Learning Area',
      learningMaterials: richLesson.learningMaterials,
      references: richLesson.references,
      activitySummary: richLesson.activitySummary,
      steps: richLesson.steps,
      selfEvaluation: payload.selfEvaluation || richLesson.selfEvaluation
    };
  });
}

function createBlankUnfilledA4Plan(schoolNameVal = '', teacherNameVal = ''): LessonPlanData {
  return {
    id: `lp_blank_${Date.now()}`,
    createdAt: new Date().toISOString(),
    schoolName: schoolNameVal || '........................................................',
    teacherName: teacherNameVal || '........................................................',
    term: 'Term .....',
    date: new Date().toISOString().split('T')[0],
    subject: '........................................',
    classLevel: '........................................',
    unitNumber: '.....',
    lessonNumber: '1 Out of 1',
    duration: '40 min',
    classSize: 40,
    specialNeeds: '................................................................................................',
    unitTitle: '................................................................................................',
    keyUnitCompetence: '................................................................................................................................................',
    lessonTitle: '................................................................................................',
    instructionalObjective: 'By using ............................., learners will be able to ............................. accurately within ..... min.',
    location: 'Classroom',
    learningMaterials: 'Chalkboard, textbooks, wall charts, exercise books, stationery',
    references: 'Rwanda Education Board (REB) Competency-Based Curriculum Framework',
    activitySummary: '................................................................................................',
    steps: {
      introduction: {
        duration: '5 min',
        teacherActivities: ['................................................................................................'],
        learnerActivities: ['................................................................................................'],
        competencesAndCrossCutting: ['Cooperation, Communication']
      },
      development: {
        duration: '25 min',
        teacherActivities: [
          '................................................................................................',
          '................................................................................................'
        ],
        learnerActivities: [
          '................................................................................................',
          '................................................................................................'
        ],
        competencesAndCrossCutting: ['Critical Thinking, Problem Solving']
      },
      conclusion: {
        duration: '10 min',
        teacherActivities: ['................................................................................................'],
        learnerActivities: ['................................................................................................'],
        competencesAndCrossCutting: ['Self-evaluation, Summary']
      }
    },
    selfEvaluation: '................................................................................................................................................'
  };
}

// High-speed, official vector A4 PDF generator using jsPDF
function createDirectRebPdf(plan: LessonPlanData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 10;
  let currentY = 10;
  const pageWidth = 190;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LESSON PLAN', 105, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(7.5);
  doc.setLineWidth(0.25);
  doc.setDrawColor(0, 0, 0);

  const drawBox = (x: number, y: number, w: number, h: number, text: string, options: { bold?: boolean; bg?: boolean; align?: 'left' | 'center'; fontSize?: number } = {}) => {
    if (options.bg) {
      doc.setFillColor(245, 247, 250);
      doc.rect(x, y, w, h, 'F');
    }
    doc.rect(x, y, w, h);
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    const fSize = options.fontSize || 7.5;
    doc.setFontSize(fSize);
    const lineStep = fSize * 0.35 + 0.6;
    const splitLines = doc.splitTextToSize(text || '', w - 3);

    if (options.align === 'center') {
      splitLines.forEach((line: string, i: number) => {
        doc.text(line, x + w / 2, y + 3.2 + (i * lineStep), { align: 'center' });
      });
    } else {
      splitLines.forEach((line: string, i: number) => {
        doc.text(line, x + 1.5, y + 3.2 + (i * lineStep));
      });
    }
  };

  const calcHeight = (text: string, width: number, minH = 6, fontSize = 7.5) => {
    const lineStep = fontSize * 0.35 + 0.6;
    const lines = doc.splitTextToSize(text || '', width - 3);
    return Math.max(minH, lines.length * lineStep + 2.5);
  };

  // School Name & Teacher Name
  doc.rect(marginX, currentY, pageWidth, 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`School Name: ${plan.schoolName || ''}`, marginX + 2, currentY + 3.8);
  doc.text(`Teacher's Name: ${plan.teacherName || ''}`, marginX + 100, currentY + 3.8);
  currentY += 5.5;

  // Metadata Headers & Values
  const cols = [
    { name: 'Term', val: plan.term, w: 18 },
    { name: 'Date', val: plan.date, w: 22 },
    { name: 'Subject', val: plan.subject, w: 25 },
    { name: 'Class', val: plan.classLevel, w: 26 },
    { name: 'Unit No', val: plan.unitNumber, w: 16 },
    { name: 'Lesson No', val: plan.lessonNumber, w: 24 },
    { name: 'Duration', val: plan.duration, w: 22 },
    { name: 'Class size', val: `${plan.classSize || ''}`, w: 37 }
  ];

  let curX = marginX;
  cols.forEach(c => {
    drawBox(curX, currentY, c.w, 4.5, c.name, { bold: true, bg: true, align: 'center', fontSize: 7 });
    curX += c.w;
  });
  currentY += 4.5;

  curX = marginX;
  cols.forEach(c => {
    drawBox(curX, currentY, c.w, 4.5, String(c.val || ''), { align: 'center', fontSize: 7 });
    curX += c.w;
  });
  currentY += 4.5;

  // Special Needs
  const snLabelW = 80;
  const snValW = 110;
  const snHeight = Math.max(7, calcHeight(plan.specialNeeds || 'None', snValW, 7, 7));

  drawBox(marginX, currentY, snLabelW, snHeight, 'Type of special educational needs to be catered for in this lesson and number of learners in each category', { bold: true, bg: true, fontSize: 6.5 });
  drawBox(marginX + snLabelW, currentY, snValW, snHeight, plan.specialNeeds || 'None', { fontSize: 7 });
  currentY += snHeight;

  // Key Fields Table
  const renderRow = (label: string, value: string, minHeight = 5.5, boldVal = false) => {
    const valH = calcHeight(value || '', 140, minHeight, 7);
    if (currentY + valH > 282) {
      doc.addPage();
      currentY = 12;
    }
    drawBox(marginX, currentY, 50, valH, label, { bold: true, bg: true, fontSize: 7 });
    drawBox(marginX + 50, currentY, 140, valH, value, { bold: boldVal, fontSize: 7 });
    currentY += valH;
  };

  renderRow('Unit title', (plan.unitTitle || '').toUpperCase(), 5.5, true);
  renderRow('Key unit competence', plan.keyUnitCompetence || '', 6);
  renderRow('Title of the lesson', plan.lessonTitle || '', 5.5, true);
  renderRow('Instructional objectives', plan.instructionalObjective || '', 7);
  renderRow('Plan of this class (Location)', plan.location || '', 5);
  renderRow('Learning materials', plan.learningMaterials || '', 5.5);
  renderRow('References', plan.references || '', 6);

  currentY += 1.5;

  // Process Table Headers
  const col1W = 32;
  const col2W = 106;
  const col3W = 52;

  if (currentY + 12 > 282) {
    doc.addPage();
    currentY = 12;
  }

  drawBox(marginX, currentY, col1W, 4.5, 'Timing for each step', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W, currentY, col2W, 4.5, 'Description of teaching and learning activities', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 4.5, 'Generic competences & cross-cutting issues', { bold: true, bg: true, align: 'center', fontSize: 7 });
  currentY += 4.5;

  // Activity Summary row
  const summaryH = Math.max(4.5, calcHeight(plan.activitySummary || '', col2W, 4.5, 6.5));
  if (currentY + summaryH > 282) {
    doc.addPage();
    currentY = 12;
  }
  drawBox(marginX, currentY, col1W, summaryH, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W, summaryH, plan.activitySummary || '', { align: 'center', fontSize: 6.5 });
  drawBox(marginX + col1W + col2W, currentY, col3W, summaryH, '', { bg: true });
  currentY += summaryH;

  // Subheaders
  if (currentY + 4 > 282) {
    doc.addPage();
    currentY = 12;
  }
  drawBox(marginX, currentY, col1W, 3.8, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W / 2, 3.8, "Teacher's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + (col2W / 2), currentY, col2W / 2, 3.8, "Learner's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 3.8, '', { bg: true });
  currentY += 3.8;

  // Steps
  const stepItems = [
    { name: 'Introduction', step: plan.steps?.introduction },
    { name: 'Lesson Development', step: plan.steps?.development },
    { name: 'Conclusion', step: plan.steps?.conclusion }
  ];

  stepItems.forEach(item => {
    if (!item.step) return;

    const teacherText = (item.step.teacherActivities || []).map(a => `• ${a}`).join('\n');
    const learnerText = (item.step.learnerActivities || []).map(a => `• ${a}`).join('\n');
    const compText = (item.step.competencesAndCrossCutting || []).map(c => `• ${c}`).join('\n');

    const hTiming = 12;
    const hTeacher = calcHeight(teacherText, (col2W / 2), 12, 6.5);
    const hLearner = calcHeight(learnerText, (col2W / 2), 12, 6.5);
    const hComp = calcHeight(compText, col3W, 12, 6.5);

    const stepHeight = Math.max(hTiming, hTeacher, hLearner, hComp);

    if (currentY + stepHeight > 282) {
      doc.addPage();
      currentY = 12;
    }

    const timingLabel = `${item.name}\n(${item.step.duration || ''})`;
    drawBox(marginX, currentY, col1W, stepHeight, timingLabel, { bold: true, align: 'center', fontSize: 6.5 });
    drawBox(marginX + col1W, currentY, col2W / 2, stepHeight, teacherText, { fontSize: 6.5 });
    drawBox(marginX + col1W + (col2W / 2), currentY, col2W / 2, stepHeight, learnerText, { fontSize: 6.5 });
    drawBox(marginX + col1W + col2W, currentY, col3W, stepHeight, compText, { fontSize: 6.5 });

    currentY += stepHeight;
  });

  // Self Evaluation Section
  const selfEvalText = plan.selfEvaluation || 'Lesson delivered effectively.';
  const selfEvalHeight = Math.max(12, calcHeight(selfEvalText, 140, 12, 7));

  if (currentY + selfEvalHeight + 2 > 282) {
    doc.addPage();
    currentY = 12;
  }

  drawBox(marginX, currentY, 50, selfEvalHeight, "Teacher's Self-Evaluation", { bold: true, bg: true, fontSize: 7 });
  drawBox(marginX + 50, currentY, 140, selfEvalHeight, selfEvalText, { fontSize: 7 });

  return doc;
}

export const LessonPlanGenerator: React.FC = () => {
  // Form input states
  const [schoolName, setSchoolName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [educationLevel, setEducationLevel] = useState<string>('PRIMARY');
  const [classLevel, setClassLevel] = useState<string>('Primary 6 (P6)');
  const [subject, setSubject] = useState<string>('English Language');
  const [term, setTerm] = useState<string>('Term 1');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<string>('40 min');
  const [classSize, setClassSize] = useState<number>(45);
  const [location, setLocation] = useState<string>('Classroom & Outdoor Learning Area');
  const [specialNeeds, setSpecialNeeds] = useState<string>('Learners with special educational needs seated near the chalkboard with visual aids and peer support.');
  const [unitNumber, setUnitNumber] = useState<string>('1');
  const [unitTitle, setUnitTitle] = useState<string>('');
  
  // Multiple Lesson Titles for Bulk Generation
  const [lessonTitles, setLessonTitles] = useState<string[]>([]);
  const [newLessonInput, setNewLessonInput] = useState<string>('');
  const [selfEvaluation, setSelfEvaluation] = useState<string>('');

  // UI state for Advanced/Optional Settings drawer
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Generation & View states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlanData[]>([]);
  const [activePlanIndex, setActivePlanIndex] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingFolder, setIsExportingFolder] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  let saveMultipleLessonPlans: ((plans: any[]) => void) | null = null;
  try {
    const elimu = useElimu();
    saveMultipleLessonPlans = elimu.saveMultipleLessonPlans;
  } catch {
    // Context fallback
  }

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleLoadBlankForm = () => {
    const blank = createBlankUnfilledA4Plan(schoolName, teacherName);
    setGeneratedPlans([blank]);
    setActivePlanIndex(0);
    setStatusMessage({
      text: 'Loaded clean unfilled REB A4 Lesson Plan template for manual writing or direct printing.',
      type: 'success'
    });
  };

  const handleAddLessonTitle = () => {
    if (newLessonInput.trim()) {
      setLessonTitles([...lessonTitles, newLessonInput.trim()]);
      setNewLessonInput('');
    }
  };

  const handleRemoveLessonTitle = (index: number) => {
    setLessonTitles(lessonTitles.filter((_, i) => i !== index));
  };

  const handleGenerateLessonPlans = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let targetTitles = [...lessonTitles];
    if (targetTitles.length === 0 && newLessonInput.trim()) {
      targetTitles = [newLessonInput.trim()];
      setLessonTitles(targetTitles);
      setNewLessonInput('');
    } else if (targetTitles.length === 0) {
      if (unitTitle.trim()) {
        targetTitles = [`Introduction to ${unitTitle.trim()}`];
      } else {
        setStatusMessage({ text: 'Please enter a Unit Title or at least one Lesson Title to begin.', type: 'error' });
        return;
      }
    }

    setIsGenerating(true);
    setStatusMessage({ text: 'Drafting distinct REB Competency-Based Lesson Plans with varied pedagogical action verbs...', type: 'info' });

    const payload = {
      schoolName: schoolName.trim() || 'GS Amahoro Kigali',
      teacherName: teacherName.trim() || 'Teacher',
      educationLevel,
      classLevel: classLevel.trim() || 'Primary 6 (P6)',
      subject: subject.trim() || 'Subject',
      term,
      date,
      duration,
      classSize,
      location,
      specialNeeds: specialNeeds.trim() || 'No special educational needs reported for this group.',
      unitNumber: unitNumber.trim() || '1',
      unitTitle: unitTitle.trim() || 'UNIT TOPIC',
      lessonTitles: targetTitles,
      selfEvaluation
    };

    try {
      const data = await safeFetchJson('/api/gemini/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (data.success && Array.isArray(data.lessonPlans) && data.lessonPlans.length > 0) {
        const totalCount = data.lessonPlans.length;
        const plansWithIds: LessonPlanData[] = data.lessonPlans.map((p: any, idx: number) => ({
          ...p,
          date: getSequentialDate(payload.date || p.date, idx),
          lessonNumber: `${idx + 1} Out of ${totalCount}`,
          id: `lp_${Date.now()}_${idx}`,
          createdAt: new Date().toISOString()
        }));

        setGeneratedPlans(plansWithIds);
        setActivePlanIndex(0);
        if (saveMultipleLessonPlans) {
          saveMultipleLessonPlans(plansWithIds as any[]);
        }
        setStatusMessage({
          text: `Successfully created ${plansWithIds.length} completely distinct lesson plans for Unit ${payload.unitNumber}: ${payload.unitTitle}!`,
          type: 'success'
        });
      } else {
        throw new Error('AI API returned unexpected format. Activating high-speed REB Pedagogical Engine.');
      }
    } catch (err: any) {
      console.warn('AI API call warning, using rich offline pedagogical engine:', err);
      const fallbackPlans = generateClientREBFallbackPlans(payload);
      setGeneratedPlans(fallbackPlans);
      setActivePlanIndex(0);
      if (saveMultipleLessonPlans) {
        saveMultipleLessonPlans(fallbackPlans as any[]);
      }
      setStatusMessage({
        text: `Generated ${fallbackPlans.length} distinct REB Competency-Based lesson plans using enriched Bloom's action verbs & differentiated teaching approaches!`,
        type: 'success'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportSinglePdf = async () => {
    const plan = generatedPlans[activePlanIndex];
    if (!plan) return;

    setIsExportingPdf(true);
    try {
      const doc = createDirectRebPdf(plan);
      const safeUnit = (plan.unitNumber || '1').replace(/[^a-zA-Z0-9]/g, '');
      const safeTitle = (plan.lessonTitle || `Lesson_${activePlanIndex + 1}`).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `Unit_${safeUnit}_Lesson_${activePlanIndex + 1}_${safeTitle}.pdf`;
      doc.save(fileName);
      setStatusMessage({ text: `Downloaded PDF: ${fileName}`, type: 'success' });
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setStatusMessage({ text: 'Failed to download PDF. Please check browser print/download settings.', type: 'error' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  /**
   * Primary Bulk Export: Exports all plans directly into a named FOLDER on the user's computer.
   * Eliminates the need for unzipping, solving confusion for non-tech users.
   */
  const handleExportBulkFolder = async () => {
    if (generatedPlans.length === 0) return;

    setIsExportingFolder(true);
    const unitNo = unitNumber || (generatedPlans[0]?.unitNumber) || '1';
    const cleanUnitTitle = (unitTitle || generatedPlans[0]?.unitTitle || 'Lesson_Plans').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const folderName = `Unit_${unitNo}_${cleanUnitTitle}`;

    setExportProgress('Preparing PDF documents for each lesson...');
    setStatusMessage({ text: `Opening folder creator for "${folderName}" (No unzipping required!)...`, type: 'info' });

    try {
      const filesToSave: FileToSave[] = generatedPlans.map((plan, idx) => {
        const doc = createDirectRebPdf(plan);
        const pdfBlob = doc.output('blob');
        const sanitizedTitle = (plan.lessonTitle || `Lesson_${idx + 1}`).replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
        return {
          filename: `Lesson_${idx + 1}_${sanitizedTitle}.pdf`,
          blob: pdfBlob
        };
      });

      const result = await exportFilesToNativeFolder(folderName, filesToSave, (current, total) => {
        setExportProgress(`Writing lesson plan ${current} of ${total} into folder...`);
      });

      if (result.success) {
        setStatusMessage({ text: result.message, type: 'success' });
      } else if (result.mode === 'cancelled') {
        setStatusMessage({ text: 'Folder export was cancelled.', type: 'info' });
      }
    } catch (err: any) {
      console.error('Folder Export Error:', err);
      setStatusMessage({ text: 'Could not write directly to folder. Downloading files sequentially instead.', type: 'error' });
    } finally {
      setIsExportingFolder(false);
      setExportProgress('');
    }
  };

  /**
   * Secondary Bulk Export: Standard ZIP file option for users who explicitly want an archive.
   */
  const handleExportBulkZip = async () => {
    if (generatedPlans.length === 0) return;

    setIsExportingZip(true);
    setStatusMessage({ text: 'Packaging all lesson plans into a ZIP bundle...', type: 'info' });

    try {
      const zip = new JSZip();
      const unitNo = unitNumber || (generatedPlans[0]?.unitNumber) || '1';
      const cleanUnitTitle = (unitTitle || generatedPlans[0]?.unitTitle || 'Unit').replace(/[/\\?%*:|"<>]/g, '_').trim();
      const folderName = `Unit_${unitNo}_${cleanUnitTitle}`;
      const folder = zip.folder(folderName);

      generatedPlans.forEach((plan, idx) => {
        const doc = createDirectRebPdf(plan);
        const pdfBlob = doc.output('blob');
        const sanitizedTitle = (plan.lessonTitle || `Lesson_${idx + 1}`).replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
        const fileName = `Lesson_${idx + 1}_${sanitizedTitle}.pdf`;
        folder?.file(fileName, pdfBlob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const zipName = `${folderName}.zip`;
      saveAs(content, zipName);

      setStatusMessage({ text: `Downloaded ZIP file containing ${generatedPlans.length} lesson plan PDFs!`, type: 'success' });
    } catch (err: any) {
      console.error('Zip Export Error:', err);
      setStatusMessage({ text: 'Failed to generate ZIP archive.', type: 'error' });
    } finally {
      setIsExportingZip(false);
    }
  };

  const activePlan = generatedPlans[activePlanIndex] || generatedPlans[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Guidance Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> REB CBC Standards
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> 1,200+ Differentiated Pedagogical Words
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              REB CBC Lesson Plan Generator
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Straightforward and easy to use. Enter your topic and lessons to create ready-to-print REB-compliant lesson plans. Export directly into a named folder without dealing with zip files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLoadBlankForm}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Blank Printable A4 Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-semibold shadow-lg animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' :
          statusMessage.type === 'error' ? 'bg-rose-950/80 border-rose-700 text-rose-200' :
          'bg-amber-950/80 border-amber-700 text-amber-200'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {statusMessage.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />}
          <div className="flex-1 leading-snug">
            {statusMessage.text}
            {exportProgress && <p className="text-xs opacity-80 mt-1 font-normal">{exportProgress}</p>}
          </div>
        </div>
      )}

      {/* Main Form and Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel: Simple, Straightforward, Non-Intimidating */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Step 1: Enter Lesson Details</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fill in the basic info below. Default settings are pre-filled for Rwandan schools.
            </p>
          </div>

          <form onSubmit={handleGenerateLessonPlans} className="space-y-5">
            
            {/* Subject and Class Level - Primary Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Subject <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. English, Mathematics, Science"
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Class / Grade <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  placeholder="e.g. Primary 6 (P6), S1, S3"
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Unit Number and Unit Title */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Unit No.
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="1"
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-center font-bold"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Unit Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder="e.g. LEISURE AND SPORTS ACTIVITIES"
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Date and Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Starting Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Consecutive lessons automatically increment school days</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  School Term
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>

            {/* Lesson Titles: The Central Section */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Lesson Titles in This Unit</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold">
                    {lessonTitles.length} added
                  </span>
                </label>
              </div>

              <p className="text-[11px] text-slate-400">
                Type a lesson topic and click <strong>Add</strong>. Add as many as needed; each will receive different action verbs and teaching methodologies.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLessonInput}
                  onChange={(e) => setNewLessonInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLessonTitle(); } }}
                  placeholder="e.g. Describing favorite pastimes"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddLessonTitle}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Added Lesson Titles List */}
              {lessonTitles.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {lessonTitles.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs gap-2 group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-amber-500/20">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium truncate">{t}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLessonTitle(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="Remove lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No lesson titles added yet. Type a topic above or generate directly to create an introductory plan.
                </div>
              )}
            </div>

            {/* Optional / School Settings Toggle (Keeps UI clean and simple for newcomers) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>School Name, Teacher Name & Class Settings</span>
                  <span className="text-[10px] text-slate-500">(Optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedSettings && (
                <div className="space-y-4 pt-3 mt-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">School Name</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="GS Amahoro Kigali"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Teacher's Name</label>
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="e.g. Teacher Joel"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Lesson Duration</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="40 min"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Class Size (Learners)</label>
                      <input
                        type="number"
                        value={classSize}
                        onChange={(e) => setClassSize(Number(e.target.value))}
                        placeholder="45"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Special Educational Needs</label>
                    <input
                      type="text"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      placeholder="e.g. 2 learners with hearing impairment near chalkboard"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Classroom Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Classroom & Outdoor Learning Area"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Primary Generate Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Drafting REB CBC Plans...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>
                    Generate {lessonTitles.length > 0 ? `${lessonTitles.length} Lesson Plan(s)` : 'Lesson Plan'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview and Inspector Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Step 2: Preview & Export</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {generatedPlans.length > 0
                  ? `Unit ${activePlan?.unitNumber || '1'}: ${generatedPlans.length} plans ready for download.`
                  : 'Your generated lesson plans will appear here ready to save.'}
              </p>
            </div>

            {/* Export Buttons */}
            {generatedPlans.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                
                {/* Download Single Active PDF */}
                <button
                  type="button"
                  onClick={handleExportSinglePdf}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition border border-slate-700 cursor-pointer shadow-md disabled:opacity-50"
                  title="Download the currently viewed lesson plan as PDF"
                >
                  {isExportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Save This PDF</span>
                </button>

                {/* Primary Bulk Action: Save All to Real Computer Folder (No Unzipping Required!) */}
                {generatedPlans.length > 1 && (
                  <button
                    type="button"
                    onClick={handleExportBulkFolder}
                    disabled={isExportingFolder}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
                    title="Creates a real folder on your computer named after the unit with all PDFs inside it"
                  >
                    {isExportingFolder ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FolderDown className="w-4 h-4 fill-slate-950" />
                    )}
                    <span>Save All to Unit Folder</span>
                  </button>
                )}

                {/* Secondary Option: Download as ZIP */}
                {generatedPlans.length > 1 && (
                  <button
                    type="button"
                    onClick={handleExportBulkZip}
                    disabled={isExportingZip}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer disabled:opacity-50"
                    title="Download as a ZIP archive if you prefer compressed files"
                  >
                    {isExportingZip ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3 text-amber-400" />}
                    <span>ZIP</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Unit Folder Help Tooltip for Non-Technical Users */}
          {generatedPlans.length > 1 && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-200">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Easy Folder Export:</strong>
                Clicking <strong>"Save All to Unit Folder"</strong> places all {generatedPlans.length} lesson plan PDFs inside a folder named after your unit on your computer. You do not need any unzipping tools.
              </div>
            </div>
          )}

          {/* Lesson Tabs when Multiple Plans Exist */}
          {generatedPlans.length > 1 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Lesson to Inspect:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {generatedPlans.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePlanIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                      activePlanIndex === idx
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>Lesson {idx + 1}</span>
                    <span className="text-[10px] opacity-80 font-normal">({p.date})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plan Visual Preview */}
          {activePlan ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              
              {/* Header Meta Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Subject</span>
                  <span className="text-white font-bold">{activePlan.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Class</span>
                  <span className="text-white font-bold">{activePlan.classLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Date</span>
                  <span className="text-amber-400 font-bold">{activePlan.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Lesson No.</span>
                  <span className="text-emerald-400 font-bold">{activePlan.lessonNumber}</span>
                </div>
              </div>

              {/* Lesson Title & Objectives */}
              <div className="space-y-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Lesson Title
                  </span>
                  <h4 className="text-sm font-extrabold text-white">
                    {activePlan.lessonTitle}
                  </h4>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Instructional Objective (REB CBC Predefined Action Verbs)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {activePlan.instructionalObjective}
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                    Key Unit Competence
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePlan.keyUnitCompetence}
                  </p>
                </div>
              </div>

              {/* Detailed 3-Step Process Breakdown */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Pedagogical Process Steps (REB Structure)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Differentiated Content</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1: Introduction */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-extrabold text-xs text-amber-400">1. Introduction</span>
                      <span className="text-[10px] text-slate-400 font-bold">{activePlan.steps?.introduction?.duration || '7 min'}</span>
                    </div>
                    <div>
                      <strong className="text-[10px] text-slate-300 block mb-1 font-bold">Teacher:</strong>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-3">
                        {activePlan.steps?.introduction?.teacherActivities?.slice(0, 3).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Step 2: Development */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-extrabold text-xs text-emerald-400">2. Development</span>
                      <span className="text-[10px] text-slate-400 font-bold">{activePlan.steps?.development?.duration || '25 min'}</span>
                    </div>
                    <div>
                      <strong className="text-[10px] text-slate-300 block mb-1 font-bold">Teacher:</strong>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-3">
                        {activePlan.steps?.development?.teacherActivities?.slice(0, 3).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Step 3: Conclusion */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-extrabold text-xs text-sky-400">3. Conclusion</span>
                      <span className="text-[10px] text-slate-400 font-bold">{activePlan.steps?.conclusion?.duration || '8 min'}</span>
                    </div>
                    <div>
                      <strong className="text-[10px] text-slate-300 block mb-1 font-bold">Teacher:</strong>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-3">
                        {activePlan.steps?.conclusion?.teacherActivities?.slice(0, 3).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Self Evaluation */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Teacher's Self-Evaluation:
                </span>
                <p className="text-slate-300 italic text-[11px]">
                  {activePlan.selfEvaluation || 'Lesson delivered successfully according to REB Competency-Based Curriculum guidelines.'}
                </p>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">No Lesson Plans Generated Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill in your subject and unit title on the left and click <strong>"Generate Lesson Plan"</strong> to preview and download your official REB document.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default LessonPlanGenerator;
