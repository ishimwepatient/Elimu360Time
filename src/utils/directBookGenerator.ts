import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * DIRECT REB BOOK DOWNLOAD SERVICE
 * 
 * We do NOT create synthetic books. Genuine books are published and revised by REB.
 * This service fetches the exact authentic textbooks, teacher guides, syllabi, and schemes
 * directly from REB's eLearning repository (Course 1806 / elearning.reb.rw).
 * It automatically prepends our custom Rwandan CBC Front Page and adds a subtle watermark,
 * delivering the authentic REB educational materials directly to the teacher.
 */

export interface REBBookMetadata {
  id: string;
  title: string;
  fileName?: string;
  level: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL';
  classGrade: string; // P1 - S6
  subject: string;
  type: 'STUDENT_BOOK' | 'TEACHER_GUIDE' | 'SYLLABUS' | 'SCHEME_OF_WORK' | 'CONTENT_DISTRIBUTION';
  edition: string;
  courseId?: number;
  downloadUrl: string; // Exact URL on elearning.reb.rw
  directRebLink?: string; // Direct link
  size: string;
  description: string;
  units?: {
    unitNumber: number;
    title: string;
    competence: string;
    keyPoints: string[];
    sampleActivity?: string;
    sampleQuestions?: string[];
  }[];
}

function wrapPdfText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Procedurally generates the official high-resolution Elimu360 / Rwanda CBC Front Cover Page.
 * Can be run in browser or server in <100ms.
 */
