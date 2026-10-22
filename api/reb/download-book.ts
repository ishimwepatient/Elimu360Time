import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false
  }
};

export const maxDuration = 60;

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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Only GET is accepted.' });
  }

  try {
    const {
      url: targetUrl,
      title = 'REB Revised Textbook',
      class: classGrade = 'P1',
      subject = 'General',
      type = 'STUDENT_BOOK',
      schoolName = 'Urwunge rw\'Amashuri Amahoro',
      teacherName = 'Umwarimu',
      academicYear = '2026 - 2027',
      district = 'Rwanda'
    } = req.query || {};

    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'Missing REB book URL parameter' });
    }

    const cleanSafeName = String(title).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
    const downloadFilename = `REB_${classGrade}_${cleanSafeName}.pdf`;

    // Cache setup (handles Vercel /tmp or local .reb_cache)
    const CACHE_DIR = process.env.VERCEL ? '/tmp/.reb_cache' : path.resolve('.reb_cache');
    if (!fs.existsSync(CACHE_DIR)) {
      try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch (_) {}
    }

    // 1. Watermarked Cache Key based on URL hash + specific metadata (school, teacher, class, year)
    const urlHash = crypto.createHash('md5').update(targetUrl).digest('hex');
    const metaKeyString = `${urlHash}::${String(schoolName).trim().toLowerCase()}::${String(teacherName).trim().toLowerCase()}::${classGrade}::${academicYear}::${String(district).trim().toLowerCase()}`;
    const watermarkedKey = crypto.createHash('md5').update(metaKeyString).digest('hex');

    const watermarkedCachePath = path.join(CACHE_DIR, `watermarked_${watermarkedKey}.pdf`);
    const rawCachePath = path.join(CACHE_DIR, `raw_${urlHash}.pdf`);

    // Check cache for already-watermarked PDF version before regenerating!
    if (fs.existsSync(watermarkedCachePath)) {
      const cachedBuf = fs.readFileSync(watermarkedCachePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Length', cachedBuf.length);
      res.setHeader('X-REB-Cache', 'HIT-WATERMARKED');
      return res.status(200).send(cachedBuf);
    }

    // 2. Fetch or load raw REB PDF from disk cache or elearning.reb.rw
    let rawBuffer: Buffer;
    if (fs.existsSync(rawCachePath)) {
      rawBuffer = fs.readFileSync(rawCachePath);
    } else {
      rawBuffer = await new Promise<Buffer>((resolve, reject) => {
        const clientReq = https.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,*/*'
          },
          insecureHTTPParser: true,
          timeout: 55000
        }, (rebRes) => {
          if (rebRes.statusCode && rebRes.statusCode >= 400) {
            return reject(new Error(`REB server returned HTTP ${rebRes.statusCode}`));
          }
          const chunks: Buffer[] = [];
          rebRes.on('data', (c) => chunks.push(Buffer.from(c)));
          rebRes.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length > 500) {
              try { fs.writeFileSync(rawCachePath, buf); } catch (_) {}
            }
            resolve(buf);
          });
        });

        clientReq.on('timeout', () => {
          clientReq.destroy(new Error('REB server connection timeout'));
        });
        clientReq.on('error', reject);
      });
    }

    if (!rawBuffer.subarray(0, 10).toString().includes('%PDF-')) {
      throw new Error('Downloaded content from REB was not a valid PDF file');
    }

    // 3. Load into pdf-lib to prepend custom Front Page, QR Code & add subtle watermark
    const pdfDoc = await PDFDocument.load(rawBuffer, { ignoreEncryption: true });

    const pw = 595.28;
    const ph = 841.89;

    // Generate Scannable QR Code
    const verifyUrl = `https://elimu360-sims.vercel.app/?verified=reb1806&book=${encodeURIComponent(cleanSafeName)}&class=${encodeURIComponent(String(classGrade))}&school=${encodeURIComponent(String(schoolName))}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 250,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
    const qrImage = await pdfDoc.embedPng(Buffer.from(qrDataUrl.split(',')[1], 'base64'));

    // Prepend custom front cover page at index 0
    const frontPage = pdfDoc.insertPage(0, [pw, ph]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Dark Blue/Slate Top Banner
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
    const titleLines = wrapPdfText(String(title).toUpperCase(), 36);
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
      type === 'STUDENT_BOOK' ? "IGITABO CY'UMUNYESHURI (PUPIL'S BOOK)" :
      type === 'TEACHER_GUIDE' ? "UMUYOBORO W'UMWARIMU (TEACHER'S GUIDE)" :
      type === 'SYLLABUS' ? "INTEGANYANYIGISHO YA REB (OFFICIAL SYLLABUS)" :
      type === 'SCHEME_OF_WORK' ? "GAHUNDA Y'AMASOMO (SCHEME OF WORK)" :
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

    // Card Header
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
    frontPage.drawText(`Umwaka (Class): ${classGrade}`, {
      x: 320,
      y: cardY + 70,
      size: 10,
      font: fontBold,
      color: rgb(15 / 255, 23 / 255, 42 / 255)
    });
    frontPage.drawText(`Isomo (Subject): ${subject}`, {
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

    // Official Compliance & Authenticity Box
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

    // 3. Apply subtle watermark to subsequent authentic REB pages (pages 1 to N)
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

    // 4. Save modified PDF and cache it for instant repeat downloads
    const modifiedPdfBytes = await pdfDoc.save();
    try {
      fs.writeFileSync(watermarkedCachePath, Buffer.from(modifiedPdfBytes));
    } catch (_) {}

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', modifiedPdfBytes.length);
    res.setHeader('X-REB-Cache', 'MISS-GENERATED');
    return res.status(200).send(Buffer.from(modifiedPdfBytes));
  } catch (err: any) {
    console.error('Vercel REB Download error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process REB book download',
      fallbackUrl: req.query?.url
    });
  }
}
