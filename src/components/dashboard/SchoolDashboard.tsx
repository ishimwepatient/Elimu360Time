import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  GraduationCap, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ArrowUpRight, 
  BookOpen, 
  Award,
  Smartphone,
  ShieldCheck,
  DoorOpen,
  Layers,
  Sparkles,
  Laptop
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { TeacherDashboard } from './TeacherDashboard';
import { LeadersHomepage } from './LeadersHomepage';
import { SuperAdminPlatformDashboard } from './SuperAdminPlatformDashboard';

export const SchoolDashboard: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    students, 
    classes, 
    teachers,
    subjects,
    disciplineIncidents,
    permissions,
    getSchoolFinancialSummary, 
    setCurrentView 
  } = useElimu();

  const [activeDashboardTab, setActiveDashboardTab] = React.useState<'ACADEMIC_BRIDGE' | 'OPERATIONS'>('ACADEMIC_BRIDGE');

  // If user is SUPER_ADMIN, render the dedicated Platform Directorate Console
  if (currentUser.role === 'SUPER_ADMIN') {
    return <SuperAdminPlatformDashboard />;
  }

  // If user is a TEACHER, render the dedicated mobile-first, minimalist teacher hub
  if (currentUser.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  // If user is DOD (Director of Discipline), render dedicated Discipline Command Hub
  if (currentUser.role === 'DOD') {
    const activeLeavesCount = permissions.filter(p => p.status === 'OUT' || p.status === 'OVERSTAYED').length;
    const severeIncidentsCount = disciplineIncidents.filter(d => d.severity === 'High' || d.severity === 'Severe').length;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* DOD Header Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-900/50 rounded-2xl p-3.5 sm:p-6 shadow-lg text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                  DOD Discipline Command
                </span>
                <span className="text-[11px] text-rose-300/70 font-mono">• {activeSchool.name}</span>
              </div>
              <h1 className="text-base sm:text-2xl font-black tracking-tight text-white leading-snug">
                Student Conduct & Welfare Operations
              </h1>
              <p className="text-[11px] sm:text-xs text-rose-200/70 mt-1 max-w-xl leading-relaxed">
                Authority focused on student character development, campus rules enforcement, demerit score deductions, gate exeat passes, and direct guardian notices.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentView('STUDENTS_DISCIPLINE')}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Conduct Register</span>
              </button>
              <button
                onClick={() => setCurrentView('STUDENTS_PERMISSIONS')}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Gate Passes ({activeLeavesCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* DOD KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Students Watched</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{students.length}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Full campus enrolment</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Term Incidents</span>
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-900">{disciplineIncidents.length}</div>
            <div className="text-[10px] sm:text-[11px] text-rose-600 font-semibold mt-0.5 truncate">
              {severeIncidentsCount} High/Severe cases
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Active Gate Exeats</span>
              <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900">{activeLeavesCount}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Students outside campus</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Guardian Alert SMS</span>
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900">Active</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Instant SMS notification</div>
          </div>
        </div>

        {/* Action Panel & Recent Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Discipline Incidents */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Recent Disciplinary Incidents</h3>
              </div>
              <button
                onClick={() => setCurrentView('STUDENTS_DISCIPLINE')}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                Log New Incident →
              </button>
            </div>

            {disciplineIncidents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Clean Campus Discipline Record</p>
                <p className="text-[11px] text-slate-500">No disciplinary infractions logged in the active term.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {disciplineIncidents.slice(0, 5).map((inc) => (
                  <div key={inc.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{inc.student_name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-mono text-slate-600 shrink-0">
                          {inc.class_name}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] truncate">{inc.category}: {inc.description}</p>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        inc.severity === 'Severe' ? 'bg-rose-100 text-rose-800' :
                        inc.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {inc.severity}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">{inc.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Gate Exeats Monitor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Gate Exeats</h3>
              </div>
              <button
                onClick={() => setCurrentView('STUDENTS_PERMISSIONS')}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                Gate Passes →
              </button>
            </div>

            {permissions.filter(p => p.status === 'OUT').length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <DoorOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All Students On Campus</p>
                <p className="text-[11px] text-slate-500">No active exit permissions currently checked out.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {permissions.filter(p => p.status === 'OUT').slice(0, 5).map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1 text-xs">
                    <div className="font-bold text-amber-950 flex items-center justify-between">
                      <span>{p.student_name}</span>
                      <span className="text-[10px] text-amber-700 font-mono">{p.departure_time}</span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Reason: {p.reason} ({p.destination})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isDirector = currentUser.role === 'SCHOOL_ADMIN';
  const isBursar = currentUser.role === 'BURSAR';
  const isDos = currentUser.role === 'DOS';

  // If Bursar, default to operations/financial
  const isFinancialRole = isBursar;

  const summary = getSchoolFinancialSummary();
  const boardingCount = students.filter(s => s.boarding_status === 'BOARDING').length;
  const dayCount = students.length - boardingCount;
  const activeLeavesCount = permissions.filter(p => p.status === 'OUT' || p.status === 'OVERSTAYED').length;
  const pendingIncidentsCount = disciplineIncidents.filter(d => d.severity === 'High' || d.severity === 'Severe').length;

  // Leaders experience (School Director / Principal, DOS, Super Admin)
  if (!isFinancialRole) {
    return (
      <div className="space-y-6">
        {/* Tab switcher between Academic Bridge Leaders View and Operations */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveDashboardTab('ACADEMIC_BRIDGE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeDashboardTab === 'ACADEMIC_BRIDGE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Leaders Command · Academic Bridge View</span>
            </button>

            <button
              onClick={() => setActiveDashboardTab('OPERATIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeDashboardTab === 'OPERATIONS'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Financial & Campus Operations</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium px-3">
            <span>{activeSchool.name}</span>
            <span>·</span>
            <span className="font-mono text-blue-700 font-bold">{activeSchool.code || 'U6CRG'}</span>
          </div>
        </div>

        {activeDashboardTab === 'ACADEMIC_BRIDGE' ? (
          <LeadersHomepage />
        ) : (
          <div className="space-y-6">
            {/* Operational KPIs & Ledger */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Campus Operations & Financial Health
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  Institutional Ledger & Operational Capacity
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('FINANCIAL_PORTAL')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Access Financial Portal
              </button>
            </div>

            {/* 4 OPERATIONAL KPIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setCurrentView('STUDENTS_DIRECTORY')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Enrolled Students</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  {students.length > 0 ? students.length : 493}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Day: {dayCount > 0 ? dayCount : 493} · Boarding: {boardingCount}
                </div>
              </div>

              <div 
                onClick={() => setCurrentView('FINANCIAL_PORTAL')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Fee Collection Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                  {summary.collectionRatePercent}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  RWF {summary.totalCollectedRevenue.toLocaleString()} Collected
                </div>
              </div>

              <div 
                onClick={() => setCurrentView('ACADEMICS_CLASSES')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Active Classes & Capacity</span>
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600 mt-2 font-mono">
                  {classes.length > 0 ? classes.length : 9} Classes
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Nursery 1 to Primary 6 Streams
                </div>
              </div>

              <div 
                onClick={() => setCurrentView('STUDENTS_PERMISSIONS')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Campus Safety & Leaves</span>
                  <DoorOpen className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-600 mt-2 font-mono">
                  {activeLeavesCount} Active
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Exit passes monitored in real time
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bursar Financial Dashboard View
  return (
    <div className="space-y-6">
      {/* 4 OPERATIONAL KPIS - TAILORED BY ROLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Student Demographics */}
        <div 
          onClick={() => setCurrentView('STUDENTS_DIRECTORY')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {students.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span>{boardingCount} Boarding</span>
            <span>·</span>
            <span>{dayCount} Day Scholars</span>
          </div>
        </div>

        {/* KPI 2: Role Differentiated */}
        {isBursar ? (
          <div 
            onClick={() => setCurrentView('FINANCIAL_PORTAL')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-700/50 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fee Collection Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {summary.collectionRatePercent}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              RWF {summary.totalCollectedRevenue.toLocaleString()} Collected
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setCurrentView('ACADEMICS_CLASSES')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-700/50 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Classes & Streams</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-2 font-mono">
              {classes.length} Classes
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Capacity: {classes.reduce((sum, c) => sum + (c.capacity || 0), 0)} Seats
            </div>
          </div>
        )}

        {/* KPI 3: Role Differentiated */}
        {isBursar ? (
          <div 
            onClick={() => setCurrentView('FINANCIAL_PORTAL')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-700/50 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Outstanding Tuition</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
              RWF {summary.outstandingTotal.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.defaultersCount} Students with balances
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setCurrentView('STUDENTS_PERMISSIONS')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-700/50 transition cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Gate Passes & Leaves</span>
              <DoorOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-2 font-mono">
              {activeLeavesCount} Active
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {pendingIncidentsCount} Discipline Logs
            </div>
          </div>
        )}

        {/* KPI 4: Faculty & Academics */}
        <div 
          onClick={() => setCurrentView(isDirector ? 'STAFF_MANAGEMENT' : 'ACADEMICS_TIMETABLE')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-700/50 transition cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Faculty & Subjects</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {teachers.length} Faculty
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {subjects.length} Accredited Subjects
          </div>
        </div>

      </div>

      {/* BENTO GRID: ACADEMIC & INSTITUTIONAL SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Classes & Academic Streams (or Bursar Financial Ledger) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* If Bursar or Super Admin: show Financial Breakdown */}
          {isBursar && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Fee Collection Target vs Actual</span>
                </h3>
                <button 
                  onClick={() => setCurrentView('FINANCIAL_PORTAL')}
                  className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Bursar Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Tuition Collections</div>
                  <div className="text-base font-bold text-white mt-1 font-mono">RWF {summary.totalCollectedRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Outstanding Dues</div>
                  <div className="text-base font-bold text-amber-400 mt-1 font-mono">RWF {summary.outstandingTotal.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Defaulters Flagged</div>
                  <div className="text-base font-bold text-rose-400 mt-1 font-mono">{summary.defaultersCount} Students</div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Classes & Stream Capacity Overview (For Director, DOS, Teachers) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Classroom Capacity & Enrollment Streams</span>
              </h3>
              {isDirector && (
                <button 
                  onClick={() => setCurrentView('ACADEMICS_CLASSES')}
                  className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Classes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {classes.slice(0, 5).map(cls => {
                const enrolled = students.filter(s => s.class_id === cls.id || s.class_name === cls.name);
                const occupancyPercent = Math.min(100, Math.round((enrolled.length / (cls.capacity || 1)) * 100));

                return (
                  <div key={cls.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">{cls.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                          {cls.level}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Class Teacher: <span className="text-slate-300 font-medium">{cls.class_teacher_name || 'Assigned'}</span> · Room: {cls.room_number || '101'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-white">
                        {enrolled.length} / {cls.capacity}
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-500" 
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Academic Governance Launchpad */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Quick Launchpad</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setCurrentView('STUDENTS_DIRECTORY')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <Users className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">Student 360</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Admissions & files</div>
              </button>

              <button
                onClick={() => setCurrentView('ACADEMICS_REPORTS')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <GraduationCap className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">Report Cards</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Grades & transcripts</div>
              </button>

              <button
                onClick={() => setCurrentView('ACADEMICS_TIMETABLE')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">Timetables</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Conflict-free schedule</div>
              </button>

              <button
                onClick={() => setCurrentView('STUDENTS_PERMISSIONS')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <DoorOpen className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">Gate Passes</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Campus security</div>
              </button>

              <button
                onClick={() => setCurrentView('SMS_DISPATCHER')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <Smartphone className="w-5 h-5 text-pink-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">SMS Carrier</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Parent alerts</div>
              </button>

              <button
                onClick={() => setCurrentView('ACADEMICS_ELEARNING')}
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition cursor-pointer group"
              >
                <Laptop className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-xs text-white">E-Learning</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Quizzes & lessons</div>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Institution Info & Faculty Roster */}
        <div className="space-y-6">
          
          {/* Institutional Identity Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold font-display text-lg">
                {activeSchool.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{activeSchool.name}</h4>
                <p className="text-[11px] text-slate-400">{activeSchool.city || activeSchool.district || 'Kigali'}, {activeSchool.country || 'Rwanda'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-800 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Institutional Code:</span>
                <span className="font-mono font-bold text-white">{activeSchool.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Curriculum:</span>
                <span className="font-medium text-amber-300">{activeSchool.curriculum_type || 'National Curriculum'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Session:</span>
                <span className="font-medium text-emerald-400">{activeSchool.active_academic_year} · {activeSchool.active_term}</span>
              </div>
            </div>
          </div>

          {/* Faculty Delegation Status */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Assigned Faculty ({teachers.length})
              </h4>
              {isDirector && (
                <button
                  onClick={() => setCurrentView('STAFF_MANAGEMENT')}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Manage
                </button>
              )}
            </div>

            <div className="space-y-2">
              {teachers.slice(0, 4).map(t => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.role.replace('_', ' ')}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
