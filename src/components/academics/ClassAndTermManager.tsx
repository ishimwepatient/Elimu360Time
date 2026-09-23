import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Users, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles,
  School,
  ArrowRight,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Lock,
  UserCheck,
  Info,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  MoreVertical,
  AlertTriangle,
  FileText,
  X,
  FileCheck
} from 'lucide-react';
import { useElimu, sortClassesAscending, getGradeAscendingWeight } from '../../context/ElimuContext';
import { ClassRoom, Subject, SchoolEducationLevel, TeacherAssignment, Student, SpecialCaseRecord } from '../../types';
import { PassportPhoto } from '../common/PassportPhoto';
import { generateClassReportCards } from '../../utils/reportCardGenerator';

export const ClassAndTermManager: React.FC = () => {
  const { 
    activeSchool, 
    currentUser,
    classes, 
    subjects, 
    students,
    grades,
    availableUsers,
    educationLevels,
    getSchoolEducationLevels,
    toggleEducationLevel,
    addCustomEducationLevel,
    updateEducationLevel,
    addClass,
    updateClass,
    deleteClass,
    executeDeliberationPromotion,
    setSchoolTerms,
    addSubject,
    updateSubject,
    deleteSubject,
    assignSubjectsToClass,
    teacherAssignments,
    appointTeacherToSubject,
    removeTeacherAssignment,
    assignClassTeacher,
    registeredAcademicYears,
    registerAcademicYear,
    triggerConfetti,
    specialCases,
    recordSpecialCase,
    restoreSpecialCaseStudent
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'CLASSES' | 'SUBJECTS' | 'TEACHER_APPOINTMENTS' | 'DELIBERATION' | 'LEVELS' | 'TERMS' | 'SPECIAL_CASES'>('CLASSES');

  // Special Action Modal State
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);
  const [specialActionType, setSpecialActionType] = useState<'PROMOTION' | 'DEMOTION' | 'DELETION'>('PROMOTION');
  const [specialTargetClassId, setSpecialTargetClassId] = useState<string>('');
  const [specialReason, setSpecialReason] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [specialFeedback, setSpecialFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeDropdownStudentId, setActiveDropdownStudentId] = useState<string | null>(null);
  const [expandedSpecialCaseId, setExpandedSpecialCaseId] = useState<string | null>(null);

  // Search & Filter States
  const [classSearch, setClassSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // -------------------------------------------------------------
  // Education Levels State & Helpers
  // -------------------------------------------------------------
  const schoolLevels = useMemo(() => {
    return getSchoolEducationLevels(activeSchool.id);
  }, [educationLevels, activeSchool.id, getSchoolEducationLevels]);

  const enabledLevels = useMemo(() => {
    return schoolLevels.filter(lvl => lvl.is_enabled);
  }, [schoolLevels]);

  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelName, setLevelName] = useState('');
  const [levelShortName, setLevelShortName] = useState('');
  const [levelGrades, setLevelGrades] = useState('');
  const [levelDesc, setLevelDesc] = useState('');

  // -------------------------------------------------------------
  // Teachers (STRICT ROLE: 'TEACHER' ONLY for Class Teachers)
  // -------------------------------------------------------------
  const pureTeachers = useMemo(() => {
    return availableUsers.filter(u => 
      u.role === 'TEACHER' && 
      (u.school_id === activeSchool.id || u.school_id === 'all')
    );
  }, [availableUsers, activeSchool.id]);

  const allTeachingStaff = useMemo(() => {
    return availableUsers.filter(u => 
      u.role === 'TEACHER' && 
      (u.school_id === activeSchool.id || u.school_id === 'all')
    );
  }, [availableUsers, activeSchool.id]);

  // -------------------------------------------------------------
  // Sorted Classes in Ascending Order
  // -------------------------------------------------------------
  const schoolClassesAscending = useMemo(() => {
    const schoolCls = classes.filter(c => c.school_id === activeSchool.id);
    return sortClassesAscending(schoolCls);
  }, [classes, activeSchool.id]);

  const filteredClasses = useMemo(() => {
    return schoolClassesAscending.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(classSearch.toLowerCase()) || 
                            c.stream.toLowerCase().includes(classSearch.toLowerCase()) ||
                            c.room_number.toLowerCase().includes(classSearch.toLowerCase());
      const matchesLevel = selectedLevelFilter === 'ALL' || c.level_name === selectedLevelFilter || c.level === selectedLevelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [schoolClassesAscending, classSearch, selectedLevelFilter]);

  // -------------------------------------------------------------
  // Class Form State (Ascending, Multi-Streams, Subject-Teacher Mapping)
  // -------------------------------------------------------------
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [classGradeLevel, setClassGradeLevel] = useState('');
  const [classStream, setClassStream] = useState('A');
  const [classCapacity, setClassCapacity] = useState<number>(45);
  const [classTeacherId, setClassTeacherId] = useState<string>('');
  const [classRoomNum, setClassRoomNum] = useState('');
  const [classNextTargetId, setClassNextTargetId] = useState<string>('');
  const [classSubjectTeachers, setClassSubjectTeachers] = useState<Record<string, { enabled: boolean; teacher_id: string }>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available grades for selected level
  const activeLevelGrades = useMemo(() => {
    const found = enabledLevels.find(l => l.name === classLevelId || l.id === classLevelId);
    return found?.grades || ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Senior 1', 'Senior 2', 'Senior 3'];
  }, [enabledLevels, classLevelId]);

  // Subjects available for this education level
  const levelSubjects = useMemo(() => {
    return subjects
      .filter(s => s.school_id === activeSchool.id)
      .filter(s => !s.level_name || s.level_name === 'All Levels' || s.level_name === classLevelId);
  }, [subjects, activeSchool.id, classLevelId]);

  // Stream Presets
  const streamPresets = ['A', 'B', 'C', 'D', 'E', 'PCM', 'MCB', 'PCB', 'HEG', 'MEG', 'Arts', 'General'];

  // Handlers for Classes
  const handleOpenCreateClass = () => {
    const defaultLevel = enabledLevels[0]?.name || 'Ordinary Level / O-Level';
    const foundLevel = enabledLevels.find(l => l.name === defaultLevel);
    const defaultGrade = foundLevel?.grades[0] || 'Senior 1';
    
    setEditingClassId(null);
    setClassLevelId(defaultLevel);
    setClassGradeLevel(defaultGrade);
    setClassStream('A');
    setClassName(`${defaultGrade} A`);
    setClassCapacity(45);
    setClassTeacherId('');
    setClassRoomNum(`Room ${schoolClassesAscending.length + 101}`);
    setClassNextTargetId('');
    
    // Initialize subject mappings with default enabled
    const initialMappings: Record<string, { enabled: boolean; teacher_id: string }> = {};
    const relevantSubs = subjects.filter(s => s.school_id === activeSchool.id);
    relevantSubs.forEach(s => {
      initialMappings[s.id] = { enabled: true, teacher_id: pureTeachers[0]?.id || '' };
    });
    setClassSubjectTeachers(initialMappings);

    setFeedbackMsg(null);
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClassId(cls.id);
    setClassName(cls.name);
    setClassLevelId(cls.level_name || cls.level || enabledLevels[0]?.name || 'Ordinary Level / O-Level');
    setClassGradeLevel(cls.grade_level || cls.name.replace(/ [A-Z]$/, ''));
    setClassStream(cls.stream);
    setClassCapacity(cls.capacity);
    setClassTeacherId(cls.class_teacher_id || '');
    setClassRoomNum(cls.room_number);
    setClassNextTargetId(cls.next_class_id || '');

    // Pre-populate existing teacher assignments for this class
    const existingMappings: Record<string, { enabled: boolean; teacher_id: string }> = {};
    const relevantSubs = subjects.filter(s => s.school_id === activeSchool.id);
    relevantSubs.forEach(s => {
      const isApplicable = !s.applicable_class_ids || s.applicable_class_ids.includes(cls.id);
      const asgn = teacherAssignments.find(a => a.class_id === cls.id && a.subject_id === s.id && a.school_id === activeSchool.id);
      existingMappings[s.id] = {
        enabled: isApplicable,
        teacher_id: asgn?.teacher_id || pureTeachers[0]?.id || ''
      };
    });
    setClassSubjectTeachers(existingMappings);

    setFeedbackMsg(null);
    setShowClassModal(true);
  };

  // Dynamic Class Name updater when grade or stream changes
  const handleGradeChange = (grade: string) => {
    setClassGradeLevel(grade);
    setClassName(`${grade} ${classStream}`.trim());
  };

  const handleStreamChange = (stream: string) => {
    setClassStream(stream);
    setClassName(`${classGradeLevel} ${stream}`.trim());
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    // Validate Class Teacher role strictly
    if (classTeacherId) {
      const teacherObj = availableUsers.find(u => u.id === classTeacherId);
      if (!teacherObj || teacherObj.role !== 'TEACHER') {
        setFeedbackMsg({ 
          type: 'error', 
          text: 'Constraint Violation: Only users with the TEACHER role can be appointed as a Class Teacher.' 
        });
        return;
      }
    }

    const teacherObj = pureTeachers.find(t => t.id === classTeacherId);
    const calculatedWeight = getGradeAscendingWeight(classGradeLevel || className, classStream);

    // Prepare Subject-Teacher Mappings
    const subjectTeacherMappings = Object.entries(classSubjectTeachers)
      .filter(([_, config]) => config.enabled && config.teacher_id)
      .map(([subId, config]) => ({
        subject_id: subId,
        teacher_id: config.teacher_id
      }));

    if (editingClassId) {
      const res = updateClass(
        editingClassId, 
        {
          name: className.trim(),
          level_name: classLevelId,
          level: classLevelId,
          grade_level: classGradeLevel.trim(),
          stream: classStream.trim() || 'A',
          order_index: calculatedWeight,
          next_class_id: classNextTargetId || undefined,
          capacity: Number(classCapacity),
          class_teacher_id: classTeacherId || undefined,
          class_teacher_name: teacherObj?.name || undefined,
          room_number: classRoomNum.trim() || 'Room 101'
        },
        subjectTeacherMappings
      );

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setTimeout(() => setShowClassModal(false), 900);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } else {
      const res = addClass(
        {
          name: className.trim(),
          level_name: classLevelId,
          level: classLevelId,
          grade_level: classGradeLevel.trim(),
          stream: classStream.trim() || 'A',
          order_index: calculatedWeight,
          next_class_id: classNextTargetId || undefined,
          capacity: Number(classCapacity),
          class_teacher_id: classTeacherId || undefined,
          class_teacher_name: teacherObj?.name || undefined,
          room_number: classRoomNum.trim() || 'Room 101'
        },
        subjectTeacherMappings
      );

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        triggerConfetti();
        setTimeout(() => setShowClassModal(false), 900);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    }
  };

  const handleDeleteClass = (clsId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This will also unassign associated teacher appointments.')) {
      const res = deleteClass(clsId);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // -------------------------------------------------------------
  // Deliberation & Annual Student Promotion State
  // -------------------------------------------------------------
  const [deliberationClassId, setDeliberationClassId] = useState<string>(schoolClassesAscending[0]?.id || '');
  const fixedDeliberationYear = activeSchool.active_academic_year || '2025-2026';
  const [passMarkThreshold, setPassMarkThreshold] = useState<number>(50);
  const [studentDecisions, setStudentDecisions] = useState<Record<string, {
    decision: 'PROMOTED' | 'RETAINED' | 'CONDITIONAL_PASS' | 'GRADUATED' | 'TRANSFERRED';
    target_class_id?: string;
    remarks?: string;
  }>>({});
  const [deliberationFeedback, setDeliberationFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenSpecialActionModal = (student: Student, actionType: 'PROMOTION' | 'DEMOTION' | 'DELETION') => {
    setSelectedStudentForAction(student);
    setSpecialActionType(actionType);
    setSpecialTargetClassId(actionType === 'PROMOTION' ? (nextAscendingClass?.id || '') : activeDeliberationClass?.id || '');
    setSpecialReason('');
    setSpecialNotes('');
    setSpecialFeedback(null);
    setActiveDropdownStudentId(null);
    setShowSpecialModal(true);
  };

  const handleConfirmSpecialAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAction) return;

    if (!specialReason.trim()) {
      setSpecialFeedback({ type: 'error', text: 'Please provide a justification for this administrative special case.' });
      return;
    }

    const targetCls = classes.find(c => c.id === specialTargetClassId);

    const res = recordSpecialCase({
      student_id: selectedStudentForAction.id,
      student_name: `${selectedStudentForAction.first_name} ${selectedStudentForAction.last_name}`,
      student_reg: selectedStudentForAction.registration_number,
      gender: selectedStudentForAction.gender,
      date_of_birth: selectedStudentForAction.date_of_birth,
      former_class_id: selectedStudentForAction.class_id,
      former_class_name: selectedStudentForAction.class_name || activeDeliberationClass?.name || 'Class',
      new_class_id: specialActionType !== 'DELETION' ? targetCls?.id : undefined,
      new_class_name: specialActionType !== 'DELETION' ? targetCls?.name : undefined,
      action_type: specialActionType,
      reason: specialReason.trim(),
      administrative_notes: specialNotes.trim(),
      academic_year: fixedDeliberationYear,
      recorded_by_id: currentUser.id,
      recorded_by_name: currentUser.name,
      recorded_by_role: currentUser.role,
      guardian_name: selectedStudentForAction.guardian_name,
      guardian_phone: selectedStudentForAction.guardian_phone,
      guardian_email: selectedStudentForAction.guardian_email,
      address: selectedStudentForAction.address
    });

    if (res.success) {
      triggerConfetti();
      setSpecialFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setShowSpecialModal(false);
        setSelectedStudentForAction(null);
      }, 1200);
    }
  };

  const activeDeliberationClass = useMemo(() => {
    return classes.find(c => c.id === deliberationClassId);
  }, [classes, deliberationClassId]);

  const enrolledDeliberationStudents = useMemo(() => {
    return students.filter(s => s.class_id === deliberationClassId && s.school_id === activeSchool.id);
  }, [students, deliberationClassId, activeSchool.id]);

  // Determine next class in ascending sequence
  const nextAscendingClass = useMemo(() => {
    if (!activeDeliberationClass) return null;
    const currentIndex = schoolClassesAscending.findIndex(c => c.id === activeDeliberationClass.id);
    if (currentIndex >= 0 && currentIndex < schoolClassesAscending.length - 1) {
      // Find the next class that is in the next higher grade or same stream
      return schoolClassesAscending[currentIndex + 1];
    }
    return null;
  }, [activeDeliberationClass, schoolClassesAscending]);

  // Calculate Student Academic Averages (Official Annual Percentage)
  const studentAverageMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!activeDeliberationClass || enrolledDeliberationStudents.length === 0) return map;

    const activeSubjects = subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
    
    // Compute official annual report card metrics for all enrolled students
    const compiledCards = generateClassReportCards({
      selectedClass: activeDeliberationClass,
      students: enrolledDeliberationStudents,
      grades: grades,
      subjects: activeSubjects,
      term: 'Term 3',
      academicYear: fixedDeliberationYear,
      reportMode: 'ANNUAL',
      reportType: 'ANNUAL',
      school: activeSchool
    });

    compiledCards.forEach(card => {
      const pct = card.annualSummary?.annualAveragePercentage ?? card.overallAveragePercentage;
      map.set(card.student.id, Math.round(pct));
    });

    // Fallback for any student without a generated card
    enrolledDeliberationStudents.forEach(st => {
      if (!map.has(st.id)) {
        map.set(st.id, 0);
      }
    });

    return map;
  }, [activeDeliberationClass, enrolledDeliberationStudents, grades, subjects, activeSchool, fixedDeliberationYear]);

  // Strict Academic Law: Deliberation must only be allowed after Term 3 marks are finalized
  const hasTerm3GradesForClass = useMemo(() => {
    if (!deliberationClassId) return false;
    return grades.some(g => 
      g.class_id === deliberationClassId && 
      g.academic_year === fixedDeliberationYear && 
      (g.term?.toLowerCase().includes('3') || g.term?.toLowerCase().includes('three'))
    );
  }, [grades, deliberationClassId, fixedDeliberationYear]);

  // Auto Evaluate Deliberation for Selected Class
  const handleAutoEvaluateClass = () => {
    if (!hasTerm3GradesForClass) {
      alert('Deliberation Blocked: Deliberation and auto-evaluation are only allowed after Term 3 marks have been recorded. Term 3 marks are required to show the cumulative percentage and positions for the academic year.');
      return;
    }

    const isTerminalGrade = activeDeliberationClass?.name.toLowerCase().includes('senior 6') || 
                            activeDeliberationClass?.name.toLowerCase().includes('primary 6') ||
                            activeDeliberationClass?.name.toLowerCase().includes('p6') ||
                            activeDeliberationClass?.name.toLowerCase().includes('s6');

    const newDecisions: Record<string, {
      decision: 'PROMOTED' | 'RETAINED' | 'CONDITIONAL_PASS' | 'GRADUATED' | 'TRANSFERRED';
      target_class_id?: string;
      remarks?: string;
    }> = {};

    enrolledDeliberationStudents.forEach(st => {
      const avg = studentAverageMap.get(st.id) || 60;
      if (avg >= passMarkThreshold) {
        if (isTerminalGrade) {
          newDecisions[st.id] = {
            decision: 'GRADUATED',
            remarks: `Graduated with cumulative average of ${avg}%.`
          };
        } else {
          newDecisions[st.id] = {
            decision: 'PROMOTED',
            target_class_id: nextAscendingClass?.id || '',
            remarks: `Promoted to upper class (${avg}% average score).`
          };
        }
      } else {
        newDecisions[st.id] = {
          decision: 'RETAINED',
          target_class_id: activeDeliberationClass?.id,
          remarks: `Retained for academic reinforcement (${avg}% average score).`
        };
      }
    });

    setStudentDecisions(newDecisions);
    setDeliberationFeedback({
      type: 'success',
      text: `Auto-evaluation complete! Set promotion & retention status based on ${passMarkThreshold}% threshold.`
    });
  };

  const handleExecuteDeliberation = () => {
    if (!deliberationClassId) {
      alert('Please select a class for deliberation.');
      return;
    }

    if (!hasTerm3GradesForClass) {
      alert('Deliberation Blocked: Deliberation and promotions are only allowed after Term 3 marks have been recorded. Term 3 marks are required to show the cumulative percentage and positions for the academic year.');
      return;
    }

    if (enrolledDeliberationStudents.length === 0) {
      alert('No students currently enrolled in this class to deliberate.');
      return;
    }

    const decisionsList = enrolledDeliberationStudents.map(st => {
      const cur = studentDecisions[st.id] || {
        decision: 'PROMOTED',
        target_class_id: nextAscendingClass?.id,
        remarks: 'Promoted to upper class.'
      };

      const targetCls = classes.find(c => c.id === cur.target_class_id);

      return {
        student_id: st.id,
        decision: cur.decision,
        target_class_id: cur.target_class_id,
        target_class_name: targetCls?.name,
        deliberation_remarks: cur.remarks
      };
    });

    const res = executeDeliberationPromotion({
      classId: deliberationClassId,
      academicYear: fixedDeliberationYear,
      decisions: decisionsList
    });

    if (res.success) {
      setDeliberationFeedback({ type: 'success', text: res.message });
      triggerConfetti();
    } else {
      setDeliberationFeedback({ type: 'error', text: res.message });
    }
  };

  // -------------------------------------------------------------
  // Subject Form State & Handlers
  // -------------------------------------------------------------
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDept, setSubDept] = useState('Sciences');
  const [subLevelName, setSubLevelName] = useState('All Levels');
  const [subCredits, setSubCredits] = useState<number>(3);
  const [subPeriodsPerWeek, setSubPeriodsPerWeek] = useState<number>(4);
  const [subPassMark, setSubPassMark] = useState<number>(50);
  const [subApplicableClasses, setSubApplicableClasses] = useState<string[]>([]);

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => s.school_id === activeSchool.id)
      .filter(s => {
        return s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
               s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
               s.department.toLowerCase().includes(subjectSearch.toLowerCase());
      });
  }, [subjects, activeSchool.id, subjectSearch]);

  const handleOpenCreateSubject = () => {
    setEditingSubjectId(null);
    setSubName('');
    setSubCode('');
    setSubDept('Sciences');
    setSubLevelName('All Levels');
    setSubCredits(3);
    setSubPeriodsPerWeek(4);
    setSubPassMark(50);
    setSubApplicableClasses(classes.filter(c => c.school_id === activeSchool.id).map(c => c.id));
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setSubName(sub.name);
    setSubCode(sub.code);
    setSubDept(sub.department);
    setSubLevelName(sub.level_name || 'All Levels');
    setSubCredits(sub.credits);
    setSubPeriodsPerWeek(sub.periods_per_week || sub.credits || 4);
    setSubPassMark(sub.pass_mark || 50);
    setSubApplicableClasses(sub.applicable_class_ids || classes.filter(c => c.school_id === activeSchool.id).map(c => c.id));
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubjectId) {
      const res = updateSubject(editingSubjectId, {
        name: subName.trim(),
        code: subCode.trim().toUpperCase(),
        department: subDept,
        level_name: subLevelName,
        credits: Number(subCredits),
        periods_per_week: Number(subPeriodsPerWeek),
        pass_mark: Number(subPassMark),
        applicable_class_ids: subApplicableClasses
      });
      if (res.success) {
        setShowSubjectModal(false);
      }
    } else {
      const res = addSubject({
        name: subName.trim(),
        code: subCode.trim().toUpperCase(),
        department: subDept,
        level_name: subLevelName,
        credits: Number(subCredits),
        periods_per_week: Number(subPeriodsPerWeek),
        pass_mark: Number(subPassMark),
        applicable_class_ids: subApplicableClasses
      });
      if (res.success) {
        triggerConfetti();
        setShowSubjectModal(false);
      }
    }
  };

  const handleDeleteSubject = (subId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? All teacher appointments for this subject will be cleared.')) {
      deleteSubject(subId);
    }
  };

  // -------------------------------------------------------------
  // Teacher Appointments Tab Matrix
  // -------------------------------------------------------------
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointTeacherId, setAppointTeacherId] = useState('');
  const [appointClassId, setAppointClassId] = useState('');
  const [appointSubjectId, setAppointSubjectId] = useState('');
  const [appointmentFeedback, setAppointmentFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredAppointments = useMemo(() => {
    return teacherAssignments
      .filter(a => a.school_id === activeSchool.id)
      .filter(a => {
        return a.teacher_name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
               a.subject_name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
               a.class_name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
               a.level_name.toLowerCase().includes(appointmentSearch.toLowerCase());
      });
  }, [teacherAssignments, activeSchool.id, appointmentSearch]);

  const handleOpenAppointmentModal = (prefillTeacherId?: string, prefillClassId?: string) => {
    setAppointTeacherId(prefillTeacherId || pureTeachers[0]?.id || '');
    setAppointClassId(prefillClassId || schoolClassesAscending[0]?.id || '');
    setAppointSubjectId(subjects.filter(s => s.school_id === activeSchool.id)[0]?.id || '');
    setAppointmentFeedback(null);
    setShowAppointmentModal(true);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentFeedback(null);

    const res = appointTeacherToSubject(appointTeacherId, appointSubjectId, appointClassId);
    if (res.success) {
      setAppointmentFeedback({ type: 'success', text: res.message });
      triggerConfetti();
      setTimeout(() => setShowAppointmentModal(false), 900);
    } else {
      setAppointmentFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRemoveAppointment = (assignmentId: string) => {
    if (window.confirm('Revoke this teacher appointment?')) {
      removeTeacherAssignment(assignmentId);
    }
  };

  // -------------------------------------------------------------
  // Terms & Academic Year
  // -------------------------------------------------------------
  const [termAcademicYear, setTermAcademicYear] = useState(activeSchool.active_academic_year || '2026');
  const [activeTermName, setActiveTermName] = useState(activeSchool.active_term || 'Term 1');
  const [termFeedback, setTermFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Register New Academic Year States
  const [newYearName, setNewYearName] = useState('');
  const [newYearTerms, setNewYearTerms] = useState<string[]>(['Term 1', 'Term 2', 'Term 3']);
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRegisterYear = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);
    if (!newYearName.trim()) {
      setRegFeedback({ type: 'error', text: 'Please enter a valid academic year name (e.g., 2025-2026).' });
      return;
    }
    if (newYearTerms.length === 0) {
      setRegFeedback({ type: 'error', text: 'An academic year must have at least one term.' });
      return;
    }
    const res = registerAcademicYear(newYearName.trim(), newYearTerms);
    if (res.success) {
      setRegFeedback({ type: 'success', text: res.message });
      setNewYearName('');
      triggerConfetti();
      setTimeout(() => setRegFeedback(null), 3500);
    } else {
      setRegFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSaveTerms = (e: React.FormEvent) => {
    e.preventDefault();
    setTermFeedback(null);
    const res = setSchoolTerms(termAcademicYear, activeTermName);
    if (res.success) {
      setTermFeedback({ type: 'success', text: res.message });
      triggerConfetti();
      setTimeout(() => setTermFeedback(null), 3500);
    } else {
      setTermFeedback({ type: 'error', text: res.message });
    }
  };

  // Handlers for Education Levels
  const handleToggleLevel = (lvl: SchoolEducationLevel) => {
    toggleEducationLevel(lvl.id, !lvl.is_enabled);
  };

  const handleCreateCustomLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const gradesArr = levelGrades.split(',').map(g => g.trim()).filter(Boolean);
    const res = addCustomEducationLevel({
      level_type: 'O_LEVEL',
      name: levelName.trim(),
      short_name: levelShortName.trim() || levelName.trim().slice(0, 8),
      description: levelDesc.trim(),
      order: schoolLevels.length + 1,
      is_enabled: true,
      grades: gradesArr.length > 0 ? gradesArr : ['Grade 1', 'Grade 2', 'Grade 3']
    });
    if (res.success) {
      setShowLevelModal(false);
      setLevelName('');
      setLevelShortName('');
      setLevelGrades('');
      setLevelDesc('');
      triggerConfetti();
    }
  };

  const isDirectorOrAdmin = currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DOS';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <School className="w-4 h-4" />
            <span>Academic Architecture, Progression & Faculty Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Ascending Classes, Curriculum & Annual Deliberation
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Create classes in strict ascending sequence, manage multi-stream branches, map subjects and appointed teachers directly, and conduct automated student deliberations for annual promotion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'CLASSES' && (
            <button
              onClick={handleOpenCreateClass}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ascending Class</span>
            </button>
          )}

          {activeTab === 'SUBJECTS' && (
            <button
              onClick={handleOpenCreateSubject}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          )}

          {activeTab === 'DELIBERATION' && (
            <button
              onClick={handleAutoEvaluateClass}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Evaluate Promotion ({passMarkThreshold}%)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CLASSES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'CLASSES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Classes & Streams ({schoolClassesAscending.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'SUBJECTS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Subjects & Curriculum ({subjects.filter(s => s.school_id === activeSchool.id).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEACHER_APPOINTMENTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'TEACHER_APPOINTMENTS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>3. Teacher Appointments ({teacherAssignments.filter(a => a.school_id === activeSchool.id).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIBERATION')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'DELIBERATION'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>4. Deliberation & Promotion</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono border border-teal-800">
            Year-End
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SPECIAL_CASES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'SPECIAL_CASES'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>5. Special Cases Registry ({specialCases.filter(sc => sc.school_id === activeSchool.id && sc.status === 'ACTIVE_SPECIAL_CASE').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LEVELS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'LEVELS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>5. Education Levels ({enabledLevels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TERMS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'TERMS'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>6. Academic Year & Term</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CLASSES & STREAMS (ASCENDING ORDER, MULTI-STREAM & TEACHER ALLOCATION)
          ========================================================================= */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-4">
          
          {/* Rules & Guidance Callout */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-xs text-blue-200">
                <strong>Ascending Progression Architecture:</strong> Classes are strictly sorted in educational ascending order (Nursery → P1-P6 → S1-S6). Stream sections (A, B, C, etc.) are indexed sequentially so student promotion flows cleanly from year to year.
              </div>
            </div>
            <div className="text-[11px] font-mono text-blue-300 shrink-0 hidden md:block">
              {pureTeachers.length} Academic Teachers Available
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search class, stream, room..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedLevelFilter}
                  onChange={e => setSelectedLevelFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Education Levels</option>
                  {enabledLevels.map(lvl => (
                    <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredClasses.length}</strong> of {schoolClassesAscending.length} classes
            </div>
          </div>

          {/* Classes Grid */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Classes Registered Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Register classes in ascending order and appoint your teachers to subjects to enable automated conflict-free timetable scheduling.
              </p>
              <button
                onClick={handleOpenCreateClass}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                Create First Ascending Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls, idx) => {
                const enrolled = students.filter(s => s.class_id === cls.id).length;
                const capacityPct = Math.min(100, Math.round((enrolled / (cls.capacity || 45)) * 100));
                const classAssignments = teacherAssignments.filter(a => a.class_id === cls.id && a.school_id === activeSchool.id);
                const nextTargetCls = classes.find(c => c.id === cls.next_class_id);

                return (
                  <div key={cls.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Seq #{idx + 1}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {cls.level_name || cls.level || 'General'}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                            <span>{cls.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                              Stream {cls.stream}
                            </span>
                          </h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditClass(cls)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Edit Class & Curriculum"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                        <div className="flex items-center justify-between">
                          <span>Room:</span>
                          <span className="font-semibold text-slate-200">{cls.room_number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Class Teacher:</span>
                          <span className={`font-semibold ${cls.class_teacher_name ? 'text-amber-300 font-bold' : 'text-slate-500 italic'}`}>
                            {cls.class_teacher_name || 'Not appointed'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Subject Teachers:</span>
                          <span className="font-semibold text-indigo-300">{classAssignments.length} subjects mapped</span>
                        </div>
                        {nextTargetCls && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                            <span>Next Promotion Target:</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{nextTargetCls.name}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Enrollment</span>
                          <span className="font-mono text-white">
                            <strong>{enrolled}</strong> / {cls.capacity} students
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${capacityPct >= 95 ? 'bg-rose-500' : capacityPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('TEACHER_APPOINTMENTS');
                          setAppointmentSearch(cls.name);
                        }}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Staff Matrix</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40 cursor-pointer"
                      >
                        Edit Curriculum & Staff
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SUBJECTS & CURRICULUM
          ========================================================================= */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search subject by name, code, dept..."
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="text-xs text-slate-400">
              Periods configured here are used directly by the automated Timetable Engine without manual typing.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map(sub => {
              const applicableCount = sub.applicable_class_ids ? sub.applicable_class_ids.length : classes.filter(c => c.school_id === activeSchool.id).length;
              const assignedTeachers = teacherAssignments.filter(a => a.subject_id === sub.id && a.school_id === activeSchool.id);

              return (
                <div key={sub.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {sub.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{sub.department}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mt-1.5">{sub.name}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                      <div className="flex items-center justify-between">
                        <span>Applicable Level:</span>
                        <span className="font-semibold text-slate-200">{sub.level_name || 'All Levels'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Periods per Week:</span>
                        <span className="font-bold text-amber-400 font-mono">{sub.periods_per_week || sub.credits || 4} Periods / Wk</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pass Mark Threshold:</span>
                        <span className="font-semibold text-emerald-400 font-mono">{sub.pass_mark || 50}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Studying Classes:</span>
                        <span className="font-semibold text-purple-300">{applicableCount} Classes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <strong>{assignedTeachers.length}</strong> teachers appointed
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('TEACHER_APPOINTMENTS');
                        setAppointmentSearch(sub.name);
                      }}
                      className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Appoint Staff</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEACHER APPOINTMENTS MATRIX
          ========================================================================= */}
      {activeTab === 'TEACHER_APPOINTMENTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search teacher, subject, class, level..."
                value={appointmentSearch}
                onChange={e => setAppointmentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                <strong>{filteredAppointments.length}</strong> active appointments
              </span>
              <button
                onClick={() => handleOpenAppointmentModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Teacher Appointments Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Appoint registered academic teachers to their subjects in specific classes.
              </p>
              <button
                onClick={() => handleOpenAppointmentModal()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Appoint First Teacher
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                    <th className="p-3.5">Teacher Name</th>
                    <th className="p-3.5">Subject & Code</th>
                    <th className="p-3.5">Class & Stream</th>
                    <th className="p-3.5">Education Level</th>
                    <th className="p-3.5">Class Teacher Role</th>
                    <th className="p-3.5">Academic Session</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAppointments.map(asgn => {
                    const teacherObj = availableUsers.find(u => u.id === asgn.teacher_id);
                    const classObj = classes.find(c => c.id === asgn.class_id);
                    const isClassTeacher = classObj?.class_teacher_id === asgn.teacher_id;

                    return (
                      <tr key={asgn.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <PassportPhoto 
                              src={teacherObj?.avatar_url} 
                              alt={asgn.teacher_name}
                              shape="rounded"
                              border={false}
                              className="w-7 h-7 rounded-lg border border-slate-700" 
                            />
                            <div>
                              <div className="font-bold text-white">{asgn.teacher_name}</div>
                              <div className="text-[10px] text-slate-400">{teacherObj?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-200">{asgn.subject_name}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {asgn.subject_code}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-blue-300">
                          {asgn.class_name}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {asgn.level_name}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {isClassTeacher ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Yes ({asgn.class_name})
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Subject Teacher</span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-[10px] text-slate-400">
                          {asgn.academic_year} · {asgn.term}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleRemoveAppointment(asgn.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                            title="Revoke Appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: ANNUAL DELIBERATION & ASCENDING PROMOTION ENGINE
          ========================================================================= */}
      {activeTab === 'DELIBERATION' && (
        <div className="space-y-6">
          
          {/* Deliberation Controls Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Council & Deliberation Board</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  End-of-Year Student Deliberation & Progression
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluate class performance, promote successful students to upper ascending classes, and record repeaters.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAutoEvaluateClass}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-900/30 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Evaluate Class</span>
                </button>

                <button
                  onClick={handleExecuteDeliberation}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Execute Promotions</span>
                </button>
              </div>
            </div>

            {!hasTerm3GradesForClass && (
              <div className="p-4 bg-amber-950/40 border border-amber-800 rounded-2xl text-xs flex items-start gap-3 text-amber-200 mt-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">Deliberation & Promotions Blocked</h4>
                  <p className="mt-0.5 leading-relaxed text-slate-300">
                    Academic regulations state that deliberation and student promotions are only permitted after <strong>Term 3 marks have been finalized and recorded</strong>. Currently, no marks are registered for Term 3 in the selected class and academic year.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Source Class (Ascending Order)
                </label>
                <select
                  value={deliberationClassId}
                  onChange={e => {
                    setDeliberationClassId(e.target.value);
                    setStudentDecisions({});
                    setDeliberationFeedback(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
                >
                  {schoolClassesAscending.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.stream}) · {c.level_name || c.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Evaluation Year (Fixed Configuration)
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-amber-300 font-mono font-bold flex items-center justify-between">
                  <span>{fixedDeliberationYear}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-sans uppercase">
                    Fixed
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pass Mark Threshold (%)
                </label>
                <input
                  type="number"
                  min="30"
                  max="80"
                  value={passMarkThreshold}
                  onChange={e => setPassMarkThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 font-mono font-bold text-teal-400"
                />
              </div>
            </div>
          </div>

          {deliberationFeedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
              deliberationFeedback.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}>
              {deliberationFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="font-semibold">{deliberationFeedback.text}</span>
            </div>
          )}

          {/* Deliberation Student Roster */}
          {enrolledDeliberationStudents.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Students in Selected Class</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Enroll students in this class through Student Admissions before conducting deliberation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Reg Number</th>
                    <th className="p-3.5 text-center">Term Progress</th>
                    <th className="p-3.5 text-center">Annual Average</th>
                    <th className="p-3.5">Deliberation Decision</th>
                    <th className="p-3.5">Target Class</th>
                    <th className="p-3.5">Deliberation Remarks</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {enrolledDeliberationStudents.map(st => {
                    const studentGrades = grades.filter(g => g.student_id === st.id && g.academic_year === fixedDeliberationYear);
                    const hasT1 = studentGrades.some(g => g.term?.toLowerCase().includes('1') || g.term?.toLowerCase().includes('one'));
                    const hasT2 = studentGrades.some(g => g.term?.toLowerCase().includes('2') || g.term?.toLowerCase().includes('two'));
                    const hasT3 = studentGrades.some(g => g.term?.toLowerCase().includes('3') || g.term?.toLowerCase().includes('three'));
                    const hasAnyMarks = studentGrades.length > 0;

                    const avg = studentAverageMap.get(st.id) || 0;
                    const isPassing = avg >= passMarkThreshold;
                    const currentDecision = studentDecisions[st.id]?.decision || (isPassing ? 'PROMOTED' : 'RETAINED');
                    const targetClassId = studentDecisions[st.id]?.target_class_id || (currentDecision === 'PROMOTED' ? nextAscendingClass?.id : activeDeliberationClass?.id);
                    const remarks = studentDecisions[st.id]?.remarks || '';

                    return (
                      <tr key={st.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30">
                              {st.first_name[0]}{st.last_name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white">{st.first_name} {st.last_name}</div>
                              <div className="text-[10px] text-slate-400">{st.gender}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-300">
                          {st.registration_number}
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${hasT1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>T1</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${hasT2 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>T2</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${hasT3 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>T3</span>
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          {hasAnyMarks ? (
                            <span className={`px-2.5 py-1 rounded-lg font-bold font-mono text-xs ${
                              isPassing ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {avg}%
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-500 font-mono text-[11px] border border-slate-800">
                              No Marks
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={currentDecision}
                            onChange={e => {
                              const val = e.target.value as any;
                              setStudentDecisions(prev => ({
                                ...prev,
                                [st.id]: {
                                  ...prev[st.id],
                                  decision: val,
                                  target_class_id: val === 'PROMOTED' ? (nextAscendingClass?.id || '') : (activeDeliberationClass?.id || '')
                                }
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none ${
                              currentDecision === 'PROMOTED' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                              currentDecision === 'RETAINED' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                              currentDecision === 'GRADUATED' ? 'bg-indigo-950 text-indigo-300 border-indigo-700' :
                              'bg-amber-950 text-amber-300 border-amber-700'
                            }`}
                          >
                            <option value="PROMOTED">Promoted (To Next Class)</option>
                            <option value="RETAINED">Retained (Repeat Class)</option>
                            <option value="CONDITIONAL_PASS">Conditional Pass</option>
                            <option value="GRADUATED">Graduated (Completed Level)</option>
                            <option value="TRANSFERRED">Transferred School</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          {currentDecision === 'PROMOTED' ? (
                            <select
                              value={targetClassId}
                              onChange={e => {
                                setStudentDecisions(prev => ({
                                  ...prev,
                                  [st.id]: {
                                    ...prev[st.id],
                                    decision: currentDecision,
                                    target_class_id: e.target.value
                                  }
                                }));
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">-- Select Upper Class --</option>
                              {schoolClassesAscending.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.stream})
                                </option>
                              ))}
                            </select>
                          ) : currentDecision === 'GRADUATED' ? (
                            <span className="text-indigo-400 font-semibold text-xs flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              <span>Alumni / Graduate</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold text-xs">
                              Retained in {activeDeliberationClass?.name}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="Council notes..."
                            value={remarks}
                            onChange={e => {
                              const val = e.target.value;
                              setStudentDecisions(prev => ({
                                ...prev,
                                [st.id]: {
                                  ...prev[st.id],
                                  decision: currentDecision,
                                  target_class_id: targetClassId,
                                  remarks: val
                                }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                          />
                        </td>

                        <td className="p-3.5 text-right relative">
                          <div className="inline-block text-left">
                            <button
                              onClick={() => setActiveDropdownStudentId(activeDropdownStudentId === st.id ? null : st.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Special Administrative Action"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeDropdownStudentId === st.id && (
                              <div className="absolute right-0 mt-1 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-30 overflow-hidden py-1 divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => handleOpenSpecialActionModal(st, 'PROMOTION')}
                                  className="w-full text-left px-3.5 py-2 text-xs text-emerald-400 hover:bg-emerald-950/60 flex items-center gap-2 font-semibold"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Promote Student</span>
                                </button>
                                <button
                                  onClick={() => handleOpenSpecialActionModal(st, 'DEMOTION')}
                                  className="w-full text-left px-3.5 py-2 text-xs text-amber-400 hover:bg-amber-950/60 flex items-center gap-2 font-semibold"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Demote Student</span>
                                </button>
                                <button
                                  onClick={() => handleOpenSpecialActionModal(st, 'DELETION')}
                                  className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/60 flex items-center gap-2 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Delete Student</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SPECIAL CASES REGISTRY
          ========================================================================= */}
      {activeTab === 'SPECIAL_CASES' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Special Cases Administrative Audit Ledger</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono border border-rose-800">
                      {specialCases.filter(sc => sc.school_id === activeSchool.id).length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Records of Director/DOS special administrative actions (Promotions, Demotions, and Deletions with full reasons and recovery options).
                  </p>
                </div>
              </div>
            </div>

            {/* Special Cases Roster Cards */}
            {specialCases.filter(sc => sc.school_id === activeSchool.id).length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-slate-950/60 border border-slate-800/80 p-8">
                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Special Cases Recorded</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  All student progression follows standard annual deliberation. Special cases created via the 3-dots menu in Deliberation will be logged here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {specialCases
                  .filter(sc => sc.school_id === activeSchool.id)
                  .map(sc => {
                    const isExpanded = expandedSpecialCaseId === sc.id;
                    const isCurrentYear = sc.academic_year === fixedDeliberationYear;

                    return (
                      <div
                        key={sc.id}
                        className={`rounded-2xl border transition overflow-hidden ${
                          sc.action_type === 'PROMOTION' ? 'bg-emerald-950/30 border-emerald-800/60' :
                          sc.action_type === 'DEMOTION' ? 'bg-amber-950/30 border-amber-800/60' :
                          'bg-rose-950/30 border-rose-800/60'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedSpecialCaseId(isExpanded ? null : sc.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl border ${
                              sc.action_type === 'PROMOTION' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              sc.action_type === 'DEMOTION' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                              'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {sc.action_type === 'PROMOTION' ? <Sparkles className="w-4 h-4" /> :
                               sc.action_type === 'DEMOTION' ? <RotateCcw className="w-4 h-4" /> :
                               <Trash2 className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-white">{sc.student_name}</h4>
                                <span className="font-mono text-[10px] text-slate-400">({sc.student_reg})</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  sc.action_type === 'PROMOTION' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                  sc.action_type === 'DEMOTION' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}>
                                  {sc.action_type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>Class: <strong className="text-slate-200">{sc.former_class_name}</strong></span>
                                {sc.new_class_name && (
                                  <>
                                    <ArrowRight className="w-3 h-3 text-slate-500" />
                                    <span>Target: <strong className="text-teal-300">{sc.new_class_name}</strong></span>
                                  </>
                                )}
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-[11px]">Year: {sc.academic_year}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {sc.action_type === 'DELETION' && sc.status === 'ACTIVE_SPECIAL_CASE' && (
                              isCurrentYear ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const res = restoreSpecialCaseStudent(sc.id);
                                    if (res.success) {
                                      triggerConfetti();
                                      alert(res.message);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Retrieve Student</span>
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-500 text-[10px] font-mono border border-slate-800">
                                  Past Academic Year (Must Re-register)
                                </span>
                              )
                            )}

                            {sc.status === 'RESTORED' && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Restored to Roster</span>
                              </span>
                            )}

                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Expandable Details Accordion */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-3 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason & Academic Justification</span>
                                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                                  {sc.reason}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Administrative Notes / Ref</span>
                                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-mono">
                                  {sc.administrative_notes || 'None recorded'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                              <div>
                                Authorized by: <strong className="text-white">{sc.recorded_by_name}</strong> ({sc.recorded_by_role})
                              </div>
                              <div>
                                Guardian: <strong className="text-slate-300">{sc.guardian_name || 'N/A'}</strong> ({sc.guardian_phone || 'N/A'})
                              </div>
                              <div>
                                Recorded Date: <span className="font-mono">{new Date(sc.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: EDUCATION LEVELS
          ========================================================================= */}
      {activeTab === 'LEVELS' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Institutional Education Levels Setup</h3>
                <p className="text-xs text-slate-400">
                  Schools create and enable only the educational tiers they offer before registering classes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLevelModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Custom Level</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolLevels.map((lvl) => {
              const levelClasses = classes.filter(
                c => c.school_id === activeSchool.id && (c.level_name === lvl.name || c.level === lvl.name)
              );
              const totalStudents = students.filter(s => s.school_id === activeSchool.id && levelClasses.some(c => c.id === s.class_id)).length;

              return (
                <div 
                  key={lvl.id} 
                  className={`p-5 rounded-2xl border transition relative ${
                    lvl.is_enabled 
                      ? 'bg-slate-900/90 border-slate-700 shadow-xl' 
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {lvl.short_name}
                        </span>
                        <h4 className="text-base font-bold text-white">{lvl.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{lvl.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleLevel(lvl)}
                      title={lvl.is_enabled ? 'Disable Level for School' : 'Enable Level for School'}
                      className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        lvl.is_enabled 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {lvl.is_enabled ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Disabled</span>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span><strong>{levelClasses.length}</strong> Classes</span>
                      <span><strong>{totalStudents}</strong> Students</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {lvl.grades.map(g => (
                        <span key={g} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ACADEMIC YEAR & TERM (DIRECTOR EXCLUSIVE)
          ========================================================================= */}
      {activeTab === 'TERMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Panel 1: Register New Academic Year */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Plus className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Register Academic Year</h3>
                <p className="text-xs text-slate-400">Configure new operational years and terms.</p>
              </div>
            </div>

            {regFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                regFeedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{regFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleRegisterYear} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Year Name *
                </label>
                <input
                  type="text"
                  value={newYearName}
                  onChange={e => setNewYearName(e.target.value)}
                  disabled={!isDirectorOrAdmin}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 disabled:opacity-60 font-mono"
                  placeholder="e.g., 2025-2026 or 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Terms for this Year
                </label>
                <div className="space-y-2">
                  {['Term 1', 'Term 2', 'Term 3'].map(term => {
                    const exists = newYearTerms.includes(term);
                    return (
                      <label key={term} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 hover:bg-slate-950/80 transition">
                        <input
                          type="checkbox"
                          checked={exists}
                          disabled={!isDirectorOrAdmin}
                          onChange={() => {
                            if (exists) {
                              setNewYearTerms(prev => prev.filter(t => t !== term));
                            } else {
                              setNewYearTerms(prev => [...prev, term]);
                            }
                          }}
                          className="rounded border-slate-800 text-teal-500 focus:ring-teal-500"
                        />
                        <span>{term}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {isDirectorOrAdmin ? (
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-xl shadow-teal-900/30 cursor-pointer transition"
                >
                  Register Year & Terms
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 text-center text-xs text-slate-400 border border-slate-800 italic">
                  Only the School Director has authority to register operational years.
                </div>
              )}
            </form>
          </div>

          {/* Panel 2: Set Active Academic Session */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Active Operational Term</h3>
                <p className="text-xs text-slate-400">Activate term for current academic marks and billing.</p>
              </div>
            </div>

            {termFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                termFeedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{termFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTerms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Active Academic Year
                </label>
                <select
                  value={termAcademicYear}
                  onChange={e => {
                    const selectedYear = e.target.value;
                    setTermAcademicYear(selectedYear);
                    // Reset selected term to first term of selected year if available
                    const config = registeredAcademicYears.find(y => y.academic_year === selectedYear);
                    if (config && config.terms && config.terms.length > 0) {
                      setActiveTermName(config.terms[0]);
                    }
                  }}
                  disabled={!isDirectorOrAdmin}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 disabled:opacity-60 font-semibold"
                >
                  {registeredAcademicYears.map(yr => (
                    <option key={yr.academic_year} value={yr.academic_year}>
                      {yr.academic_year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Active Term
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(registeredAcademicYears.find(y => y.academic_year === termAcademicYear)?.terms || ['Term 1', 'Term 2', 'Term 3']).map(term => (
                    <button
                      type="button"
                      key={term}
                      disabled={!isDirectorOrAdmin}
                      onClick={() => setActiveTermName(term)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        activeTermName === term
                          ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/30'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      } disabled:opacity-60`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Current Operational State:</span>
                </div>
                <div className="font-mono text-amber-300 font-bold">
                  {activeSchool.name} · Year {activeSchool.active_academic_year} · {activeSchool.active_term}
                </div>
                <div className="pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Term transitions automatically reset student discipline marks to <strong>40/40</strong> while preserving historical infraction logs.</span>
                </div>
              </div>

              {isDirectorOrAdmin ? (
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-xl shadow-amber-900/30 cursor-pointer transition"
                >
                  Apply Active Term Update
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 text-center text-xs text-slate-400 border border-slate-800 italic">
                  Only the School Director has authority to commit changes to academic terms.
                </div>
              )}
            </form>
          </div>

          {/* List of Registered Academic Years */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Registered School Academic Lifecycles</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {registeredAcademicYears.map(yr => (
                <div key={yr.academic_year} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{yr.academic_year}</span>
                    {activeSchool.active_academic_year === yr.academic_year && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {yr.terms.map(t => (
                      <span key={t} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT CLASS (ASCENDING, MULTI-STREAM & DIRECT SUBJECT TEACHER ALLOCATIONS)
          ========================================================================= */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingClassId ? 'Edit Ascending Class & Curriculum' : 'Register New Ascending Class'}
                </h3>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveClass} className="space-y-4">
              
              {/* Education Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Education Level *
                </label>
                <select
                  value={classLevelId}
                  onChange={e => {
                    const newLvl = e.target.value;
                    setClassLevelId(newLvl);
                    const lvlObj = enabledLevels.find(l => l.name === newLvl);
                    const defGrade = lvlObj?.grades[0] || 'Grade 1';
                    setClassGradeLevel(defGrade);
                    setClassName(`${defGrade} ${classStream}`.trim());
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {enabledLevels.map(lvl => (
                    <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                  ))}
                </select>
              </div>

              {/* Grade Level & Multi-Stream Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Grade Progression Level *
                  </label>
                  <select
                    value={classGradeLevel}
                    onChange={e => handleGradeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                    required
                  >
                    {activeLevelGrades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Stream / Section (e.g. A, B, C, PCM, Arts) *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. A, B, C, PCM, MCB"
                      value={classStream}
                      onChange={e => handleStreamChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 uppercase font-mono font-bold"
                      required
                    />
                    <div className="flex flex-wrap gap-1">
                      {streamPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleStreamChange(preset)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                            classStream.toUpperCase() === preset 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Name & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Class Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Primary 5 A, Senior 1 B"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Room Number / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Block A · Room 102"
                    value={classRoomNum}
                    onChange={e => setClassRoomNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Capacity & Next Target Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Student Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={classCapacity}
                    onChange={e => setClassCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Next Progression Target (For Deliberation)
                  </label>
                  <select
                    value={classNextTargetId}
                    onChange={e => setClassNextTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Auto-derive from Ascending Order --</option>
                    {schoolClassesAscending
                      .filter(c => c.id !== editingClassId)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.stream})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Strict Class Teacher Selection (Role: TEACHER Only, 1 per class) */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Appoint Designated Class Teacher (Strictly 1 Teacher)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50 font-mono">
                    TEACHER Role Enforced
                  </span>
                </div>
                
                <select
                  value={classTeacherId}
                  onChange={e => setClassTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- No Class Teacher Appointed --</option>
                  {pureTeachers.map(t => {
                    const otherClass = classes.find(c => c.class_teacher_id === t.id && c.id !== editingClassId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email}) {otherClass ? `[Already Class Teacher for ${otherClass.name}]` : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400">
                  Except users who are assigned as teachers, others are not allowed to be assigned as class teachers. Only one teacher is considered to be the class teacher.
                </p>
              </div>

              {/* Class Curriculum & Subject Teachers Direct Assignment */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>Class Curriculum & Appointed Subject Teachers</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Appoint the teachers who will teach each subject in this class. These assignments directly power conflict-free timetable generation!
                    </p>
                  </div>
                </div>

                {levelSubjects.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900 text-center text-xs text-slate-400 border border-slate-800">
                    No subjects registered for this education level yet. Add subjects in the Subjects tab.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {levelSubjects.map(sub => {
                      const mapping = classSubjectTeachers[sub.id] || { enabled: true, teacher_id: pureTeachers[0]?.id || '' };

                      return (
                        <div key={sub.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-xs text-white font-semibold cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={mapping.enabled}
                              onChange={e => {
                                setClassSubjectTeachers(prev => ({
                                  ...prev,
                                  [sub.id]: {
                                    ...mapping,
                                    enabled: e.target.checked
                                  }
                                }));
                              }}
                              className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{sub.name}</span>
                            <span className="text-[10px] font-mono text-purple-300">({sub.code})</span>
                          </label>

                          {mapping.enabled && (
                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                              <span className="text-[10px] text-slate-400 shrink-0">Teacher:</span>
                              <select
                                value={mapping.teacher_id}
                                onChange={e => {
                                  setClassSubjectTeachers(prev => ({
                                    ...prev,
                                    [sub.id]: {
                                      ...mapping,
                                      teacher_id: e.target.value
                                    }
                                  }));
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                              >
                                <option value="">-- Unassigned --</option>
                                {allTeachingStaff.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} ({t.role})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  {editingClassId ? 'Save Class & Appointments' : 'Create Class & Appoint Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT SUBJECT
          ========================================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  {editingSubjectId ? 'Edit Subject Details' : 'Add Subject to Curriculum'}
                </h3>
              </div>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Kinyarwanda, Physics"
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAT101"
                    value={subCode}
                    onChange={e => setSubCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department
                  </label>
                  <select
                    value={subDept}
                    onChange={e => setSubDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities & Social</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Technical & ICT">Technical & ICT</option>
                    <option value="Early Learning">Early Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Applicable Education Level
                  </label>
                  <select
                    value={subLevelName}
                    onChange={e => setSubLevelName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="All Levels">All Levels</option>
                    {enabledLevels.map(lvl => (
                      <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Periods / Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={subPeriodsPerWeek}
                    onChange={e => setSubPeriodsPerWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-bold font-mono text-amber-400"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">For Auto-Timetable</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Credits / Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={subCredits}
                    onChange={e => setSubCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Academic weight</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pass Mark (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={subPassMark}
                    onChange={e => setSubPassMark(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-emerald-400"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Passing threshold</p>
                </div>
              </div>

              {/* Select Studying Classes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Applicable Classes for this Subject
                </label>
                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  {schoolClassesAscending.map(c => {
                    const isChecked = subApplicableClasses.includes(c.id);
                    return (
                      <label 
                        key={c.id} 
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 text-xs text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSubApplicableClasses(prev => [...prev, c.id]);
                            } else {
                              setSubApplicableClasses(prev => prev.filter(id => id !== c.id));
                            }
                          }}
                          className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-[10px] text-slate-500">({c.level_name || c.level})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  {editingSubjectId ? 'Save Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APPOINT TEACHER TO SUBJECT IN CLASS & LEVEL
          ========================================================================= */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Appoint Teacher to Subject & Class
                </h3>
              </div>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {appointmentFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                appointmentFeedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                {appointmentFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{appointmentFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Academic Teacher *
                </label>
                <select
                  value={appointTeacherId}
                  onChange={e => setAppointTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {allTeachingStaff.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email}) · {t.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Target Class (Ascending Order) *
                </label>
                <select
                  value={appointClassId}
                  onChange={e => setAppointClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {schoolClassesAscending.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.stream}) · {c.level_name || c.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Subject to Teach *
                </label>
                <select
                  value={appointSubjectId}
                  onChange={e => setAppointSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.filter(s => s.school_id === activeSchool.id).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) · {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-900/30"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CUSTOM EDUCATION LEVEL
          ========================================================================= */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Add Custom Institutional Education Level
                </h3>
              </div>
              <button
                onClick={() => setShowLevelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomLevel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Level Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Level (A-Level), TVET / Polytechnic"
                  value={levelName}
                  onChange={e => setLevelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Short Code / Abbreviation
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-LEVEL, TVET"
                  value={levelShortName}
                  onChange={e => setLevelShortName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Standard Grades List (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior 4, Senior 5, Senior 6"
                  value={levelGrades}
                  onChange={e => setLevelGrades(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Grades available when creating classes in this level.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of who studies this level..."
                  value={levelDesc}
                  onChange={e => setLevelDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-900/30"
                >
                  Create Education Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Special Administrative Action Form Modal */}
      {showSpecialModal && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Special Administrative Action
                  </h3>
                  <p className="text-xs text-slate-400">
                    Record Director/DOS exception into Special Cases
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSpecialModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedStudentForAction.first_name} {selectedStudentForAction.last_name}</h4>
                  <p className="text-xs text-slate-400 font-mono">Reg: {selectedStudentForAction.registration_number}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Current: {selectedStudentForAction.class_name || activeDeliberationClass?.name}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span>Guardian: {selectedStudentForAction.guardian_name} ({selectedStudentForAction.guardian_phone})</span>
                <span>DOB: {selectedStudentForAction.date_of_birth}</span>
              </div>
            </div>

            {specialFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                specialFeedback.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {specialFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{specialFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSpecialAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Action Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpecialActionType('PROMOTION')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      specialActionType === 'PROMOTION'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Promote
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialActionType('DEMOTION')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      specialActionType === 'DEMOTION'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Demote
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialActionType('DELETION')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      specialActionType === 'DELETION'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {specialActionType !== 'DELETION' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Progression Class *
                  </label>
                  <select
                    value={specialTargetClassId}
                    onChange={e => setSpecialTargetClassId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value="">-- Select Target Class --</option>
                    {schoolClassesAscending.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason & Academic Justification *
                </label>
                <textarea
                  rows={3}
                  value={specialReason}
                  onChange={e => setSpecialReason(e.target.value)}
                  placeholder="Explain why this special promotion, demotion, or deletion is being granted (e.g., Council decision, transfer request, medical waiver)..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrative Notes / Document Ref (Optional)
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Council Minutes Ref #2026/04"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSpecialModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-900/30 transition"
                >
                  Commit Special Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
