import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  TimetableSlot, 
  TimetableConfig, 
  ClassRoom, 
  Subject, 
  User 
} from '../types';
import { 
  ComputedTimelineSlot, 
  DAYS_OF_WEEK 
} from './timetableEngine';

export interface SchoolMetadata {
  id: string;
  name: string;
  code?: string;
  motto?: string;
  province?: string;
  district?: string;
  active_term?: string;
  active_academic_year?: string;
}

export interface TimetableExportOptions {
  activeSchool: SchoolMetadata;
  title: string;
  subtitle?: string;
  targetType: 'CLASS' | 'TEACHER' | 'MASTER';
  slots: TimetableSlot[];
  dailyTimeline: ComputedTimelineSlot[];
  subjects?: Subject[];
  teachers?: User[];
  classes?: ClassRoom[];
  filename?: string;
}

/**
 * Creates a beautifully styled, high-resolution Landscape A4 Timetable PDF doc
 */
export function generateSingleTimetablePdfDoc(options: TimetableExportOptions): jsPDF {
  const {
    activeSchool,
    title,
    subtitle,
    targetType,
    slots,
    dailyTimeline,
    subjects = [],
    teachers = [],
    classes = []
  } = options;

  // Initialize Landscape A4 (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 12;
  let yPos = 0;

  // 1. TOP OFFICIAL HEADER BAR
  doc.setFillColor(15, 23, 42); // slate-900 (Navy)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Decorative Accent Bar (Gold / Amber)
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // School Name Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text((activeSchool.name || 'ELIMU360 ACADEMIC SYSTEM').toUpperCase(), marginX, 10);

  // Subtitle / Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  const subText = activeSchool.motto 
    ? `Motto: "${activeSchool.motto}" · District: ${activeSchool.district || 'Kigali City'}`
    : `REPUBLIC OF RWANDA · MINISTRY OF EDUCATION · SMART SCHEDULING SYSTEM`;
  doc.text(subText, marginX, 15);

  // Document Badge (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36); // amber-400
  const termInfo = `${activeSchool.active_academic_year || '2026-2027'} · ${activeSchool.active_term || 'Term 1'}`;
  doc.text(termInfo, pageWidth - marginX, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL ACADEMIC TIMETABLE', pageWidth - marginX, 15, { align: 'right' });

  // 2. TIMETABLE TITLE BANNER
  yPos = 34;

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(marginX, yPos, pageWidth - (marginX * 2), 12, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(marginX, yPos, pageWidth - (marginX * 2), 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(title.toUpperCase(), marginX + 4, yPos + 7.5);

  if (subtitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, pageWidth - marginX - 4, yPos + 7.5, { align: 'right' });
  }

  yPos += 15;

  // 3. MAIN TIMETABLE GRID TABLE
  // Grid Dimensions:
  // Available Width = 297 - 24 = 273mm
  // Col 1 (Period / Time) = 38mm
  // Cols 2..6 (Mon..Fri) = 47mm each (47 * 5 = 235mm)
  // Total = 38 + 235 = 273mm
  const colTimeWidth = 38;
  const colDayWidth = 47;
  const tableWidth = colTimeWidth + (colDayWidth * 5);

  // Table Header Row
  const headerHeight = 7;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(marginX, yPos, tableWidth, headerHeight, 'F');
  doc.setDrawColor(51, 65, 85);
  doc.rect(marginX, yPos, tableWidth, headerHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PERIOD / TIME', marginX + 2, yPos + 4.8);

  DAYS_OF_WEEK.forEach((day, dIdx) => {
    const dayX = marginX + colTimeWidth + (dIdx * colDayWidth);
    doc.text(day.toUpperCase(), dayX + (colDayWidth / 2), yPos + 4.8, { align: 'center' });
  });

  yPos += headerHeight;

  // Compute available height for rows
  // Available page bottom = 175mm (leave room for signature footer)
  const maxTableY = 172;
  const remainingHeight = maxTableY - yPos;
  const totalRows = dailyTimeline.length || 1;
  const rowHeight = Math.max(11, Math.min(16, remainingHeight / totalRows));

  dailyTimeline.forEach((ts, rIdx) => {
    const rowY = yPos;

    if (ts.is_break) {
      // BREAK ROW (Spans across all days)
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(marginX, rowY, tableWidth, rowHeight - 1, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.rect(marginX, rowY, tableWidth, rowHeight - 1, 'S');

      // Break Time
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(`${ts.start_time} - ${ts.end_time}`, marginX + 2, rowY + (rowHeight / 2) + 1);

      // Break Label
      doc.setFontSize(8.5);
      const breakLabel = `☕ ${ts.label.toUpperCase()} (${ts.duration_mins} MINUTES)`;
      doc.text(breakLabel, marginX + colTimeWidth + ((colDayWidth * 5) / 2), rowY + (rowHeight / 2) + 1, { align: 'center' });
    } else {
      // REGULAR TEACHING PERIOD ROW
      // Time Column Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(marginX, rowY, colTimeWidth, rowHeight - 1, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(marginX, rowY, colTimeWidth, rowHeight - 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Period ${ts.period_number}`, marginX + 2, rowY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${ts.start_time} - ${ts.end_time}`, marginX + 2, rowY + 8.5);

      // 5 Day Columns
      DAYS_OF_WEEK.forEach((day, dIdx) => {
        const cellX = marginX + colTimeWidth + (dIdx * colDayWidth);

        // Find matching slot for this day and period
        const slot = slots.find(s => s.day_of_week === day && s.period_number === ts.period_number);

        if (slot) {
          // Slot Background Box
          doc.setFillColor(238, 242, 255); // indigo-50
          doc.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'F');
          doc.setDrawColor(199, 210, 254); // indigo-200
          doc.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'S');

          // Subject Name
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(30, 58, 138); // blue-900
          const subjName = doc.splitTextToSize(slot.subject_name || 'Subject', colDayWidth - 3);
          doc.text(subjName[0] || 'Subject', cellX + 1.5, rowY + 4);

          // Code Pill & Target detail (Teacher if Class view, Class if Teacher view)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(79, 70, 229); // indigo-600

          const subDetail = targetType === 'TEACHER' 
            ? `Class: ${slot.class_name}`
            : targetType === 'CLASS'
              ? `Tr: ${slot.teacher_name}`
              : `Tr: ${slot.teacher_name} · ${slot.class_name}`;

          const truncatedDetail = doc.splitTextToSize(subDetail, colDayWidth - 3);
          doc.text(truncatedDetail[0] || '', cellX + 1.5, rowY + 7.5);

          // Room / Location
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Rm: ${slot.room || 'Room 101'}`, cellX + 1.5, rowY + 11);
        } else {
          // Empty / Free Period Cell
          doc.setFillColor(255, 255, 255);
          doc.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'S');

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text('— Free / Self Study —', cellX + (colDayWidth / 2), rowY + (rowHeight / 2) + 1, { align: 'center' });
        }
      });
    }

    yPos += rowHeight;
  });

  // 4. FOOTER & OFFICIAL AUTHORIZATION SIGNATURES
  yPos = Math.max(yPos + 3, 178);

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(marginX, yPos, pageWidth - marginX, yPos);
  yPos += 4;

  // Left side: Quick Summary Statistics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('TIMETABLE SUMMARY & KEY:', marginX, yPos);

  const totalScheduled = slots.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Weekly Periods: ${totalScheduled} | School Code: ${activeSchool.code || 'SCH-RW'} | Active Term: ${activeSchool.active_term || 'Term 1'}`, marginX, yPos + 4);

  // Right side: Official Signatures
  const sigX1 = pageWidth - marginX - 110;
  const sigX2 = pageWidth - marginX - 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Prepared By (DOS):', sigX1, yPos);
  doc.text('Approved By (Head Teacher):', sigX2, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature & Stamp: ___________________', sigX1, yPos + 8);
  doc.text('Signature & Stamp: ___________________', sigX2, yPos + 8);

  // Watermark Footer Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Elimu360 SIMS · Smart Master Timetable Engine · Generated on ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

  return doc;
}

/**
 * Single PDF export download function
 */
export function exportSingleTimetablePdf(options: TimetableExportOptions): void {
  const doc = generateSingleTimetablePdfDoc(options);
  const cleanName = (options.title || 'Timetable').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = options.filename || `Elimu360_${cleanName}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export Master Bulk PDF Document (Multi-page PDF containing all class and teacher timetables)
 */
export function exportBulkMasterTimetablePdf(options: {
  activeSchool: SchoolMetadata;
  schoolSlots: TimetableSlot[];
  schoolClasses: ClassRoom[];
  schoolTeachers: User[];
  dailyTimeline: ComputedTimelineSlot[];
  subjects: Subject[];
}): void {
  const {
    activeSchool,
    schoolSlots,
    schoolClasses,
    schoolTeachers,
    dailyTimeline,
    subjects
  } = options;

  if (schoolSlots.length === 0) {
    alert('No timetable slots available to export.');
    return;
  }

  let masterDoc: jsPDF | null = null;

  // 1. First Page: Master School Overview
  const mainMasterDoc = generateSingleTimetablePdfDoc({
    activeSchool,
    title: `MASTER SCHOOL TIMETABLE · ALL CLASSES (${schoolClasses.length})`,
    subtitle: `Total Scheduled Periods: ${schoolSlots.length} Slots`,
    targetType: 'MASTER',
    slots: schoolSlots,
    dailyTimeline,
    subjects,
    classes: schoolClasses,
    teachers: schoolTeachers
  });

  masterDoc = mainMasterDoc;

  // 2. Class Timetable Pages
  schoolClasses.forEach(cls => {
    const cSlots = schoolSlots.filter(s => s.class_id === cls.id || s.class_name === cls.name);
    if (cSlots.length > 0) {
      masterDoc!.addPage('a4', 'landscape');
      
      // Temporarily construct page for this class
      const cDoc = generateSingleTimetablePdfDoc({
        activeSchool,
        title: `CLASS TIMETABLE: ${cls.name.toUpperCase()}`,
        subtitle: `Level: ${cls.level_name || cls.level || 'General'} · Room: ${cls.room_number || 'Main Classroom'}`,
        targetType: 'CLASS',
        slots: cSlots,
        dailyTimeline,
        subjects,
        teachers: schoolTeachers
      });

      // Copy page content or rebuild directly on masterDoc
      // In jsPDF, rebuilding directly on masterDoc is cleanly done!
    }
  });

  // Re-build all pages sequentially on a single masterDoc for perfect fidelity
  const finalDoc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  let pageIndex = 0;

  // Helper to append a generated page to finalDoc
  const appendTimetablePage = (opts: TimetableExportOptions) => {
    if (pageIndex > 0) {
      finalDoc.addPage('a4', 'landscape');
    }
    const tempDoc = generateSingleTimetablePdfDoc(opts);
    // Move rendered elements onto finalDoc using the same generator logic with target page
    // Since generateSingleTimetablePdfDoc creates a fresh doc, we can build directly onto finalDoc!
    pageIndex++;
  };

  // Re-implementation: Build pages directly on a single master document!
  const bulkPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let currentPage = 0;

  const buildPageOnBulkDoc = (opts: TimetableExportOptions) => {
    if (currentPage > 0) {
      bulkPdf.addPage('a4', 'landscape');
    }
    
    // Draw on bulkPdf at current page
    const {
      activeSchool: sch,
      title: pageTitle,
      subtitle: pageSub,
      targetType: tType,
      slots: pageSlots,
      dailyTimeline: timeline
    } = opts;

    const pageWidth = 297;
    const pageHeight = 210;
    const marginX = 12;
    let yPos = 0;

    // Header Bar
    bulkPdf.setFillColor(15, 23, 42);
    bulkPdf.rect(0, 0, pageWidth, 28, 'F');
    bulkPdf.setFillColor(245, 158, 11);
    bulkPdf.rect(0, 28, pageWidth, 1.5, 'F');

    bulkPdf.setTextColor(255, 255, 255);
    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(14);
    bulkPdf.text((sch.name || 'ELIMU360 ACADEMIC SYSTEM').toUpperCase(), marginX, 10);

    bulkPdf.setFont('helvetica', 'normal');
    bulkPdf.setFontSize(8);
    bulkPdf.setTextColor(203, 213, 225);
    const sub = sch.motto ? `Motto: "${sch.motto}"` : `REPUBLIC OF RWANDA · MINISTRY OF EDUCATION`;
    bulkPdf.text(sub, marginX, 15);

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(9);
    bulkPdf.setTextColor(251, 191, 36);
    bulkPdf.text(`${sch.active_academic_year || '2026-2027'} · ${sch.active_term || 'Term 1'}`, pageWidth - marginX, 10, { align: 'right' });

    bulkPdf.setFont('helvetica', 'normal');
    bulkPdf.setFontSize(7.5);
    bulkPdf.setTextColor(148, 163, 184);
    bulkPdf.text('OFFICIAL BULK TIMETABLE PACKAGE', pageWidth - marginX, 15, { align: 'right' });

    // Title Banner
    yPos = 34;
    bulkPdf.setFillColor(241, 245, 249);
    bulkPdf.rect(marginX, yPos, pageWidth - (marginX * 2), 12, 'F');
    bulkPdf.setDrawColor(203, 213, 225);
    bulkPdf.rect(marginX, yPos, pageWidth - (marginX * 2), 12, 'S');

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(12);
    bulkPdf.setTextColor(30, 58, 138);
    bulkPdf.text(pageTitle.toUpperCase(), marginX + 4, yPos + 7.5);

    if (pageSub) {
      bulkPdf.setFont('helvetica', 'bold');
      bulkPdf.setFontSize(8.5);
      bulkPdf.setTextColor(100, 116, 139);
      bulkPdf.text(pageSub, pageWidth - marginX - 4, yPos + 7.5, { align: 'right' });
    }

    yPos += 15;

    // Grid Dimensions
    const colTimeWidth = 38;
    const colDayWidth = 47;
    const tableWidth = colTimeWidth + (colDayWidth * 5);

    // Table Header
    const headerHeight = 7;
    bulkPdf.setFillColor(30, 41, 59);
    bulkPdf.rect(marginX, yPos, tableWidth, headerHeight, 'F');
    bulkPdf.setDrawColor(51, 65, 85);
    bulkPdf.rect(marginX, yPos, tableWidth, headerHeight, 'S');

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(8);
    bulkPdf.setTextColor(255, 255, 255);
    bulkPdf.text('PERIOD / TIME', marginX + 2, yPos + 4.8);

    DAYS_OF_WEEK.forEach((day, dIdx) => {
      const dayX = marginX + colTimeWidth + (dIdx * colDayWidth);
      bulkPdf.text(day.toUpperCase(), dayX + (colDayWidth / 2), yPos + 4.8, { align: 'center' });
    });

    yPos += headerHeight;

    const maxTableY = 172;
    const remainingHeight = maxTableY - yPos;
    const totalRows = timeline.length || 1;
    const rowHeight = Math.max(11, Math.min(16, remainingHeight / totalRows));

    timeline.forEach((ts) => {
      const rowY = yPos;

      if (ts.is_break) {
        bulkPdf.setFillColor(254, 243, 199);
        bulkPdf.rect(marginX, rowY, tableWidth, rowHeight - 1, 'F');
        bulkPdf.setDrawColor(245, 158, 11);
        bulkPdf.rect(marginX, rowY, tableWidth, rowHeight - 1, 'S');

        bulkPdf.setFont('helvetica', 'bold');
        bulkPdf.setFontSize(7.5);
        bulkPdf.setTextColor(180, 83, 9);
        bulkPdf.text(`${ts.start_time} - ${ts.end_time}`, marginX + 2, rowY + (rowHeight / 2) + 1);

        bulkPdf.setFontSize(8.5);
        const breakLabel = `☕ ${ts.label.toUpperCase()} (${ts.duration_mins} MINS)`;
        bulkPdf.text(breakLabel, marginX + colTimeWidth + ((colDayWidth * 5) / 2), rowY + (rowHeight / 2) + 1, { align: 'center' });
      } else {
        bulkPdf.setFillColor(248, 250, 252);
        bulkPdf.rect(marginX, rowY, colTimeWidth, rowHeight - 1, 'F');
        bulkPdf.setDrawColor(203, 213, 225);
        bulkPdf.rect(marginX, rowY, colTimeWidth, rowHeight - 1, 'S');

        bulkPdf.setFont('helvetica', 'bold');
        bulkPdf.setFontSize(8);
        bulkPdf.setTextColor(15, 23, 42);
        bulkPdf.text(`Period ${ts.period_number}`, marginX + 2, rowY + 4.5);

        bulkPdf.setFont('helvetica', 'normal');
        bulkPdf.setFontSize(7);
        bulkPdf.setTextColor(100, 116, 139);
        bulkPdf.text(`${ts.start_time} - ${ts.end_time}`, marginX + 2, rowY + 8.5);

        DAYS_OF_WEEK.forEach((day, dIdx) => {
          const cellX = marginX + colTimeWidth + (dIdx * colDayWidth);
          const slot = pageSlots.find(s => s.day_of_week === day && s.period_number === ts.period_number);

          if (slot) {
            bulkPdf.setFillColor(238, 242, 255);
            bulkPdf.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'F');
            bulkPdf.setDrawColor(199, 210, 254);
            bulkPdf.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'S');

            bulkPdf.setFont('helvetica', 'bold');
            bulkPdf.setFontSize(8);
            bulkPdf.setTextColor(30, 58, 138);
            const subjName = bulkPdf.splitTextToSize(slot.subject_name || 'Subject', colDayWidth - 3);
            bulkPdf.text(subjName[0] || 'Subject', cellX + 1.5, rowY + 4);

            bulkPdf.setFont('helvetica', 'bold');
            bulkPdf.setFontSize(6.5);
            bulkPdf.setTextColor(79, 70, 229);

            const subDetail = tType === 'TEACHER' 
              ? `Class: ${slot.class_name}`
              : tType === 'CLASS'
                ? `Tr: ${slot.teacher_name}`
                : `Tr: ${slot.teacher_name} · ${slot.class_name}`;

            const truncatedDetail = bulkPdf.splitTextToSize(subDetail, colDayWidth - 3);
            bulkPdf.text(truncatedDetail[0] || '', cellX + 1.5, rowY + 7.5);

            bulkPdf.setFont('helvetica', 'normal');
            bulkPdf.setFontSize(6.5);
            bulkPdf.setTextColor(100, 116, 139);
            bulkPdf.text(`Rm: ${slot.room || 'Room 101'}`, cellX + 1.5, rowY + 11);
          } else {
            bulkPdf.setFillColor(255, 255, 255);
            bulkPdf.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'F');
            bulkPdf.setDrawColor(226, 232, 240);
            bulkPdf.rect(cellX, rowY, colDayWidth, rowHeight - 1, 'S');

            bulkPdf.setFont('helvetica', 'italic');
            bulkPdf.setFontSize(6.5);
            bulkPdf.setTextColor(148, 163, 184);
            bulkPdf.text('— Free / Self Study —', cellX + (colDayWidth / 2), rowY + (rowHeight / 2) + 1, { align: 'center' });
          }
        });
      }

      yPos += rowHeight;
    });

    // Footer & Signatures
    yPos = Math.max(yPos + 3, 178);
    bulkPdf.setDrawColor(203, 213, 225);
    bulkPdf.line(marginX, yPos, pageWidth - marginX, yPos);
    yPos += 4;

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(7.5);
    bulkPdf.setTextColor(30, 41, 59);
    bulkPdf.text('TIMETABLE SUMMARY & KEY:', marginX, yPos);

    bulkPdf.setFont('helvetica', 'normal');
    bulkPdf.setFontSize(7);
    bulkPdf.setTextColor(71, 85, 105);
    bulkPdf.text(`Total Weekly Periods: ${pageSlots.length} | School Code: ${sch.code || 'SCH-RW'} | Term: ${sch.active_term || 'Term 1'}`, marginX, yPos + 4);

    const sigX1 = pageWidth - marginX - 110;
    const sigX2 = pageWidth - marginX - 50;

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(7.5);
    bulkPdf.setTextColor(15, 23, 42);
    bulkPdf.text('Prepared By (DOS):', sigX1, yPos);
    bulkPdf.text('Approved By (Head Teacher):', sigX2, yPos);

    bulkPdf.setFont('helvetica', 'normal');
    bulkPdf.setFontSize(6.5);
    bulkPdf.setTextColor(148, 163, 184);
    bulkPdf.text('Signature & Stamp: ___________________', sigX1, yPos + 8);
    bulkPdf.text('Signature & Stamp: ___________________', sigX2, yPos + 8);

    bulkPdf.setFont('helvetica', 'bold');
    bulkPdf.setFontSize(6.5);
    bulkPdf.setTextColor(100, 116, 139);
    bulkPdf.text(`Elimu360 SIMS · Page ${currentPage + 1} · Generated on ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

    currentPage++;
  };

  // 1. Master School Overview Page
  buildPageOnBulkDoc({
    activeSchool,
    title: `MASTER SCHOOL TIMETABLE · ALL CLASSES (${schoolClasses.length})`,
    subtitle: `Total Scheduled Lessons: ${schoolSlots.length} Slots across ${schoolTeachers.length} Teachers`,
    targetType: 'MASTER',
    slots: schoolSlots,
    dailyTimeline,
    subjects,
    classes: schoolClasses,
    teachers: schoolTeachers
  });

  // 2. Add Each Class Timetable Page
  schoolClasses.forEach(cls => {
    const cSlots = schoolSlots.filter(s => s.class_id === cls.id || s.class_name === cls.name);
    if (cSlots.length > 0) {
      buildPageOnBulkDoc({
        activeSchool,
        title: `CLASS TIMETABLE: ${cls.name.toUpperCase()}`,
        subtitle: `Level: ${cls.level_name || cls.level || 'General'} · Room: ${cls.room_number || 'Classroom'}`,
        targetType: 'CLASS',
        slots: cSlots,
        dailyTimeline,
        subjects,
        teachers: schoolTeachers
      });
    }
  });

  // 3. Add Each Teacher Schedule Page
  schoolTeachers.forEach(teacher => {
    const tSlots = schoolSlots.filter(s => s.teacher_id === teacher.id || s.teacher_name === teacher.name);
    if (tSlots.length > 0) {
      buildPageOnBulkDoc({
        activeSchool,
        title: `TEACHER SCHEDULE: ${teacher.name.toUpperCase()}`,
        subtitle: `Email: ${teacher.email || 'N/A'} · Assigned Periods: ${tSlots.length} Lessons/Week`,
        targetType: 'TEACHER',
        slots: tSlots,
        dailyTimeline,
        subjects,
        classes: schoolClasses
      });
    }
  });

  // Save Master PDF Package
  const cleanSchool = activeSchool.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  bulkPdf.save(`Elimu360_Master_Timetables_Bulk_${cleanSchool}_${Date.now()}.pdf`);
}

/**
 * Export Master ZIP Package containing individual styled PDF files for every class and teacher
 */
export async function exportBulkMasterTimetableZipPackage(options: {
  activeSchool: SchoolMetadata;
  schoolSlots: TimetableSlot[];
  schoolClasses: ClassRoom[];
  schoolTeachers: User[];
  dailyTimeline: ComputedTimelineSlot[];
  subjects: Subject[];
}): Promise<void> {
  const {
    activeSchool,
    schoolSlots,
    schoolClasses,
    schoolTeachers,
    dailyTimeline,
    subjects
  } = options;

  if (schoolSlots.length === 0) {
    alert('No timetable slots available to package into ZIP.');
    return;
  }

  const zip = new JSZip();
  const schoolFolder = zip.folder(`Elimu360_Timetables_${activeSchool.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`);

  // 1. Master School Overview PDF
  const masterDoc = generateSingleTimetablePdfDoc({
    activeSchool,
    title: `MASTER SCHOOL TIMETABLE OVERVIEW`,
    subtitle: `Total Scheduled Lessons: ${schoolSlots.length} Slots`,
    targetType: 'MASTER',
    slots: schoolSlots,
    dailyTimeline,
    subjects,
    classes: schoolClasses,
    teachers: schoolTeachers
  });

  const masterPdfBlob = masterDoc.output('blob');
  schoolFolder?.file('00_Master_School_Timetable_Overview.pdf', masterPdfBlob);

  // 2. Class Timetables Folder
  const classFolder = schoolFolder?.folder('01_Classes_Timetables');
  schoolClasses.forEach(cls => {
    const cSlots = schoolSlots.filter(s => s.class_id === cls.id || s.class_name === cls.name);
    if (cSlots.length > 0) {
      const cDoc = generateSingleTimetablePdfDoc({
        activeSchool,
        title: `CLASS TIMETABLE: ${cls.name.toUpperCase()}`,
        subtitle: `Level: ${cls.level_name || cls.level || 'General'} · Room: ${cls.room_number || 'Classroom'}`,
        targetType: 'CLASS',
        slots: cSlots,
        dailyTimeline,
        subjects,
        teachers: schoolTeachers
      });

      const cleanClassName = cls.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      classFolder?.file(`Class_${cleanClassName}_Timetable.pdf`, cDoc.output('blob'));
    }
  });

  // 3. Teachers Timetables Folder
  const teacherFolder = schoolFolder?.folder('02_Teachers_Schedules');
  schoolTeachers.forEach(teacher => {
    const tSlots = schoolSlots.filter(s => s.teacher_id === teacher.id || s.teacher_name === teacher.name);
    if (tSlots.length > 0) {
      const tDoc = generateSingleTimetablePdfDoc({
        activeSchool,
        title: `TEACHER SCHEDULE: ${teacher.name.toUpperCase()}`,
        subtitle: `Weekly Load: ${tSlots.length} Lessons`,
        targetType: 'TEACHER',
        slots: tSlots,
        dailyTimeline,
        subjects,
        classes: schoolClasses
      });

      const cleanTeacherName = teacher.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      teacherFolder?.file(`Teacher_${cleanTeacherName}_Schedule.pdf`, tDoc.output('blob'));
    }
  });

  // Generate and Trigger Zip Download
  const zipContent = await zip.generateAsync({ type: 'blob' });
  const cleanSchool = activeSchool.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(zipContent, `Elimu360_Bulk_Timetables_Package_${cleanSchool}_${Date.now()}.zip`);
}
