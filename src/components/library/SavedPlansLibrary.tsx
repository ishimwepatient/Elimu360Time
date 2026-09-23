import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Sparkles, 
  Lock, 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  Check, 
  Download,
  Printer
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { LessonPlanData } from '../../types';
import { LessonPlanViewModal } from '../generator/LessonPlanViewModal';

export const SavedPlansLibrary: React.FC<{ onNavigateToGenerator: () => void }> = ({ onNavigateToGenerator }) => {
  const { savedLessonPlans, plansLoading, isAuthenticated, deleteLessonPlan, openAuthModal } = useElimu();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [viewingPlan, setViewingPlan] = useState<LessonPlanData | null>(null);

  // Extract unique subjects & classes
  const uniqueSubjects = Array.from(new Set(savedLessonPlans.map(p => p.subject).filter(Boolean)));
  const uniqueClasses = Array.from(new Set(savedLessonPlans.map(p => p.classLevel).filter(Boolean)));

  // Filter logic
  const filteredPlans = savedLessonPlans.filter(p => {
    const matchesSearch = 
      p.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.unitTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.classLevel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'ALL' || p.subject === selectedSubject;
    const matchesClass = selectedClass === 'ALL' || p.classLevel === selectedClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Cloud Library
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">
            My Saved Lesson Plans ({savedLessonPlans.length})
          </h1>
          <p className="text-xs text-slate-400">
            {isAuthenticated 
              ? 'Synchronized securely across all your devices.' 
              : 'Stored locally on this device. Sign in free to back up to the cloud!'}
          </p>
        </div>

        <button
          onClick={onNavigateToGenerator}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Lesson Plan</span>
        </button>
      </div>

      {/* Guest Lock Notice (If guest user) */}
      {!isAuthenticated && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <span className="font-bold text-amber-200 block">Want to save plans permanently across devices?</span>
              <span className="text-slate-300">Sign in or create a free account to back up all your lesson plans to your personal cloud library.</span>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('signup', 'Sign up free to sync your saved lesson plans across all devices!')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            Sign Up Free
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, unit, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Subjects ({uniqueSubjects.length})</option>
            {uniqueSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Class Levels ({uniqueClasses.length})</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {plansLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading your saved lesson plans...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-slate-700">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">No Lesson Plans Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {searchTerm || selectedSubject !== 'ALL' || selectedClass !== 'ALL'
              ? 'No plans matched your search filters. Try clearing the filters.'
              : 'You haven\'t created any lesson plans yet. Use our AI Generator to create your first REB lesson plan in seconds!'}
          </p>
          <button
            onClick={onNavigateToGenerator}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            Generate First Lesson Plan
          </button>
        </div>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-4 transition group flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    {plan.subject}
                  </span>
                  <span className="text-slate-400 font-medium">{plan.classLevel}</span>
                </div>

                <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-amber-300 transition font-display">
                  {plan.lessonTitle}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  Unit {plan.unitNumber}: {plan.unitTitle}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{plan.term} • {plan.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{plan.teacherName} ({plan.schoolName})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
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

                <button
                  type="button"
                  onClick={() => deleteLessonPlan(plan.id)}
                  title="Delete plan"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View */}
      {viewingPlan && (
        <LessonPlanViewModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
        />
      )}

    </div>
  );
};
