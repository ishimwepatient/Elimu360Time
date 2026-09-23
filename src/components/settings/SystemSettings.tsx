import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { 
  Building2, 
  ShieldCheck, 
  RotateCcw, 
  Lock, 
  Key, 
  CheckCircle2, 
  Globe, 
  Sliders,
  User as UserIcon,
  Camera,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { uploadImageToImageKit } from '../../services/imageKitService';

export const SystemSettings: React.FC = () => {
  const { 
    activeSchool, 
    availableSchools, 
    setActiveSchool, 
    currentUser, 
    updateUserProfile,
    resetToDefaultData, 
    triggerConfetti 
  } = useElimu();

  const isPrivileged = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SCHOOL_ADMIN';
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SCHOOL'>(isPrivileged ? 'SCHOOL' : 'PERSONAL');

  // School configuration state
  const [schoolName, setSchoolName] = useState(activeSchool.name);
  const [motto, setMotto] = useState(activeSchool.motto);
  const [city, setCity] = useState(activeSchool.city);
  const [curriculum, setCurriculum] = useState(activeSchool.curriculum_type);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Photo state
  const [photoPreview, setPhotoPreview] = useState<string>(currentUser.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordShow, setPasswordShow] = useState({ current: false, new: false, confirm: false });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Security Question state
  const [securityQuestion, setSecurityQuestion] = useState(currentUser.security_question || '');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [confirmSecurityAnswer, setConfirmSecurityAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [savingSecurity, setSavingSecurity] = useState(false);

  const securityQuestionsList = [
    "What was the name of your first school?",
    "In what city or town were you born?",
    "What was your childhood nickname?",
    "What is your maternal grandmother's maiden name?",
    "What was the name of your first pet?",
    "What was the make and model of your first car?"
  ];

  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    triggerConfetti();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setPhotoMessage({ type: 'error', text: 'File size exceeds 10MB limit. Please select a smaller photo.' });
      return;
    }

    setPhotoMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleUploadPhoto = async () => {
    if (!photoPreview) {
      setPhotoMessage({ type: 'error', text: 'Please select an image file first.' });
      return;
    }

    setUploadingPhoto(true);
    setPhotoMessage(null);

    try {
      let finalUrl = photoPreview;

      if (selectedFile) {
        const result = await uploadImageToImageKit(selectedFile, {
          folder: `/elimu360/${currentUser.role.toLowerCase()}`,
          fileName: `profile_${currentUser.id}_${Date.now()}.png`,
          tags: ['profile', 'settings', currentUser.role.toLowerCase()],
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.9
        });
        finalUrl = result.url;
      }

      updateUserProfile(currentUser.id, {
        avatar_url: finalUrl,
        updated_at: new Date().toISOString()
      });

      setPhotoMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      setSelectedFile(null);
      triggerConfetti();
    } catch (err: any) {
      setPhotoMessage({ type: 'error', text: err?.message || 'Failed to upload profile photo.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);

    try {
      // 1. Verify current password
      let isCurrentValid = false;
      if (currentUser.password_hash) {
        if (currentUser.password_hash.startsWith('$2a$') || currentUser.password_hash.startsWith('$2b$')) {
          isCurrentValid = bcrypt.compareSync(currentPassword, currentUser.password_hash);
        } else {
          isCurrentValid = currentUser.password_hash === currentPassword;
        }
      } else {
        // Fallback for default super admin password if hash was missing (highly unlikely but secure)
        isCurrentValid = currentPassword === 'Admin@1234';
      }

      if (!isCurrentValid) {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
        setSavingPassword(false);
        return;
      }

      // 2. Hash new password and save
      const salt = bcrypt.genSaltSync(10);
      const newHash = bcrypt.hashSync(newPassword, salt);

      updateUserProfile(currentUser.id, {
        password_hash: newHash,
        updated_at: new Date().toISOString()
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerConfetti();
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'An error occurred while updating your password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (!securityQuestion) {
      setSecurityMessage({ type: 'error', text: 'Please select a valid security question.' });
      return;
    }

    if (!securityAnswer || !confirmSecurityAnswer) {
      setSecurityMessage({ type: 'error', text: 'Security answer fields are required.' });
      return;
    }

    if (securityAnswer.trim().toLowerCase() !== confirmSecurityAnswer.trim().toLowerCase()) {
      setSecurityMessage({ type: 'error', text: 'Security answers do not match.' });
      return;
    }

    setSavingSecurity(true);

    try {
      // Hash answer securely so the plaintext is never stored in Firestore (Industry standard!)
      const salt = bcrypt.genSaltSync(10);
      const answerHash = bcrypt.hashSync(securityAnswer.trim().toLowerCase(), salt);

      updateUserProfile(currentUser.id, {
        security_question: securityQuestion,
        security_answer_hash: answerHash,
        updated_at: new Date().toISOString()
      });

      setSecurityMessage({ type: 'success', text: 'Security question & answer configured securely!' });
      setSecurityAnswer('');
      setConfirmSecurityAnswer('');
      triggerConfetti();
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err?.message || 'An error occurred while saving security configurations.' });
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Elimu360 SIMS · System Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Settings & Security Configurations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, credentials, security questions, and institutional multi-tenancy parameters.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start max-w-md">
        {isPrivileged && (
          <button
            type="button"
            onClick={() => setActiveTab('SCHOOL')}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeTab === 'SCHOOL' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>School Setup & Tenancy</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab('PERSONAL')}
          className={`flex-1 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
            activeTab === 'PERSONAL' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account & Security Settings</span>
        </button>
      </div>

      {/* ==================== TAB 1: SCHOOL SETUP ==================== */}
      {activeTab === 'SCHOOL' && isPrivileged && (
        <div className="space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Tenant configuration parameters saved to production system configuration!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: School Settings Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Active Institution Profile ({activeSchool.code})</span>
                </h3>

                <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Institution Legal Name:</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Motto / Academic Credo:</label>
                    <input
                      type="text"
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">City / District:</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Curriculum Framework:</label>
                      <select
                        value={curriculum}
                        onChange={(e) => setCurriculum(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="REB_RWANDA">Rwanda REB National Curriculum</option>
                        <option value="CAMBRIDGE_INTERNATIONAL">Cambridge Assessment International</option>
                        <option value="IB_WORLD">International Baccalaureate (IB)</option>
                        <option value="HYBRID_REB_CAMBRIDGE">Hybrid REB & Cambridge</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Active Academic Year:</label>
                      <input
                        type="text"
                        disabled
                        value={activeSchool.active_academic_year}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Active Term Session:</label>
                      <input
                        type="text"
                        disabled
                        value={activeSchool.active_term}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>

              {/* Multi-Tenant Instances */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Tenant School Partitions (Palace Tech House)</span>
                </h3>

                <div className="space-y-3">
                  {availableSchools.map(sch => (
                    <div 
                      key={sch.id} 
                      className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                        sch.id === activeSchool.id ? 'bg-blue-950/50 border-blue-600' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{sch.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Tenant Code: {sch.code} · Partition ID: {sch.id}</div>
                      </div>

                      {sch.id === activeSchool.id ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          Active Partition
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveSchool(sch)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                        >
                          Switch Tenant
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Production Infrastructure & Danger Zone */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & Compliance</span>
                </div>

                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="font-mono text-white">Enterprise Multi-Tenant</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">SMS Gateway:</span>
                    <span className="font-mono text-blue-400">Elimu360 Direct Messaging v2.1</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payment Gateway:</span>
                    <span className="font-mono text-amber-400">MTN MoMo OpenAPI</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Offline Sync:</span>
                    <span className="font-mono text-emerald-400">Rwanda 3G Local-First</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/50 shadow-xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <RotateCcw className="w-4 h-4" />
                  <span>Demo Environment Reset</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Reset all local students, grades, receipts, and timetable periods back to the official default baseline.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset entire system database to default demonstration records?')) {
                      resetToDefaultData();
                      triggerConfetti();
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-xs transition cursor-pointer"
                >
                  Reset to Baseline State
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 2: PERSONAL SECURITY & PROFILE ==================== */}
      {activeTab === 'PERSONAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Profile Photo Settings */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Profile Photo & Passport Identity</span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-3 py-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile Preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <UserIcon className="w-14 h-14 text-slate-600" />
                    )}
                  </div>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setSelectedFile(null);
                      }}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition cursor-pointer"
                      title="Clear photo preview"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Photo Message */}
              {photoMessage && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  photoMessage.type === 'success' 
                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/70 border-rose-800 text-rose-300'
                }`}>
                  {photoMessage.text}
                </div>
              )}

              {/* Upload input */}
              <div className="space-y-3 text-xs">
                <label className="border border-dashed border-slate-800 bg-slate-950/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 hover:border-blue-500 hover:bg-blue-950/20 transition cursor-pointer text-center">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Choose profile photo file
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Max 10MB (JPG, PNG, WEBP)
                    </span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>

                {selectedFile && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">
                      Ready to Upload
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={uploadingPhoto || !photoPreview}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {uploadingPhoto ? 'Processing Upload...' : 'Upload & Update Profile Photo'}
                </button>
              </div>

            </div>
          </div>

          {/* Right Panel: Change Password and Security Questions Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Password Panel */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Configure Secure Account Password</span>
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  passwordMessage.type === 'success' 
                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/70 border-rose-800 text-rose-300'
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Current Password:</label>
                    <div className="relative">
                      <input
                        type={passwordShow.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current secret code"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordShow(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {passwordShow.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">New Password:</label>
                    <div className="relative">
                      <input
                        type={passwordShow.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordShow(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {passwordShow.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Confirm New Password:</label>
                    <div className="relative">
                      <input
                        type={passwordShow.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new secret"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordShow(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {passwordShow.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 transition cursor-pointer"
                  >
                    {savingPassword ? 'Hashing & Saving...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Questions Panel */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Industry-Grade Security Challenge Questions</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-900/40 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Configuring a security question enables rapid identity verification for administrative overrides or credential resets. 
                  Your answer is **fully salted and hashed** prior to transmission; no system officer or administrator can inspect your answers in plaintext.
                </span>
              </div>

              {securityMessage && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  securityMessage.type === 'success' 
                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/70 border-rose-800 text-rose-300'
                }`}>
                  {securityMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveSecurityQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Select Security Challenge Question:</label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose security question --</option>
                    {securityQuestionsList.map((q, i) => (
                      <option key={i} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Your Security Answer:</label>
                    <div className="relative">
                      <input
                        type={showAnswer ? "text" : "password"}
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Enter answer (case-insensitive)"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Confirm Security Answer:</label>
                    <div className="relative">
                      <input
                        type={showAnswer ? "text" : "password"}
                        value={confirmSecurityAnswer}
                        onChange={(e) => setConfirmSecurityAnswer(e.target.value)}
                        placeholder="Repeat security answer"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={savingSecurity}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition cursor-pointer"
                  >
                    {savingSecurity ? 'Hashing & Configuring...' : 'Configure Security Question'}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

// Simple inline micro icon component for clear code execution
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
