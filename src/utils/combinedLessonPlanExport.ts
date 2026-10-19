import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  AlignmentType,
  PageBreak
} from 'docx';
import { exportFilesToNativeFolder, FileToSave } from './folderExportHelper';
import { LessonPlanData } from '../types';

/**
 * High-speed vector A4 PDF renderer for a single lesson plan.
 * Used for both individual plan rendering and multi-page combined exports.
 */
export function renderLessonPlanToPdfDoc(doc: jsPDF, plan: LessonPlanData, isFirstPlan: boolean = true): void {
  if (!isFirstPlan) {
    doc.addPage();
  }

  const marginX = 10;
  let currentY = 10;
  const pageWidth = 190;

  const isKinyarwanda = 
    plan.subject?.toLowerCase().includes('kinyarwanda') ||
    plan.subject?.toLowerCase().includes('imibare') ||
    plan.subject?.toLowerCase().includes('ibidukikije') ||
    plan.subject?.toLowerCase().includes('ubugeni') ||
    plan.steps?.introduction?.teacherActivities?.[0]?.includes('abanyeshuri') ||
    plan.lessonNumber?.includes('kuri') ||
    (plan as any).language === 'kinyarwanda';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(isKinyarwanda ? "ITEGURIRO RY'ISOMO" : "LESSON PLAN", 105, currentY, { align: 'center' });
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
  doc.text(`${isKinyarwanda ? 'Ishuri' : 'School Name'}: ${plan.schoolName || ''}`, marginX + 2, currentY + 3.8);
  doc.text(`${isKinyarwanda ? 'Umwarimu' : "Teacher's Name"}: ${plan.teacherName || ''}`, marginX + 100, currentY + 3.8);
  currentY += 5.5;

  // Metadata Headers & Values
  const cols = isKinyarwanda ? [
    { name: 'Igihembwe', val: plan.term, w: 18 },
    { name: 'Itariki', val: plan.date, w: 22 },
    { name: 'Isomo', val: plan.subject, w: 25 },
    { name: 'Umwaka', val: plan.classLevel, w: 26 },
    { name: 'Umutwe', val: plan.unitNumber, w: 16 },
    { name: 'Isomo No', val: plan.lessonNumber, w: 24 },
    { name: 'Igihe', val: plan.duration, w: 22 },
    { name: 'Abanyeshuri', val: `${plan.classSize || ''}`, w: 37 }
  ] : [
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
  const snHeight = Math.max(7, calcHeight(plan.specialNeeds || (isKinyarwanda ? 'Nta bibazo byihariye byagaragaye' : 'None'), snValW, 7, 7));

  drawBox(marginX, currentY, snLabelW, snHeight, isKinyarwanda ? "Abafite ibibazo byihariye mu myigire n'umubare wabo muri buri cyiciro" : 'Type of special educational needs to be catered for in this lesson and number of learners in each category', { bold: true, bg: true, fontSize: 6.5 });
  drawBox(marginX + snLabelW, currentY, snValW, snHeight, plan.specialNeeds || (isKinyarwanda ? 'Abanyeshuri bakeneye ubufasha bicajwe imbere.' : 'None'), { fontSize: 7 });
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

  renderRow(isKinyarwanda ? "Umutwe w'isomo" : 'Unit title', (plan.unitTitle || '').toUpperCase(), 5.5, true);
  renderRow(isKinyarwanda ? "Ubushobozi bw'ingenzi bwitezwe ku mutwe" : 'Key unit competence', plan.keyUnitCompetence || '', 6);
  renderRow(isKinyarwanda ? "Umutwe w'isomo ry'uyu munsi" : 'Title of the lesson', plan.lessonTitle || '', 5.5, true);
  renderRow(isKinyarwanda ? "Intego y'isomo" : 'Instructional objectives', plan.instructionalObjective || '', 7);
  renderRow(isKinyarwanda ? "Aho isomo riberera" : 'Plan of this class (Location)', plan.location || (isKinyarwanda ? 'Mu ishuri' : 'Classroom'), 5);
  renderRow(isKinyarwanda ? "Imfashanyigisho" : 'Learning materials', plan.learningMaterials || '', 5.5);
  renderRow(isKinyarwanda ? "Ibitabo byifashishijwe" : 'References', plan.references || '', 6);

  currentY += 1.5;

  // Process Table Headers
  const col1W = 32;
  const col2W = 106;
  const col3W = 52;

  if (currentY + 12 > 282) {
    doc.addPage();
    currentY = 12;
  }

  drawBox(marginX, currentY, col1W, 4.5, isKinyarwanda ? "Intambwe n'igihe" : 'Timing for each step', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W, currentY, col2W, 4.5, isKinyarwanda ? "Ibisobanuro by'ibikorwa byo kwigisha no kwiga" : 'Description of teaching and learning activities', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 4.5, isKinyarwanda ? "Ubushobozi n'ingingo ngiro" : 'Generic competences & cross-cutting issues', { bold: true, bg: true, align: 'center', fontSize: 7 });
  currentY += 4.5;

  // Activity Summary row
  const summaryH = Math.max(4.5, calcHeight(plan.activitySummary || '', col2W, 4.5, 6.5));
  if (currentY + summaryH > 282) {
    doc.addPage();
    currentY = 12;
  }
  drawBox(marginX, currentY, col1W, summaryH, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W, summaryH, plan.activitySummary || (isKinyarwanda ? 'Abanyeshuri bafatanya mu matsinda kwiga ku ngingo z\'isomo.' : ''), { align: 'center', fontSize: 6.5 });
  drawBox(marginX + col1W + col2W, currentY, col3W, summaryH, '', { bg: true });
  currentY += summaryH;

  // Subheaders
  if (currentY + 4 > 282) {
    doc.addPage();
    currentY = 12;
  }
  drawBox(marginX, currentY, col1W, 3.8, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W / 2, 3.8, isKinyarwanda ? "Imirimo y'umwarimu" : "Teacher's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + (col2W / 2), currentY, col2W / 2, 3.8, isKinyarwanda ? "Imirimo y'umunyeshuri" : "Learner's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 3.8, '', { bg: true });
  currentY += 3.8;

  // Steps
  const stepItems = [
    { name: isKinyarwanda ? 'Intangiriro' : 'Introduction', step: plan.steps?.introduction },
    { name: isKinyarwanda ? "Iterambere ry'isomo" : 'Lesson Development', step: plan.steps?.development },
    { name: isKinyarwanda ? "Umwanzuro n'isuzumabumenyi" : 'Conclusion', step: plan.steps?.conclusion }
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
  const selfEvalText = plan.selfEvaluation || (isKinyarwanda ? 'Intego y\'isomo yagezweho ku buryo bushimishije; abanyeshuri bitabiriye neza.' : 'Lesson delivered effectively.');
  const selfEvalHeight = Math.max(12, calcHeight(selfEvalText, 140, 12, 7));

  if (currentY + selfEvalHeight + 2 > 282) {
    doc.addPage();
    currentY = 12;
  }

  drawBox(marginX, currentY, 50, selfEvalHeight, isKinyarwanda ? "Isuzuma ry'umwarimu ku isomo rye" : "Teacher's Self-Evaluation", { bold: true, bg: true, fontSize: 7 });
  drawBox(marginX + 50, currentY, 140, selfEvalHeight, selfEvalText, { fontSize: 7 });
}

/**
 * 1. SINGLE COMBINED PDF:
 * Combines all lesson plans in the unit into a single PDF document.
 * Each lesson plan starts cleanly on its own dedicated page.
 */
export async function exportPlansToCombinedPdf(
  plans: LessonPlanData[], 
  filenameBase?: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  if (!plans || plans.length === 0) throw new Error('No lesson plans to export');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  for (let i = 0; i < plans.length; i++) {
    renderLessonPlanToPdfDoc(doc, plans[i], i === 0);
    if (onProgress) onProgress(i + 1, plans.length);
  }

  const unitNo = (plans[0]?.unitNumber || '1').replace(/[^a-zA-Z0-9]/g, '');
  const cleanTitle = (filenameBase || plans[0]?.unitTitle || 'Unit_Lesson_Plans')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim()
    .substring(0, 40);
  const finalFilename = `Unit_${unitNo}_All_Lessons_Combined_${cleanTitle}.pdf`;

  doc.save(finalFilename);
  return finalFilename;
}

/**
 * 2. SINGLE COMBINED WORD (.DOCX) DOCUMENT:
 * Combines all lesson plans into a single Word document.
 * Each lesson plan is separated by a page break so each plan is on its own page!
 */
export async function exportPlansToCombinedDocx(
  plans: LessonPlanData[], 
  filenameBase?: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  if (!plans || plans.length === 0) throw new Error('No lesson plans to export');

  const docxSections: (Paragraph | Table)[] = [];

  plans.forEach((plan, planIdx) => {
    // If not first plan, insert explicit PageBreak so each plan starts on its own page!
    if (planIdx > 0) {
      docxSections.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    }

    // Detect if plan is in Kinyarwanda
    const isKinyarwanda = 
      plan.subject?.toLowerCase().includes('kinyarwanda') ||
      plan.subject?.toLowerCase().includes('imibare') ||
      plan.subject?.toLowerCase().includes('ibidukikije') ||
      plan.subject?.toLowerCase().includes('ubugeni') ||
      plan.steps?.introduction?.teacherActivities?.[0]?.includes('abanyeshuri') ||
      (plan as any).language === 'kinyarwanda';

    // Title Header
    docxSections.push(
      new Paragraph({
        text: isKinyarwanda ? `ITEGURIRO RY'ISOMO` : `REB COMPETENCY-BASED LESSON PLAN`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 140 }
      })
    );

    // Professional border styling (crisp slate-700 hairline borders)
    const tableBorder = { style: BorderStyle.SINGLE, size: 6, color: '334155' };
    const tableBorders = {
      top: tableBorder,
      bottom: tableBorder,
      left: tableBorder,
      right: tableBorder,
      insideHorizontal: tableBorder,
      insideVertical: tableBorder
    };

    // Standard printable width for A4 with 0.5 inch (720 dxa) margins:
    // Page width = 11906 dxa. Margins: 720 + 720 = 1440 dxa.
    // Usable printable content width = 10466 dxa (we set tables to 10400 dxa full horizontal width).
    const TOTAL_TABLE_WIDTH = 10400;

    // Table 1 Header: School & Teacher Name (2 equal columns: 5200 dxa each)
    const schoolRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 5200, type: WidthType.DXA },
          shading: { fill: 'F1F5F9' },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: isKinyarwanda ? 'Ishuri: ' : 'School Name: ', bold: true, size: 19, font: 'Calibri', color: '0F172A' }),
                new TextRun({ text: plan.schoolName || (isKinyarwanda ? 'Urwunge rw\'Amashuri Amahoro' : 'GS Amahoro'), bold: true, size: 19, font: 'Calibri', color: '1E40AF' })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 5200, type: WidthType.DXA },
          shading: { fill: 'F1F5F9' },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: isKinyarwanda ? "Umwarimu: " : "Teacher's Name: ", bold: true, size: 19, font: 'Calibri', color: '0F172A' }),
                new TextRun({ text: plan.teacherName || (isKinyarwanda ? 'Umwarimu' : 'Teacher'), bold: true, size: 19, font: 'Calibri', color: '1E40AF' })
              ]
            })
          ]
        })
      ]
    });

    // 8 Metadata columns totaling 10400 dxa:
    // [Term: 1100, Date: 1200, Subject: 1500, Class: 1200, Unit No: 1200, Lesson No: 1300, Duration: 1400, Class Size: 1500] = 10400
    const metaColWidths = [1100, 1200, 1500, 1200, 1200, 1300, 1400, 1500];
    const metaHeaders = isKinyarwanda 
      ? ['Igihembwe', 'Itariki', 'Isomo', 'Umwaka', 'Umutwe', 'Isomo No', 'Igihe', 'Abanyeshuri']
      : ['Term', 'Date', 'Subject', 'Class', 'Unit No', 'Lesson No', 'Duration', 'Class Size'];
    const metaValues = [
      plan.term || 'Term 1',
      plan.date || '',
      plan.subject || '',
      plan.classLevel || '',
      plan.unitNumber || '1',
      plan.lessonNumber || `Lesson ${planIdx + 1}`,
      plan.duration || '40 min',
      String(plan.classSize || 45)
    ];

    const metaHeadersRow = new TableRow({
      children: metaHeaders.map((h, i) => new TableCell({
        width: { size: metaColWidths[i], type: WidthType.DXA },
        shading: { fill: 'E2E8F0' },
        margins: { top: 70, bottom: 70, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, bold: true, size: 17, font: 'Calibri', color: '0F172A' })]
          })
        ]
      }))
    });

    const metaValuesRow = new TableRow({
      children: metaValues.map((v, i) => new TableCell({
        width: { size: metaColWidths[i], type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: v, size: 17, font: 'Calibri', bold: i === 2 })]
          })
        ]
      }))
    });

    docxSections.push(
      new Table({
        width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: metaColWidths,
        borders: tableBorders,
        rows: [schoolRow, metaHeadersRow, metaValuesRow]
      })
    );

    docxSections.push(new Paragraph({ spacing: { after: 100 } }));

    // Key Competences & Objectives Table (2 columns: 2800 dxa label, 7600 dxa value = 10400 dxa)
    const keyInfoRows = [
      { 
        label: isKinyarwanda ? "Abafite ibibazo byihariye mu myigire n'umubare wabo muri buri cyiciro" : 'Type of special educational needs to be catered for in this lesson and number of learners in each category', 
        value: plan.specialNeeds || (isKinyarwanda ? 'Abanyeshuri bafite intege nke bafashishwa imfashanyigisho zifatika bicaye imbere.' : 'Attention disorder (sit in the front row, visual cues)') 
      },
      { label: isKinyarwanda ? "Umutwe w'isomo" : 'Unit title', value: (plan.unitTitle || '').toUpperCase(), boldVal: true },
      { label: isKinyarwanda ? "Ubushobozi bw'ingenzi bwitezwe ku mutwe" : 'Key unit competence', value: plan.keyUnitCompetence || '' },
      { label: isKinyarwanda ? "Umutwe w'isomo ry'uyu munsi" : 'Title of the lesson', value: plan.lessonTitle || '', boldVal: true },
      { label: isKinyarwanda ? "Intego y'isomo" : 'Instructional objectives', value: plan.instructionalObjective || '' },
      { label: isKinyarwanda ? "Aho isomo riberera" : 'Plan of this class (Location)', value: plan.location || (isKinyarwanda ? 'Mu ishuri' : 'Classroom / Science Corner') },
      { label: isKinyarwanda ? "Imfashanyigisho" : 'Learning materials', value: plan.learningMaterials || '' },
      { label: isKinyarwanda ? "Ibitabo byifashishijwe" : 'References', value: plan.references || '' }
    ].map(item => new TableRow({
      children: [
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          shading: { fill: 'F1F5F9' },
          margins: { top: 70, bottom: 70, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.label, bold: true, size: 17, font: 'Calibri', color: '0F172A' })]
            })
          ]
        }),
        new TableCell({
          width: { size: 7600, type: WidthType.DXA },
          margins: { top: 70, bottom: 70, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.value, size: 17, font: 'Calibri', bold: item.boldVal })]
            })
          ]
        })
      ]
    }));

    docxSections.push(
      new Table({
        width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [2800, 7600],
        borders: tableBorders,
        rows: keyInfoRows
      })
    );

    docxSections.push(new Paragraph({ spacing: { after: 120 } }));

    // Main Execution Table: 4 columns across full 10400 dxa:
    // Col 1 (Timing): 1800 dxa
    // Col 2 (Teacher's activity): 3100 dxa
    // Col 3 (Learner's activity): 3100 dxa
    // Col 4 (Competences & Cross-Cutting): 2400 dxa
    // Sum = 1800 + 3100 + 3100 + 2400 = 10400 dxa
    const executionColWidths = [1800, 3100, 3100, 2400];

    const stepsHeaderRow1 = new TableRow({
      children: [
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          shading: { fill: 'E2E8F0' },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isKinyarwanda ? "Intambwe n'igihe" : 'Timing for each step', bold: true, size: 17, font: 'Calibri' })] })]
        }),
        new TableCell({
          width: { size: 6200, type: WidthType.DXA },
          columnSpan: 2,
          shading: { fill: 'E2E8F0' },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isKinyarwanda ? "Ibisobanuro by'ibikorwa byo kwigisha no kwiga" : 'Description of teaching and learning activities', bold: true, size: 17, font: 'Calibri' })] })]
        }),
        new TableCell({
          width: { size: 2400, type: WidthType.DXA },
          shading: { fill: 'E2E8F0' },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isKinyarwanda ? "Ubushobozi n'ingingo ngiro" : 'Generic competences & cross-cutting issues', bold: true, size: 17, font: 'Calibri' })] })]
        })
      ]
    });

    const summaryRow = new TableRow({
      children: [
        new TableCell({ width: { size: 1800, type: WidthType.DXA }, shading: { fill: 'F8FAFC' }, children: [new Paragraph('')] }),
        new TableCell({
          width: { size: 6200, type: WidthType.DXA },
          columnSpan: 2,
          shading: { fill: 'F8FAFC' },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: plan.activitySummary || (isKinyarwanda ? `Abanyeshuri bafatanya mu matsinda kwiga kuri ${(plan.lessonTitle || '').toLowerCase()}.` : `Interactive learner-centered activities on ${(plan.lessonTitle || '').toLowerCase()}.`), italics: true, size: 16, font: 'Calibri', color: '475569' })]
            })
          ]
        }),
        new TableCell({ width: { size: 2400, type: WidthType.DXA }, shading: { fill: 'F8FAFC' }, children: [new Paragraph('')] })
      ]
    });

    const subHeaderRow = new TableRow({
      children: [
        new TableCell({ width: { size: 1800, type: WidthType.DXA }, shading: { fill: 'F1F5F9' }, children: [new Paragraph('')] }),
        new TableCell({
          width: { size: 3100, type: WidthType.DXA },
          shading: { fill: 'F1F5F9' },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: isKinyarwanda ? "Imirimo y'umwarimu" : "Teacher's activity", bold: true, size: 16, font: 'Calibri' })] })]
        }),
        new TableCell({
          width: { size: 3100, type: WidthType.DXA },
          shading: { fill: 'F1F5F9' },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: isKinyarwanda ? "Imirimo y'umunyeshuri" : "Learner's activity", bold: true, size: 16, font: 'Calibri' })] })]
        }),
        new TableCell({ width: { size: 2400, type: WidthType.DXA }, shading: { fill: 'F1F5F9' }, children: [new Paragraph('')] })
      ]
    });

    const stepRows: TableRow[] = [stepsHeaderRow1, summaryRow, subHeaderRow];

    const stepsList = [
      { name: isKinyarwanda ? 'Intangiriro' : 'Introduction', step: plan.steps?.introduction },
      { name: isKinyarwanda ? "Iterambere ry'isomo" : 'Lesson Development', step: plan.steps?.development },
      { name: isKinyarwanda ? "Umwanzuro n'isuzumabumenyi" : 'Conclusion', step: plan.steps?.conclusion }
    ];

    stepsList.forEach(s => {
      if (!s.step) return;
      stepRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1800, type: WidthType.DXA },
              shading: { fill: 'F8FAFC' },
              margins: { top: 70, bottom: 70, left: 80, right: 80 },
              children: [
                new Paragraph({ children: [new TextRun({ text: s.name, bold: true, size: 17, font: 'Calibri' })] }),
                new Paragraph({ children: [new TextRun({ text: `(${s.step.duration || ''})`, italics: true, size: 15, font: 'Calibri', color: '64748B' })] })
              ]
            }),
            new TableCell({
              width: { size: 3100, type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 80, right: 80 },
              children: (s.step.teacherActivities || []).map(act => new Paragraph({
                children: [new TextRun({ text: `• ${act}`, size: 16, font: 'Calibri' })],
                spacing: { after: 40 }
              }))
            }),
            new TableCell({
              width: { size: 3100, type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 80, right: 80 },
              children: (s.step.learnerActivities || []).map(act => new Paragraph({
                children: [new TextRun({ text: `• ${act}`, size: 16, font: 'Calibri' })],
                spacing: { after: 40 }
              }))
            }),
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              margins: { top: 70, bottom: 70, left: 80, right: 80 },
              children: (s.step.competencesAndCrossCutting || []).map(comp => new Paragraph({
                children: [new TextRun({ text: `• ${comp}`, size: 16, font: 'Calibri' })],
                spacing: { after: 40 }
              }))
            })
          ]
        })
      );
    });

    // Self Evaluation Row inside the main execution table (spanning the 3 description & competence columns)
    stepRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            shading: { fill: 'F1F5F9' },
            margins: { top: 70, bottom: 70, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: isKinyarwanda ? "Isuzuma ry'umwarimu ku isomo rye" : "Teacher's self-evaluation", bold: true, size: 17, font: 'Calibri' })] })]
          }),
          new TableCell({
            width: { size: 8600, type: WidthType.DXA },
            columnSpan: 3,
            margins: { top: 70, bottom: 70, left: 100, right: 100 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: plan.selfEvaluation || (isKinyarwanda ? 'Intego y\'isomo yagezweho neza; abanyeshuri bagize uruhare mu bikorwa byo mu matsinda.' : 'Lesson delivered effectively following official REB Competency-Based Curriculum guidelines. Instructional objectives met; learners actively engaged.'), italics: true, size: 16, font: 'Calibri', color: '1E293B' })]
              })
            ]
          })
        ]
      })
    );

    docxSections.push(
      new Table({
        width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: executionColWidths,
        borders: tableBorders,
        rows: stepRows
      })
    );

    docxSections.push(new Paragraph({ spacing: { after: 120 } }));

    if (onProgress) onProgress(planIdx + 1, plans.length);
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 Portrait width in twips (210mm)
              height: 16838 // A4 Portrait height in twips (297mm)
            },
            margin: {
              top: 720,    // 0.5 inch margins
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children: docxSections
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const unitNo = (plans[0]?.unitNumber || '1').replace(/[^a-zA-Z0-9]/g, '');
  const cleanTitle = (filenameBase || plans[0]?.unitTitle || 'Unit_Lesson_Plans')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim()
    .substring(0, 40);
  const finalFilename = `Unit_${unitNo}_All_Lessons_Combined_${cleanTitle}.docx`;

  saveAs(blob, finalFilename);
  return finalFilename;
}

