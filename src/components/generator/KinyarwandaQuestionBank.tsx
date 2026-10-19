import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Filter, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  FileText, 
  Layers, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  SlidersHorizontal,
  BookmarkPlus,
  Share2
} from 'lucide-react';
import { 
  getAllBankQuestions, 
  BankQuestion, 
  QuestionType, 
  BloomLevel, 
  Difficulty,
  filterQuestions
} from '../../utils/kinyarwandaQuestionBankData';
import { exportQuestionsToDocx, exportQuestionsToPdf } from '../../utils/quizExportHelper';

interface KinyarwandaQuestionBankProps {
  onSelectForLessonPlan?: (question: BankQuestion) => void;
  onNavigate?: (tab: 'home' | 'converter' | 'generator' | 'library' | 'guide' | 'faq' | 'privacy') => void;
}

export const KinyarwandaQuestionBank: React.FC<KinyarwandaQuestionBankProps> = ({
  onSelectForLessonPlan,
  onNavigate
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedBloom, setSelectedBloom] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selected questions for Exam / Quiz export
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Show/Hide answers globally or per question
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<Set<string>>(new Set());

  // Export Quiz Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('GS Rwanda Amahoro');
  const [examTitle, setExamTitle] = useState('ISUZUMABUMENYI RY\'IKINYARWANDA');
  const [examTerm, setExamTerm] = useState('Igihembwe cya 1');
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Fast memoized filtered dataset
  const filteredQuestions = useMemo(() => {
    return filterQuestions({
      searchQuery,
      subject: selectedSubject,
      classLevel: selectedClass,
      bloomLevel: selectedBloom,
      questionType: selectedType,
      difficulty: selectedDifficulty
    });
  }, [searchQuery, selectedSubject, selectedClass, selectedBloom, selectedType, selectedDifficulty]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedClass, selectedBloom, selectedType, selectedDifficulty]);

  // Quick Legend Counts (computed instantly in memory)
  const legendStats = useMemo(() => {
    const total = filteredQuestions.length;
    let mcq = 0;
    let open = 0;
    let easy = 0;
    let med = 0;
    let hard = 0;

    for (let i = 0; i < total; i++) {
      const q = filteredQuestions[i];
      if (q.questionType === 'multiple_choice') mcq++;
      else open++;

      if (q.difficulty === 'Byoroshye') easy++;
      else if (q.difficulty === 'Biriciriritse') med++;
      else hard++;
    }

    return { total, mcq, open, easy, med, hard };
  }, [filteredQuestions]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const handleCopyQuestion = (q: BankQuestion) => {
    const textToCopy = `Ikibazo: ${q.questionText}\n` +
      (q.options ? q.options.join('\n') + '\n' : '') +
      `Igisubizo: ${q.correctAnswer}\nIbisobanuro: ${q.explanation}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleSelectQuestion = (id: string) => {
    const updated = new Set(selectedQuestionIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedQuestionIds(updated);
  };

  const selectCurrentBatch = () => {
    const updated = new Set(selectedQuestionIds);
    paginatedQuestions.forEach(q => updated.add(q.id));
    setSelectedQuestionIds(updated);
  };

  const clearSelection = () => {
    setSelectedQuestionIds(new Set());
  };

  const toggleRevealAnswer = (id: string) => {
    const updated = new Set(revealedQuestionIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setRevealedQuestionIds(updated);
  };

  const handleTriggerExport = async (format: 'docx' | 'pdf') => {
    const all = getAllBankQuestions();
    const targetQuestions = all.filter(q => selectedQuestionIds.has(q.id));

    if (targetQuestions.length === 0) {
      alert('Hitamo nibura ikibazo kimwe cyo gushyira mu kizamini (Select at least 1 question).');
      return;
    }

    setIsExporting(true);
    try {
      const options = {
        schoolName,
        examTitle,
        subject: selectedSubject === 'ALL' ? (targetQuestions[0]?.subject || 'Ikinyarwanda') : selectedSubject,
        classLevel: selectedClass === 'ALL' ? (targetQuestions[0]?.classLevel || 'P1 - S3') : selectedClass,
        term: examTerm,
        duration: 'Iminota 40 - 60',
        includeAnswers: includeMarkingScheme
      };

      if (format === 'docx') {
        await exportQuestionsToDocx(targetQuestions, options);
        setExportNotice(`Ikizamini cya Word (.docx) cyasohowe neza kirimo ibibazo ${targetQuestions.length}!`);
      } else {
        exportQuestionsToPdf(targetQuestions, options);
        setExportNotice(`Ikizamini cya PDF cyasohowe neza kirimo ibibazo ${targetQuestions.length}!`);
      }
      setIsExportModalOpen(false);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err: any) {
      console.error('Quiz Export Error:', err);
      alert('Habaye ikibazo mu gusohora ikizamini. Ongera ugerageze.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreatePlanFromQuestion = (q: BankQuestion) => {
    if (onSelectForLessonPlan) {
      onSelectForLessonPlan(q);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Ikigega cy'Ibibazo by'Ikinyarwanda
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> REB CBC Compliant (2,200+ Questions)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Ikigega cy'Ibibazo n'Amasomo mu Kinyarwanda
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ibibazo birenga 2,000 biteguye neza mu rurimi rw'Ikinyarwanda ku masomo yose yigishwa mu Kinyarwanda (Ikinyarwanda, Imibare P1-P3, Ibyerekeye Ibidukikije, n'Ubugeni). Hitamo ibibazo wifuza maze usohore ibizamini mu buryo bwa <strong>Word (.docx)</strong> cyangwa <strong>PDF</strong>, cyangwa uhitemo ikibazo ako kanya ugihinduremo Iteguriro ry'Isomo (Lesson Plan).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {selectedQuestionIds.size > 0 && (
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4 fill-slate-950" />
                <span>Sohora Ikizamini ({selectedQuestionIds.size} byatoranyijwe)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAllAnswers(!showAllAnswers)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              {showAllAnswers ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
              <span>{showAllAnswers ? 'Hisha Ibisubizo' : 'Erekana Ibisubizo Byose'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success / Notification Banner */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Search Bar & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shakisha ikibazo, umutwe w'isomo, igisubizo cyangwa inyigisho..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
            >
              Guhanagura
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Isomo (Subject)</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Amasomo Yose</option>
              <option value="Ikinyarwanda">Ikinyarwanda</option>
              <option value="Imibare">Imibare (P1-P3)</option>
              <option value="Ibyerekeye Ibidukikije">Ibyerekeye Ibidukikije</option>
              <option value="Ubugeni n'Umuco">Ubugeni n'Umuco</option>
            </select>
          </div>

          {/* Class Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Umwaka (Class)</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Imyaka Yose</option>
              <option value="P1">P1 (Umwaka wa 1)</option>
              <option value="P2">P2 (Umwaka wa 2)</option>
              <option value="P3">P3 (Umwaka wa 3)</option>
              <option value="P4">P4 (Umwaka wa 4)</option>
              <option value="P5">P5 (Umwaka wa 5)</option>
              <option value="P6">P6 (Umwaka wa 6)</option>
              <option value="S1">S1 (Tronc Commun)</option>
              <option value="S2">S2 (Tronc Commun)</option>
              <option value="S3">S3 (Tronc Commun)</option>
            </select>
          </div>

          {/* Bloom Taxonomy Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Urwego (Bloom's Taxonomy)</label>
            <select
              value={selectedBloom}
              onChange={(e) => setSelectedBloom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Inzego Zose</option>
              <option value="Kwibuka">Kwibuka</option>
              <option value="Gusobanukirwa">Gusobanukirwa</option>
              <option value="Gushyira mu bikorwa">Gushyira mu bikorwa</option>
              <option value="Gusesengura">Gusesengura</option>
              <option value="Isuzuma">Isuzuma</option>
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Ubwoko bw'Ikibazo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Ubwoko Bwose</option>
              <option value="multiple_choice">Guhitamo (MCQ)</option>
              <option value="open">Ibibazo Byuguruye</option>
              <option value="true_false">Yego / Oya</option>
              <option value="fill_blank">Kuzuza Ahari Umwanya</option>
              <option value="riddle_proverb">Ibisakuzo n'Imigani</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Uburemere (Difficulty)</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Uburemere Bwose</option>
              <option value="Byoroshye">Byoroshye</option>
              <option value="Biriciriritse">Biriciriritse</option>
              <option value="Birakomeye">Birakomeye</option>
            </select>
          </div>

        </div>

      </div>

      {/* Reactive Interactive Legend Bar - Real-time statistics */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Ibibazo Byabonetse: <span className="text-amber-400 text-sm">{legendStats.total}</span></span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Guhitamo (MCQ): <strong className="text-white">{legendStats.mcq}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Ibyuguruye: <strong className="text-white">{legendStats.open}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            Byoroshye: <strong>{legendStats.easy}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300">
            Biriciriritse: <strong>{legendStats.med}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300">
            Birakomeye: <strong>{legendStats.hard}</strong>
          </span>
        </div>

        {/* Selection actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectCurrentBatch}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition cursor-pointer"
          >
            Toranya Ibi biri ku rupapuro ({paginatedQuestions.length})
          </button>
          {selectedQuestionIds.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-bold transition cursor-pointer"
            >
              Kureka ibyatoranyijwe
            </button>
          )}
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {paginatedQuestions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Nta kibazo kigaragaye kuri aya mahitamo</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Gerageza guhindura amagambo ushakisha cyangwa uhindure amahitamo y'isomo cyangwa umwaka.
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.has(q.id);
            const isRevealed = showAllAnswers || revealedQuestionIds.has(q.id);
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                  isSelected 
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-md' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top Badges & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Checkbox for Exam inclusion */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectQuestion(q.id)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <span className="font-extrabold text-slate-200">
                        #{(currentPage - 1) * pageSize + idx + 1}
                      </span>
                    </label>

                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      {q.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 font-bold border border-slate-700">
                      {q.classLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-400">
                      Umutwe {q.unitNumber}: {q.unitTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300">
                      {q.bloomLevel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg font-medium ${
                      q.difficulty === 'Byoroshye' ? 'bg-emerald-950/60 text-emerald-300' :
                      q.difficulty === 'Biriciriritse' ? 'bg-amber-950/60 text-amber-300' :
                      'bg-rose-950/60 text-rose-300'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Actions for this question */}
                  <div className="flex items-center gap-2">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyQuestion(q)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                      title="Koporora ikibazo"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Byakoporowe!' : 'Koporora'}</span>
                    </button>

                    {/* Create Lesson Plan button */}
                    <button
                      type="button"
                      onClick={() => handleCreatePlanFromQuestion(q)}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition flex items-center gap-1.5 font-bold cursor-pointer"
                      title="Kora Iteguriro ry'Isomo kuri iki kibazo (Generate Lesson Plan)"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Kora Iteguriro ry'Isomo</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm font-semibold text-white leading-relaxed pl-1">
                  {q.questionText}
                </div>

                {/* Multiple Choice Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-1 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Accordion */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRevealAnswer(q.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition w-fit cursor-pointer"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? 'Hisha Igisubizo n\'Ibisobanuro' : 'Erekana Igisubizo n\'Ibisobanuro'}</span>
                  </button>

                  {isRevealed && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Igisubizo cy'Ukuri: {q.correctAnswer}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] pl-6">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Urupapuro {currentPage} ruri kuri {totalPages} ({filteredQuestions.length} byose)</span>
            <span className="text-slate-700">•</span>
            <span>Urupapuro ruriho:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white"
            >
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold transition disabled:opacity-40 cursor-pointer"
            >
              ← Ibibanza
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pNum = Math.min(totalPages, currentPage - 2 + i);
              }
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                    currentPage === pNum
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold transition disabled:opacity-40 cursor-pointer"
            >
              Ibikurikira →
            </button>
          </div>
        </div>
      )}

      {/* Export Quiz Paper Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl animate-scale-in">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Download className="w-5 h-5 text-amber-400" />
                <span>Sohora Ikizamini / Umukoro</span>
              </h3>
              <p className="text-xs text-slate-400">
                Hitamo uko urupapuro rw'ikizamini ruri busohoke (Word cyangwa PDF) ku bibazo <strong>{selectedQuestionIds.size}</strong> watoranyije.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Izina ry'Ishuri (School Name)</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Umutwe w'Ikizamini (Exam Title)</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Igihembwe (Term)</label>
                <select
                  value={examTerm}
                  onChange={(e) => setExamTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Igihembwe cya 1">Igihembwe cya 1</option>
                  <option value="Igihembwe cya 2">Igihembwe cya 2</option>
                  <option value="Igihembwe cya 3">Igihembwe cya 3</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="includeAnswersToggle"
                  checked={includeMarkingScheme}
                  onChange={(e) => setIncludeMarkingScheme(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="includeAnswersToggle" className="text-slate-300 font-bold cursor-pointer">
                  Shyiraho Akaraso k'Ikosora n'Ibisobanuro by'Umwarimu ku mpera (Marking Scheme)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Guhagarika
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleTriggerExport('pdf')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Sohora PDF</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleTriggerExport('docx')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Sohora Word (.docx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