export async function generateBrandedCoverPdf(
  book: REBBookMetadata,
  schoolName?: string,
  teacherName?: string,
  academicYear?: string,
  district?: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const pw = 595.28;
  const ph = 841.89;
  const page = doc.addPage([pw, ph]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await doc.embedFont(StandardFonts.Helvetica);

  // Top Dark Blue/Slate Banner
  page.drawRectangle({
    x: 0,
    y: ph - 150,
    width: pw,
    height: 150,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });

  // Rwandan National Tri-color bar (Blue, Yellow, Green)
  page.drawRectangle({ x: 0, y: ph - 144, width: pw, height: 3, color: rgb(0 / 255, 161 / 255, 222 / 255) });
  page.drawRectangle({ x: 0, y: ph - 147, width: pw, height: 3, color: rgb(250 / 255, 210 / 255, 1 / 255) });
  page.drawRectangle({ x: 0, y: ph - 150, width: pw, height: 3, color: rgb(32 / 255, 102 / 255, 71 / 255) });

  // Official Header Titles
  page.drawText('REPUBLIC OF RWANDA', {
    x: pw / 2 - 95,
    y: ph - 40,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText('MINISTRY OF EDUCATION (MINEDUC)', {
    x: pw / 2 - 120,
    y: ph - 58,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9)
  });

  page.drawText('RWANDA BASIC EDUCATION BOARD (REB)', {
    x: pw / 2 - 130,
    y: ph - 76,
    size: 12,
    font: fontBold,
    color: rgb(245 / 255, 158 / 255, 11 / 255)
  });

  page.drawText('Competency-Based Curriculum (CBC) • Digital Learning Repository', {
    x: pw / 2 - 150,
    y: ph - 94,
    size: 9,
    font: fontNormal,
    color: rgb(0.8, 0.85, 0.9)
  });

  // Badge Pill
  page.drawRectangle({
    x: pw / 2 - 110,
    y: ph - 126,
    width: 220,
    height: 20,
    color: rgb(30 / 255, 41 / 255, 59 / 255)
  });
  page.drawText('OFFICIAL APPROVED TEXTBOOK • COURSE ID: 1806', {
    x: pw / 2 - 100,
    y: ph - 114,
    size: 8,
    font: fontBold,
    color: rgb(245 / 255, 158 / 255, 11 / 255)
  });

  // Main Book Title (Large)
  const titleLines = wrapPdfText(book.title.toUpperCase(), 36);
  let titleY = ph - 195;
  for (const tl of titleLines) {
    const textWidth = fontBold.widthOfTextAtSize(tl, 18);
    page.drawText(tl, {
      x: Math.max(30, (pw - textWidth) / 2),
      y: titleY,
      size: 18,
      font: fontBold,
      color: rgb(15 / 255, 23 / 255, 42 / 255)
    });
    titleY -= 24;
  }

  // Category Subtitle
  const typeLabel =
    book.type === 'STUDENT_BOOK' ? "IGITABO CY'UMUNYESHURI (PUPIL'S BOOK)" :
    book.type === 'TEACHER_GUIDE' ? "UMUYOBORO W'UMWARIMU (TEACHER'S GUIDE)" :
    book.type === 'SYLLABUS' ? "INTEGANYANYIGISHO YA REB (OFFICIAL SYLLABUS)" :
    book.type === 'SCHEME_OF_WORK' ? "GAHUNDA Y'AMASOMO (SCHEME OF WORK)" :
    "IGITABO CYA REB CYAVUGURUWE (REVISED EDITION 2026-2027)";

  const typeWidth = fontBold.widthOfTextAtSize(typeLabel, 11);
  page.drawText(typeLabel, {
    x: Math.max(30, (pw - typeWidth) / 2),
    y: titleY - 8,
    size: 11,
    font: fontBold,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // School & Teacher Structure Profile Box
  const cardY = titleY - 140;
  page.drawRectangle({
    x: 40,
    y: cardY,
    width: pw - 80,
    height: 110,
    color: rgb(248 / 255, 250 / 255, 252 / 255),
    borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
    borderWidth: 1
  });

  page.drawText('AMAKURU Y\'ISHURI NA MWARIMU (SCHOOL & TEACHER PROFILE)', {
    x: 55,
    y: cardY + 92,
    size: 9,
    font: fontBold,
    color: rgb(30 / 255, 41 / 255, 59 / 255)
  });

  // Left Column
  page.drawText(`Ishuri (School): ${schoolName || 'Urwunge rw\'Amashuri Amahoro'}`, {
    x: 55,
    y: cardY + 70,
    size: 10,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });
  page.drawText(`Umwarimu (Teacher): ${teacherName || 'Umwarimu'}`, {
    x: 55,
    y: cardY + 50,
    size: 10,
    font: fontNormal,
    color: rgb(51 / 255, 65 / 255, 85 / 255)
  });
  page.drawText(`Akarere (District): ${district || 'Rwanda'}`, {
    x: 55,
    y: cardY + 30,
    size: 9.5,
    font: fontNormal,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // Right Column
  page.drawText(`Umwaka (Class): ${book.classGrade}`, {
    x: 320,
    y: cardY + 70,
    size: 10,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });
  page.drawText(`Isomo (Subject): ${book.subject}`, {
    x: 320,
    y: cardY + 50,
    size: 10,
    font: fontNormal,
    color: rgb(51 / 255, 65 / 255, 85 / 255)
  });
  page.drawText(`Umwaka w'Amashuri: ${academicYear || '2026 - 2027'}`, {
    x: 320,
    y: cardY + 30,
    size: 9.5,
    font: fontNormal,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // Official Notice Box
  const noticeY = cardY - 100;
  page.drawRectangle({
    x: 40,
    y: noticeY,
    width: pw - 80,
    height: 80,
    color: rgb(254 / 255, 243 / 255, 199 / 255),
    borderColor: rgb(245 / 255, 158 / 255, 11 / 255),
    borderWidth: 1
  });

  page.drawText('ICYEMEZO CY\'UMWIMERERE (AUTHENTIC REB E-LEARNING BOOK)', {
    x: 55,
    y: noticeY + 62,
    size: 8.5,
    font: fontBold,
    color: rgb(146 / 255, 64 / 255, 14 / 255)
  });

  const noticeLines = [
    'Iki gitabo cyakozwe kandi gitunganywa n\'Ikigo cy\'Igihugu Gishinzwe Uburezi bw\'Ibanze (REB).',
    'Gikurikiza integanyanyigisho ivuguruye ya 2026-2027 ishingiye ku bushobozi (CBC).',
    'Elimu360 Open SIMS Platform itanga uburyo bwo kumanura igitabo cyose n\'igifuniko cyacyo mu buryo bwihuse.'
  ];
  let nY = noticeY + 46;
  for (const nl of noticeLines) {
    page.drawText(nl, {
      x: 55,
      y: nY,
      size: 8,
      font: fontNormal,
      color: rgb(120 / 255, 53 / 255, 15 / 255)
    });
    nY -= 14;
  }

  // Footer of Front Page
  page.drawText('Elimu360 SIMS • Rwanda CBC Educational Repository • www.elimu360.rw', {
    x: pw / 2 - 150,
    y: 35,
    size: 8,
    font: fontNormal,
    color: rgb(148 / 255, 163 / 255, 184 / 255)
  });

  return await doc.save();
}

/**
 * Downloads the actual, authentic REB book fetched from REB's eLearning site,
 * with our official Elimu360 / Rwanda CBC front cover page prepended and watermark stamped.
 * 
 * Uses serverless Vercel function / local Vite endpoint. If the server response is ever
 * interrupted or returns HTML, it avoids saving an invalid index.html and downloads the
 * branded cover page + genuine book safely.
 */
export async function downloadREBBookDirectly(
  book: REBBookMetadata,
  schoolName?: string,
  teacherName?: string,
  academicYear?: string,
  district?: string
): Promise<void> {
  const params = new URLSearchParams({
    url: book.downloadUrl,
    title: book.title,
    class: book.classGrade,
    subject: book.subject,
    type: book.type,
    schoolName: schoolName || 'Urwunge rw\'Amashuri Amahoro',
    teacherName: teacherName || 'Umwarimu',
    academicYear: academicYear || '2026 - 2027',
    district: district || 'Rwanda'
  });

  const downloadUrl = `/api/reb/download-book?${params.toString()}`;
  const cleanName = book.title.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    const res = await fetch(downloadUrl);
    const contentType = res.headers.get('content-type') || '';

    // If server returned valid PDF (from Vercel serverless function or Vite backend)
    if (res.ok && contentType.includes('application/pdf')) {
      const blob = await res.blob();
      saveAs(blob, `REB_${book.classGrade}_${cleanName}.pdf`);
      return;
    }

    // If server returned text/html (Vercel SPA fallback rewrite) or error:
    console.warn('Server endpoint returned non-PDF content type:', contentType);
    
    // 1. Generate & download the official branded front cover page PDF
    const coverBytes = await generateBrandedCoverPdf(book, schoolName, teacherName, academicYear, district);
    saveAs(new Blob([coverBytes], { type: 'application/pdf' }), `Elimu360_Igifuniko_${book.classGrade}_${cleanName}.pdf`);

    // 2. Launch the direct REB download link so the teacher gets the authentic book file immediately
    openDirectREBLink(book);
  } catch (err) {
    console.error('Download fetch error:', err);
    // On network failure, provide both: branded cover and direct REB book
    const coverBytes = await generateBrandedCoverPdf(book, schoolName, teacherName, academicYear, district);
    saveAs(new Blob([coverBytes], { type: 'application/pdf' }), `Elimu360_Igifuniko_${book.classGrade}_${cleanName}.pdf`);
    openDirectREBLink(book);
  }
}

/**
 * Directly runs the exact, unproxied link of the revised REB book from elearning.reb.rw
 */
export function openDirectREBLink(book: REBBookMetadata): void {
  const targetUrl = book.directRebLink || book.downloadUrl;
  if (!targetUrl) return;

  const link = document.createElement('a');
  link.href = targetUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('download', book.fileName || `REB_${book.classGrade}_${book.title}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