/**
 * 3. SEPARATE INDIVIDUAL FILES IN FOLDER:
 * Exports each lesson plan into its own separate PDF inside a real computer folder.
 */
export async function exportPlansToBulkFolderHelper(
  plans: LessonPlanData[],
  folderName: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; mode: 'folder' | 'batch_download' | 'cancelled'; message: string }> {
  const filesToSave: FileToSave[] = plans.map((plan, idx) => {
    const singleDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    renderLessonPlanToPdfDoc(singleDoc, plan, true);
    const pdfBlob = singleDoc.output('blob');
    const sanitizedTitle = (plan.lessonTitle || `Lesson_${idx + 1}`).replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
    return {
      filename: `Lesson_${idx + 1}_${sanitizedTitle}.pdf`,
      blob: pdfBlob
    };
  });

  return await exportFilesToNativeFolder(folderName, filesToSave, onProgress);
}

/**
 * 4. SEPARATE INDIVIDUAL FILES IN ZIP:
 * Packages each lesson plan into its own PDF inside a ZIP archive.
 */
export async function exportPlansToBulkZipHelper(
  plans: LessonPlanData[],
  zipName: string
): Promise<string> {
  const zip = new JSZip();
  const folder = zip.folder(zipName.replace('.zip', ''));

  plans.forEach((plan, idx) => {
    const singleDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    renderLessonPlanToPdfDoc(singleDoc, plan, true);
    const pdfBlob = singleDoc.output('blob');
    const sanitizedTitle = (plan.lessonTitle || `Lesson_${idx + 1}`).replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
    const fileName = `Lesson_${idx + 1}_${sanitizedTitle}.pdf`;
    folder?.file(fileName, pdfBlob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
  return zipName;
}
