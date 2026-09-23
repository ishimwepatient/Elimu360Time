import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  User, 
  BookOpen, 
  Filter, 
  Trash2,
  Sparkles,
  Printer,
  Download,
  Settings,
  Layers,
  Check,
  Coffee,
  Utensils,
  Sun,
  Shield,
  Briefcase,
  Users,
  Grid,
  ListFilter,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Archive,
  FolderDown
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { 
  TimetableSlot, 
  TimetableConfig, 
  BreakSlotConfig, 
  ClassRoom, 
  Subject 
} from '../../types';
import { 
  computeDailyTimeline, 
  DAYS_OF_WEEK, 
  DEFAULT_TIMETABLE_CONFIG 
} from '../../utils/timetableEngine';
import {
  exportSingleTimetablePdf,
  exportBulkMasterTimetablePdf,
  exportBulkMasterTimetableZipPackage
} from '../../utils/timetablePdfExporter';

export const TimetableManagement: React.FC = () => {
  const { 
    activeSchool, 
    currentUser,
    classes, 
    subjects, 
    availableUsers, 
    timetable, 
    timetableConfig,
    updateTimetableConfig,
    generateMasterTimetable,
    clearTimetableSlots,
    teacherAssignments,
    triggerConfetti,
    addOrUpdateTimetableSlot,
    deleteTimetableSlot,
    refreshDataFromCloud,
    cloudSyncState
  } = useElimu();

  // Role permissions check
  const isDirectorOrDOS = currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'DOS' || currentUser.role === 'SUPER_ADMIN';
  const isTeacher = currentUser.role === 'TEACHER';

  // Active School Classes & Teachers (strictly scoped to active school for multi-tenant isolation)
  const schoolClasses = useMemo(() => {
    const directMatches = classes.filter(c => c.school_id === activeSchool.id);
    if (directMatches.length > 0) return directMatches;
    return classes.filter(c => !c.school_id || c.school_id === 'all');
  }, [classes, activeSchool.id]);

  const schoolTeachers = useMemo(() => {
    const allEligible = availableUsers.filter(u => u.role === 'TEACHER');
    const directMatches = allEligible.filter(u => u.school_id === activeSchool.id || u.school_id === 'all');
    return directMatches.length > 0 ? directMatches : allEligible;
  }, [availableUsers, activeSchool.id]);

  // Education levels present in school
  const schoolLevels = useMemo(() => {
    const levelSet = new Set<string>();
    schoolClasses.forEach(c => {
      if (c.level_name) levelSet.add(c.level_name);
      else if (c.level) levelSet.add(c.level);
    });
    return Array.from(levelSet);
  }, [schoolClasses]);

  // Main Tab View
  // TEACHER defaults to 'MY_SCHEDULE'
  // DIRECTOR/DOS defaults to 'CLASS_VIEW' or 'MASTER_MATRIX'
  const [activeTab, setActiveTab] = useState<'CLASS_VIEW' | 'MASTER_MATRIX' | 'TEACHER_SCHEDULE' | 'MY_SCHEDULE'>(
    isTeacher ? 'MY_SCHEDULE' : 'CLASS_VIEW'
  );

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>(schoolClasses[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    isTeacher ? currentUser.id : (schoolTeachers[0]?.id || '')
  );
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Generator & Breaks Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [localConfig, setLocalConfig] = useState<TimetableConfig>(timetableConfig || DEFAULT_TIMETABLE_CONFIG);
  const [generationScope, setGenerationScope] = useState<'ALL_SCHOOL' | 'LEVEL' | 'CLASS'>('ALL_SCHOOL');
  const [scopeLevelName, setScopeLevelName] = useState<string>(schoolLevels[0] || 'Ordinary Level / O-Level');
  const [scopeClassId, setScopeClassId] = useState<string>(schoolClasses[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationFeedback, setGenerationFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string[];
  } | null>(null);

  // Director / DOS Permission Modal State (Strict collision-prevention protocol)
  const [showDirectorPermissionModal, setShowDirectorPermissionModal] = useState<boolean>(false);
  const [permissionAcknowledged, setPermissionAcknowledged] = useState<boolean>(false);
  const [permissionOfficialName, setPermissionOfficialName] = useState<string>(currentUser.name);
  const [permissionRole, setPermissionRole] = useState<string>(
    currentUser.role === 'DOS' 
      ? 'Director of Studies (DOS)' 
      : currentUser.role === 'SCHOOL_ADMIN' 
        ? 'Head Teacher / School Director' 
        : 'Authorized Academic Administrator'
  );
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);

  // Manual Slot Creation & Edit Modal State
  const [editingSlot, setEditingSlot] = useState<{
    isOpen: boolean;
    slotId?: string;
    day: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    room: string;
    isSpecial: boolean;
  } | null>(null);
  const [slotFormError, setSlotFormError] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Daily Timeline (Periods + Breaks)
  const dailyTimeline = useMemo(() => {
    return computeDailyTimeline(timetableConfig || DEFAULT_TIMETABLE_CONFIG);
  }, [timetableConfig]);

  // Filtered Slots strictly scoped to Active School (Each school has its own independent timetable)
  const schoolSlots = useMemo(() => {
    const activeTerm = activeSchool.active_term || 'Term 1';
    const schoolMatches = timetable.filter(s => s.school_id === activeSchool.id);

    // Filter by current term if present
    const termMatches = schoolMatches.filter(s => {
      if (!s.term) return true;
      if (s.term === activeTerm) return true;
      if (activeTerm.toLowerCase().includes(s.term.toLowerCase()) || s.term.toLowerCase().includes(activeTerm.toLowerCase())) return true;
      return false;
    });

    return termMatches.length > 0 ? termMatches : schoolMatches;
  }, [timetable, activeSchool.id, activeSchool.active_term]);

  // Selected Class details
  const selectedClass = useMemo(() => {
    return schoolClasses.find(c => c.id === selectedClassId) || schoolClasses[0];
  }, [schoolClasses, selectedClassId]);

  // Class Slots (matched by ID or class name for robust resilience)
  const classSlots = useMemo(() => {
    if (!selectedClass) return [];
    return schoolSlots.filter(s => s.class_id === selectedClass.id || s.class_name === selectedClass.name);
  }, [schoolSlots, selectedClass]);

  // Target Teacher object for schedule lookup
  const targetTeacher = useMemo(() => {
    const targetId = isTeacher && activeTab === 'MY_SCHEDULE' ? currentUser.id : selectedTeacherId;
    return availableUsers.find(u => u.id === targetId) || (isTeacher ? currentUser : schoolTeachers[0]);
  }, [isTeacher, activeTab, currentUser, selectedTeacherId, availableUsers, schoolTeachers]);

  // Teacher Slots (accurately matching across ID, name, teacherAssignments, and class teacher duties)
  const teacherSlots = useMemo(() => {
    if (!targetTeacher) return [];
    const tId = targetTeacher.id;
    const tName = (targetTeacher.name || '').trim().toLowerCase();
    const tEmail = (targetTeacher.email || '').trim().toLowerCase();

    // Map all (class_id + subject_id / code / name) keys appointed to this teacher
    const appointedClassSubjectKeys = new Set<string>();
    const classTeacherClassIds = new Set<string>();

    teacherAssignments.forEach(ta => {
      const isAssigned = ta.teacher_id === tId || 
        (ta.teacher_name && ta.teacher_name.trim().toLowerCase() === tName) ||
        (tEmail && ta.teacher_id === tEmail);
      if (isAssigned) {
        appointedClassSubjectKeys.add(`${ta.class_id}_${ta.subject_id}`);
        if (ta.subject_code) appointedClassSubjectKeys.add(`${ta.class_id}_code_${ta.subject_code.toLowerCase()}`);
        if (ta.subject_name) appointedClassSubjectKeys.add(`${ta.class_id}_name_${ta.subject_name.trim().toLowerCase()}`);
      }
    });

    schoolClasses.forEach(c => {
      if (
        c.class_teacher_id === tId ||
        (c.class_teacher_name && c.class_teacher_name.trim().toLowerCase() === tName)
      ) {
        classTeacherClassIds.add(c.id);
      }
    });

    return schoolSlots.filter(s => {
      // 1. Direct ID match
      if (s.teacher_id && (s.teacher_id === tId || (tEmail && s.teacher_id === tEmail))) {
        return true;
      }
      // 2. Direct Name match
      if (s.teacher_name && tName) {
        const slotName = s.teacher_name.trim().toLowerCase();
        if (slotName === tName || slotName.includes(tName) || tName.includes(slotName)) {
          return true;
        }
      }
      // 3. Match via Teacher Appointments (by class & subject)
      if (s.class_id && s.subject_id && appointedClassSubjectKeys.has(`${s.class_id}_${s.subject_id}`)) {
        return true;
      }
      if (s.class_id && s.subject_code && appointedClassSubjectKeys.has(`${s.class_id}_code_${s.subject_code.toLowerCase()}`)) {
        return true;
      }
      if (s.class_id && s.subject_name && appointedClassSubjectKeys.has(`${s.class_id}_name_${s.subject_name.trim().toLowerCase()}`)) {
        return true;
      }
      // 4. Class teacher homeroom / assembly in their appointed class
      if (s.class_id && classTeacherClassIds.has(s.class_id) && (s.is_special || s.subject_code === 'ASM' || s.subject_id === 'sub-assembly')) {
        return true;
      }

      return false;
    });
  }, [schoolSlots, targetTeacher, teacherAssignments, schoolClasses]);

  // Classes taught by logged-in teacher
  const teacherClasses = useMemo(() => {
    if (!isTeacher) return schoolClasses;
    const taughtClassIds = new Set(
      teacherAssignments
        .filter(ta => ta.school_id === activeSchool.id && ta.teacher_id === currentUser.id)
        .map(ta => ta.class_id)
    );
    // Also include classes where they are class teacher
    schoolClasses.forEach(c => {
      if (c.class_teacher_id === currentUser.id || c.class_teacher_name?.toLowerCase() === currentUser.name.toLowerCase()) {
        taughtClassIds.add(c.id);
      }
    });
    return schoolClasses.filter(c => taughtClassIds.has(c.id));
  }, [schoolClasses, teacherAssignments, activeSchool.id, currentUser, isTeacher]);

  // Conflict Diagnostics
  const conflictAudit = useMemo(() => {
    const conflicts: { teacherName: string; day: string; period: number; class1: string; class2: string }[] = [];
    for (let i = 0; i < schoolSlots.length; i++) {
      for (let j = i + 1; j < schoolSlots.length; j++) {
        const s1 = schoolSlots[i];
        const s2 = schoolSlots[j];
        if (
          s1.day_of_week === s2.day_of_week &&
          s1.period_number === s2.period_number &&
          s1.teacher_id &&
          s1.teacher_id === s2.teacher_id &&
          !s1.is_free &&
          !s2.is_free &&
          !s1.is_special &&
          !s2.is_special
        ) {
          conflicts.push({
            teacherName: s1.teacher_name,
            day: s1.day_of_week,
            period: s1.period_number || 1,
            class1: s1.class_name,
            class2: s2.class_name
          });
        }
      }
    }
    return conflicts;
  }, [schoolSlots]);

  // Handlers for Generation
  const handleOpenConfigModal = (initialScope: 'ALL_SCHOOL' | 'LEVEL' | 'CLASS' = 'ALL_SCHOOL') => {
    setLocalConfig(timetableConfig || DEFAULT_TIMETABLE_CONFIG);
    setGenerationScope(initialScope);
    if (initialScope === 'CLASS' && selectedClassId) {
      setScopeClassId(selectedClassId);
    }
    setGenerationFeedback(null);
    setShowConfigModal(true);
  };

  const handleUpdateBreak = (index: number, updates: Partial<BreakSlotConfig>) => {
    setLocalConfig(prev => {
      const newBreaks = [...prev.breaks];
      newBreaks[index] = { ...newBreaks[index], ...updates };
      return { ...prev, breaks: newBreaks };
    });
  };

  const handleAddCustomBreak = () => {
    const newBreak: BreakSlotConfig = {
      id: `brk-custom-${Date.now()}`,
      name: 'Custom Break Interval',
      duration_mins: 15,
      after_period: 4,
      type: 'CUSTOM',
      enabled: true
    };
    setLocalConfig(prev => ({
      ...prev,
      breaks: [...prev.breaks, newBreak]
    }));
  };

  const handleRemoveBreak = (index: number) => {
    setLocalConfig(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }));
  };

  const handleExecuteGenerate = () => {
    // If an existing timetable already exists for this school, Director/DOS permission is strictly required
    // to delete the old one entirely before generating the new conflict-free schedule.
    if (schoolSlots.length > 0) {
      setPermissionAcknowledged(false);
      setShowDirectorPermissionModal(true);
    } else {
      proceedWithGeneration({ 
        name: currentUser.name, 
        role: currentUser.role === 'DOS' ? 'Director of Studies (DOS)' : currentUser.role === 'SCHOOL_ADMIN' ? 'Head Teacher / School Director' : 'Academic Administrator'
      });
    }
  };

  const proceedWithGeneration = (authorizedBy?: { name: string; role: string }) => {
    setShowDirectorPermissionModal(false);
    setShowConfigModal(false);
    setIsGenerating(true);
    setGenerationFeedback(null);

    setTimeout(() => {
      try {
        const previousSlotCount = schoolSlots.length;
        const result = generateMasterTimetable(
          localConfig, 
          {
            target: generationScope,
            levelName: scopeLevelName,
            classId: scopeClassId
          },
          authorizedBy || { 
            name: permissionOfficialName || currentUser.name, 
            role: permissionRole || currentUser.role 
          }
        );

        if (result.success) {
          setGenerationFeedback({
            type: 'success',
            text: previousSlotCount > 0
              ? `Director/DOS Authorization Granted: Previous timetable (${previousSlotCount} slots) deleted entirely. Generated ${result.stats.totalSlotsCreated} fresh lesson periods for ${activeSchool.name} with ZERO collisions!`
              : `Generated ${result.stats.totalSlotsCreated} lesson periods across ${result.stats.classesScheduledCount} classes for ${activeSchool.name} with ZERO teacher collisions!`,
            details: [
              `Multi-Tenant Isolation: Strictly generated for ${activeSchool.name} (Other schools unaffected)`,
              `Clean Slate Guarantee: ${previousSlotCount} previous slots permanently deleted to prevent collisions`,
              `Curriculum Coverage: ${result.stats.coveragePercentage}% across ${result.stats.classesScheduledCount} classes`,
              `Zero Conflicts Verified: ${result.stats.teacherConflictsCount} teacher double-bookings`,
              `Authorized By: ${authorizedBy?.name || permissionOfficialName || currentUser.name} (${authorizedBy?.role || permissionRole || currentUser.role})`,
              `Break Schedule Applied: ${localConfig.breaks.filter(b => b.enabled).map(b => b.name).join(', ')}`
            ]
          });
          triggerConfetti();
          updateTimetableConfig(localConfig);
        } else {
          setGenerationFeedback({
            type: 'error',
            text: result.error || 'Timetable generation encountered conflicts.',
            details: result.stats?.diagnostics || []
          });
        }
      } catch (err: any) {
        setGenerationFeedback({
          type: 'error',
          text: 'An unexpected error occurred during timetable generation: ' + (err?.message || String(err))
        });
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  const handleClearCurrentScope = () => {
    setShowClearConfirmModal(true);
  };

  const confirmClearScope = () => {
    clearTimetableSlots({
      target: generationScope,
      levelName: scopeLevelName,
      classId: scopeClassId
    });
    setShowClearConfirmModal(false);
    setGenerationFeedback({
      type: 'success',
      text: `Timetable slots for ${activeSchool.name} (${generationScope === 'ALL_SCHOOL' ? 'entire school' : generationScope === 'LEVEL' ? scopeLevelName : 'selected class'}) cleared successfully.`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManualSync = async () => {
    setIsCloudSyncing(true);
    try {
      await refreshDataFromCloud(true);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleOpenCreateSlot = (day: string, periodNumber: number, startTime: string, endTime: string) => {
    const targetClass = selectedClass;
    const defaultSubject = subjects[0];
    const defaultTeacher = schoolTeachers[0];
    setSlotFormError(null);
    setEditingSlot({
      isOpen: true,
      day,
      periodNumber,
      startTime,
      endTime,
      classId: targetClass?.id || '',
      subjectId: defaultSubject?.id || '',
      teacherId: defaultTeacher?.id || '',
      room: targetClass?.room_number || 'Room 101',
      isSpecial: false,
    });
  };

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setSlotFormError(null);
    setEditingSlot({
      isOpen: true,
      slotId: slot.id,
      day: slot.day_of_week,
      periodNumber: slot.period_number || 1,
      startTime: slot.start_time,
      endTime: slot.end_time,
      classId: slot.class_id,
      subjectId: slot.subject_id,
      teacherId: slot.teacher_id,
      room: slot.room,
      isSpecial: !!slot.is_special,
    });
  };

  const handleSaveManualSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const targetClass = schoolClasses.find(c => c.id === editingSlot.classId) || selectedClass;
    const targetSubject = subjects.find(s => s.id === editingSlot.subjectId);
    const targetTeacher = availableUsers.find(u => u.id === editingSlot.teacherId);

    if (!targetClass || !targetSubject || !targetTeacher) {
      setSlotFormError('Please select a valid class, subject, and teacher.');
      return;
    }

    const slotPayload = {
      school_id: activeSchool.id,
      class_id: targetClass.id,
      class_name: targetClass.name,
      day_of_week: editingSlot.day as any,
      period_number: editingSlot.periodNumber,
      start_time: editingSlot.startTime,
      end_time: editingSlot.endTime,
      subject_id: targetSubject.id,
      subject_name: targetSubject.name,
      subject_code: targetSubject.code,
      teacher_id: targetTeacher.id,
      teacher_name: targetTeacher.name,
      room: editingSlot.room || targetClass.room_number || 'Room 101',
      term: activeSchool.active_term || 'Term 1',
      academic_year: activeSchool.active_academic_year || '2026-2027',
      is_free: false,
      is_special: editingSlot.isSpecial,
    };

    const res = addOrUpdateTimetableSlot(slotPayload, editingSlot.slotId);
    if (!res.success) {
      setSlotFormError(res.error || 'Conflict detected. Please review scheduling.');
      return;
    }

    triggerConfetti();
    setEditingSlot(null);
  };

  const handleDeleteManualSlot = () => {
    if (!editingSlot?.slotId) return;
    if (window.confirm('Are you sure you want to remove this scheduled lesson slot?')) {
      deleteTimetableSlot(editingSlot.slotId);
      setEditingSlot(null);
    }
  };

  const handleExportSinglePdf = () => {
    if (activeTab === 'CLASS_VIEW') {
      if (!selectedClass || classSlots.length === 0) {
        alert(`No scheduled slots available to export for ${selectedClass?.name || 'this class'}.`);
        return;
      }
      exportSingleTimetablePdf({
        activeSchool,
        title: `CLASS TIMETABLE: ${selectedClass.name.toUpperCase()}`,
        subtitle: `Level: ${selectedClass.level_name || selectedClass.level || 'General'} · Room: ${selectedClass.room_number || 'Main Classroom'}`,
        targetType: 'CLASS',
        slots: classSlots,
        dailyTimeline: dailyTimeline.allTimeline,
        subjects,
        teachers: schoolTeachers
      });
    } else if (activeTab === 'TEACHER_SCHEDULE' || activeTab === 'MY_SCHEDULE') {
      if (!targetTeacher || teacherSlots.length === 0) {
        alert(`No scheduled slots available to export for ${targetTeacher?.name || 'this teacher'}.`);
        return;
      }
      exportSingleTimetablePdf({
        activeSchool,
        title: `TEACHER SCHEDULE: ${targetTeacher.name.toUpperCase()}`,
        subtitle: `Email: ${targetTeacher.email || 'N/A'} · Weekly Load: ${teacherSlots.length} Lessons`,
        targetType: 'TEACHER',
        slots: teacherSlots,
        dailyTimeline: dailyTimeline.allTimeline,
        subjects,
        classes: schoolClasses
      });
    } else {
      handleExportBulkMasterPdf();
    }
  };

  const handleExportBulkMasterPdf = () => {
    if (schoolSlots.length === 0) {
      alert('No timetable slots available to export.');
      return;
    }
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        exportBulkMasterTimetablePdf({
          activeSchool,
          schoolSlots,
          schoolClasses,
          schoolTeachers,
          dailyTimeline: dailyTimeline.allTimeline,
          subjects
        });
      } catch (err: any) {
        console.error('Bulk PDF export error:', err);
        alert('Failed to generate Bulk PDF package: ' + (err?.message || String(err)));
      } finally {
        setIsExportingPdf(false);
      }
    }, 100);
  };

  const handleExportBulkZip = async () => {
    if (schoolSlots.length === 0) {
      alert('No timetable slots available to package into ZIP.');
      return;
    }
    setIsExportingZip(true);
    try {
      await exportBulkMasterTimetableZipPackage({
        activeSchool,
        schoolSlots,
        schoolClasses,
        schoolTeachers,
        dailyTimeline: dailyTimeline.allTimeline,
        subjects
      });
    } catch (err: any) {
      console.error('Bulk ZIP export error:', err);
      alert('Failed to generate Bulk ZIP package: ' + (err?.message || String(err)));
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportCSV = () => {
    const targetSlots = activeTab === 'CLASS_VIEW' ? classSlots : activeTab === 'TEACHER_SCHEDULE' || activeTab === 'MY_SCHEDULE' ? teacherSlots : schoolSlots;
    if (targetSlots.length === 0) {
      alert('No timetable records to export.');
      return;
    }

    const headers = ['Day', 'Period', 'Start Time', 'End Time', 'Class', 'Subject Code', 'Subject Name', 'Teacher Name', 'Room'];
    const rows = targetSlots.map(s => [
      s.day_of_week,
      s.period_number || '',
      s.start_time,
      s.end_time,
      `"${s.class_name}"`,
      s.subject_code,
      `"${s.subject_name}"`,
      `"${s.teacher_name}"`,
      `"${s.room}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Elimu360_Timetable_${activeSchool.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Academic Management · Section 03 [02]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Smart Master Timetable & Scheduling Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-collision multi-stream scheduling, Rwandan standard break management, and teacher appointment synchronization.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleManualSync}
            disabled={isCloudSyncing || cloudSyncState.status === 'syncing'}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            title="Fetch and sync latest timetable slots from system database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span>{isCloudSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          {isDirectorOrDOS && (
            <>
              <button
                onClick={() => handleOpenConfigModal('ALL_SCHOOL')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30 transition"
                title="Create a new school-specific timetable. Deletes old timetable entirely upon Director/DOS permission."
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Create New Timetable</span>
              </button>

              <button
                onClick={() => handleOpenConfigModal('ALL_SCHOOL')}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
                title="Adjust generation parameters, Rwandan breaks, and collision constraints"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Config Generator</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportSinglePdf}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-2 cursor-pointer transition shadow-md"
            title="Export current timetable view as a styled, formatted A4 PDF"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          {isDirectorOrDOS && (
            <>
              <button
                onClick={handleExportBulkMasterPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 flex items-center gap-2 cursor-pointer transition shadow-md disabled:opacity-50"
                title="Export multi-page PDF package containing Master Timetable + All Class Timetables + All Teacher Schedules"
              >
                <FolderDown className={`w-3.5 h-3.5 text-indigo-400 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'Building Bulk PDF...' : 'Bulk Master PDF'}</span>
              </button>

              <button
                onClick={handleExportBulkZip}
                disabled={isExportingZip}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/80 flex items-center gap-2 cursor-pointer transition shadow-md disabled:opacity-50"
                title="Download a ZIP package containing individual PDF files for every class and teacher"
              >
                <Archive className={`w-3.5 h-3.5 text-amber-400 ${isExportingZip ? 'animate-spin' : ''}`} />
                <span>{isExportingZip ? 'Packaging ZIP...' : 'Bulk ZIP Package'}</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
            title="Export as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
            title="Print Official Timetable"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Conflict Audit & School Isolation Status Banner */}
      {conflictAudit.length > 0 ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-rose-200">Attention: {conflictAudit.length} Teacher Double-Booking Collision(s) Detected in {activeSchool.name}!</span>
            <p className="text-rose-300/80">
              To avoid collisions, creating a new timetable requires deleting the previous schedule entirely upon Director/DOS authorization.
            </p>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-rose-400">
              {conflictAudit.slice(0, 3).map((c, idx) => (
                <div key={idx}>• {c.teacherName} is scheduled in {c.class1} and {c.class2} simultaneously on {c.day} Period {c.period}.</div>
              ))}
              {conflictAudit.length > 3 && <div>...and {conflictAudit.length - 3} more.</div>}
            </div>
          </div>
        </div>
      ) : schoolSlots.length === 0 ? (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-300">Independent Timetable Required for {activeSchool.name}:</span>
              <p className="text-amber-200/80 mt-0.5">Each school maintains its own individual timetable. No timetable has been generated for this institution yet.</p>
            </div>
          </div>
          {isDirectorOrDOS && (
            <button
              onClick={() => handleOpenConfigModal('ALL_SCHOOL')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shrink-0 shadow-md font-mono"
            >
              Create New Timetable Now
            </button>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">School Timetable Active ({activeSchool.name}):</span>
            <span>Zero collisions across all {schoolClasses.length} registered classes ({schoolSlots.length} active periods).</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 hidden sm:block">
            {activeSchool.active_academic_year} · {activeSchool.active_term}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Teacher personal view */}
          {isTeacher && (
            <button
              onClick={() => setActiveTab('MY_SCHEDULE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'MY_SCHEDULE'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Teaching Schedule</span>
            </button>
          )}

          {/* Class View */}
          <button
            onClick={() => setActiveTab('CLASS_VIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'CLASS_VIEW'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Timetable</span>
          </button>

          {/* Master Matrix for Director / DOS */}
          {isDirectorOrDOS && (
            <button
              onClick={() => setActiveTab('MASTER_MATRIX')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'MASTER_MATRIX'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Master Level Grid (All Classes)</span>
            </button>
          )}

          {/* Teacher View for Director / DOS */}
          {isDirectorOrDOS && (
            <button
              onClick={() => setActiveTab('TEACHER_SCHEDULE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'TEACHER_SCHEDULE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher Schedule Inspector</span>
            </button>
          )}
        </div>

        {/* Quick config launcher button */}
        {isDirectorOrDOS && (
          <button
            onClick={() => handleOpenConfigModal('ALL_SCHOOL')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>Break & Bell Rules</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: CLASS TIMETABLE (Standard Weekly Grid)
          ========================================================================= */}
      {activeTab === 'CLASS_VIEW' && (
        <div className="space-y-4">
          
          {/* Class Selector & Info Strip */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Target Class:
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  {(isTeacher ? teacherClasses : schoolClasses).map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} · Stream {cls.stream} ({cls.level_name || cls.level || 'O-Level'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-800 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Room: </span>
                    <strong className="text-slate-200">{selectedClass.room_number || 'Room 101'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Class Teacher: </span>
                    <strong className="text-amber-300">{selectedClass.class_teacher_name || 'Not appointed'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isDirectorOrDOS && (
                <>
                  <button
                    onClick={() => handleOpenCreateSlot('Monday', 1, '08:00', '08:45')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/30 transition"
                    title="Manually schedule a lesson slot for this class"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Lesson</span>
                  </button>

                  <button
                    onClick={() => handleOpenConfigModal('CLASS')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate This Class</span>
                  </button>
                </>
              )}

              <button
                onClick={handleExportSinglePdf}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                title="Export this class timetable as a styled PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Class PDF</span>
              </button>

              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">{classSlots.length}</span> Periods Scheduled
              </div>
            </div>
          </div>

          {/* Official Printable Timetable Area */}
          <div ref={printAreaRef} className="rounded-2xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl p-4 sm:p-6 print:bg-white print:text-black print:p-0 print:border-0">
            
            {/* Official Rwanda School Timetable Header (Print & Preview) */}
            <div className="border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 font-bold text-lg font-display">
                  {activeSchool.code?.slice(0, 3) || 'SCH'}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white uppercase tracking-wide font-display">
                    {activeSchool.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official Class Timetable · {selectedClass?.name} ({selectedClass?.level_name || selectedClass?.level})
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <div className="font-bold text-amber-400">{activeSchool.active_academic_year} · {activeSchool.active_term}</div>
                <div className="text-[10px] text-slate-500">Curriculum: {activeSchool.curriculum_type || 'REB Standard'}</div>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                    <th className="py-3 px-3.5 w-32 border-r border-slate-800/80">Period / Time</th>
                    {DAYS_OF_WEEK.map(d => (
                      <th key={d} className="py-3 px-3 text-center border-r border-slate-800/80 last:border-0">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dailyTimeline.allTimeline.map((ts, idx) => {
                    // Break Row
                    if (ts.is_break) {
                      return (
                        <tr key={idx} className="bg-amber-950/20 text-amber-300 border-y border-amber-800/40">
                          <td className="py-2.5 px-3.5 font-mono text-[11px] font-bold border-r border-slate-800/80 text-amber-400">
                            {ts.start_time} - {ts.end_time}
                          </td>
                          <td colSpan={5} className="py-2 px-4 text-center font-bold text-xs uppercase tracking-wider text-amber-300">
                            <div className="flex items-center justify-center gap-2">
                              {ts.break_info?.type === 'LUNCH' ? (
                                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span>{ts.label} ({ts.duration_mins} Minutes)</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Teaching Period Row
                    return (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="py-3 px-3.5 font-mono text-slate-400 border-r border-slate-800/80 bg-slate-950/30">
                          <div className="font-bold text-white text-[11px]">Period {ts.period_number}</div>
                          <div className="text-[10px] text-slate-500">{ts.start_time} - {ts.end_time}</div>
                        </td>

                        {DAYS_OF_WEEK.map(d => {
                          const slot = classSlots.find(s => s.day_of_week === d && s.period_number === ts.period_number);

                          return (
                            <td key={d} className="py-1.5 px-1.5 border-r border-slate-800/80 last:border-0 align-top h-24 w-1/5">
                              {slot ? (
                                <div 
                                  onClick={() => handleOpenEditSlot(slot)}
                                  className={`h-full p-2 rounded-xl flex flex-col justify-between transition border cursor-pointer group hover:scale-[1.02] shadow-sm ${
                                    slot.is_special 
                                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-200 hover:border-amber-400' 
                                      : slot.is_free 
                                      ? 'bg-slate-950/60 border-dashed border-slate-700 text-slate-400' 
                                      : 'bg-indigo-950/50 border-indigo-800/60 text-indigo-100 hover:border-indigo-400 shadow-indigo-950/40'
                                  }`}
                                  title="Click to view or edit this lesson slot"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                        slot.is_special ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                                      }`}>
                                        {slot.subject_code}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400 truncate">
                                        {slot.room}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-[11px] leading-tight line-clamp-2 text-white">
                                      {slot.subject_name}
                                    </h4>
                                  </div>

                                  <div className="pt-1.5 mt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1 text-slate-300 truncate">
                                      <User className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                      <span className="truncate font-medium">{slot.teacher_name}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition text-indigo-400 font-semibold">
                                      Edit
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreateSlot(d, ts.period_number, ts.start_time, ts.end_time)}
                                  className="h-full w-full rounded-xl border border-dashed border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/20 transition flex flex-col items-center justify-center text-[10px] text-slate-500 hover:text-indigo-300 cursor-pointer group"
                                  title={`Click to schedule lesson on ${d} Period ${ts.period_number}`}
                                >
                                  <span className="group-hover:hidden text-slate-600">Free</span>
                                  <span className="hidden group-hover:inline-flex items-center gap-1 font-semibold text-indigo-400">
                                    <Plus className="w-3 h-3" /> Add Lesson
                                  </span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Rwanda Footer Requirement */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">Generated By Elimu360</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-medium">Developed by The Palace Tech House</span>
              </div>
              <div className="text-slate-500 font-mono text-[10px]">
                Authorized by DOS & School Director · {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MASTER LEVEL MATRIX (All Classes side-by-side)
          ========================================================================= */}
      {activeTab === 'MASTER_MATRIX' && isDirectorOrDOS && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Filter Day:
                </label>
                <select
                  value={selectedDayFilter}
                  onChange={e => setSelectedDayFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Week (Monday - Friday)</option>
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Filter Education Level:
                </label>
                <select
                  value={selectedLevelFilter}
                  onChange={e => setSelectedLevelFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Education Levels</option>
                  {schoolLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportBulkMasterPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50"
                title="Export multi-page PDF package containing Master Overview + All Classes + All Teachers"
              >
                <FolderDown className={`w-3.5 h-3.5 text-amber-300 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'Building Bulk PDF...' : 'Export Bulk Master PDF'}</span>
              </button>

              <button
                onClick={handleExportBulkZip}
                disabled={isExportingZip}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50 font-extrabold"
                title="Download ZIP package containing individual PDF files for every class and teacher"
              >
                <Archive className={`w-3.5 h-3.5 text-slate-950 ${isExportingZip ? 'animate-spin' : ''}`} />
                <span>{isExportingZip ? 'Packaging ZIP...' : 'Export Bulk ZIP Package'}</span>
              </button>

              <button
                onClick={() => handleOpenConfigModal('ALL_SCHOOL')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Re-Solve Master</span>
              </button>
            </div>
          </div>

          {/* Master Grid Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl p-4">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white font-display">
                  School-Wide Master Timetable Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive view showing where every teacher and class is located across all periods.
                </p>
              </div>
              <div className="text-xs text-indigo-300 font-mono">
                {schoolClasses.length} Classes · {schoolTeachers.length} Teachers
              </div>
            </div>

            <div className="overflow-x-auto max-h-[650px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 z-20">
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                    <th className="py-3 px-3 w-28 border-r border-slate-800">Day & Period</th>
                    <th className="py-3 px-3 w-24 border-r border-slate-800">Time</th>
                    {schoolClasses
                      .filter(c => selectedLevelFilter === 'ALL' || c.level_name === selectedLevelFilter || c.level === selectedLevelFilter)
                      .map(cls => (
                        <th key={cls.id} className="py-3 px-3 text-center border-r border-slate-800/80 min-w-[160px]">
                          <div className="font-bold text-white text-xs">{cls.name}</div>
                          <div className="text-[10px] text-indigo-400 font-normal">{cls.room_number || 'Room 101'}</div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(selectedDayFilter === 'ALL' ? DAYS_OF_WEEK : [selectedDayFilter as any]).map(day => (
                    <React.Fragment key={day}>
                      {/* Day Header */}
                      <tr className="bg-slate-950/80 font-bold text-amber-400 text-xs uppercase tracking-wider">
                        <td colSpan={schoolClasses.length + 2} className="py-2 px-4 border-y border-slate-800 bg-slate-950">
                          📅 {day}
                        </td>
                      </tr>

                      {dailyTimeline.allTimeline.map((ts, pIdx) => {
                        if (ts.is_break) {
                          return (
                            <tr key={pIdx} className="bg-amber-950/20 text-amber-300/90 text-center font-bold text-[11px]">
                              <td className="py-2 px-3 text-left font-mono border-r border-slate-800">Break</td>
                              <td className="py-2 px-3 font-mono border-r border-slate-800">{ts.start_time} - {ts.end_time}</td>
                              <td colSpan={schoolClasses.length} className="py-2 px-4 text-amber-400 uppercase tracking-wider text-xs">
                                ☕ {ts.label} ({ts.duration_mins} Min)
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={pIdx} className="hover:bg-slate-800/20">
                            <td className="py-2.5 px-3 font-bold text-white border-r border-slate-800 bg-slate-950/40">
                              Period {ts.period_number}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-400 border-r border-slate-800 text-[10px]">
                              {ts.start_time} - {ts.end_time}
                            </td>

                            {schoolClasses
                              .filter(c => selectedLevelFilter === 'ALL' || c.level_name === selectedLevelFilter || c.level === selectedLevelFilter)
                              .map(cls => {
                                const slot = schoolSlots.find(s => s.class_id === cls.id && s.day_of_week === day && s.period_number === ts.period_number);

                                return (
                                  <td key={cls.id} className="p-1.5 border-r border-slate-800/80 align-top">
                                    {slot ? (
                                      <div className={`p-2 rounded-xl text-[11px] flex flex-col justify-between border ${
                                        slot.is_special
                                          ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                                          : slot.is_free
                                          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                                          : 'bg-indigo-950/60 border-indigo-800/60 text-indigo-100'
                                      }`}>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <span className="font-bold text-white text-[11px] truncate">
                                            {slot.subject_name}
                                          </span>
                                          <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                            {slot.subject_code}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-300 flex items-center gap-1">
                                          <User className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                          <span className="truncate">{slot.teacher_name}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-full min-h-[42px] rounded-lg border border-dashed border-slate-800/40 flex items-center justify-center text-[10px] text-slate-600">
                                        -
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rwanda Tech House Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>Generated By Elimu360 | Master Scheduling Core</span>
              <span>The Palace Tech House · Institutional Edition</span>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: TEACHER TEACHING SCHEDULE (Inspector or Personal My Schedule)
          ========================================================================= */}
      {(activeTab === 'TEACHER_SCHEDULE' || activeTab === 'MY_SCHEDULE') && (
        <div className="space-y-4">
          
          {/* Teacher Selector Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === 'TEACHER_SCHEDULE' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Select Teacher to Inspect:
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    {schoolTeachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-base">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{currentUser.name}</h3>
                    <p className="text-xs text-slate-400">Personal Teaching Schedule & Assigned Streams</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportSinglePdf}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                title="Export this teacher schedule as a styled PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Teacher PDF</span>
              </button>
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">{teacherSlots.length}</span> Teaching Periods / Week Allocated
              </div>
            </div>
          </div>

          {/* Teacher Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl p-4 sm:p-6">
            
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white font-display">
                  Weekly Teaching Load: {activeTab === 'MY_SCHEDULE' ? currentUser.name : schoolTeachers.find(t => t.id === selectedTeacherId)?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Individual timetable showing designated classrooms and lecture hours across streams.
                </p>
              </div>
              <div className="text-xs text-amber-400 font-mono">
                {activeSchool.active_academic_year} · {activeSchool.active_term}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase">
                    <th className="py-3 px-3.5 w-32 border-r border-slate-800">Period / Time</th>
                    {DAYS_OF_WEEK.map(d => (
                      <th key={d} className="py-3 px-3 text-center border-r border-slate-800 last:border-0">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dailyTimeline.allTimeline.map((ts, idx) => {
                    if (ts.is_break) {
                      return (
                        <tr key={idx} className="bg-amber-950/20 text-amber-300 text-center font-bold text-[11px]">
                          <td className="py-2 px-3.5 font-mono border-r border-slate-800 text-amber-400">{ts.start_time} - {ts.end_time}</td>
                          <td colSpan={5} className="py-2 px-4 uppercase tracking-wider text-amber-300">
                            ☕ {ts.label} ({ts.duration_mins} Min)
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="py-3 px-3.5 font-mono text-slate-400 border-r border-slate-800 bg-slate-950/30">
                          <div className="font-bold text-white text-[11px]">Period {ts.period_number}</div>
                          <div className="text-[10px] text-slate-500">{ts.start_time} - {ts.end_time}</div>
                        </td>

                        {DAYS_OF_WEEK.map(d => {
                          const slot = teacherSlots.find(s => s.day_of_week === d && s.period_number === ts.period_number);

                          return (
                            <td key={d} className="py-1.5 px-1.5 border-r border-slate-800/80 last:border-0 align-top h-24 w-1/5">
                              {slot ? (
                                <div className="h-full p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-indigo-100 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-indigo-500/20 text-indigo-300">
                                        {slot.subject_code}
                                      </span>
                                      <span className="text-[10px] font-bold text-amber-300">
                                        {slot.class_name}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-xs leading-tight text-white line-clamp-2">
                                      {slot.subject_name}
                                    </h4>
                                  </div>

                                  <div className="pt-1.5 mt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-300">
                                    <div className="flex items-center gap-1 font-mono text-slate-400">
                                      <MapPin className="w-2.5 h-2.5 text-amber-400" />
                                      <span>{slot.room}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full w-full rounded-xl border border-dashed border-slate-800/50 flex items-center justify-center text-[10px] text-slate-600">
                                  <span>Off Period</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Generated By Elimu360</span>
                <span>|</span>
                <span className="text-amber-400">The Palace Tech House</span>
              </div>
              <div className="text-slate-500 font-mono text-[10px]">
                Teacher Timetable Profile · {activeSchool.name}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TIMETABLE GENERATOR & BREAKS CONFIGURATION
          ========================================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Smart Timetable Generator & Bell Intervals
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure school hours, Rwandan break intervals, free study periods, and non-collision parameters.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Feedback Alert */}
            {generationFeedback && (
              <div className={`mt-4 p-4 rounded-2xl border text-xs ${
                generationFeedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
              }`}>
                <div className="font-bold text-sm mb-1">{generationFeedback.text}</div>
                {generationFeedback.details && (
                  <ul className="list-disc list-inside space-y-0.5 opacity-90 font-mono text-[11px]">
                    {generationFeedback.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-5 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* SECTION 1: TARGET SCOPE */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>1. Generation Target Scope</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Recommended: Whole Level / School to prevent teacher clashes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGenerationScope('ALL_SCHOOL')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                      generationScope === 'ALL_SCHOOL'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Entire School</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">All classes & teachers solved globally</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenerationScope('LEVEL')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                      generationScope === 'LEVEL'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Specific Education Level</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">e.g. All O-Level or A-Level streams</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenerationScope('CLASS')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                      generationScope === 'CLASS'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Single Class</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Generates for one selected classroom</div>
                  </button>
                </div>

                {generationScope === 'LEVEL' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select Education Level:</label>
                    <select
                      value={scopeLevelName}
                      onChange={e => setScopeLevelName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {schoolLevels.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                )}

                {generationScope === 'CLASS' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select Class:</label>
                    <select
                      value={scopeClassId}
                      onChange={e => setScopeClassId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {schoolClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.level_name || cls.level})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION 2: DAILY BELL SCHEDULE */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>2. School Hours & Lesson Duration</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      School Morning Start Time
                    </label>
                    <input
                      type="time"
                      value={localConfig.school_start_time}
                      onChange={e => setLocalConfig(prev => ({ ...prev, school_start_time: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Period Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="90"
                      value={localConfig.period_duration_mins}
                      onChange={e => setLocalConfig(prev => ({ ...prev, period_duration_mins: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-400"
                      required
                    />
                    <span className="text-[10px] text-slate-500">Rwanda standard: 40 min</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Teaching Periods / Day
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={localConfig.periods_per_day}
                      onChange={e => setLocalConfig(prev => ({ ...prev, periods_per_day: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold text-indigo-400"
                      required
                    />
                    <span className="text-[10px] text-slate-500">Usually 8 or 9 periods</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: RWANDAN BREAK SCHEDULE */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <span>3. Rwandan Standard Break Intervals</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddCustomBreak}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Break</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {localConfig.breaks.map((brk, idx) => (
                    <div key={brk.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={brk.enabled}
                          onChange={e => handleUpdateBreak(idx, { enabled: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <input
                            type="text"
                            value={brk.name}
                            onChange={e => handleUpdateBreak(idx, { name: e.target.value })}
                            className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1"
                          />
                          <div className="text-[10px] text-slate-400">
                            Occurs immediately after <strong>Period {brk.after_period}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-400">After Period:</label>
                          <select
                            value={brk.after_period}
                            onChange={e => handleUpdateBreak(idx, { after_period: Number(e.target.value) })}
                            className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                          >
                            {Array.from({ length: localConfig.periods_per_day }, (_, i) => i + 1).map(p => (
                              <option key={p} value={p}>Period {p}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-400">Duration:</label>
                          <input
                            type="number"
                            min="5"
                            max="120"
                            value={brk.duration_mins}
                            onChange={e => handleUpdateBreak(idx, { duration_mins: Number(e.target.value) })}
                            className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 font-bold"
                          />
                          <span className="text-[10px] text-slate-500">min</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBreak(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition"
                          title="Remove Break"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: CURRICULUM, FREE TIME & SPECIAL BLOCKS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>4. Academic Policy & Free Periods</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Free / Personal Study Periods per Week
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={localConfig.free_periods_per_week}
                      onChange={e => setLocalConfig(prev => ({ ...prev, free_periods_per_week: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-400"
                    />
                    <span className="text-[10px] text-slate-500">e.g. 2 periods/week for library & personal revision</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.allow_double_periods}
                        onChange={e => setLocalConfig(prev => ({ ...prev, allow_double_periods: e.target.checked }))}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Allow Double Periods (2 consecutive periods for same lesson)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.include_assembly}
                        onChange={e => setLocalConfig(prev => ({ ...prev, include_assembly: e.target.checked }))}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Monday Morning Assembly (Period 1)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.include_sports}
                        onChange={e => setLocalConfig(prev => ({ ...prev, include_sports: e.target.checked }))}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Friday Afternoon Sports & Clubs (Last Period)</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearCurrentScope}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Clear Current Scope Slots
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleExecuteGenerate}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/40 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isGenerating ? 'Solving Matrix...' : 'Generate Conflict-Free Timetable'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DIRECTOR / DOS PERMISSION & COLLISION PREVENTION PROTOCOL
          ========================================================================= */}
      {showDirectorPermissionModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl p-6 sm:p-7 relative my-8">
            
            {/* Header with Warning Shield */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <ShieldAlert className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Administrative Protocol
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Zero Collision Guard
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Director / DOS Permission Required
                </h3>
                <p className="text-xs text-slate-300">
                  Delete existing timetable entirely to create a new, collision-free schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectorPermissionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Explanatory Body */}
            <div className="mt-5 space-y-4 text-xs">
              
              {/* Institution Scope Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Target Institution:</span>
                  <span className="font-bold text-white">{activeSchool.name} ({activeSchool.code || 'SCH'})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Existing Timetable to Delete:</span>
                  <span className="font-bold text-rose-400 font-mono">{schoolSlots.length} scheduled periods across {schoolClasses.length} classes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Academic Term:</span>
                  <span className="text-slate-300 font-mono">{activeSchool.active_term || 'Term 1'} · {activeSchool.active_academic_year || '2026'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Target Scope:</span>
                  <span className="text-indigo-300 font-semibold">
                    {generationScope === 'ALL_SCHOOL' ? 'Entire School (All Streams)' : generationScope === 'LEVEL' ? `All Classes in ${scopeLevelName}` : 'Selected Classroom'}
                  </span>
                </div>
              </div>

              {/* Zero Collision Policy Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200/90 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Collision Prevention Protocol</span>
                </div>
                <p>
                  To eliminate overlapping teachers, room collisions, and duplicate lesson allocations, creating a new timetable requires that the previous schedule be <strong>deleted entirely</strong>.
                </p>
                <p className="text-[11px] text-amber-300/80">
                  ✓ <strong>School Isolation Guaranteed:</strong> Each school has its own independent timetable. Only {activeSchool.name}&apos;s slots are wiped. All other schools remain completely unaffected.
                </p>
              </div>

              {/* Authorization Fields */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Authorizing Official (Director / DOS)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Official Name</label>
                    <input
                      type="text"
                      value={permissionOfficialName}
                      onChange={e => setPermissionOfficialName(e.target.value)}
                      placeholder="e.g. Director of Studies"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Administrative Role</label>
                    <select
                      value={permissionRole}
                      onChange={e => setPermissionRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Director of Studies (DOS)">Director of Studies (DOS)</option>
                      <option value="Head Teacher / School Director">Head Teacher / School Director</option>
                      <option value="Deputy Head of Academics">Deputy Head of Academics</option>
                      <option value="Super Administrator">Super Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Explicit Permission Checkbox */}
                <label className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer mt-2 transition">
                  <input
                    type="checkbox"
                    checked={permissionAcknowledged}
                    onChange={e => setPermissionAcknowledged(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-200 font-medium">
                    I, as <strong>{permissionRole}</strong>, give explicit permission to delete the existing <strong>{schoolSlots.length} timetable slots</strong> for <strong>{activeSchool.name}</strong> entirely and generate a fresh, collision-free timetable.
                  </span>
                </label>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowDirectorPermissionModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer transition text-center"
              >
                Cancel / Retain Existing Timetable
              </button>

              <button
                type="button"
                onClick={() => proceedWithGeneration({ name: permissionOfficialName, role: permissionRole })}
                disabled={!permissionAcknowledged}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/50 transition font-mono"
              >
                <Trash2 className="w-4 h-4 text-slate-950" />
                <span>Authorize & Delete Old to Generate New</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-800/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Timetable Wipe</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to clear all timetable slots for <strong>{activeSchool.name}</strong> ({generationScope === 'ALL_SCHOOL' ? 'the entire school' : generationScope === 'LEVEL' ? scopeLevelName : 'selected class'})?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearScope}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer"
              >
                Delete Slots
              </button>
            </div>
          </div>
        </div>
      )}
      {editingSlot && editingSlot.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingSlot.slotId ? 'Edit Scheduled Lesson' : 'Schedule New Lesson Slot'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Direct timetable assignment with instant zero-conflict verification
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {slotFormError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{slotFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveManualSlot} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={editingSlot.day}
                    onChange={e => setEditingSlot({ ...editingSlot, day: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Period Number</label>
                  <select
                    value={editingSlot.periodNumber}
                    onChange={e => {
                      const p = Number(e.target.value);
                      const matchingTime = dailyTimeline.teachingPeriods.find(tp => tp.period_number === p);
                      setEditingSlot({
                        ...editingSlot,
                        periodNumber: p,
                        startTime: matchingTime ? matchingTime.start_time : editingSlot.startTime,
                        endTime: matchingTime ? matchingTime.end_time : editingSlot.endTime,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {dailyTimeline.teachingPeriods.map(tp => (
                      <option key={tp.period_number} value={tp.period_number}>
                        Period {tp.period_number} ({tp.start_time} - {tp.end_time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingSlot.startTime}
                    onChange={e => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingSlot.endTime}
                    onChange={e => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Class</label>
                <select
                  value={editingSlot.classId}
                  onChange={e => {
                    const cls = schoolClasses.find(c => c.id === e.target.value);
                    setEditingSlot({
                      ...editingSlot,
                      classId: e.target.value,
                      room: cls?.room_number || editingSlot.room,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {schoolClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} · Stream {cls.stream} ({cls.level_name || cls.level || 'O-Level'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Subject</label>
                <select
                  value={editingSlot.subjectId}
                  onChange={e => {
                    const subId = e.target.value;
                    // Auto-suggest appointed teacher if exists
                    const appointment = teacherAssignments.find(ta => ta.class_id === editingSlot.classId && ta.subject_id === subId);
                    setEditingSlot({
                      ...editingSlot,
                      subjectId: subId,
                      teacherId: appointment ? appointment.teacher_id : editingSlot.teacherId,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Assigned Teacher</label>
                <select
                  value={editingSlot.teacherId}
                  onChange={e => setEditingSlot({ ...editingSlot, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {schoolTeachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Classroom / Laboratory</label>
                  <input
                    type="text"
                    value={editingSlot.room}
                    onChange={e => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    placeholder="e.g. Room 102 / Science Lab"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlot.isSpecial}
                      onChange={e => setEditingSlot({ ...editingSlot, isSpecial: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Special Activity (Sports/Club)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {editingSlot.slotId ? (
                  <button
                    type="button"
                    onClick={handleDeleteManualSlot}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-900/50 transition cursor-pointer"
                  >
                    Delete Slot
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 cursor-pointer transition"
                  >
                    {editingSlot.slotId ? 'Save Changes' : 'Schedule Slot'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
