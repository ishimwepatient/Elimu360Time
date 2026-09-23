import React from 'react';
import { BookOpen, CheckCircle2, ShieldCheck, Layers, Award, Sparkles, HelpCircle } from 'lucide-react';

export const REBCBCGuide: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> REB & CBC Standard Architecture
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Understanding REB Competency-Based Curriculum (CBC)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In Rwanda's Competency-Based Curriculum (CBC), lesson plans shift learning from passive knowledge acquisition to practical competence, critical thinking, problem solving, and values.
        </p>
      </div>

      {/* Grid of Key Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. The 3-Step Lesson Plan Structure */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white font-display">
              1. Three-Step Lesson Timing (40 min standard)
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-amber-400">
                <span>Step 1: Introduction</span>
                <span>~5 - 7 Minutes</span>
              </div>
              <p>Reviewing prerequisite knowledge, brain-warming questions, sharing the lesson topic & objectives.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-amber-400">
                <span>Step 2: Lesson Development</span>
                <span>~25 - 28 Minutes</span>
              </div>
              <p>Active learner activities, group discussions, experiments, pair work, teacher facilitation & monitoring.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-amber-400">
                <span>Step 3: Conclusion & Assessment</span>
                <span>~5 - 8 Minutes</span>
              </div>
              <p>Learner summary, formative assessment questions, homework/assignment, teacher self-evaluation.</p>
            </div>
          </div>
        </div>

        {/* 2. Generic Competences */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white font-display">
              2. Essential Generic Competences
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">Critical Thinking</span>
              <p className="text-[11px] text-slate-400">Analyzing, evaluating, and solving real-world problems.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">Research & Problem Solving</span>
              <p className="text-[11px] text-slate-400">Gathering information, testing hypotheses, finding answers.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">Cooperation & Teamwork</span>
              <p className="text-[11px] text-slate-400">Collaborating in groups with mutual respect and leadership.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block">Communication</span>
              <p className="text-[11px] text-slate-400">Expressing ideas clearly in oral, written, or visual forms.</p>
            </div>
          </div>
        </div>

        {/* 3. Cross-Cutting Issues */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white font-display">
              3. Integrated Cross-Cutting Issues
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-cyan-300 block mb-1">Inclusive Education</span>
              <p className="text-slate-400">Accommodating special needs learners (visual, hearing, physical) with adapted seats, gesture aids, and peer assistance.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-cyan-300 block mb-1">Gender Education</span>
              <p className="text-slate-400">Ensuring equal participation, leadership, and group roles for both boys and girls in all subject activities.</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-cyan-300 block mb-1">Peace & Values Education</span>
              <p className="text-slate-400">Promoting mutual respect, empathy, conflict resolution, active listening, and civic responsibility.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
