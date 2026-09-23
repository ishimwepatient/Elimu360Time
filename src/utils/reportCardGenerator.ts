import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentReportCard, School, ClassRoom, AnnualSubjectGrade, Student, Subject } from '../types';
import QRCode from 'qrcode';

/**
 * Standard Rwandan REB Grading Scale
 */
export const calculateRwandanGradeLetter = (percentage: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'S' => {
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  if (percentage >= 30) return 'S';
  return 'F';
};

/**
 * Formative qualitative comments for Pre-Primary / Nursery levels
 */
export const getPrePrimaryQualitativeComment = (percentage: number): string => {
  if (percentage >= 88) return 'Perfect';
  if (percentage >= 80) return 'Amazing';
  if (percentage >= 70) return 'Very good';
  if (percentage >= 60) return 'Good';
  if (percentage >= 50) return 'Keep It up';
  return 'Progressing Well';
};

/**
 * Detects whether a class is in Pre-Primary / Nursery level
 */
export const isPrePrimaryLevel = (classRoom?: { level_name?: string; level?: string; name?: string }): boolean => {
  if (!classRoom) return false;
  const str = `${classRoom.level_name || ''} ${classRoom.level || ''} ${classRoom.name || ''}`.toLowerCase();
  return str.includes('pre-primary') || 
         str.includes('nursery') || 
         str.includes('maternelle') || 
         str.includes('ecd') || 
         str.includes('kindergarten') ||
         str.includes('baby') ||
         str.includes('middle') ||
         str.includes('top');
};

/**
 * Official Rwandan Coat of Arms SVG Vector Emblem
 */
export const RWANDA_COAT_OF_ARMS_SVG = `
<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style="width:62px; height:62px; display:inline-block;">
  <defs>
    <linearGradient id="rwGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD116" />
      <stop offset="100%" stop-color="#D4AF37" />
    </linearGradient>
    <linearGradient id="rwGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00A859" />
      <stop offset="100%" stop-color="#00773E" />
    </linearGradient>
  </defs>
  <circle cx="90" cy="90" r="82" fill="#FFFFFF" stroke="#00A859" stroke-width="4"/>
  <circle cx="90" cy="90" r="76" fill="none" stroke="#FCD116" stroke-width="2.5" stroke-dasharray="3,3"/>
  <path id="textArcTop" d="M 30,90 A 60,60 0 0,1 150,90" fill="none"/>
  <text font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="#00773E" letter-spacing="1.5">
    <textPath href="#textArcTop" startOffset="50%" text-anchor="middle">REPUBULIKA Y'U RWANDA</textPath>
  </text>
  <circle cx="90" cy="48" r="9" fill="url(#rwGold)" stroke="#D4AF37" stroke-width="1.2"/>
  <line x1="90" y1="34" x2="90" y2="38" stroke="#D4AF37" stroke-width="2"/>
  <line x1="102" y1="39" x2="98" y2="42" stroke="#D4AF37" stroke-width="2"/>
  <line x1="78" y1="39" x2="82" y2="42" stroke="#D4AF37" stroke-width="2"/>
  <line x1="105" y1="48" x2="101" y2="48" stroke="#D4AF37" stroke-width="2"/>
  <line x1="75" y1="48" x2="79" y2="48" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="90,56 79,72 82,98 98,98 101,72" fill="#F8FAFC" stroke="#0F172A" stroke-width="1.8"/>
  <polygon points="90,56 84,72 90,72" fill="#E2E8F0" stroke="#0F172A" stroke-width="0.8"/>
  <line x1="82" y1="78" x2="98" y2="78" stroke="#0F172A" stroke-width="1"/>
  <line x1="82" y1="86" x2="98" y2="86" stroke="#0F172A" stroke-width="1"/>
  <polygon points="86,78 90,86 82,86" fill="#00A859"/>
  <polygon points="94,78 98,86 90,86" fill="#00A3E0"/>
  <path d="M 60,68 C 65,78 65,92 60,102 C 55,92 55,78 60,68 Z" fill="url(#rwGold)" stroke="#0F172A" stroke-width="1.5"/>
  <path d="M 120,68 C 125,78 125,92 120,102 C 115,92 115,78 120,68 Z" fill="url(#rwGold)" stroke="#0F172A" stroke-width="1.5"/>
  <path d="M 68,110 C 60,95 62,80 66,66" fill="none" stroke="#00A859" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 112,110 C 120,95 118,80 114,66" fill="none" stroke="#00A859" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 76,104 Q 90,112 104,104 L 102,114 Q 90,120 78,114 Z" fill="#475569" stroke="#1E293B" stroke-width="1.2"/>
  <path d="M 44,136 Q 90,144 136,136 L 132,148 Q 90,154 48,148 Z" fill="url(#rwGreen)" stroke="#005B94" stroke-width="1.2"/>
  <path id="textArcBottom" d="M 46,143 Q 90,151 134,143" fill="none"/>
  <text font-family="Arial, sans-serif" font-size="6.2" font-weight="900" fill="#FFFFFF" letter-spacing="0.8">
    <textPath href="#textArcBottom" startOffset="50%" text-anchor="middle">UBUMWE · UMURIMO · GUKUNDA IGIHUGU</textPath>
  </text>
  <circle cx="90" cy="126" r="4.5" fill="#00A859" stroke="#FCD116" stroke-width="1.2"/>
</svg>`;

/**
 * Biometric Human Silhouette SVG when no student photo exists
 */
export const PASSPORT_SILHOUETTE_SVG = `
<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="width:58px; height:68px; display:inline-block; border-radius:4px; border:1px solid #cbd5e1; background:#f8fafc;">
  <rect width="100" height="120" fill="#f8fafc"/>
  <ellipse cx="50" cy="42" rx="19" ry="24" fill="#94a3b8"/>
  <path d="M 16,114 C 16,84 32,74 50,74 C 68,74 84,84 84,114 Z" fill="#64748b"/>
</svg>`;

/**
 * Institutional School Crest SVG Shield Fallback
 */
export const getSchoolCrestSvg = (code: string) => `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:62px; height:62px; display:inline-block;">
  <path d="M 50,8 L 84,24 L 84,56 C 84,78 50,94 50,94 C 50,94 16,78 16,56 L 16,24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="3"/>
  <path d="M 50,14 L 78,28 L 78,54 C 78,72 50,86 50,86 C 50,86 22,72 22,54 L 22,28 Z" fill="#0f172a"/>
  <text x="50" y="58" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#f59e0b" text-anchor="middle">${code.slice(0, 4)}</text>
</svg>`;

/**
 * Validates report generation prerequisites according to Rwandan MINEDUC governance
 * and international SIMS standards.
 */
export const validateReportGenerationPrerequisites = (params: {
  reportType: 'Termly / Progressive Report' | 'Midterm Report' | 'Annual Report' | 'Special / Test Report';
  specialAssessmentType?: string;
  selectedClass: ClassRoom;
  students: Student[];
  grades: any[];
  term: string;
  schoolId: string;
}): { isValid: boolean; errorMessage?: string; warnings?: string[] } => {
  const classStudents = params.students.filter(s => s.class_id === params.selectedClass.id);
  if (classStudents.length === 0) {
    return {
      isValid: false,
      errorMessage: `Report Generation Blocked: No active students are registered in class ${params.selectedClass.name}.`
    };
  }

  // Get class-scoped grades
  const classGrades = params.grades.filter(g => 
    (!g.school_id || g.school_id === params.schoolId || g.school_id === 'all') &&
    g.class_id === params.selectedClass.id
  );

  const termGrades = classGrades.filter(g => 
    !g.term || g.term === params.term || g.term.toLowerCase() === params.term.toLowerCase()
  );

  if (params.reportType === 'Termly / Progressive Report') {
    // Termly/Progressive requires BOTH Test (M.T) and Final Exam (EX) marks to be recorded in the system
    const hasMT = termGrades.some(g => 
      g.assessment_type === 'Test' ||
      g.assessment_type === 'CAT' ||
      g.assessment_type === 'Mid term test' ||
      g.assessment_type === 'Midterm' ||
      g.assessment_type?.toLowerCase()?.includes('test') ||
      g.assessment_type?.toLowerCase()?.includes('cat')
    );

    const hasEX = termGrades.some(g => 
      g.assessment_type === 'Final Exam' ||
      g.assessment_type === 'END_OF_TERM' ||
      g.assessment_type === 'Exam' ||
      g.assessment_type?.toLowerCase()?.includes('exam')
    );

    if (!hasMT && !hasEX) {
      return {
        isValid: false,
        errorMessage: `Termly / Progressive Report generation blocked: Neither Midterm Test (M.T) nor Final Exam (EX) marks have been recorded for ${params.selectedClass.name} in ${params.term}. Both assessments are mandatory for progressive evaluation.`
      };
    }

    if (!hasMT) {
      return {
        isValid: false,
        errorMessage: `Termly / Progressive Report generation blocked: Midterm Test (M.T) marks are missing for ${params.selectedClass.name} in ${params.term}. Both M.T and EX marks must be recorded before generating the progressive report.`
      };
    }

    if (!hasEX) {
      return {
        isValid: false,
        errorMessage: `Termly / Progressive Report generation blocked: Final Exam (EX) marks are missing for ${params.selectedClass.name} in ${params.term}. Both M.T and EX marks must be recorded before generating the progressive report.`
      };
    }
  } else if (params.reportType === 'Midterm Report') {
    // Midterm report only requires Midterm Test (M.T) marks
    const hasMT = termGrades.some(g => 
      g.assessment_type === 'Test' ||
      g.assessment_type === 'CAT' ||
      g.assessment_type === 'Mid term test' ||
      g.assessment_type === 'Midterm' ||
      g.assessment_type?.toLowerCase()?.includes('test') ||
      g.assessment_type?.toLowerCase()?.includes('cat')
    );

    if (!hasMT) {
      return {
        isValid: false,
        errorMessage: `Midterm Report generation blocked: No Midterm Test (M.T) marks have been recorded for ${params.selectedClass.name} in ${params.term}. Midterm reports require recorded test scores.`
      };
    }
  } else if (params.reportType === 'Annual Report') {
    // Annual report requires validated marks in all 3 terms: Term 1, Term 2, and Term 3
    const hasTerm1 = classGrades.some(g => g.term?.toLowerCase().includes('1'));
    const hasTerm2 = classGrades.some(g => g.term?.toLowerCase().includes('2'));
    const hasTerm3 = classGrades.some(g => g.term?.toLowerCase().includes('3'));

    const missingTerms: string[] = [];
    if (!hasTerm1) missingTerms.push('Term 1');
    if (!hasTerm2) missingTerms.push('Term 2');
    if (!hasTerm3) missingTerms.push('Term 3');

    if (missingTerms.length > 0) {
      return {
        isValid: false,
        errorMessage: `Annual Report generation blocked: Annual deliberation requires marks from all three academic terms. Currently missing marks for: ${missingTerms.join(', ')} in class ${params.selectedClass.name}.`
      };
    }
  } else if (params.reportType === 'Special / Test Report') {
    const targetAssessment = params.specialAssessmentType || 'End of Unit Test';
    const isCatRequest = targetAssessment.toLowerCase().includes('cat') || targetAssessment.toLowerCase().includes('test');

    const hasSpecialMarks = termGrades.some(g => {
      const gType = (g.assessment_type || '').toLowerCase();
      const tType = targetAssessment.toLowerCase();
      if (gType === tType) return true;
      if (isCatRequest && (gType.includes('cat') || gType.includes('test'))) return true;
      return false;
    });

    if (!hasSpecialMarks) {
      return {
        isValid: false,
        errorMessage: `Special Report generation blocked: No recorded marks found for "${targetAssessment}" in ${params.selectedClass.name} for ${params.term}.`
      };
    }
  }

  return { isValid: true };
};

/**
 * Filter assigned subjects strictly for a specific class.
 * RULE: If a subject is not assigned to a class, it must NEVER appear on that class's report.
 */
export const getAssignedClassSubjects = (classRoom: ClassRoom, allSubjects: Subject[], schoolId?: string): Subject[] => {
  const schoolSubjects = allSubjects.filter(s => !s.school_id || !schoolId || s.school_id === schoolId || s.school_id === 'all');
  
  // Check 1: Explicit assignment via classRoom.subject_ids OR subject.applicable_class_ids
  const explicitlyAssigned = schoolSubjects.filter(s => 
    (classRoom.subject_ids && classRoom.subject_ids.length > 0 && classRoom.subject_ids.includes(s.id)) ||
    (s.applicable_class_ids && s.applicable_class_ids.length > 0 && s.applicable_class_ids.includes(classRoom.id))
  );

  if (explicitlyAssigned.length > 0) {
    return explicitlyAssigned;
  }

  // Check 2: Filter out any subject that is explicitly assigned ONLY to other classes
  const unassignedToOthers = schoolSubjects.filter(s => 
    !s.applicable_class_ids || 
    s.applicable_class_ids.length === 0 || 
    s.applicable_class_ids.includes(classRoom.id)
  );

  const isPrePrim = isPrePrimaryLevel(classRoom);
  const levelStr = `${classRoom.level_name || ''} ${classRoom.level || ''} ${classRoom.name || ''}`.toLowerCase();

  if (isPrePrim) {
    return unassignedToOthers.filter(s => 
      s.code?.toLowerCase().startsWith('nur') || 
      s.name?.toLowerCase().includes('numeracy') ||
      s.name?.toLowerCase().includes('language') ||
      s.name?.toLowerCase().includes('creative') ||
      s.name?.toLowerCase().includes('social') ||
      s.name?.toLowerCase().includes('physical')
    );
  }

  if (levelStr.includes('primary') || levelStr.startsWith('p')) {
    return unassignedToOthers.filter(s => 
      !s.code?.toLowerCase().startsWith('nur') &&
      !s.code?.toLowerCase().startsWith('sec') &&
      !s.name?.toLowerCase().includes('advanced')
    );
  }

  return unassignedToOthers.filter(s => !s.code?.toLowerCase().startsWith('nur'));
};

/**
 * Computes official Rwandan report cards with rigorous mathematical conversions:
 * 1. Maximum marks = periods_per_week * 10 (e.g. 6 periods = 60 marks; 5 periods = 50 marks).
 * 2. M.T Max = Max / 2, EX Max = Max / 2.
 * 3. Converts entered marks (e.g. out of 100) proportionally into standard subject target maximum.
 * 4. Disambiguates students with identical names by their unique student ID and registration code.
 * 5. Strict assessment type handling (Termly, Midterm, Annual, Special).
 */
export const generateClassReportCards = (params: {
  selectedClass: ClassRoom;
  students: Student[];
  grades: any[];
  subjects: Subject[];
  term: string;
  academicYear: string;
  reportMode?: 'TERMINAL' | 'ANNUAL';
  reportType?: 'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL';
  specialAssessmentType?: string;
  school?: School;
  includeDecisions?: boolean;
  hideDecisions?: boolean;
  deliberationSettings?: {
    promotionCutoff?: number;
    secondSittingEnabled?: boolean;
    secondSittingMinCutoff?: number;
    studentOverrides?: Record<string, 'AUTOMATIC' | 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE'>;
  };
}): StudentReportCard[] => {
  const isPrePrim = isPrePrimaryLevel(params.selectedClass);
  const classStudents = params.students.length > 0 && params.students.every(s => s.class_id === params.selectedClass.id)
    ? params.students
    : params.students.filter(s => s.class_id === params.selectedClass.id || s.previous_class_name === params.selectedClass.name || params.students.length === 1);
  const targetTerm = params.term || 'Term 1';
  const targetYear = params.academicYear || '2026';
  const rType = params.reportType || (params.reportMode === 'ANNUAL' ? 'ANNUAL' : 'PROGRESSIVE');
  const isAnnual = rType === 'ANNUAL';
  const isMidterm = rType === 'MIDTERM';
  const isSpecial = rType === 'SPECIAL';

  // RULE 1: STRICT CLASS-SUBJECT ASSIGNMENT
  // If a subject is not assigned to a class, it must NEVER display marks for that subject on report cards of that class.
  const classSubjectsList = getAssignedClassSubjects(params.selectedClass, params.subjects, params.school?.id);

  // Generate report for each student strictly identified by unique student ID
  const computedReports: Array<StudentReportCard & { 
    _rawRatio: number;
    _t1Score?: number;
    _t2Score?: number;
    _t3Score?: number;
  }> = classStudents.map(st => {
    const subjectGrades = classSubjectsList.map(sub => {
      // RULE 2: Standard Rwandan Calculation (1 Period = 10 Max Marks)
      const periods = Math.max(1, sub.periods_per_week || sub.credits || 4);
      const calculatedMax = periods * 10;
      const testMax = calculatedMax;
      const examMax = calculatedMax;
      const totalSubMax = isMidterm || isSpecial ? calculatedMax : (testMax + examMax);

      // Filter grades strictly for this student's unique ID and subject
      const stSubGrades = params.grades.filter(g =>
        g.student_id === st.id &&
        g.subject_id === sub.id &&
        (g.term === targetTerm || (g.term && g.term.toLowerCase() === targetTerm.toLowerCase()))
      );

      // Locate Midterm Test (M.T) and Final Exam (EX)
      const midtermGrade = stSubGrades.find(g =>
        g.assessment_type === 'Midterm' ||
        g.assessment_type === 'Mid term test' ||
        g.assessment_type === 'Midterm Test' ||
        g.assessment_type === 'M.T' ||
        g.assessment_type === 'MID_TERM'
      );

      const catTestGrade = stSubGrades.find(g =>
        g.assessment_type === 'Test' ||
        g.assessment_type === 'CAT' ||
        g.assessment_type === 'End of Unit Test' ||
        g.assessment_type === 'Quiz' ||
        g.assessment_type?.toLowerCase()?.includes('test') ||
        g.assessment_type?.toLowerCase()?.includes('cat')
      );

      const testGrade = midtermGrade || catTestGrade;

      const examGrade = stSubGrades.find(g =>
        g.assessment_type === 'Final Exam' ||
        g.assessment_type === 'END_OF_TERM' ||
        g.assessment_type === 'Exam' ||
        g.assessment_type === 'E.X' ||
        g.assessment_type === 'Ex' ||
        g.assessment_type?.toLowerCase()?.includes('exam')
      );

      const isCatRequest = (params.specialAssessmentType || '').toLowerCase().includes('cat') || (params.specialAssessmentType || '').toLowerCase().includes('test');
      const specialGrade = isSpecial ? (
        stSubGrades.find(g => {
          const gType = (g.assessment_type || '').toLowerCase();
          const tType = (params.specialAssessmentType || '').toLowerCase();
          if (g.assessment_type === params.specialAssessmentType || gType === tType) return true;
          if (isCatRequest && (gType.includes('cat') || gType.includes('test'))) return true;
          return false;
        }) || catTestGrade
      ) : undefined;

      // RULE 3: PROPORTIONAL MARK CONVERSION & NORMALIZATION (Decimal Precision)
      let testScore = 0;
      let examScore = 0;
      let subTotal = 0;

      if (isSpecial) {
        if (specialGrade) {
          const rawMark = Number(specialGrade.marks) || 0;
          const rawMax = Number(specialGrade.max_marks) || 100;
          const effectiveRawMax = rawMark > rawMax ? Math.max(100, rawMark) : rawMax;
          subTotal = Number(((rawMark / (effectiveRawMax > 0 ? effectiveRawMax : 100)) * calculatedMax).toFixed(2));
          testScore = subTotal;
        }
      } else if (isMidterm) {
        const targetG = midtermGrade || testGrade;
        if (targetG) {
          const rawMark = Number(targetG.marks) || 0;
          const rawMax = Number(targetG.max_marks) || testMax;
          const effectiveRawMax = rawMark > rawMax ? Math.max(100, rawMark) : rawMax;
          subTotal = Number(((rawMark / (effectiveRawMax > 0 ? effectiveRawMax : testMax)) * calculatedMax).toFixed(2));
          testScore = subTotal;
        }
      } else {
        // Progressive / Termly Report: M.T (calculatedMax) + EX (calculatedMax)
        if (testGrade) {
          const rawMark = Number(testGrade.marks) || 0;
          const rawMax = Number(testGrade.max_marks) || testMax;
          const effectiveRawMax = rawMark > rawMax ? Math.max(100, rawMark) : rawMax;
          testScore = Number(((rawMark / (effectiveRawMax > 0 ? effectiveRawMax : testMax)) * testMax).toFixed(2));
        }
        if (examGrade) {
          const rawMark = Number(examGrade.marks) || 0;
          const rawMax = Number(examGrade.max_marks) || examMax;
          const effectiveRawMax = rawMark > rawMax ? Math.max(100, rawMark) : rawMax;
          examScore = Number(((rawMark / (effectiveRawMax > 0 ? effectiveRawMax : examMax)) * examMax).toFixed(2));
        }
        subTotal = Number((testScore + examScore).toFixed(2));
      }

      const subPct = totalSubMax > 0 ? Number(((subTotal / totalSubMax) * 100).toFixed(2)) : 0;

      return {
        subject: sub,
        assessments: [],
        periods_per_week: periods,
        testMark: testGrade ? testScore : undefined,
        testMax: testMax,
        examMark: examGrade ? examScore : undefined,
        examMax: examMax,
        totalMarks: subTotal,
        totalMaxMarks: totalSubMax,
        percentage: subPct,
        gradeLetter: calculateRwandanGradeLetter(subPct),
        remarks: subPct >= 80 ? 'Mastery demonstrated' : subPct >= 65 ? 'Satisfactory engagement' : subPct >= 50 ? 'Average progress' : (subTotal === 0 ? 'Assessment pending' : 'Remedial reinforcement required')
      };
    });

    const stConductScore = st.conduct_score ?? 40;
    const totalAcademicObtained = Number(subjectGrades.reduce((sum, g) => sum + g.totalMarks, 0).toFixed(2));
    const totalAcademicMax = Number(subjectGrades.reduce((sum, g) => sum + g.totalMaxMarks, 0).toFixed(2));

    const totalMarksObtained = totalAcademicObtained;
    const totalMaxPossible = totalAcademicMax;
    const overallPct = totalMaxPossible > 0 ? Number(((totalMarksObtained / totalMaxPossible) * 100).toFixed(2)) : 0;
    const rawRatio = totalMaxPossible > 0 ? (totalMarksObtained / totalMaxPossible) : 0;

    // RULE 4: ANNUAL REPORT THREE-TERM INTEGRATION (M.T & EX PER TERM)
    let t1Sum = 0;
    let t2Sum = 0;
    let t3Sum = 0;

    const annualSubjectGrades: AnnualSubjectGrade[] = isAnnual ? classSubjectsList.map(sub => {
      const periods = Math.max(1, sub.periods_per_week || sub.credits || 4);
      const totalMax = periods * 10;
      const half = Math.round((totalMax / 2) * 10) / 10;

      const getTermDetails = (termIdentifier: string) => {
        const termGrades = params.grades.filter(g => 
          g.student_id === st.id && 
          g.subject_id === sub.id && 
          g.term && g.term.toLowerCase().includes(termIdentifier)
        );
        const tG = termGrades.find(g => g.assessment_type?.toLowerCase()?.includes('test') || g.assessment_type?.toLowerCase()?.includes('cat') || g.assessment_type?.toLowerCase()?.includes('mid'));
        const eG = termGrades.find(g => g.assessment_type?.toLowerCase()?.includes('exam') || g.assessment_type?.toLowerCase()?.includes('end'));
        
        let test = tG ? Number(tG.marks) || 0 : undefined;
        let exam = eG ? Number(eG.marks) || 0 : undefined;

        if (test === undefined && exam === undefined && termGrades.length > 0) {
          test = Number(termGrades[0].marks) || 0;
          exam = 0;
        }

        const resolvedTest = test ?? 0;
        const resolvedExam = exam ?? 0;
        const total = (test !== undefined || exam !== undefined) ? Number((resolvedTest + resolvedExam).toFixed(1)) : undefined;
        return { 
          test, 
          exam, 
          total 
        };
      };

      const t1 = getTermDetails('1');
      const t2 = getTermDetails('2');
      const t3 = getTermDetails('3');

      const t1TotalVal = t1.total ?? 0;
      const t2TotalVal = t2.total ?? 0;
      const t3TotalVal = t3.total ?? 0;

      t1Sum = Number((t1Sum + t1TotalVal).toFixed(2));
      t2Sum = Number((t2Sum + t2TotalVal).toFixed(2));
      t3Sum = Number((t3Sum + t3TotalVal).toFixed(2));

      const activeTermTotals = [t1.total, t2.total, t3.total].filter((v): v is number => v !== undefined);
      const annualTotalMarks = Number(activeTermTotals.reduce((a, b) => a + b, 0).toFixed(2));
      const annualTotalMax = totalMax * activeTermTotals.length;
      const avgPct = annualTotalMax > 0 ? Number(((annualTotalMarks / annualTotalMax) * 100).toFixed(2)) : 0;

      return {
        subject: sub,
        periods_per_week: periods,
        totalMaxMarks: totalMax,
        term1Test: t1.test,
        term1Exam: t1.exam,
        term1Total: t1.total,
        term2Test: t2.test,
        term2Exam: t2.exam,
        term2Total: t2.total,
        term3Test: t3.test,
        term3Exam: t3.exam,
        term3Total: t3.total,
        annualAverageOutOf100: avgPct,
        gradeLetter: calculateRwandanGradeLetter(avgPct),
        remarks: avgPct >= 75 ? 'Very Good Mastery' : avgPct >= 50 ? 'Competent' : 'Needs reinforcement'
      };
    }) : [];

    const hasT1 = params.grades.some(g => g.student_id === st.id && (g.term?.toLowerCase().includes('1') || g.term?.toLowerCase().includes('one')) && Number(g.marks) > 0);
    const hasT2 = params.grades.some(g => g.student_id === st.id && (g.term?.toLowerCase().includes('2') || g.term?.toLowerCase().includes('two')) && Number(g.marks) > 0);
    const hasT3 = params.grades.some(g => g.student_id === st.id && (g.term?.toLowerCase().includes('3') || g.term?.toLowerCase().includes('three')) && Number(g.marks) > 0);

    const termsStudiedCount = (hasT1 ? 1 : 0) + (hasT2 ? 1 : 0) + (hasT3 ? 1 : 0);
    const effectiveTermsCount = termsStudiedCount === 0 ? 3 : termsStudiedCount;

    let annualGrandTotal = Number((t1Sum + t2Sum + t3Sum).toFixed(2));
    let annualGrandMax = totalMaxPossible * 3;

    if (effectiveTermsCount === 1) {
      if (hasT1) annualGrandTotal = t1Sum;
      else if (hasT2) annualGrandTotal = t2Sum;
      else if (hasT3) annualGrandTotal = t3Sum;
      annualGrandMax = totalMaxPossible;
    } else if (effectiveTermsCount === 2) {
      let sum2 = 0;
      if (hasT1) sum2 += t1Sum;
      if (hasT2) sum2 += t2Sum;
      if (hasT3) sum2 += t3Sum;
      if (!hasT1 && !hasT2) sum2 = t1Sum + t2Sum;
      annualGrandTotal = sum2;
      annualGrandMax = totalMaxPossible * 2;
    }

    const annualAvgPct = annualGrandMax > 0 ? Number(((annualGrandTotal / annualGrandMax) * 100).toFixed(2)) : 0;
    const annualRawRatio = annualGrandMax > 0 ? (annualGrandTotal / annualGrandMax) : 0;

    // Structured Deliberation Settings Resolution
    const promCut = params.deliberationSettings?.promotionCutoff ?? 65;
    const secEnabled = params.deliberationSettings?.secondSittingEnabled ?? true;
    const secMin = params.deliberationSettings?.secondSittingMinCutoff ?? 50;
    const overrides = params.deliberationSettings?.studentOverrides || {};

    const stOverride = overrides[st.id] || 'AUTOMATIC';

    let decisionCode: 'PROMOTED' | '2ND_SITTING' | 'REPEAT' | 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE' = 'PROMOTED';
    let decisionLabel = '';
    let isOverride = false;
    let overrideType: 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE' | undefined = undefined;

    if (stOverride === 'PROMOTE_ANYWHERE') {
      decisionCode = 'PROMOTE_ANYWHERE';
      decisionLabel = 'PROMOTED TO NEXT GRADE (DELIBERATION OVERRIDE)';
      isOverride = true;
      overrideType = 'PROMOTE_ANYWHERE';
    } else if (stOverride === 'REPEAT_ANYWHERE') {
      decisionCode = 'REPEAT_ANYWHERE';
      decisionLabel = 'ADVISED TO REPEAT (DELIBERATION / CONDUCT OVERRIDE)';
      isOverride = true;
      overrideType = 'REPEAT_ANYWHERE';
    } else if (stConductScore < 20) {
      decisionCode = 'REPEAT_ANYWHERE';
      decisionLabel = 'ADVISED TO REPEAT (UNSATISFACTORY CONDUCT)';
      isOverride = true;
      overrideType = 'REPEAT_ANYWHERE';
    } else if (effectiveTermsCount === 1) {
      decisionCode = 'REPEAT';
      decisionLabel = 'ADVISED TO REPEAT (STUDIED 1 TERM ONLY)';
    } else if (annualAvgPct >= promCut) {
      decisionCode = 'PROMOTED';
      decisionLabel = 'PROMOTED TO NEXT GRADE';
    } else if (secEnabled && annualAvgPct >= secMin) {
      decisionCode = '2ND_SITTING';
      decisionLabel = 'RECOMMENDED FOR 2ND SITTING TEST';
    } else {
      decisionCode = 'REPEAT';
      decisionLabel = 'ADVISED TO REPEAT';
    }

    const criteriaSummary = secEnabled
      ? `Criteria: Promoted (x ≥ ${promCut}%), 2nd Sitting (${secMin}% - ${(promCut - 0.1).toFixed(1)}%), Repeat (x < ${secMin}%)`
      : `Criteria: Promoted (x ≥ ${promCut}%), Repeat (x < ${promCut}%)`;

    return {
      _rawRatio: isAnnual ? annualRawRatio : rawRatio,
      _t1Score: t1Sum,
      _t2Score: t2Sum,
      _t3Score: t3Sum,
      student: st,
      term: targetTerm,
      academicYear: targetYear,
      reportMode: isAnnual ? 'ANNUAL' : 'TERMINAL',
      reportType: rType,
      specialAssessmentType: params.specialAssessmentType,
      isPrePrimary: isPrePrim,
      prePrimaryComment: isPrePrim ? getPrePrimaryQualitativeComment(isAnnual ? annualAvgPct : overallPct) : undefined,
      subjectGrades,
      annualSubjectGrades: isAnnual ? annualSubjectGrades : undefined,
      annualSummary: isAnnual ? {
        term1Total: t1Sum,
        term1Max: totalMaxPossible,
        term1Percentage: totalMaxPossible > 0 ? Number(((t1Sum / totalMaxPossible) * 100).toFixed(2)) : 0,
        term1Rank: 1,
        term2Total: t2Sum,
        term2Max: totalMaxPossible,
        term2Percentage: totalMaxPossible > 0 ? Number(((t2Sum / totalMaxPossible) * 100).toFixed(2)) : 0,
        term2Rank: 1,
        term3Total: t3Sum,
        term3Max: totalMaxPossible,
        term3Percentage: totalMaxPossible > 0 ? Number(((t3Sum / totalMaxPossible) * 100).toFixed(2)) : 0,
        term3Rank: 1,
        annualTotalMarks: annualGrandTotal,
        annualMaxMarks: annualGrandMax,
        annualAveragePercentage: annualAvgPct,
        annualRank: 1,
        deliberationDecision: decisionLabel,
        term1Conduct: { score: stConductScore, grade: st.conduct_grade || 'A', remark: 'Good Conduct' },
        term2Conduct: { score: stConductScore, grade: st.conduct_grade || 'A', remark: 'Good Conduct' },
        term3Conduct: { score: stConductScore, grade: st.conduct_grade || 'A', remark: 'Good Conduct' }
      } : undefined,
      totalMarksObtained: isAnnual ? annualGrandTotal : totalMarksObtained,
      totalMaxPossible: isAnnual ? annualGrandMax : totalMaxPossible,
      overallAveragePercentage: isAnnual ? annualAvgPct : overallPct,
      classRank: 1,
      totalStudentsInClass: classStudents.length,
      attendancePercentage: 98,
      conductScore: stConductScore,
      conductMaxScore: 40,
      conductGrade: st.conduct_grade || 'A',
      conductRemark: stConductScore >= 35 ? 'Exemplary character and disciplined conduct.' : 'Attention required on behavior and discipline.',
      headmasterRemark: (isAnnual ? annualAvgPct : overallPct) >= 80 
        ? 'Outstanding academic excellence. Keep up this commendable standard.' 
        : ((isAnnual ? annualAvgPct : overallPct) >= 50 ? 'Consistent effort; encouraged to maintain academic focus.' : 'Encouraged to strengthen study habits and attend remedial support.'),
      includeDecisions: params.includeDecisions,
      hideDecisions: params.hideDecisions,
      deliberationDetails: {
        promotionCutoff: promCut,
        secondSittingEnabled: secEnabled,
        secondSittingMinCutoff: secMin,
        decisionCode,
        decisionLabel,
        criteriaSummary,
        isOverride,
        overrideType
      }
    };
  });

  // Calculate distinct ranks with strict competition ranking based on unrounded raw ratio & exact total marks
  computedReports.sort((a, b) => {
    const diffRatio = b._rawRatio - a._rawRatio;
    if (Math.abs(diffRatio) > 0.0000001) {
      return diffRatio;
    }
    const diffMarks = b.totalMarksObtained - a.totalMarksObtained;
    if (Math.abs(diffMarks) > 0.0000001) {
      return diffMarks;
    }
    return a.student.last_name.localeCompare(b.student.last_name);
  });

  computedReports.forEach((rep, idx) => {
    if (idx === 0) {
      rep.classRank = 1;
    } else {
      const prev = computedReports[idx - 1];
      if (Math.abs(rep._rawRatio - prev._rawRatio) < 0.0000001 && Math.abs(rep.totalMarksObtained - prev.totalMarksObtained) < 0.0000001) {
        rep.classRank = prev.classRank;
      } else {
        rep.classRank = idx + 1;
      }
    }
  });

  // If Annual Report, compute Term 1, Term 2, and Term 3 distinct ranks across all class students
  if (isAnnual) {
    const t1Ranks = [...computedReports].sort((a, b) => (b._t1Score || 0) - (a._t1Score || 0));
    const t2Ranks = [...computedReports].sort((a, b) => (b._t2Score || 0) - (a._t2Score || 0));
    const t3Ranks = [...computedReports].sort((a, b) => (b._t3Score || 0) - (a._t3Score || 0));

    computedReports.forEach(rep => {
      if (rep.annualSummary) {
        rep.annualSummary.term1Rank = t1Ranks.findIndex(r => r.student.id === rep.student.id) + 1;
        rep.annualSummary.term2Rank = t2Ranks.findIndex(r => r.student.id === rep.student.id) + 1;
        rep.annualSummary.term3Rank = t3Ranks.findIndex(r => r.student.id === rep.student.id) + 1;
        rep.annualSummary.annualRank = rep.classRank;
      }
    });
  }

  return computedReports.map(({ _rawRatio, _t1Score, _t2Score, _t3Score, ...rest }) => rest);
};

/**
 * Generates official Rwandan single-page A4 HTML document
 */
export const generateRwandanReportHtml = (
  report: StudentReportCard,
  school: School,
  qrCodeDataUrl?: string
): string => {
  const isAnnual = report.reportMode === 'ANNUAL' || report.reportType === 'ANNUAL';
  const isMidterm = report.reportType === 'MIDTERM';
  const isSpecial = report.reportType === 'SPECIAL';
  const isPrePrim = report.isPrePrimary || isPrePrimaryLevel({ name: report.student.class_name });

  const coatOfArmsHtml = school.national_coat_of_arms_url && !school.national_coat_of_arms_url.includes('unsplash')
    ? `<img src="${school.national_coat_of_arms_url}" alt="Republic of Rwanda Coat of Arms" style="max-width:65px; max-height:65px; width:auto; height:auto; object-fit:contain; display:block; margin:0 auto;" />`
    : RWANDA_COAT_OF_ARMS_SVG;

  const schoolLogoHtml = school.logo_url && !school.logo_url.includes('unsplash')
    ? `<img src="${school.logo_url}" alt="${school.name}" style="max-width:65px; max-height:65px; width:auto; height:auto; object-fit:contain; border-radius:4px; display:block; margin:0 auto;" />`
    : getSchoolCrestSvg(school.code || 'REB');

  const formattedDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const getPrePrimaryColorHex = (pct: number) => {
    if (pct >= 90) return { bg: '#bbf7d0', color: '#14532d', text: 'Excellent' };
    if (pct >= 70) return { bg: '#ddd6fe', color: '#581c87', text: 'Very Good' };
    if (pct >= 50) return { bg: '#fef08a', color: '#713f12', text: 'Good' };
    return { bg: '#fbcfe8', color: '#831843', text: 'Fair' };
  };

  const reportTitleText = isPrePrim 
    ? 'PROGRESSIVE REPORT'
    : isMidterm 
    ? 'MIDTERM' 
    : isAnnual 
    ? 'STUDENT ANNUAL REPORT' 
    : isSpecial
    ? `[ ${report.specialAssessmentType?.toUpperCase() || 'SPECIAL TEST'} REPORT ]`
    : '[ PROGRESSIVE REPORT ]';

  let tableContentHtml = '';

  if (isPrePrim && !isAnnual && !isMidterm) {
    const subjectRows = report.subjectGrades.map((subG, idx) => {
      const app = getPrePrimaryColorHex(subG.percentage);
      return `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding:4px 8px; font-weight:700; color:#0f172a; border:1px solid #94a3b8; text-align:left;">${subG.subject.name}</td>
          <td style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:700; color:#0f172a; border:1px solid #94a3b8;">${subG.percentage}%</td>
          <td style="padding:4px 8px; text-align:center; border:1px solid #94a3b8;">
            <span style="display:inline-block; padding:2px 8px; border-radius:3px; font-size:9px; font-weight:800; background:${app.bg}; color:${app.color};">${app.text}</span>
          </td>
        </tr>
      `;
    }).join('');

    const overallApp = getPrePrimaryColorHex(report.overallAveragePercentage);

    tableContentHtml = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:10px; border:1px solid #64748b;">
        <thead>
          <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:9px; border-bottom:1px solid #64748b;">
            <th style="padding:5px 8px; text-align:left; border:1px solid #94a3b8;">SUBJECT</th>
            <th style="padding:5px 8px; text-align:center; width:90px; border:1px solid #94a3b8;">MARKS %</th>
            <th style="padding:5px 8px; text-align:center; width:130px; border:1px solid #94a3b8;">APPRECIATION</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#e2e8f0; font-weight:800; font-size:9px; text-transform:uppercase;">
            <td colspan="3" style="padding:3px 8px; border:1px solid #94a3b8;">CORE SUBJECTS</td>
          </tr>
          ${subjectRows}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a;">
            <td style="padding:5px 8px; text-transform:uppercase; border:1px solid #94a3b8;">AVERAGE:</td>
            <td style="padding:5px 8px; text-align:center; font-family:monospace; font-weight:900; color:#1e3a8a; border:1px solid #94a3b8;">${report.overallAveragePercentage}%</td>
            <td style="padding:5px 8px; text-align:center; border:1px solid #94a3b8;">
              <span style="display:inline-block; padding:3px 10px; border-radius:3px; font-size:10px; font-weight:900; background:${overallApp.bg}; color:${overallApp.color};">${overallApp.text}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    `;
  } else if (isMidterm) {
    const subjectRows = report.subjectGrades.map((subG, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding:4px 8px; font-weight:600; color:#0f172a; border:1px solid #94a3b8; text-align:left;">${subG.subject.name}</td>
        <td style="padding:4px 8px; text-align:center; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${subG.totalMaxMarks}</td>
        <td style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:800; color:#0f172a; border:1px solid #94a3b8;">${subG.totalMarks}</td>
      </tr>
    `).join('');

    tableContentHtml = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:10px; border:1px solid #64748b;">
        <thead>
          <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:9px; border-bottom:1px solid #64748b;">
            <th style="padding:5px 8px; text-align:left; border:1px solid #94a3b8;">Subject</th>
            <th style="padding:5px 8px; text-align:center; width:80px; border:1px solid #94a3b8;">MAX</th>
            <th style="padding:5px 8px; text-align:center; width:80px; border:1px solid #94a3b8;">MARKS</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#e2e8f0; font-weight:800; font-size:9px; text-transform:uppercase;">
            <td colspan="3" style="padding:3px 8px; border:1px solid #94a3b8;">CORE SUBJECTS</td>
          </tr>
          ${subjectRows}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a;">
            <td style="padding:5px 8px; text-transform:uppercase; border:1px solid #94a3b8;">TERM TOTAL (ACADEMIC MARKS):</td>
            <td style="padding:5px 8px; text-align:center; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${report.totalMaxPossible}</td>
            <td style="padding:5px 8px; text-align:center; font-family:monospace; font-weight:900; color:#1e3a8a; border:1px solid #94a3b8;">${report.totalMarksObtained}</td>
          </tr>
          <tr style="background:#f8fafc; font-weight:900;">
            <td style="padding:4px 8px; text-transform:uppercase; border:1px solid #94a3b8;">PERCENTAGE:</td>
            <td colspan="2" style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:900; color:#1e3a8a; font-size:12px; border:1px solid #94a3b8;">${report.overallAveragePercentage}%</td>
          </tr>
          <tr style="background:#fef3c7; font-weight:900;">
            <td style="padding:4px 8px; text-transform:uppercase; border:1px solid #94a3b8;">POSITION:</td>
            <td colspan="2" style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:900; color:#92400e; font-size:12px; border:1px solid #94a3b8;">${report.classRank} / ${report.totalStudentsInClass}</td>
          </tr>
          <tr style="background:#eff6ff; font-weight:800;">
            <td style="padding:4px 8px; text-transform:uppercase; border:1px solid #94a3b8;">CONDUCT SCORE (BEHAVIOUR):</td>
            <td colspan="2" style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:900; color:#0f172a; font-size:12px; border:1px solid #94a3b8;">${report.conductScore ?? 40} / 40</td>
          </tr>
        </tfoot>
      </table>
    `;
  } else if (isAnnual) {
    const subjectRows = report.subjectGrades.map((subG, idx) => {
      const annGrade = report.annualSubjectGrades?.find(a => a.subject.id === subG.subject.id);
      const t1Test = annGrade?.term1Test !== undefined ? annGrade.term1Test : '-';
      const t1Exam = annGrade?.term1Exam !== undefined ? annGrade.term1Exam : '-';
      const t1Tot = annGrade?.term1Total !== undefined ? annGrade.term1Total : '-';

      const t2Test = annGrade?.term2Test !== undefined ? annGrade.term2Test : '-';
      const t2Exam = annGrade?.term2Exam !== undefined ? annGrade.term2Exam : '-';
      const t2Tot = annGrade?.term2Total !== undefined ? annGrade.term2Total : '-';

      const t3Test = annGrade?.term3Test !== undefined ? annGrade.term3Test : '-';
      const t3Exam = annGrade?.term3Exam !== undefined ? annGrade.term3Exam : '-';
      const t3Tot = annGrade?.term3Total !== undefined ? annGrade.term3Total : '-';

      const annAvg = annGrade?.annualAverageOutOf100 !== undefined ? annGrade.annualAverageOutOf100 : '-';

      return `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; text-align:center; font-size:9px;">
          <td style="padding:4px 6px; font-weight:600; text-align:left; color:#0f172a; border:1px solid #94a3b8;">${subG.subject.name}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${subG.totalMaxMarks}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t1Test}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t1Exam}</td>
          <td style="padding:4px 3px; font-family:monospace; font-weight:700; color:#0f172a; background:#f8fafc; border:1px solid #94a3b8;">${t1Tot}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t2Test}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t2Exam}</td>
          <td style="padding:4px 3px; font-family:monospace; font-weight:700; color:#0f172a; background:#f8fafc; border:1px solid #94a3b8;">${t2Tot}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t3Test}</td>
          <td style="padding:4px 3px; font-family:monospace; color:#334155; border:1px solid #94a3b8;">${t3Exam}</td>
          <td style="padding:4px 3px; font-family:monospace; font-weight:700; color:#0f172a; background:#f8fafc; border:1px solid #94a3b8;">${t3Tot}</td>
          <td style="padding:4px 4px; font-family:monospace; font-weight:800; color:#1e3a8a; background:#eff6ff; border:1px solid #94a3b8;">${annAvg}%</td>
          <td style="padding:4px 4px; font-weight:800; border:1px solid #94a3b8;">${typeof annAvg === 'number' ? calculateRwandanGradeLetter(annAvg) : '-'}</td>
          <td style="padding:4px 4px; color:#64748b; font-family:monospace; border:1px solid #94a3b8;">-</td>
        </tr>
      `;
    }).join('');

    tableContentHtml = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:6px; font-size:8.5px; border:1px solid #64748b;">
        <thead>
          <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:8px; border-bottom:1px solid #64748b; text-align:center;">
            <th rowspan="2" style="padding:4px 6px; text-align:left; border:1px solid #94a3b8; vertical-align:middle;">Subjects</th>
            <th rowspan="2" style="padding:4px 3px; border:1px solid #94a3b8; vertical-align:middle;">MAX</th>
            <th colspan="3" style="padding:3px; border:1px solid #94a3b8; background:#e2e8f0;">Term 1</th>
            <th colspan="3" style="padding:3px; border:1px solid #94a3b8; background:#cbd5e1;">Term 2</th>
            <th colspan="3" style="padding:3px; border:1px solid #94a3b8; background:#e2e8f0;">Term 3</th>
            <th rowspan="2" style="padding:4px 4px; background:#dbeafe; border:1px solid #94a3b8; vertical-align:middle;">Annual %</th>
            <th rowspan="2" style="padding:4px 4px; border:1px solid #94a3b8; vertical-align:middle;">GR</th>
            <th rowspan="2" style="padding:4px 4px; border:1px solid #94a3b8; vertical-align:middle;">2nd Sitting</th>
          </tr>
          <tr style="background:#f8fafc; font-weight:800; font-size:7.5px; text-align:center; border-bottom:1px solid #64748b;">
            <th style="padding:2px; border:1px solid #94a3b8;">M.T</th><th style="padding:2px; border:1px solid #94a3b8;">EX</th><th style="padding:2px; border:1px solid #94a3b8;">Tot</th>
            <th style="padding:2px; border:1px solid #94a3b8;">M.T</th><th style="padding:2px; border:1px solid #94a3b8;">EX</th><th style="padding:2px; border:1px solid #94a3b8;">Tot</th>
            <th style="padding:2px; border:1px solid #94a3b8;">M.T</th><th style="padding:2px; border:1px solid #94a3b8;">EX</th><th style="padding:2px; border:1px solid #94a3b8;">Tot</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a; text-align:center; font-size:9px;">
            <td colspan="2" style="padding:5px 6px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">Term Positions:</td>
            <td colspan="3" style="padding:5px 4px; font-family:monospace; color:#1e3a8a; border:1px solid #94a3b8;">Pos: #${report.annualSummary?.term1Rank ?? report.classRank} (${report.annualSummary?.term1Percentage ?? report.overallAveragePercentage}%)</td>
            <td colspan="3" style="padding:5px 4px; font-family:monospace; color:#1e3a8a; border:1px solid #94a3b8;">Pos: #${report.annualSummary?.term2Rank ?? report.classRank} (${report.annualSummary?.term2Percentage ?? report.overallAveragePercentage}%)</td>
            <td colspan="3" style="padding:5px 4px; font-family:monospace; color:#1e3a8a; border:1px solid #94a3b8;">Pos: #${report.annualSummary?.term3Rank ?? report.classRank} (${report.annualSummary?.term3Percentage ?? report.overallAveragePercentage}%)</td>
            <td style="padding:5px 4px; font-family:monospace; font-weight:900; color:#1e3a8a; background:#dbeafe; border:1px solid #94a3b8;">${report.overallAveragePercentage}%</td>
            <td style="padding:5px 4px; font-weight:900; border:1px solid #94a3b8;">${calculateRwandanGradeLetter(report.overallAveragePercentage)}</td>
            <td style="padding:5px 4px; font-weight:900; color:#92400e; background:#fef3c7; border:1px solid #94a3b8;">#${report.classRank} / ${report.totalStudentsInClass}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Conduct of All Three Terms -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:6px; font-size:9px;">
        <div style="border:1px solid #cbd5e1; border-radius:4px; padding:4px 6px; background:#f8fafc;">
          <strong style="text-transform:uppercase; display:block; color:#0f172a; font-size:8px;">Term 1 Conduct:</strong>
          <span>Score: <strong>${report.annualSummary?.term1Conduct?.score ?? 38} / 40</strong> · Grade: <strong>${report.annualSummary?.term1Conduct?.grade ?? 'A'}</strong></span>
        </div>
        <div style="border:1px solid #cbd5e1; border-radius:4px; padding:4px 6px; background:#f8fafc;">
          <strong style="text-transform:uppercase; display:block; color:#0f172a; font-size:8px;">Term 2 Conduct:</strong>
          <span>Score: <strong>${report.annualSummary?.term2Conduct?.score ?? 39} / 40</strong> · Grade: <strong>${report.annualSummary?.term2Conduct?.grade ?? 'A'}</strong></span>
        </div>
        <div style="border:1px solid #cbd5e1; border-radius:4px; padding:4px 6px; background:#f8fafc;">
          <strong style="text-transform:uppercase; display:block; color:#0f172a; font-size:8px;">Term 3 Conduct:</strong>
          <span>Score: <strong>${report.annualSummary?.term3Conduct?.score ?? report.conductScore ?? 40} / 40</strong> · Grade: <strong>${report.annualSummary?.term3Conduct?.grade ?? report.conductGrade ?? 'A+'}</strong></span>
        </div>
      </div>

      ${(report.includeDecisions && !report.hideDecisions) ? `
      <div style="border:1px solid #cbd5e1; border-radius:4px; padding:6px; background:#f8fafc; font-size:9px; margin-bottom:6px;">
        <div style="font-weight:900; color:#1e3a8a; border-bottom:1px solid #e2e8f0; padding-bottom:3px; margin-bottom:4px; display:flex; justify-content:space-between; text-transform:uppercase; font-size:8.5px;">
          <span>OFFICIAL ANNUAL DELIBERATION RECORD</span>
          <span>${report.deliberationDetails?.criteriaSummary || 'Promoted (≥65%), 2nd Sitting (50%-64.9%), Repeat (<50%)'}</span>
        </div>
        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px;">
          <div>
            <span style="font-weight:900; text-transform:uppercase; display:block; margin-bottom:3px; color:#334155;">DELIBERATION OPTIONS & CRITERIA:</span>
            <div style="display:flex; flex-direction:column; gap:2px; font-size:8.5px;">
              <span>[${report.deliberationDetails?.decisionCode === 'PROMOTED' ? '✓' : ' '}] <strong style="color:#166534;">Promoted</strong> (≥ ${report.deliberationDetails?.promotionCutoff ?? 65}%)</span>
              ${report.deliberationDetails?.secondSittingEnabled ? `
              <span>[${report.deliberationDetails?.decisionCode === '2ND_SITTING' ? '✓' : ' '}] <strong style="color:#b45309;">Take 2nd Sitting Test</strong> (${report.deliberationDetails?.secondSittingMinCutoff ?? 50}% - ${((report.deliberationDetails?.promotionCutoff ?? 65) - 0.1).toFixed(1)}%)</span>
              ` : ''}
              <span>[${report.deliberationDetails?.decisionCode === 'REPEAT' ? '✓' : ' '}] <strong style="color:#b91c1c;">Repeat / Retain</strong> (&lt; ${report.deliberationDetails?.secondSittingEnabled ? (report.deliberationDetails?.secondSittingMinCutoff ?? 50) : (report.deliberationDetails?.promotionCutoff ?? 65)}%)</span>
              <span>[${report.deliberationDetails?.decisionCode === 'PROMOTE_ANYWHERE' ? '✓' : ' '}] <strong style="color:#1d4ed8;">Promote Anywhere</strong> (Special Council Discretion)</span>
              <span>[${report.deliberationDetails?.decisionCode === 'REPEAT_ANYWHERE' ? '✓' : ' '}] <strong style="color:#991b1b;">Repeat Anywhere</strong> (Poor Conduct / Disciplinary)</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; padding:6px; text-align:center;">
            <span style="font-size:7.5px; font-weight:800; color:#64748b; text-transform:uppercase;">RATIFIED DECISION</span>
            <div style="font-size:10px; font-weight:900; margin-top:2px; color:${
              report.deliberationDetails?.decisionCode === 'PROMOTED' || report.deliberationDetails?.decisionCode === 'PROMOTE_ANYWHERE' ? '#166534' :
              report.deliberationDetails?.decisionCode === '2ND_SITTING' ? '#b45309' : '#b91c1c'
            };">
              ${report.deliberationDetails?.decisionLabel || report.annualSummary?.deliberationDecision || 'PENDING DELIBERATION'}
            </div>
          </div>
        </div>
      </div>
      ` : `
      <div style="border:1px dashed #cbd5e1; border-radius:4px; padding:6px; background:#f8fafc; font-size:8.5px; margin-bottom:6px;">
        <div style="font-weight:900; color:#475569; margin-bottom:3px; text-transform:uppercase;">DELIBERATION OPTIONS (UNRATIFIED EXPORT):</div>
        <div style="display:flex; justify-content:space-between; color:#64748b; font-size:8px;">
          <span>[ ] Promoted</span>
          <span>[ ] Take 2nd Sitting Test</span>
          <span>[ ] Repeat</span>
          <span>[ ] Promote Anywhere</span>
          <span>[ ] Repeat Anywhere</span>
        </div>
      </div>
      `}
    `;
  } else if (isSpecial) {
    // SPECIAL / TEST REPORT
    const subjectRows = report.subjectGrades.map((subG, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; text-align:center;">
        <td style="padding:4px 8px; font-weight:600; color:#0f172a; border:1px solid #94a3b8; text-align:left;">${subG.subject.name}</td>
        <td style="padding:4px 8px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${subG.totalMaxMarks}</td>
        <td style="padding:4px 8px; font-family:monospace; font-weight:800; color:#0f172a; border:1px solid #94a3b8;">${subG.totalMarks}</td>
        <td style="padding:4px 8px; font-family:monospace; font-weight:800; color:#1e3a8a; background:#eff6ff; border:1px solid #94a3b8;">${subG.percentage}%</td>
        <td style="padding:4px 8px; font-weight:900; border:1px solid #94a3b8;">${subG.gradeLetter}</td>
        <td style="padding:4px 8px; font-size:8.5px; text-align:left; border:1px solid #94a3b8;">${subG.remarks}</td>
      </tr>
    `).join('');

    tableContentHtml = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:10px; border:1px solid #64748b;">
        <thead>
          <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:9px; border-bottom:1px solid #64748b; text-align:center;">
            <th style="padding:5px 8px; text-align:left; border:1px solid #94a3b8;">Subject</th>
            <th style="padding:5px 8px; width:65px; border:1px solid #94a3b8;">MAX</th>
            <th style="padding:5px 8px; width:75px; border:1px solid #94a3b8;">MARKS</th>
            <th style="padding:5px 8px; width:70px; background:#dbeafe; border:1px solid #94a3b8;">%</th>
            <th style="padding:5px 8px; width:55px; border:1px solid #94a3b8;">GRADE</th>
            <th style="padding:5px 8px; text-align:left; border:1px solid #94a3b8;">REMARKS</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a; text-align:center;">
            <td style="padding:5px 8px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">Total:</td>
            <td style="padding:5px 8px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${report.totalMaxPossible}</td>
            <td style="padding:5px 8px; font-family:monospace; font-weight:900; color:#1e3a8a; border:1px solid #94a3b8;">${report.totalMarksObtained}</td>
            <td style="padding:5px 8px; font-family:monospace; font-weight:900; color:#1e3a8a; background:#dbeafe; border:1px solid #94a3b8;">${report.overallAveragePercentage}%</td>
            <td style="padding:5px 8px; font-weight:900; border:1px solid #94a3b8;">${calculateRwandanGradeLetter(report.overallAveragePercentage)}</td>
            <td style="padding:5px 8px; text-align:left; font-size:8.5px; border:1px solid #94a3b8;">Evaluation Completed</td>
          </tr>
          <tr style="background:#fef3c7; font-weight:900; text-align:center;">
            <td style="padding:4px 8px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">POSITION:</td>
            <td colspan="5" style="padding:4px 8px; text-align:center; font-family:monospace; font-weight:900; color:#92400e; font-size:12px; border:1px solid #94a3b8;">${report.classRank} / ${report.totalStudentsInClass}</td>
          </tr>
        </tfoot>
      </table>
    `;
  } else {
    // PROGRESSIVE / TERMLY FORMAT (M.T + EX)
    const subjectRows = report.subjectGrades.map((subG, idx) => {
      const testMark = subG.testMark ?? 0;
      const testMax = subG.testMax ?? subG.totalMaxMarks;
      const examMark = subG.examMark ?? 0;
      const examMax = subG.examMax ?? subG.totalMaxMarks;

      return `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; text-align:center;">
          <td style="padding:3.5px 6px; text-align:left; font-weight:600; color:#0f172a; border:1px solid #94a3b8;">${subG.subject.name}</td>
          <td style="padding:3.5px 4px; font-family:monospace; color:#0f172a; border:1px solid #94a3b8;">${testMark}</td>
          <td style="padding:3.5px 4px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${testMax}</td>
          <td style="padding:3.5px 4px; font-family:monospace; color:#0f172a; border:1px solid #94a3b8;">${examMark}</td>
          <td style="padding:3.5px 4px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${examMax}</td>
          <td style="padding:3.5px 4px; font-family:monospace; font-weight:900; color:#0f172a; background:#eff6ff; border:1px solid #94a3b8;">${subG.totalMarks}</td>
          <td style="padding:3.5px 4px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${subG.totalMaxMarks}</td>
          <td style="padding:3.5px 4px; font-weight:900; color:#1e3a8a; border:1px solid #94a3b8;">${subG.gradeLetter}</td>
        </tr>
      `;
    }).join('');

    tableContentHtml = `
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:9.5px; border:1px solid #64748b;">
        <thead>
          <tr style="background:#f1f5f9; font-weight:800; text-transform:uppercase; font-size:8.5px; border-bottom:1px solid #64748b;">
            <th rowspan="2" style="padding:4px 6px; text-align:left; border:1px solid #94a3b8; width:30%;">Subject</th>
            <th colspan="7" style="padding:3px 4px; text-align:center; background:#dbeafe; font-weight:900; border:1px solid #94a3b8;">${report.term}.</th>
          </tr>
          <tr style="background:#f8fafc; font-weight:700; font-size:8px; text-align:center; border-bottom:1px solid #64748b;">
            <th style="padding:3px 2px; width:45px; border:1px solid #94a3b8;">M.T</th>
            <th style="padding:3px 2px; width:40px; border:1px solid #94a3b8;">MAX</th>
            <th style="padding:3px 2px; width:45px; border:1px solid #94a3b8;">EX</th>
            <th style="padding:3px 2px; width:40px; border:1px solid #94a3b8;">MAX</th>
            <th style="padding:3px 2px; width:50px; background:#eff6ff; border:1px solid #94a3b8;">TOT</th>
            <th style="padding:3px 2px; width:40px; border:1px solid #94a3b8;">MAX</th>
            <th style="padding:3px 2px; width:45px; font-weight:900; border:1px solid #94a3b8;">GRADE</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#e2e8f0; font-weight:800; font-size:8.5px; text-transform:uppercase;">
            <td colspan="8" style="padding:3px 6px; border:1px solid #94a3b8;">Core subjects</td>
          </tr>
          ${subjectRows}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a; text-align:center;">
            <td style="padding:4px 6px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">Term Total:</td>
            <td colspan="4" style="text-align:right; padding-right:8px; font-size:8px; color:#64748b; font-weight:500; border:1px solid #94a3b8;">Academic Marks:</td>
            <td style="padding:4px 2px; font-family:monospace; font-weight:900; color:#1e3a8a; background:#dbeafe; border:1px solid #94a3b8;">${report.totalMarksObtained}</td>
            <td style="padding:4px 2px; font-family:monospace; color:#475569; border:1px solid #94a3b8;">${report.totalMaxPossible}</td>
            <td style="padding:4px 2px; font-weight:800; color:#166534; border:1px solid #94a3b8;">${calculateRwandanGradeLetter(report.overallAveragePercentage)}</td>
          </tr>
          <tr style="background:#f8fafc; font-weight:900; text-align:center;">
            <td style="padding:4px 6px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">PERCENTAGE:</td>
            <td colspan="7" style="padding:4px 6px; font-family:monospace; font-weight:900; color:#1e3a8a; font-size:12px; border:1px solid #94a3b8;">${report.overallAveragePercentage} %</td>
          </tr>
          <tr style="background:#fef3c7; font-weight:900; text-align:center;">
            <td style="padding:4px 6px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">POSITION:</td>
            <td colspan="7" style="padding:4px 6px; font-family:monospace; font-weight:900; color:#92400e; font-size:12px; border:1px solid #94a3b8;">${report.classRank} / ${report.totalStudentsInClass}</td>
          </tr>
          <tr style="background:#eff6ff; font-weight:900; text-align:center;">
            <td style="padding:4px 6px; text-align:left; text-transform:uppercase; border:1px solid #94a3b8;">CONDUCT SCORE (BEHAVIOUR):</td>
            <td colspan="7" style="padding:4px 6px; font-family:monospace; font-weight:900; color:#0f172a; font-size:12px; border:1px solid #94a3b8;">${report.conductScore ?? 40} / 40</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-ngmm542f3mlgvlkfh6nasi-870634004614.europe-west2.run.app';
  const downloadUrl = `${originUrl}/?verify_report=${report.student.id}&registration=${encodeURIComponent(report.student.registration_number)}&autodownload=true`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${report.student.registration_number} - ${report.student.first_name} ${report.student.last_name}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; }
    .report-card { width: 100%; max-width: 210mm; min-height: 297mm; background: #ffffff; padding: 12px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="report-card">
    
    <!-- HEADER -->
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:10px; text-align:center;">
      <div style="width:75px; text-align:center;">
        ${coatOfArmsHtml}
        <span style="font-size:7px; font-weight:800; text-transform:uppercase; color:#334155; display:block; margin-top:2px;">MINEDUC</span>
      </div>

      <div style="flex:1; padding:0 8px;">
        <div style="font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#1e293b;">REPUBLIC OF RWANDA</div>
        <div style="font-size:8px; font-weight:800; text-transform:uppercase; color:#475569;">MINISTRY OF EDUCATION</div>
        <div style="font-size:16px; font-weight:900; text-transform:uppercase; color:#0f172a; margin:2px 0;">${school.name}</div>
        <div style="font-size:8.5px; color:#475569;">Tel: ${school.phone || '+250 792 612 139'} · Email: ${school.contact_email || ''}</div>
        
        <div style="margin-top:4px; display:inline-block; padding:2px 14px; border:2px solid #0f172a; font-weight:900; font-size:10px; text-transform:uppercase; background:#f8fafc; color:#1e3a8a;">
          ${reportTitleText}
        </div>
      </div>

      <div style="width:75px; text-align:center;">
        ${schoolLogoHtml}
        <span style="font-size:7px; font-weight:800; text-transform:uppercase; color:#334155; display:block; margin-top:2px;">${school.code || 'REB'}</span>
      </div>
    </div>

    <!-- STUDENT METADATA -->
    <div style="border:1px solid #cbd5e1; border-radius:4px; padding:6px 10px; background:#f8fafc; margin-bottom:10px; display:grid; grid-template-columns:1fr 1fr; row-gap:3px; font-size:9.5px;">
      <div>
        <span style="font-weight:700; color:#475569;">STUDENT'S NAME: </span>
        <span style="font-weight:900; color:#0f172a; text-transform:uppercase;">${report.student.first_name} ${report.student.last_name}</span>
      </div>
      <div>
        <span style="font-weight:700; color:#475569;">REGISTRATION NUMBER: </span>
        <span style="font-family:monospace; font-weight:800; color:#1e3a8a;">${report.student.registration_number}</span>
      </div>
      <div>
        <span style="font-weight:700; color:#475569;">CLASS: </span>
        <span style="font-weight:900; color:#0f172a;">${report.student.class_name}</span>
      </div>
      <div>
        <span style="font-weight:700; color:#475569;">ACADEMIC YEAR: </span>
        <span style="font-weight:800; color:#0f172a;">${report.academicYear} · ${report.term}</span>
      </div>
    </div>

    <!-- MAIN ACADEMIC TABLE -->
    ${tableContentHtml}

    <!-- SIGNATURES & VERIFICATION -->
    <div style="margin-top:12px; padding-top:8px; border-top:2px solid #0f172a; display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; font-size:9px;">
      <div>
        <span style="font-weight:800; display:block; margin-bottom:2px;">Class Teacher's Remarks and Signature:</span>
        <p style="font-style:italic; color:#475569; font-size:8.5px;">"Hardworking student with consistent academic progress."</p>
        <div style="margin-top:18px; border-bottom:1px solid #64748b; width:120px;"></div>
        <div style="font-size:7.5px; color:#64748b; margin-top:2px;">Signature & Date</div>
      </div>

      <div>
        <span style="font-weight:800; display:block; margin-bottom:2px;">Parent's Signature:</span>
        <div style="margin-top:26px; border-bottom:1px solid #64748b; width:120px;"></div>
        <div style="font-size:7.5px; color:#64748b; margin-top:2px;">Guardian Signature</div>
      </div>

      <div style="text-align:right;">
        <span style="font-weight:800; display:block; margin-bottom:2px;">Headmaster Stamp and Signature:</span>
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-top:4px;">
          <div style="border:1px solid #94a3b8; border-radius:4px; padding:4px; text-align:center; font-size:5.5px; font-family:monospace; color:#0f172a; width:62px; background:#ffffff; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            <img src="${qrCodeDataUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(downloadUrl)}" style="width:48px; height:48px; display:block; margin:0 auto 2px auto; object-fit:contain;" alt="Verification QR Code" />
            <div style="font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:-0.2px;">VERIFIED</div>
          </div>
          <div>
            <div style="border-bottom:1px solid #64748b; width:110px; margin-left:auto;"></div>
            <div style="font-size:8px; font-weight:800; color:#334155; margin-top:2px;">
              ${school.headteacher_name || school.principal_name || 'School Principal / Headmaster'}
            </div>
            <div style="font-size:7.5px; color:#64748b;">Date: ${formattedDate}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="margin-top:12px; padding-top:6px; border-top:1px solid #e2e8f0; font-size:8px; color:#64748b; display:flex; justify-content:space-between;">
      <span>School Contacts: ${school.phone || ''} · ${school.contact_email || ''}</span>
      <span style="font-weight:700; color:#334155;">Report made using Elimu360 SIMS · System Verification: ${school.code || 'U6CRG'}</span>
    </div>

  </div>
</body>
</html>`;
};

/**
 * Generates official Rwandan MINEDUC Classroom Academic Performance Summary Report HTML
 * attached as the final document to every classroom report set.
 */
export const generateClassPerformanceReportHtml = (
  reports: StudentReportCard[],
  classRoom: ClassRoom | { name: string; level_name?: string },
  school: School,
  term: string,
  academicYear: string = '2025-2026'
): string => {
  if (reports.length === 0) return '';

  const totalStudents = reports.length;
  const classAverages = reports.map(r => r.overallAveragePercentage);
  const classMeanScore = Number((classAverages.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1));
  const highestAvg = Math.max(...classAverages);
  const lowestAvg = Math.min(...classAverages);
  
  const topStudent = reports.find(r => r.overallAveragePercentage === highestAvg);
  const passedStudents = reports.filter(r => r.overallAveragePercentage >= 50);
  const passRate = Number(((passedStudents.length / totalStudents) * 100).toFixed(1));

  const promotedCount = passedStudents.length;
  const secondSittingCount = reports.filter(r => r.overallAveragePercentage >= 40 && r.overallAveragePercentage < 50).length;
  const repeatCount = reports.filter(r => r.overallAveragePercentage < 40).length;

  const gradeCounts = {
    A: reports.filter(r => r.overallAveragePercentage >= 80).length,
    B: reports.filter(r => r.overallAveragePercentage >= 75 && r.overallAveragePercentage < 80).length,
    C: reports.filter(r => r.overallAveragePercentage >= 70 && r.overallAveragePercentage < 75).length,
    D: reports.filter(r => r.overallAveragePercentage >= 65 && r.overallAveragePercentage < 70).length,
    E: reports.filter(r => r.overallAveragePercentage >= 60 && r.overallAveragePercentage < 65).length,
    S: reports.filter(r => r.overallAveragePercentage >= 50 && r.overallAveragePercentage < 60).length,
    F: reports.filter(r => r.overallAveragePercentage < 50).length,
  };

  const subjectStatsMap: { [subjectId: string]: { name: string; maxMarks: number; scores: number[]; highest: number; lowest: number; passed: number } } = {};

  reports.forEach(r => {
    r.subjectGrades.forEach(sg => {
      const sId = sg.subject.id;
      if (!subjectStatsMap[sId]) {
        subjectStatsMap[sId] = {
          name: sg.subject.name,
          maxMarks: sg.totalMaxMarks,
          scores: [],
          highest: 0,
          lowest: 999,
          passed: 0
        };
      }
      subjectStatsMap[sId].scores.push(sg.percentage);
      if (sg.percentage > subjectStatsMap[sId].highest) subjectStatsMap[sId].highest = sg.percentage;
      if (sg.percentage < subjectStatsMap[sId].lowest) subjectStatsMap[sId].lowest = sg.percentage;
      if (sg.percentage >= 50) subjectStatsMap[sId].passed++;
    });
  });

  const subjectRowsHtml = Object.values(subjectStatsMap).map((sStat, idx) => {
    const avgPct = Number((sStat.scores.reduce((a, b) => a + b, 0) / (sStat.scores.length || 1)).toFixed(1));
    const sPassRate = Number(((sStat.passed / (sStat.scores.length || 1)) * 100).toFixed(1));
    return `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; text-align:center;">
        <td style="padding:4px 8px; font-weight:700; text-align:left; color:#0f172a; border:1px solid #94a3b8;">${sStat.name}</td>
        <td style="padding:4px 6px; font-family:monospace; border:1px solid #94a3b8;">${sStat.maxMarks}</td>
        <td style="padding:4px 6px; font-family:monospace; font-weight:800; color:#1e3a8a; background:#eff6ff; border:1px solid #94a3b8;">${avgPct}%</td>
        <td style="padding:4px 6px; font-family:monospace; color:#166534; font-weight:700; border:1px solid #94a3b8;">${sStat.highest}%</td>
        <td style="padding:4px 6px; font-family:monospace; color:#991b1b; border:1px solid #94a3b8;">${sStat.lowest === 999 ? 0 : sStat.lowest}%</td>
        <td style="padding:4px 6px; font-family:monospace; font-weight:800; border:1px solid #94a3b8; color:${sPassRate >= 50 ? '#166534' : '#991b1b'};">${sPassRate}%</td>
      </tr>
    `;
  }).join('');

  const topStudentsRows = [...reports]
    .sort((a, b) => Number(a.classRank) - Number(b.classRank))
    .slice(0, 5)
    .map(r => `
      <tr style="text-align:center;">
        <td style="padding:4px 6px; font-weight:900; color:#92400e; border:1px solid #94a3b8;">#${r.classRank}</td>
        <td style="padding:4px 6px; font-family:monospace; border:1px solid #94a3b8;">${r.student.registration_number}</td>
        <td style="padding:4px 8px; font-weight:700; text-align:left; color:#0f172a; border:1px solid #94a3b8;">${r.student.first_name} ${r.student.last_name}</td>
        <td style="padding:4px 6px; font-family:monospace; font-weight:900; color:#1e3a8a; background:#eff6ff; border:1px solid #94a3b8;">${r.overallAveragePercentage}%</td>
        <td style="padding:4px 6px; font-weight:900; border:1px solid #94a3b8;">${calculateRwandanGradeLetter(r.overallAveragePercentage)}</td>
        <td style="padding:4px 6px; font-weight:800; color:${r.overallAveragePercentage >= 50 ? '#166534' : '#991b1b'}; border:1px solid #94a3b8;">${r.overallAveragePercentage >= 50 ? 'PASSED' : 'FAILED'}</td>
      </tr>
    `).join('');

  const coatOfArmsUrl = school.national_coat_of_arms_url || (school as any).coat_of_arms_url || (school as any).coatOfArmsUrl;
  const coatOfArmsHtml = coatOfArmsUrl
    ? `<img src="${coatOfArmsUrl}" alt="Republic of Rwanda Coat of Arms" style="max-width:65px; max-height:65px; width:auto; height:auto; object-fit:contain; display:block; margin:0 auto;" />`
    : RWANDA_COAT_OF_ARMS_SVG;

  const logoUrl = school.logo_url || (school as any).logoUrl;
  const schoolLogoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${school.name}" style="max-width:65px; max-height:65px; width:auto; height:auto; object-fit:contain; border-radius:4px; display:block; margin:0 auto;" />`
    : getSchoolCrestSvg(school.code || 'REB');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Classroom Performance Report - ${classRoom.name}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; }
  </style>
</head>
<body>
    <div style="width:100%; box-sizing:border-box; padding:15px; background:#ffffff; font-size:10px; color:#0f172a; line-height:1.3;">
      
      <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:12px; text-align:center;">
        <div style="width:80px; text-align:center;">
          ${coatOfArmsHtml}
          <div style="font-size:7px; font-weight:800; text-transform:uppercase; margin-top:2px;">REPUBLIC OF RWANDA</div>
        </div>
        <div style="flex:1; padding:0 10px;">
          <h1 style="font-size:14px; font-weight:900; text-transform:uppercase; margin:0; color:#0f172a; letter-spacing:0.5px;">${school.name.toUpperCase()}</h1>
          <div style="font-size:9px; font-weight:700; color:#475569; margin-top:2px;">P.O. BOX ${school.code || 'REB'} | MINEDUC CURRICULUM ACCREDITED</div>
          <div style="display:inline-block; margin-top:5px; padding:3px 12px; background:#1e3a8a; color:#ffffff; font-size:11px; font-weight:900; border-radius:3px; text-transform:uppercase; letter-spacing:0.5px;">
            CLASSROOM ACADEMIC PERFORMANCE REPORT
          </div>
        </div>
        <div style="width:80px; text-align:center;">
          ${schoolLogoHtml}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:8px; margin-bottom:12px; font-size:9.5px;">
        <div><strong>CLASS:</strong> <span style="color:#1e3a8a; font-weight:800;">${classRoom.name}</span></div>
        <div><strong>ACADEMIC YEAR:</strong> <span>${academicYear}</span></div>
        <div><strong>TERM:</strong> <span>${term}</span></div>
        <div><strong>EVALUATED STUDENTS:</strong> <span style="font-family:monospace; font-weight:800;">${totalStudents}</span></div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:12px; text-align:center;">
        <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:4px; padding:6px;">
          <div style="font-size:8px; font-weight:800; text-transform:uppercase; color:#1e40af;">Class Mean Score</div>
          <div style="font-size:16px; font-weight:900; color:#1e3a8a; font-family:monospace; margin-top:2px;">${classMeanScore}%</div>
        </div>
        <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:4px; padding:6px;">
          <div style="font-size:8px; font-weight:800; text-transform:uppercase; color:#166534;">Highest Student Avg</div>
          <div style="font-size:16px; font-weight:900; color:#15803d; font-family:monospace; margin-top:2px;">${highestAvg}%</div>
          <div style="font-size:7.5px; color:#166534; margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${topStudent ? `${topStudent.student.first_name} ${topStudent.student.last_name}` : ''}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:4px; padding:6px;">
          <div style="font-size:8px; font-weight:800; text-transform:uppercase; color:#991b1b;">Lowest Student Avg</div>
          <div style="font-size:16px; font-weight:900; color:#b91c1c; font-family:monospace; margin-top:2px;">${lowestAvg}%</div>
        </div>
        <div style="background:#fefce8; border:1px solid #fde047; border-radius:4px; padding:6px;">
          <div style="font-size:8px; font-weight:800; text-transform:uppercase; color:#854d0e;">Class Pass Rate</div>
          <div style="font-size:16px; font-weight:900; color:#a16207; font-family:monospace; margin-top:2px;">${passRate}%</div>
          <div style="font-size:7.5px; color:#854d0e; margin-top:1px;">${passedStudents.length} / ${totalStudents} Passed</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
        <div style="border:1px solid #cbd5e1; border-radius:4px; padding:8px; background:#f8fafc;">
          <div style="font-weight:900; text-transform:uppercase; font-size:9px; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px; color:#0f172a;">Deliberation & Decision Summary</div>
          <div style="display:flex; justify-content:space-between; font-size:9px; padding:2px 0;">
            <span>Promoted / Passed (&ge; 50%):</span>
            <strong style="color:#166534; font-family:monospace;">${promotedCount} (${Number(((promotedCount/totalStudents)*100).toFixed(1))}%)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:9px; padding:2px 0;">
            <span>2nd Sitting / Remedial (40% - 49.9%):</span>
            <strong style="color:#a16207; font-family:monospace;">${secondSittingCount} (${Number(((secondSittingCount/totalStudents)*100).toFixed(1))}%)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:9px; padding:2px 0;">
            <span>Discontinued / Repeat (&lt; 40%):</span>
            <strong style="color:#b91c1c; font-family:monospace;">${repeatCount} (${Number(((repeatCount/totalStudents)*100).toFixed(1))}%)</strong>
          </div>
        </div>

        <div style="border:1px solid #cbd5e1; border-radius:4px; padding:8px; background:#f8fafc;">
          <div style="font-weight:900; text-transform:uppercase; font-size:9px; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:6px; color:#0f172a;">Grade Distribution (REB Scale)</div>
          <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center; font-size:8.5px;">
            <div style="background:#dcfce7; padding:3px; border-radius:2px;"><strong>A</strong><br/>${gradeCounts.A}</div>
            <div style="background:#e0e7ff; padding:3px; border-radius:2px;"><strong>B</strong><br/>${gradeCounts.B}</div>
            <div style="background:#fef9c3; padding:3px; border-radius:2px;"><strong>C</strong><br/>${gradeCounts.C}</div>
            <div style="background:#ffedd5; padding:3px; border-radius:2px;"><strong>D</strong><br/>${gradeCounts.D}</div>
            <div style="background:#fae8ff; padding:3px; border-radius:2px;"><strong>E</strong><br/>${gradeCounts.E}</div>
            <div style="background:#f3e8ff; padding:3px; border-radius:2px;"><strong>S</strong><br/>${gradeCounts.S}</div>
            <div style="background:#fee2e2; padding:3px; border-radius:2px;"><strong>F</strong><br/>${gradeCounts.F}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-weight:900; text-transform:uppercase; font-size:9px; margin-bottom:4px; color:#0f172a;">Subject-Wise Performance Breakdown</div>
        <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #64748b;">
          <thead>
            <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:8px; border-bottom:1px solid #64748b;">
              <th style="padding:4px 6px; text-align:left; border:1px solid #94a3b8;">Subject</th>
              <th style="padding:4px 6px; width:50px; border:1px solid #94a3b8;">MAX</th>
              <th style="padding:4px 6px; width:70px; background:#dbeafe; border:1px solid #94a3b8;">Class Mean %</th>
              <th style="padding:4px 6px; width:65px; border:1px solid #94a3b8;">Highest</th>
              <th style="padding:4px 6px; width:65px; border:1px solid #94a3b8;">Lowest</th>
              <th style="padding:4px 6px; width:65px; border:1px solid #94a3b8;">Pass Rate</th>
            </tr>
          </thead>
          <tbody>
            ${subjectRowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom:12px;">
        <div style="font-weight:900; text-transform:uppercase; font-size:9px; margin-bottom:4px; color:#0f172a;">Top 5 Outstanding Performers</div>
        <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #64748b;">
          <thead>
            <tr style="background:#f1f5f9; font-weight:900; text-transform:uppercase; font-size:8px; border-bottom:1px solid #64748b;">
              <th style="padding:4px 6px; width:45px; border:1px solid #94a3b8;">Rank</th>
              <th style="padding:4px 6px; width:80px; border:1px solid #94a3b8;">Reg No</th>
              <th style="padding:4px 8px; text-align:left; border:1px solid #94a3b8;">Student Name</th>
              <th style="padding:4px 6px; width:65px; background:#dbeafe; border:1px solid #94a3b8;">Avg %</th>
              <th style="padding:4px 6px; width:50px; border:1px solid #94a3b8;">Grade</th>
              <th style="padding:4px 6px; width:60px; border:1px solid #94a3b8;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${topStudentsRows}
          </tbody>
        </table>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; padding-top:10px; border-top:1px solid #cbd5e1; font-size:8.5px;">
        <div>
          <div><strong>Class Teacher:</strong> ______________________</div>
          <div style="margin-top:4px;">Signature & Date: ___________________</div>
        </div>
        <div style="text-align:right;">
          <div><strong>Director of Studies (DOS):</strong> ______________________</div>
          <div style="margin-top:4px;">Stamp & Approval: ___________________</div>
        </div>
      </div>

    </div>
</body>
</html>
  `;
};

/**
 * Automatically compiles all class reports into a single consolidated A4 PDF
 * ordered strictly from 1st position (Rank 1) to the last position.
 * Attaches official Classroom Performance Report as final summary page.
 */
export const downloadClassReportsPdf = async (params: {
  classRoom: ClassRoom;
  term: string;
  reports: StudentReportCard[];
  school: School;
  reportMode?: 'TERMINAL' | 'ANNUAL';
  onProgress?: (current: number, total: number) => void;
}): Promise<void> => {
  const sortedReports = [...params.reports].sort((a, b) => {
    const rankA = typeof a.classRank === 'number' ? a.classRank : parseInt(String(a.classRank), 10) || 999;
    const rankB = typeof b.classRank === 'number' ? b.classRank : parseInt(String(b.classRank), 10) || 999;
    return rankA - rankB;
  });

  if (sortedReports.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < sortedReports.length; i++) {
      const rep = sortedReports[i];
      params.onProgress?.(i + 1, sortedReports.length + 1);

      const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-ngmm542f3mlgvlkfh6nasi-870634004614.europe-west2.run.app';
      const downloadUrl = `${originUrl}/?verify_report=${rep.student.id}&registration=${encodeURIComponent(rep.student.registration_number)}&autodownload=true`;
      let localQrUrl = '';
      try {
        localQrUrl = await QRCode.toDataURL(downloadUrl, { width: 140, margin: 1 });
      } catch (err) {
        console.error('Failed class local QR code generation:', err);
      }

      container.innerHTML = generateRwandanReportHtml(rep, params.school, localQrUrl);
      await new Promise(resolve => setTimeout(resolve, 60));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    // ATTACH CLASSROOM ACADEMIC PERFORMANCE REPORT
    params.onProgress?.(sortedReports.length + 1, sortedReports.length + 1);
    container.innerHTML = generateClassPerformanceReportHtml(
      sortedReports,
      params.classRoom,
      params.school,
      params.term,
      sortedReports[0]?.academicYear || '2025-2026'
    );
    await new Promise(resolve => setTimeout(resolve, 60));

    const perfCanvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const perfImgData = perfCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addPage('a4', 'portrait');
    pdf.addImage(perfImgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    const safeClassName = (params.classRoom.name || 'Class').replace(/\s+/g, '_');
    const safeTerm = (params.term || 'Term').replace(/\s+/g, '_');
    const fileName = `${params.school.code || 'REB'}_${safeClassName}_${safeTerm}_Official_Reports_Rank_1_to_${sortedReports.length}.pdf`;

    pdf.save(fileName);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Downloads a single student's official PDF named with unique Registration Code
 */
export const downloadSingleStudentPdf = async (params: {
  report: StudentReportCard;
  school: School;
}): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.background = '#ffffff';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  try {
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-ngmm542f3mlgvlkfh6nasi-870634004614.europe-west2.run.app';
    const downloadUrl = `${originUrl}/?verify_report=${params.report.student.id}&registration=${encodeURIComponent(params.report.student.registration_number)}&autodownload=true`;
    let localQrUrl = '';
    try {
      localQrUrl = await QRCode.toDataURL(downloadUrl, { width: 140, margin: 1 });
    } catch (err) {
      console.error('Failed single student local QR code generation:', err);
    }

    container.innerHTML = generateRwandanReportHtml(params.report, params.school, localQrUrl);
    await new Promise(resolve => setTimeout(resolve, 60));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    const safeName = `${params.report.student.first_name}_${params.report.student.last_name}`.replace(/[^a-zA-Z0-9_]/g, '');
    const safeReg = (params.report.student.registration_number || 'REG').replace(/[^a-zA-Z0-9_]/g, '_');
    const rankPrefix = String(params.report.classRank || 1).padStart(2, '0');
    const fileName = `${rankPrefix}_${safeName}_${safeReg}_Official_ReportCard.pdf`;

    pdf.save(fileName);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Packages class reports into a ZIP archive with individual HTML reports and CSV summary roster
 */
export const downloadClassReportsZip = async (params: {
  classRoom: ClassRoom;
  term: string;
  reports: StudentReportCard[];
  school: School;
  reportMode: 'TERMINAL' | 'ANNUAL';
}): Promise<void> => {
  const zip = new JSZip();
  const folderName = `${params.classRoom.name.replace(/\s+/g, '_')}_${params.term.replace(/\s+/g, '_')}_Reports`;
  const folder = zip.folder(folderName);

  params.reports.forEach((rep, idx) => {
    const rankPrefix = String(idx + 1).padStart(2, '0');
    const safeName = `${rep.student.first_name}_${rep.student.last_name}`.replace(/[^a-zA-Z0-9_]/g, '');
    const safeReg = (rep.student.registration_number || 'REG').replace(/[^a-zA-Z0-9_]/g, '_');
    const filename = `${rankPrefix}_${safeName}_${safeReg}_ReportCard.html`;
    const htmlContent = generateRwandanReportHtml(rep, params.school);
    folder?.file(filename, htmlContent);
  });

  const csvHeaders = params.reportMode === 'ANNUAL'
    ? 'Rank,Reg Number,Student Name,Gender,Term 1 %,Term 2 %,Term 3 %,Annual Average %,Annual Grade,Deliberation Decision\n'
    : 'Rank,Reg Number,Student Name,Gender,Total Marks,Max Possible,Percentage,Grade,Attendance %,Conduct (/40)\n';

  const csvRows = params.reports.map(rep => {
    if (params.reportMode === 'ANNUAL') {
      return `"${rep.classRank}","${rep.student.registration_number}","${rep.student.first_name} ${rep.student.last_name}","${rep.student.gender}","${rep.annualSummary?.term1Percentage ?? '-'}","${rep.annualSummary?.term2Percentage ?? '-'}","${rep.annualSummary?.term3Percentage ?? '-'}","${rep.annualSummary?.annualAveragePercentage ?? rep.overallAveragePercentage}%","${rep.annualSummary ? calculateRwandanGradeLetter(rep.annualSummary.annualAveragePercentage) : 'A'}","${rep.annualSummary?.deliberationDecision || 'PROMOTED'}"`;
    }
    return `"${rep.classRank}","${rep.student.registration_number}","${rep.student.first_name} ${rep.student.last_name}","${rep.student.gender}","${rep.totalMarksObtained}","${rep.totalMaxPossible}","${rep.overallAveragePercentage}%","${calculateRwandanGradeLetter(rep.overallAveragePercentage)}","${rep.attendancePercentage}%","${rep.conductScore ?? 40}"`;
  }).join('\n');

  folder?.file('00_Class_Summary_Roster.csv', csvHeaders + csvRows);

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
};
