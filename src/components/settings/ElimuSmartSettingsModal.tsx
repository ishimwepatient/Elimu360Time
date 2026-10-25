import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  FolderPlus, 
  FolderCheck, 
  ShieldCheck, 
  Lock, 
  Scale, 
  X, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Volume2, 
  Smartphone,
  ChevronRight,
  Flame,
  HelpCircle,
  FolderSync
} from 'lucide-react';
import { 
  notificationEngine, 
  TeacherCustomReminder, 
  ElimuAppSettings 
} from '../../utils/notificationSystem';
import { intelligentFileWatcher } from '../../utils/intelligentFileWatcher';

interface ElimuSmartSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalPolicy: (tab: 'terms' | 'privacy' | 'sovereignty') => void;
}

export const ElimuSmartSettingsModal: React.FC<ElimuSmartSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLegalPolicy
}) => {
  const [settings, setSettings] = useState<ElimuAppSettings>(() => notificationEngine.getSettings());
  const [customReminders, setCustomReminders] = useState<TeacherCustomReminder[]>(() => notificationEngine.getCustomReminders());
  const [activeTab, setActiveTab] = useState<'reminders' | 'features' | 'file_watcher' | 'legal'>('reminders');
  
  // Custom reminder form state
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('07:30');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default weekdays
  const [newCategory, setNewCategory] = useState<'meeting' | 'duty' | 'exam' | 'lesson' | 'general'>('meeting');

  // File watcher state
  const [connectedFolder, setConnectedFolder] = useState<string | null>(() => intelligentFileWatcher.getConnectedFolderName());
  const [connectingFolder, setConnectingFolder] = useState(false);
  const [folderMessage, setFolderMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSettings(notificationEngine.getSettings());
      setCustomReminders(notificationEngine.getCustomReminders());
      setConnectedFolder(intelligentFileWatcher.getConnectedFolderName());
    };

    update();
    const unsub1 = notificationEngine.subscribe(update);
    const unsub2 = intelligentFileWatcher.subscribe(update);
    return () => {
      unsub1();
      unsub2();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSetting = (key: keyof ElimuAppSettings) => {
    const updated = !settings[key];
    notificationEngine.updateSettings({ [key]: updated });
    setSettings(prev => ({ ...prev, [key]: updated }));
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [h, m] = newTime.split(':').map(Number);
    notificationEngine.saveCustomReminder({
      title: newTitle.trim(),
      time: newTime,
      hour: isNaN(h) ? 7 : h,
      minute: isNaN(m) ? 30 : m,
      days: newDays,
      enabled: true,
      category: newCategory
    });

    setNewTitle('');
    setIsAddingReminder(false);
  };

  const handleQuickAdd = (presetTitle: string, time: string, cat: any) => {
    const [h, m] = time.split(':').map(Number);
    notificationEngine.saveCustomReminder({
      title: presetTitle,
      time,
      hour: h,
      minute: m,
      days: [1, 2, 3, 4, 5],
      enabled: true,
      category: cat
    });
  };

  const handleConnectFolder = async () => {
    setConnectingFolder(true);
    setFolderMessage(null);
    const result = await intelligentFileWatcher.requestFolderAccess();
    setConnectingFolder(false);

    if (result.success) {
      setFolderMessage(`Ububiko "${result.folderName}" bwahujwe neza! Sisitemu iratangira kugenzura inyandiko nshya.`);
    } else if (result.error) {
      setFolderMessage(result.error);
    }
  };

  const handleDisconnectFolder = () => {
    intelligentFileWatcher.disconnectFolder();
    setFolderMessage('Ububiko bwakuwemo.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-display text-white">
                Elimu Smart Settings Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Igenamiterere, Ibyibutsa Byihariye, Ububiko bw'Inyandiko & Politiki
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2.5 shrink-0 bg-slate-50 dark:bg-slate-950/50 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'reminders'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ibyibutsa Byihariye ({customReminders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('file_watcher')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'file_watcher'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Ububiko bw'Inyandiko (Auto-Convert)</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ToggleLeft className="w-3.5 h-3.5" />
            <span>Kugenzura Serivisi (Toggles)</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'legal'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Amategeko & Ubuzima Bwite</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          
          {/* TAB 1: TEACHER CUSTOM REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Ibyibutsa Byihariye bya Mwarimu (Custom Reminders)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ongeramo ubutumwa ushaka ko Elimu Smart Assistant ikuburira (Inama, Gukosora, Zamu ry'Ishuri).
                  </p>
                </div>

                {!isAddingReminder && (
                  <button
                    onClick={() => setIsAddingReminder(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ongeramo</span>
                  </button>
                )}
              </div>

              {/* Add Reminder Form */}
              {isAddingReminder && (
                <form onSubmit={handleSaveReminder} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-amber-300 dark:border-amber-500/40 space-y-3 animate-fade-in">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Ongeraho Urwibutso Rushya:</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingReminder(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Hagarika
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Izina ry'Urwibutso (Title):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Urugero: Inama y'Abarimu, Gukosora Ibizamini..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                        Isaha (Time):
                      </label>
                      <input
                        type="time"
                        required
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                        Icyiciro (Category):
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e: any) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="meeting">Inama (Meeting)</option>
                        <option value="duty">Zamu ry'Ishuri (Duty)</option>
                        <option value="exam">Gukosora Ibizamini (Grading)</option>
                        <option value="lesson">Isomo ry'Umwihariko (Lesson)</option>
                        <option value="general">Ibisanzwe (General)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingReminder(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      Bireke
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                    >
                      Bika Urwibutso
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Presets for Rwandan Teachers */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-2">
                  Ibyibutsa Byihuse Bimenyerewe (1-Click Presets):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleQuickAdd("Inama y'Abarimu (Staff Meeting)", "07:30", "meeting")}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition cursor-pointer"
                  >
                    + Inama y'Abarimu (07:30)
                  </button>
                  <button
                    onClick={() => handleQuickAdd("Gukosora Imikoro y'Abanyeshuri", "16:30", "exam")}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition cursor-pointer"
                  >
                    + Gukosora Imikoro (16:30)
                  </button>
                  <button
                    onClick={() => handleQuickAdd("Zamu ry'Ishuri (Duty Teacher)", "06:45", "duty")}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition cursor-pointer"
                  >
                    + Zamu ry'Ishuri (06:45)
                  </button>
                  <button
                    onClick={() => handleQuickAdd("Gutanga Lesson Plans ku Mwanditsi/DOS", "15:00", "lesson")}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition cursor-pointer"
                  >
                    + Gutanga Lesson Plans (15:00)
                  </button>
                </div>
              </div>

              {/* Reminders List */}
              <div className="space-y-2">
                {customReminders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nta byibutsa byihariye urashyiramo. Kanda "Ongeramo" cyangwa uhitemo mu byibutsa byihuse hejuru.
                  </div>
                ) : (
                  customReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        rem.enabled 
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800' 
                          : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => notificationEngine.toggleCustomReminder(rem.id)}
                          className={`p-1.5 rounded-xl transition cursor-pointer ${
                            rem.enabled 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{rem.title}</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-[10px]">
                              {rem.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Buri minsi y'akazi (Kuwa mbere - Kuwa gatanu)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => notificationEngine.toggleCustomReminder(rem.id)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {rem.enabled ? 'Gukora' : 'Yahagaze'}
                        </button>
                        <button
                          onClick={() => notificationEngine.deleteCustomReminder(rem.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Futa urwibutso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INTELLIGENT FILE ACCESS & AUTO-CONVERTER */}
          {activeTab === 'file_watcher' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-amber-500" />
                  Intelligent File Access & Auto-Converter Watcher
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Guha sisitemu uruhushya rwo kureba ububiko bw'inyandiko zawe (Lesson Plans, Past Papers, Notes) kugira ngo buri gihe habonetse inyandiko nshya (PDF cyangwa Word) ikuburire maze uyihindure mu buryo bworoshye.
                </p>
              </div>

              {/* Connected Folder Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-transparent border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Imiterere y'Ububiko (Folder Access Status):
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    connectedFolder 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}>
                    {connectedFolder ? 'Bwahujwe (Connected)' : 'Ntaburahuza'}
                  </span>
                </div>

                {connectedFolder ? (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FolderCheck className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {connectedFolder}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Sisitemu iragenzura inyandiko nshya (PDF, Word, Images, Slides)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnectFolder}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold text-xs transition cursor-pointer"
                    >
                      Kura Ububiko
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Kanda buto ikurikira maze uhitemo ububiko usanzwe ubikamo inyandiko (urugero: <em>Documents</em> cyangwa <em>Downloads</em>). Elimu Smart Assistant izajya ihita ikubaza niba wifuza guhindura inyandiko ukimara kuyishyiramo.
                    </p>

                    <button
                      onClick={handleConnectFolder}
                      disabled={connectingFolder}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <FolderPlus className="w-4 h-4 fill-slate-950" />
                      <span>{connectingFolder ? 'Guhuza...' : 'Shyiraho Ububiko bw’Inyandiko (Connect Teaching Folder)'}</span>
                    </button>
                  </div>
                )}

                {folderMessage && (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    {folderMessage}
                  </div>
                )}
              </div>

              {/* Safety & Sandboxing Note */}
              <div className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Umutekano:</strong> Uruhurashya rukurikiza amategeko ya Web File Sandbox. Sisitemu ntiyigera isoma ibiri mu zindi nyandiko zawe bwite, ireba gusa inyandiko z'uburezi ushaka guhindura mu mashuri.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE TOGGLES */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Kugenzura Serivisi n'Ubutumwa (Feature Controls)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hitamo serivisi zikora cyangwa zihagarara muri Elimu Smart Notification System.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: 'lessonPlanAlerts' as keyof ElimuAppSettings,
                    title: "Ubutumwa bwo Gutegura Lesson Plans",
                    desc: "Kukuburira mugitondo n'ikigoroba gutegura amasomo yawe hakiri kare."
                  },
                  {
                    key: 'rebBooksAlerts' as keyof ElimuAppSettings,
                    title: "Ibitabo bya REB CBC & Schemes of Work",
                    desc: "Ubutumwa bwerekeye ibitabo 1,806 n'amapaji ya REB y'ubuntu."
                  },
                  {
                    key: 'questionBankAlerts' as keyof ElimuAppSettings,
                    title: "Question Bank & Ibizamini bya CBC",
                    desc: "Kukumenyesha ibibazo 3,200+ n'isuzumabumenyi ry'abanyeshuri."
                  },
                  {
                    key: 'converterAlerts' as keyof ElimuAppSettings,
                    title: "Universal Document Converter Suggestions",
                    desc: "Inama zo guhindura PDF muri Word cyangwa amashusho muri PDF."
                  },
                  {
                    key: 'soundEnabled' as keyof ElimuAppSettings,
                    title: "Amajwi n'Imiyeganyego (Chime & Audio)",
                    desc: "Kumva ijwi ry'ubujyanama mu gihe ubutumwa bugeze kuri ecran."
                  },
                  {
                    key: 'fileWatcherEnabled' as keyof ElimuAppSettings,
                    title: "Intelligent File Scanner",
                    desc: "Kugenzura inyandiko nshya zishobora guhindurwa mu bubiko bwawe."
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleSetting(item.key)}
                      className="cursor-pointer shrink-0 transition"
                    >
                      {settings[item.key] ? (
                        <div className="w-11 h-6 rounded-full bg-emerald-500 p-0.5 flex items-center justify-end shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </div>
                      ) : (
                        <div className="w-11 h-6 rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 flex items-center justify-start">
                          <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL & PRIVACY POLICIES */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Amategeko, Politiki n'Uburenganzira bwa Mwarimu
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kanda kuri buri gice urebe amategeko yose mu buryo bwa popup ako kanya.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => onOpenLegalPolicy('privacy')}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition flex items-center justify-between cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Politiki y'Ubuzima Bwite (Privacy Policy)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Uburyo amakuru yawe arindwa n'uko nta kigo kibona inyandiko zawe.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenLegalPolicy('terms')}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition flex items-center justify-between cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Amabwiriza y'Imikoreshereze (Terms of Use)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Amategeko agenga ikoreshwa rya serivisi z'ubuntu n'ibitabo bya REB.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenLegalPolicy('sovereignty')}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition flex items-center justify-between cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Umutekano w'Uburezi (Educator Data Sovereignty)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ubwigenge bwa mwarimu no kutagira amakuru ajya ku maseriveri y'amahanga.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-500">
            Elimu Smart Notification System • Sovereign Tech
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-xs transition cursor-pointer shadow-md"
          >
            Funga (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
