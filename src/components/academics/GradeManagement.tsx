import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  Download, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Save, 
  BookOpen,
  Lock,
  Clock,
  Printer,
  Trash2
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { AssessmentType } from '../../types';
import { 
  generateClassReportCards, 
  downloadClassReportsPdf, 
  downloadSingleStudentPdf 
} from '../../utils/reportCardGenerator';

export const GradeManagement: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    students, 
    subjects, 
    classes, 
    grades, 
    submitGrade,
    deleteGrade,
    deleteGradeBatch,
    setCurrentView
  } = useElimu();

  const isDirectorOrDOS = currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'DOS' || currentUser.role === 'SUPER_ADMIN';

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>('End of Unit Test');
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(1);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const targetSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const classStudents = students.filter(s => s.class_id === selectedClassId && (s.school_id === activeSchool.id || s.school_id === 'all'));

  // Precompute ranked reports strictly sorted from 1st position to last position
  const computedReports = React.useMemo(() => {
    if (!targetClass || classStudents.length === 0) return [];
    return generateClassReportCards({
      selectedClass: targetClass,
      students: classStudents,
      grades,
      subjects,
      term: activeSchool.active_term || 'Term 1',
      academicYear: activeSchool.active_academic_year || '2026',
      reportMode: 'TERMINAL'
    });
  }, [targetClass, classStudents, grades, subjects, activeSchool.active_term, activeSchool.active_academic_year]);

  // Maximum marks exact to the Rwandan formula: 1 period = 10 marks (e.g., 6 periods = 60 marks max)
  const exactPeriodMaxMarks = (targetSubject?.periods_per_week || 4) * 10;
  const [customMaxMarks, setCustomMaxMarks] = useState<number>(exactPeriodMaxMarks);

  // Mark entry draft values in local state
  const [markInputs, setMarkInputs] = useState<Record<string, number | ''>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSaveAllMarks = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isDirectorOrDOS) {
      alert('Action Unauthorized: School Directors and Directors of Studies (DOS) are restricted by institutional governance from modifying teacher marks.');
      return;
    }

    // Validation check across all inputs
    for (const st of classStudents) {
      const inputVal = markInputs[st.id];
      if (inputVal !== undefined && inputVal !== '') {
        const numVal = Number(inputVal);
        if (numVal > customMaxMarks) {
          const err = `Validation Error: Mark (${numVal}) for student "${st.first_name} ${st.last_name}" exceeds the maximum set score of ${customMaxMarks} marks. Please adjust before saving.`;
          setValidationError(err);
          alert(err);
          return;
        }
        if (numVal < 0) {
          const err = `Validation Error: Mark for student "${st.first_name} ${st.last_name}" cannot be negative.`;
          setValidationError(err);
          alert(err);
          return;
        }
      }
    }

    let savedCount = 0;
    classStudents.forEach(st => {
      const inputVal = markInputs[st.id];
      if (inputVal === undefined || inputVal === '') {
        return; // Do not submit empty or unentered marks
      }

      const markVal = Number(inputVal);
      const remarkVal = remarkInputs[st.id] || 'Demonstrated consistent competence in assessment.';
      submitGrade({
        student_id: st.id,
        student_name: `${st.first_name} ${st.last_name}`,
        subject_id: targetSubject.id,
        subject_name: targetSubject.name,
        class_id: selectedClassId,
        term: activeSchool.active_term || 'Term 1',
        academic_year: activeSchool.active_academic_year || '2026',
        assessment_type: selectedAssessment,
        period_number: selectedPeriodNumber,
        marks: markVal,
        max_marks: customMaxMarks,
        teacher_id: currentUser.id,
        teacher_name: currentUser.name,
        remarks: remarkVal,
      });
      savedCount++;
    });

    setSaveSuccessMsg(`Grades for ${savedCount} student(s) successfully recorded and verified.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Direct download PDF of an individual student without any popup
  const handleDownloadSinglePdf = async (studentId: string) => {
    try {
      setDownloadingStudentId(studentId);
      const rc = computedReports.find(r => r.student.id === studentId);
      if (!rc) {
        alert('Could not compute report card data for this student.');
        return;
      }
      await downloadSingleStudentPdf({
        report: rc,
        school: activeSchool
      });
    } catch (err) {
      console.error('Failed to generate report card PDF:', err);
      alert('Error generating PDF report card. Please try again.');
    } finally {
      setDownloadingStudentId(null);
    }
  };

  // Direct batch download of all reports in class placed compared to one another (strictly 1st position to last)
  const handleBatchDownloadAllPdf = async () => {
    try {
      setIsBatchDownloading(true);
      if (computedReports.length === 0) {
        alert('No registered students found in this class to generate reports.');
        return;
      }

      await downloadClassReportsPdf({
        classRoom: targetClass,
        term: activeSchool.active_term || 'Term 1',
        reports: computedReports,
        school: activeSchool,
        reportMode: 'TERMINAL',
        onProgress: (current, total) => {
          setBatchProgress({ current, total });
        }
      });
    } catch (err) {
      console.error('Batch download error:', err);
      alert('An error occurred while generating batch report cards.');
    } finally {
      setIsBatchDownloading(false);
      setBatchProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <span>Academic Administration · Marks & Examination Directorate</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Marks Entry & Subject Evaluation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Record, audit, and commit student assessment marks by subject and class. Maximum score matches weekly period weighting ({exactPeriodMaxMarks} pts max).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isDirectorOrDOS && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete all recorded marks for ${targetClass?.name} - ${targetSubject?.name} (${selectedAssessment} Period ${selectedPeriodNumber})?`)) {
                    const res = deleteGradeBatch({
                      class_id: selectedClassId,
                      subject_id: selectedSubjectId,
                      assessment_type: selectedAssessment,
                      period_number: selectedPeriodNumber
                    });
                    alert(res.message);
                    setMarkInputs({});
                  }
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title="Delete all recorded marks for this assessment"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Assessment Batch</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('ACADEMICS_REPORTS')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Official Reports Generator (A4 & Annual)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Policy Notice: Teacher Mark Sovereignty */}
      {isDirectorOrDOS ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Director & DOS Audit Mode (Read-Only)</div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Under Rwandan institutional academic policy, the School Director and Director of Studies (DOS) hold audit and certification privileges, but are strictly prohibited from altering marks or maximum marks entered by the Subject Teacher.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-900">Teacher Mark Entry Mode</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              You are logged in as teacher. Enter authentic marks out of the subject maximum ({exactPeriodMaxMarks} periods/week).
            </div>
          </div>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <span className="font-bold">{validationError}</span>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
            >
              {classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all').map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} ({cls.level})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const newSubId = e.target.value;
                setSelectedSubjectId(newSubId);
                const sub = subjects.find(s => s.id === newSubId);
                if (sub) {
                  setCustomMaxMarks((sub.periods_per_week || 4) * 10);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
            >
              {subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all').map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({(sub.periods_per_week || 4) * 10} max pts · {sub.periods_per_week || 4} periods)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Assessment Type
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value as AssessmentType)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
            >
              <option value="End of Unit Test">End of Unit Test</option>
              <option value="Mid term test">Mid term test</option>
              <option value="Quiz">Quiz</option>
              <option value="Test">Test</option>
              <option value="2nd Sitting">2nd Sitting</option>
              <option value="Final Exam">Final Exam</option>
              <option value="CAT">Continuous Assessment (CAT)</option>
              <option value="MID_TERM">Mid-Term Examination</option>
              <option value="END_OF_TERM">End of Term Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Teaching Period
            </label>
            <select
              value={selectedPeriodNumber}
              onChange={(e) => setSelectedPeriodNumber(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                <option key={p} value={p}>Period {p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Max Marks (= Periods/Week)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              disabled={isDirectorOrDOS}
              value={customMaxMarks}
              onChange={(e) => setCustomMaxMarks(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-bold disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Grade Entry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-900 text-xs">
              Mark Register: {targetClass?.name} · {targetSubject?.name} ({selectedAssessment})
            </span>
          </div>
          <span className="text-xs text-slate-600 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Maximum Mark on Report: {customMaxMarks} pts
          </span>
        </div>

        <form onSubmit={handleSaveAllMarks}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-5">Reg Number</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Score (/{customMaxMarks})</th>
                  <th className="py-3 px-5">Performance %</th>
                  <th className="py-3 px-5">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                ) : (
                  classStudents.map(student => {
                    const existingGrade = grades.find(g => 
                      g.student_id === student.id && 
                      g.subject_id === targetSubject?.id && 
                      g.assessment_type === selectedAssessment &&
                      (g.period_number === undefined || g.period_number === selectedPeriodNumber) &&
                      (g.term === (activeSchool.active_term || 'Term 1')) &&
                      (g.academic_year === (activeSchool.active_academic_year || '2026'))
                    );

                    const inputValue = markInputs[student.id] !== undefined
                      ? markInputs[student.id]
                      : (existingGrade ? existingGrade.marks : '');

                    const numVal = inputValue === '' ? null : Number(inputValue);
                    const pct = numVal !== null && customMaxMarks > 0 
                      ? Math.round((numVal / customMaxMarks) * 100) 
                      : null;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                          {student.registration_number}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="py-3.5 px-5">
                          {(() => {
                            const isExceeding = numVal !== null && numVal > customMaxMarks;
                            return (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    max={customMaxMarks}
                                    step="0.5"
                                    disabled={isDirectorOrDOS}
                                    placeholder="--"
                                    value={inputValue}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : Number(e.target.value);
                                      setMarkInputs({ ...markInputs, [student.id]: val });
                                    }}
                                    className={`w-20 px-2.5 py-1.5 rounded-lg font-mono text-xs focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-bold ${
                                      isExceeding
                                        ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 ring-2 ring-rose-300'
                                        : 'bg-white border border-slate-300 text-slate-900 focus:border-slate-600'
                                    }`}
                                  />
                                  {!isDirectorOrDOS && existingGrade && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete mark for ${student.first_name} ${student.last_name}?`)) {
                                          deleteGrade(existingGrade.id);
                                          setMarkInputs({ ...markInputs, [student.id]: '' });
                                        }
                                      }}
                                      className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                                      title="Delete this student mark"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                {isExceeding && (
                                  <div className="text-[9px] font-bold text-rose-600 mt-0.5">
                                    Exceeds {customMaxMarks}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold">
                          {pct !== null ? (
                            <span className={pct >= 70 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-rose-700'}>
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <input
                            type="text"
                            disabled={isDirectorOrDOS}
                            placeholder="Teacher feedback..."
                            defaultValue={existingGrade?.remarks || ''}
                            onChange={(e) => setRemarkInputs({ ...remarkInputs, [student.id]: e.target.value })}
                            className="w-full max-w-sm px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-slate-600 disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isDirectorOrDOS ? 'Read-only mode (Governance: Teacher Mark Sovereignty)' : 'Committed marks are securely synced to database'}
            </span>

            {!isDirectorOrDOS && (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Save & Commit Marks</span>
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
};
