import React, { useState } from 'react';
import { useElimu } from '../../context/ElimuContext';
import { CurriculumType } from '../../types';
import { uploadImageToImageKit } from '../../services/imageKitService';
import { 
  Building2, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  FileCheck,
  FileCheck2, 
  X, 
  ChevronRight, 
  Info,
  Award,
  BarChart3,
  UserCheck,
  Upload,
  Image as ImageIcon,
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';

export const RegistrarPortal: React.FC = () => {
  const { 
    currentUser, 
    availableUsers,
    availableSchools, 
    registerSchoolByRegistrar,
    students,
    setCurrentView
  } = useElimu();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State for Registering School
  const [name, setName] = useState('');
  const [curriculum, setCurriculum] = useState<CurriculumType>('REB');
  const [country, setCountry] = useState('Rwanda');
  const [ownershipType, setOwnershipType] = useState<'PUBLIC' | 'PRIVATE' | 'GOVERNMENT_AIDED'>('PRIVATE');
  const [accommodationType, setAccommodationType] = useState<'DAY' | 'BOARDING' | 'BOTH'>('BOTH');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [motto, setMotto] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [directorName, setDirectorName] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');
  const [directorPhone, setDirectorPhone] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState<number | ''>('');

  // Form State for Mandatory Pre-Registration Onboarding Survey
  const [computerLabStatus, setComputerLabStatus] = useState<'YES_INTERNET' | 'YES_NO_INTERNET' | 'NO_LAB'>('YES_INTERNET');
  const [primaryAdminChallenge, setPrimaryAdminChallenge] = useState('Report card generation delays & fee tracking');
  const [internetReliability, setInternetReliability] = useState<'HIGH_SPEED' | 'MODERATE' | 'POOR_OFFLINE_NEEDS'>('MODERATE');
  const [smsCommunicationNeed, setSmsCommunicationNeed] = useState<'ESSENTIAL' | 'MODERATE' | 'NOT_PRIORITY'>('ESSENTIAL');
  const [primaryGoal, setPrimaryGoal] = useState('Automate grading, fee tracking, and instant parent SMS dispatch');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCertified = Boolean(currentUser.has_passed_training || currentUser.role === 'SUPER_ADMIN');

  // Look up appointed coordinator user contacts
  const appointedCoordinator = availableUsers.find(u => 
    u.role === 'COORDINATOR' && 
    (u.id === currentUser.assigned_coordinator_id || u.name === currentUser.assigned_coordinator_name)
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Logo image size must be under 5MB.');
        return;
      }
      try {
        setIsUploadingLogo(true);
        setFormError('');
        const result = await uploadImageToImageKit(file, {
          folder: '/elimu360/school_logos',
          fileName: `logo_${Date.now()}.png`,
          tags: ['school', 'logo', 'crest'],
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.9
        });
        setLogoUrl(result.url);
      } catch (err: any) {
        console.error('ImageKit upload error:', err);
        setFormError('Failed to upload logo to ImageKit CDN: ' + (err?.message || 'Upload error'));
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  // Schools registered by this Registrar
  const mySchools = availableSchools.filter(s => 
    s.registered_by_id === currentUser.id ||
    (currentUser.role === 'SUPER_ADMIN')
  );

  const approvedSchools = mySchools.filter(s => s.approval_status === 'APPROVED' && s.registry_code !== 'PENDING_APPROVAL');
  const pendingSchools = mySchools.filter(s => s.approval_status === 'PENDING' || s.registry_code === 'PENDING_APPROVAL');

  const totalEstimatedPopulation = mySchools.reduce((acc, sch) => {
    const actualCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    return acc + (actualCount > 0 ? actualCount : (sch.estimated_students || 0));
  }, 0);

  // 20% Registrar Commission Earnings Breakdown (500 RWF per student per term)
  const totalCommissionPotentialRwf = mySchools.reduce((acc, sch) => {
    const actualCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    const stdCount = actualCount > 0 ? actualCount : (sch.estimated_students || 0);
    const termFee = stdCount * 500;
    return acc + (termFee * 0.20);
  }, 0);

  const totalCommissionPaidRwf = mySchools.reduce((acc, sch) => {
    const records = sch.term_payment_records || [];
    const isPaid = records.some(r => r.is_paid);
    const actualCount = students.filter(s => s.school_id === sch.id && s.status !== 'SUSPENDED' && s.status !== 'TRANSFERRED').length;
    const stdCount = actualCount > 0 ? actualCount : (sch.estimated_students || 0);
    const termFee = stdCount * 500;
    return acc + (isPaid ? (termFee * 0.20) : 0);
  }, 0);

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isCertified) {
      setFormError('Accreditation Required: You must pass the 10-Question Field Training Examination (80%+) before registering your first school.');
      return;
    }

    if (!name.trim() || !city.trim() || !contactEmail.trim() || !phone.trim() || !directorName.trim() || !directorEmail.trim()) {
      setFormError('Please fill out all required fields marked with *.');
      return;
    }

    setIsSubmitting(true);

    const res = registerSchoolByRegistrar({
      name: name.trim(),
      curriculum_type: curriculum,
      ownership_type: ownershipType,
      accommodation_type: accommodationType,
      country: country.trim() || 'Rwanda',
      city: city.trim(),
      district: district.trim(),
      province: province.trim(),
      contact_email: contactEmail.trim(),
      phone: phone.trim(),
      motto: motto.trim() || 'Excellence in Education',
      logo_url: logoUrl,
      director_name: directorName.trim(),
      director_email: directorEmail.trim(),
      director_phone: directorPhone.trim() || phone.trim(),
      estimated_students: Number(estimatedStudents) || 0,
      onboarding_survey: {
        id: `survey-${Date.now()}`,
        school_id: '',
        school_name: name.trim(),
        conducted_by_id: currentUser.id,
        conducted_by_name: currentUser.name,
        conducted_by_role: currentUser.role,
        conducted_at: new Date().toISOString(),
        target_student_capacity: Number(estimatedStudents) || 0,
        computer_lab_available: computerLabStatus !== 'NO_LAB',
        internet_connectivity: internetReliability,
        primary_administrative_pain_point: primaryAdminChallenge.trim(),
        sms_broadcast_required: smsCommunicationNeed === 'ESSENTIAL',
        notes: `Pre-registration field assessment conducted by ${currentUser.name} (${currentUser.role}). Primary Goal: ${primaryGoal.trim()}`
      }
    });

    setIsSubmitting(false);

    if (res.success) {
      setFormSuccess(res.message);
      // Reset form
      setName('');
      setCity('');
      setDistrict('');
      setProvince('');
      setContactEmail('');
      setPhone('');
      setMotto('');
      setLogoUrl('');
      setDirectorName('');
      setDirectorEmail('');
      setDirectorPhone('');
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess('');
      }, 2500);
    } else {
      setFormError(res.message);
    }
  };

  const filteredSchools = mySchools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.district && s.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.director_name && s.director_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Field School Registrar Portal · Institutional Onboarding</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Registrar Officer
              </span>
              {isCertified ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Certified Representative</span>
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>Accreditation Pending</span>
                </span>
              )}
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Assigned Coordinator Supervisor: <strong className="text-amber-400">{currentUser.assigned_coordinator_name || 'Senior Regional Coordinator'}</strong>
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
              onClick={() => setCurrentView('TRAINING_ACADEMY')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Field Academy & PDF Manuals</span>
            </button>

            <button
              onClick={() => {
                if (!isCertified) {
                  setFormError('Accreditation Required: You must complete the 10-Question Field Training Academy Examination before registering your first school.');
                } else {
                  setFormError('');
                }
                setShowModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              {!isCertified && <Lock className="w-4 h-4 text-slate-900" />}
              {isCertified && <PlusCircle className="w-4 h-4" />}
              <span>Register New Institution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointed Coordinator Supervisor Contacts Card */}
      <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Appointed Regional Coordinator Supervisor
            </div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{appointedCoordinator?.name || currentUser.assigned_coordinator_name || 'Senior Regional Coordinator'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {appointedCoordinator?.title || 'Education Coordinator'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{appointedCoordinator?.phone || '+250 788 123 456'}</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>{appointedCoordinator?.email || 'coordinator@elimu360.rw'}</span>
          </div>
        </div>
      </div>

      {!isCertified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Field Accreditation Required</h4>
              <p className="text-xs text-amber-200/90 mt-0.5">
                To maintain high field standards and qualify for recurring 10% commissions, you must complete and pass the 10-Question Field Training Examination (80%+) before registering your first school.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('TRAINING_ACADEMY')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition cursor-pointer shadow-md"
          >
            Take Training & Exam Now →
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-slate-300">Total Registered</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{mySchools.length}</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Onboarded under your Officer account
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-slate-300">Approved & Issued</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{approvedSchools.length}</div>
          <div className="text-[11px] text-emerald-400/90 mt-2 pt-2 border-t border-slate-800">
            Registry Code Issued by Coordinator
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-slate-300">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{pendingSchools.length}</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Awaiting Coordinator Review
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-slate-300">Monitored Students</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalEstimatedPopulation.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            500 RWF / Student / Term Rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-slate-300">Registrar 20% Earnings</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">RWF {totalCommissionPaidRwf.toLocaleString()}</div>
          <div className="text-[11px] text-purple-300 mt-2 pt-2 border-t border-slate-800">
            Potential: RWF {totalCommissionPotentialRwf.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Security Governance Notice */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Role Governance Rule:</strong> Registrars can onboard schools and view student demographic statistics. School modification, deactivation, and permanent deletion are strictly reserved for the <strong>Super Administrator</strong>.
          </span>
        </div>
      </div>

      {/* Main Table / Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Institutional Onboarding Directory</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schools or directors..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredSchools.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Onboarded Institutions</p>
            <p className="text-xs mt-1 text-slate-500">
              Click "Register New Institution" to onboard a school in your district.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((sch) => {
              const actualStudents = students.filter(s => s.school_id === sch.id).length;
              const displayPopulation = actualStudents > 0 ? actualStudents : (sch.estimated_students || 0);

              return (
                <div 
                  key={sch.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {sch.curriculum_type} Curriculum
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-1.5">{sch.name}</h4>
                      </div>

                      {sch.approval_status === 'APPROVED' && sch.registry_code !== 'PENDING_APPROVAL' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Code: {sch.registry_code}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sch.city}, {sch.district || sch.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Director: <strong>{sch.director_name}</strong> ({sch.director_phone || sch.contact_email})</span>
                      </div>
                      {(() => {
                        const dirUser = availableUsers.find(u => u.school_id === sch.id && u.role === 'SCHOOL_ADMIN');
                        return dirUser ? (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="text-slate-400 font-semibold">Director Claim Codes:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/20">
                              Registry Code: {sch.registry_code}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/20">
                              Token: {dirUser.activation_token || dirUser.issued_activation_token || 'Claimed'}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Est. Student Count: <strong className="text-cyan-400 font-bold">{displayPopulation.toLocaleString()}</strong></span>
                      <span className="text-[11px] text-slate-400 font-mono">500 Rwf / std</span>
                    </div>

                    {(() => {
                      const records = sch.term_payment_records || [];
                      const isPaid = records.some(r => r.is_paid);
                      const termFee = displayPopulation * 500;
                      const commission = termFee * 0.20;

                      return (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">Termly Subscription & 20% Share</div>
                            <div className="text-xs font-bold text-white font-mono mt-0.5">
                              Fee: RWF {termFee.toLocaleString()} · <span className="text-purple-400">Agent (20%): RWF {commission.toLocaleString()}</span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {isPaid ? 'PAID (Super-Admin Verified)' : 'UNPAID / PENDING'}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Supervisor: {sch.coordinator_name || currentUser.assigned_coordinator_name || 'Coordinator'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REGISTER SCHOOL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Onboard New Institution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit school details for Coordinator Registry Code approval.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSchool} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* School Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. School Profile & Curriculum</h4>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">School Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Groupe Scolaire Rubavu High School"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* School Logo Uploader */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>School Crest / Official Logo (Uploaded to ImageKit CDN)</span>
                    <span className="text-[10px] text-slate-400 font-normal">JPG, PNG, WebP (Max 5MB)</span>
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {isUploadingLogo ? (
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      ) : logoUrl ? (
                        <img src={logoUrl} alt="School Logo Preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer border border-slate-700">
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingLogo ? 'Uploading to ImageKit...' : logoUrl ? 'Change Logo (ImageKit)' : 'Upload Official Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingLogo}
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {logoUrl && !isUploadingLogo && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 font-mono">CDN Ready</span>
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="text-[11px] text-rose-400 hover:underline"
                          >
                            Remove logo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Curriculum Framework *</label>
                    <select
                      value={curriculum}
                      onChange={(e) => setCurriculum(e.target.value as CurriculumType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="REB">Rwanda Education Board (REB)</option>
                      <option value="CAMBRIDGE">Cambridge International</option>
                      <option value="IB">International Baccalaureate (IB)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Institution Ownership *</label>
                    <select
                      value={ownershipType}
                      onChange={(e) => setOwnershipType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PRIVATE">Private School</option>
                      <option value="PUBLIC">Public / Government School</option>
                      <option value="GOVERNMENT_AIDED">Government Aided School</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Accommodation Type *</label>
                    <select
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="DAY">Day School Only</option>
                      <option value="BOARDING">Boarding School Only</option>
                      <option value="BOTH">Day & Boarding (Both)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">City / Sector *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Gisenyi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Rubavu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Estimated Student Population</label>
                    <input
                      type="number"
                      value={estimatedStudents}
                      onChange={(e) => setEstimatedStudents(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 350 (No default number)"
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">School Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="info@rubavu-hs.edu.rw"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Phone Contact *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 111 222"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Director Details */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. School Director / Principal Account Setup</h4>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Director Full Name *</label>
                  <input
                    type="text"
                    required
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="e.g. Dr. Emmanuel Nshimyumuremyi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Director Email *</label>
                    <input
                      type="email"
                      required
                      value={directorEmail}
                      onChange={(e) => setDirectorEmail(e.target.value)}
                      placeholder="director@rubavu-hs.edu.rw"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Director Phone</label>
                    <input
                      type="tel"
                      value={directorPhone}
                      onChange={(e) => setDirectorPhone(e.target.value)}
                      placeholder="+250 788 333 444"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Survey Details */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <span>3. Mandatory Pre-Registration Field Assessment Survey *</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Required for Approval</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Computer Lab Status *</label>
                    <select
                      value={computerLabStatus}
                      onChange={(e) => setComputerLabStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="YES_INTERNET">Computer Lab Available + High-Speed Internet</option>
                      <option value="YES_NO_INTERNET">Computer Lab Available (No Internet Connection)</option>
                      <option value="NO_LAB">No Computer Lab (Paper / Smartphone Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Internet Connectivity Level *</label>
                    <select
                      value={internetReliability}
                      onChange={(e) => setInternetReliability(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HIGH_SPEED">Reliable High-Speed Broadband / Fiber</option>
                      <option value="MODERATE">Moderate Mobile 4G / Intermittent</option>
                      <option value="POOR_OFFLINE_NEEDS">Poor Connection (Requires Offline Mode Support)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Primary Administrative Pain Point *</label>
                  <input
                    type="text"
                    required
                    value={primaryAdminChallenge}
                    onChange={(e) => setPrimaryAdminChallenge(e.target.value)}
                    placeholder="e.g. Delays in report card printing, manual fee tracking, lost record books"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Parent SMS Communication Priority *</label>
                    <select
                      value={smsCommunicationNeed}
                      onChange={(e) => setSmsCommunicationNeed(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ESSENTIAL">Essential (Immediate automated fee & result SMS)</option>
                      <option value="MODERATE">Moderate Priority</option>
                      <option value="NOT_PRIORITY">Low Priority / Not Immediately Needed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Primary Onboarding Objective *</label>
                    <input
                      type="text"
                      required
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      placeholder="e.g. Digitize grading, fee management, & parent communications"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Onboarding...' : 'Submit Institution Onboarding'}</span>
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
