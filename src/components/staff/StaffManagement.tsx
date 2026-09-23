import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Mail, 
  Phone, 
  BookOpen, 
  Wallet, 
  Sparkles, 
  Building2, 
  Search,
  Filter,
  Check,
  Award,
  Crown,
  GraduationCap,
  Camera
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { UserRole, User } from '../../types';
import { StaffPhotoUploadModal } from './StaffPhotoUploadModal';

export const StaffManagement: React.FC = () => {
  const { 
    currentUser, 
    activeSchool, 
    availableUsers, 
    classes, 
    subjects, 
    registerStaffMember,
    triggerConfetti 
  } = useElimu();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'DOS' | 'DOD' | 'BURSAR' | 'TEACHER' | 'LIBRARIAN'>(
    currentUser.role === 'DOS' ? 'TEACHER' : 'DOS'
  );
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [assignedClassId, setAssignedClassId] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [staffForPhotoModal, setStaffForPhotoModal] = useState<User | null>(null);
  
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string; token?: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Accessible staff for current user scope
  const schoolStaff = availableUsers.filter(u => 
    ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS', 'DOD', 'BURSAR', 'TEACHER', 'LIBRARIAN'].includes(u.role) &&
    (u.school_id === activeSchool.id || u.school_id === 'all')
  );

  const filteredStaff = schoolStaff.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionFeedback(null);

    const res = registerStaffMember({
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: selectedRole,
      title: staffTitle || undefined,
      assigned_class_id: assignedClassId || undefined,
      subject_names: selectedSubjects.length > 0 ? selectedSubjects : undefined
    });

    if (res.success && res.staff) {
      setActionFeedback({
        type: 'success',
        message: res.message,
        token: res.staff.activation_token
      });
      triggerConfetti();
      // Reset form
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffTitle('');
      setAssignedClassId('');
      setSelectedSubjects([]);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">Super Admin</span>;
      case 'SCHOOL_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">School Director</span>;
      case 'DOS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">DOS</span>;
      case 'BURSAR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Bursar</span>;
      case 'DOD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">DOD (Discipline)</span>;
      case 'TEACHER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Teacher</span>;
      case 'LIBRARIAN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">Librarian</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Hierarchy & Access Delegation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Institutional Staff Directory & Onboarding
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Authorize departmental heads, register academic teachers, and issue activation tokens for secure first-time password claiming.
          </p>
        </div>

        {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role) && (
          <button
            onClick={() => {
              setIsRegisterOpen(!isRegisterOpen);
              setActionFeedback(null);
            }}
            className="px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-900/30 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRegisterOpen ? 'Close Registration Form' : 'Register New Staff Member'}</span>
          </button>
        )}
      </div>

      {/* Permission / Delegation Rules Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white">Delegation Hierarchy Enforced</div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              • <strong>Director:</strong> Registers DOS, Bursar, Teachers & Librarians · • <strong>DOS:</strong> Registers Teachers & Librarians (Bursar restricted to Director)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>Your Role:</span>
          {getRoleBadge(currentUser.role)}
        </div>
      </div>

      {/* REGISTRATION FORM DRAWER */}
      {isRegisterOpen && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-blue-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Onboard & Invite Staff Member</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Issuing Authority: {currentUser.name} ({currentUser.role})
            </span>
          </div>

          {actionFeedback && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
              actionFeedback.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-start gap-2.5">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{actionFeedback.message}</div>
                  {actionFeedback.token && (
                    <div className="mt-2 flex items-center gap-2 text-slate-200">
                      <span>Activation Token:</span>
                      <code className="px-2.5 py-1 rounded bg-slate-950 border border-emerald-500/50 font-mono text-amber-300 font-bold text-sm">
                        {actionFeedback.token}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {actionFeedback.token && (
                <button
                  onClick={() => copyToClipboard(actionFeedback.token!)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedToken === actionFeedback.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken === actionFeedback.token ? 'Copied' : 'Copy Code'}</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Staff Role to Provision
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* DOS Option (Only Director or Super Admin) */}
                {['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole('DOS')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedRole === 'DOS' 
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-400 mb-1.5" />
                    <div className="font-bold text-xs text-white">Director of Studies</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Academic Lead (DOS)</div>
                  </button>
                )}

                {/* Bursar Option (EXCLUSIVELY Director or Super Admin) */}
                {['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole('BURSAR')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedRole === 'BURSAR' 
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-400 mb-1.5" />
                    <div className="font-bold text-xs text-white">Chief Bursar</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Finance Officer (Director Only)</div>
                  </button>
                )}

                {/* DOD Option (EXCLUSIVELY Director or Super Admin) */}
                {['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole('DOD')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedRole === 'DOD' 
                        ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-rose-400 mb-1.5" />
                    <div className="font-bold text-xs text-white">Director of Discipline</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">DOD (Director Only)</div>
                  </button>
                )}

                {/* Teacher Option (Director, DOS, Super Admin) */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('TEACHER')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedRole === 'TEACHER' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 text-indigo-400 mb-1.5" />
                  <div className="font-bold text-xs text-white">Teacher / Master</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Classroom & Subject Faculty</div>
                </button>

                {/* Librarian Option (Director, DOS, Super Admin) */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('LIBRARIAN')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedRole === 'LIBRARIAN' 
                      ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-pink-400 mb-1.5" />
                  <div className="font-bold text-xs text-white">Librarian</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Knowledge & Media Officer</div>
                </button>

              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Theogene Nshimiyimana"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. theogene@kigaliapex.edu.rw"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number (MTN / Airtel) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +250 788 340 999"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Designation / Academic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Mathematics"
                  value={staffTitle}
                  onChange={(e) => setStaffTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Teacher Specific: Class & Subject Assignment */}
            {selectedRole === 'TEACHER' && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Teaching Assignments (REB / Cambridge Pacing)
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Assigned Class Master Stream</label>
                    <select
                      value={assignedClassId}
                      onChange={(e) => setAssignedClassId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- None (Subject Master Only) --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.level} · {c.stream})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Primary Subjects Taught</label>
                    <div className="flex flex-wrap gap-2">
                      {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Kinyarwanda', 'ICT / Computer Science'].map(subj => {
                        const isSelected = selectedSubjects.includes(subj);
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
                              } else {
                                setSelectedSubjects([...selectedSubjects, subj]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Staff Invite & Generate Token</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'SCHOOL_ADMIN', 'DOS', 'BURSAR', 'TEACHER', 'LIBRARIAN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${
                roleFilter === role 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Staff Members Table / Card Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Active Campus Staff & Delegation Registry ({filteredStaff.length})</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activeSchool.name} ({activeSchool.code})
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No staff members found matching criteria.
            </div>
          ) : (
            filteredStaff.map(staff => (
              <div key={staff.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                
                <div className="flex items-start gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={staff.avatar_url} 
                      alt={staff.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700" 
                    />
                    <button
                      onClick={() => setStaffForPhotoModal(staff)}
                      className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-500 transition cursor-pointer"
                      title="Upload / Change Staff Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{staff.name}</span>
                      {getRoleBadge(staff.role)}
                      {staff.is_claimed === false ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          Pending Password Claim
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.email}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.phone}</span>
                      </span>
                      {staff.title && (
                        <>
                          <span>·</span>
                          <span className="text-slate-300 font-medium">{staff.title}</span>
                        </>
                      )}
                    </div>

                    {staff.subject_names && staff.subject_names.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[11px] text-slate-400">Subjects:</span>
                        {staff.subject_names.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {staff.is_claimed === false && staff.activation_token && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-right">
                        <div className="text-[9px] text-amber-400 uppercase font-bold">Claim Token</div>
                        <code className="text-xs font-mono font-bold text-amber-300">
                          {staff.activation_token}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(staff.activation_token!)}
                        className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer"
                        title="Copy activation token for staff member"
                      >
                        {copiedToken === staff.activation_token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {staff.created_by_name && (
                    <div className="text-[11px] text-slate-400 text-right hidden lg:block">
                      <span>Invited by: {staff.created_by_name}</span>
                      <div className="text-[10px]">{staff.created_at || '2026-08-30'}</div>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {staffForPhotoModal && (
        <StaffPhotoUploadModal
          userToUpdate={staffForPhotoModal}
          onClose={() => setStaffForPhotoModal(null)}
        />
      )}

    </div>
  );
};
