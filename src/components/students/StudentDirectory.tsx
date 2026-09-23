import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  GraduationCap, 
  Download, 
  Eye, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Clock,
  HeartPulse,
  Printer,
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Camera,
  ExternalLink,
  Trash2,
  Upload
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { Student } from '../../types';
import { PassportPhoto } from '../common/PassportPhoto';
import { uploadImageToImageKit } from '../../services/imageKitService';

export const StudentDirectory: React.FC = () => {
  const { 
    activeSchool, 
    currentUser,
    students, 
    classes, 
    grades,
    attendance,
    studentConducts,
    enrollStudent, 
    enrollStudentsBulk,
    updateStudent,
    getStudentFeeLedger,
    triggerConfetti,
    refreshDataFromCloud,
    cloudSyncState,
    checkDuplicateOrSpecialCaseStudent,
    specialCases
  } = useElimu();

  const isLeader = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser?.role || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedBoarding, setSelectedBoarding] = useState('ALL');
  const [showEnrolModal, setShowEnrolModal] = useState(false);

  // Duplicate & Special Cases Check State
  const [duplicateCheckMatch, setDuplicateCheckMatch] = useState<{
    student: Student;
    commonAttributes: string[];
  } | null>(null);
  const [specialCaseWarning, setSpecialCaseWarning] = useState<string | null>(null);
  const [showBulkEnrolModal, setShowBulkEnrolModal] = useState(false);
  const [activeProfileStudent, setActiveProfileStudent] = useState<Student | null>(null);
  const [profileTab, setProfileTab] = useState<'BIO' | 'ACADEMICS' | 'FEES' | 'CONDUCT'>('BIO');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Student Photo Upload States (ImageKit CDN)
  const [enrolPhotoUrl, setEnrolPhotoUrl] = useState('');
  const [isUploadingEnrolPhoto, setIsUploadingEnrolPhoto] = useState(false);
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);

  // Enrolment Form State (Single)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('2009-05-14');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [isBoarding, setIsBoarding] = useState(true);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+250 788 123 456');
  const [guardianPhoneSecondary, setGuardianPhoneSecondary] = useState('+250 788 654 321');
  const [emergencyPhone, setEmergencyPhone] = useState('+250 722 999 888');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [address, setAddress] = useState('Kigali, Rwanda');
  const [medicalNotes, setMedicalNotes] = useState('No known allergies');

  // Bulk Enrolment State
  const [bulkClassId, setBulkClassId] = useState(classes[0]?.id || '');
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkParsedStudents, setBulkParsedStudents] = useState<Array<Omit<Student, 'id' | 'school_id' | 'registration_number' | 'class_id' | 'class_name'>>>([]);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Multi-tenant resilient student list:
  // If activeSchool has matching students, use those. If not, fallback to students assigned to 'all' or all available students so data is never hidden.
  const schoolStudents = useMemo(() => {
    const directMatches = students.filter(s => s.school_id === activeSchool.id);
    if (directMatches.length > 0) return directMatches;
    const genericMatches = students.filter(s => !s.school_id || s.school_id === 'all' || s.school_id === 'school-kss-5978');
    return genericMatches.length > 0 ? genericMatches : students;
  }, [students, activeSchool.id]);

  const filteredStudents = useMemo(() => {
    return schoolStudents.filter(s => {
      const matchSearch = `${s.first_name} ${s.last_name} ${s.registration_number || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClass === 'ALL' || (s.class_name && s.class_name.includes(selectedClass)) || s.class_id === selectedClass;
      const matchGender = selectedGender === 'ALL' || s.gender === selectedGender;
      const matchBoarding = selectedBoarding === 'ALL' || (selectedBoarding === 'BOARDING' ? s.boarding_status === 'BOARDING' : s.boarding_status === 'DAY');
      return matchSearch && matchClass && matchGender && matchBoarding;
    });
  }, [schoolStudents, searchQuery, selectedClass, selectedGender, selectedBoarding]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDataFromCloud(true);
    setIsRefreshing(false);
  };

  const handleDownloadPresetTemplate = () => {
    const headers = "first_name,last_name,gender,date_of_birth,guardian_name,guardian_relation,guardian_phone_primary,guardian_phone_secondary,emergency_phone,guardian_email,address,medical_notes\n";
    const sampleRows = [
      "Jean,Mugisha,MALE,2010-03-12,Francois Mugisha,Father,+250 788 111 222,+250 788 333 444,+250 722 555 666,f.mugisha@gmail.com,Gasabo Kigali,No known allergies",
      "Marie,Uwase,FEMALE,2010-07-25,Chantal Uwimana,Mother,+250 788 555 666,+250 788 777 888,+250 733 999 000,c.uwimana@yahoo.fr,Kicukiro Kigali,Asthma inhaler required",
      "David,Niyonzima,MALE,2009-11-04,Paul Niyonzima,Uncle,+250 788 222 333,+250 788 444 555,+250 788 666 777,p.niyonzima@gmail.com,Nyarugenge Kigali,No known allergies",
      "Grace,Ingabire,FEMALE,2010-01-19,Alice Mukamana,Guardian,+250 788 999 111,+250 788 222 444,+250 788 555 888,a.mukamana@gmail.com,Huye Rwanda,Allergic to penicillin"
    ].join("\n");
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elimu_preset_bulk_registration_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleParseCsv = (rawText: string) => {
    setBulkParseError(null);
    if (!rawText.trim()) {
      setBulkParsedStudents([]);
      return;
    }

    try {
      const lines = rawText.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setBulkParseError('CSV must contain a header row followed by at least 1 student row.');
        setBulkParsedStudents([]);
        return;
      }

      const headerLine = lines[0].toLowerCase();
      const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      const parsed: Array<Omit<Student, 'id' | 'school_id' | 'registration_number' | 'class_id' | 'class_name'>> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 2 || !cols[0] || !cols[1]) continue;

        const getCol = (name: string, fallbackIdx: number) => {
          const idx = headers.indexOf(name);
          return idx >= 0 && idx < cols.length ? cols[idx] : (cols[fallbackIdx] || '');
        };

        const fName = getCol('first_name', 0);
        const lName = getCol('last_name', 1);
        const rawGender = (getCol('gender', 2) || 'M').toUpperCase();
        const genderVal: 'MALE' | 'FEMALE' = rawGender.startsWith('F') ? 'FEMALE' : 'MALE';
        const dobVal = getCol('date_of_birth', 3) || '2010-05-15';
        const gName = getCol('guardian_name', 4) || `${lName} Guardian`;
        const gRelation = getCol('guardian_relation', 5) || 'Parent';
        const gPhonePrim = getCol('guardian_phone_primary', 6) || getCol('guardian_phone', 6) || '+250 788 000 000';
        const gPhoneSec = getCol('guardian_phone_secondary', 7) || '+250 788 111 222';
        const emergPhone = getCol('emergency_phone', 8) || '+250 722 000 000';
        const gEmail = getCol('guardian_email', 9) || '';
        const addr = getCol('address', 10) || 'Kigali, Rwanda';
        const medNotes = getCol('medical_notes', 11) || 'No known allergies';

        parsed.push({
          first_name: fName,
          last_name: lName,
          date_of_birth: dobVal,
          gender: genderVal,
          boarding_status: 'DAY',
          guardian_name: gName,
          guardian_relation: gRelation,
          guardian_phone: gPhonePrim,
          guardian_phone_secondary: gPhoneSec,
          emergency_phone: emergPhone,
          guardian_email: gEmail,
          address: addr,
          medical_notes: medNotes,
          status: 'ACTIVE',
          enrollment_date: new Date().toISOString().substring(0, 10),
          photo_url: ''
        });
      }

      if (parsed.length === 0) {
        setBulkParseError('Could not find any valid student rows in the provided CSV.');
      } else {
        setBulkParsedStudents(parsed);
      }
    } catch (err: any) {
      setBulkParseError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkCsvText(content);
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleBulkEnrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkParsedStudents.length === 0) {
      setBulkParseError('Please provide at least one valid student record.');
      return;
    }

    setIsProcessingBulk(true);
    const result = enrollStudentsBulk(bulkClassId, bulkParsedStudents);
    setIsProcessingBulk(false);

    if (result.success) {
      triggerConfetti();
      setBulkSuccessMsg(`Successfully registered ${result.count} students with multi-guardian contacts!`);
      setTimeout(() => {
        setBulkSuccessMsg(null);
        setShowBulkEnrolModal(false);
        setBulkCsvText('');
        setBulkParsedStudents([]);
      }, 2500);
    } else {
      setBulkParseError(result.message || 'Bulk registration failed.');
    }
  };

  const handleUploadEnrolPhoto = async (file: File) => {
    try {
      setIsUploadingEnrolPhoto(true);
      const result = await uploadImageToImageKit(file, {
        folder: '/elimu360/students',
        fileName: `student_${Date.now()}.png`,
        tags: ['student', 'passport', activeSchool.code],
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });
      setEnrolPhotoUrl(result.url);
    } catch (err: any) {
      console.error('Failed to upload student photo to ImageKit:', err);
    } finally {
      setIsUploadingEnrolPhoto(false);
    }
  };

  const handleUploadProfilePhoto = async (studentId: string, file: File) => {
    try {
      setIsUploadingProfilePhoto(true);
      const result = await uploadImageToImageKit(file, {
        folder: '/elimu360/students',
        fileName: `student_${studentId}_${Date.now()}.png`,
        tags: ['student', 'passport', activeSchool.code],
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });
      updateStudent(studentId, { photo_url: result.url });
      if (activeProfileStudent && activeProfileStudent.id === studentId) {
        setActiveProfileStudent({ ...activeProfileStudent, photo_url: result.url });
      }
    } catch (err: any) {
      console.error('Failed to update student profile photo to ImageKit:', err);
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  const handleDeleteProfilePhoto = (studentId: string) => {
    updateStudent(studentId, { photo_url: '' });
    if (activeProfileStudent && activeProfileStudent.id === studentId) {
      setActiveProfileStudent({ ...activeProfileStudent, photo_url: '' });
    }
  };

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSpecialCaseWarning(null);

    // 1. Check if student exists in Special Cases or is a potential duplicate
    const checkResult = checkDuplicateOrSpecialCaseStudent({
      first_name: firstName,
      last_name: lastName,
      class_id: classId,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      date_of_birth: dob
    });

    if (checkResult.inSpecialCase && checkResult.specialCaseRecord) {
      setSpecialCaseWarning(
        `Registration Blocked: Student "${firstName} ${lastName}" has an active Special Case record (${checkResult.specialCaseRecord.action_type}). They cannot be re-registered directly. Re-activate or retrieve them from Special Cases Registry instead.`
      );
      return;
    }

    if (checkResult.isDuplicate && checkResult.duplicateStudent) {
      setDuplicateCheckMatch({
        student: checkResult.duplicateStudent,
        commonAttributes: checkResult.commonAttributes
      });
      return;
    }

    // Direct enrolment if no duplicates found
    executeConfirmedEnrolment(firstName, lastName);
  };

  const executeConfirmedEnrolment = (fName: string, lName: string) => {
    const targetCls = classes.find(c => c.id === classId);
    
    enrollStudent({
      first_name: fName,
      last_name: lName,
      date_of_birth: dob,
      gender,
      class_id: classId,
      class_name: targetCls?.name || 'Senior 1',
      boarding_status: isBoarding ? 'BOARDING' : 'DAY',
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      guardian_phone_secondary: guardianPhoneSecondary,
      emergency_phone: emergencyPhone,
      guardian_email: guardianEmail,
      guardian_relation: guardianRelation,
      address,
      medical_notes: medicalNotes,
      status: 'ACTIVE',
      enrollment_date: new Date().toISOString().substring(0, 10),
      photo_url: enrolPhotoUrl || '',
    });

    triggerConfetti();
    setShowEnrolModal(false);
    setDuplicateCheckMatch(null);
    setSpecialCaseWarning(null);
    // Reset form
    setFirstName('');
    setLastName('');
    setGuardianName('');
    setEnrolPhotoUrl('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Student Life & Enrolment · Section 01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Student 360 Master Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete biographical records, boarding status, medical dossiers, and real-time ledger link.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            title="Fetch latest student profiles and records from system database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          {isLeader && (
            <button
              onClick={() => {
                setBulkClassId(classes[0]?.id || '');
                setBulkParseError(null);
                setBulkSuccessMsg(null);
                setShowBulkEnrolModal(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 transition"
              title="Bulk Student Registration per Class via Preset CSV File (Director/DOS Privilege)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bulk Register (CSV)</span>
            </button>
          )}

          <button
            onClick={() => setShowEnrolModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Enrol New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or reg #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Classes ({classes.length})</option>
            {classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all').map(cls => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>

          <select
            value={selectedBoarding}
            onChange={(e) => setSelectedBoarding(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Accommodations</option>
            <option value="BOARDING">Boarding House</option>
            <option value="DAY">Day Scholar</option>
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          {cloudSyncState.status === 'error' && (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline Cache Active</span>
            </span>
          )}
          <span>
            Showing <span className="font-bold text-white">{filteredStudents.length}</span> of {students.length} students
          </span>
        </div>
      </div>

      {/* Empty State when no students found */}
      {filteredStudents.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white mb-1">No Student Profiles Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery || selectedClass !== 'ALL' || selectedGender !== 'ALL' || selectedBoarding !== 'ALL'
                ? 'No students match your active filters. Try clearing your search parameters.'
                : `No enrolled students registered for ${activeSchool.name}. You can refresh from the system database or enrol new students below.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 cursor-pointer transition shadow-md shadow-blue-900/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Fetch From Database'}</span>
            </button>
            {(searchQuery || selectedClass !== 'ALL' || selectedGender !== 'ALL' || selectedBoarding !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('ALL');
                  setSelectedGender('ALL');
                  setSelectedBoarding('ALL');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setShowEnrolModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              + Enrol Student
            </button>
          </div>
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const ledger = getStudentFeeLedger(student.id);
          return (
            <div key={student.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PassportPhoto 
                      src={student.photo_url} 
                      alt={student.first_name} 
                      shape="rounded"
                      border={false}
                      className="w-12 h-12 rounded-xl border border-slate-700" 
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{student.first_name} {student.last_name}</h3>
                      <div className="text-[10px] text-slate-400 font-mono">{student.registration_number}</div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    student.boarding_status === 'BOARDING' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {student.boarding_status}
                  </span>
                </div>

                <div className="my-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class Stream:</span>
                    <span className="font-semibold text-white">{student.class_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guardian:</span>
                    <span>{student.guardian_name} ({student.guardian_relation})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-mono text-blue-400">{student.guardian_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Term 2 Fee Status:</span>
                    <span className={`font-mono font-semibold ${ledger.isCleared ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {ledger.isCleared ? 'CLEARED' : `Bal: RWF ${ledger.outstandingBalance.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">{student.address}</span>
                <button
                  onClick={() => setActiveProfileStudent(student)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Full Profile 360</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Enrol New Student */}
      {showEnrolModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Enrol New Student Dossier</h3>
              </div>
              <button 
                onClick={() => setShowEnrolModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrolSubmit} className="space-y-4 text-xs">

              {specialCaseWarning && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Special Cases Lock Warning</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {specialCaseWarning}
                  </p>
                </div>
              )}
              
              {/* Student Passport Photo Upload via ImageKit */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {enrolPhotoUrl ? (
                      <img src={enrolPhotoUrl} alt="Passport preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Official Passport Photo</div>
                    <div className="text-[11px] text-slate-400">
                      {enrolPhotoUrl ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ImageKit CDN optimized
                        </span>
                      ) : (
                        'Stored directly to ImageKit CDN'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="enrol-photo-input"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingEnrolPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadEnrolPhoto(file);
                    }}
                  />
                  {enrolPhotoUrl ? (
                    <>
                      <a
                        href={enrolPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-bold flex items-center gap-1"
                      >
                        <span>View Photo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => document.getElementById('enrol-photo-input')?.click()}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrolPhotoUrl('')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploadingEnrolPhoto}
                      onClick={() => document.getElementById('enrol-photo-input')?.click()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isUploadingEnrolPhoto ? 'Uploading to ImageKit...' : 'Upload Photo'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">First Name:</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Last Name / Family Name:</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date of Birth:</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Gender:</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Assigned Class:</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    {classes.filter(c => !c.school_id || c.school_id === activeSchool.id || c.school_id === 'all').map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} ({cls.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Boarding Status:</label>
                  <select
                    value={isBoarding ? 'YES' : 'NO'}
                    onChange={(e) => setIsBoarding(e.target.value === 'YES')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="YES">Boarding Student</option>
                    <option value="NO">Day Scholar</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="block font-bold text-slate-200 mb-2">Guardian / Parent Contact Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Guardian Full Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jean Paul Nzeyimana"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Primary Guardian Phone (SMS):</label>
                    <input
                      type="text"
                      required
                      placeholder="+250 788 123 456"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Secondary Guardian Phone (Mother/Alt):</label>
                    <input
                      type="text"
                      placeholder="+250 788 654 321"
                      value={guardianPhoneSecondary}
                      onChange={(e) => setGuardianPhoneSecondary(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Emergency Contact Phone:</label>
                    <input
                      type="text"
                      placeholder="+250 722 999 888"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Residential Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Medical Dossier & Special Needs:</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnrolModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Complete Enrolment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Student Enrolment (Director / DOS Exclusive) */}
      {showBulkEnrolModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Administrative Bulk Ingestion · Director & DOS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Bulk Student Class Registration
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register entire cohorts per class via preset CSV. Captures multiple guardian contact numbers for comprehensive SMS alerting.
                </p>
              </div>
              <button 
                onClick={() => setShowBulkEnrolModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold">{bulkSuccessMsg}</span>
              </div>
            )}

            {bulkParseError && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-medium">{bulkParseError}</span>
              </div>
            )}

            <form onSubmit={handleBulkEnrolSubmit} className="mt-5 space-y-5">
              
              {/* Configuration Step: Target Class & Preset Template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    1. Target Class for Registration:
                  </label>
                  <select
                    value={bulkClassId}
                    onChange={(e) => setBulkClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.stream || 'A'}) - {c.level}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    All imported students will be registered under this specific classroom roster.
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    2. Preset CSV Structure:
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadPresetTemplate}
                    className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 border border-emerald-600 cursor-pointer transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Preset CSV Template (.csv)</span>
                  </button>
                  <p className="text-[11px] text-emerald-400/80 mt-1 text-center">
                    Pre-configured headers with columns for multiple guardian phone numbers.
                  </p>
                </div>
              </div>

              {/* Upload or Paste CSV */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    <span>3. Ingest CSV Data:</span>
                  </label>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
                    Browse File
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={bulkCsvText}
                  onChange={(e) => {
                    setBulkCsvText(e.target.value);
                    handleParseCsv(e.target.value);
                  }}
                  placeholder="Or paste comma-separated CSV rows directly here: first_name,last_name,gender,date_of_birth,guardian_name,guardian_relation,guardian_phone_primary,guardian_phone_secondary,emergency_phone..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px] focus:outline-none"
                />
              </div>

              {/* Preview Table */}
              {bulkParsedStudents.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Parsed Records Ready ({bulkParsedStudents.length} Students)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Multi-guardian numbers verified
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-56 rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 sticky top-0">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Student Name</th>
                          <th className="p-2.5">Gender</th>
                          <th className="p-2.5">DOB</th>
                          <th className="p-2.5">Guardian</th>
                          <th className="p-2.5">Primary Phone</th>
                          <th className="p-2.5">Secondary Phone</th>
                          <th className="p-2.5">Emergency Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {bulkParsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-2.5 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-white whitespace-nowrap">{s.first_name} {s.last_name}</td>
                            <td className="p-2.5 text-slate-300">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.gender === 'FEMALE' ? 'bg-pink-950/60 text-pink-400' : 'bg-blue-950/60 text-blue-400'}`}>
                                {s.gender}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 whitespace-nowrap">{s.date_of_birth}</td>
                            <td className="p-2.5 text-slate-300 whitespace-nowrap">{s.guardian_name} ({s.guardian_relation})</td>
                            <td className="p-2.5 font-mono text-blue-400 whitespace-nowrap text-[11px]">{s.guardian_phone}</td>
                            <td className="p-2.5 font-mono text-emerald-400 whitespace-nowrap text-[11px]">{s.guardian_phone_secondary || '—'}</td>
                            <td className="p-2.5 font-mono text-amber-400 whitespace-nowrap text-[11px]">{s.emergency_phone || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkEnrolModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkParsedStudents.length === 0 || isProcessingBulk}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {isProcessingBulk 
                      ? 'Registering Students...' 
                      : `Enrol ${bulkParsedStudents.length} Students in ${classes.find(c => c.id === bulkClassId)?.name || 'Class'}`
                    }
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Profile Dossier */}
      {activeProfileStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <PassportPhoto 
                    src={activeProfileStudent.photo_url} 
                    alt={activeProfileStudent.first_name} 
                    shape="rounded"
                    border={false}
                    className="w-16 h-16 rounded-2xl border-2 border-blue-500 object-cover"
                  />
                  {isLeader && (
                    <label 
                      title="Upload or replace photo on ImageKit CDN"
                      className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold"
                    >
                      <Camera className="w-4 h-4 mb-0.5 text-blue-400" />
                      <span>{isUploadingProfilePhoto ? '...' : 'Change'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploadingProfilePhoto}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadProfilePhoto(activeProfileStudent.id, file);
                        }} 
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{activeProfileStudent.first_name} {activeProfileStudent.last_name}</h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Registration No: <span className="text-blue-400 font-bold">{activeProfileStudent.registration_number}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      {activeProfileStudent.class_name} · {activeProfileStudent.boarding_status}
                    </span>
                    {activeProfileStudent.photo_url && (
                      <a
                        href={activeProfileStudent.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition"
                      >
                        <span>View Photo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {isLeader && activeProfileStudent.photo_url && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProfilePhoto(activeProfileStudent.id)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 transition cursor-pointer ml-1"
                        title="Delete photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveProfileStudent(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-800 my-4">
              <button
                onClick={() => setProfileTab('BIO')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  profileTab === 'BIO'
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bio & Guardians</span>
              </button>

              <button
                onClick={() => setProfileTab('ACADEMICS')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  profileTab === 'ACADEMICS'
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Academics & Grades</span>
              </button>

              <button
                onClick={() => setProfileTab('FEES')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  profileTab === 'FEES'
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fee Ledger</span>
              </button>

              <button
                onClick={() => setProfileTab('CONDUCT')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  profileTab === 'CONDUCT'
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Conduct & Attendance</span>
              </button>
            </div>

            {/* Tab: BIO */}
            {profileTab === 'BIO' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider mb-2">
                    Biographical Dossier
                  </span>
                  <div className="flex justify-between text-slate-400">
                    <span>Gender:</span>
                    <span className="text-white font-medium">{activeProfileStudent.gender}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Date of Birth:</span>
                    <span className="text-white font-medium">{activeProfileStudent.date_of_birth}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Address:</span>
                    <span className="text-white font-mono">{activeProfileStudent.address}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Enrollment Date:</span>
                    <span className="text-white font-mono">{activeProfileStudent.enrollment_date || '2026-01-10'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Medical Notes:</span>
                    <span className="text-white">{activeProfileStudent.medical_notes}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider mb-2">
                    Guardian & Emergency Contact
                  </span>
                  <div className="flex justify-between text-slate-400">
                    <span>Primary Guardian:</span>
                    <span className="text-white font-medium">{activeProfileStudent.guardian_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Relationship:</span>
                    <span className="text-white">{activeProfileStudent.guardian_relation}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Phone (Primary SMS):</span>
                    <span className="text-blue-400 font-mono font-medium">{activeProfileStudent.guardian_phone}</span>
                  </div>
                  {activeProfileStudent.guardian_phone_secondary && (
                    <div className="flex justify-between text-slate-400">
                      <span>Secondary Phone:</span>
                      <span className="text-emerald-400 font-mono font-medium">{activeProfileStudent.guardian_phone_secondary}</span>
                    </div>
                  )}
                  {activeProfileStudent.emergency_phone && (
                    <div className="flex justify-between text-slate-400">
                      <span>Emergency Contact:</span>
                      <span className="text-amber-400 font-mono font-medium">{activeProfileStudent.emergency_phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Email:</span>
                    <span className="text-white">{activeProfileStudent.guardian_email || 'Not on file'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: ACADEMICS */}
            {profileTab === 'ACADEMICS' && (
              <div className="my-4 space-y-4 text-xs">
                {(() => {
                  const studentGrades = grades.filter(g => g.student_id === activeProfileStudent.id);
                  if (studentGrades.length === 0) {
                    return (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                        <Award className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="font-medium text-slate-300">No Term Evaluation Recorded Yet</p>
                        <p className="text-[11px] mt-1 text-slate-500">Grades submitted via DOS or Teacher Gradebook will automatically show here.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3">Subject</th>
                            <th className="p-3">Term</th>
                            <th className="p-3">Assessment</th>
                            <th className="p-3">Score / Max</th>
                            <th className="p-3">Percentage</th>
                            <th className="p-3">Teacher</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {studentGrades.map(g => (
                            <tr key={g.id} className="hover:bg-slate-900/40">
                              <td className="p-3 font-semibold text-white">{g.subject_name}</td>
                              <td className="p-3 text-slate-400">{g.term}</td>
                              <td className="p-3 text-slate-300">{g.assessment_type}</td>
                              <td className="p-3 font-mono text-white">{g.marks} / {g.max_marks}</td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                {Math.round((g.marks / (g.max_marks || 100)) * 100)}%
                              </td>
                              <td className="p-3 text-slate-400">{g.teacher_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab: FEES */}
            {profileTab === 'FEES' && (
              <div className="my-4 text-xs space-y-4">
                {(() => {
                  const ledger = getStudentFeeLedger(activeProfileStudent.id);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Expected</span>
                          <span className="text-base font-bold font-mono text-white mt-1 block">RWF {ledger.totalExpected.toLocaleString()}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Paid</span>
                          <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">RWF {ledger.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
                          <span className={`text-base font-bold font-mono mt-1 block ${ledger.outstandingBalance <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            RWF {ledger.outstandingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {ledger.payments.length > 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                          <div className="p-3 bg-slate-900/60 font-bold text-slate-300 text-[11px] border-b border-slate-800">
                            Transaction Receipts ({ledger.payments.length})
                          </div>
                          <div className="divide-y divide-slate-800/60">
                            {ledger.payments.map(p => (
                              <div key={p.id} className="p-3 flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-white block">{p.fee_category}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{p.payment_method} · Ref: {p.transaction_reference} · {p.payment_date}</span>
                                </div>
                                <span className="font-mono font-bold text-emerald-400">+ RWF {p.amount_paid.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                          No payments logged for this student profile yet.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab: CONDUCT */}
            {profileTab === 'CONDUCT' && (
              <div className="my-4 text-xs space-y-4">
                {(() => {
                  const studentAtt = attendance.filter(a => a.student_id === activeProfileStudent.id);
                  const presentCount = studentAtt.filter(a => a.status === 'PRESENT').length;
                  const attRate = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 100;
                  const conduct = studentConducts.find(c => c.student_id === activeProfileStudent.id);

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Attendance Rate
                          </span>
                          <span className="text-2xl font-bold font-mono text-emerald-400">{attRate}%</span>
                          <p className="text-[10px] text-slate-500 mt-1">Based on {studentAtt.length} logged sessions</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Discipline & Conduct Grade
                          </span>
                          <span className="text-2xl font-bold font-mono text-blue-400">
                            {conduct ? `${conduct.conduct_score}/${conduct.max_score} (${conduct.conduct_grade})` : '40/40 (Grade A)'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">{conduct?.remarks || 'Exemplary character, disciplined student.'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setActiveProfileStudent(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Duplicate Check Confirmation Modal */}
      {duplicateCheckMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Potential Duplicate Student Detected</h3>
                <p className="text-xs text-slate-400">An existing student matches key details of this enrolment</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {duplicateCheckMatch.student.first_name} {duplicateCheckMatch.student.last_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">Reg: {duplicateCheckMatch.student.registration_number}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Class: {duplicateCheckMatch.student.class_name || 'Assigned'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-2">
                <div>Guardian: <strong>{duplicateCheckMatch.student.guardian_name || 'N/A'}</strong> ({duplicateCheckMatch.student.guardian_phone || 'N/A'})</div>
                <div>Date of Birth: <strong>{duplicateCheckMatch.student.date_of_birth || 'N/A'}</strong></div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Matching fields: <strong>{duplicateCheckMatch.commonAttributes.join(', ')}</strong></span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <p>How would you like to handle this enrolment?</p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div>• <strong>Same Person (Different Class):</strong> If registered in a different class, you can confirm to proceed.</div>
                <div>• <strong>Different Student with Same Name:</strong> The system will append a suffix 'A' to the new student's name (e.g. <em>{firstName} {lastName} A</em>) to clearly differentiate them.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDuplicateCheckMatch(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeConfirmedEnrolment(`${firstName} A`, lastName)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition"
              >
                Different Person (Add 'A' Suffix)
              </button>
              <button
                type="button"
                onClick={() => executeConfirmedEnrolment(firstName, lastName)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition"
              >
                Confirm Enrolment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
