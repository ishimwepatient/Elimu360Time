import React, { useState } from 'react';
import { useElimu } from '../../context/ElimuContext';
import { CurriculumType } from '../../types';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Shield, 
  AlertCircle, 
  Search, 
  Trash2, 
  FileCheck2, 
  Phone, 
  Mail, 
  Award,
  Sparkles,
  BarChart3,
  X,
  ChevronRight,
  UserCheck,
  PlusCircle,
  Copy,
  ExternalLink,
  MapPin,
  FileCheck
} from 'lucide-react';

export const CoordinatorGovernanceHub: React.FC = () => {
  const { 
    currentUser, 
    availableUsers, 
    availableSchools, 
    registerRegistrar, 
    registerSchoolByRegistrar,
    approveSchoolRegistryCode, 
    deleteRegistrarByCoordinator,
    students,
    setCurrentView 
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'REGISTRARS' | 'PENDING_SCHOOLS' | 'MONITORED_SCHOOLS'>('REGISTRARS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [copiedDemoLink, setCopiedDemoLink] = useState(false);

  // Form State for Adding Registrar
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Coordinator Registering School Directly
  const [schName, setSchName] = useState('');
  const [schCurriculum, setSchCurriculum] = useState<CurriculumType>('REB');
  const [schCountry, setSchCountry] = useState('Rwanda');
  const [schOwnership, setSchOwnership] = useState<'PUBLIC' | 'PRIVATE' | 'GOVERNMENT_AIDED'>('PRIVATE');
  const [schAccommodation, setSchAccommodation] = useState<'DAY' | 'BOARDING' | 'BOTH'>('BOTH');
  const [schCity, setSchCity] = useState('');
  const [schDistrict, setSchDistrict] = useState('');
  const [schProvince, setSchProvince] = useState('');
  const [schEmail, setSchEmail] = useState('');
  const [schPhone, setSchPhone] = useState('');
  const [schMotto, setSchMotto] = useState('');
  const [schDirectorName, setSchDirectorName] = useState('');
  const [schDirectorEmail, setSchDirectorEmail] = useState('');
  const [schDirectorPhone, setSchDirectorPhone] = useState('');
  const [schEstimatedStudents, setSchEstimatedStudents] = useState<number | ''>('');
  const [schLabStatus, setSchLabStatus] = useState<'YES_INTERNET' | 'YES_NO_INTERNET' | 'NO_LAB'>('YES_INTERNET');
  const [schAdminChallenge, setSchAdminChallenge] = useState('Exam grading delays and tuition reconciliation');
  const [schInternet, setSchInternet] = useState<'HIGH_SPEED' | 'MODERATE' | 'POOR_OFFLINE_NEEDS'>('MODERATE');
  const [schSmsNeed, setSchSmsNeed] = useState<'ESSENTIAL' | 'MODERATE' | 'NOT_PRIORITY'>('ESSENTIAL');
  const [schPrimaryGoal, setSchPrimaryGoal] = useState('Centralize student records, automated report cards, and fee collections');
  const [schError, setSchError] = useState('');
  const [schSuccess, setSchSuccess] = useState('');
  const [isSubmittingSchool, setIsSubmittingSchool] = useState(false);

  // Filter Registrars assigned to this Coordinator
  const coordId = currentUser.role === 'COORDINATOR' ? currentUser.id : '';
  const isCertified = Boolean(currentUser.has_passed_training || currentUser.role === 'SUPER_ADMIN');
  
  const assignedRegistrars = availableUsers.filter(u => 
    u.role === 'REGISTER' && 
    (currentUser.role === 'SUPER_ADMIN' || u.assigned_coordinator_id === coordId) &&
    !u.is_deleted_by_coordinator
  );

  const activeRegistrarsCount = assignedRegistrars.filter(u => u.is_active !== false).length;
  const maxQuota = currentUser.max_registrars_quota || 15;
  const remainingQuota = Math.max(0, maxQuota - activeRegistrarsCount);

  // Filter Schools under this Coordinator's jurisdiction or registered by their assigned registrars or registered by Coordinator directly
  const managedSchools = availableSchools.filter(s => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (s.coordinator_id === coordId || s.registered_by_id === currentUser.id) return true;
    return assignedRegistrars.some(r => r.id === s.registered_by_id);
  });

  const pendingSchools = managedSchools.filter(s => s.approval_status === 'PENDING' || s.registry_code === 'PENDING_APPROVAL');
  const approvedSchools = managedSchools.filter(s => s.approval_status === 'APPROVED' && s.registry_code !== 'PENDING_APPROVAL');

  // Compute total monitored students across managed schools
  const totalMonitoredStudents = managedSchools.reduce((acc, sch) => {
    const actualCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    return acc + (actualCount > 0 ? actualCount : (sch.estimated_students || 0));
  }, 0);

  // Compute Coordinator 2% Supervisory Commission collected from earnings of registrars
  const totalCoordPotentialCommission = managedSchools.reduce((acc, sch) => {
    const activeCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    const stdCount = activeCount > 0 ? activeCount : (sch.estimated_students || 0);
    const termFee = stdCount * 500;
    return acc + (termFee * 0.02);
  }, 0);

  const totalCoordPaidCommission = managedSchools.reduce((acc, sch) => {
    const records = sch.term_payment_records || [];
    const isPaid = records.some(r => r.is_paid);
    const activeCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    const stdCount = activeCount > 0 ? activeCount : (sch.estimated_students || 0);
    const termFee = stdCount * 500;
    return acc + (isPaid ? (termFee * 0.02) : 0);
  }, 0);

  const handleCopyDemoLink = () => {
    const origin = window.location.origin;
    const demoUrl = `${origin}?view=demo`;
    navigator.clipboard.writeText(demoUrl);
    setCopiedDemoLink(true);
    setTimeout(() => setCopiedDemoLink(false), 3000);
  };

  const handleRegisterSchoolDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    setSchError('');
    setSchSuccess('');

    if (!schName.trim() || !schCity.trim() || !schDirectorName.trim() || !schDirectorEmail.trim()) {
      setSchError('Please fill in all mandatory school identification fields.');
      return;
    }

    setIsSubmittingSchool(true);

    const res = registerSchoolByRegistrar({
      name: schName.trim(),
      curriculum_type: schCurriculum,
      country: schCountry,
      city: schCity.trim(),
      district: schDistrict.trim() || undefined,
      province: schProvince.trim() || undefined,
      contact_email: schEmail.trim() || 'info@school.rw',
      phone: schPhone.trim() || '+250 788 000 000',
      motto: schMotto.trim() || 'Excellence in Education',
      director_name: schDirectorName.trim(),
      director_email: schDirectorEmail.trim(),
      director_phone: schDirectorPhone.trim() || '+250 788 000 000',
      estimated_students: typeof schEstimatedStudents === 'number' ? schEstimatedStudents : 300,
      onboarding_survey: {
        id: `survey-${Date.now()}`,
        school_id: '',
        school_name: schName.trim(),
        conducted_by_id: currentUser.id,
        conducted_by_name: currentUser.name,
        conducted_by_role: currentUser.role,
        conducted_at: new Date().toISOString(),
        target_student_capacity: typeof schEstimatedStudents === 'number' ? schEstimatedStudents : 300,
        computer_lab_available: schLabStatus !== 'NO_LAB',
        internet_connectivity: schInternet,
        primary_administrative_pain_point: schAdminChallenge.trim(),
        sms_broadcast_required: schSmsNeed === 'ESSENTIAL',
        notes: `Direct regional registration by Coordinator ${currentUser.name}. Primary Goal: ${schPrimaryGoal.trim()}`
      }
    });

    setIsSubmittingSchool(false);

    if (res.success) {
      setSchSuccess(res.message);
      setSchName('');
      setSchCity('');
      setSchDistrict('');
      setSchProvince('');
      setSchEmail('');
      setSchPhone('');
      setSchMotto('');
      setSchDirectorName('');
      setSchDirectorEmail('');
      setSchDirectorPhone('');
      setTimeout(() => {
        setShowSchoolModal(false);
        setSchSuccess('');
      }, 2000);
    } else {
      setSchError(res.message);
    }
  };

  const handleRegisterRegistrar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (activeRegistrarsCount >= maxQuota) {
      setFormError(`Quota Reached: You are currently monitoring ${activeRegistrarsCount} Registrars. You cannot exceed 15 Registrars.`);
      return;
    }

    setIsSubmitting(true);
    const res = registerRegistrar({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      title: formTitle.trim() || 'Field School Registrar',
      assigned_coordinator_id: coordId || undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      setFormSuccess(res.message);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormTitle('');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
      }, 2000);
    } else {
      setFormError(res.message);
    }
  };

  const handleApproveSchool = (schoolId: string, schoolName: string) => {
    if (!isCertified) {
      alert('Accreditation Required: You must complete and pass the Field Training Academy Examination before approving school registry codes.');
      return;
    }

    if (window.confirm(`Are you sure you want to approve "${schoolName}" and issue an Official Registry Code?`)) {
      const res = approveSchoolRegistryCode(schoolId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(`Approval Failed: ${res.message}`);
      }
    }
  };

  const handleDeleteRegistrar = (registrarId: string, registrarName: string) => {
    if (window.confirm(`Are you sure you want to remove Registrar "${registrarName}"? All schools registered by this registrar will be automatically transferred to Super Admin.`)) {
      const res = deleteRegistrarByCoordinator(registrarId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(`Deletion Failed: ${res.message}`);
      }
    }
  };

  const filteredRegistrars = assignedRegistrars.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  );

  const filteredSchools = managedSchools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.district && s.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Regional Governance & Oversight Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Regional Coordinator
              </span>
              {isCertified ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Certified Coordinator</span>
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>Accreditation Pending</span>
                </span>
              )}
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              Register institutions directly, monitor up to 15 assigned Field Registrars, approve school onboarding, and present the live interactive demonstration system to school leaders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('DEMO_SYSTEM')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Live Pitch & Demo System</span>
            </button>

            <button
              onClick={() => setShowSchoolModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-emerald-200" />
              <span>Register New School</span>
            </button>

            <button
              onClick={() => setCurrentView('TRAINING_ACADEMY')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Field Academy</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              disabled={activeRegistrarsCount >= maxQuota}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Registrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Demonstration System Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-amber-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive System Demonstration Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase">Sales & Pitching Ready</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Demonstrate the entire Elimu360 SIMS ecosystem (School Director, Dean of Studies, Bursar dynamic fee setup, Teacher grading, and Parent portal) to Headteachers and School Boards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyDemoLink}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            {copiedDemoLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedDemoLink ? 'Demo Link Copied!' : 'Copy Demo URL'}</span>
          </button>
          <button
            onClick={() => setCurrentView('DEMO_SYSTEM')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Demo Simulation →</span>
          </button>
        </div>
      </div>

      {!isCertified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Coordinator Accreditation Required</h4>
              <p className="text-xs text-amber-200/90 mt-0.5">
                To approve school registrations and issue official Registry Codes, you must complete and pass the Field Training Examination (80%+).
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('TRAINING_ACADEMY')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition cursor-pointer shadow-md"
          >
            Take Exam Now →
          </button>
        </div>
      )}

      {/* Capacity & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Registrar Quota Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-slate-300">Registrar Quota Capacity</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{activeRegistrarsCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {maxQuota} Max Capacity</span>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  activeRegistrarsCount >= maxQuota ? 'bg-rose-500' : activeRegistrarsCount > 10 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${(activeRegistrarsCount / maxQuota) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
              <span>{remainingQuota} open slots available</span>
              <span>{Math.round((activeRegistrarsCount / maxQuota) * 100)}% utilized</span>
            </div>
          </div>
        </div>

        {/* Monitored Schools */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-slate-300">Monitored Schools</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{managedSchools.length}</span>
            <span className="text-xs text-slate-400 font-medium">Total Registered</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-semibold">{approvedSchools.length} Approved</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">{pendingSchools.length} Pending</span>
          </div>
        </div>

        {/* Pending Registry Approvals */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-slate-300">Pending Code Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">{pendingSchools.length}</span>
            <span className="text-xs text-slate-400 font-medium">Require Verification</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            {pendingSchools.length > 0 ? 'Awaiting your official approval' : 'All registrations verified'}
          </p>
        </div>

        {/* Total Monitored Students */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-slate-300">Monitored Students</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{totalMonitoredStudents.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">Estimated Enrolled</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            Across {managedSchools.length} school institutions
          </p>
        </div>

        {/* Coordinator 2% Supervisory Commission */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-slate-300">Coordinator 2% Share</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-purple-400">RWF {totalCoordPaidCommission.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            Potential: <span className="text-purple-300 font-semibold">RWF {totalCoordPotentialCommission.toLocaleString()}</span> / term
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('REGISTRARS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'REGISTRARS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Appointed Registrars ({assignedRegistrars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING_SCHOOLS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PENDING_SCHOOLS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingSchools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MONITORED_SCHOOLS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'MONITORED_SCHOOLS'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>All Monitored Schools ({managedSchools.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search registrars, schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Appointed Registrars List */}
      {activeTab === 'REGISTRARS' && (
        <div className="space-y-4">
          {filteredRegistrars.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-white">No Registrars Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                You have not registered any Field Registrars yet, or no active records match your search filter.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={activeRegistrarsCount >= maxQuota}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register First Registrar</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrars.map((reg) => {
                const registeredByThisOfficer = availableSchools.filter(s => s.registered_by_id === reg.id);
                const regCertified = Boolean(reg.has_passed_training);
                const reg2PercentEarning = registeredByThisOfficer.reduce((acc, sch) => {
                  const activeCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
                  const stdCount = activeCount > 0 ? activeCount : (sch.estimated_students || 0);
                  return acc + (stdCount * 500 * 0.02);
                }, 0);

                return (
                  <div 
                    key={reg.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                            {reg.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{reg.name}</span>
                              {regCertified && (
                                <span title="Accredited Representative"><Award className="w-3.5 h-3.5 text-amber-400" /></span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400">{reg.title || 'Field School Registrar'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteRegistrar(reg.id, reg.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove Registrar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{reg.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{reg.phone || 'No phone recorded'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-slate-400">
                          <span className="font-semibold text-white">{registeredByThisOfficer.length}</span> schools registered
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          regCertified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {regCertified ? 'Certified' : 'Training Pending'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-purple-300 font-semibold pt-1 border-t border-slate-800/60">
                        2% Supervisory Override: RWF {reg2PercentEarning.toLocaleString()} / term
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending School Code Approvals */}
      {activeTab === 'PENDING_SCHOOLS' && (
        <div className="space-y-4">
          {pendingSchools.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
              <h3 className="text-base font-semibold text-white">All Clear! No Pending Approvals</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                All school institutions registered under your regional jurisdiction have been verified and assigned official registry codes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSchools.map((sch) => {
                const registeredByOfficer = availableUsers.find(u => u.id === sch.registered_by_id);

                return (
                  <div 
                    key={sch.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{sch.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                          Code Approval Required
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                          {sch.curriculum_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                        <span>Location: <strong className="text-slate-200">{sch.city}, {sch.district || ''}</strong></span>
                        <span>·</span>
                        <span>Director: <strong className="text-slate-200">{sch.director_name}</strong> ({sch.director_email})</span>
                        <span>·</span>
                        <span>Registered By: <strong className="text-indigo-400">{registeredByOfficer?.name || sch.registered_by_name || 'Field Officer'}</strong></span>
                      </div>

                      {sch.onboarding_survey && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                          {sch.onboarding_survey.primary_administrative_pain_point && (
                            <span>Challenge: <em>{sch.onboarding_survey.primary_administrative_pain_point}</em> · </span>
                          )}
                          <span>Lab: <strong>{sch.onboarding_survey.computer_lab_available ? 'Available' : 'No Lab'}</strong></span>
                          <span> · </span>
                          <span>Internet: <strong>{sch.onboarding_survey.internet_connectivity || 'N/A'}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleApproveSchool(sch.id, sch.name)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Issue Official Registry Code</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Monitored Schools */}
      {activeTab === 'MONITORED_SCHOOLS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((sch) => {
              const activeStudentCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
              const studentCount = activeStudentCount > 0 ? activeStudentCount : (sch.estimated_students || 0);
              const termFee = studentCount * 500;
              const commission = termFee * 0.20;

              const registrarUser = availableUsers.find(u => 
                u.id === sch.registered_by_id || 
                (u.name === sch.registered_by_name && u.role === 'REGISTER')
              );
              const registrarName = sch.registered_by_name || registrarUser?.name || 'Field Officer';
              const registrarPhone = registrarUser?.phone || sch.director_phone || 'N/A';
              const registrarEmail = registrarUser?.email || sch.director_email || 'N/A';

              const records = sch.term_payment_records || [];
              const isPaid = records.some(r => r.is_paid);

              return (
                <div 
                  key={sch.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{sch.name}</h4>
                        <p className="text-[11px] text-slate-400">{sch.city}, {sch.district || ''}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sch.approval_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {sch.registry_code || 'PENDING'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <div className="text-slate-400">
                        Director: <strong className="text-slate-200">{sch.director_name}</strong>
                      </div>
                      <div className="text-slate-400">
                        Curriculum: <span className="text-slate-200 font-medium">{sch.curriculum_type} · {sch.ownership_type || 'PRIVATE'}</span>
                      </div>

                      {/* Registrar Agent Info */}
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
                        <div className="text-[10px] font-bold uppercase text-amber-400">Registered By (Agent Onboarder)</div>
                        <div className="font-bold text-white">{registrarName}</div>
                        <div className="text-slate-400">Phone: <span className="text-emerald-400 font-bold">{registrarPhone}</span> | Email: {registrarEmail}</div>
                        <div className="text-purple-300 font-mono font-semibold pt-1 border-t border-slate-800/80">
                          Coordinator 2% Supervisory Share: RWF {(termFee * 0.02).toLocaleString()} / term
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <strong className="text-white">{studentCount.toLocaleString()}</strong> students ({termFee.toLocaleString()} Rwf/term)
                      </div>
                      <span className="text-indigo-400 text-[11px] font-medium">
                        {sch.pilot_status === 'FIRST_TERM_PILOT' ? '1st-Term Free Pilot' : 'Commercial'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Super-Admin Payment Toggle:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {isPaid ? 'PAID' : 'UNPAID / PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Field Registrar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>Register School Registrar Officer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Appoint a Field Registrar officer under your Coordinator jurisdiction ({activeRegistrarsCount}/{maxQuota} quota used).
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterRegistrar} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Registrar Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Aline Umutoni"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="registrar.rubavu@elimu360.rw"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Official Title / Designation</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="District School Registrar Officer — Rubavu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Complete Registrar Onboarding'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Coordinator Registering School Directly */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Direct Partner School Registration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a school institution directly under your Regional Coordinator jurisdiction.
                </p>
              </div>
              <button 
                onClick={() => setShowSchoolModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSchoolDirectly} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {schError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{schError}</span>
                </div>
              )}

              {schSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{schSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Official School Name *</label>
                <input
                  type="text"
                  required
                  value={schName}
                  onChange={(e) => setSchName(e.target.value)}
                  placeholder="e.g., Green Hills International Academy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Curriculum *</label>
                  <select
                    value={schCurriculum}
                    onChange={(e) => setSchCurriculum(e.target.value as CurriculumType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="REB">REB (National)</option>
                    <option value="CAMBRIDGE">Cambridge (CIE)</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="TVET">TVET / Technical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ownership *</label>
                  <select
                    value={schOwnership}
                    onChange={(e) => setSchOwnership(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PRIVATE">Private Institution</option>
                    <option value="PUBLIC">Public Government</option>
                    <option value="GOVERNMENT_AIDED">Government-Aided</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Accommodation *</label>
                  <select
                    value={schAccommodation}
                    onChange={(e) => setSchAccommodation(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BOTH">Day & Boarding</option>
                    <option value="DAY">Day Only</option>
                    <option value="BOARDING">Boarding Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Province / Region</label>
                  <input
                    type="text"
                    value={schProvince}
                    onChange={(e) => setSchProvince(e.target.value)}
                    placeholder="e.g., Kigali City / Western"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">District</label>
                  <input
                    type="text"
                    value={schDistrict}
                    onChange={(e) => setSchDistrict(e.target.value)}
                    placeholder="e.g., Nyarugenge / Rubavu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">City / Sector *</label>
                  <input
                    type="text"
                    required
                    value={schCity}
                    onChange={(e) => setSchCity(e.target.value)}
                    placeholder="e.g., Kigali / Gisenyi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">School Director / Principal Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Director Name *</label>
                    <input
                      type="text"
                      required
                      value={schDirectorName}
                      onChange={(e) => setSchDirectorName(e.target.value)}
                      placeholder="e.g., Dr. Jean Paul Habimana"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Director Email *</label>
                    <input
                      type="email"
                      required
                      value={schDirectorEmail}
                      onChange={(e) => setSchDirectorEmail(e.target.value)}
                      placeholder="director@school.rw"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Director Phone</label>
                    <input
                      type="tel"
                      value={schDirectorPhone}
                      onChange={(e) => setSchDirectorPhone(e.target.value)}
                      placeholder="+250 788 123 456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Onboarding Readiness</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Computer Lab Status</label>
                    <select
                      value={schLabStatus}
                      onChange={(e) => setSchLabStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="YES_INTERNET">Lab with Internet Available</option>
                      <option value="YES_NO_INTERNET">Lab Available (No Internet)</option>
                      <option value="NO_LAB">No Dedicated Computer Lab</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Estimated Student Population</label>
                    <input
                      type="number"
                      value={schEstimatedStudents}
                      onChange={(e) => setSchEstimatedStudents(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g., 450"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchool}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmittingSchool ? 'Registering...' : 'Register & Issue School License'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};