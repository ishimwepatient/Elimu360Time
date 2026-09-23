import React, { useState } from 'react';
import { 
  Laptop, 
  BookOpen, 
  FileText, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award, 
  Download, 
  RotateCcw, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { Assignment } from '../../types';

export const ELearningModule: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    materials, 
    assignments, 
    submitAssignmentQuiz, 
    triggerConfetti 
  } = useElimu();

  const [activeQuizAssignment, setActiveQuizAssignment] = useState<Assignment | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState(600); // 10 minutes

  const activeQuizzes = assignments.filter(a => a.is_quiz && a.school_id === activeSchool.id);

  const handleStartQuiz = (asg: Assignment) => {
    setActiveQuizAssignment(asg);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setTimeLeftSec(600);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIdx]: optionIdx
    });
  };

  const handleQuizSubmit = () => {
    if (!activeQuizAssignment || !activeQuizAssignment.questions) return;
    
    const answersArray: number[] = [];
    activeQuizAssignment.questions.forEach((_, idx) => {
      answersArray.push(selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1);
    });

    const score = submitAssignmentQuiz(activeQuizAssignment.id, answersArray, currentUser.id);
    setQuizScore(score);
    setQuizSubmitted(true);
    triggerConfetti();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Laptop className="w-4 h-4" />
            <span>Digital Learning Hub · Section 03 [03]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Interactive E-Learning & Assessment Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multimedia course syllabi, downloadable materials, and timed self-grading interactive assessments.
          </p>
        </div>
      </div>

      {!activeQuizAssignment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Downloadable E-Learning Course Materials */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Digital Course Materials & Downloadable Notes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materials.filter(m => m.school_id === activeSchool.id).map(mat => (
                <div key={mat.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <span className="font-mono text-cyan-400 font-bold">{mat.file_type}</span>
                      <span>{mat.download_count} Downloads</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{mat.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{mat.description}</p>
                    <div className="text-[11px] text-slate-500 mt-3">
                      {mat.subject_name} · Instructor: {mat.uploaded_by_name}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => alert(`Downloading ${mat.title} (${mat.file_type})...`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download Resource</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Quizzes & Knowledge Checks */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Interactive Timed Quizzes</span>
            </h3>

            <div className="space-y-3">
              {activeQuizzes.map(quiz => (
                <div key={quiz.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-amber-400">{quiz.class_name}</span>
                    <span className="font-bold text-white">{quiz.total_points} Max Pts</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{quiz.title}</h4>
                  <p className="text-xs text-slate-400">{quiz.description}</p>
                  <div className="text-[11px] text-slate-500">Subject: {quiz.subject_name}</div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">{quiz.questions?.length || 5} Questions</span>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Launch Quiz</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Quiz Runner */
        <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Elimu360 Online Assessment
              </span>
              <h2 className="text-lg font-bold text-white">{activeQuizAssignment.title}</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-xs text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeftSec)}</span>
              </div>
              <button
                onClick={() => setActiveQuizAssignment(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </div>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-6">
              
              <div className="flex items-center gap-2">
                {activeQuizAssignment.questions?.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      currentQIndex === idx
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : selectedAnswers[idx] !== undefined
                        ? 'bg-blue-950 text-cyan-300 border border-blue-700'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {activeQuizAssignment.questions && activeQuizAssignment.questions[currentQIndex] && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-xs text-slate-400">
                    Question {currentQIndex + 1} of {activeQuizAssignment.questions.length}
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {activeQuizAssignment.questions[currentQIndex].question}
                  </h3>

                  <div className="space-y-2.5 pt-2">
                    {activeQuizAssignment.questions[currentQIndex].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQIndex, optIdx)}
                          className={`w-full p-3.5 rounded-xl text-left text-xs font-medium transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/80 border-2 border-cyan-500 text-white'
                              : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    currentQIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  Previous
                </button>

                {activeQuizAssignment.questions && currentQIndex < activeQuizAssignment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleQuizSubmit}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 cursor-pointer"
                  >
                    Submit & Grade Assessment
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 mx-auto flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Assessment Graded!</h3>
                <p className="text-xs text-slate-400 mt-1">Scores committed to academic ledger.</p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-bold">Your Score</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {quizScore} / {activeQuizAssignment.total_points} pts
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => handleStartQuiz(activeQuizAssignment)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={() => setActiveQuizAssignment(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Return to Learning Hub
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
