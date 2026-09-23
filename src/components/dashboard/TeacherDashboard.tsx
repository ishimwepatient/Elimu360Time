import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  Award, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Search, 
  Save, 
  Check, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  UserCheck, 
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  ArrowLeft,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  Building2,
  Layers,
  MapPin,
  ExternalLink,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { 
  AttendanceRecord, 
  AttendanceStatus, 
  AssessmentType, 
  GradeEntry, 
  Student, 
  ClassRoom, 
  Subject, 
  TimetableSlot 
} from '../../types';
import { offlineSyncEngine } from '../../utils/offlineSyncEngine';

type TeacherActiveView = 'OVERVIEW' | 'STUDENTS' | 'ATTENDANCE' | 'RESULTS' | 'SCHEDULE';

const ASSESSMENT_TYPES: AssessmentType[] = [
  'End of Unit Test',
  'Mid term test',
  'Quiz',
  'Test',
  '2nd Sitting',
  'Final Exam'
];

const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; short: string; bg: string; text: string; border: string }> = {
  NOT_RECORDED: { label: 'Not Recorded', short: 'UNSET', bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700' },
  PRESENT: { label: 'Present', short: 'P', bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-700/70' },
  ABSENT: { label: 'Absent', short: 'A', bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-700/70' },
  EXCUSED_ABSENT: { label: 'Excused Absent', short: 'EA', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-700/70' },
  EXCUSED: { label: 'Excused', short: 'E', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-700/70' },
  LATE: { label: 'Late', short: 'L', bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-700/70' },
  SICK: { label: 'Sick', short: 'S', bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-700/70' }
};

export const TeacherDashboard: React.FC = () => {
  const {
    activeSchool,
    currentUser,
    classes,
    subjects,
    students,
    teacherAssignments,
    attendance,
    grades,
    timetable,
    markAttendanceSession,
    submitBatchGrades,
    deleteGrade,
    deleteGradeBatch,
    triggerConfetti
  } = useElimu();

  // Navigation within Teacher Mobile Web App
  const [activeView, setActiveView] = useState<TeacherActiveView>('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Offline Engine State
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    pendingCount: number;
    lastSyncedAt?: string;
  }>(() => offlineSyncEngine.getStatus());
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncEngine.subscribe(status => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const handleForceSync = async () => {
    setIsSyncingNow(true);
    await offlineSyncEngine.forceSyncNow();
    setTimeout(() => setIsSyncingNow(false), 800);
  };

  // -------------------------------------------------------------
  // APPOINTED CLASSES & SUBJECTS RESOLVER (STRICT ISOLATION)
  // -------------------------------------------------------------
  const teacherEmail = (currentUser.email || '').trim().toLowerCase();
  const teacherName = (currentUser.name || '').trim().toLowerCase();
  const teacherId = currentUser.id;

  // Find all classes appointed to this teacher
  const appointedClasses = useMemo(() => {
    const schoolClasses = classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all');
    const classIdSet = new Set<string>();

    // 1. Direct class teacher assignment
    schoolClasses.forEach(c => {
      if (
        c.class_teacher_id === teacherId ||
        (c.class_teacher_name && c.class_teacher_name.trim().toLowerCase() === teacherName)
      ) {
        classIdSet.add(c.id);
      }
    });

    // 2. Subject assignments in teacherAssignments
    teacherAssignments.forEach(ta => {
      if (
        ta.teacher_id === teacherId ||
        (ta.teacher_name && ta.teacher_name.trim().toLowerCase() === teacherName) ||
        (teacherEmail && ta.teacher_id === teacherEmail)
      ) {
        classIdSet.add(ta.class_id);
      }
    });

    // 3. Fallback: if user has assigned_class_id
    if (currentUser.assigned_class_id) {
      classIdSet.add(currentUser.assigned_class_id);
    }

    const matched = schoolClasses.filter(c => classIdSet.has(c.id));
    // If no explicit appointments yet, show the school classes so the teacher is never blocked
    return matched.length > 0 ? matched : schoolClasses.slice(0, 3);
  }, [classes, activeSchool.id, teacherId, teacherName, teacherEmail, teacherAssignments, currentUser.assigned_class_id]);

  // Check if teacher is class teacher for a given class
  const isClassTeacherFor = (classId: string) => {
    const target = classes.find(c => c.id === classId);
    if (!target) return false;
    return target.class_teacher_id === teacherId || 
      (target.class_teacher_name && target.class_teacher_name.trim().toLowerCase() === teacherName);
  };

  // Appointed subjects in a given class
  const getAppointedSubjectsForClass = (classId: string) => {
    const schoolSubjects = subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
    
    // Find subject IDs assigned to this teacher in this class
    const assignedSubIds = new Set<string>();
    teacherAssignments.forEach(ta => {
      if (
        ta.class_id === classId &&
        (ta.teacher_id === teacherId ||
         (ta.teacher_name && ta.teacher_name.trim().toLowerCase() === teacherName) ||
         (teacherEmail && ta.teacher_id === teacherEmail))
      ) {
        assignedSubIds.add(ta.subject_id);
      }
    });

    const matched = schoolSubjects.filter(s => assignedSubIds.has(s.id));
    if (matched.length > 0) return matched;

    // Fallback: if teacher has subject_names array, match by name
    if (currentUser.subject_names && currentUser.subject_names.length > 0) {
      const byName = schoolSubjects.filter(s => currentUser.subject_names?.some(sn => s.name.toLowerCase().includes(sn.toLowerCase())));
      if (byName.length > 0) return byName;
    }

    return schoolSubjects;
  };

  // -------------------------------------------------------------
  // STUDENTS VIEW STATE
  // -------------------------------------------------------------
  const [selectedStudentClassId, setSelectedStudentClassId] = useState<string>(appointedClasses[0]?.id || '');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [activeStudentProfile, setActiveStudentProfile] = useState<Student | null>(null);

  const displayedStudents = useMemo(() => {
    const classId = selectedStudentClassId || appointedClasses[0]?.id;
    return students.filter(s => {
      if (s.school_id !== activeSchool.id && s.school_id !== 'all') return false;
      if (s.status !== 'ACTIVE') return false;
      if (classId && s.class_id !== classId) return false;
      if (studentSearchQuery.trim()) {
        const q = studentSearchQuery.toLowerCase();
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const reg = (s.registration_number || '').toLowerCase();
        const phone = (s.guardian_phone || '').toLowerCase();
        return fullName.includes(q) || reg.includes(q) || phone.includes(q);
      }
      return true;
    });
  }, [students, activeSchool.id, selectedStudentClassId, appointedClasses, studentSearchQuery]);

  // -------------------------------------------------------------
  // ATTENDANCE VIEW STATE
  // -------------------------------------------------------------
  const [attDate, setAttDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [attClassId, setAttClassId] = useState<string>(appointedClasses[0]?.id || '');
  const [attSubjectId, setAttSubjectId] = useState<string>('');
  const [attPeriodNumber, setAttPeriodNumber] = useState<number>(1);
  const [attSearchQuery, setAttSearchQuery] = useState('');
  const [attStatuses, setAttStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [attRemarks, setAttRemarks] = useState<Record<string, string>>({});
  const [attSuccessMsg, setAttSuccessMsg] = useState<string | null>(null);

  // Sync attendance subject options when class changes
  const attAvailableSubjects = useMemo(() => {
    return getAppointedSubjectsForClass(attClassId);
  }, [attClassId, subjects, teacherAssignments]);

  useEffect(() => {
    if (attAvailableSubjects.length > 0 && (!attSubjectId || !attAvailableSubjects.some(s => s.id === attSubjectId))) {
      setAttSubjectId(attAvailableSubjects[0].id);
    }
  }, [attAvailableSubjects, attSubjectId]);

  const isClassTeacherOfAttClass = isClassTeacherFor(attClassId);

  // Load existing attendance for date & class
  const attClassStudents = useMemo(() => {
    return students.filter(s => 
      (s.school_id === activeSchool.id || s.school_id === 'all') && 
      s.class_id === attClassId && 
      s.status === 'ACTIVE'
    );
  }, [students, activeSchool.id, attClassId]);

  useEffect(() => {
    // Check if attendance records already exist in state
    const newStatusMap: Record<string, AttendanceStatus> = {};
    const newRemarksMap: Record<string, string> = {};

    attClassStudents.forEach(st => {
      const match = attendance.find(a => 
        a.student_id === st.id && 
        a.date === attDate && 
        (isClassTeacherOfAttClass && !attSubjectId ? a.attendance_type === 'CLASS_DAILY' : a.subject_id === attSubjectId)
      );
      if (match) {
        newStatusMap[st.id] = match.status;
        if (match.remarks) newRemarksMap[st.id] = match.remarks;
      } else {
        newStatusMap[st.id] = 'NOT_RECORDED';
      }
    });

    setAttStatuses(newStatusMap);
    setAttRemarks(newRemarksMap);
  }, [attDate, attClassId, attSubjectId, isClassTeacherOfAttClass, attClassStudents, attendance]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    attClassStudents.forEach(st => {
      updated[st.id] = 'PRESENT';
    });
    setAttStatuses(updated);
  };

  const handleSaveAttendance = () => {
    const records = attClassStudents.map(st => ({
      student_id: st.id,
      status: attStatuses[st.id] || 'NOT_RECORDED',
      remarks: attRemarks[st.id] || ''
    }));

    const result = markAttendanceSession(records, attClassId, {
      subjectId: isClassTeacherOfAttClass && !attSubjectId ? undefined : attSubjectId,
      attendanceType: isClassTeacherOfAttClass && !attSubjectId ? 'CLASS_DAILY' : 'SUBJECT_SESSION',
      periodNumber: attPeriodNumber,
      date: attDate
    });

    setAttSuccessMsg(`Attendance for ${attClassStudents.length} students recorded & cached (${attDate})`);
    triggerConfetti();
    setTimeout(() => setAttSuccessMsg(null), 3500);
  };

  // -------------------------------------------------------------
  // RESULTS VIEW STATE
  // -------------------------------------------------------------
  const [resClassId, setResClassId] = useState<string>(appointedClasses[0]?.id || '');
  const [resSubjectId, setResSubjectId] = useState<string>('');
  const [resAssessmentType, setResAssessmentType] = useState<AssessmentType>('End of Unit Test');
  const [resPeriodNumber, setResPeriodNumber] = useState<number>(1);
  const [resMaxMarks, setResMaxMarks] = useState<number>(30);
  const [resMarks, setResMarks] = useState<Record<string, number>>({});
  const [resRemarks, setResRemarks] = useState<Record<string, string>>({});
  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resSuccessMsg, setResSuccessMsg] = useState<string | null>(null);
  const [resSubTab, setResSubTab] = useState<'REGISTER' | 'HISTORY'>('REGISTER');

  const resAvailableSubjects = useMemo(() => {
    return getAppointedSubjectsForClass(resClassId);
  }, [resClassId, subjects, teacherAssignments]);

  useEffect(() => {
    if (resAvailableSubjects.length > 0 && (!resSubjectId || !resAvailableSubjects.some(s => s.id === resSubjectId))) {
      const firstSub = resAvailableSubjects[0];
      setResSubjectId(firstSub.id);
      const periods = Math.max(1, firstSub.periods_per_week || firstSub.credits || 4);
      setResMaxMarks(periods * 10);
    }
  }, [resAvailableSubjects, resSubjectId]);

  useEffect(() => {
    const activeSub = subjects.find(s => s.id === resSubjectId);
    if (activeSub) {
      const periods = Math.max(1, activeSub.periods_per_week || activeSub.credits || 4);
      setResMaxMarks(periods * 10);
    }
  }, [resSubjectId, subjects]);

  const resClassStudents = useMemo(() => {
    return students.filter(s => 
      (s.school_id === activeSchool.id || s.school_id === 'all') && 
      s.class_id === resClassId && 
      s.status === 'ACTIVE'
    );
  }, [students, activeSchool.id, resClassId]);

  // Load existing grade marks if previously recorded
  useEffect(() => {
    const initialMarks: Record<string, number> = {};
    const initialRemarks: Record<string, string> = {};

    resClassStudents.forEach(st => {
      const match = grades.find(g => 
        g.student_id === st.id && 
        g.class_id === resClassId && 
        g.subject_id === resSubjectId && 
        g.assessment_type === resAssessmentType && 
        (g.period_number === undefined || g.period_number === resPeriodNumber) &&
        g.term === (activeSchool.active_term || 'Term 1') &&
        (g.academic_year === (activeSchool.active_academic_year || '2026'))
      );
      if (match) {
        initialMarks[st.id] = match.marks;
        if (match.remarks) initialRemarks[st.id] = match.remarks;
      }
    });

    setResMarks(initialMarks);
    setResRemarks(initialRemarks);
  }, [resClassId, resSubjectId, resAssessmentType, resPeriodNumber, resClassStudents, grades, activeSchool.active_term, activeSchool.active_academic_year]);

  const handleSaveResults = (isDraft: boolean = false) => {
    // Strict validation: Prevent any mark exceeding resMaxMarks
    for (const st of resClassStudents) {
      const val = resMarks[st.id];
      if (val !== undefined && val !== null) {
        if (Number(val) > resMaxMarks) {
          alert(`Validation Error: Mark (${val}) for student "${st.first_name} ${st.last_name}" exceeds the maximum assessment mark of ${resMaxMarks}. Please correct the value.`);
          return;
        }
        if (Number(val) < 0) {
          alert(`Validation Error: Mark for student "${st.first_name} ${st.last_name}" cannot be negative.`);
          return;
        }
      }
    }

    const entries = resClassStudents.map(st => ({
      student_id: st.id,
      student_name: `${st.first_name} ${st.last_name}`,
      marks: resMarks[st.id] !== undefined ? Number(resMarks[st.id]) : 0,
      remarks: resRemarks[st.id] || ''
    }));

    const result = submitBatchGrades({
      class_id: resClassId,
      subject_id: resSubjectId,
      assessment_type: resAssessmentType,
      period_number: resPeriodNumber,
      max_marks: resMaxMarks,
      term: activeSchool.active_term || 'Term 1',
      academic_year: activeSchool.active_academic_year || '2026',
      entries,
      is_draft: isDraft
    });

    if (result.success) {
      setResSuccessMsg(result.message);
      setTimeout(() => setResSuccessMsg(null), 4000);
    } else {
      alert(result.message);
    }
  };

  // Group historical grade submissions for teacher's classes
  const groupedSubmissions = useMemo(() => {
    const teacherGrades = grades.filter(g => 
      (g.teacher_id === teacherId || g.teacher_name?.toLowerCase().includes(teacherName)) &&
      (!g.school_id || g.school_id === activeSchool.id || g.school_id === 'all') &&
      g.academic_year === (activeSchool.active_academic_year || '2026')
    );

    const map = new Map<string, {
      key: string;
      class_id: string;
      class_name: string;
      subject_id: string;
      subject_name: string;
      assessment_type: string;
      period_number?: number;
      term: string;
      academic_year: string;
      max_marks: number;
      student_count: number;
      average_score: number;
      entered_at: string;
      is_draft?: boolean;
    }>();

    teacherGrades.forEach(g => {
      const key = `${g.class_id}_${g.subject_id}_${g.assessment_type}_${g.period_number || 0}_${g.term}_${g.academic_year}`;
      const cls = classes.find(c => c.id === g.class_id);
      const sub = subjects.find(s => s.id === g.subject_id);

      if (!map.has(key)) {
        map.set(key, {
          key,
          class_id: g.class_id,
          class_name: cls ? cls.name : 'Class',
          subject_id: g.subject_id,
          subject_name: sub ? sub.name : g.subject_name || 'Subject',
          assessment_type: g.assessment_type,
          period_number: g.period_number,
          term: g.term,
          academic_year: g.academic_year,
          max_marks: g.max_marks || 100,
          student_count: 0,
          average_score: 0,
          entered_at: g.entered_at,
          is_draft: g.is_draft
        });
      }

      const item = map.get(key)!;
      item.student_count += 1;
      item.average_score += g.marks;
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      average_score: item.student_count > 0 ? Number((item.average_score / item.student_count).toFixed(1)) : 0
    }));
  }, [grades, teacherId, teacherName, activeSchool.id, classes, subjects]);

  // -------------------------------------------------------------
  // SCHEDULE VIEW STATE
  // -------------------------------------------------------------
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const teacherScheduleSlots = useMemo(() => {
    const appointedClassSubjectKeys = new Set<string>();
    const classTeacherClassIds = new Set<string>();

    teacherAssignments.forEach(ta => {
      const isAssigned = ta.teacher_id === teacherId || 
        (ta.teacher_name && ta.teacher_name.trim().toLowerCase() === teacherName) ||
        (teacherEmail && ta.teacher_id === teacherEmail);
      if (isAssigned) {
        appointedClassSubjectKeys.add(`${ta.class_id}_${ta.subject_id}`);
        if (ta.subject_code) appointedClassSubjectKeys.add(`${ta.class_id}_code_${ta.subject_code.toLowerCase()}`);
        if (ta.subject_name) appointedClassSubjectKeys.add(`${ta.class_id}_name_${ta.subject_name.trim().toLowerCase()}`);
      }
    });

    classes.forEach(c => {
      if (
        c.class_teacher_id === teacherId ||
        (c.class_teacher_name && c.class_teacher_name.trim().toLowerCase() === teacherName)
      ) {
        classTeacherClassIds.add(c.id);
      }
    });

    return timetable.filter(s => {
      if (s.school_id && s.school_id !== activeSchool.id && s.school_id !== 'all') return false;
      if (s.teacher_id && (s.teacher_id === teacherId || (teacherEmail && s.teacher_id === teacherEmail))) return true;
      if (s.teacher_name && teacherName && s.teacher_name.trim().toLowerCase().includes(teacherName)) return true;
      if (s.class_id && s.subject_id && appointedClassSubjectKeys.has(`${s.class_id}_${s.subject_id}`)) return true;
      if (s.class_id && s.subject_code && appointedClassSubjectKeys.has(`${s.class_id}_code_${s.subject_code.toLowerCase()}`)) return true;
      if (s.class_id && s.subject_name && appointedClassSubjectKeys.has(`${s.class_id}_name_${s.subject_name.trim().toLowerCase()}`)) return true;
      if (s.class_id && classTeacherClassIds.has(s.class_id) && (s.is_special || s.subject_code === 'ASM')) return true;
      return false;
    });
  }, [timetable, activeSchool.id, teacherId, teacherName, teacherEmail, teacherAssignments, classes]);

  const filteredDaySlots = useMemo(() => {
    return teacherScheduleSlots
      .filter(s => s.day_of_week === selectedDay)
      .sort((a, b) => (a.period_number || 1) - (b.period_number || 1));
  }, [teacherScheduleSlots, selectedDay]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      
      {/* Top Mobile Status Header & Connectivity Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">{currentUser.name}</h1>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 shrink-0">
                  Teacher
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {activeSchool.name} · {activeSchool.active_term || 'Term 1'}
              </p>
            </div>
          </div>

          {/* Sync Button & Menu Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleForceSync}
              disabled={isSyncingNow}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition ${
                syncStatus.isOnline 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' 
                  : 'bg-amber-950/80 border-amber-800/80 text-amber-300'
              }`}
              title={syncStatus.isOnline ? 'Online - Auto-syncing' : 'Offline - Queuing locally'}
            >
              {syncStatus.isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
              )}
              <RefreshCw className={`w-3 h-3 ${isSyncingNow ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              {syncStatus.pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-slate-950 font-bold">
                  {syncStatus.pendingCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Open/Close Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-purple-400" />}
              <span className="text-[11px] font-bold">{isMobileMenuOpen ? 'Close' : 'Tabs'}</span>
            </button>
          </div>
        </div>

        {/* Persistent Touch-Friendly Horizontal Navigation Bar for Phones */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-2.5">
          <button
            onClick={() => { setActiveView('OVERVIEW'); setIsMobileMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeView === 'OVERVIEW'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => { setActiveView('STUDENTS'); setIsMobileMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeView === 'STUDENTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students</span>
          </button>
          <button
            onClick={() => { setActiveView('ATTENDANCE'); setIsMobileMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeView === 'ATTENDANCE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => { setActiveView('SCHEDULE'); setIsMobileMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeView === 'SCHEDULE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>
        </div>

        {/* Collapsible Expanded Grid Menu for quick view jumping */}
        {isMobileMenuOpen && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <button
              onClick={() => { setActiveView('OVERVIEW'); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800 text-left font-bold flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <div>
                <span className="block text-white text-[11px]">Overview</span>
                <span className="text-[9px] text-slate-400 font-normal">Classes & Hub</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveView('STUDENTS'); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800 text-left font-bold flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <span className="block text-white text-[11px]">Students</span>
                <span className="text-[9px] text-slate-400 font-normal">Directory & Roster</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveView('ATTENDANCE'); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800 text-left font-bold flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="block text-white text-[11px]">Attendance</span>
                <span className="text-[9px] text-slate-400 font-normal">Daily / Subject</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveView('SCHEDULE'); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800 text-left font-bold flex items-center gap-2 col-span-2 sm:col-span-1"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="block text-white text-[11px]">Schedule</span>
                <span className="text-[9px] text-slate-400 font-normal">Weekly Timetable</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 1. OVERVIEW: MINIMAL MAIN MENU (STUDENTS | ATTENDANCE | RESULTS | SCHEDULE) */}
      {/* ---------------------------------------------------------------- */}
      {activeView === 'OVERVIEW' && (
        <div className="space-y-4">
          
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">My Classes</span>
              <span className="text-xl font-bold text-white">{appointedClasses.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Students</span>
              <span className="text-xl font-bold text-blue-400">
                {students.filter(s => appointedClasses.some(c => c.id === s.class_id) && s.status === 'ACTIVE').length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Weekly Slots</span>
              <span className="text-xl font-bold text-emerald-400">{teacherScheduleSlots.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Mode</span>
              <span className="text-xs font-bold text-amber-300 mt-1 inline-block">
                {syncStatus.isOnline ? 'Online Sync' : 'Offline Ready'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons (Large Touch-Friendly Cards for Phones) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* BUTTON 1: STUDENTS */}
            <button
              onClick={() => setActiveView('STUDENTS')}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between text-left transition group active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">Students Directory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View student profiles & contact parents
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
            </button>

            {/* BUTTON 2: ATTENDANCE */}
            <button
              onClick={() => setActiveView('ATTENDANCE')}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition group active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">Daily & Subject Attendance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Roll call register & parent SMS alerts
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
            </button>

            {/* BUTTON 3: SCHEDULE */}
            <button
              onClick={() => setActiveView('SCHEDULE')}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between text-left transition group active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">My Teaching Timetable</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Day-by-day periods for all appointed classes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
            </button>

          </div>

          {/* Appointed Classes Quick Badge list */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Appointed Classes & Subjects</h4>
            <div className="space-y-2">
              {appointedClasses.map(cls => {
                const isClassTeacher = isClassTeacherFor(cls.id);
                const assignedSubs = getAppointedSubjectsForClass(cls.id);
                const classStudentCount = students.filter(s => s.class_id === cls.id && s.status === 'ACTIVE').length;

                return (
                  <div key={cls.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{cls.name}</span>
                        {isClassTeacher && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                            Class Teacher (Titulaire)
                          </span>
                        )}
                        <span className="text-xs text-slate-400">({classStudentCount} students)</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Subjects: {assignedSubs.map(s => s.name).join(', ') || 'General Teaching'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setAttClassId(cls.id);
                          setActiveView('ATTENDANCE');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900"
                      >
                        Attendance
                      </button>
                      <button
                        onClick={() => {
                          setResClassId(cls.id);
                          setActiveView('RESULTS');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/60 hover:bg-amber-900"
                      >
                        Marks
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 2. STUDENTS VIEW (ONLY APPOINTED CLASSES, WITH PARENT CONTACTS) */}
      {/* ---------------------------------------------------------------- */}
      {activeView === 'STUDENTS' && (
        <div className="space-y-3">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-base font-bold text-white">Students & Parent Contacts</h2>
            <span className="text-xs text-slate-400 font-mono">{displayedStudents.length} Found</span>
          </div>

          {/* Appointed Class Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {appointedClasses.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedStudentClassId(cls.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  (selectedStudentClassId || appointedClasses[0]?.id) === cls.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cls.name} {isClassTeacherFor(cls.id) ? '★' : ''}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name, reg number, or phone..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Student Cards List */}
          <div className="space-y-2">
            {displayedStudents.map(student => (
              <div 
                key={student.id} 
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {student.first_name} {student.last_name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {student.registration_number}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Guardian: <strong className="text-slate-300">{student.guardian_name || 'Parent'}</strong></span>
                      <span>·</span>
                      <span className="font-mono text-blue-400">{student.guardian_phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Triggers for Calling & Messaging Parents */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {student.guardian_phone && (
                    <>
                      <a
                        href={`tel:${student.guardian_phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`sms:${student.guardian_phone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-950/90 hover:bg-blue-900 text-blue-300 border border-blue-800/80 text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </a>
                      <a
                        href={`https://wa.me/${student.guardian_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-teal-950/90 hover:bg-teal-900 text-teal-300 border border-teal-800/80 text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}

            {displayedStudents.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">No students found matching the selected class and query.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 3. ATTENDANCE VIEW (DATE SELECTOR, CLASS/SUBJECT MODE, MINIMAL LIST) */}
      {/* ---------------------------------------------------------------- */}
      {activeView === 'ATTENDANCE' && (
        <div className="space-y-3">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-base font-bold text-white">Attendance Register</h2>
            <button
              onClick={handleSaveAttendance}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

          {attSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{attSuccessMsg}</span>
            </div>
          )}

          {/* Config Bar (Date First, Class, Subject & Period) */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              
              {/* Date Selector First */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date:</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Class:</label>
                <select
                  value={attClassId}
                  onChange={(e) => setAttClassId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {appointedClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {isClassTeacherFor(cls.id) ? '(Class Teacher)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode & Subject (If class teacher, can do whole class or subject session) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Attendance Type:</label>
                <select
                  value={attSubjectId}
                  onChange={(e) => setAttSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {isClassTeacherOfAttClass && (
                    <option value="">Whole Class Daily Attendance (Homeroom)</option>
                  )}
                  {attAvailableSubjects.map(s => (
                    <option key={s.id} value={s.id}>Subject: {s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Period (for subject session) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Period (1 - 10):</label>
                <select
                  value={attPeriodNumber}
                  onChange={(e) => setAttPeriodNumber(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <option key={p} value={p}>Period {p}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Quick Helper: Mark All as Present & Search */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All as Present</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  {attClassStudents.length} Students
                </span>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter student name..."
                  value={attSearchQuery}
                  onChange={(e) => setAttSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Status Breakdown Counters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(['PRESENT', 'ABSENT', 'EXCUSED_ABSENT', 'LATE', 'SICK', 'NOT_RECORDED'] as AttendanceStatus[]).map(st => {
              const count = attClassStudents.filter(s => (attStatuses[s.id] || 'NOT_RECORDED') === st).length;
              const cfg = ATTENDANCE_STATUS_CONFIG[st];
              return (
                <div key={st} className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 whitespace-nowrap ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                  <span className="font-bold">{cfg.label}:</span>
                  <span className="font-mono font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Minimalist Student Roll Call List */}
          <div className="space-y-1.5">
            {attClassStudents
              .filter(st => {
                if (!attSearchQuery.trim()) return true;
                const name = `${st.first_name} ${st.last_name}`.toLowerCase();
                return name.includes(attSearchQuery.toLowerCase());
              })
              .map((student, idx) => {
                const currentStatus = attStatuses[student.id] || 'NOT_RECORDED';
                const statusCfg = ATTENDANCE_STATUS_CONFIG[currentStatus];

                return (
                  <div 
                    key={student.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-slate-500 w-6 text-right">{idx + 1}.</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {student.first_name} {student.last_name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{student.registration_number}</span>
                      </div>
                    </div>

                    {/* Status Toggle Pills */}
                    <div className="flex items-center gap-1 flex-wrap self-end sm:self-auto">
                      {(['PRESENT', 'ABSENT', 'EXCUSED_ABSENT', 'LATE', 'SICK'] as AttendanceStatus[]).map(st => {
                        const isSelected = currentStatus === st;
                        const cfg = ATTENDANCE_STATUS_CONFIG[st];
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAttStatuses(prev => ({ ...prev, [student.id]: st }))}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition border ${
                              isSelected 
                                ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-white/20 shadow-sm` 
                                : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-white'
                            }`}
                          >
                            {cfg.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Save Trigger */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {syncStatus.isOnline ? 'Online (Instant cloud sync)' : 'Offline (Cached on device)'}
            </span>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Commit Attendance</span>
            </button>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. RESULTS VIEW (REGISTER NEW OR EDIT CURRENT RESULTS) */}
      {/* ---------------------------------------------------------------- */}
      {activeView === 'RESULTS' && (
        <div className="space-y-3">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-base font-bold text-white">Results & Continuous Assessment</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setResSubTab('REGISTER')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                  resSubTab === 'REGISTER' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Mark Entry
              </button>
              <button
                onClick={() => setResSubTab('HISTORY')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                  resSubTab === 'HISTORY' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Past Records
              </button>
            </div>
          </div>

          {resSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resSuccessMsg}</span>
            </div>
          )}

          {resSubTab === 'REGISTER' && (
            <div className="space-y-3">
              
              {/* Assessment Configuration Form */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  
                  {/* Class Selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Class:</label>
                    <select
                      value={resClassId}
                      onChange={(e) => setResClassId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {appointedClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject:</label>
                    <select
                      value={resSubjectId}
                      onChange={(e) => setResSubjectId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {resAvailableSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Assessment Type */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Assessment Type:</label>
                    <select
                      value={resAssessmentType}
                      onChange={(e) => setResAssessmentType(e.target.value as AssessmentType)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {ASSESSMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Period Number (1 to 10) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Period (1 to 10):</label>
                    <select
                      value={resPeriodNumber}
                      onChange={(e) => setResPeriodNumber(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                        <option key={p} value={p}>Period {p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Maximum Marks */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Marks (pts):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={resMaxMarks}
                      onChange={(e) => setResMaxMarks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Term */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Session:</label>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                      {activeSchool.active_academic_year} · {activeSchool.active_term || 'Term 1'}
                    </div>
                  </div>

                </div>

                {/* Search Bar for Students in Class */}
                <div className="pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Search student name in this class..."
                    value={resSearchQuery}
                    onChange={(e) => setResSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Minimal Marks Table for Phone Screens */}
              <div className="space-y-1.5">
                {resClassStudents
                  .filter(st => {
                    if (!resSearchQuery.trim()) return true;
                    const name = `${st.first_name} ${st.last_name}`.toLowerCase();
                    return name.includes(resSearchQuery.toLowerCase());
                  })
                  .map((student, idx) => {
                    const currentVal = resMarks[student.id] !== undefined ? resMarks[student.id] : '';
                    const numVal = Number(currentVal);
                    const isExceeding = currentVal !== '' && numVal > resMaxMarks;
                    const pct = resMaxMarks > 0 && currentVal !== '' ? Math.round((numVal / resMaxMarks) * 100) : 0;

                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-sm transition ${
                          isExceeding ? 'bg-rose-950/30 border-rose-600/70' : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 w-5 text-right">{idx + 1}.</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {student.first_name} {student.last_name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">{student.registration_number}</span>
                            {isExceeding && (
                              <span className="block text-[9.5px] text-rose-400 font-bold mt-0.5">
                                Exceeds max ({resMaxMarks} pts)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max={resMaxMarks}
                              step="0.5"
                              placeholder="0"
                              value={currentVal}
                              onChange={(e) => setResMarks(prev => ({ ...prev, [student.id]: Number(e.target.value) }))}
                              className={`w-16 px-2 py-1 rounded-lg font-mono text-xs text-center focus:outline-none ${
                                isExceeding
                                  ? 'bg-rose-950 border-rose-500 text-rose-200 ring-1 ring-rose-500 font-black'
                                  : 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500'
                              }`}
                            />
                            <span className="text-[11px] text-slate-500 font-mono">/{resMaxMarks}</span>
                          </div>

                          <span className={`text-[11px] font-mono font-bold w-10 text-right ${
                            pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : currentVal !== '' ? 'text-rose-400' : 'text-slate-600'
                          }`}>
                            {currentVal !== '' ? `${pct}%` : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
                <button
                  onClick={() => handleSaveResults(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSaveResults(false)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Submit Official Marks</span>
                </button>
              </div>

            </div>
          )}

          {/* Past Submissions History Tab */}
          {resSubTab === 'HISTORY' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recorded Submissions (Aggregated for Reports)
              </h3>
              {groupedSubmissions.map(sub => (
                <div key={sub.key} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{sub.class_name} · {sub.subject_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                        {sub.assessment_type} {sub.period_number ? `(P${sub.period_number})` : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {sub.term} · {sub.academic_year} · {sub.student_count} Students · Avg: {sub.average_score}/{sub.max_marks}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setResClassId(sub.class_id);
                        setResSubjectId(sub.subject_id);
                        setResAssessmentType(sub.assessment_type as AssessmentType);
                        if (sub.period_number) setResPeriodNumber(sub.period_number);
                        setResMaxMarks(sub.max_marks);
                        setResSubTab('REGISTER');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Edit / Review
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete all recorded marks for ${sub.class_name} - ${sub.subject_name} (${sub.assessment_type})? This action cannot be undone.`)) {
                          const res = deleteGradeBatch({
                            class_id: sub.class_id,
                            subject_id: sub.subject_id,
                            assessment_type: sub.assessment_type,
                            period_number: sub.period_number,
                            term: sub.term,
                            academic_year: sub.academic_year
                          });
                          alert(res.message);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/60 transition"
                      title="Delete Recorded Assessment Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {groupedSubmissions.length === 0 && (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">No previous grade entries found.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 5. SCHEDULE VIEW (DAY SELECTOR & TOUCH-FRIENDLY PERIOD CARDS) */}
      {/* ---------------------------------------------------------------- */}
      {activeView === 'SCHEDULE' && (
        <div className="space-y-3">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-base font-bold text-white">My Teaching Schedule</h2>
            <span className="text-xs text-purple-400 font-bold">{teacherScheduleSlots.length} Weekly Slots</span>
          </div>

          {/* Day of Week Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
              const countForDay = teacherScheduleSlots.filter(s => s.day_of_week === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedDay === day
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedDay === day ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {countForDay}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule Slots Cards for Selected Day */}
          <div className="space-y-2">
            {filteredDaySlots.map(slot => (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/80 flex flex-col items-center justify-center text-purple-300 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Period</span>
                    <span className="text-base font-extrabold">{slot.period_number || 1}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{slot.subject_name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
                        {slot.class_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-mono">{slot.start_time} - {slot.end_time}</span>
                      <span>·</span>
                      <span>Room: <strong className="text-slate-300">{slot.room}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setAttClassId(slot.class_id);
                      setAttSubjectId(slot.subject_id);
                      setAttPeriodNumber(slot.period_number || 1);
                      setActiveView('ATTENDANCE');
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900"
                  >
                    Take Attendance
                  </button>
                </div>
              </div>
            ))}

            {filteredDaySlots.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No scheduled periods for {selectedDay}.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
