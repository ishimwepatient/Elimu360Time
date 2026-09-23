import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Key, 
  Copy, 
  RefreshCw, 
  Building2, 
  UserCheck, 
  AlertTriangle,
  UserX,
  Lock,
  ExternalLink,
  UserPlus,
  X,
  Shield
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { User, UserRole } from '../../types';

export const MasterUserAccountsManager: React.FC = () => {
  const { 
    currentUser, 
    availableUsers, 
    availableSchools, 
    permanentlyDeleteUser,
    restoreRegistrarBySuperAdmin,
    reassignRegistrarToCoordinator,
    bulkReassignRegistrars,
    registerCoordinator,
    registerRegistrar,
    refreshDataFromCloud
  } = useElimu();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');
  const [claimStatusFilter, setClaimStatusFilter] = useState<'ALL' | 'CLAIMED' | 'UNCLAIMED'>('ALL');
  
  // Registration Modal State (Super Admin Register Coordinator & Registrar)
  const [showRegModal, setShowRegModal] = useState(false);
  const [regRoleTab, setRegRoleTab] = useState<'COORDINATOR' | 'REGISTRAR'>('COORDINATOR');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regCoordinatorId, setRegCoordinatorId] = useState('');
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'error'; message: string; code?: string } | null>(null);

  // Wipeout Confirmation Modal State
  const [userToWipe, setUserToWipe] = useState<User | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reassign Registrar Modal State
  const [registrarToReassign, setRegistrarToReassign] = useState<User | null>(null);
  const [targetCoordinatorId, setTargetCoordinatorId] = useState<string>('');
  
  // Bulk Redistribution State
  const [bulkSourceCoordId, setBulkSourceCoordId] = useState<string>('');
  const [bulkTargetCoordId, setBulkTargetCoordId] = useState<string>('');
  const [showBulkRedistributeModal, setShowBulkRedistributeModal] = useState<boolean>(false);

  // List of active Coordinators for dropdown
  const coordinatorsList = useMemo(() => {
    return availableUsers.filter(u => u.role === 'COORDINATOR' && !u.is_deleted_by_coordinator);
  }, [availableUsers]);

  // Orphaned Registrars (e.g. whose Coordinator was wiped out)
  const orphanedRegistrars = useMemo(() => {
    return availableUsers.filter(u => 
      u.role === 'REGISTER' && 
      (!u.assigned_coordinator_id || !coordinatorsList.some(c => c.id === u.assigned_coordinator_id))
    );
  }, [availableUsers, coordinatorsList]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return availableUsers.filter(user => {
      // Search term
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.activation_token && user.activation_token.toLowerCase().includes(searchTerm.toLowerCase()));

      // Role filter
      const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;

      // School filter
      const matchesSchool = selectedSchoolId === 'ALL' || user.school_id === selectedSchoolId || user.school_id === 'all';

      // Claim filter
      const matchesClaim = 
        claimStatusFilter === 'ALL' ||
        (claimStatusFilter === 'CLAIMED' && user.is_claimed) ||
        (claimStatusFilter === 'UNCLAIMED' && !user.is_claimed);

      return matchesSearch && matchesRole && matchesSchool && matchesClaim;
    });
  }, [availableUsers, searchTerm, selectedRole, selectedSchoolId, claimStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = availableUsers.length;
    const directors = availableUsers.filter(u => u.role === 'SCHOOL_ADMIN').length;
    const leaders = availableUsers.filter(u => ['DOS', 'DOD', 'BURSAR'].includes(u.role)).length;
    const teachers = availableUsers.filter(u => u.role === 'TEACHER').length;
    const studentsAndParents = availableUsers.filter(u => ['STUDENT', 'PARENT'].includes(u.role)).length;
    const unclaimed = availableUsers.filter(u => !u.is_claimed).length;

    return { total, directors, leaders, teachers, studentsAndParents, unclaimed };
  }, [availableUsers]);

  const handleCopyToken = (token: string, userId: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(userId);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const handleExecuteWipeout = async () => {
    if (!userToWipe) return;
    setIsWiping(true);
    setActionFeedback(null);

    const result = await permanentlyDeleteUser(userToWipe.id);
    setIsWiping(false);
    setUserToWipe(null);

    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }

    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDataFromCloud(true);
    setIsRefreshing(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegFeedback({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    if (regRoleTab === 'COORDINATOR') {
      const res = registerCoordinator({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        title: regTitle.trim() || 'Regional System Coordinator'
      });
      if (res.success && res.coordinator) {
        setRegFeedback({
          type: 'success',
          message: res.message,
          code: res.coordinator.activation_token
        });
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegTitle('');
      } else {
        setRegFeedback({ type: 'error', message: res.message });
      }
    } else {
      if (!regCoordinatorId && coordinatorsList.length > 0) {
        setRegFeedback({ type: 'error', message: 'Please select an assigned Regional Coordinator for this Registrar.' });
        return;
      }
      const res = registerRegistrar({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        title: regTitle.trim() || 'Field School Registrar',
        assigned_coordinator_id: regCoordinatorId || (coordinatorsList[0]?.id || '')
      });
      if (res.success && res.registrar) {
        setRegFeedback({
          type: 'success',
          message: res.message,
          code: res.registrar.activation_token
        });
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegTitle('');
      } else {
        setRegFeedback({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-red-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Master Security & Accounts Purge Hub
            </div>
            <h1 className="text-2xl font-bold tracking-tight">System-Wide Account Management</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Manage Regional Coordinators, School Registrars, and institutional accounts across all tenant schools. Purged accounts are irreversibly removed from the system database.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowRegModal(true);
                setRegFeedback(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Coordinator / Registrar</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Resync Database
            </button>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{actionFeedback.message}</span>
        </div>
      )}

      {/* Orphaned Registrars / Bulk Redistribution Alert */}
      {orphanedRegistrars.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-300 text-sm">
                Unassigned / Orphaned Registrars Detected ({orphanedRegistrars.length})
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5 max-w-2xl leading-relaxed">
                Some school registrars do not have an active Coordinator (e.g. after their Coordinator was wiped or removed). Distribute them to active Coordinators to keep school registration workflows running smoothly.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowBulkRedistributeModal(true);
              setBulkSourceCoordId('');
              setBulkTargetCoordId(coordinatorsList[0]?.id || '');
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shrink-0 cursor-pointer"
          >
            Redistribute Registrars Now
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-blue-600 uppercase">School Directors</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats.directors}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-indigo-600 uppercase">Academic Leaders</div>
          <div className="text-2xl font-black text-indigo-900 mt-1">{stats.leaders}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-teal-600 uppercase">Teachers</div>
          <div className="text-2xl font-black text-teal-900 mt-1">{stats.teachers}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-600 uppercase">Students/Parents</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{stats.studentsAndParents}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase">Pending Activation</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.unclaimed}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Roles ({availableUsers.length})</option>
              <option value="SUPER_ADMIN">Super Admins</option>
              <option value="COORDINATOR">Regional Coordinators</option>
              <option value="REGISTER">School Registrars (Registers)</option>
              <option value="SCHOOL_ADMIN">School Directors (School Admin)</option>
              <option value="DOS">Directors of Studies (DOS)</option>
              <option value="DOD">Directors of Discipline (DOD)</option>
              <option value="BURSAR">Chief Bursars</option>
              <option value="TEACHER">Teachers</option>
              <option value="LIBRARIAN">Librarians</option>
              <option value="STUDENT">Students</option>
              <option value="PARENT">Parents</option>
            </select>
          </div>

          {/* School Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Schools</option>
              {availableSchools.map(sch => (
                <option key={sch.id} value={sch.id}>{sch.code} - {sch.name}</option>
              ))}
            </select>
          </div>

          {/* Claim Filter */}
          <div className="md:col-span-2">
            <select
              value={claimStatusFilter}
              onChange={(e) => setClaimStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CLAIMED">Claimed (Active)</option>
              <option value="UNCLAIMED">Unclaimed (Pending)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Master User Accounts Registry ({filteredUsers.length})</span>
          </div>
          <span className="text-xs text-slate-500">
            Click "Wipe Out" to permanently purge from system database & local cache
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <UserX className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No matching user accounts found</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your search term or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">School Affiliation</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-4 py-3.5">Activation Token</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                  const school = availableUsers.find(s => s.id === user.school_id) 
                    ? availableSchools.find(s => s.id === user.school_id) 
                    : availableSchools.find(s => s.id === user.school_id);
                  const isCurrentSuper = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                        {user.phone && <div className="text-[11px] text-slate-400">{user.phone}</div>}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'SCHOOL_ADMIN' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'DOS' ? 'bg-indigo-100 text-indigo-800' :
                          user.role === 'DOD' ? 'bg-rose-100 text-rose-800' :
                          user.role === 'BURSAR' ? 'bg-emerald-100 text-emerald-800' :
                          user.role === 'TEACHER' ? 'bg-teal-100 text-teal-800' :
                          user.role === 'STUDENT' ? 'bg-sky-100 text-sky-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* School */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 text-xs">
                          {user.school_id === 'all' ? 'All Institutions (National)' : school?.name || user.school_id}
                        </div>
                        {school && (
                          <div className="text-[11px] text-slate-400">Code: {school.code}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {user.is_claimed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck className="w-3 h-3" />
                            Claimed & Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            Pending Activation
                          </span>
                        )}
                      </td>

                      {/* Activation Token */}
                      <td className="px-4 py-3.5">
                        {user.activation_token ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                              {user.activation_token}
                            </span>
                            <button
                              onClick={() => handleCopyToken(user.activation_token!, user.id)}
                              title="Copy activation token"
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition"
                            >
                              {copiedTokenId === user.id ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None (Claimed)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        {isCurrentSuper ? (
                          <span className="text-xs text-slate-400 italic">Active Session</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {user.role === 'REGISTER' && (
                              <button
                                onClick={() => {
                                  setRegistrarToReassign(user);
                                  setTargetCoordinatorId(user.assigned_coordinator_id || coordinatorsList[0]?.id || '');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition border border-indigo-200 hover:border-indigo-600 cursor-pointer"
                                title="Reassign Registrar to another Coordinator"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Reassign
                              </button>
                            )}

                            <button
                              onClick={() => setUserToWipe(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-bold transition border border-red-200 hover:border-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Wipe Out Forever
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registrars Deleted by Coordinators (Super Admin Oversight) */}
      {(() => {
        const deletedRegistrars = availableUsers.filter(u => u.role === 'REGISTER' && u.is_deleted_by_coordinator);
        if (deletedRegistrars.length === 0) return null;

        return (
          <div className="bg-amber-950/20 rounded-2xl p-6 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-amber-400" />
                  <span>Registrars Deleted by Regional Coordinators ({deletedRegistrars.length})</span>
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  When Coordinators remove Registrars, the Super Admin retains full visibility to inspect, restore, or permanently wipe out these accounts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-amber-500/20 bg-slate-900 shadow-md">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-amber-400 font-semibold uppercase tracking-wider text-[11px] border-b border-amber-500/20">
                  <tr>
                    <th className="p-3">Registrar Name</th>
                    <th className="p-3">Email & Contact</th>
                    <th className="p-3">Deleted By (Coordinator)</th>
                    <th className="p-3">Deletion Time</th>
                    <th className="p-3 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {deletedRegistrars.map((reg) => (
                    <tr key={reg.id} className="hover:bg-amber-500/5 transition">
                      <td className="p-3 font-bold text-white">
                        {reg.name}
                        <div className="text-[10px] text-slate-400 font-normal">{reg.title || 'Field Registrar'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono">{reg.email}</div>
                        <div className="text-[10px] text-slate-400">{reg.phone}</div>
                      </td>
                      <td className="p-3 text-amber-300 font-semibold">
                        {reg.deleted_by_coordinator_name || 'Coordinator'}
                      </td>
                      <td className="p-3 text-slate-400">
                        {reg.deleted_at ? new Date(reg.deleted_at).toLocaleString() : 'Recently'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            const res = restoreRegistrarBySuperAdmin(reg.id);
                            alert(res.message);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 text-xs transition cursor-pointer"
                        >
                          Restore Registrar
                        </button>

                        <button
                          onClick={() => setUserToWipe(reg)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold border border-rose-500/40 text-xs transition cursor-pointer"
                        >
                          Wipe Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Wipeout Confirmation Modal */}
      {userToWipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Permanent Account Wipeout</h3>
                <p className="text-xs text-red-600 font-medium">Irreversible Cloud Deletion</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs block">Account Name</span>
                <span className="font-bold text-slate-900">{userToWipe.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Email Address</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{userToWipe.email}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Assigned Role & School</span>
                <span className="font-semibold text-slate-800">{userToWipe.role} · School: {userToWipe.school_id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete the user document from the <strong>System Database</strong> and clear all cached references. The user will be banned from automatic cache rehydration and will never reappear.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToWipe(null)}
                disabled={isWiping}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteWipeout}
                disabled={isWiping}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition disabled:opacity-50"
              >
                {isWiping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Wiping Out Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Permanent Wipeout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal (Super Admin: Register Coordinator or Registrar) */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 text-white overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Register Administrative Account</h3>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 bg-slate-950/50 p-2 border-b border-slate-800 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRegRoleTab('COORDINATOR');
                  setRegFeedback(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  regRoleTab === 'COORDINATOR'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Regional Coordinator
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegRoleTab('REGISTRAR');
                  setRegFeedback(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  regRoleTab === 'REGISTRAR'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                School Registrar
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {regFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs ${
                  regFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="font-bold">{regFeedback.message}</div>
                  {regFeedback.code && (
                    <div className="mt-2 flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-amber-300 font-bold">
                      <span>Activation Token: {regFeedback.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyToken(regFeedback.code!, 'reg-token')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white transition"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {regRoleTab === 'COORDINATOR' ? 'Coordinator Full Name *' : 'Registrar Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={regRoleTab === 'COORDINATOR' ? 'e.g. Jean Paul Habimana' : 'e.g. Marie Claire Uwase'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="official.email@elimu360.rw"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Title / Designation</label>
                <input
                  type="text"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder={regRoleTab === 'COORDINATOR' ? 'e.g. Regional Coordinator - Western Province' : 'e.g. Field Registrar - Rubavu District'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {regRoleTab === 'REGISTRAR' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assign to Regional Coordinator</label>
                  <select
                    value={regCoordinatorId}
                    onChange={(e) => setRegCoordinatorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {coordinatorsList.length === 0 ? (
                      <option value="">No active Coordinators found. Create a Coordinator first.</option>
                    ) : (
                      coordinatorsList.map(coord => (
                        <option key={coord.id} value={coord.id}>
                          {coord.name} ({coord.title || 'Coordinator'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 transition cursor-pointer shadow-lg ${
                    regRoleTab === 'COORDINATOR' ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-400 hover:bg-emerald-300'
                  }`}
                >
                  {regRoleTab === 'COORDINATOR' ? 'Create Coordinator' : 'Create Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Registrar Reassign Modal */}
      {registrarToReassign && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 text-white shadow-2xl relative">
            <button
              onClick={() => setRegistrarToReassign(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Reassign Registrar</h3>
                <p className="text-xs text-slate-400">Move Registrar to a new Regional Coordinator</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-slate-200">{registrarToReassign.name}</div>
              <div className="text-xs text-slate-400 font-mono">{registrarToReassign.email}</div>
              <div className="text-[11px] text-indigo-400 mt-1">
                Current Coordinator: {registrarToReassign.assigned_coordinator_name || 'None (Unassigned)'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Target Coordinator *</label>
              <select
                value={targetCoordinatorId}
                onChange={(e) => setTargetCoordinatorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Active Coordinator --</option>
                {coordinatorsList.map(coord => (
                  <option key={coord.id} value={coord.id}>
                    {coord.name} ({coord.title || 'Coordinator'})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRegistrarToReassign(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!targetCoordinatorId) {
                    alert('Please select a target Coordinator.');
                    return;
                  }
                  const res = reassignRegistrarToCoordinator(registrarToReassign.id, targetCoordinatorId);
                  alert(res.message);
                  if (res.success) {
                    setRegistrarToReassign(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase tracking-wider text-white transition shadow-lg cursor-pointer"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Redistribution Modal */}
      {showBulkRedistributeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowBulkRedistributeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Bulk Registrar Redistribution</h3>
                <p className="text-xs text-slate-400">Distribute orphaned or assigned registrars to another Coordinator</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">From Source Coordinator (or Orphaned)</label>
                <select
                  value={bulkSourceCoordId}
                  onChange={(e) => setBulkSourceCoordId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Unassigned / Orphaned Registrars ({orphanedRegistrars.length})</option>
                  {coordinatorsList.map(coord => {
                    const managedCount = availableUsers.filter(u => u.role === 'REGISTER' && u.assigned_coordinator_id === coord.id).length;
                    return (
                      <option key={coord.id} value={coord.id}>
                        {coord.name} (Currently manages {managedCount} Registrars)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">To Target Coordinator *</label>
                <select
                  value={bulkTargetCoordId}
                  onChange={(e) => setBulkTargetCoordId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Target Coordinator --</option>
                  {coordinatorsList.map(coord => (
                    <option key={coord.id} value={coord.id}>
                      {coord.name} ({coord.title || 'Coordinator'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkRedistributeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!bulkTargetCoordId) {
                    alert('Please select a target Coordinator.');
                    return;
                  }
                  const res = bulkReassignRegistrars(bulkSourceCoordId, bulkTargetCoordId);
                  alert(res.message);
                  if (res.success) {
                    setShowBulkRedistributeModal(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider text-slate-950 transition shadow-lg cursor-pointer"
              >
                Execute Redistribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
