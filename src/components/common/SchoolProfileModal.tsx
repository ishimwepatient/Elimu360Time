import React, { useState, useEffect } from 'react';
import { 
  X, 
  School, 
  User, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

export const SchoolProfileModal: React.FC = () => {
  const { 
    schoolProfile, 
    updateSchoolProfile, 
    schoolProfileModalOpen, 
    closeSchoolProfileModal 
  } = useElimu();

  const [formData, setFormData] = useState(schoolProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (schoolProfileModalOpen) {
      setFormData(schoolProfile);
      setSavedSuccess(false);
    }
  }, [schoolProfileModalOpen, schoolProfile]);

  if (!schoolProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeSchoolProfileModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 dark:from-amber-500/20 dark:via-emerald-500/20 dark:to-amber-500/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
                Amakuru y'Ishuri na Mwarimu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                School & Teacher Profile (Automatically retained for all documents)
              </p>
            </div>
          </div>
          <button
            onClick={closeSchoolProfileModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Amakuru ushyize hano abikwa muri mudasobwa cyangwa telefoni yawe. Azajya yikoresha mu mateguriro yose, mu binyamakuru, no mu masomo utongeye kwandika buri gihe!
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-amber-500" />
              Izina ry'Ishuri (School Name) *
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="Urugero: GS Rwanda Amahoro / GS Remera Protestant"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-medium"
            />
          </div>

          {/* Teacher Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              Amazina ya Mwarimu (Teacher's Name) *
            </label>
            <input
              type="text"
              required
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              placeholder="Urugero: Tr. UWIMANA Jean de Dieu"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-medium"
            />
          </div>

          {/* District & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Akarere (District)
              </label>
              <input
                type="text"
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Urugero: Gasabo / Huye"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Umurenge (Sector)
              </label>
              <input
                type="text"
                value={formData.sector || ''}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Urugero: Kimironko / Kacyiru"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Academic Year & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Umwaka w'Amashuri (Year)
              </label>
              <input
                type="text"
                value={formData.academicYear || '2025 - 2026'}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2025 - 2026"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Icyiciro cy'Amashuri (Level)
              </label>
              <select
                value={formData.defaultLevel || 'PRIMARY'}
                onChange={(e) => setFormData({ ...formData, defaultLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
              >
                <option value="PRIMARY">Amashuri Abanza (Primary P1 - P6)</option>
                <option value="O_LEVEL">Icyiciro Rusange (O-Level S1 - S3)</option>
                <option value="A_LEVEL">Icyiciro Gikuru (A-Level S4 - S6)</option>
                <option value="TSS_TVET">TVET & Imyuga</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeSchoolProfileModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Reka (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Byabitswe neza! (Saved!)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Bika Amakuru (Save & Retain)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
