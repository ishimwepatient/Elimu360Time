import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Sparkles, 
  KeyRound, 
  Copy, 
  Check, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  School as SchoolIcon,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { CurriculumType, School } from '../../types';
import { uploadImageToImageKit, buildOptimizedImageUrl, isImageKitConfigured } from '../../services/imageKitService';
import { SchoolCrest } from '../brand/SchoolCrest';

export const SchoolProfileManager: React.FC = () => {
  const { 
    currentUser, 
    availableSchools, 
    activeSchool, 
    setActiveSchool, 
    registerSchoolBySuperAdmin, 
    deleteSchool,
    generateUniqueSchoolCode,
    updateSchoolProfile,
    students,
    availableUsers
  } = useElimu();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  // New School Form State
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('REB');
  const [ownershipType, setOwnershipType] = useState<'PUBLIC' | 'PRIVATE' | 'GOVERNMENT_AIDED'>('PRIVATE');
  const [accommodationType, setAccommodationType] = useState<'DAY' | 'BOARDING' | 'BOTH'>('BOTH');
  const [country, setCountry] = useState('Rwanda');
  const [city, setCity] = useState('Kigali');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('+250 788 ');
  const [motto, setMotto] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');
  const [directorPhone, setDirectorPhone] = useState('+250 788 ');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string>('');
  const [isUploadingSchoolLogo, setIsUploadingSchoolLogo] = useState(false);
  const [schoolLogoFeedback, setSchoolLogoFeedback] = useState<string | null>(null);

  // National Coat of Arms State (Super Admin)
  const [isUploadingCoatOfArms, setIsUploadingCoatOfArms] = useState(false);
  const [coatOfArmsFeedback, setCoatOfArmsFeedback] = useState<string | null>(null);
  const [showDeleteCoatConfirm, setShowDeleteCoatConfirm] = useState(false);
  const coatOfArmsInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);
  const editLogoInputRef = useRef<HTMLInputElement>(null);

  // Edit School Form State
  const [editMotto, setEditMotto] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTerm, setEditTerm] = useState('Term 2');
  const [editYear, setEditYear] = useState('2026');
  const [editLogoUrl, setEditLogoUrl] = useState<string>('');
  const [isUploadingEditLogo, setIsUploadingEditLogo] = useState(false);

  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string; token?: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Auto-generate unique conflict-free school abbreviation code when name changes
  useEffect(() => {
    if (schoolName && schoolName.trim() && !isCodeManuallyEdited) {
      try {
        const generated = generateUniqueSchoolCode(schoolName);
        if (generated) {
          setSchoolCode(generated);
        }
      } catch (err) {
        console.error('Error auto-generating school abbreviation code:', err);
      }
    }
  }, [schoolName, isCodeManuallyEdited, availableSchools, generateUniqueSchoolCode]);

  const handleUploadCoatOfArms = async (file: File) => {
    try {
      setIsUploadingCoatOfArms(true);
      setCoatOfArmsFeedback(null);
      const result = await uploadImageToImageKit(file, {
        folder: '/elimu360/national_coat_of_arms',
        fileName: `rwanda_coat_of_arms_${Date.now()}.png`,
        tags: ['national', 'rwanda', 'official', 'emblem'],
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.95
      });

      // Update active school and sync to all schools in database
      availableSchools.forEach(sch => {
        updateSchoolProfile(sch.id, {
          national_coat_of_arms_url: result.url
        });
      });

      setCoatOfArmsFeedback(`Official National Coat of Arms uploaded successfully (${Math.round(result.sizeBytes / 1024)} KB) via ${result.provider === 'imagekit' ? 'ImageKit CDN' : 'Local Compressed Engine'}. All report cards will now render this authentic emblem.`);
    } catch (err: any) {
      console.error('Failed to upload National Coat of Arms:', err);
      setCoatOfArmsFeedback(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsUploadingCoatOfArms(false);
    }
  };

  const handleDeleteCoatOfArms = () => {
    try {
      availableSchools.forEach(sch => {
        updateSchoolProfile(sch.id, {
          national_coat_of_arms_url: ''
        });
      });
      setCoatOfArmsFeedback('Official National Coat of Arms removed. The academic system has safely reverted to the verified vector national seal across all report cards.');
      setShowDeleteCoatConfirm(false);
    } catch (err: any) {
      console.error('Failed to delete National Coat of Arms:', err);
      setCoatOfArmsFeedback(`Deletion failed: ${err?.message || 'Error occurred'}`);
    }
  };

  const handleUploadNewSchoolLogo = async (file: File) => {
    try {
      setIsUploadingSchoolLogo(true);
      setSchoolLogoFeedback(null);
      const result = await uploadImageToImageKit(file, {
        folder: '/elimu360/school_logos',
        fileName: `logo_${schoolCode || 'school'}_${Date.now()}.png`,
        tags: ['school', 'logo', 'crest'],
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });
      setSchoolLogoUrl(result.url);
      setSchoolLogoFeedback(`Logo uploaded & optimized (${Math.round(result.sizeBytes / 1024)} KB)`);
    } catch (err: any) {
      console.error('Failed to upload school logo:', err);
      setSchoolLogoFeedback(`Upload error: ${err?.message || 'Failed'}`);
    } finally {
      setIsUploadingSchoolLogo(false);
    }
  };

  const handleUploadEditLogo = async (file: File) => {
    try {
      setIsUploadingEditLogo(true);
      const result = await uploadImageToImageKit(file, {
        folder: '/elimu360/school_logos',
        fileName: `logo_edit_${Date.now()}.png`,
        tags: ['school', 'logo'],
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });
      setEditLogoUrl(result.url);
    } catch (err: any) {
      console.error('Failed to upload edited logo:', err);
    } finally {
      setIsUploadingEditLogo(false);
    }
  };

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setActionFeedback(null);

    const res = registerSchoolBySuperAdmin({
      name: schoolName,
      code: schoolCode,
      curriculum_type: curriculumType,
      ownership_type: ownershipType,
      accommodation_type: accommodationType,
      country,
      city,
      contact_email: contactEmail,
      phone,
      motto: motto || 'Virtus et Scientia',
      logo_url: schoolLogoUrl || undefined,
      director_name: directorName,
      director_email: directorEmail,
      director_phone: directorPhone,
      active_academic_year: '2026',
      active_term: 'Term 2'
    });

    if (res.success && res.director) {
      setActionFeedback({
        type: 'success',
        message: res.message,
        token: res.director.activation_token || res.director.issued_activation_token
      });
      // Reset form
      setSchoolName('');
      setSchoolCode('');
      setIsCodeManuallyEdited(false);
      setContactEmail('');
      setDirectorName('');
      setDirectorEmail('');
      setMotto('');
      setSchoolLogoUrl('');
      setSchoolLogoFeedback(null);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!schoolToDelete) return;
    const res = deleteSchool(schoolToDelete.id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: res.message
      });
      setSchoolToDelete(null);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleSaveEdit = (schoolId: string) => {
    updateSchoolProfile(schoolId, {
      motto: editMotto,
      contact_email: editEmail,
      phone: editPhone,
      active_term: editTerm,
      active_academic_year: editYear,
      ...(editLogoUrl ? { logo_url: editLogoUrl } : {})
    });
    setEditingSchoolId(null);
    setEditLogoUrl('');
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Executive Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4" />
            <span>The Palace Tech House · Super Admin Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Institutional Profiles & Multi-Tenant Registry
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Register accredited schools, provision executive School Director credentials, and configure active academic calendars across Rwanda & East Africa.
          </p>
        </div>

        {currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => {
              setIsRegisterOpen(!isRegisterOpen);
              setActionFeedback(null);
            }}
            className="px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/30 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRegisterOpen ? 'Close New School Form' : 'Register New School Profile'}</span>
          </button>
        )}
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{actionFeedback.message}</div>
              {actionFeedback.token && (
                <div className="mt-2 flex items-center gap-2 text-slate-200">
                  <span>Director Activation Code:</span>
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
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedToken === actionFeedback.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken === actionFeedback.token ? 'Copied' : 'Copy Code'}</span>
            </button>
          )}
        </div>
      )}

      {/* NEW SCHOOL FORM */}
      {isRegisterOpen && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Create New Institutional Profile</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Authorized Authority: Super Admin
            </span>
          </div>

          <form onSubmit={handleRegisterSchool} className="space-y-6">
            
            {/* Section 1: School Details */}
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                1. Institutional Identity & Accreditation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    School Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhazi Lake International Academy"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      School Code *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCodeManuallyEdited(false);
                        if (schoolName && schoolName.trim()) {
                          try {
                            const code = generateUniqueSchoolCode(schoolName);
                            if (code) setSchoolCode(code);
                          } catch (err) {
                            console.error('Error auto-generating school code:', err);
                          }
                        }
                      }}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Auto Abbr</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MLIA"
                    value={schoolCode}
                    onChange={(e) => {
                      setIsCodeManuallyEdited(true);
                      setSchoolCode(e.target.value.toUpperCase());
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-amber-300 focus:outline-none focus:border-purple-500 transition font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Auto-generated unique collision-free abbreviation
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Curriculum Framework *
                  </label>
                  <select
                    value={curriculumType}
                    onChange={(e) => setCurriculumType(e.target.value as CurriculumType)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="REB">Rwanda Education Board (REB CBC)</option>
                    <option value="CAMBRIDGE">Cambridge International (CIE / IGCSE)</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="HYBRID">Hybrid (REB + Cambridge Dual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Institution Ownership *
                  </label>
                  <select
                    value={ownershipType}
                    onChange={(e) => setOwnershipType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="PRIVATE">Private School</option>
                    <option value="PUBLIC">Public / Government School</option>
                    <option value="GOVERNMENT_AIDED">Government Aided School</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Accommodation Type *
                  </label>
                  <select
                    value={accommodationType}
                    onChange={(e) => setAccommodationType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="DAY">Day School Only</option>
                    <option value="BOARDING">Boarding School Only</option>
                    <option value="BOTH">Day & Boarding (Both)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kigali (Gasabo)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. registrar@muhaziacademy.ac.rw"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Institutional Motto
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shaping Future Leaders"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Official School Logo Upload via ImageKit */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-0.5">
                      Official School Crest / Logo (Super Admin ImageKit Integration)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload institutional crest. Automatically compressed to minimal byte size and synchronized with ImageKit CDN.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={schoolLogoInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadNewSchoolLogo(file);
                    }}
                  />

                  <button
                    type="button"
                    disabled={isUploadingSchoolLogo}
                    onClick={() => schoolLogoInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isUploadingSchoolLogo ? 'Optimizing & Uploading...' : 'Upload School Logo'}</span>
                  </button>
                </div>

                {schoolLogoUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={schoolLogoUrl} 
                        alt="Uploaded Logo Preview" 
                        className="w-12 h-12 rounded-xl object-contain border border-purple-500/40 bg-white p-1"
                      />
                      <div className="text-xs">
                        <div className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stored in ImageKit CDN</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{schoolLogoFeedback}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={schoolLogoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <span>View Logo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => schoolLogoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSchoolLogoUrl('');
                          setSchoolLogoFeedback(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: School Director Provisioning */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                <span>2. Provision Executive School Director / Headmaster</span>
              </div>
              <p className="text-xs text-slate-300">
                The Super Admin provisions the Director account. A single-use activation claim token will be auto-generated for their first-time password configuration.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Director Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Theophile Bizimungu"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Director Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. headmaster@muhaziacademy.ac.rw"
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Director Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={directorPhone}
                    onChange={(e) => setDirectorPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

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
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Authorize & Register School Profile</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SUPER ADMIN: OFFICIAL REPUBLIC OF RWANDA NATIONAL COAT OF ARMS MANAGEMENT */}
      {currentUser.role === 'SUPER_ADMIN' && (
        <div className={`p-6 rounded-3xl bg-slate-900 border shadow-xl space-y-4 transition-all ${
          activeSchool.national_coat_of_arms_url 
            ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900' 
            : 'border-amber-500/30'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                activeSchool.national_coat_of_arms_url
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    activeSchool.national_coat_of_arms_url ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    Republic of Rwanda · Official Emblem Authority
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    activeSchool.national_coat_of_arms_url
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    {activeSchool.national_coat_of_arms_url ? 'Status: Authentic Emblem Active' : 'Status: Default Vector Seal'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Official National Coat of Arms & Report Certification Emblem
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  {activeSchool.national_coat_of_arms_url
                    ? 'Official Republic of Rwanda Coat of Arms is securely stored on ImageKit CDN and active across all student report cards and official transcripts.'
                    : 'Upload the official Republic of Rwanda Coat of Arms image. When uploaded, this authentic emblem is stored in ImageKit CDN and automatically displayed on all student report cards and academic transcripts across all registered schools.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <input
                type="file"
                ref={coatOfArmsInputRef}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadCoatOfArms(file);
                }}
              />

              {activeSchool.national_coat_of_arms_url ? (
                <>
                  <a
                    href={activeSchool.national_coat_of_arms_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Coat of Arms</span>
                  </a>

                  <button
                    type="button"
                    disabled={isUploadingCoatOfArms}
                    onClick={() => coatOfArmsInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUploadingCoatOfArms ? 'animate-spin' : ''}`} />
                    <span>{isUploadingCoatOfArms ? 'Optimizing...' : 'Replace Coat of Arms'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteCoatConfirm(true)}
                    className="px-4 py-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Coat of Arms</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingCoatOfArms}
                  onClick={() => coatOfArmsInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingCoatOfArms ? 'Optimizing via ImageKit...' : 'Upload Official Coat of Arms'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Delete Coat of Arms Confirmation Prompt */}
          {showDeleteCoatConfirm && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-xs text-rose-200">
                  <span className="font-bold block text-sm text-rose-100">Confirm Deletion of Official Coat of Arms?</span>
                  All academic report cards will immediately revert to the default verified REB vector emblem.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteCoatConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCoatOfArms}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          )}

          {coatOfArmsFeedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              coatOfArmsFeedback.includes('failed') || coatOfArmsFeedback.includes('Error')
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{coatOfArmsFeedback}</span>
            </div>
          )}

          {/* Current Coat of Arms Preview */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-slate-700 bg-white p-1.5 flex items-center justify-center shadow-inner">
                {activeSchool.national_coat_of_arms_url ? (
                  <img
                    src={activeSchool.national_coat_of_arms_url}
                    alt="Republic of Rwanda Coat of Arms"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg className="w-full h-full text-blue-900" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="44" strokeWidth="2.5" stroke="#1e3a8a" />
                    <circle cx="50" cy="50" r="38" strokeWidth="1" stroke="#059669" />
                    <path d="M50 20 L58 42 L80 42 L62 55 L69 77 L50 64 L31 77 L38 55 L20 42 L42 42 Z" fill="#eab308" />
                  </svg>
                )}
              </div>

              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{activeSchool.national_coat_of_arms_url ? 'Authentic National Emblem Active & Certified' : 'Default Official Vector Emblem Active'}</span>
                  {activeSchool.national_coat_of_arms_url && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Applied to: Header of all A4 Report Cards, Transcripts & Academic Deliberation Certificates
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                Storage: {isImageKitConfigured() ? 'ImageKit CDN Connected' : 'Local Compressed Fallback'}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                Max Size: &lt; 80 KB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Registered Schools List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {availableSchools.map(school => {
          const isSelected = activeSchool.id === school.id;
          const isEditing = editingSchoolId === school.id;
          const schoolStudents = students.filter(s => s.school_id === school.id);
          const schoolUsers = availableUsers.filter(u => u.school_id === school.id);
          const director = schoolUsers.find(u => u.role === 'SCHOOL_ADMIN');
          const tokenDisplay = director?.activation_token || director?.issued_activation_token;

          return (
            <div 
              key={school.id}
              className={`rounded-3xl p-6 border transition flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-900/95 border-purple-500 shadow-2xl shadow-purple-950/40 ring-1 ring-purple-500/50' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex flex-col items-start gap-1">
                    <img 
                      src={school.logo_url} 
                      alt={school.name}
                      className="w-14 h-14 rounded-2xl object-contain bg-white p-1 border border-slate-700 shadow-md"
                    />
                    {school.logo_url && (
                      <a
                        href={school.logo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition mt-0.5"
                      >
                        <span>View Logo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {school.code}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active Tenant
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-base">{school.name}</h3>
                <p className="text-xs text-amber-300/90 italic mt-1 font-serif">"{school.motto}"</p>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{school.city}, {school.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Curriculum: <strong className="text-white">{school.curriculum_type}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{school.contact_email}</span>
                  </div>
                </div>

                {/* Director details & Provider Token Access */}
                {director && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                        School Director:
                      </div>
                      {director.is_claimed ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Claimed & Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Pending Activation
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{director.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{director.email}</div>

                    {/* Provider Code Inspection */}
                    {tokenDisplay && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-400">
                          {director.is_claimed ? 'Issued Code (Consumed):' : 'One-Time Code:'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-amber-300 font-bold text-[11px]">
                            {tokenDisplay}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tokenDisplay)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Copy code"
                          >
                            {copiedToken === tokenDisplay ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveSchool(school)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isSelected ? 'Active Scope' : 'Select'}
                </button>

                <div className="flex items-center gap-1.5">
                  {currentUser.role !== 'COORDINATOR' && (
                    <button
                      onClick={() => {
                        setEditingSchoolId(school.id);
                        setEditMotto(school.motto);
                        setEditEmail(school.contact_email);
                        setEditPhone(school.phone);
                        setEditTerm(school.active_term);
                        setEditYear(school.active_academic_year);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-medium"
                      title="Edit profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => setSchoolToDelete(school)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer flex items-center gap-1 text-xs font-medium"
                      title="Delete institution"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* EDIT MODAL DRAWER IN-PLACE */}
              {isEditing && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-purple-500/50 space-y-3 text-xs">
                  <div className="font-bold text-white uppercase tracking-wider">Update Academic Profile</div>
                  
                  <div>
                    <label className="block text-slate-400 mb-1">Motto</label>
                    <input
                      type="text"
                      value={editMotto}
                      onChange={(e) => setEditMotto(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  {/* School Crest / Logo Update via ImageKit */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-semibold">Institutional Logo (ImageKit)</label>
                      <input
                        type="file"
                        ref={editLogoInputRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadEditLogo(file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingEditLogo}
                        onClick={() => editLogoInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 text-purple-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3 h-3 text-purple-400" />
                        <span>{isUploadingEditLogo ? 'Uploading...' : 'Replace Logo'}</span>
                      </button>
                    </div>

                    {(editLogoUrl || school.logo_url) && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <img 
                            src={editLogoUrl || school.logo_url} 
                            alt="Logo Preview" 
                            className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-700"
                          />
                          <div>
                            <span className="text-[11px] text-emerald-400 block font-medium">
                              {editLogoUrl ? 'New logo ready to save' : 'Current active logo'}
                            </span>
                            <a
                              href={editLogoUrl || school.logo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                            >
                              <span>View Full Logo</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => editLogoInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateSchoolProfile(school.id, { logo_url: '' });
                              setEditLogoUrl('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Active Term</label>
                      <select
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingSchoolId(null)}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(school.id)}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Institution Profile</h3>
                <p className="text-xs text-rose-300">Permanent Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{schoolToDelete.name} ({schoolToDelete.code})</strong>? 
              This will remove the school profile, cascade delete all affiliated staff director accounts, classes, subjects, and records from the multi-tenant database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
