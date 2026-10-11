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

    // Title Header
    docxSections.push(
      new Paragraph({
        text: `REB COMPETENCY-BASED LESSON PLAN`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 140 }
      })
    );

    // Professional border styling
    const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: '2D3748' };
    const tableBorders = {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
      insideHorizontal: thinBorder,
      insideVertical: thinBorder
    };

    // School & Teacher Header Banner Table
    const schoolRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: 'F7FAFC' },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'School Name: ', bold: true, color: '1A202C' }),
                new TextRun({ text: plan.schoolName || 'GS Amahoro', bold: true, color: '2B6CB0' })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: 'F7FAFC' },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Teacher's Name: ", bold: true, color: '1A202C' }),
                new TextRun({ text: plan.teacherName || 'Teacher', bold: true, color: '2B6CB0' })
              ]
            })
          ]
        })
      ]
    });

    const metaHeaders = ['Term', 'Date', 'Subject', 'Class', 'Unit No', 'Lesson No', 'Duration', 'Class Size'];
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
      children: metaHeaders.map(h => new TableCell({
        width: { size: 12.5, type: WidthType.PERCENTAGE },
        shading: { fill: 'EDF2F7' },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, bold: true, size: 18, color: '1A202C' })]
          })
        ]
      }))
    });

    const metaValuesRow = new TableRow({
      children: metaValues.map((v, i) => new TableCell({
        width: { size: 12.5, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: v, size: 18, bold: i === 2 })]
          })
        ]
      }))
    });

    docxSections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: [schoolRow, metaHeadersRow, metaValuesRow]
      })
    );

    docxSections.push(new Paragraph({ spacing: { after: 120 } }));

    // Key Competences & Objectives Table
    const keyInfoRows = [
      { label: 'Type of special educational needs to be catered for in this lesson and number of learners in each category', value: plan.specialNeeds || 'Attention disorder (sit in the front row, visual cues)' },
      { label: 'Unit title', value: (plan.unitTitle || '').toUpperCase(), boldVal: true },
      { label: 'Key unit competence', value: plan.keyUnitCompetence || '' },
      { label: 'Title of the lesson', value: plan.lessonTitle || '', boldVal: true },
      { label: 'Instructional objectives', value: plan.instructionalObjective || '' },
      { label: 'Plan of this class (Location)', value: plan.location || 'Classroom / Science Corner' },
      { label: 'Learning materials', value: plan.learningMaterials || '' },
      { label: 'References', value: plan.references || '' }
    ].map(item => new TableRow({
      children: [
        new TableCell({
          width: { size: 32, type: WidthType.PERCENTAGE },
          shading: { fill: 'EDF2F7' },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.label, bold: true, size: 19, color: '1A202C' })]
            })
          ]
        }),
        new TableCell({
          width: { size: 68, type: WidthType.PERCENTAGE },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.value, size: 19, bold: item.boldVal })]
            })
          ]
        })
      ]
    }));

    docxSections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: keyInfoRows
      })
    );

    docxSections.push(new Paragraph({ spacing: { after: 140 } }));

    // Instructional Steps Table (Timing, Teacher, Learner, Competences)
    const stepsHeaderRow1 = new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: 'EDF2F7' },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Timing for each step', bold: true, size: 19 })] })]
        }),
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          columnSpan: 2,
          shading: { fill: 'EDF2F7' },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Description of teaching and learning activities', bold: true, size: 19 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: 'EDF2F7' },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Generic competences & cross-cutting issues', bold: true, size: 19 })] })]
        })
      ]
    });

    const summaryRow = new TableRow({
      children: [
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: 'FAFAFA' }, children: [new Paragraph('')] }),
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          columnSpan: 2,
          shading: { fill: 'F7FAFC' },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: plan.activitySummary || `Interactive learner-centered activities on ${(plan.lessonTitle || '').toLowerCase()}.`, italics: true, size: 18, color: '4A5568' })]
            })
          ]
        }),
        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: 'FAFAFA' }, children: [new Paragraph('')] })
      ]
    });

    const subHeaderRow = new TableRow({
      children: [
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: 'EDF2F7' }, children: [new Paragraph('')] }),
        new TableCell({
          width: { size: 27.5, type: WidthType.PERCENTAGE },
          shading: { fill: 'EDF2F7' },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Teacher's activity", bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 27.5, type: WidthType.PERCENTAGE },
          shading: { fill: 'EDF2F7' },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Learner's activity", bold: true, size: 18 })] })]
        }),
        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: 'EDF2F7' }, children: [new Paragraph('')] })
      ]
    });

    const stepRows: TableRow[] = [stepsHeaderRow1, summaryRow, subHeaderRow];

    const stepsList = [
      { name: 'Introduction', step: plan.steps?.introduction },
      { name: 'Lesson Development', step: plan.steps?.development },
      { name: 'Conclusion', step: plan.steps?.conclusion }
    ];

    stepsList.forEach(s => {
      if (!s.step) return;
      stepRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { fill: 'F7FAFC' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              children: [
                new Paragraph({ children: [new TextRun({ text: s.name, bold: true, size: 19 })] }),
                new Paragraph({ children: [new TextRun({ text: `(${s.step.duration || ''})`, italics: true, size: 17, color: '718096' })] })
              ]
            }),
            new TableCell({
              width: { size: 27.5, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              children: (s.step.teacherActivities || []).map(act => new Paragraph({
                children: [new TextRun({ text: `• ${act}`, size: 18 })],
                spacing: { after: 60 }
              }))
            }),
            new TableCell({
              width: { size: 27.5, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              children: (s.step.learnerActivities || []).map(act => new Paragraph({
                children: [new TextRun({ text: `• ${act}`, size: 18 })],
                spacing: { after: 60 }
              }))
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
              children: (s.step.competencesAndCrossCutting || []).map(comp => new Paragraph({
                children: [new TextRun({ text: `• ${comp}`, size: 18 })],
                spacing: { after: 60 }
              }))
            })
          ]
        })
      );
    });

    // Self Evaluation Row inside the main execution table
    stepRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'EDF2F7' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: "Teacher's self-evaluation", bold: true, size: 19 })] })]
          }),
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            columnSpan: 3,
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: plan.selfEvaluation || 'Lesson delivered effectively following official REB Competency-Based Curriculum guidelines. Instructional objectives met; learners actively engaged.', italics: true, size: 18, color: '2D3748' })]
              })
            ]
          })
        ]
      })
    );

    docxSections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
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
        properties: {},
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
