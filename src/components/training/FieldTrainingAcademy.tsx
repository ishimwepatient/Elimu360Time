import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  FileText, 
  Download, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  Target, 
  Users, 
  ChevronRight, 
  AlertTriangle,
  Send,
  RefreshCw,
  Printer,
  Compass,
  Zap,
  Check,
  X
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { 
  MASTER_12_PILLARS, 
  FIELD_TRAINING_MODULES, 
  PRACTICAL_TEST_QUESTIONS, 
  TrainingPillar, 
  TrainingModule 
} from './trainingData';
import { 
  generateIndividualPillarPdf, 
  generateIndividualModulePdf, 
  generateMasterManualPdf, 
  generateCertificatePdf 
} from './pdfGenerator';
import { TrainingPdfResourceHub } from './TrainingPdfResourceHub';

export { MASTER_12_PILLARS, FIELD_TRAINING_MODULES };
export type { TrainingPillar, TrainingModule };

export const FieldTrainingAcademy: React.FC = () => {
  const { currentUser, setRegistrarAccredited, setCoordinatorAccredited } = useElimu();
  const [activeTab, setActiveTab] = useState<'PILLARS' | 'MODULES' | 'PDF_LIBRARY' | 'PRACTICAL_TEST'>('PILLARS');
  
  const [selectedPillarId, setSelectedPillarId] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);

  // Practical Test State
  const [candidateName, setCandidateName] = useState(currentUser?.name || 'Accredited Field Officer');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const selectedPillar = MASTER_12_PILLARS.find(p => p.id === selectedPillarId) || MASTER_12_PILLARS[0];
  const selectedModule = FIELD_TRAINING_MODULES.find(m => m.id === selectedModuleId) || FIELD_TRAINING_MODULES[0];

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length < PRACTICAL_TEST_QUESTIONS.length) {
      alert(`Please answer all ${PRACTICAL_TEST_QUESTIONS.length} questions before submitting.`);
      return;
    }

    let correctCount = 0;
    PRACTICAL_TEST_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / PRACTICAL_TEST_QUESTIONS.length) * 100);
    setTestScore(calculatedScore);
    setTestSubmitted(true);

    if (calculatedScore >= 80) {
      if (currentUser?.role === 'REGISTER') {
        setRegistrarAccredited(currentUser.id, true);
      } else if (currentUser?.role === 'COORDINATOR') {
        setCoordinatorAccredited(currentUser.id, true);
      }
    }
  };

  const handleResetTest = () => {
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Elimu360 Field Officer Certification Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Elimu360 Field Training Academy
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Master the 12 Core Knowledge Pillars and 7 Practical Field Training Modules. Obtain your Official Certificate of Accreditation to register schools and manage regional school onboarding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => generateMasterManualPdf(MASTER_12_PILLARS, FIELD_TRAINING_MODULES)}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Master Manual PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('PRACTICAL_TEST')}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Take Accreditation Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('PILLARS')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'PILLARS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>12 Core Knowledge Pillars</span>
        </button>

        <button
          onClick={() => setActiveTab('MODULES')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'MODULES'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>7 Practical Training Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('PDF_LIBRARY')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'PDF_LIBRARY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Individual PDF Library (19 PDFs)</span>
        </button>

        <button
          onClick={() => setActiveTab('PRACTICAL_TEST')}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'PRACTICAL_TEST'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Practical Examination & Certificate</span>
        </button>
      </div>

      {/* TAB 1: 12 CORE KNOWLEDGE PILLARS */}
      {activeTab === 'PILLARS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Pillar Selector */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
                12 System Knowledge Pillars
              </div>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {MASTER_12_PILLARS.map((pillar) => {
                  const isSelected = pillar.id === selectedPillarId;
                  return (
                    <div
                      key={pillar.id}
                      className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedPillarId(pillar.id)}
                        className="text-left flex-1 cursor-pointer min-w-0"
                      >
                        <div className="font-bold text-xs truncate">{pillar.title}</div>
                        <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {pillar.subtitle}
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateIndividualPillarPdf(pillar);
                        }}
                        title={`Download Core Topic #${pillar.id} PDF`}
                        className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-blue-700 border-blue-500 text-white hover:bg-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Pillar Details */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    Core Pillar #{selectedPillar.id} of 12
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {selectedPillar.title}
                  </h2>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    {selectedPillar.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => generateIndividualPillarPdf(selectedPillar)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Core Topic #{selectedPillar.id} PDF</span>
                </button>
              </div>

              {/* Pillar Summary Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
                <strong className="text-blue-900 dark:text-blue-300 block mb-1">Executive Summary:</strong>
                {selectedPillar.summary}
              </div>

              {/* Detailed Content Sections */}
              <div className="space-y-6">
                {selectedPillar.detailedContent.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{section.heading}</span>
                    </h3>
                    <ul className="space-y-2">
                      {section.points.map((pt, ptIdx) => (
                        <li key={ptIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated Individual PDF Download Hub at bottom of Pillars */}
          <TrainingPdfResourceHub defaultCategory="PILLARS" />
        </div>
      )}

      {/* TAB 2: 7 FIELD TRAINING MODULES */}
      {activeTab === 'MODULES' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Module Selector */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
                7 Training Modules
              </div>
              <div className="space-y-1.5">
                {FIELD_TRAINING_MODULES.map((mod) => {
                  const isSelected = mod.id === selectedModuleId;
                  return (
                    <div
                      key={mod.id}
                      className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedModuleId(mod.id)}
                        className="text-left flex-1 cursor-pointer min-w-0"
                      >
                        <div className="font-bold text-xs truncate">{mod.title}</div>
                        <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                          Duration: {mod.duration}
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateIndividualModulePdf(mod);
                        }}
                        title={`Download Module #${mod.id} PDF`}
                        className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-amber-700 border-amber-500 text-white hover:bg-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Module Details */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      {selectedModule.duration} Practical Session
                    </span>
                    <span className="text-xs font-mono text-slate-400">Module #{selectedModule.id}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {selectedModule.title}
                  </h2>
                </div>

                <button
                  onClick={() => generateIndividualModulePdf(selectedModule)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Module #{selectedModule.id} PDF</span>
                </button>
              </div>

              {/* Objective Callout */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Module Learning Objective</div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {selectedModule.objective}
                </p>
              </div>

              {/* Core Concepts */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Core Syllabus & Concepts</span>
                </h3>
                <div className="space-y-2">
                  {selectedModule.coreConcepts.map((concept, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {cIdx + 1}
                      </span>
                      <span className="leading-relaxed">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Scripts */}
              {selectedModule.fieldScripts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Practical Field Verbatim Script</span>
                  </h3>
                  {selectedModule.fieldScripts.map((sc, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        Scenario: {sc.scenario}
                      </div>
                      <div className="text-xs font-serif italic text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-100 dark:border-slate-800">
                        {sc.whatToSay}
                      </div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                        💡 <strong>Key Takeaway:</strong> {sc.keyTakeaway}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Practical Field Tip */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Pro Field Tip:</strong>
                  {selectedModule.practicalTip}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Individual PDF Download Hub at bottom of Modules */}
          <TrainingPdfResourceHub defaultCategory="MODULES" />
        </div>
      )}

      {/* TAB 3: INDIVIDUAL PDF RESOURCE HUB */}
      {activeTab === 'PDF_LIBRARY' && (
        <TrainingPdfResourceHub defaultCategory="ALL" />
      )}

      {/* TAB 4: PRACTICAL TEST & CERTIFICATION */}
      {activeTab === 'PRACTICAL_TEST' && (
        <div className="space-y-6">
          {!testSubmitted ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    Official Competency Examination
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    Registrar & Coordinator Field Accreditation Test
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Answer all 10 scenario-based questions to demonstrate mastery of Elimu360 SIMS, compensation structure, and onboarding protocols. Passing score: 80%.
                  </p>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your full name..."
                  />
                </div>
              </div>

              {/* Questions Form */}
              <form onSubmit={handleSubmitTest} className="space-y-8">
                {PRACTICAL_TEST_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </h3>
                    </div>

                    <div className="space-y-2 pl-9">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[q.id] === oIdx;
                        return (
                          <label
                            key={oIdx}
                            onClick={() => handleSelectAnswer(q.id, oIdx)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={isSelected}
                              onChange={() => handleSelectAnswer(q.id, oIdx)}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Accreditation Test</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TEST RESULTS DISPLAY */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                {testScore >= 80 ? (
                  <Award className="w-16 h-16 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-16 h-16 text-amber-500" />
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {testScore >= 80 ? 'Accreditation Exam Passed!' : 'Accreditation Exam Incomplete'}
                </h2>
                <p className="text-sm text-slate-500 max-w-lg mx-auto">
                  {testScore >= 80
                    ? `Congratulations ${candidateName}! You scored ${testScore}% on the official Elimu360 SIMS Field Competency Examination.`
                    : `You scored ${testScore}%. A minimum passing score of 80% is required to obtain your official Accreditation Certificate.`}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Candidate:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{candidateName}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Final Score:</span>
                  <span className={`font-mono text-sm ${testScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {testScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Accreditation Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    testScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {testScore >= 80 ? 'ACCREDITED' : 'RE-TAKE REQUIRED'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                {testScore >= 80 ? (
                  <button
                    onClick={() => generateCertificatePdf(candidateName, testScore, currentUser?.role || 'REGISTRAR')}
                    className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Certificate PDF</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetTest}
                    className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake Examination</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
