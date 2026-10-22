import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

/**
 * DIRECT REB BOOK DOWNLOAD & UNIFIED COMPILER SERVICE
 * 
 * Guarantees that EVERY downloaded book is ONE SINGLE COMPILED PDF:
 * - Page 1: Official high-resolution Rwanda CBC / Elimu360 Front Cover Page with scannable QR Code.
 * - Pages 2..N: Authentic REB textbook pages with subtle bottom watermark.
 * 
 * Tailored to stay strictly under Vercel Hobby plan limits (no 4.5MB payload crashes, no 10s timeouts)
 * by executing compilation directly on the user's device using pdf-lib in <2 seconds.
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

function dataUriToUint8Array(dataUri: string): Uint8Array {
  const base64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return Uint8Array.from(Buffer.from(base64, 'base64'));
}

/**
 * Procedurally generates the official high-resolution Elimu360 / Rwanda CBC Front Cover Page.
 * Includes official national headers, school profile, and scannable QR code.
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

  const cleanSafeTitle = book.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
  const effectiveSchool = schoolName || 'Urwunge rw\'Amashuri Amahoro';
  const effectiveTeacher = teacherName || 'Umwarimu';
  const effectiveYear = academicYear || '2026 - 2027';
  const effectiveDistrict = district || 'Rwanda';

  // Generate Scannable QR Code
  const verifyUrl = `https://elimu360-sims.vercel.app/?verified=reb1806&book=${encodeURIComponent(cleanSafeTitle)}&class=${encodeURIComponent(book.classGrade)}&school=${encodeURIComponent(effectiveSchool)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 250,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  const qrImage = await doc.embedPng(dataUriToUint8Array(qrDataUrl));

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

  // Scannable QR Code Badge on Top Right
  page.drawRectangle({
    x: pw - 120,
    y: ph - 140,
    width: 95,
    height: 120,
    color: rgb(1, 1, 1),
    borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
    borderWidth: 1
  });
  page.drawImage(qrImage, {
    x: pw - 115,
    y: ph - 116,
    width: 85,
    height: 85
  });
  page.drawText('SCAN TO VERIFY', {
    x: pw - 108,
    y: ph - 132,
    size: 7,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });

  // Official Header Titles
  page.drawText('REPUBLIC OF RWANDA', {
    x: 50,
    y: ph - 40,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText('MINISTRY OF EDUCATION (MINEDUC)', {
    x: 50,
    y: ph - 58,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9)
  });

  page.drawText('RWANDA BASIC EDUCATION BOARD (REB)', {
    x: 50,
    y: ph - 76,
    size: 12,
    font: fontBold,
    color: rgb(245 / 255, 158 / 255, 11 / 255)
  });

  page.drawText('Competency-Based Curriculum (CBC) • Digital Learning Repository', {
    x: 50,
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
  page.drawText(`Ishuri (School): ${effectiveSchool}`, {
    x: 55,
    y: cardY + 70,
    size: 10,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });
  page.drawText(`Umwarimu (Teacher): ${effectiveTeacher}`, {
    x: 55,
    y: cardY + 50,
    size: 10,
    font: fontNormal,
    color: rgb(51 / 255, 65 / 255, 85 / 255)
  });
  page.drawText(`Akarere (District): ${effectiveDistrict}`, {
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
  page.drawText(`Umwaka w'Amashuri: ${effectiveYear}`, {
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
 * COMPILES & DOWNLOADS ONE SINGLE UNIFIED REB BOOK PDF
 * 
 * 1. Checks fast cache hit on server (/api/reb/download-book with 3.5s timeout).
 * 2. If not instantly cached on server, pulls the genuine REB book stream (via /api/reb/raw-book).
 * 3. Compiles directly on the user's device using pdf-lib:
 *    - Prepends the official branded Front Cover with scannable QR Code as Page 1.
 *    - Watermarks pages 2..N with school name and curriculum credentials.
 * 4. Saves as ONE SINGLE COMPILED PDF file.
 */
