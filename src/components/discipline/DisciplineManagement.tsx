import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  DoorOpen, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Smartphone, 
  Filter, 
  Sparkles,
  ShieldCheck,
  Edit3,
  Award,
  Users,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { DisciplineIncident, PermissionExitRecord, StudentConductRecord, Student } from '../../types';
import { PassportPhoto } from '../common/PassportPhoto';

export const DisciplineManagement: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    students, 
    classes,
    disciplineIncidents, 
    permissions, 
    studentConducts,
    getStudentConduct,
    updateStudentConduct,
    bulkUpdateClassConduct,
    recordDiscipline, 
    issuePermissionPass, 
    markStudentReturned,
    updateStudent,
    triggerConfetti 
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'CONDUCT_REGISTER' | 'INCIDENTS' | 'GATE_PASSES'>('CONDUCT_REGISTER');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Conduct Register State
  const schoolClasses = useMemo(() => {
    return classes.filter(c => c.school_id === activeSchool.id);
  }, [classes, activeSchool.id]);

  const [selectedClassId, setSelectedClassId] = useState<string>(schoolClasses[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');
  
  // Selected class students
  const classStudents = useMemo(() => {
    return students
      .filter(s => s.school_id === activeSchool.id && (selectedClassId ? s.class_id === selectedClassId : true))
      .filter(s => {
        const query = studentSearch.toLowerCase();
        return s.first_name.toLowerCase().includes(query) ||
               s.last_name.toLowerCase().includes(query) ||
               s.registration_number.toLowerCase().includes(query);
      });
  }, [students, activeSchool.id, selectedClassId, studentSearch]);

  const selectedClassObj = useMemo(() => {
    return schoolClasses.find(c => c.id === selectedClassId);
  }, [schoolClasses, selectedClassId]);

  // Modal State for Conduct Edit
  const [showConductModal, setShowConductModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [conductScore, setConductScore] = useState<number>(40);
  const [conductStatus, setConductStatus] = useState<StudentConductRecord['status']>('GOOD');
  const [conductDemerits, setConductDemerits] = useState<number>(0);
  const [conductCommendations, setConductCommendations] = useState<number>(0);
  const [conductRemarks, setConductRemarks] = useState('');

  // Modals for Incidents and Passes
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Incident Form State
  const [incidentClassId, setIncidentClassId] = useState<string>('all');
  const [incidentStudentSearch, setIncidentStudentSearch] = useState<string>('');
  const [incidentStudentId, setIncidentStudentId] = useState(students[0]?.id || '');
  const [category, setCategory] = useState<DisciplineIncident['category']>('Misconduct');
  const [severity, setSeverity] = useState<DisciplineIncident['severity']>('Medium');
  const [demeritsDeducted, setDemeritsDeducted] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [notifyParent, setNotifyParent] = useState(true);

  // Filtered students for incident modal search
  const filteredIncidentStudents = useMemo(() => {
    return students.filter(s => {
      if (incidentClassId && incidentClassId !== 'all' && s.class_id !== incidentClassId) {
        return false;
      }
      if (incidentStudentSearch.trim()) {
        const q = incidentStudentSearch.toLowerCase().trim();
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const reg = (s.registration_number || '').toLowerCase();
        return fullName.includes(q) || reg.includes(q);
      }
      return true;
    });
  }, [students, incidentClassId, incidentStudentSearch]);

  const handleSeverityChange = (sev: DisciplineIncident['severity']) => {
    setSeverity(sev);
    if (sev === 'Low') setDemeritsDeducted(1);
    else if (sev === 'Medium') setDemeritsDeducted(2);
    else if (sev === 'High') setDemeritsDeducted(5);
    else if (sev === 'Severe') setDemeritsDeducted(10);
  };

  // Gate Pass Form State
  const [passClassId, setPassClassId] = useState<string>('all');
  const [passStudentSearch, setPassStudentSearch] = useState<string>('');
  const [passStudentId, setPassStudentId] = useState(students[0]?.id || '');
  const [reason, setReason] = useState('Medical appointment at King Faisal Hospital');
  const [destination, setDestination] = useState('Kigali');
  const [departureTime, setDepartureTime] = useState('14:00');
  const [expectedReturnTime, setExpectedReturnTime] = useState('18:00');

  // Filtered and class-grouped students for Gate Pass Modal
  const filteredPassStudents = useMemo(() => {
    return students.filter(s => {
      if (passClassId && passClassId !== 'all' && s.class_id !== passClassId) {
        return false;
      }
      if (passStudentSearch.trim()) {
        const q = passStudentSearch.toLowerCase().trim();
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const reg = (s.registration_number || '').toLowerCase();
        return fullName.includes(q) || reg.includes(q);
      }
      return true;
    });
  }, [students, passClassId, passStudentSearch]);

  const groupedPassStudents = useMemo(() => {
    const map: Record<string, Student[]> = {};
    filteredPassStudents.forEach(st => {
      const clsName = st.class_name || 'Unassigned Class';
      if (!map[clsName]) map[clsName] = [];
      map[clsName].push(st);
    });
    return map;
  }, [filteredPassStudents]);

  // Open conduct editor for single student
  const handleOpenConductModal = (st: Student) => {
    const existing = getStudentConduct(st.id);
    setEditingStudent(st);
    setConductScore(existing.conduct_score);
    setConductStatus(existing.status);
    setConductDemerits(existing.demerits_count);
    setConductCommendations(existing.commendations_count);
    setConductRemarks(existing.remarks || '');
    setShowConductModal(true);
  };

  const handleSaveConduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const existing = getStudentConduct(editingStudent.id);
    const scoreDiff = existing.conduct_score - Number(conductScore);

    let computedGrade: StudentConductRecord['conduct_grade'] = 'A';
    if (conductScore >= 36) computedGrade = 'A';
    else if (conductScore >= 30) computedGrade = 'B';
    else if (conductScore >= 24) computedGrade = 'C';
    else if (conductScore >= 18) computedGrade = 'D';
    else computedGrade = 'F';

    updateStudentConduct(editingStudent.id, {
      conduct_score: Number(conductScore),
      conduct_grade: computedGrade,
      status: conductStatus,
      demerits_count: Number(conductDemerits),
      commendations_count: Number(conductCommendations),
      remarks: conductRemarks.trim()
    });

    if (updateStudent) {
      updateStudent(editingStudent.id, {
        conduct_score: Number(conductScore),
        conduct_grade: computedGrade
      });
    }

    // Consider demerited conduct marks in Class Conduct Register as a Discipline Incident too
    if (scoreDiff > 0) {
      recordDiscipline({
        student_id: editingStudent.id,
        student_name: `${editingStudent.first_name} ${editingStudent.last_name}`,
        class_name: editingStudent.class_name,
        date: new Date().toISOString().substring(0, 10),
        category: 'Misconduct',
        severity: scoreDiff >= 10 ? 'Severe' : scoreDiff >= 5 ? 'High' : scoreDiff >= 2 ? 'Medium' : 'Low',
        description: conductRemarks ? `Conduct Register Demerit (-${scoreDiff} pts): ${conductRemarks}` : `Deducted ${scoreDiff} conduct points in Class Conduct Register`,
        action_taken: 'Conduct Register Adjustment',
        recorded_by_name: currentUser.name,
        term: activeSchool.active_term,
        parent_notified: true,
      });
    }

    triggerConfetti();
    setShowConductModal(false);
  };

  const handleBulkResetClassConduct = () => {
    if (!selectedClassObj) return;
    if (window.confirm(`Initialize / Reset all students in ${selectedClassObj.name} to full conduct score (40/40 - Grade A)?`)) {
      bulkUpdateClassConduct(selectedClassObj.id, 40, 'EXEMPLARY', 'Full conduct points maintained.');
      triggerConfetti();
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === incidentStudentId) || filteredIncidentStudents[0];
    if (!st) {
      alert("Please select a valid student.");
      return;
    }

    recordDiscipline({
      student_id: st.id,
      student_name: `${st.first_name} ${st.last_name}`,
      class_name: st.class_name,
      date: new Date().toISOString().substring(0, 10),
      category,
      severity,
      description: `${description} [Demerited ${demeritsDeducted} pts]`,
      action_taken: actionTaken,
      recorded_by_name: currentUser.name,
      term: activeSchool.active_term,
      parent_notified: notifyParent,
    });

    // Automatically deduct demerit points from student conduct score
    const existing = getStudentConduct(st.id);
    const ptsDeducted = Number(demeritsDeducted) || 0;
    const newConductScore = Math.max(0, (existing.conduct_score ?? 40) - ptsDeducted);
    const newDemeritsCount = (existing.demerits_count || 0) + ptsDeducted;

    let computedGrade: StudentConductRecord['conduct_grade'] = 'A';
    if (newConductScore >= 36) computedGrade = 'A';
    else if (newConductScore >= 30) computedGrade = 'B';
    else if (newConductScore >= 24) computedGrade = 'C';
    else if (newConductScore >= 18) computedGrade = 'D';
    else computedGrade = 'F';

    let newStatus: StudentConductRecord['status'] = 'EXEMPLARY';
    if (newConductScore >= 36) newStatus = 'EXEMPLARY';
    else if (newConductScore >= 30) newStatus = 'WARNING';
    else if (newConductScore >= 24) newStatus = 'PROBATION';
    else newStatus = 'SUSPENSION';

    updateStudentConduct(st.id, {
      conduct_score: newConductScore,
      conduct_grade: computedGrade,
      status: newStatus,
      demerits_count: newDemeritsCount,
      remarks: `Deducted ${ptsDeducted} pts for ${category}: ${description}`
    });

    if (updateStudent) {
      updateStudent(st.id, {
        conduct_score: newConductScore,
        conduct_grade: computedGrade
      });
    }

    triggerConfetti();
    setShowIncidentModal(false);
    setDescription('');
    setActionTaken('');
    setIncidentStudentSearch('');
  };

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === passStudentId) || filteredPassStudents[0];
    if (!st) {
      alert("Please select a valid student for the Gate Pass.");
      return;
    }

    issuePermissionPass({
      student_id: st.id,
      student_name: `${st.first_name} ${st.last_name}`,
      student_reg: st.registration_number,
      class_name: st.class_name,
      departure_time: departureTime,
      expected_return_time: expectedReturnTime,
      reason,
      destination,
      authorized_by: currentUser.name,
      parent_notified: true,
    });

    triggerConfetti();
    setShowPassModal(false);
    setPassStudentSearch('');
  };

  const getStatusBadge = (status: StudentConductRecord['status']) => {
    switch (status) {
      case 'EXEMPLARY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Exemplary</span>;
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">Good</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">Warning</span>;
      case 'PROBATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/40">Probation</span>;
      case 'SUSPENSION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">Suspended</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">Standard</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Director of Discipline (DOD) & Conduct Office</span>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-rose-400" />}
              <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Student Conduct Register & Campus Security
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Classified class-by-class student conduct management, behavioral demerits evaluation, disciplinary incident logging, and automated parent SMS notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'CONDUCT_REGISTER' && (
            <button
              onClick={handleBulkResetClassConduct}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Reset Class Conduct (40/40)</span>
            </button>
          )}

          {activeTab === 'INCIDENTS' && (
            <button
              onClick={() => setShowIncidentModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Disciplinary Incident</span>
            </button>
          )}

          {activeTab === 'GATE_PASSES' && (
            <button
              onClick={() => setShowPassModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Gate Exeat Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Mobile Menu Ribbon */}
      {isMobileMenuOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-1 gap-2 md:hidden shadow-lg">
          <button
            onClick={() => { setActiveTab('CONDUCT_REGISTER'); setIsMobileMenuOpen(false); }}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2.5 ${
              activeTab === 'CONDUCT_REGISTER' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>1. Class Conduct Register (DOD Hub)</span>
          </button>
          <button
            onClick={() => { setActiveTab('INCIDENTS'); setIsMobileMenuOpen(false); }}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2.5 ${
              activeTab === 'INCIDENTS' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>2. Disciplinary Incident Log ({disciplineIncidents.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('GATE_PASSES'); setIsMobileMenuOpen(false); }}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-2.5 ${
              activeTab === 'GATE_PASSES' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-blue-300" />
            <span>3. Gate Exeats & Passes ({permissions.length})</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CONDUCT_REGISTER')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'CONDUCT_REGISTER'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. Class Conduct Register (DOD Hub)</span>
        </button>

        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'INCIDENTS'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. Disciplinary Incident Log ({disciplineIncidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GATE_PASSES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'GATE_PASSES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>3. Gate Exeats & Passes ({permissions.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CLASS-BY-CLASS CONDUCT REGISTER (DOD EXCLUSIVE)
          ========================================================================= */}
      {activeTab === 'CONDUCT_REGISTER' && (
        <div className="space-y-4">
          
          {/* Class Selector Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-slate-300">Select Class:</span>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
                >
                  {schoolClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level_name || c.level} · Stream {c.stream})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter student in class..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Active Term: <strong className="text-amber-300">{activeSchool.active_academic_year} · {activeSchool.active_term}</strong>
            </div>
          </div>

          {/* Student Conduct Table */}
          {classStudents.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Students in Selected Class</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Select another class or enroll students to view and grade their behavioral conduct.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                    <th className="p-3.5">Student Info</th>
                    <th className="p-3.5">Reg Number</th>
                    <th className="p-3.5">Conduct Score</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Discipline Status</th>
                    <th className="p-3.5">Demerits</th>
                    <th className="p-3.5">Commendations</th>
                    <th className="p-3.5">Remarks</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {classStudents.map(st => {
                    const conduct = getStudentConduct(st.id);
                    const scorePct = Math.round((conduct.conduct_score / 40) * 100);

                    return (
                      <tr key={st.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <PassportPhoto 
                              src={st.photo_url || st.avatar_url} 
                              alt={`${st.first_name} ${st.last_name}`}
                              shape="rounded"
                              border={false}
                              className="w-7 h-7 rounded-lg border border-slate-700" 
                            />
                            <div>
                              <div className="font-bold text-white">{st.first_name} {st.last_name}</div>
                              <div className="text-[10px] text-slate-400">{st.gender} · {st.class_name}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-slate-300">
                          {st.registration_number}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-white text-sm">
                              {conduct.conduct_score}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">/ 40 pts</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${scorePct >= 85 ? 'bg-emerald-500' : scorePct >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold ${
                            conduct.conduct_grade === 'A' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : conduct.conduct_grade === 'B'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : conduct.conduct_grade === 'C'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            Grade {conduct.conduct_grade}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {getStatusBadge(conduct.status)}
                        </td>

                        <td className="p-3.5 font-mono">
                          <span className={conduct.demerits_count > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                            {conduct.demerits_count} offenses
                          </span>
                        </td>

                        <td className="p-3.5 font-mono">
                          <span className={conduct.commendations_count > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {conduct.commendations_count} awards
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                          {conduct.remarks || 'Conduct is in order.'}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenConductModal(st)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Evaluate</span>
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
          TAB 2: DISCIPLINARY INCIDENT REGISTER
          ========================================================================= */}
      {activeTab === 'INCIDENTS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Action Taken</th>
                <th className="py-3.5 px-4">Recorded By</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {disciplineIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div>{inc.student_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inc.class_name}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{inc.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'Severe'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : inc.severity === 'High'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{inc.description}</td>
                  <td className="py-3.5 px-4 text-slate-300">{inc.action_taken}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inc.recorded_by_name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{inc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          TAB 3: GATE PASSES & EXEATS
          ========================================================================= */}
      {activeTab === 'GATE_PASSES' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student & Reg</th>
                <th className="py-3.5 px-4">Destination & Reason</th>
                <th className="py-3.5 px-4">Departure Time</th>
                <th className="py-3.5 px-4">Expected Return</th>
                <th className="py-3.5 px-4">Authorized By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissions.map(pass => (
                <tr key={pass.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{pass.student_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{pass.student_reg} · {pass.class_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{pass.destination}</div>
                    <div className="text-[10px] text-slate-400">{pass.reason}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{pass.departure_time}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{pass.expected_return_time}</td>
                  <td className="py-3.5 px-4 text-slate-400">{pass.authorized_by}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pass.status === 'RETURNED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : pass.status === 'OVERSTAYED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {pass.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {pass.status === 'OUT' && (
                      <button
                        onClick={() => markStudentReturned(pass.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      >
                        Confirm Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONDUCT EVALUATOR
          ========================================================================= */}
      {showConductModal && editingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Conduct & Discipline Assessment
                </h3>
              </div>
              <button
                onClick={() => setShowConductModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <PassportPhoto 
                src={editingStudent.photo_url || editingStudent.avatar_url} 
                alt={editingStudent.first_name}
                shape="rounded"
                border={false}
                className="w-10 h-10 rounded-xl border border-slate-700" 
              />
              <div>
                <div className="text-sm font-bold text-white">{editingStudent.first_name} {editingStudent.last_name}</div>
                <div className="text-xs text-slate-400 font-mono">{editingStudent.registration_number} · {editingStudent.class_name}</div>
              </div>
            </div>

            <form onSubmit={handleSaveConduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Conduct Score (Max 40 Pts) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={conductScore}
                    onChange={e => setConductScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Discipline Standing *
                  </label>
                  <select
                    value={conductStatus}
                    onChange={e => setConductStatus(e.target.value as StudentConductRecord['status'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="EXEMPLARY">Exemplary Standing</option>
                    <option value="GOOD">Good Standing</option>
                    <option value="WARNING">Disciplinary Warning</option>
                    <option value="PROBATION">Under Probation</option>
                    <option value="SUSPENSION">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Offenses / Demerits Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={conductDemerits}
                    onChange={e => setConductDemerits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Commendations / Merits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={conductCommendations}
                    onChange={e => setConductCommendations(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  DOD Assessment Remarks / Behavioral Notes
                </label>
                <textarea
                  value={conductRemarks}
                  onChange={e => setConductRemarks(e.target.value)}
                  rows={2}
                  placeholder="e.g. Respectful and compliant with dress code and campus rules."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConductModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG INCIDENT */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Log Disciplinary Incident</h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Filter Class
                  </label>
                  <select
                    value={incidentClassId}
                    onChange={e => {
                      setIncidentClassId(e.target.value);
                      const matchSt = students.find(s => e.target.value === 'all' || s.class_id === e.target.value);
                      if (matchSt) setIncidentStudentId(matchSt.id);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="all">All School Classes</option>
                    {schoolClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Search Student
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Name or Reg Code..."
                      value={incidentStudentSearch}
                      onChange={e => setIncidentStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Student * ({filteredIncidentStudents.length} matching)
                </label>
                <select
                  value={incidentStudentId}
                  onChange={e => setIncidentStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                >
                  {filteredIncidentStudents.length === 0 ? (
                    <option value="">No students found in filter</option>
                  ) : (
                    filteredIncidentStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.registration_number} · {s.class_name})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Misconduct">Misconduct</option>
                    <option value="Late Arrival">Late Arrival</option>
                    <option value="Uniform Violation">Uniform Violation</option>
                    <option value="Academic Dishonesty">Academic Dishonesty</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={e => handleSeverityChange(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Low">Low (-1 pt)</option>
                    <option value="Medium">Medium (-2 pts)</option>
                    <option value="High">High (-5 pts)</option>
                    <option value="Severe">Severe (-10 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-300 mb-1.5">
                    Demerits Deducted *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={demeritsDeducted}
                    onChange={e => setDemeritsDeducted(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Incident Description *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe what occurred on campus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corrective Action Taken *
                </label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={e => setActionTaken(e.target.value)}
                  placeholder="e.g. Parental summons, campus community service"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notifyParent"
                  checked={notifyParent}
                  onChange={e => setNotifyParent(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="notifyParent" className="text-xs text-slate-300 cursor-pointer">
                  Send immediate SMS alert to guardian's phone
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  Record Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE GATE PASS */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Issue Digital Exeat / Gate Pass</h3>
              </div>
              <button
                onClick={() => setShowPassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePassSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Filter Class
                  </label>
                  <select
                    value={passClassId}
                    onChange={e => {
                      setPassClassId(e.target.value);
                      const matchSt = students.find(s => e.target.value === 'all' || s.class_id === e.target.value);
                      if (matchSt) setPassStudentId(matchSt.id);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All School Classes</option>
                    {schoolClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Search Student
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Name or Reg Code..."
                      value={passStudentSearch}
                      onChange={e => setPassStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Student * ({filteredPassStudents.length} matching)
                </label>
                <select
                  value={passStudentId}
                  onChange={e => setPassStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {Object.keys(groupedPassStudents).length === 0 ? (
                    <option value="">No students found in filter</option>
                  ) : (
                    Object.entries(groupedPassStudents).map(([clsName, stList]) => (
                      <optgroup key={clsName} label={`Class: ${clsName}`}>
                        {stList.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.first_name} {s.last_name} ({s.registration_number})
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Kigali City Center, District Hospital"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason for Exeat *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Medical checkup, family emergency"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Expected Return Time
                  </label>
                  <input
                    type="time"
                    value={expectedReturnTime}
                    onChange={e => setExpectedReturnTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  Authorize Exeat Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
