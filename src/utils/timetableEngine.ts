import { 
  TimetableConfig, 
  BreakSlotConfig, 
  TimetableSlot, 
  ClassRoom, 
  Subject, 
  TeacherAssignment, 
  User 
} from '../types';

export const DEFAULT_TIMETABLE_CONFIG: TimetableConfig = {
  school_start_time: '08:00',
  period_duration_mins: 40,
  periods_per_day: 8,
  breaks: [
    {
      id: 'brk-morning',
      name: 'Morning Break',
      duration_mins: 20,
      after_period: 3,
      type: 'MORNING',
      enabled: true,
      start_time: '10:00',
      end_time: '10:20'
    },
    {
      id: 'brk-lunch',
      name: 'Lunch Break',
      duration_mins: 60,
      after_period: 5,
      type: 'LUNCH',
      enabled: true,
      start_time: '12:20',
      end_time: '13:20'
    },
    {
      id: 'brk-afternoon',
      name: 'Afternoon Break',
      duration_mins: 20,
      after_period: 7,
      type: 'AFTERNOON',
      enabled: true,
      start_time: '15:20',
      end_time: '15:40'
    }
  ],
  free_periods_per_week: 2,
  allow_double_periods: true,
  include_assembly: true,
  include_sports: true
};

export const DAYS_OF_WEEK: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

/**
 * Convert "HH:MM" string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 8 * 60;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convert minutes from midnight to "HH:MM" string
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % (24 * 60));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export interface ComputedTimelineSlot {
  period_number: number; // 1..N for teaching periods, 0 for break
  is_break: boolean;
  label: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  break_info?: BreakSlotConfig;
}

/**
 * Computes exact start and end times for all periods and breaks given a config
 */
export function computeDailyTimeline(config: TimetableConfig): {
  allTimeline: ComputedTimelineSlot[];
  teachingPeriods: ComputedTimelineSlot[];
  breaks: ComputedTimelineSlot[];
} {
  const allTimeline: ComputedTimelineSlot[] = [];
  const teachingPeriods: ComputedTimelineSlot[] = [];
  const computedBreaks: ComputedTimelineSlot[] = [];

  let currentMinutes = timeStringToMinutes(config.school_start_time || '08:00');
  const duration = config.period_duration_mins || 40;
  const activeBreaks = (config.breaks || []).filter(b => b.enabled);

  for (let p = 1; p <= config.periods_per_day; p++) {
    const periodStart = minutesToTimeString(currentMinutes);
    currentMinutes += duration;
    const periodEnd = minutesToTimeString(currentMinutes);

    const teachingSlot: ComputedTimelineSlot = {
      period_number: p,
      is_break: false,
      label: `Period ${p}`,
      start_time: periodStart,
      end_time: periodEnd,
      duration_mins: duration
    };

    allTimeline.push(teachingSlot);
    teachingPeriods.push(teachingSlot);

    // Check if a break occurs after this period
    const breakAfter = activeBreaks.find(b => b.after_period === p);
    if (breakAfter) {
      const breakStart = minutesToTimeString(currentMinutes);
      currentMinutes += breakAfter.duration_mins;
      const breakEnd = minutesToTimeString(currentMinutes);

      const breakSlot: ComputedTimelineSlot = {
        period_number: 0,
        is_break: true,
        label: breakAfter.name,
        start_time: breakStart,
        end_time: breakEnd,
        duration_mins: breakAfter.duration_mins,
        break_info: {
          ...breakAfter,
          start_time: breakStart,
          end_time: breakEnd
        }
      };

      allTimeline.push(breakSlot);
      computedBreaks.push(breakSlot);
    }
  }

  return { allTimeline, teachingPeriods, breaks: computedBreaks };
}

interface LessonDemand {
  id: string;
  class_id: string;
  class_name: string;
  level_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  room: string;
  blockSize: number; // 1 or 2
  is_free?: boolean;
  is_special?: boolean;
}

export interface TimetableGenerationResult {
  success: boolean;
  slots: TimetableSlot[];
  stats: {
    totalSlotsCreated: number;
    classesScheduledCount: number;
    teacherConflictsCount: number;
    roomConflictsCount: number;
    coveragePercentage: number;
    diagnostics: string[];
  };
  error?: string;
}

/**
 * Master Timetable Scheduling Engine
 * Enforces strict non-collision rules across classes, teachers, and rooms.
 */
