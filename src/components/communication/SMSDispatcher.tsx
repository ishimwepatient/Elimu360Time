import React, { useState } from 'react';
import { 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  RotateCcw, 
  Sparkles, 
  History, 
  Layers, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { NotificationLog } from '../../types';

export const SMSDispatcher: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    students, 
    notifications, 
    sendBulkSMSAlert,
    triggerConfetti 
  } = useElimu();

  const [targetAudience, setTargetAudience] = useState<'ALL_GUARDIANS' | 'FEE_DEFAULTERS' | 'BOARDING_PARENTS' | 'CUSTOM'>('ALL_GUARDIANS');
  const [triggerType, setTriggerType] = useState<NotificationLog['trigger']>('ANNOUNCEMENT');
  const [messageTemplate, setMessageTemplate] = useState(
    `Elimu360 Announcement [${activeSchool.code}]: Dear Guardian, please be reminded that mid-term parent-teacher consultations are scheduled for this Friday at 2:00 PM.`
  );
  const [customPhone, setCustomPhone] = useState('+250 788 123 456');
  const [customName, setCustomName] = useState('Valued Guardian');
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  // Template Quick Insertions
  const templates = [
    {
      title: 'Fee Reminder Notice',
      type: 'FEE_REMINDER' as NotificationLog['trigger'],
      text: `Elimu360 Fee Notice [${activeSchool.code}]: Dear Guardian, please settle outstanding Term 2 tuition balance via MTN MoMo code 049182 or Bank of Kigali.`
    },
    {
      title: 'Academic Report Cards Ready',
      type: 'REPORT_CARD_PUBLISHED' as NotificationLog['trigger'],
      text: `Elimu360 Academic Alert [${activeSchool.code}]: Term 2 terminal report cards have been published. Log in to the Parent Portal or visit the DOS office.`
    },
    {
      title: 'Discipline Incident Alert',
      type: 'DISCIPLINE_ALERT' as NotificationLog['trigger'],
      text: `Elimu360 Discipline Notice [${activeSchool.code}]: A student conduct record has been logged. Please contact the Dean of Discipline at your earliest convenience.`
    },
  ];

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    let recipients: { name: string; phone: string }[] = [];

    if (targetAudience === 'ALL_GUARDIANS') {
      recipients = students.map(s => ({ name: s.guardian_name, phone: s.guardian_phone }));
    } else if (targetAudience === 'FEE_DEFAULTERS') {
      recipients = students.slice(0, 3).map(s => ({ name: s.guardian_name, phone: s.guardian_phone }));
    } else if (targetAudience === 'BOARDING_PARENTS') {
      recipients = students.filter(s => s.boarding_status === 'BOARDING').map(s => ({ name: s.guardian_name, phone: s.guardian_phone }));
    } else {
      recipients = [{ name: customName, phone: customPhone }];
    }

    const res = sendBulkSMSAlert(recipients, messageTemplate, triggerType);
    if (res.sentCount > 0) {
      triggerConfetti();
      setDispatchResult(`Successfully dispatched ${res.sentCount} SMS messages directly to parents across active multi-carrier networks.`);
      setTimeout(() => setDispatchResult(null), 5000);
    } else {
      alert("Messaging Dispatch encountered a system delay. Please retry.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Telecommunications Engine · Section 05 [03]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Elimu360 Institutional Messaging Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-carrier SMS broadcast (MTN, Airtel) for fee receipts, emergency notices, and attendance alerts.
          </p>
        </div>

        {/* System Managed Funded Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-right">
            <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Managed Messaging</span>
            </div>
            <div className="text-sm font-black text-white font-display mt-0.5">
              100% Funded & Operational
            </div>
            <div className="text-[10px] text-emerald-300/80">Unlimited Institutional Gateway Coverage</div>
          </div>
        </div>
      </div>

      {dispatchResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-300 flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{dispatchResult}</span>
        </div>
      )}

      {/* Grid: Dispatch Form + Quick Templates + Dispatch History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form & Templates */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Template Selector */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quick Pre-Approved Rwanda MoE Templates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMessageTemplate(tpl.text);
                    setTriggerType(tpl.type);
                  }}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left transition cursor-pointer"
                >
                  <div className="font-bold text-white text-xs">{tpl.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tpl.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Compose Box */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-400" />
              <span>Compose Broadcast Dispatch</span>
            </h3>

            <form onSubmit={handleSendSMS} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Target Audience:</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL_GUARDIANS">All Enrolled Guardians ({students.length} Parents)</option>
                    <option value="FEE_DEFAULTERS">Fee Defaulters List (Pending Balance)</option>
                    <option value="BOARDING_PARENTS">Boarding House Guardians Only</option>
                    <option value="CUSTOM">Single Specific Mobile Number</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Notification Classification:</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ANNOUNCEMENT">General Announcement</option>
                    <option value="FEE_REMINDER">Fee Reminder Notice</option>
                    <option value="REPORT_CARD_PUBLISHED">Academic Report Card Release</option>
                    <option value="DISCIPLINE_ALERT">Disciplinary Alert</option>
                    <option value="ATTENDANCE_BREACH">Attendance Breach Alert</option>
                    <option value="PERMISSION_EXIT">Permission Exit Alert</option>
                  </select>
                </div>
              </div>

              {targetAudience === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Recipient Name:</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Mobile Number (with country code):</label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-slate-300">Message Content (SMS Payload):</label>
                  <span className="text-[10px] font-mono text-slate-400">{messageTemplate.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between text-[11px] text-blue-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>High-Priority Gateway Active across MTN & Airtel Networks</span>
                </div>
                <span className="font-bold text-amber-400">Sender ID: {activeSchool.code}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch SMS Broadcast</span>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right 1 Col: Live SMS Telemetry Log */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Carrier Telemetry Log</span>
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {notifications.map(n => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-blue-400 font-bold">{n.recipient_phone}</span>
                    <span className="text-emerald-400 font-semibold">{n.status}</span>
                  </div>
                  <div className="font-semibold text-white">{n.recipient_name}</div>
                  <p className="text-slate-400 text-[11px] leading-snug">{n.content}</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                    <span>Delivered</span>
                    <span>{n.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
