import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Database, 
  ImageIcon, 
  PlusCircle, 
  ArrowRight, 
  Lock, 
  RefreshCw,
  Sparkles,
  Server,
  AlertCircle,
  GraduationCap,
  UserCheck,
  Briefcase,
  School as SchoolIcon,
  BarChart3,
  ClipboardList,
  Coins,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Search,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Info,
  Award,
  Wallet
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { ProductIntelligenceDashboard } from '../analytics/ProductIntelligenceDashboard';

export const SuperAdminPlatformDashboard: React.FC = () => {
  const { 
    currentUser, 
    availableSchools, 
    availableUsers, 
    students,
    firestoreReadStats, 
    refreshDataFromCloud,
    setCurrentView,
    toggleSchoolTermPayment,
    toggleSchoolPilotStatus
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STATISTICS_BILLING' | 'PRODUCT_INTELLIGENCE'>('STATISTICS_BILLING');
  const [selectedYear, setSelectedYear] = useState<string>('2026-2027');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [statsSearchQuery, setStatsSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDataFromCloud(true);
    setIsRefreshing(false);
  };

  // Compute platform aggregates & statistics
  const totalSchools = availableSchools.length;
  const totalStudents = students.length;
  
  // Also sum estimated students if students list is empty or for schools without enrolled student entries
  const aggregateStudentPopulation = totalStudents > 0 
    ? totalStudents 
    : availableSchools.reduce((acc, s) => acc + (s.estimated_students || 0), 0);

  const teachersCount = availableUsers.filter(u => u.role === 'TEACHER').length;
  
  // Other staff system (Directors, DOS, DOD, Bursars, Librarians, Registrars, Coordinators)
  const directorsCount = availableUsers.filter(u => u.role === 'SCHOOL_ADMIN').length;
  const leadersCount = availableUsers.filter(u => ['DOS', 'DOD', 'BURSAR', 'LIBRARIAN'].includes(u.role)).length;
  const registrarsCount = availableUsers.filter(u => u.role === 'REGISTER').length;
  const coordinatorsCount = availableUsers.filter(u => u.role === 'COORDINATOR').length;
  const superAdminsCount = availableUsers.filter(u => u.role === 'SUPER_ADMIN').length;
  const totalOtherStaff = directorsCount + leadersCount + registrarsCount + coordinatorsCount + superAdminsCount;
  
  const unclaimedCount = availableUsers.filter(u => !u.is_claimed).length;

  // School breakdown
  const privateSchoolsCount = availableSchools.filter(s => s.ownership_type === 'PRIVATE' || !s.ownership_type).length;
  const publicSchoolsCount = availableSchools.filter(s => s.ownership_type === 'PUBLIC').length;
  const govtAidedSchoolsCount = availableSchools.filter(s => s.ownership_type === 'GOVERNMENT_AIDED').length;

  // Commercial Billing Calculations (500 RWF per student per term + 20% Registrar Commission)
  const schoolStatsList = availableSchools.map(sch => {
    // Count active enrolled students in database or fallback to estimated_students
    const enrolledStudents = students.filter(st => st.school_id === sch.id && st.status !== 'SUSPENDED' && st.status !== 'TRANSFERRED').length;
    const studentCount = enrolledStudents > 0 ? enrolledStudents : (sch.estimated_students || 0);

    const pricePerStudentRwf = 500;
    const termlyExpectedFeeRwf = studentCount * pricePerStudentRwf;

    const isPilot = sch.pilot_status === 'FIRST_TERM_PILOT';

    // Term payment record lookup
    const paymentRecords = sch.term_payment_records || [];
    const currentTermRecord = paymentRecords.find(r => r.academic_year === selectedYear && r.term === selectedTerm);
    const isPaid = Boolean(currentTermRecord?.is_paid);
    const paidAt = currentTermRecord?.paid_at;
    const paidAmount = currentTermRecord?.paid_amount_rwf || (isPaid ? termlyExpectedFeeRwf : 0);

    // Registrar lookup
    const registrarUser = availableUsers.find(u => 
      u.id === sch.registered_by_id || 
      (u.name === sch.registered_by_name && u.role === 'REGISTER')
    );
    const registrarName = sch.registered_by_name || registrarUser?.name || 'Platform Admin';
    const registrarPhone = registrarUser?.phone || sch.director_phone || '+250 788 000 000';
    const registrarEmail = registrarUser?.email || sch.director_email || 'info@elimu360.rw';

    // 20% Commission for Registrar who registered the school
    const registrarCommissionRate = 0.20;
    const registrarCommission = Math.round((isPaid ? paidAmount : termlyExpectedFeeRwf) * registrarCommissionRate);

    return {
      school: sch,
      studentCount,
      pricePerStudentRwf,
      termlyExpectedFeeRwf,
      isPilot,
      isPaid,
      paidAt,
      paidAmount,
      currentTermRecord,
      registrarUser,
      registrarName,
      registrarPhone,
      registrarEmail,
      registrarCommission
    };
  });

  // Filtered stats by search query
  const filteredSchoolStats = schoolStatsList.filter(item => {
    const q = statsSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.school.name.toLowerCase().includes(q) ||
      item.school.code.toLowerCase().includes(q) ||
      item.registrarName.toLowerCase().includes(q) ||
      item.school.city.toLowerCase().includes(q)
    );
  });

  // Summary Billing Aggregates for Selected Academic Year & Term
  const totalMonitoredStudentsCount = schoolStatsList.reduce((acc, i) => acc + i.studentCount, 0);
  const totalExpectedPostPilotRevenue = schoolStatsList.reduce((acc, i) => acc + (i.isPilot ? 0 : i.termlyExpectedFeeRwf), 0);
  const totalPotentialAllRevenue = schoolStatsList.reduce((acc, i) => acc + i.termlyExpectedFeeRwf, 0);
  const totalVerifiedPaidRevenue = schoolStatsList.reduce((acc, i) => acc + (i.isPaid ? i.paidAmount : 0), 0);
  const totalPaidSchoolsCount = schoolStatsList.filter(i => i.isPaid).length;
  const totalRegistrarCommissionsEarned = schoolStatsList.reduce((acc, i) => acc + (i.isPaid ? i.registrarCommission : 0), 0);

  const handleTogglePayment = (schoolId: string, currentPaidState: boolean, schoolName: string) => {
    const nextState = !currentPaidState;
    const res = toggleSchoolTermPayment(schoolId, selectedYear, selectedTerm, nextState);
    if (res.success) {
      setActionNotice(`Updated payment status for ${schoolName} (${selectedYear} - ${selectedTerm}) to ${nextState ? 'PAID' : 'UNPAID'}.`);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  const handleTogglePilot = (schoolId: string, isPilot: boolean, schoolName: string) => {
    const nextStatus = isPilot ? 'LOYAL' : 'FIRST_TERM_PILOT';
    const res = toggleSchoolPilotStatus(schoolId, nextStatus);
    if (res.success) {
      setActionNotice(`Updated subscription model for ${schoolName} to ${nextStatus === 'LOYAL' ? 'Loyal (Post-Pilot Commercial)' : 'First-Term Pilot (Free)'}.`);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-500/30">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              National Platform Directorate · Republic of Rwanda
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Super Admin Infrastructure Console
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Centralized institutional governance, student statistics monitoring, termly subscription billing management, and master account security hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-600 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Resync Database
            </button>
            <button
              onClick={() => setCurrentView('SCHOOLS_MANAGEMENT')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition border border-blue-400/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Institutions Directorate
            </button>
          </div>
        </div>

        {/* Ambient status bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Multi-Tenant Architecture Active
            </span>
            <span>·</span>
            <span>Commercial Term Billing Engine Ready</span>
            <span>·</span>
            <span>20% Registrar Commission Tracking Active</span>
          </div>
          <div className="text-slate-400 font-mono">
            Operator: <span className="text-slate-200 font-bold">{currentUser.name}</span> ({currentUser.email})
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-emerald-400 hover:text-white font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('STATISTICS_BILLING')}
          className={`pb-3 flex items-center gap-2 transition cursor-pointer border-b-2 ${
            activeTab === 'STATISTICS_BILLING'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span>Statistics & School Billing</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            500 RWF / Student / Term
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 flex items-center gap-2 transition cursor-pointer border-b-2 ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Platform Overview & Infrastructure</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCT_INTELLIGENCE')}
          className={`pb-3 flex items-center gap-2 transition cursor-pointer border-b-2 ${
            activeTab === 'PRODUCT_INTELLIGENCE'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Product Intelligence & Onboarding Surveys</span>
        </button>
      </div>

      {activeTab === 'PRODUCT_INTELLIGENCE' ? (
        <ProductIntelligenceDashboard />
      ) : activeTab === 'STATISTICS_BILLING' ? (
        <div className="space-y-6">
          {/* Rule & Formula Overview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  Commercial Termly Subscription & Registrar Commission Policy
                </div>
                <h2 className="text-xl font-black text-white">Institutional Statistics & Subscription Ledger</h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  After the <strong>First-Term Free Pilot Period</strong>, each school pays a termly subscription rate of <strong>500 RWF per active student</strong>. Field Registrars who onboarded the school earn a <strong>20% commission</strong> on term payments.
                </p>
              </div>

              {/* Period Selectors */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Term</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Key Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Student Population */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Rate: 500 RWF/std
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalMonitoredStudentsCount.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Total Students Monitored
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  Across {totalSchools} registered schools
                </div>
              </div>
            </div>

            {/* Post-Pilot Expected Commercial Revenue */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Post-Pilot Expected
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  RWF {totalExpectedPostPilotRevenue.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Term Revenue ({selectedTerm})
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Potential (All Schools): RWF {totalPotentialAllRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Verified Term Payments Collected */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {totalPaidSchoolsCount} / {totalSchools} Paid
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  RWF {totalVerifiedPaidRevenue.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Verified Term Collections
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Toggled as PAID by Super-Admin
                </div>
              </div>
            </div>

            {/* Total Registrar 20% Commission */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  20% Commission
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  RWF {totalRegistrarCommissionsEarned.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Registrar Commission Earned
                </div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                  Disbursed to onboarding agents
                </div>
              </div>
            </div>
          </div>

          {/* School Statistics & Commercial Payment Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  School Subscription & Registrar Commission Register
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing statistics for {selectedYear} · {selectedTerm} (Toggle payment status to update Registrar and Coordinator dashboards)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search school or registrar..."
                  value={statsSearchQuery}
                  onChange={(e) => setStatsSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5">School & Code</th>
                    <th className="px-4 py-3.5">Students Number</th>
                    <th className="px-4 py-3.5">Pilot / Commercial Model</th>
                    <th className="px-4 py-3.5">Termly Fee (500 RWF/std)</th>
                    <th className="px-4 py-3.5">Registrar / Agent (20%)</th>
                    <th className="px-4 py-3.5">Registrar 20% Earnings</th>
                    <th className="px-5 py-3.5 text-right">Payment Status & Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredSchoolStats.map((item) => {
                    const {
                      school,
                      studentCount,
                      termlyExpectedFeeRwf,
                      isPilot,
                      isPaid,
                      paidAt,
                      paidAmount,
                      registrarName,
                      registrarPhone,
                      registrarEmail,
                      registrarCommission
                    } = item;

                    return (
                      <tr key={school.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        {/* School & Code */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {school.logo_url ? (
                                <img src={school.logo_url} alt={school.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                <Building2 className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{school.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                  {school.code}
                                </span>
                                <span className="text-[11px] text-slate-400">{school.city || 'Rwanda'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Student Count */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                              {studentCount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Enrolled Students
                            </div>
                          </div>
                        </td>

                        {/* Pilot / Commercial Status */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              isPilot
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800'
                            }`}>
                              {isPilot ? 'First-Term Pilot (Free)' : 'Loyal / Post-Pilot'}
                            </span>
                            <div>
                              <button
                                onClick={() => handleTogglePilot(school.id, isPilot, school.name)}
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                              >
                                {isPilot ? 'Switch to Post-Pilot' : 'Set as Pilot'}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Termly Subscription Fee */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                              RWF {termlyExpectedFeeRwf.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {studentCount} std × 500 Rwf
                            </div>
                            {isPilot && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                                (Free during Pilot)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Registrar Agent Info */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{registrarName}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{registrarPhone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{registrarEmail}</span>
                            </div>
                          </div>
                        </td>

                        {/* Registrar 20% Earnings */}
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
                              RWF {registrarCommission.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              20% of RWF {termlyExpectedFeeRwf.toLocaleString()}
                            </div>
                            <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {isPaid ? 'Commission Paid' : 'Pending Payment'}
                            </span>
                          </div>
                        </td>

                        {/* Payment Status & Toggle Action */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                              isPaid
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm'
                                : 'bg-amber-950 text-amber-300 border-amber-700'
                            }`}>
                              {isPaid ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>PAID · {selectedTerm}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>UNPAID / PENDING</span>
                                </>
                              )}
                            </span>

                            {isPaid && paidAt && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Paid: {new Date(paidAt).toLocaleDateString()}
                              </div>
                            )}

                            <button
                              onClick={() => handleTogglePayment(school.id, isPaid, school.name)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                                isPaid
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-emerald-500/20'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Mark as UNPAID</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Toggle as PAID</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Platform Metric Cards (Super Admin Detailed Statistics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Schools Statistics */}
        <div 
          onClick={() => setCurrentView('SCHOOLS_MANAGEMENT')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{totalSchools}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Accredited Schools
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              {privateSchoolsCount} Private · {publicSchoolsCount} Public · {govtAidedSchoolsCount} Govt Aided
            </div>
          </div>
        </div>

        {/* Total Student Population */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Enrolled Total
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{aggregateStudentPopulation.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Students Number
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              Monitored across {totalSchools} accredited institutions
            </div>
          </div>
        </div>

        {/* Total Teaching Staff */}
        <div 
          onClick={() => setCurrentView('MASTER_USERS')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{teachersCount}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Teaching Staff
            </div>
            <div className="text-xs text-purple-600 font-semibold mt-1">
              Active classroom educators & instructors
            </div>
          </div>
        </div>

        {/* Other Staff System */}
        <div 
          onClick={() => setCurrentView('MASTER_USERS')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{totalOtherStaff}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
              Other Staff System
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-1">
              {directorsCount} Directors · {coordinatorsCount} Coords · {registrarsCount} Registrars · {leadersCount} Admins
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign Policy Separation Card */}
      <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-sm">Institutional Privacy & Sovereign Academic Isolation</h3>
            <p className="text-xs text-amber-800 mt-0.5 max-w-3xl leading-relaxed">
              Super Admin powers are dedicated exclusively to platform infrastructure, multi-tenant school onboarding, and master account purge/wipeout operations. School academic marks, exam scores, and report card generation are sovereign to each individual School Director and DOS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setCurrentView('MASTER_USERS')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Manage Master Accounts
          </button>
        </div>
      </div>

      {/* Registered Institutions Directorate Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Accredited Educational Institutions</h2>
            <p className="text-xs text-slate-500 mt-0.5">All registered schools running on the Elimu360 National Platform</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('SCHOOLS_MANAGEMENT')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Manage All Schools
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Institution Profile</th>
                <th className="px-4 py-3.5">School Code</th>
                <th className="px-4 py-3.5">Headmaster / Director</th>
                <th className="px-4 py-3.5">Location & Contact</th>
                <th className="px-4 py-3.5">Staff & Students</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availableSchools.map(sch => {
                const director = availableUsers.find(u => u.school_id === sch.id && u.role === 'SCHOOL_ADMIN');
                const schoolStaffCount = availableUsers.filter(u => u.school_id === sch.id).length;

                return (
                  <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Institution Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {sch.logo_url ? (
                            <img src={sch.logo_url} alt={sch.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sch.name}</div>
                          <div className="text-xs text-slate-500">{sch.motto || 'Shaping the Future of Rwanda'}</div>
                        </div>
                      </div>
                    </td>

                    {/* School Code */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {sch.code}
                      </span>
                    </td>

                    {/* Director */}
                    <td className="px-4 py-4">
                      {director ? (
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{director.name}</div>
                          <div className="text-[11px] text-slate-400">{director.email}</div>
                          {director.activation_token && !director.is_claimed && (
                            <span className="inline-block mt-0.5 text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Token: {director.activation_token}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Director Assigned</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4">
                      <div className="text-xs font-medium text-slate-700">{sch.city || 'Kigali, Rwanda'}</div>
                      <div className="text-[11px] text-slate-400">{sch.phone || '+250 788 000 000'}</div>
                    </td>

                    {/* Staff */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {schoolStaffCount} Accounts
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setCurrentView('SCHOOLS_MANAGEMENT')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        Manage School
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