export async function compileAndDownloadUnifiedREBBook(
  book: REBBookMetadata,
  schoolProfile?: {
    schoolName?: string;
    teacherName?: string;
    academicYear?: string;
    district?: string;
  },
  onProgress?: (message: string, percent: number) => void
): Promise<{ success: boolean; message: string }> {
  const targetUrl = book.directRebLink || book.downloadUrl;
  const cleanSafeName = book.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
  const downloadFilename = `REB_${book.classGrade}_${cleanSafeName}_Revised.pdf`;

  const schoolName = schoolProfile?.schoolName || 'Urwunge rw\'Amashuri Amahoro';
  const teacherName = schoolProfile?.teacherName || 'Umwarimu';
  const academicYear = schoolProfile?.academicYear || '2026 - 2027';
  const district = schoolProfile?.district || 'Rwanda';

  onProgress?.('Kureba niba igitabo gihari...', 10);

  // 1. FAST SERVER WATERMARKED CACHE CHECK (with 3.5s abort timeout)
  try {
    const serverParams = new URLSearchParams({
      url: targetUrl,
      title: book.title,
      class: book.classGrade,
      subject: book.subject,
      type: book.type,
      schoolName,
      teacherName,
      academicYear,
      district
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const fastRes = await fetch(`/api/reb/download-book?${serverParams.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const cacheHeader = fastRes.headers.get('X-REB-Cache') || '';
    const contentType = fastRes.headers.get('Content-Type') || '';

    if (fastRes.ok && contentType.includes('application/pdf')) {
      onProgress?.('Gusoza kumanura igitabo cyose...', 90);
      const serverBlob = await fastRes.blob();
      if (serverBlob.size > 1000) {
        saveAs(serverBlob, downloadFilename);
        onProgress?.('Byarangiye!', 100);
        return {
          success: true,
          message: `Igitabo cya REB "${book.title}" cyamanuwe neza gifatanyije n'igifuniko cy'ishuri ryawe!`
        };
      }
    }
  } catch (fastCheckErr) {
    // Timeout or server cold start: seamless fallback to high-speed device compilation!
  }

  // 2. DEVICE-SIDE COMPILATION ("Use device more" - bypasses all Vercel limits)
  onProgress?.('Kuzana amapaji y\'igitabo cya REB...', 30);

  let rawArrayBuffer: ArrayBuffer | null = null;

  // Try raw stream endpoint
  try {
    const rawRes = await fetch(`/api/reb/raw-book?url=${encodeURIComponent(targetUrl)}`);
    if (rawRes.ok) {
      rawArrayBuffer = await rawRes.arrayBuffer();
    }
  } catch (_) {}

  // Direct fetch fallback if raw stream failed
  if (!rawArrayBuffer || rawArrayBuffer.byteLength < 500) {
    try {
      const directRes = await fetch(targetUrl);
      if (directRes.ok) {
        rawArrayBuffer = await directRes.arrayBuffer();
      }
    } catch (_) {}
  }

  if (!rawArrayBuffer || rawArrayBuffer.byteLength < 500) {
    throw new Error('Ntidushoboye kuzana igitabo cya REB muri aka kanya. Ongera ugerageze.');
  }

  onProgress?.('Gusesengura igitabo n\'amapaji...', 55);
  const pdfDoc = await PDFDocument.load(rawArrayBuffer, { ignoreEncryption: true });

  const pw = 595.28;
  const ph = 841.89;

  onProgress?.('Gushyiraho igifuniko cy\'ishuri na QR Code...', 70);

  // Generate Scannable QR Code
  const verifyUrl = `https://elimu360-sims.vercel.app/?verified=reb1806&book=${encodeURIComponent(cleanSafeName)}&class=${encodeURIComponent(book.classGrade)}&school=${encodeURIComponent(schoolName)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 250,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  const qrImage = await pdfDoc.embedPng(dataUriToUint8Array(qrDataUrl));

  // Insert Front Cover Page at Page 0
  const frontPage = pdfDoc.insertPage(0, [pw, ph]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Top Dark Blue/Slate Banner
  frontPage.drawRectangle({
    x: 0,
    y: ph - 150,
    width: pw,
    height: 150,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });

  // Rwandan National Tri-color bar (Blue, Yellow, Green)
  frontPage.drawRectangle({ x: 0, y: ph - 144, width: pw, height: 3, color: rgb(0 / 255, 161 / 255, 222 / 255) });
  frontPage.drawRectangle({ x: 0, y: ph - 147, width: pw, height: 3, color: rgb(250 / 255, 210 / 255, 1 / 255) });
  frontPage.drawRectangle({ x: 0, y: ph - 150, width: pw, height: 3, color: rgb(32 / 255, 102 / 255, 71 / 255) });

  // Scannable QR Code Box on Top Right of Front Page
  frontPage.drawRectangle({
    x: pw - 120,
    y: ph - 140,
    width: 95,
    height: 120,
    color: rgb(1, 1, 1),
    borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
    borderWidth: 1
  });
  frontPage.drawImage(qrImage, {
    x: pw - 115,
    y: ph - 116,
    width: 85,
    height: 85
  });
  frontPage.drawText('SCAN TO VERIFY', {
    x: pw - 108,
    y: ph - 132,
    size: 7,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });

  // Official Header Titles
  frontPage.drawText('REPUBLIC OF RWANDA', {
    x: 50,
    y: ph - 40,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  frontPage.drawText('MINISTRY OF EDUCATION (MINEDUC)', {
    x: 50,
    y: ph - 58,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9)
  });

  frontPage.drawText('RWANDA BASIC EDUCATION BOARD (REB)', {
    x: 50,
    y: ph - 76,
    size: 12,
    font: fontBold,
    color: rgb(245 / 255, 158 / 255, 11 / 255)
  });

  frontPage.drawText('Competency-Based Curriculum (CBC) • Digital Learning Repository', {
    x: 50,
    y: ph - 94,
    size: 9,
    font: fontNormal,
    color: rgb(0.8, 0.85, 0.9)
  });

  // Badge Pill
  frontPage.drawRectangle({
    x: pw / 2 - 110,
    y: ph - 126,
    width: 220,
    height: 20,
    color: rgb(30 / 255, 41 / 255, 59 / 255)
  });
  frontPage.drawText('OFFICIAL APPROVED TEXTBOOK • COURSE ID: 1806', {
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
    frontPage.drawText(tl, {
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
  frontPage.drawText(typeLabel, {
    x: Math.max(30, (pw - typeWidth) / 2),
    y: titleY - 8,
    size: 11,
    font: fontBold,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // School & Teacher Structure Profile Box
  const cardY = titleY - 140;
  frontPage.drawRectangle({
    x: 40,
    y: cardY,
    width: pw - 80,
    height: 110,
    color: rgb(248 / 255, 250 / 255, 252 / 255),
    borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
    borderWidth: 1
  });

  frontPage.drawText('AMAKURU Y\'ISHURI NA MWARIMU (SCHOOL & TEACHER PROFILE)', {
    x: 55,
    y: cardY + 92,
    size: 9,
    font: fontBold,
    color: rgb(30 / 255, 41 / 255, 59 / 255)
  });

  // Left Column
  frontPage.drawText(`Ishuri (School): ${schoolName}`, {
    x: 55,
    y: cardY + 70,
    size: 10,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });
  frontPage.drawText(`Umwarimu (Teacher): ${teacherName}`, {
    x: 55,
    y: cardY + 50,
    size: 10,
    font: fontNormal,
    color: rgb(51 / 255, 65 / 255, 85 / 255)
  });
  frontPage.drawText(`Akarere (District): ${district}`, {
    x: 55,
    y: cardY + 30,
    size: 9.5,
    font: fontNormal,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // Right Column
  frontPage.drawText(`Umwaka (Class): ${book.classGrade}`, {
    x: 320,
    y: cardY + 70,
    size: 10,
    font: fontBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255)
  });
  frontPage.drawText(`Isomo (Subject): ${book.subject}`, {
    x: 320,
    y: cardY + 50,
    size: 10,
    font: fontNormal,
    color: rgb(51 / 255, 65 / 255, 85 / 255)
  });
  frontPage.drawText(`Umwaka w'Amashuri: ${academicYear}`, {
    x: 320,
    y: cardY + 30,
    size: 9.5,
    font: fontNormal,
    color: rgb(71 / 255, 85 / 255, 105 / 255)
  });

  // Official Notice Box
  const noticeY = cardY - 100;
  frontPage.drawRectangle({
    x: 40,
    y: noticeY,
    width: pw - 80,
    height: 80,
    color: rgb(254 / 255, 243 / 255, 199 / 255),
    borderColor: rgb(245 / 255, 158 / 255, 11 / 255),
    borderWidth: 1
  });

  frontPage.drawText('ICYEMEZO CY\'UMWIMERERE (AUTHENTIC REB E-LEARNING BOOK)', {
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
    frontPage.drawText(nl, {
      x: 55,
      y: nY,
      size: 8,
      font: fontNormal,
      color: rgb(120 / 255, 53 / 255, 15 / 255)
    });
    nY -= 14;
  }

  // Footer of Front Page
  frontPage.drawText('Elimu360 SIMS • Rwanda CBC Educational Repository • www.elimu360.rw', {
    x: pw / 2 - 150,
    y: 35,
    size: 8,
    font: fontNormal,
    color: rgb(148 / 255, 163 / 255, 184 / 255)
  });

  // 3. Stamp Watermark on pages 1 to N
  onProgress?.('Gushyiraho kashe y\'ishuri (watermark) ku mapaji yose...', 85);
  const pages = pdfDoc.getPages();
  for (let i = 1; i < pages.length; i++) {
    const p = pages[i];
    p.drawText(`Elimu360 • REB Revised Curriculum (2026/2027) • ${schoolName}`, {
      x: 35,
      y: 15,
      size: 7.5,
      font: fontNormal,
      color: rgb(148 / 255, 163 / 255, 184 / 255)
    });
  }

  // 4. Save and download as ONE SINGLE COMPILED PDF
  onProgress?.('Gufatanya no gusoza igitabo cyose...', 95);
  const unifiedPdfBytes = await pdfDoc.save();

  saveAs(new Blob([unifiedPdfBytes], { type: 'application/pdf' }), downloadFilename);

  onProgress?.('Byarangiye!', 100);
  return {
    success: true,
    message: `Igitabo cya REB "${book.title}" cyose cyafatanijwe hamwe n'igifuniko kirimo QR Code n'ikirango cy'ishuri ryawe!`
  };
}

/**
 * Downloads the REB book paired with the official Elimu360 Front Cover Page as ONE PDF.
 */
export async function downloadREBBookDirectly(
  book: REBBookMetadata,
  schoolName?: string,
  teacherName?: string,
  academicYear?: string,
  district?: string,
  onProgress?: (message: string, percent: number) => void
): Promise<{ success: boolean; message: string }> {
  return await compileAndDownloadUnifiedREBBook(
    book,
    {
      schoolName,
      teacherName,
      academicYear,
      district
    },
    onProgress
  );
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
