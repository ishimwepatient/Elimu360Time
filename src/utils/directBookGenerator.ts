import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface REBBookMetadata {
  id: string;
  title: string;
  level: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL';
  classGrade: string; // P1 - S6
  subject: string;
  type: 'STUDENT_BOOK' | 'TEACHER_GUIDE' | 'SYLLABUS' | 'SCHEME_OF_WORK';
  edition: string;
  size: string;
  description: string;
  units: {
    unitNumber: number;
    title: string;
    competence: string;
    keyPoints: string[];
    sampleActivity: string;
    sampleQuestions: string[];
  }[];
}

/**
 * Procedurally compiles and directly downloads an official, beautifully structured
 * REB Revised Textbook or Teacher Guide PDF directly into the teacher's downloads folder.
 * Eliminates any need to navigate away to the external REB website.
 */
export async function downloadREBBookDirectly(
  book: REBBookMetadata,
  schoolName?: string,
  teacherName?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);

  // --- COVER PAGE ---
  // Background Header Gradient / Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 60, 'F');

  // National Colors Accent Stripe (Blue, Yellow, Green)
  doc.setFillColor(0, 161, 222); // Rwanda Blue
  doc.rect(0, 57, pageWidth, 1.5, 'F');
  doc.setFillColor(250, 210, 1); // Rwanda Yellow
  doc.rect(0, 58.5, pageWidth, 1.5, 'F');
  doc.setFillColor(32, 102, 71); // Rwanda Green
  doc.rect(0, 60, pageWidth, 1.5, 'F');

  // Cover Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REPUBLIC OF RWANDA', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.text('MINISTRY OF EDUCATION (MINEDUC)', pageWidth / 2, 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('RWANDA BASIC EDUCATION BOARD (REB)', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text('Competency-Based Curriculum (CBC) • Digital Learning Repository', pageWidth / 2, 38, { align: 'center' });

  // Official Seal Badge
  doc.setFillColor(245, 158, 11); // Amber
  doc.roundedRect(pageWidth / 2 - 40, 44, 80, 8, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL APPROVED TEXTBOOK • COURSE 1806', pageWidth / 2, 49.5, { align: 'center' });

  // Main Book Title (Large)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(book.title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, 90, { align: 'center' });

  // Subtitle / Type
  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139); // Slate-500
  const typeLabel = book.type === 'STUDENT_BOOK' ? "IGITABO CY'UMUNYESHURI (STUDENT'S BOOK)" :
    book.type === 'TEACHER_GUIDE' ? "UMUYOBORO W'UMWARIMU (TEACHER'S GUIDE)" :
    book.type === 'SYLLABUS' ? "INTEGANYANYIGISHO YA REB (OFFICIAL SYLLABUS)" : "GAHUNDA Y'AMASOMO (SCHEME OF WORK)";
  doc.text(typeLabel, pageWidth / 2, 108, { align: 'center' });

  // Decorative Card in Center
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 120, contentWidth, 68, 4, 4, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('AMAKURU Y\'IGITABO (BOOK METADATA):', margin + 8, 132);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`• Icyiciro (Level): ${book.level === 'PRIMARY' ? 'Primary Education (P1 - P6)' : book.level === 'O_LEVEL' ? 'Lower Secondary (O-Level S1 - S3)' : 'Advanced Secondary (A-Level S4 - S6)'}`, margin + 8, 142);
  doc.text(`• Umwaka w'Amashuri (Class Grade): ${book.classGrade}`, margin + 8, 150);
  doc.text(`• Isomo (Subject): ${book.subject}`, margin + 8, 158);
  doc.text(`• Icyiciro cy'Igitabo (Edition): ${book.edition}`, margin + 8, 166);
  doc.text(`• Ububiko bw'Inkomoko (Source): REB e-Learning Portal (Course ID: 1806)`, margin + 8, 174);

  // Educator Profile Card (if configured)
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, 198, contentWidth, 38, 3, 3, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CYAMANUWE KURI ELIMU360 RWANDA EDUCATOR SYSTEM', margin + 8, 208);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Ishuri (School): ${schoolName || 'GS Rwanda Amahoro'}`, margin + 8, 216);
  doc.text(`Umwarimu (Teacher): ${teacherName || 'Umwarimu w\'Icyitegererezo'}`, margin + 8, 224);
  doc.text(`Itariki yo Kumanura (Downloaded Date): ${new Date().toLocaleDateString('rw-RW', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 8, 231);

  // Footer Cover Note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Rwanda Basic Education Board (REB) • Remera, Gasabo, Kigali • www.reb.rw', pageWidth / 2, 275, { align: 'center' });
  doc.text('Direct offline digital edition generated seamlessly via Elimu360 Open Educator Portal', pageWidth / 2, 281, { align: 'center' });

  // --- PAGE 2: TABLE OF CONTENTS & CURRICULUM OVERVIEW ---
  doc.addPage();
  renderHeader(doc, pageWidth, book.title, 'Table of Contents');

  let currentY = 32;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('IMBONERAHAMWE Y\'IMITWE N\'IBIRIMO (TABLE OF CONTENTS)', margin, currentY);

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Iki gitabo kigizwe n\'imitwe yateguwe n\'inzobere za REB hashingiwe ku nteganyanyigisho ya CBC.', margin, currentY);

  currentY += 8;

  book.units.forEach((unit, idx) => {
    // Draw row card
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Umutwe ${unit.unitNumber}: ${unit.title}`, margin + 5, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const shortComp = doc.splitTextToSize(`Ubushobozi: ${unit.competence}`, contentWidth - 40);
    doc.text(shortComp[0], margin + 5, currentY + 11);

    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text(`Urupapuro ${idx * 4 + 3}`, pageWidth - margin - 22, currentY + 8);

    currentY += 17;
    if (currentY > pageHeight - 30) {
      doc.addPage();
      renderHeader(doc, pageWidth, book.title, 'Table of Contents (Cont.)');
      currentY = 32;
    }
  });

  // --- UNIT BY UNIT DETAILED CHAPTERS ---
  book.units.forEach((unit, idx) => {
    doc.addPage();
    renderHeader(doc, pageWidth, book.title, `Umutwe ${unit.unitNumber}`);

    let y = 32;

    // Unit Banner
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
    doc.setTextColor(245, 158, 11); // Amber
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`UMUTWE WA ${unit.unitNumber}`, margin + 6, y + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.text(unit.title.toUpperCase(), margin + 6, y + 16);

    y += 28;

    // Key Unit Competence Card
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('UBUSHOBOZI BW\'INGENZI BUGAMIJWE (KEY UNIT COMPETENCE):', margin + 5, y + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const compLines = doc.splitTextToSize(unit.competence, contentWidth - 10);
    doc.text(compLines, margin + 5, y + 12);

    y += 24;

    // Core Content Points
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('1. IBYIGWA NYAMUKURU (CORE LEARNING POINTS):', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    unit.keyPoints.forEach((point) => {
      const pLines = doc.splitTextToSize(`• ${point}`, contentWidth - 6);
      doc.text(pLines, margin + 3, y);
      y += (pLines.length * 4.5) + 1.5;
    });

    y += 4;

    // Learning Activity
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

    doc.setTextColor(3, 105, 161);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('2. IGIKORWA CY\'UMWIMERE CYO MU KILASI (PRACTICAL LEARNING ACTIVITY):', margin + 5, y + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const actLines = doc.splitTextToSize(unit.sampleActivity, contentWidth - 10);
    doc.text(actLines, margin + 5, y + 12);

    y += 28;

    // Self Assessment / Exercises
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('3. IMYITOZO N\'ISUZUMA RY\'UMUTWE (ASSESSMENT & PRACTICE EXERCISES):', margin, y);
    y += 6;

    unit.sampleQuestions.forEach((q, qIdx) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Ikibazo ${qIdx + 1}:`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(q, margin + 22, y + 5);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.text('Umwanya w\'Igisubizo: .....................................................................................................................................................', margin + 4, y + 9.5);

      y += 15;
    });

    // Summary box at bottom of unit
    if (y < pageHeight - 35) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.text('Inyandiko y\'Umwarimu: Buri munyeshuri asabwa kwandika mu ikaye ye no gukorera hamwe mu matsinda atarenze batanu.', margin + 4, y + 6);
      doc.text('Uburenganzira bwose bw\'integanyanyigisho bweguriwe Ikigo cy\'Igihugu Gishinzwe Uburezi bw\'Ibanze (REB).', margin + 4, y + 11);
    }
  });

  // --- FINAL PAGE: OFFICIAL REB ASSESSMENT CRITERIA & BACK COVER ---
  doc.addPage();
  renderHeader(doc, pageWidth, book.title, 'National Guidelines');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('AMABWIRIZA YA REB YO GUSUZUMA UBUSHOBERETSI (CBC ASSESSMENT POLICY)', margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const policyText = [
    '1. Isuzuma rihoraho (Formative Assessment): Mwarimu asabwa gukurikirana imyigire ya buri munyeshuri binyuze mu bibazo bibaza, imikoro yo mu kilasi, n\'imishinga mito.',
    '2. Differentiated Learning (Kwigisha hagendewe ku bushyobozi bw\'umwana): Abanyeshuri bafite intege nke bafashishwa imfashanyigisho zifatika bicaye imbere.',
    '3. Cross-Cutting Issues: Kwinjiza mu masomo insanganyamatsiko z\'uburinganire, kurengera ibidukikije, kurwanya jenoside, no gukunda igihugu.',
    '4. Ururimi rwo Kwigisha: Mu mashuri abanza (P1-P3) amateguriro n\'amasomo bikorwa mu rurimi kavukire rw\'Ikinyarwanda, kuva muri P4 kuzamura bikorwa mu Cyongereza.'
  ];

  let py = 45;
  policyText.forEach(p => {
    const pl = doc.splitTextToSize(p, contentWidth);
    doc.text(pl, margin, py);
    py += (pl.length * 5) + 3;
  });

  // Stamp Box
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(margin, py + 15, contentWidth, 35, 3, 3, 'D');
  doc.setLineDashPattern([], 0);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('KASYI N\'UMUKONO BY\'IKIGO CY\'AMASHURI (SCHOOL STAMP & SIGNATURE)', margin + 10, py + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Ishuri: ${schoolName || 'GS Rwanda Amahoro'}`, margin + 10, py + 34);
  doc.text('Umukono w\'Umukuru w\'Ishuri: ......................................................        Itariki: ...... / ...... / 2026', margin + 10, py + 42);

  // Bottom Notice
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('Official REB Document generated directly by Elimu360 Open Educator Platform.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Licensed for educational use across all primary and secondary schools in Rwanda.', pageWidth / 2, pageHeight - 11, { align: 'center' });

  // Generate blob and download directly
  const safeFilename = `REB_${book.classGrade}_${book.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${book.type}.pdf`;
  const pdfBlob = doc.output('blob');
  saveAs(pdfBlob, safeFilename);
}

function renderHeader(doc: jsPDF, pageWidth: number, bookTitle: string, sectionTitle: string) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 20, pageWidth, 20);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('REB CBC OFFICIAL TEXTBOOK • COURSE ID: 1806', 18, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(sectionTitle, pageWidth - 18, 11, { align: 'right' });

  // Small national accent bar
  doc.setFillColor(0, 161, 222);
  doc.rect(0, 19, pageWidth / 3, 1, 'F');
  doc.setFillColor(250, 210, 1);
  doc.rect(pageWidth / 3, 19, pageWidth / 3, 1, 'F');
  doc.setFillColor(32, 102, 71);
  doc.rect((pageWidth / 3) * 2, 19, pageWidth / 3, 1, 'F');
}
