import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Zap, 
  Eye, 
  Lock, 
  RefreshCw,
  Sliders,
  Gift,
  Share2,
  Printer
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { GenerationParams, LessonPlanData, ExtractedBookData } from '../../types';
import { LessonPlanViewModal } from './LessonPlanViewModal';

const SUBJECT_PRESETS = [
  'English', 'Kinyarwanda', 'Mathematics', 'Science & Elementary Technology (SET)',
  'Social Studies (SST)', 'Physics', 'Chemistry', 'Biology', 'Entrepreneurship',
  'ICT & Computer Science', 'History & Citizenship', 'Geography', 'French', 'Swahili'
];

const CLASS_LEVEL_PRESETS = [
  'Pre-Primary (Nursery)',
  'Primary 1 (P1)', 'Primary 2 (P2)', 'Primary 3 (P3)',
  'Primary 4 (P4)', 'Primary 5 (P5)', 'Primary 6 (P6)',
  'Senior 1 (S1)', 'Senior 2 (S2)', 'Senior 3 (S3)',
  'Senior 4 (S4)', 'Senior 5 (S5)', 'Senior 6 (S6)',
  'TVET / Level 3', 'TVET / Level 4', 'TVET / Level 5'
];

export const LessonPlanGeneratorHub: React.FC = () => {
  const { isAuthenticated, saveMultipleLessonPlans, openAuthModal, openRewardsModal, isPerkUnlocked } = useElimu();

  // Form Fields - Clean initial state with placeholders only
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('English');
  const [classLevel, setClassLevel] = useState('Primary 6 (P6)');
  const [term, setTerm] = useState('Term 1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [unitNumber, setUnitNumber] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [duration, setDuration] = useState('40 min');
  const [classSize, setClassSize] = useState(40);
  const [location, setLocation] = useState('Classroom & School Yard');
  const [specialNeeds, setSpecialNeeds] = useState('');

  // Lesson Titles list - Clean empty initial array
  const [lessonTitles, setLessonTitles] = useState<string[]>([]);
  const [newTitleInput, setNewTitleInput] = useState('');

  // Extractor State
  const [extractorOpen, setExtractorOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBookData | null>(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlanData[]>([]);
  const [viewingPlan, setViewingPlan] = useState<LessonPlanData | null>(null);
  const [error, setError] = useState('');

  // Max titles limit check for guest unless VIP perk unlocked via sharing
  const isVipUnlocked = isPerkUnlocked('vipBatchingUnlocked');
  const maxAllowedForGuest = isVipUnlocked ? 15 : 3;

  const handleAddTitle = () => {
    if (!newTitleInput.trim()) return;
    if (!isAuthenticated && !isVipUnlocked && lessonTitles.length >= maxAllowedForGuest) {
      openAuthModal('signup', 'To generate more than 3 lesson plans at once, sign up or share our link for free VIP perks!');
      return;
    }
    setLessonTitles(prev => [...prev, newTitleInput.trim()]);
    setNewTitleInput('');
  };

  const handleRemoveTitle = (idx: number) => {
    setLessonTitles(prev => prev.filter((_, i) => i !== idx));
  };

  // Extract units from Textbook PDF or Text
  const handleExtractFromText = async () => {
    if (!pastedText.trim()) return;
    setExtracting(true);
    setError('');
    try {
      const res = await fetch('/api/gemini/extract-book-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: pastedText,
          fileName: 'Pasted Table of Contents'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extractedData) {
          setExtractedData(data.extractedData);
          if (data.extractedData.subject) setSubject(data.extractedData.subject);
          if (data.extractedData.classLevel) setClassLevel(data.extractedData.classLevel);
          if (data.extractedData.units && data.extractedData.units.length > 0) {
            const firstUnit = data.extractedData.units[0];
            setUnitNumber(firstUnit.unitNumber);
            setUnitTitle(firstUnit.unitTitle);
            if (firstUnit.lessonTitles && firstUnit.lessonTitles.length > 0) {
              const titles = (!isAuthenticated && !isVipUnlocked) 
                ? firstUnit.lessonTitles.slice(0, 3) 
                : firstUnit.lessonTitles;
              setLessonTitles(titles);
            }
          }
        }
      }
    } catch (err: any) {
      setError('Extraction failed. You can manually enter unit title and lesson titles.');
    } finally {
      setExtracting(false);
      setExtractorOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/extract-book-units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64,
            mimeType: file.type || 'application/pdf',
            fileName: file.name
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.extractedData) {
            setExtractedData(data.extractedData);
            if (data.extractedData.units && data.extractedData.units.length > 0) {
              const firstUnit = data.extractedData.units[0];
              setUnitNumber(firstUnit.unitNumber);
              setUnitTitle(firstUnit.unitTitle);
              if (firstUnit.lessonTitles && firstUnit.lessonTitles.length > 0) {
                const titles = (!isAuthenticated && !isVipUnlocked) 
                  ? firstUnit.lessonTitles.slice(0, 3) 
                  : firstUnit.lessonTitles;
                setLessonTitles(titles);
              }
            }
          }
        }
        setExtracting(false);
        setExtractorOpen(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed reading file. Please paste textbook text directly.');
      setExtracting(false);
    }
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    setError('');

    let activeTitles = [...lessonTitles];
    if (newTitleInput.trim()) {
      activeTitles.push(newTitleInput.trim());
      setLessonTitles(activeTitles);
      setNewTitleInput('');
    }

    if (activeTitles.length === 0) {
      if (unitTitle.trim()) {
        activeTitles = [`1. Introduction to ${unitTitle.trim()}`];
      } else if (subject) {
        activeTitles = [`1. Fundamentals of ${subject}`];
      } else {
        activeTitles = ['1. Overview of Key Learning Objectives'];
      }
      setLessonTitles(activeTitles);
    }

    if (!isAuthenticated && !isVipUnlocked && activeTitles.length > maxAllowedForGuest) {
      openAuthModal('signup', 'Free guest mode allows generating up to 3 lesson plans at once. Sign up or share our link for unlimited batching!');
      return;
    }

    setIsGenerating(true);
    setGeneratedPlans([]);

    try {
      const payload = {
        schoolName: schoolName || 'GS Amahoro Kigali',
        teacherName: teacherName || 'Teacher',
        subject,
        classLevel,
        term,
        date,
        unitNumber: unitNumber || '1',
        unitTitle: unitTitle || 'UNIT TITLE',
        duration,
        classSize,
        location,
        specialNeeds: specialNeeds || 'None',
        lessonTitles: activeTitles
      };

      const res = await fetch('/api/gemini/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server error generating lesson plan');
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.lessonPlans)) {
        const resultsWithIds: LessonPlanData[] = data.lessonPlans.map((p: any, i: number) => ({
          ...p,
          id: `lp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString()
        }));

        setGeneratedPlans(resultsWithIds);
        await saveMultipleLessonPlans(resultsWithIds);
      } else {
        throw new Error('Failed parsing generated plans');
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err?.message || 'AI Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner Header with CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> REB Competency-Based Curriculum (CBC) Ready
            </span>

            <button
              onClick={openRewardsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer transition"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Link & Unlock Extra VIP Perks</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Auto-Draft Official REB Lesson Plans in <span className="text-amber-400">1 Click</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Elimu360 Open System translates unit titles and textbook excerpts into inspectorate-ready Rwanda Education Board (REB) CBC lesson plans.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <button 
              onClick={openRewardsModal}
              className="flex items-center gap-1.5 text-amber-300 hover:underline font-bold"
            >
              <Share2 className="w-4 h-4 text-amber-400" /> Share & Receive 10+ VIP Batching
            </button>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400" /> Instant PDF & Print Export
            </span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400" /> Auto-Extract Textbook Units
            </span>
          </div>
        </div>
      </div>

      {/* Sharing Rewards Banner CTA */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-slate-900 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0">
            <Gift className="w-5 h-5" />
          </span>
          <div>
            <span className="font-extrabold text-white block text-sm">
              🚀 Want Custom School Headers & 10+ Unlimited Lesson Batching?
            </span>
            <span className="text-slate-300 text-xs">
              Share Elimu360 Open System with 1 teacher to unlock custom school logo stamps, AI Scheme of Work generation, and priority fast processing!
            </span>
          </div>
        </div>
        <button
          onClick={openRewardsModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition flex items-center gap-2 shadow-md"
        >
          <Share2 className="w-4 h-4" />
          <span>Share & Receive Extra Perks</span>
        </button>
      </div>

      {/* Main Generator Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white font-display">Lesson Parameters</h2>
              </div>

              {/* Textbook Extractor Button */}
              <button
                type="button"
                onClick={() => setExtractorOpen(!extractorOpen)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>⚡ Auto-Extract from REB Textbook</span>
              </button>
            </div>

            {/* Extractor Drawer Panel */}
            {extractorOpen && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> REB Textbook & Curriculum AI Extractor
                  </span>
                  <button onClick={() => setExtractorOpen(false)} className="text-slate-400 hover:text-white text-xs">
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Upload a PDF textbook excerpt or paste a Table of Contents to auto-extract Unit details & Lesson titles in 1 click.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Upload PDF Textbook
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Or Paste Table of Contents Text
                    </label>
                    <textarea
                      rows={2}
                      value={pastedText}
                      onChange={e => setPastedText(e.target.value)}
                      placeholder="Paste REB Unit titles and lesson titles here..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleExtractFromText}
                      disabled={extracting || !pastedText.trim()}
                      className="mt-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition disabled:opacity-50"
                    >
                      {extracting ? 'Extracting with AI...' : '⚡ Extract REB Units & Lessons Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Notice */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields Grid - Clean placeholders without pre-filled values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="e.g. GS Amahoro Kigali / E.S. Nyarugenge"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teacher's Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="Enter teacher's full name (e.g. Teacher Murekezi)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select REB Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {SUBJECT_PRESETS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Class Level</label>
                <select
                  value={classLevel}
                  onChange={e => setClassLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {CLASS_LEVEL_PRESETS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Term & Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration & Class Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 40 min"
                    className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    value={classSize || ''}
                    onChange={e => setClassSize(parseInt(e.target.value) || 0)}
                    placeholder="No. of learners (e.g. 45)"
                    className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Number</label>
                  <input
                    type="text"
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                    placeholder="e.g. Unit 1"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official REB Unit Title</label>
                  <input
                    type="text"
                    value={unitTitle}
                    onChange={e => setUnitTitle(e.target.value)}
                    placeholder="e.g. OUR ENVIRONMENT AND NATURAL RESOURCES"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Special Educational Needs & Inclusivity Adaptations
                </label>
                <input
                  type="text"
                  value={specialNeeds}
                  onChange={e => setSpecialNeeds(e.target.value)}
                  placeholder="e.g. 2 learners with low vision seated near chalkboard with gesture aids"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Lesson Titles List Input */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Lesson Titles in Batch ({lessonTitles.length})</span>
                </label>

                {isVipUnlocked ? (
                  <span className="text-[11px] text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> VIP Unlimited Batching Active
                  </span>
                ) : (
                  <button
                    onClick={openRewardsModal}
                    className="text-[11px] text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 font-semibold transition"
                  >
                    Guest Limit: Max 3 (Share to Unlock VIP 10+)
                  </button>
                )}
              </div>

              {/* Add New Lesson Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitleInput}
                  onChange={e => setNewTitleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTitle(); } }}
                  placeholder="Enter lesson title (e.g. Types of Soil and Properties)..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddTitle}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Lesson Title
                </button>
              </div>

              {/* List of Titles */}
              {lessonTitles.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-400">No lesson titles added yet.</p>
                  <p className="text-[11px]">Type a title above or click "⚡ Auto-Extract from REB Textbook" to pull unit titles automatically!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessonTitles.map((title, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <span className="font-semibold line-clamp-1">
                        Lesson {idx + 1}: {title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Guest Limit Warning Notice */}
              {!isAuthenticated && !isVipUnlocked && lessonTitles.length >= 3 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Guest limit: 3 lesson plans at once. Share link to unlock VIP 10+ batching!</span>
                  </div>
                  <button
                    type="button"
                    onClick={openRewardsModal}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
                  >
                    Share & Unlock VIP
                  </button>
                </div>
              )}
            </div>

            {/* Submit Generation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || lessonTitles.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base shadow-xl transition flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Auto-Drafting REB CBC Lesson Plans...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>🚀 Auto-Generate {lessonTitles.length > 0 ? lessonTitles.length : ''} REB Lesson Plan{lessonTitles.length > 1 ? 's' : ''} Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Information & Results Showcase */}
        <div className="space-y-6">
          
          {/* Quick Stats & Features Badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>REB Curriculum Compliance</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">3-Step Lesson Flow</span>
                <p>Introduction (7 min), Development (25 min), Conclusion & Assessment (8 min).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">Generic Competences</span>
                <p>Integrates Critical Thinking, Research, Cooperation & Communication skills.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">Cross-Cutting Issues</span>
                <p>Embeds Inclusive Education, Gender Equity & Peace Education naturally.</p>
              </div>
            </div>
          </div>

          {/* Account Upgrade CTA Card (if guest) */}
          {!isAuthenticated && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Free Educator Account
              </div>

              <h4 className="text-base font-bold text-white font-display">
                Claim Your Educator Portal
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in or register free to back up your lesson plans securely in the cloud, sync across mobile/desktop, and access fast-track AI pipelines.
              </p>

              <button
                type="button"
                onClick={() => openAuthModal('signup', 'Sign up free for unlimited lesson plan cloud storage & batching!')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-md"
              >
                Create Free Educator Account
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Generated Results Section */}
      {generatedPlans.length > 0 && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-emerald-400 p-1 bg-emerald-500/20 rounded-lg border border-emerald-500/40" />
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Generated REB Lesson Plans ({generatedPlans.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Ready for instant printing, PDF export, or saving to your cloud library.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPlans.map((plan, i) => (
              <div 
                key={plan.id || i}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                    <span>Lesson {plan.lessonNumber}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{plan.duration}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-amber-300 transition">
                    {plan.lessonTitle}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {plan.instructionalObjective}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">{plan.subject} • {plan.classLevel}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingPlan(plan)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingPlan(plan);
                        setTimeout(() => window.print(), 350);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Lesson Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Modal View */}
      {viewingPlan && (
        <LessonPlanViewModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
        />
      )}

    </div>
  );
};
