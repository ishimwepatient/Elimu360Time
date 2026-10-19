import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  HeadingLevel,
  Packer 
} from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { BankQuestion } from './kinyarwandaQuestionBankData';

export interface ExamSheetOptions {
  schoolName: string;
  examTitle: string;
  subject: string;
  classLevel: string;
  term: string;
  duration: string;
  includeAnswers: boolean;
}

/**
 * Export selected questions to an official Microsoft Word (.docx) exam paper
 */
export async function exportQuestionsToDocx(
  questions: BankQuestion[], 
  options: ExamSheetOptions
) {
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
  const borderThin = { style: BorderStyle.SINGLE, size: 6, color: '64748B' };
  const cellBorders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

  // Header Table for Student Name, Class, Marks
  const headerTable = new Table({
    width: { size: 10400, type: WidthType.DXA },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Izina ry\'Umunyeshuri / Student Name: ', bold: true, size: 20 }),
                  new TextRun({ text: '.........................................................', size: 20 })
                ]
              }),
              new Paragraph({
                spacing: { before: 80 },
                children: [
                  new TextRun({ text: `Ishuri / School: ${options.schoolName || 'GS Urwunge rw\'Amashuri'}`, size: 18 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 4400, type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Umwaka / Class: `, bold: true, size: 20 }),
                  new TextRun({ text: options.classLevel, size: 20 }),
                  new TextRun({ text: `  |  Igihe: ${options.duration || 'Iminota 40'}`, size: 18 })
                ]
              }),
              new Paragraph({
                spacing: { before: 80 },
                children: [
                  new TextRun({ text: `Amanota / Total Marks: `, bold: true, size: 20 }),
                  new TextRun({ text: `....... / ${totalMarks}`, bold: true, color: '0284C7', size: 22 })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const questionElements: Paragraph[] = [];

  questions.forEach((q, idx) => {
    // Question title & mark indicator
    questionElements.push(
      new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({ text: `Ikibazo cya ${idx + 1}. `, bold: true, size: 22, color: '0F172A' }),
          new TextRun({ text: q.questionText, size: 22, bold: true }),
          new TextRun({ text: `   [Amanota: ${q.marks || 1}]`, italics: true, size: 18, color: '475569' })
        ]
      })
    );

    // Options if multiple choice
    if (q.options && q.options.length > 0) {
      q.options.forEach(opt => {
        questionElements.push(
          new Paragraph({
            indent: { left: 400 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: opt, size: 20 })
            ]
          })
        );
      });
      // Blank answer line
      questionElements.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({ text: 'Igisubizo / Answer: .................................................................................', size: 18, color: '94A3B8' })
          ]
        })
      );
    } else {
      // Lines for open answers
      questionElements.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 80, after: 60 },
          children: [
            new TextRun({ text: '....................................................................................................................................................................................', color: '94A3B8', size: 18 })
          ]
        }),
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({ text: '....................................................................................................................................................................................', color: '94A3B8', size: 18 })
          ]
        })
      );
    }
  });

  // Optional Answer Key / Correction Guide
  const answerElements: Paragraph[] = [];
  if (options.includeAnswers) {
    answerElements.push(
      new Paragraph({
        spacing: { before: 600, after: 200 },
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({ text: '═══════════════════════════════════════════════════════════════', color: '94A3B8' })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({ text: 'AKARASO K\'IKOSORA (TEACHER\'S MARKING SCHEME & ANSWERS)', bold: true, size: 24, color: '0369A1' })
        ]
      })
    );

    questions.forEach((q, idx) => {
      answerElements.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Ikibazo ${idx + 1}: `, bold: true, size: 20 }),
            new TextRun({ text: q.correctAnswer, bold: true, color: '047857', size: 20 }),
            new TextRun({ text: ` — ${q.explanation}`, italics: true, color: '475569', size: 18 })
          ]
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: (options.schoolName || 'REB BASIC EDUCATION').toUpperCase(), bold: true, size: 26, color: '0F172A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({ text: options.examTitle || 'ISUZUMABUMENYI RY\'IKINYARWANDA N\'AMASOMO AFITANYE ISANO', bold: true, size: 22, color: '1E293B' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `Isomo: ${options.subject}  |  ${options.classLevel}  |  ${options.term || 'Igihembwe cya 1'}`, italics: true, size: 20, color: '475569' })
            ]
          }),
          headerTable,
          new Paragraph({ spacing: { before: 140, after: 100 } }),
          ...questionElements,
          ...answerElements
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (options.examTitle || 'Ikizamini').replace(/[/\\?%*:|"<>]/g, '_').trim();
  saveAs(blob, `${cleanTitle}_${options.classLevel}.docx`);
}

/**
 * Export selected questions to an official printable PDF
 */
export function exportQuestionsToPdf(
  questions: BankQuestion[], 
  options: ExamSheetOptions
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 14;
  let currentY = 16;
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text((options.schoolName || 'REB BASIC EDUCATION').toUpperCase(), 105, currentY, { align: 'center' });
  currentY += 6;

  doc.setFontSize(11);
  doc.text(options.examTitle || 'ISUZUMABUMENYI / EXAM PAPER', 105, currentY, { align: 'center' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Isomo: ${options.subject} | Umwaka: ${options.classLevel} | Igihe: ${options.duration || '40 min'} | Amanota: ${totalMarks}`, 105, currentY, { align: 'center' });
  currentY += 6;

  // Header Box
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, 182, 14);
  doc.setFontSize(8.5);
  doc.text('Izina ry\'Umunyeshuri: ..........................................................................', marginX + 3, currentY + 5.5);
  doc.text('Ishuri: ' + (options.schoolName || 'GS Rwanda'), marginX + 3, currentY + 10.5);
  doc.text(`Amanota: ........ / ${totalMarks}`, marginX + 130, currentY + 8);
  currentY += 18;

  questions.forEach((q, idx) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const qHead = `Ikibazo ${idx + 1}. ${q.questionText} [Amanota: ${q.marks || 1}]`;
    const lines = doc.splitTextToSize(qHead, 180);
    lines.forEach((l: string) => {
      doc.text(l, marginX, currentY);
      currentY += 4.5;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    if (q.options && q.options.length > 0) {
      q.options.forEach(opt => {
        doc.text(`    ${opt}`, marginX + 4, currentY);
        currentY += 4;
      });
      doc.text('    Igisubizo: .....................................................................................................', marginX + 4, currentY);
      currentY += 6;
    } else {
      doc.text('    ........................................................................................................................................................', marginX + 4, currentY);
      currentY += 4.5;
      doc.text('    ........................................................................................................................................................', marginX + 4, currentY);
      currentY += 6;
    }
  });

  const cleanTitle = (options.examTitle || 'Ikizamini').replace(/[/\\?%*:|"<>]/g, '_').trim();
  doc.save(`${cleanTitle}_${options.classLevel}.pdf`);
}
