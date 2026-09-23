import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  HeartHandshake, 
  X,
  FileCheck
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { parseCleanNumber } from '../../utils/numberUtils';

export interface DiscountReliefRecord {
  id: string;
  student_id: string;
  student_name: string;
  category: 'UBUDEHE_EXEMPTION' | 'ACADEMIC_SCHOLARSHIP' | 'STAFF_CHILD' | 'SPORTS_GRANT' | 'SPECIAL_HARDSHIP';
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: number;
  calculated_rwf: number;
  reason_code: string;
  approved_by: string;
  status: 'ACTIVE' | 'REVOKED';
  created_at: string;
}

interface ReliefAndBursaryManagerProps {
  reliefs: DiscountReliefRecord[];
  setReliefs: React.Dispatch<React.SetStateAction<DiscountReliefRecord[]>>;
  selectedAcademicYear: string;
  isPeriodClosed: boolean;
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const ReliefAndBursaryManager: React.FC<ReliefAndBursaryManagerProps> = ({
  reliefs,
  setReliefs,
  selectedAcademicYear,
  isPeriodClosed,
  onAuditLog
}) => {
  const { activeSchool, students, currentUser } = useElimu();
  const [showModal, setShowModal] = useState(false);

  const schoolStudents = students.filter(s => s.school_id === activeSchool.id && s.status === 'ACTIVE');

  // Form State
  const [reliefStudentId, setReliefStudentId] = useState(schoolStudents[0]?.id || '');
  const [reliefCategory, setReliefCategory] = useState<DiscountReliefRecord['category']>('UBUDEHE_EXEMPTION');
  const [reliefValue, setReliefValue] = useState<number>(50000);
  const [reliefReason, setReliefReason] = useState('UBUDEHE_CATEGORY_1_CERTIFICATE');

  const handleAddRelief = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }

    const student = schoolStudents.find(s => s.id === reliefStudentId);
    if (!student) {
      alert("Please select a valid student.");
      return;
    }

    const cleanAmt = parseCleanNumber(reliefValue);
    if (cleanAmt <= 0) {
      alert("Please specify a valid relief amount greater than 0 RWF.");
      return;
    }

    const newRelief: DiscountReliefRecord = {
      id: `REL-${Date.now()}`,
      student_id: reliefStudentId,
      student_name: `${student.first_name} ${student.last_name}`,
      category: reliefCategory,
      type: 'FIXED_AMOUNT',
      value: cleanAmt,
      calculated_rwf: cleanAmt,
      reason_code: reliefReason,
      approved_by: currentUser.name,
      status: 'ACTIVE',
      created_at: new Date().toISOString().substring(0, 10)
    };

    setReliefs(prev => [newRelief, ...prev]);
    onAuditLog?.(
      'DISCOUNT_BURSARY_APPLIED',
      'DiscountRelief',
      newRelief.id,
      `Bursar granted fee relief of RWF ${cleanAmt.toLocaleString()} (${reliefCategory}) to ${newRelief.student_name}`
    );
    setShowModal(false);
  };

  const handleDeleteRelief = (id: string, name: string) => {
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }
    if (confirm(`Revoke and delete fee relief for ${name}?`)) {
      setReliefs(prev => prev.filter(r => r.id !== id));
      onAuditLog?.('DISCOUNT_RELIEF_REVOKED', 'DiscountRelief', id, `Revoked fee relief for ${name}`);
    }
  };

  const totalReliefAmount = reliefs.reduce((sum, r) => sum + r.calculated_rwf, 0);

  const exportCSV = () => {
    const rows = [
      ['Student Name', 'Category', 'Relief Amount (RWF)', 'Reason / Certificate Ref', 'Approved By', 'Date', 'Status'],
      ...reliefs.map(r => [
        r.student_name,
        r.category,
        r.calculated_rwf.toString(),
        r.reason_code,
        r.approved_by,
        r.created_at,
        r.status
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Fee_Reliefs_${activeSchool.code}_${selectedAcademicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Ubudehe Exemptions, Scholarships & Fee Reliefs</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Administer institutional tuition waivers, national social protection (Ubudehe) discounts, and hardship concessions.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportCSV}
            disabled={reliefs.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Student Relief</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Fee Relief Granted</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            RWF {totalReliefAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">{reliefs.length} Beneficiaries</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Ubudehe Category 1/2 Waivers</div>
          <div className="text-xl font-bold text-white font-mono">
            {reliefs.filter(r => r.category === 'UBUDEHE_EXEMPTION').length} Students
          </div>
          <div className="text-[11px] text-slate-400">Social Protection Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Academic & Hardship Bursaries</div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            {reliefs.filter(r => r.category !== 'UBUDEHE_EXEMPTION').length} Students
          </div>
          <div className="text-[11px] text-slate-400">Institutional Grants</div>
        </div>
      </div>

      {/* Reliefs Table */}
      {reliefs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Fee Reliefs Granted</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click &apos;Apply Student Relief&apos; to register a verified scholarship or Ubudehe fee waiver.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Apply First Fee Relief</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student Beneficiary</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Reason / Verification Ref</th>
                  <th className="py-3.5 px-4 font-bold text-emerald-400">Relief Amount (RWF)</th>
                  <th className="py-3.5 px-4">Approved By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reliefs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {r.student_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {r.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {r.reason_code}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      - RWF {r.calculated_rwf.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {r.approved_by}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {r.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRelief(r.id, r.student_name)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition cursor-pointer border border-rose-900/50"
                        title="Revoke Relief"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APPLY RELIEF
          ========================================================================= */}
      {showModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Grant Student Fee Relief / Waiver</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRelief} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Student:</label>
                <select
                  value={reliefStudentId}
                  onChange={(e) => setReliefStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {schoolStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name} · {s.registration_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Relief Category:</label>
                <select
                  value={reliefCategory}
                  onChange={(e) => setReliefCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UBUDEHE_EXEMPTION">Ubudehe Category 1/2 Social Protection Waiver</option>
                  <option value="ACADEMIC_SCHOLARSHIP">Merit-Based Academic Scholarship</option>
                  <option value="STAFF_CHILD">School Staff Child Fee Concession</option>
                  <option value="SPORTS_GRANT">Sports / Extracurricular Talent Grant</option>
                  <option value="SPECIAL_HARDSHIP">Executive Headteacher Hardship Relief</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Relief Amount (RWF):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 100000"
                  value={reliefValue === 0 ? '' : reliefValue}
                  onChange={(e) => setReliefValue(parseCleanNumber(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Supporting Document / Certificate Reference:</label>
                <input
                  type="text"
                  placeholder="e.g. UBUDEHE-CAT1-2026-NKR-092"
                  value={reliefReason}
                  onChange={(e) => setReliefReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950"
                >
                  Grant Relief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
