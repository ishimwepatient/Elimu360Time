import officialBooksRaw from './rebOfficialBooksData.json';

export interface REBBookMetadata {
  id: string;
  title: string;
  fileName: string;
  level: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL';
  classGrade: string; // P1 - S6
  subject: string;
  type: 'STUDENT_BOOK' | 'TEACHER_GUIDE' | 'SYLLABUS' | 'SCHEME_OF_WORK' | 'CONTENT_DISTRIBUTION';
  edition: string;
  courseId: number;
  downloadUrl: string; // Exact URL on elearning.reb.rw
  directRebLink: string; // Direct link
  size: string;
  description: string;
}

export const REB_OFFICIAL_CATALOG: REBBookMetadata[] = officialBooksRaw as REBBookMetadata[];

export function getBooksByClass(classGrade: string): REBBookMetadata[] {
  if (classGrade === 'ALL') return REB_OFFICIAL_CATALOG;
  return REB_OFFICIAL_CATALOG.filter(b => b.classGrade === classGrade);
}

export function getBooksByLevel(level: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'ALL'): REBBookMetadata[] {
  if (level === 'ALL') return REB_OFFICIAL_CATALOG;
  return REB_OFFICIAL_CATALOG.filter(b => b.level === level);
}

export function getBooksByType(type: string): REBBookMetadata[] {
  if (type === 'ALL') return REB_OFFICIAL_CATALOG;
  return REB_OFFICIAL_CATALOG.filter(b => b.type === type);
}

export function searchBooks(query: string, level?: string, classGrade?: string, type?: string): REBBookMetadata[] {
  const q = query.trim().toLowerCase();
  return REB_OFFICIAL_CATALOG.filter(b => {
    if (level && level !== 'ALL' && b.level !== level) return false;
    if (classGrade && classGrade !== 'ALL' && b.classGrade !== classGrade) return false;
    if (type && type !== 'ALL' && b.type !== type) return false;
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.classGrade.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
    );
  });
}
