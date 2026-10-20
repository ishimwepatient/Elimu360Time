import React from 'react';
import { School, User, CheckCircle2, AlertCircle, Edit3, Sparkles } from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

export const SchoolProfileReminderBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { schoolProfile, isProfileConfigured, openSchoolProfileModal } = useElimu();

  if (compact) {
    return (
      <button
        onClick={openSchoolProfileModal}
        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          isProfileConfigured
            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
        }`}
        title="Amakuru y'Ishuri na Mwarimu (School & Teacher Profile)"
      >
        {isProfileConfigured ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {schoolProfile.schoolName} • {schoolProfile.teacherName}
            </span>
            <Edit3 className="w-3 h-3 opacity-60 ml-0.5" />
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Kuzuza Amakuru y'Ishuri</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border transition shadow-sm ${
      isProfileConfigured
        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-950 dark:text-amber-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isProfileConfigured 
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            {isProfileConfigured ? <CheckCircle2 className="w-5 h-5" /> : <School className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {isProfileConfigured ? "Amakuru y'Ishuri Yashyizwemo" : "Uributswa kuzuza amakuru y'ishuri"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                isProfileConfigured ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/30 text-amber-800 dark:text-amber-200'
              }`}>
                {isProfileConfigured ? 'Yabitswe' : 'Ntabwo Yuzuye'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isProfileConfigured ? (
                <>Ishuri: <strong>{schoolProfile.schoolName}</strong> • Mwarimu: <strong>{schoolProfile.teacherName}</strong> (Bikoreshwa mu mateguriro utongeye kwandika buri gihe)</>
              ) : (
                <>Shyiramo izina ry'ishuri na mwarimu rimwe gusa, bizajya byikoresha mu mateguriro yose y'amasomo na gahunda zose!</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={openSchoolProfileModal}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            isProfileConfigured
              ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isProfileConfigured ? "Hindura Amakuru (Edit)" : "Kuzuza Amakuru y'Ishuri (Set Profile)"}</span>
        </button>
      </div>
    </div>
  );
};
