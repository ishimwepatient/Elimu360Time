import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Filter, 
  Save, 
  CheckCircle2, 
  X, 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Calendar,
  UserCheck,
  Clock,
  ArrowDown,
  ArrowUp,
  Users,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { AssessmentType, ClassRoom, Subject, User, AttendanceStatus } from '../../types';

interface AssessmentMatrixRow {
  id: string;
  classId: string;
  className: string;
  classLevel: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName: string;
  endOfUnitTestCount: number;
  midTermTestCount: number;
  quizCount: number;
  testCount: number;
  secondSittingCount: number;
  finalExamCount: number;
  commentsCount: number;
}

export const AssessmentsTracking: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    classes, 
    subjects, 
    teachers, 
    grades, 
    students,
    attendance,
    submitGrade
  } = useElimu();

  const isDirectorOrDOS = currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'DOS' || currentUser.role === 'SUPER_ADMIN';

  const [activeMainTab, setActiveMainTab] = useState<'ASSESSMENTS' | 'ATTENDANCE'>('ASSESSMENTS');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Attendance Tracking State
  const [attClassFilter, setAttClassFilter] = useState<string>('ALL');
  const [attStatusFilter, setAttStatusFilter] = useState<string>('ALL');
  const [attDateSort, setAttDateSort] = useState<'desc' | 'asc'>('desc');
  const [attSearchTerm, setAttSearchTerm] = useState<string>('');
  const [attDateFilter, setAttDateFilter] = useState<string>('');
  const [attDayOfWeekFilter, setAttDayOfWeekFilter] = useState<string>('ALL');

  // Active Mark Entry Modal State
  const [activeEntryModal, setActiveEntryModal] = useState<{
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    assessmentType: AssessmentType;
    teacherName: string;
  } | null>(null);

  const [markInputs, setMarkInputs] = useState<Record<string, number>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'class' | 'subject' | 'teacher'>('class');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Active Teachers registered for this school
  const activeTeachers = useMemo(() => {
    return teachers.filter(t => !t.school_id || t.school_id === activeSchool.id || t.school_id === 'all');
  }, [teachers, activeSchool.id]);

  // Active Subjects registered for this school
  const activeSubjects = useMemo(() => {
    return subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
  }, [subjects, activeSchool.id]);

  // Active Classes registered for this school
  const activeClasses = useMemo(() => {
    return classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all');
  }, [classes, activeSchool.id]);

  // Generate Matrix Rows
  const matrixRows = useMemo<AssessmentMatrixRow[]>(() => {
    const list: AssessmentMatrixRow[] = [];

    activeClasses.forEach(cls => {
      activeSubjects.forEach(sub => {
        const assignedTeacher = activeTeachers.find(t => t.assigned_class_id === cls.id || t.department === sub.department)?.name || 
          cls.teacher_name || 
          'Unassigned Subject Teacher';

        // Calculate count of recorded assessments for this class + subject
        const matchingGrades = grades.filter(g => 
          g.class_id === cls.id && 
          g.subject_id === sub.id &&
          (!g.school_id || g.school_id === activeSchool.id || g.school_id === 'all') &&
          (g.academic_year === (activeSchool.active_academic_year || '2026'))
        );

        const endOfUnitCount = matchingGrades.filter(g => g.assessment_type === 'End of Unit Test').length;
        const midTermCount = matchingGrades.filter(g => g.assessment_type === 'Mid term test' || g.assessment_type === 'MID_TERM').length;
        const quizCount = matchingGrades.filter(g => g.assessment_type === 'Quiz').length;
        const testCount = matchingGrades.filter(g => g.assessment_type === 'Test' || g.assessment_type === 'CAT').length;
        const secondSittingCount = matchingGrades.filter(g => g.assessment_type === '2nd Sitting').length;
        const finalExamCount = matchingGrades.filter(g => g.assessment_type === 'Final Exam' || g.assessment_type === 'END_OF_TERM').length;
        const commentsCount = matchingGrades.filter(g => g.remarks && g.remarks.trim().length > 0).length;

        list.push({
          id: `${cls.id}_${sub.id}`,
          classId: cls.id,
          className: cls.name,
          classLevel: cls.level_name || 'Primary',
          subjectId: sub.id,
          subjectName: sub.name,
          teacherName: assignedTeacher,
          endOfUnitTestCount: endOfUnitCount,
          midTermTestCount: midTermCount,
          quizCount: quizCount,
          testCount: testCount,
          secondSittingCount: secondSittingCount,
          finalExamCount: finalExamCount,
          commentsCount: commentsCount
        });
      });
    });

    return list;
  }, [activeClasses, activeSubjects, activeTeachers, grades, activeSchool.id]);

  // Filter & Search
  const filteredRows = useMemo(() => {
    return matrixRows.filter(row => {
      const matchesSearch = 
        row.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClassFilter === 'ALL' || row.classId === selectedClassFilter;

      return matchesSearch && matchesClass;
    }).sort((a, b) => {
      if (sortField === 'class') {
        const cmp = a.className.localeCompare(b.className);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (sortField === 'subject') {
        const cmp = a.subjectName.localeCompare(b.subjectName);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const cmp = a.teacherName.localeCompare(b.teacherName);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [matrixRows, searchTerm, selectedClassFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenMarkEntry = (
    row: AssessmentMatrixRow, 
    assessmentType: AssessmentType
  ) => {
    setActiveEntryModal({
      classId: row.classId,
      className: row.className,
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      assessmentType: assessmentType,
      teacherName: row.teacherName
    });
    setModalSuccessMsg(null);
  };

  // Class students for mark entry modal
  const modalClassStudents = useMemo(() => {
    if (!activeEntryModal) return [];
    return students.filter(s => s.class_id === activeEntryModal.classId && (s.school_id === activeSchool.id || s.school_id === 'all'));
  }, [activeEntryModal, students, activeSchool.id]);

  const targetModalSubject = useMemo(() => {
    if (!activeEntryModal) return null;
    return subjects.find(s => s.id === activeEntryModal.subjectId);
  }, [activeEntryModal, subjects]);

  const defaultModalMaxMarks = (targetModalSubject?.periods_per_week || 4) * 10;
  const [modalMaxMarks, setModalMaxMarks] = useState<number>(defaultModalMaxMarks);

  // Sync modalMaxMarks when subject changes
  React.useEffect(() => {
    setModalMaxMarks(defaultModalMaxMarks);
  }, [defaultModalMaxMarks]);

  const [modalValidationError, setModalValidationError] = useState<string | null>(null);

  const handleSaveModalMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntryModal) return;
    setModalValidationError(null);

    if (isDirectorOrDOS) {
      alert('Action Unauthorized: School Directors and Directors of Studies (DOS) are restricted by institutional policy from editing or altering teacher marks.');
      return;
    }

    // Strict validation: marks cannot exceed max marks
    for (const st of modalClassStudents) {
      const inputVal = markInputs[st.id];
      if (inputVal !== undefined && inputVal !== ('' as any)) {
        const numVal = Number(inputVal);
        if (numVal > modalMaxMarks) {
          const err = `Validation Error: Mark (${numVal}) for student "${st.first_name} ${st.last_name}" exceeds the maximum set score of ${modalMaxMarks} marks.`;
          setModalValidationError(err);
          alert(err);
          return;
        }
        if (numVal < 0) {
          const err = `Validation Error: Mark for student "${st.first_name} ${st.last_name}" cannot be negative.`;
          setModalValidationError(err);
          alert(err);
          return;
        }
      }
    }

    let savedCount = 0;
    modalClassStudents.forEach(st => {
      const inputVal = markInputs[st.id];
      if (inputVal === undefined || inputVal === ('' as any)) {
        return; // Skip students with no score entered
      }

      const markVal = Number(inputVal);
      const remarkVal = remarkInputs[st.id] || 'Demonstrated consistent competency.';

      submitGrade({
        student_id: st.id,
        student_name: `${st.first_name} ${st.last_name}`,
        subject_id: activeEntryModal.subjectId,
        subject_name: activeEntryModal.subjectName,
        class_id: activeEntryModal.classId,
        term: activeSchool.active_term || 'Term 1',
        academic_year: activeSchool.active_academic_year || '2026',
        assessment_type: activeEntryModal.assessmentType,
        period_number: 1,
        marks: markVal,
        max_marks: modalMaxMarks,
        teacher_id: currentUser.id,
        teacher_name: activeEntryModal.teacherName || currentUser.name,
        remarks: remarkVal
      });
      savedCount++;
    });

    setModalSuccessMsg(`Marks for ${savedCount} student(s) recorded and verified successfully.`);
    setTimeout(() => {
      setActiveEntryModal(null);
    }, 1500);
  };

  // Filtered & Sorted Attendance Records (Strictly sorted by Date & Day)
  const filteredAttendance = useMemo(() => {
    return attendance
      .filter(a => !a.school_id || a.school_id === activeSchool.id || a.school_id === 'all')
      .filter(a => {
        if (attClassFilter !== 'ALL' && a.class_id !== attClassFilter) return false;
        if (attStatusFilter !== 'ALL' && a.status !== attStatusFilter) return false;
        if (attDateFilter && a.date !== attDateFilter) return false;
        if (attDayOfWeekFilter !== 'ALL') {
          if (a.date) {
            const parts = a.date.split('-').map(Number);
            if (parts.length === 3) {
              const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
              if (dayName.toLowerCase() !== attDayOfWeekFilter.toLowerCase()) return false;
            }
          } else {
            return false;
          }
        }
        if (attSearchTerm.trim()) {
          const q = attSearchTerm.toLowerCase();
          const sName = (a.student_name || '').toLowerCase();
          const cName = (a.class_name || '').toLowerCase();
          const mName = (a.marked_by_name || '').toLowerCase();
          return sName.includes(q) || cName.includes(q) || mName.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (attDateSort === 'desc') {
          return dateB.localeCompare(dateA); // Newest date first
        } else {
          return dateA.localeCompare(dateB); // Oldest date first
        }
      });
  }, [attendance, activeSchool.id, attClassFilter, attStatusFilter, attDateFilter, attDayOfWeekFilter, attSearchTerm, attDateSort]);

  // Overall Attendance Summary Metrics
  const attMetrics = useMemo(() => {
    const schoolAtt = attendance.filter(a => !a.school_id || a.school_id === activeSchool.id || a.school_id === 'all');
    const total = schoolAtt.length;
    const present = schoolAtt.filter(a => a.status === 'PRESENT').length;
    const absent = schoolAtt.filter(a => a.status === 'ABSENT').length;
    const late = schoolAtt.filter(a => a.status === 'LATE').length;
    const sick = schoolAtt.filter(a => a.status === 'SICK').length;
    const excused = schoolAtt.filter(a => a.status === 'EXCUSED' || a.status === 'EXCUSED_ABSENT').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return { total, present, absent, late, sick, excused, rate };
  }, [attendance, activeSchool.id]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Top Directorate Tab Switcher: Assessments vs Attendance */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveMainTab('ASSESSMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'ASSESSMENTS'
              ? 'bg-white text-slate-900 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Tests & Exams Matrix</span>
        </button>

        <button
          onClick={() => setActiveMainTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'ATTENDANCE'
              ? 'bg-white text-slate-900 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Attendance Tracking (By Date)</span>
        </button>
      </div>
      
      {/* Render Main Content depending on activeMainTab */}
      {activeMainTab === 'ATTENDANCE' ? (
        <div className="space-y-5">
          {/* Attendance Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Directorate Command · Attendance Register Tracking</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide font-display mt-0.5">
                Attendance Tracking & Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor class roll-call compliance, track student absenteeism, and sort historical logs by date.
              </p>
            </div>

            {/* Sort & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAttDateSort(attDateSort === 'desc' ? 'asc' : 'desc')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                title="Toggle Sorting Order by Date"
              >
                {attDateSort === 'desc' ? (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sort: Newest Date First</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sort: Oldest Date First</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Attendance KPI Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Attendance Rate</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{attMetrics.rate}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Overall campus presence</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Records</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{attMetrics.total}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Roll call logs</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{attMetrics.present}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">In class & punctual</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Absent</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">{attMetrics.absent}</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Unexcused absences</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Late / Sick / Excused</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {attMetrics.late + attMetrics.sick + attMetrics.excused}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Special statuses</div>
            </div>
          </div>

          {/* Attendance Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={attSearchTerm}
                onChange={(e) => setAttSearchTerm(e.target.value)}
                placeholder="Search student, class..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Calendar Date Picker Filter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <input
                  type="date"
                  value={attDateFilter}
                  onChange={(e) => setAttDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  title="Filter by specific calendar date"
                />
                {attDateFilter && (
                  <button
                    onClick={() => setAttDateFilter('')}
                    className="text-[10px] text-rose-600 font-bold ml-1 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Day of Week Filter */}
              <select
                value={attDayOfWeekFilter}
                onChange={(e) => setAttDayOfWeekFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Days of Week</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>

              {/* Class Filter */}
              <select
                value={attClassFilter}
                onChange={(e) => setAttClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Classes</option>
                {activeClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={attStatusFilter}
                onChange={(e) => setAttStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="SICK">Sick</option>
                <option value="EXCUSED">Excused</option>
              </select>

              {/* Date Sorting Toggle Button */}
              <button
                type="button"
                onClick={() => setAttDateSort(attDateSort === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                {attDateSort === 'desc' ? <ArrowDown className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{attDateSort === 'desc' ? 'Newest ↓' : 'Oldest ↑'}</span>
              </button>
            </div>
          </div>

          {/* Date-Sorted Attendance Register Table */}
          <div className="rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  Attendance History Register ({filteredAttendance.length} records)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Sorted by Date: <strong className="text-slate-900">{attDateSort === 'desc' ? 'Newest First (Descending)' : 'Oldest First (Ascending)'}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th 
                      onClick={() => setAttDateSort(attDateSort === 'desc' ? 'asc' : 'desc')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1 text-slate-900">
                        <span>Date</span>
                        {attDateSort === 'desc' ? <ArrowDown className="w-3 h-3 text-emerald-600" /> : <ArrowUp className="w-3 h-3 text-emerald-600" />}
                      </div>
                    </th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Marked By</th>
                    <th className="py-3 px-4">Session Type</th>
                    <th className="py-3 px-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-600 text-xs">No Attendance Records Found</p>
                        <p className="text-[11px] text-slate-400">Try adjusting your filters or date sorting settings.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => {
                      let dayLabel = '';
                      if (rec.date) {
                        const parts = rec.date.split('-').map(Number);
                        if (parts.length === 3) {
                          const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
                          dayLabel = dObj.toLocaleDateString('en-US', { weekday: 'short' });
                        }
                      }

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
                              <span>{rec.date}</span>
                              {dayLabel && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                                  {dayLabel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                            {rec.class_name}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {rec.student_name}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              rec.status === 'ABSENT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              rec.status === 'LATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              rec.status === 'SICK' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}>
                              {rec.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {rec.marked_by_name || 'Class Teacher'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {rec.attendance_type === 'SUBJECT_SESSION' ? `Subject Session (P${rec.period_number || 1})` : 'Daily Class Roll Call'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                            {rec.remarks || '--'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Attendance Rate Summary Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  Class Attendance Performance Summary
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Institutional roll-call compliance across active classes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeClasses.map((cls) => {
                const clsRecords = attendance.filter(a => a.class_id === cls.id);
                const totalClsRec = clsRecords.length;
                const presentClsRec = clsRecords.filter(a => a.status === 'PRESENT').length;
                const rate = totalClsRec > 0 ? Math.round((presentClsRec / totalClsRec) * 100) : 100;

                return (
                  <div key={cls.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{cls.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {totalClsRec} total roll call logs recorded
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-black ${
                        rate >= 90 ? 'text-emerald-700' : rate >= 75 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {rate}%
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Attendance</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ASSESSMENTS MATRIX VIEW */
        <>
      {/* Top Header matching Academic Bridge Assessments Tracking */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Academic Command · Continuous Evaluations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide font-display mt-0.5">
            Assessments Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-subject evaluation matrix and score count across all active classes.
          </p>
        </div>

        {/* Top Right: Search input matching "Search here, E.g: Teacher ," */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search here, E.g: Teacher ,"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Class Filter Dropdown */}
          <select
            value={selectedClassFilter}
            onChange={(e) => {
              setSelectedClassFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Classes</option>
            {activeClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main High-Density Academic Matrix Table */}
      <div className="rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10.5px] tracking-wider">
                <th 
                  onClick={() => {
                    setSortField('class');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Class</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => {
                    setSortField('subject');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Subject</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => {
                    setSortField('teacher');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Teacher</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">End of Unit Test</th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">Mid term test</th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">Quiz</th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">Test</th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">2nd Sitting</th>
                <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">Final Exam</th>
                <th className="py-3 px-3 text-center whitespace-nowrap text-blue-700">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No assessment records found matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                paginatedRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition group">
                    {/* Class */}
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {row.className}
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {row.subjectName}
                    </td>

                    {/* Teacher */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {row.teacherName}
                    </td>

                    {/* End of Unit Test */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'End of Unit Test')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.endOfUnitTestCount > 0 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View End of Unit Test Marks"
                      >
                        {row.endOfUnitTestCount}
                      </button>
                    </td>

                    {/* Mid term test */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'Mid term test')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.midTermTestCount > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View Midterm Test Marks"
                      >
                        {row.midTermTestCount}
                      </button>
                    </td>

                    {/* Quiz */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'Quiz')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.quizCount > 0 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View Quiz Marks"
                      >
                        {row.quizCount}
                      </button>
                    </td>

                    {/* Test */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'Test')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.testCount > 0 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View Test Marks"
                      >
                        {row.testCount}
                      </button>
                    </td>

                    {/* 2nd Sitting */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, '2nd Sitting')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.secondSittingCount > 0 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View 2nd Sitting Marks"
                      >
                        {row.secondSittingCount}
                      </button>
                    </td>

                    {/* Final Exam */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'Final Exam')}
                        className={`min-w-[28px] py-0.5 px-2 rounded font-mono font-bold text-xs transition cursor-pointer ${
                          row.finalExamCount > 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Click to Record / View Final Exam Marks"
                      >
                        {row.finalExamCount}
                      </button>
                    </td>

                    {/* Comments */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenMarkEntry(row, 'End of Unit Test')}
                        className="text-blue-600 hover:text-blue-800 font-mono font-bold hover:underline cursor-pointer"
                        title="View teacher remarks & appraisals"
                      >
                        {row.commentsCount > 0 ? row.commentsCount : '-'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* =========================================================================
          MODAL: Quick Mark & Assessment Capture for Selected Class + Subject
          ========================================================================= */}
      {activeEntryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Assessment Mark Register
                </div>
                <h2 className="text-base font-bold">
                  {activeEntryModal.className} · {activeEntryModal.subjectName} ({activeEntryModal.assessmentType})
                </h2>
                <p className="text-[11px] text-slate-300">
                  Teacher: {activeEntryModal.teacherName} · Term: {activeSchool.active_term}
                </p>
              </div>
              <button
                onClick={() => setActiveEntryModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDirectorOrDOS && (
              <div className="m-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span className="font-bold">Director & DOS Audit Mode:</span>
                <span>Under Teacher Mark Sovereignty policy, directors and DOS cannot alter marks or maximum marks entered by the teacher.</span>
              </div>
            )}

            {modalSuccessMsg && (
              <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {/* Form Table */}
            <form onSubmit={handleSaveModalMarks} className="p-6">
              <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Reg #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3 w-32">Score (/{modalMaxMarks} pts)</th>
                      <th className="py-2.5 px-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalClassStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No students currently enrolled in this class.
                        </td>
                      </tr>
                    ) : (
                      modalClassStudents.map(st => {
                        const existingGrade = grades.find(g => 
                          g.student_id === st.id && 
                          g.subject_id === activeEntryModal.subjectId && 
                          g.assessment_type === activeEntryModal.assessmentType
                        );
                        const curVal = markInputs[st.id] !== undefined ? markInputs[st.id] : (existingGrade ? existingGrade.marks : '');

                        return (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{st.registration_number}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{st.first_name} {st.last_name}</td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                max={modalMaxMarks}
                                step="0.5"
                                disabled={isDirectorOrDOS}
                                placeholder="--"
                                value={curVal}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setMarkInputs({ ...markInputs, [st.id]: val as any });
                                }}
                                className="w-20 px-2 py-1 rounded bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                disabled={isDirectorOrDOS}
                                placeholder="Competency notes..."
                                defaultValue={existingGrade?.remarks || ''}
                                onChange={(e) => setRemarkInputs({ ...remarkInputs, [st.id]: e.target.value })}
                                className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Max Mark:</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    disabled={isDirectorOrDOS}
                    value={modalMaxMarks}
                    onChange={(e) => setModalMaxMarks(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400">
                    (Standard: {targetModalSubject?.periods_per_week || 4} periods × 10 = {(targetModalSubject?.periods_per_week || 4) * 10} pts)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEntryModal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Close
                  </button>

                  {!isDirectorOrDOS && (
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Commit Scores to Cloud</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
