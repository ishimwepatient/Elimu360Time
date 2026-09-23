import React, { useState } from 'react';
import { 
  Layers, 
  Download, 
  Edit3, 
  Info, 
  CheckCircle2, 
  Building2, 
  Users, 
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { User } from '../../types';
import { parseCleanNumber } from '../../utils/numberUtils';

interface PayrollManagerProps {
  selectedAcademicYear: string;
  isPeriodClosed: boolean;
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({
  selectedAcademicYear,
  isPeriodClosed,
  onAuditLog
}) => {
  const { activeSchool, availableUsers, currentUser } = useElimu();

  // Bursar-configured base salary state
  const [staffSalaries, setStaffSalaries] = useState<Record<string, number>>({});

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editingSalaryAmount, setEditingSalaryAmount] = useState<number>(0);

  // School Staff Roster (Excludes District Registrars, Regional Coordinators, Parents, and Students)
  const schoolStaffUsers = availableUsers.filter(u => 
    u.role !== 'COORDINATOR' && 
    u.role !== 'REGISTER' && 
    u.role !== 'SUPER_ADMIN' && 
    u.role !== 'PARENT' && 
    u.role !== 'STUDENT'
  );

  // Rwandan Statutory Deductions Engine
  // 1. PAYE Tax (Rwanda Revenue Authority brackets):
  //    0 - 60,000 RWF -> 0%
  //    60,001 - 100,000 RWF -> 20%
  //    Above 100,000 RWF -> 30%
  // 2. RSSB Pension: 3% Employee, 5% Employer
  // 3. Maternity Leave Insurance: 0.3% Employee, 0.3% Employer
  const computePayroll = (user: User) => {
    const gross = staffSalaries[user.id] || 0;
    
    let paye = 0;
    if (gross > 100000) {
      paye = Math.round((100000 - 60000) * 0.20 + (gross - 100000) * 0.30);
    } else if (gross > 60000) {
      paye = Math.round((gross - 60000) * 0.20);
    }

    const rssbEmployee = Math.round(gross * 0.03);
    const rssbEmployer = Math.round(gross * 0.05);
    const maternityEmployee = Math.round(gross * 0.003);
    const maternityEmployer = Math.round(gross * 0.003);
    const netSalary = Math.max(0, gross - paye - rssbEmployee - maternityEmployee);

    return {
      gross,
      paye,
      rssbEmployee,
      rssbEmployer,
      maternityEmployee,
      maternityEmployer,
      netSalary,
      isConfigured: gross > 0
    };
  };

  const handleOpenSalaryModal = (staff: User) => {
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED. Unlock to edit staff salaries.");
      return;
    }
    setEditingStaff(staff);
    setEditingSalaryAmount(staffSalaries[staff.id] || 450000);
    setShowModal(true);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const cleanSalary = parseCleanNumber(editingSalaryAmount);

    setStaffSalaries(prev => ({
      ...prev,
      [editingStaff.id]: cleanSalary
    }));

    onAuditLog?.(
      'STAFF_SALARY_CONFIGURED',
      'StaffPayroll',
      editingStaff.id,
      `Bursar configured base gross salary of RWF ${cleanSalary.toLocaleString()} for ${editingStaff.name}`
    );

    setShowModal(false);
    setEditingStaff(null);
  };

  // Aggregates
  let totalGross = 0;
  let totalPAYE = 0;
  let totalRSSBEmployee = 0;
  let totalRSSBEmployer = 0;
  let totalMaternity = 0;
  let totalNet = 0;

  schoolStaffUsers.forEach(u => {
    const p = computePayroll(u);
    totalGross += p.gross;
    totalPAYE += p.paye;
    totalRSSBEmployee += p.rssbEmployee;
    totalRSSBEmployer += p.rssbEmployer;
    totalMaternity += (p.maternityEmployee + p.maternityEmployer);
    totalNet += p.netSalary;
  });

  const exportBankCSV = () => {
    const rows = [
      ['Staff Name', 'National ID / Title', 'Role', 'Bank Name', 'Account Number', 'Gross Base Salary (RWF)', 'PAYE Tax (RWF)', 'RSSB Employee 3% (RWF)', 'Maternity 0.3% (RWF)', 'Net Disbursal (RWF)'],
      ...schoolStaffUsers.map(u => {
        const p = computePayroll(u);
        return [
          u.name,
          u.title || u.email,
          u.role,
          (u as any).bank_name || 'Bank of Kigali (BK)',
          (u as any).bank_account || '00045-882910-01',
          p.gross.toString(),
          p.paye.toString(),
          p.rssbEmployee.toString(),
          p.maternityEmployee.toString(),
          p.netSalary.toString()
        ];
      }),
      [],
      ['PAYROLL TOTALS'],
      ['Total Gross Payroll', totalGross.toString()],
      ['Total PAYE Remittance to RRA', totalPAYE.toString()],
      ['Total RSSB Pension (Employee 3% + Employer 5%)', (totalRSSBEmployee + totalRSSBEmployer).toString()],
      ['Total Maternity Leave Fund (0.6%)', totalMaternity.toString()],
      ['Total Net Salary Disbursals', totalNet.toString()]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `School_Staff_Payroll_Bank_${activeSchool.code}_${selectedAcademicYear}.csv`);
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
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>School Staff Payroll & Rwandan Statutory Deductions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The school bursar sets and maintains employee salaries. The engine auto-computes PAYE, 3% RSSB Pension, 5% Employer, and 0.3% Maternity fund.
          </p>
        </div>

        <button
          onClick={exportBankCSV}
          disabled={totalGross === 0}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
        >
          <Download className="w-4 h-4" />
          <span>Export Bank Salary File (CSV)</span>
        </button>
      </div>

      {/* Institutional Decoupling Notice */}
      <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>National & District Governance Rule Enforced:</strong> District Registrars and Regional Coordinators operate at the district/national platform level and are strictly decoupled from individual school payroll registries.
        </span>
      </div>

      {/* Payroll KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Gross Monthly Payroll</div>
          <div className="text-xl font-bold text-white font-mono">
            RWF {totalGross.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">{schoolStaffUsers.length} School Staff Profiles</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">PAYE Tax Withheld</div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            RWF {totalPAYE.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">RRA Monthly Remittance</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">RSSB Pension (3% + 5%)</div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            RWF {(totalRSSBEmployee + totalRSSBEmployer).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Total RSSB Remittance</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/60 bg-emerald-950/20 space-y-1">
          <div className="text-xs text-emerald-300 font-bold">Total Net Salaries Payable</div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            RWF {totalNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300">Total Net Bank Disbursal</div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Bank & Account</th>
                <th className="py-3.5 px-4">Gross Salary (RWF)</th>
                <th className="py-3.5 px-4">PAYE Tax</th>
                <th className="py-3.5 px-4">RSSB (3%)</th>
                <th className="py-3.5 px-4 font-bold text-emerald-400">Net Salary (RWF)</th>
                <th className="py-3.5 px-4 text-right">Bursar Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {schoolStaffUsers.map((user) => {
                const pay = computePayroll(user);
                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {user.name}
                      <div className="text-[10px] text-slate-400 font-normal">{user.title || user.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <div className="text-white font-semibold">{(user as any).bank_name || 'Bank of Kigali (BK)'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{(user as any).bank_account || '00045-883920-01'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      {pay.isConfigured ? `RWF ${pay.gross.toLocaleString()}` : <span className="text-slate-500 font-normal text-[11px]">Not configured</span>}
                    </td>
                    <td className="py-3.5 px-4 text-rose-400">
                      {pay.isConfigured ? `RWF ${pay.paye.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400">
                      {pay.isConfigured ? `RWF ${pay.rssbEmployee.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      {pay.isConfigured ? `RWF ${pay.netSalary.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenSalaryModal(user)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{pay.isConfigured ? 'Edit Salary' : 'Set Base Salary'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: CONFIGURE BASE SALARY
          ========================================================================= */}
      {showModal && editingStaff && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Configure Employee Base Gross Salary</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400">Staff Member:</div>
                <div className="text-sm font-bold text-white">{editingStaff.name}</div>
                <div className="text-xs text-emerald-400 font-semibold">{editingStaff.role} ({editingStaff.email})</div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Monthly Gross Base Salary (RWF):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 100000"
                  value={editingSalaryAmount === 0 ? '' : editingSalaryAmount}
                  onChange={(e) => setEditingSalaryAmount(parseCleanNumber(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              {/* Instant Statutory Deduction Preview */}
              {editingSalaryAmount > 0 && (() => {
                const g = editingSalaryAmount;
                let p = 0;
                if (g > 100000) p = Math.round((100000 - 60000) * 0.20 + (g - 100000) * 0.30);
                else if (g > 60000) p = Math.round((g - 60000) * 0.20);
                const rEmpl = Math.round(g * 0.03);
                const rEmplr = Math.round(g * 0.05);
                const mEmpl = Math.round(g * 0.003);
                const net = Math.max(0, g - p - rEmpl - mEmpl);

                return (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-300">Instant Statutory Computation Breakdown:</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="text-slate-400">PAYE Tax (RRA): <strong className="text-rose-400">RWF {p.toLocaleString()}</strong></div>
                      <div className="text-slate-400">RSSB Employee (3%): <strong className="text-amber-400">RWF {rEmpl.toLocaleString()}</strong></div>
                      <div className="text-slate-400">RSSB Employer (5%): <strong className="text-amber-300">RWF {rEmplr.toLocaleString()}</strong></div>
                      <div className="text-slate-400">Maternity (0.3%): <strong className="text-blue-300">RWF {mEmpl.toLocaleString()}</strong></div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                      <span className="text-emerald-300">Net Monthly Salary Payable:</span>
                      <span className="text-emerald-400 font-mono text-sm">RWF {net.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

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
                  Save Salary Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
