import React from 'react';
import { 
  Building, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  Layers, 
  Building2, 
  ChevronRight, 
  Receipt, 
  Tag, 
  Smartphone, 
  Download, 
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { FeeCategory, FeeStructure } from '../../types';

interface FinancialOverviewTabProps {
  selectedAcademicYear: string;
  selectedTermFilter: string;
  projectionFollowsTerm1: boolean;
  setProjectionFollowsTerm1: (val: boolean) => void;
  totalExpenseSum: number;
  expensesCount: number;
  onNavigateSubTab: (subTab: any) => void;
  onOpenPaymentModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenFeeItemModal: () => void;
  onSelectClassFilter?: (className: string) => void;
}

export const FinancialOverviewTab: React.FC<FinancialOverviewTabProps> = ({
  selectedAcademicYear,
  selectedTermFilter,
  projectionFollowsTerm1,
  setProjectionFollowsTerm1,
  totalExpenseSum,
  expensesCount,
  onNavigateSubTab,
  onOpenPaymentModal,
  onOpenExpenseModal,
  onOpenFeeItemModal,
  onSelectClassFilter
}) => {
  const { 
    activeSchool, 
    students, 
    classes, 
    feeStructures, 
    payments, 
    getStudentFeeLedger, 
    getSchoolFinancialSummary 
  } = useElimu();

  // Active School Students
  const schoolStudents = students.filter(s => s.school_id === activeSchool.id && s.status === 'ACTIVE');
  const schoolClasses = classes.filter(c => c.school_id === activeSchool.id);
  const schoolFeeStructures = feeStructures.filter(f => f.school_id === activeSchool.id && f.status !== 'ARCHIVED');

  // School-Wide Summary
  const summary = getSchoolFinancialSummary({ academic_year: selectedAcademicYear, term: selectedTermFilter });
  const netOperatingPos = summary.totalCollectedRevenue - totalExpenseSum;

  // =========================================================================
  // DYNAMIC LEVEL-BY-LEVEL BREAKDOWN
  // Group classes by distinct education level
  // =========================================================================
  const distinctLevels = Array.from(new Set(schoolClasses.map(c => c.level_name || c.level || 'General Education')));
  
  const levelBreakdown = distinctLevels.map(lvl => {
    const lvlClasses = schoolClasses.filter(c => (c.level_name || c.level || 'General Education') === lvl);
    const lvlStudents = schoolStudents.filter(s => lvlClasses.some(c => c.id === s.class_id || c.name === s.class_name));
    
    let expected = 0;
    lvlStudents.forEach(s => {
      const ledger = getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter });
      expected += ledger.totalExpected;
    });

    const collected = payments
      .filter(p => {
        if (p.school_id !== activeSchool.id) return false;
        if (p.academic_year && p.academic_year !== selectedAcademicYear) return false;
        if (selectedTermFilter !== 'Full Year' && p.term && p.term !== selectedTermFilter) return false;
        return lvlStudents.some(s => s.id === p.student_id);
      })
      .reduce((sum, p) => sum + p.amount_paid, 0);

    const outstanding = Math.max(0, expected - collected);
    const rate = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

    return {
      levelName: lvl,
      studentsCount: lvlStudents.length,
      expected,
      collected,
      outstanding,
      clearanceRate: rate
    };
  });

  // =========================================================================
  // DYNAMIC CLASS-BY-CLASS DETAILED BREAKDOWN
  // =========================================================================
  const classBreakdown = schoolClasses.map(cls => {
    const clsStudents = schoolStudents.filter(s => s.class_id === cls.id || s.class_name === cls.name);
    
    let expected = 0;
    clsStudents.forEach(s => {
      const ledger = getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter });
      expected += ledger.totalExpected;
    });

    const collected = payments
      .filter(p => {
        if (p.school_id !== activeSchool.id) return false;
        if (p.academic_year && p.academic_year !== selectedAcademicYear) return false;
        if (selectedTermFilter !== 'Full Year' && p.term && p.term !== selectedTermFilter) return false;
        return clsStudents.some(s => s.id === p.student_id);
      })
      .reduce((sum, p) => sum + p.amount_paid, 0);

    const outstanding = Math.max(0, expected - collected);
    const rate = expected > 0 ? Math.min(100, (collected / expected) * 100).toFixed(1) : '0.0';
    const baseFeePerStudent = clsStudents.length > 0 ? Math.round(expected / clsStudents.length) : 0;

    return {
      id: cls.id,
      name: cls.name,
      level: cls.level_name || cls.level || 'General',
      studentsCount: clsStudents.length,
      baseFeePerStudent,
      expected,
      collected,
      outstanding,
      ratePercent: Number(rate)
    };
  });

  // =========================================================================
  // DYNAMIC CATEGORY-BY-CATEGORY BREAKDOWN (NO HARCODED MULTIPLIERS)
  // =========================================================================
  const categories: { cat: FeeCategory; label: string }[] = [
    { cat: 'TUITION', label: 'Core Academic Tuition' },
    { cat: 'BOARDING', label: 'Boarding & Catering Fees' },
    { cat: 'ACTIVITY', label: 'Lab & Science Activity Fees' },
    { cat: 'UNIFORM', label: 'Uniform & Student Supplies' },
    { cat: 'EXAMINATION', label: 'National Exam Registration' },
    { cat: 'LIBRARY', label: 'Library & Subscriptions' },
    { cat: 'OTHER', label: 'Other School Fees' },
  ];

  const categoryBreakdown = categories.map(({ cat, label }) => {
    // Sum target from active fee structures for this category across active students
    let target = 0;
    schoolStudents.forEach(st => {
      const ledger = getStudentFeeLedger(st.id, { academic_year: selectedAcademicYear, term: selectedTermFilter });
      const item = ledger.expectedFees.find(b => b.category === cat);
      if (item) {
        target += item.amount;
      }
    });

    // Sum actual collections for this category
    const collected = payments
      .filter(p => {
        if (p.school_id !== activeSchool.id) return false;
        if (p.fee_category !== cat) return false;
        if (p.academic_year && p.academic_year !== selectedAcademicYear) return false;
        if (selectedTermFilter !== 'Full Year' && p.term && p.term !== selectedTermFilter) return false;
        return true;
      })
      .reduce((sum, p) => sum + p.amount_paid, 0);

    const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

    return {
      cat,
      label,
      target,
      collected,
      pct
    };
  }).filter(c => c.target > 0 || c.collected > 0);

  // Term Revenue Projections
  const term1TargetRevenue = summary.totalTargetRevenue;
  const term2TargetRevenue = projectionFollowsTerm1 ? term1TargetRevenue : Math.round(term1TargetRevenue * 0.95);
  const term3TargetRevenue = projectionFollowsTerm1 ? term1TargetRevenue : Math.round(term1TargetRevenue * 0.90);
  const fullYearTargetRevenue = term1TargetRevenue + term2TargetRevenue + term3TargetRevenue;

  const exportOverviewCSV = () => {
    const rows = [
      ['Elimu360 Institutional Financial Overview', activeSchool.name, `Academic Year: ${selectedAcademicYear}`, `Term: ${selectedTermFilter}`],
      [],
      ['INSTITUTIONAL TOTALS'],
      ['Total Target Expected Fee Revenue', `RWF ${summary.totalTargetRevenue.toLocaleString()}`],
      ['Total Fee Revenue Collected', `RWF ${summary.totalCollectedRevenue.toLocaleString()}`],
      ['Total Outstanding Fee Arrears', `RWF ${summary.outstandingTotal.toLocaleString()}`],
      ['Verified Collection Rate', `${summary.collectionRatePercent}%`],
      ['Total Operating Expenses', `RWF ${totalExpenseSum.toLocaleString()}`],
      ['Net Operating Cash Surplus / (Deficit)', `RWF ${netOperatingPos.toLocaleString()}`],
      [],
      ['LEVEL-BY-LEVEL EXPECTED BREAKDOWN'],
      ['Education Level', 'Active Enrolled Students', 'Target Expected Revenue (RWF)', 'Collected Revenue (RWF)', 'Outstanding Arrears (RWF)', 'Clearance Rate (%)'],
      ...levelBreakdown.map(l => [l.levelName, l.studentsCount.toString(), l.expected.toString(), l.collected.toString(), l.outstanding.toString(), `${l.clearanceRate}%`]),
      [],
      ['CLASS-BY-CLASS EXPECTED BREAKDOWN'],
      ['Class Name', 'Level', 'Enrolled Students', 'Base Fee / Student (RWF)', 'Target Revenue (RWF)', 'Collected (RWF)', 'Outstanding Arrears (RWF)', 'Clearance (%)'],
      ...classBreakdown.map(c => [c.name, c.level, c.studentsCount.toString(), c.baseFeePerStudent.toString(), c.expected.toString(), c.collected.toString(), c.outstanding.toString(), `${c.ratePercent}%`]),
      [],
      ['3-TERM PROJECTIONS'],
      ['Term 1 Target', `RWF ${term1TargetRevenue.toLocaleString()}`],
      ['Term 2 Projected Target', `RWF ${term2TargetRevenue.toLocaleString()}`],
      ['Term 3 Projected Target', `RWF ${term3TargetRevenue.toLocaleString()}`],
      ['Full Academic Year Projected Total', `RWF ${fullYearTargetRevenue.toLocaleString()}`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Overview_${activeSchool.code}_${selectedAcademicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          LEVEL-BY-LEVEL EXPECTED SUMMARY CARDS
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Revenue Expected by Education Level ({activeSchool.active_term})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {schoolStudents.length} Active Students Enrolled
          </span>
        </div>

        {levelBreakdown.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No education levels configured. Configure classes and fee items to see level breakdown.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {levelBreakdown.map((lvl, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{lvl.levelName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {lvl.studentsCount} Students
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Target:</span>
                    <strong className="text-white font-mono">RWF {lvl.expected.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Collected to Date:</span>
                    <strong className="text-emerald-400 font-mono">RWF {lvl.collected.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Outstanding Balance:</span>
                    <strong className="text-amber-400 font-mono">RWF {lvl.outstanding.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Clearance Rate</span>
                    <span className="font-mono font-bold text-emerald-400">{lvl.clearanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${lvl.clearanceRate}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          CLASS-BY-CLASS DETAILED EXPECTED REVENUE LEDGER
          ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Class-by-Class Expected Revenue & Collection Registry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact expected target revenue computed per enrolled student in each specific class.
            </p>
          </div>

          <button
            onClick={exportOverviewCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Class Breakdown (CSV)</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Class Name</th>
                  <th className="py-3 px-4">Education Level</th>
                  <th className="py-3 px-4 text-center">Enrolled</th>
                  <th className="py-3 px-4">Base Fee / Student</th>
                  <th className="py-3 px-4">Total Expected (RWF)</th>
                  <th className="py-3 px-4">Total Collected (RWF)</th>
                  <th className="py-3 px-4">Outstanding (RWF)</th>
                  <th className="py-3 px-4">Clearance</th>
                  <th className="py-3 px-4 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classBreakdown.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      {cls.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {cls.level}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-200">
                      {cls.studentsCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      RWF {cls.baseFeePerStudent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      RWF {cls.expected.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      RWF {cls.collected.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      RWF {cls.outstanding.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full ${cls.ratePercent >= 100 ? 'bg-emerald-400' : cls.ratePercent > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${Math.min(100, cls.ratePercent)}%` }} 
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300 font-semibold">{cls.ratePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectClassFilter?.(cls.name);
                          onNavigateSubTab('STATEMENTS');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                      >
                        View Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CATEGORY BREAKDOWN & QUICK ACTIONS GRID
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Real Fee Category Collections ({activeSchool.active_term})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {categoryBreakdown.length} Active Fee Categories
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No fee categories configured yet. Click &apos;Configure Fee Structure&apos; to add fees.
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">{item.label}</span>
                    <span className="font-mono text-slate-200">
                      RWF {item.collected.toLocaleString()} / <span className="text-slate-400">RWF {item.target.toLocaleString()}</span> ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.pct}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Provider Integrations Active: <strong className="text-white">MTN MoMo, Airtel Money, BK SchoolPay, Cash at Counter</strong>
            </div>
            <button
              onClick={() => onNavigateSubTab('REGISTER')}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Payment History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Financial Actions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm">Quick Financial Operations</h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={onOpenPaymentModal}
              className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/80 text-left transition text-xs font-bold text-emerald-300 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Register Student Fee Payment</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExpenseModal}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition text-xs font-bold text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-rose-400" />
                <span>Record Vendor Expense (RRA EBM)</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenFeeItemModal}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition text-xs font-bold text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" />
                <span>Configure Fee Structure</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateSubTab('DEBTORS')}
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 text-left transition text-xs font-bold text-rose-300 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>Dispatch Batch SMS Fee Notices</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={exportOverviewCSV}
              className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 hover:bg-blue-900/80 text-left transition text-xs font-bold text-blue-300 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export Financial Overview (CSV)</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MULTI-TERM ACADEMIC YEAR REVENUE PROJECTION MODULE
          ========================================================================= */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>3-Term & Annual Financial Revenue Projections ({selectedAcademicYear})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Anticipated revenue calculated across all 3 terms based on school fee structures and student enrollments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={projectionFollowsTerm1}
                onChange={(e) => setProjectionFollowsTerm1(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Project Term 2 & 3 based on Term 1 Schedule</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Term 1 Target</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              RWF {term1TargetRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Collected: RWF {summary.totalCollectedRevenue.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Term 2 Projected Target</span>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Term 2</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              RWF {term2TargetRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              {projectionFollowsTerm1 ? 'Matches Term 1 Schedule' : 'Adjusted Projected Target'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Term 3 Projected Target</span>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">Term 3</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              RWF {term3TargetRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              {projectionFollowsTerm1 ? 'Matches Term 1 Schedule' : 'Adjusted Projected Target'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/80 bg-emerald-950/20 space-y-1">
            <div className="text-xs text-emerald-300 font-bold flex items-center justify-between">
              <span>Full Year Cumulative Target</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              RWF {fullYearTargetRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-300">
              Annual Revenue Base across all 3 terms
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
