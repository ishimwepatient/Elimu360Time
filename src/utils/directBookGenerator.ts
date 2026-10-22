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

/**
 * Downloads the actual, authentic REB book fetched from REB's eLearning site,
 * with our official Elimu360 / Rwanda CBC front cover page prepended and watermark stamped.
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

  // Native browser direct download
  const link = document.createElement('a');
  link.href = downloadUrl;
  const cleanName = book.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `REB_${book.classGrade}_${cleanName}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