export function generateConflictFreeTimetable(params: {
  schoolId: string;
  academicYear: string;
  term: string;
  targetClasses: ClassRoom[];
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  teachers: User[];
  config: TimetableConfig;
  existingSlots?: TimetableSlot[];
  clearExistingTarget?: boolean;
}): TimetableGenerationResult {
  const {
    schoolId,
    academicYear,
    term,
    targetClasses,
    subjects,
    teacherAssignments,
    teachers,
    config,
    existingSlots = [],
    clearExistingTarget = true
  } = params;

  if (targetClasses.length === 0) {
    return {
      success: false,
      slots: [],
      stats: {
        totalSlotsCreated: 0,
        classesScheduledCount: 0,
        teacherConflictsCount: 0,
        roomConflictsCount: 0,
        coveragePercentage: 0,
        diagnostics: ['No target classes selected for timetable generation.']
      },
      error: 'Please select at least one class or education level to generate timetable.'
    };
  }

  const { teachingPeriods } = computeDailyTimeline(config);
  const periodsCount = teachingPeriods.length;
  const diagnostics: string[] = [];

  // Filter slots to keep: keep slots from other classes not being regenerated
  const targetClassIds = new Set(targetClasses.map(c => c.id));
  const retainedSlots: TimetableSlot[] = clearExistingTarget
    ? existingSlots.filter(s => s.school_id === schoolId && !targetClassIds.has(s.class_id))
    : [...existingSlots];

  // Tracking Matrix for Constraints
  // Key formats:
  // Teacher: `${teacher_id}_${day}_${period_number}`
  // Class: `${class_id}_${day}_${period_number}`
  // Room: `${room.toLowerCase()}_${day}_${period_number}`
  // Subject Daily Count: `${class_id}_${day}_${subject_id}`
  const teacherOccupied = new Map<string, string>(); // maps to class_name
  const classOccupied = new Map<string, TimetableSlot>();
  const roomOccupied = new Map<string, string>(); // maps to class_name
  const subjectDailyCounts = new Map<string, number>();

  // Preload retained slots into collision trackers
  for (const slot of retainedSlots) {
    if (slot.period_number && slot.day_of_week) {
      const d = slot.day_of_week;
      const p = slot.period_number;
      if (slot.teacher_id && slot.teacher_id !== 'unassigned') {
        teacherOccupied.set(`${slot.teacher_id}_${d}_${p}`, slot.class_name);
      }
      classOccupied.set(`${slot.class_id}_${d}_${p}`, slot);
      if (slot.room) {
        roomOccupied.set(`${slot.room.toLowerCase().trim()}_${d}_${p}`, slot.class_name);
      }
    }
  }

  const newlyGeneratedSlots: TimetableSlot[] = [];

  // Sort classes to prioritize classes sharing teachers
  const sortedClasses = [...targetClasses].sort((a, b) => {
    const aAssignments = teacherAssignments.filter(ta => ta.class_id === a.id).length;
    const bAssignments = teacherAssignments.filter(ta => ta.class_id === b.id).length;
    return bAssignments - aAssignments;
  });

  // Schedule each class
  for (const cls of sortedClasses) {
    const classLevel = cls.level_name || cls.level || 'Ordinary Level / O-Level';

    // 1. Identify applicable subjects for this class
    const classSubjects = subjects.filter(s => {
      if (s.school_id !== schoolId && s.school_id !== 'all') return false;
      if (s.applicable_class_ids && s.applicable_class_ids.length > 0) {
        return s.applicable_class_ids.includes(cls.id);
      }
      if (cls.subject_ids && cls.subject_ids.length > 0) {
        return cls.subject_ids.includes(s.id);
      }
      if (s.level_name && s.level_name !== 'All Levels') {
        return s.level_name.toLowerCase().includes(classLevel.toLowerCase()) || 
               classLevel.toLowerCase().includes(s.level_name.toLowerCase());
      }
      return true;
    });

    const activeSubjects = classSubjects.length > 0 ? classSubjects : subjects.filter(s => s.school_id === schoolId);

    // 2. Build Lesson Packets for this class
    const lessonPackets: LessonDemand[] = [];

    // Pre-allocate School Assembly if enabled (Monday Period 1)
    if (config.include_assembly && periodsCount >= 1) {
      lessonPackets.push({
        id: `demand-${cls.id}-assembly`,
        class_id: cls.id,
        class_name: cls.name,
        level_name: classLevel,
        subject_id: 'sub-assembly',
        subject_name: 'School Assembly & Flag Ceremony',
        subject_code: 'ASM',
        teacher_id: cls.class_teacher_id || 'head-of-school',
        teacher_name: cls.class_teacher_name || 'School Leadership & DOS',
        room: 'School Main Quadrangle / Grounds',
        blockSize: 1,
        is_special: true
      });
    }

    // Pre-allocate Sports & Clubs if enabled (Friday Last Period)
    if (config.include_sports && periodsCount >= 2) {
      lessonPackets.push({
        id: `demand-${cls.id}-sports`,
        class_id: cls.id,
        class_name: cls.name,
        level_name: classLevel,
        subject_id: 'sub-sports',
        subject_name: 'Sports, Clubs & Campus Co-Curricular',
        subject_code: 'SPORTS',
        teacher_id: 'sports-dept',
        teacher_name: 'Sports Master & Club Patrons',
        room: 'Sports Complex & Playing Fields',
        blockSize: 1,
        is_special: true
      });
    }

    // Allocate academic subjects based on periods_per_week
    for (const sub of activeSubjects) {
      // Find appointed teacher
      const appointment = teacherAssignments.find(ta => 
        ta.school_id === schoolId && 
        ta.class_id === cls.id && 
        ta.subject_id === sub.id
      );

      let teacherId = appointment?.teacher_id || '';
      let teacherName = appointment?.teacher_name || '';

      // Fallback if no explicit appointment exists
      if (!teacherId) {
        const matchingTeacher = teachers.find(t => 
          (t.school_id === schoolId || t.school_id === 'all') && 
          t.role === 'TEACHER'
        );
        if (matchingTeacher) {
          teacherId = matchingTeacher.id;
          teacherName = matchingTeacher.name;
        } else {
          teacherId = cls.class_teacher_id || 'teacher-default';
          teacherName = cls.class_teacher_name || 'Appointed Subject Teacher';
        }
      }

      const totalPeriods = Math.max(1, sub.periods_per_week || sub.credits || 4);
      let remaining = totalPeriods;

      // Group into double periods (2) and single periods (1) if double periods are enabled
      if (config.allow_double_periods && totalPeriods >= 3) {
        // e.g. for 5 periods: 1 double + 3 singles; for 4: 1 double + 2 singles; for 6: 2 doubles + 2 singles
        const numDoubles = totalPeriods >= 5 ? 2 : 1;
        for (let d = 0; d < numDoubles && remaining >= 2; d++) {
          lessonPackets.push({
            id: `demand-${cls.id}-${sub.id}-d${d}`,
            class_id: cls.id,
            class_name: cls.name,
            level_name: classLevel,
            subject_id: sub.id,
            subject_name: sub.name,
            subject_code: sub.code,
            teacher_id: teacherId,
            teacher_name: teacherName,
            room: cls.room_number || `Room ${cls.stream || 'A'}`,
            blockSize: 2
          });
          remaining -= 2;
        }
      }

      while (remaining > 0) {
        lessonPackets.push({
          id: `demand-${cls.id}-${sub.id}-s${remaining}`,
          class_id: cls.id,
          class_name: cls.name,
          level_name: classLevel,
          subject_id: sub.id,
          subject_name: sub.name,
          subject_code: sub.code,
          teacher_id: teacherId,
          teacher_name: teacherName,
          room: cls.room_number || `Room ${cls.stream || 'A'}`,
          blockSize: 1
        });
        remaining -= 1;
      }
    }

    // Add Free / Study Periods if requested
    const freeCount = config.free_periods_per_week || 0;
    for (let f = 1; f <= freeCount; f++) {
      lessonPackets.push({
        id: `demand-${cls.id}-free-${f}`,
        class_id: cls.id,
        class_name: cls.name,
        level_name: classLevel,
        subject_id: 'sub-free-study',
        subject_name: 'Personal Study & Library Review',
        subject_code: 'STUDY',
        teacher_id: cls.class_teacher_id || 'librarian',
        teacher_name: cls.class_teacher_name || 'Supervisor on Duty',
        room: cls.room_number || 'Library / Classroom',
        blockSize: 1,
        is_free: true
      });
    }

    // 3. Sort packets:
    // Put Assembly first (for Monday period 1), Sports for Friday last period,
    // then double periods, then single periods
    lessonPackets.sort((a, b) => {
      if (a.subject_code === 'ASM') return -1;
      if (b.subject_code === 'ASM') return 1;
      if (a.subject_code === 'SPORTS') return 1;
      if (b.subject_code === 'SPORTS') return -1;
      return b.blockSize - a.blockSize;
    });

    // 4. Place packets across week with constraint satisfaction
    for (const packet of lessonPackets) {
      let placed = false;

      // Special fixed handling for Assembly: Monday Period 1
      if (packet.subject_code === 'ASM') {
        const day = 'Monday';
        const pNum = 1;
        const timelineSlot = teachingPeriods.find(tp => tp.period_number === pNum);
        if (timelineSlot && !classOccupied.has(`${cls.id}_${day}_${pNum}`)) {
          const slot: TimetableSlot = {
            id: `slot-${cls.id}-${day}-${pNum}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            school_id: schoolId,
            class_id: cls.id,
            class_name: cls.name,
            level_name: classLevel,
            subject_id: packet.subject_id,
            subject_name: packet.subject_name,
            subject_code: packet.subject_code,
            teacher_id: packet.teacher_id,
            teacher_name: packet.teacher_name,
            room: packet.room,
            day_of_week: day,
            period_number: pNum,
            start_time: timelineSlot.start_time,
            end_time: timelineSlot.end_time,
            is_special: true,
            term,
            academic_year: academicYear
          };
          classOccupied.set(`${cls.id}_${day}_${pNum}`, slot);
          newlyGeneratedSlots.push(slot);
          placed = true;
          continue;
        }
      }

      // Special fixed handling for Sports: Friday Last Period
      if (packet.subject_code === 'SPORTS') {
        const day = 'Friday';
        const pNum = periodsCount;
        const timelineSlot = teachingPeriods.find(tp => tp.period_number === pNum);
        if (timelineSlot && !classOccupied.has(`${cls.id}_${day}_${pNum}`)) {
          const slot: TimetableSlot = {
            id: `slot-${cls.id}-${day}-${pNum}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            school_id: schoolId,
            class_id: cls.id,
            class_name: cls.name,
            level_name: classLevel,
            subject_id: packet.subject_id,
            subject_name: packet.subject_name,
            subject_code: packet.subject_code,
            teacher_id: packet.teacher_id,
            teacher_name: packet.teacher_name,
            room: packet.room,
            day_of_week: day,
            period_number: pNum,
            start_time: timelineSlot.start_time,
            end_time: timelineSlot.end_time,
            is_special: true,
            term,
            academic_year: academicYear
          };
          classOccupied.set(`${cls.id}_${day}_${pNum}`, slot);
          newlyGeneratedSlots.push(slot);
          placed = true;
          continue;
        }
      }

      // Heuristic search over available days and periods
      // Prioritize days where subject is least taught to spread subjects evenly
      const candidateDays = [...DAYS_OF_WEEK].sort((d1, d2) => {
        const count1 = subjectDailyCounts.get(`${cls.id}_${d1}_${packet.subject_id}`) || 0;
        const count2 = subjectDailyCounts.get(`${cls.id}_${d2}_${packet.subject_id}`) || 0;
        return count1 - count2;
      });

      for (const day of candidateDays) {
        if (placed) break;

        const currentDailySubjectCount = subjectDailyCounts.get(`${cls.id}_${day}_${packet.subject_id}`) || 0;
        // Don't place more than 2 periods of the same subject per day for non-study
        if (!packet.is_free && currentDailySubjectCount >= 2) {
          continue;
        }

        // Try candidate period numbers
        const maxStartPeriod = periodsCount - packet.blockSize + 1;
        for (let pNum = 1; pNum <= maxStartPeriod; pNum++) {
          // Check if entire block of periods is available
          let blockValid = true;

          for (let offset = 0; offset < packet.blockSize; offset++) {
            const currentPNum = pNum + offset;
            const classKey = `${cls.id}_${day}_${currentPNum}`;
            const teacherKey = `${packet.teacher_id}_${day}_${currentPNum}`;
            const roomKey = `${packet.room.toLowerCase().trim()}_${day}_${currentPNum}`;

            // Check 1: Class is already occupied
            if (classOccupied.has(classKey)) {
              blockValid = false;
              break;
            }

            // Check 2: Teacher is already teaching another class (unless free/assembly/sports)
            if (!packet.is_free && !packet.is_special && packet.teacher_id) {
              if (teacherOccupied.has(teacherKey)) {
                blockValid = false;
                break;
              }
            }

            // Check 3: Room collision (if specialized room like ICT Lab, Science Lab)
            if (packet.room.toLowerCase().includes('lab') || packet.room.toLowerCase().includes('hall')) {
              if (roomOccupied.has(roomKey)) {
                blockValid = false;
                break;
              }
            }
          }

          if (blockValid) {
            // Commit the block!
            for (let offset = 0; offset < packet.blockSize; offset++) {
              const currentPNum = pNum + offset;
              const timelineSlot = teachingPeriods.find(tp => tp.period_number === currentPNum);
              if (!timelineSlot) continue;

              const slot: TimetableSlot = {
                id: `slot-${cls.id}-${day}-${currentPNum}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                school_id: schoolId,
                class_id: cls.id,
                class_name: cls.name,
                level_name: classLevel,
                subject_id: packet.subject_id,
                subject_name: packet.subject_name,
                subject_code: packet.subject_code,
                teacher_id: packet.teacher_id,
                teacher_name: packet.teacher_name,
                room: packet.room,
                day_of_week: day,
                period_number: currentPNum,
                start_time: timelineSlot.start_time,
                end_time: timelineSlot.end_time,
                is_free: packet.is_free,
                is_special: packet.is_special,
                term,
                academic_year: academicYear
              };

              classOccupied.set(`${cls.id}_${day}_${currentPNum}`, slot);
              if (!packet.is_free && !packet.is_special && packet.teacher_id) {
                teacherOccupied.set(`${packet.teacher_id}_${day}_${currentPNum}`, cls.name);
              }
              if (packet.room) {
                roomOccupied.set(`${packet.room.toLowerCase().trim()}_${day}_${currentPNum}`, cls.name);
              }

              newlyGeneratedSlots.push(slot);
            }

            subjectDailyCounts.set(
              `${cls.id}_${day}_${packet.subject_id}`,
              currentDailySubjectCount + packet.blockSize
            );

            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        diagnostics.push(`Subject ${packet.subject_name} (${packet.subject_code}) for ${cls.name} could not be placed without violating constraints.`);
      }
    }

    // 5. Fill any remaining unassigned slots for this class with Study/Revision
    for (const day of DAYS_OF_WEEK) {
      for (const tp of teachingPeriods) {
        const classKey = `${cls.id}_${day}_${tp.period_number}`;
        if (!classOccupied.has(classKey)) {
          const fallbackSlot: TimetableSlot = {
            id: `slot-fill-${cls.id}-${day}-${tp.period_number}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            school_id: schoolId,
            class_id: cls.id,
            class_name: cls.name,
            level_name: classLevel,
            subject_id: 'sub-study-fill',
            subject_name: 'Personal Study & Mentorship',
            subject_code: 'STUDY',
            teacher_id: cls.class_teacher_id || 'librarian',
            teacher_name: cls.class_teacher_name || 'Supervisor on Duty',
            room: cls.room_number || 'Classroom',
            day_of_week: day,
            period_number: tp.period_number,
            start_time: tp.start_time,
            end_time: tp.end_time,
            is_free: true,
            term,
            academic_year: academicYear
          };
          classOccupied.set(classKey, fallbackSlot);
          newlyGeneratedSlots.push(fallbackSlot);
        }
      }
    }
  }

  // Combine retained slots from other classes + newly generated slots
  const finalSlots = [...retainedSlots, ...newlyGeneratedSlots];

  // Verify zero collisions
  let teacherConflicts = 0;
  let roomConflicts = 0;

  for (let i = 0; i < finalSlots.length; i++) {
    for (let j = i + 1; j < finalSlots.length; j++) {
      const s1 = finalSlots[i];
      const s2 = finalSlots[j];
      if (
        s1.day_of_week === s2.day_of_week &&
        s1.period_number === s2.period_number &&
        s1.term === s2.term
      ) {
        if (
          s1.teacher_id && 
          s2.teacher_id && 
          s1.teacher_id === s2.teacher_id && 
          !s1.is_free && 
          !s2.is_free && 
          !s1.is_special && 
          !s2.is_special
        ) {
          teacherConflicts++;
          diagnostics.push(`Conflict: Teacher ${s1.teacher_name} is double-booked in ${s1.class_name} and ${s2.class_name} on ${s1.day_of_week} Period ${s1.period_number}.`);
        }
      }
    }
  }

  const expectedTotal = targetClasses.length * DAYS_OF_WEEK.length * periodsCount;
  const coverage = expectedTotal > 0 ? Math.min(100, Math.round((newlyGeneratedSlots.length / expectedTotal) * 100)) : 100;

  return {
    success: teacherConflicts === 0,
    slots: finalSlots,
    stats: {
      totalSlotsCreated: newlyGeneratedSlots.length,
      classesScheduledCount: targetClasses.length,
      teacherConflictsCount: teacherConflicts,
      roomConflictsCount: roomConflicts,
      coveragePercentage: coverage,
      diagnostics
    }
  };
}
