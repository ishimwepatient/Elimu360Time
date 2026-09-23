import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  FileText, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Download, 
  Send,
  Sparkles
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

export const ParentPortal: React.FC = () => {
  const { 
    activeSchool, 
    currentUser, 
    students, 
    getStudentFeeLedger, 
    getStudentReportCard,
    triggerConfetti 
  } = useElimu();

  // Child for parent: Default to Keza Mugisha (STU-2026-001)
  const [selectedChildId, setSelectedChildId] = useState<string>(students[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [sentMessageSuccess, setSentMessageSuccess] = useState(false);

  const child = students.find(s => s.id === selectedChildId) || students[0];
  const feeLedger = getStudentFeeLedger(child.id);
  const reportCard = getStudentReportCard(child.id, activeSchool.active_term);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentMessageSuccess(true);
    triggerConfetti();
    setTimeout(() => {
      setSentMessageSuccess(false);
      setMessageText('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Guardian Engagement · Section 02 [01]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Parent & Guardian 360 Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of academic performance, fee statements, attendance, and two-way teacher messaging.
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase">Active Child:</span>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none"
          >
            {students.slice(0, 3).map(st => (
              <option key={st.id} value={st.id}>{st.first_name} {st.last_name} ({st.class_name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Child Overview Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={child.photo_url} 
            alt={child.first_name} 
            className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{child.first_name} {child.last_name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                {child.registration_number}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Class: <strong className="text-white">{child.class_name}</strong> · {child.boarding_status === 'BOARDING' ? 'Boarding Student (Alpha Hall)' : 'Day Scholar'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>Term: <strong className="text-white">{activeSchool.active_term} {activeSchool.active_academic_year}</strong></span>
              <span>·</span>
              <span>Attendance: <strong className="text-emerald-400 font-mono">{reportCard.attendancePercentage}%</strong></span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Term Fee Status</div>
          <div className={`text-2xl font-black font-mono ${feeLedger.isCleared ? 'text-emerald-400' : 'text-amber-400'}`}>
            {feeLedger.isCleared ? 'CLEARED' : `RWF ${feeLedger.outstandingBalance.toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-400">
            Expected: RWF {feeLedger.totalExpected.toLocaleString()} · Paid: RWF {feeLedger.totalPaid.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Grid: Academic Transcript + Direct Teacher Messenger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Academic Performance & Marks */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Term Academic Summary ({activeSchool.active_term})</span>
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Class Rank: #{reportCard.classRank} of {reportCard.totalStudentsInClass}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-2 text-center">Score</th>
                    <th className="py-2 px-2 text-center">Assessed Max</th>
                    <th className="py-2 px-2 text-center font-bold text-white">Percentage</th>
                    <th className="py-2 px-2 text-center">Grade</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {reportCard.subjectGrades.map((sg, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">
                        <div>{sg.subject.name}</div>
                        {sg.assessments && sg.assessments.length > 0 && (
                          <div className="text-[10px] text-slate-500 font-normal font-sans flex flex-wrap gap-1 mt-0.5">
                            {sg.assessments.map((a, aIdx) => (
                              <span key={aIdx} className="bg-slate-800/80 px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-400">
                                {a.assessment_type}: {a.marks}/{a.max_marks}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-200">{sg.totalMarks}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400">/{sg.totalMaxMarks}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-400">{sg.percentage}%</td>
                      <td className="py-2.5 px-2 text-center font-bold text-blue-400">{sg.gradeLetter}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">{sg.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Overall Average: <strong className="text-white font-mono text-sm">{reportCard.overallAveragePercentage}%</strong>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report PDF</span>
              </button>
            </div>
          </div>

          {/* Fee Payment History */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Verified Fee Receipts for {child.first_name}</span>
            </h3>

            <div className="space-y-2">
              {feeLedger.payments.map(p => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold font-mono text-emerald-400">{p.receipt_number}</div>
                    <div className="text-[11px] text-slate-400">{p.fee_category} via {p.payment_method} · Ref: {p.transaction_reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">RWF {p.amount_paid.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">{p.payment_date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Direct Teacher Chat & SMS Notification */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span>Message Class Teacher</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="font-semibold text-white">Mr. Jean-Luc Ndayisaba</div>
              <div className="text-[11px] text-slate-400">Class Teacher · Senior 4 PCM</div>
            </div>

            {sentMessageSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Message dispatched securely to teacher&apos;s portal & SMS alert sent!</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Inquire about child's progress, homework, or upcoming exams..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Inquiry</span>
              </button>
            </form>
          </div>

          {/* Quick Support / Emergency Call */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-3">
            <div className="font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>School Administration Helpline</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              For urgent inquiries regarding boarding, health, or transport:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-blue-300 text-xs flex items-center justify-between">
              <span>Bursar Hotline:</span>
              <span className="font-bold">{activeSchool.phone}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
