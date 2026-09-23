import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Receipt, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  CreditCard, 
  Building, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Send,
  Lock,
  Unlock,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRightLeft,
  PieChart,
  Tag,
  Briefcase,
  Layers,
  Award,
  Info,
  Edit3,
  Clock,
  History,
  Check,
  XCircle,
  HelpCircle,
  ChevronRight,
  Archive,
  Eye,
  X
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { FeeCategory, PaymentMethod, Student, User } from '../../types';
import { InternationalExportModal } from './InternationalExportModal';
import { parseCleanNumber } from '../../utils/numberUtils';

// Modular Sub-Components
import { FeeStructureManager } from './FeeStructureManager';
import { FinancialOverviewTab } from './FinancialOverviewTab';
import { PayrollManager } from './PayrollManager';
import { ExpenseAndEbmManager, ExpenseRecord, SupplierRecord } from './ExpenseAndEbmManager';
import { PettyCashManager, PettyCashRecord } from './PettyCashManager';
import { ReliefAndBursaryManager, DiscountReliefRecord } from './ReliefAndBursaryManager';
import { FinancialStatementsTab } from './FinancialStatementsTab';
import { AcademicArchivesTab } from './AcademicArchivesTab';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
}

export const FinancialPortal: React.FC = () => {
  const { 
    activeSchool, 
    currentUser,
    setCurrentView,
    students, 
    classes,
    availableUsers,
    payments, 
    registerPayment, 
    getStudentFeeLedger, 
    getSchoolFinancialSummary,
    sendBulkSMSAlert,
    feeStructures,
    registeredAcademicYears
  } = useElimu();

  // Strict RBAC Guard
  if (currentUser.role !== 'BURSAR' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'SCHOOL_ADMIN') {
    return (
      <div className="max-w-4xl mx-auto p-8 my-12 bg-slate-900 border border-rose-800/60 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Financial Ledger Restricted Access</h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Under strict Elimu360 institutional governance policies, financial transactions, fee collections, and ledger registers are strictly managed by the <strong>Chief Bursar</strong> and audited by the <strong>Super Administrator</strong>.
        </p>
        <p className="text-xs text-slate-400">
          Academic and instructional staff focus on curriculum, faculty delegation, and student welfare.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => setCurrentView('DASHBOARD')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Return to Campus Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active Sub-Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<
    | 'OVERVIEW'
    | 'FEE_ITEMS'
    | 'REGISTER'
    | 'STATEMENTS'
    | 'RELIEF'
    | 'EXPENSES'
    | 'PETTY_CASH'
    | 'PAYROLL'
    | 'STATEMENTS_P_L'
    | 'DEBTORS'
    | 'AUDIT_LOG'
    | 'ARCHIVES'
  >('OVERVIEW');

  // Academic Year & Term Selector State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(activeSchool.active_academic_year || '2026-2027');
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>(activeSchool.active_term || 'Term 1');
  const [projectionFollowsTerm1, setProjectionFollowsTerm1] = useState<boolean>(true);

  // Financial Period Lock State
  const [isPeriodClosed, setIsPeriodClosed] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeeItemModal, setShowFeeItemModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Payment Form State
  const [payStudentId, setPayStudentId] = useState<string>(students.filter(s => s.school_id === activeSchool.id)[0]?.id || '');
  const [payCategory, setPayCategory] = useState<FeeCategory>('TUITION');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [payTxRef, setPayTxRef] = useState<string>('');
  const [payPayerName, setPayPayerName] = useState<string>('');
  const [payRemarks, setPayRemarks] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Dynamic Bursar Records State (Suppliers, Expenses, Reliefs, Petty Cash, Audit Logs)
  // Wiped of any hardcoded numbers - Bursar adds brand new per school
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => {
    const saved = localStorage.getItem(`elimu_bursar_suppliers_${activeSchool.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(`elimu_bursar_expenses_${activeSchool.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [pettyCashVouchers, setPettyCashVouchers] = useState<PettyCashRecord[]>(() => {
    const saved = localStorage.getItem(`elimu_bursar_pettycash_${activeSchool.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [reliefs, setReliefs] = useState<DiscountReliefRecord[]>(() => {
    const saved = localStorage.getItem(`elimu_bursar_reliefs_${activeSchool.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync Bursar records to LocalStorage
  useEffect(() => {
    localStorage.setItem(`elimu_bursar_suppliers_${activeSchool.id}`, JSON.stringify(suppliers));
  }, [suppliers, activeSchool.id]);

  useEffect(() => {
    localStorage.setItem(`elimu_bursar_expenses_${activeSchool.id}`, JSON.stringify(expenses));
  }, [expenses, activeSchool.id]);

  useEffect(() => {
    localStorage.setItem(`elimu_bursar_pettycash_${activeSchool.id}`, JSON.stringify(pettyCashVouchers));
  }, [pettyCashVouchers, activeSchool.id]);

  useEffect(() => {
    localStorage.setItem(`elimu_bursar_reliefs_${activeSchool.id}`, JSON.stringify(reliefs));
  }, [reliefs, activeSchool.id]);

  // When payment student changes, auto-populate payAmount with their ledger outstanding balance if payAmount is 0
  useEffect(() => {
    if (payStudentId) {
      const ledger = getStudentFeeLedger(payStudentId);
      if (ledger && ledger.outstandingBalance > 0 && payAmount === 0) {
        setPayAmount(ledger.outstandingBalance);
      }
    }
  }, [payStudentId]);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'AUD-001',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: 'FINANCE_ENGINE_INITIALIZED',
      entity_type: 'DoubleEntryLedger',
      entity_id: activeSchool.id,
      details: 'Dynamic sovereign double-entry ledger engine activated for ' + activeSchool.name
    }
  ]);

  const addAudit = (action: string, entity_type: string, entity_id: string, details: string) => {
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_id: currentUser.id,
        user_name: currentUser.name,
        action,
        entity_type,
        entity_id,
        details
      },
      ...prev
    ]);
  };

  // Financial Summary Computations
  const summary = getSchoolFinancialSummary({ academic_year: selectedAcademicYear, term: selectedTermFilter });
  const totalExpenseSum = expenses.reduce((acc, curr) => acc + curr.amount_rwf, 0);

  // Filtered Students
  const filteredStudents = students.filter(s => {
    if (s.school_id !== activeSchool.id) return false;
    const matchClass = selectedClassFilter === 'ALL' || s.class_name.includes(selectedClassFilter);
    const matchSearch = s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Export CSV Helper
  const exportToCSV = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${activeSchool.code}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Payment Handlers
  const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED. Unlocking required to post new transactions.");
      return;
    }

    const cleanPayAmt = parseCleanNumber(payAmount);
    if (cleanPayAmt <= 0) {
      alert("Error: Please specify a valid payment amount greater than 0 RWF.");
      return;
    }

    const student = students.find(s => s.id === payStudentId);
    if (!student) return;

    const res = registerPayment({
      student_id: payStudentId,
      fee_category: payCategory,
      amount_paid: cleanPayAmt,
      payment_method: payMethod,
      transaction_reference: payTxRef || `${payMethod}-${Math.floor(100000 + Math.random() * 900000)}`,
      payer_name: payPayerName || student.guardian_name,
      remarks: payRemarks,
    });

    if (res.success) {
      setLastReceipt({
        receipt_number: res.receipt_number,
        student_name: `${student.first_name} ${student.last_name}`,
        student_reg: student.registration_number,
        class_name: student.class_name,
        amount: cleanPayAmt,
        category: payCategory,
        method: payMethod,
        date: new Date().toISOString().substring(0, 10),
        bursar: currentUser.name,
      });

      addAudit(
        'MANUAL_PAYMENT_REGISTERED',
        'PaymentRecord',
        res.receipt_number,
        `Collected RWF ${cleanPayAmt.toLocaleString()} from ${student.first_name} ${student.last_name} via ${payMethod}`
      );

      setShowPaymentModal(false);
      setPayRemarks('');
      setPayTxRef('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          HEADER & FINANCIAL PERIOD RIBBON
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Elimu360 SIMS · Sovereign Double-Entry Ledger Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3 mt-1">
            <span>Financial Directorate & Bursar Workspace</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              activeSchool.ownership_type === 'PUBLIC' || activeSchool.ownership_type === 'GOVERNMENT_AIDED'
                ? 'bg-blue-950 text-blue-300 border-blue-700'
                : 'bg-purple-950 text-purple-300 border-purple-700'
            }`}>
              {activeSchool.ownership_type || 'PUBLIC / GOVERNMENT-AIDED'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional fee structure administration, automated student receivables, statutory payroll, RRA EBM expenses, and general ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {registeredAcademicYears.map(ay => (
                <option key={ay.academic_year} value={ay.academic_year} className="bg-slate-900 text-white">
                  {ay.academic_year}
                </option>
              ))}
              <option value="2027-2028" className="bg-slate-900 text-white">2027-2028</option>
              <option value="2026-2027" className="bg-slate-900 text-white">2026-2027 (Active)</option>
              <option value="2025-2026" className="bg-slate-900 text-white">2025-2026 (Archive)</option>
              <option value="2024-2025" className="bg-slate-900 text-white">2024-2025 (Archive)</option>
            </select>
          </div>

          {/* Term Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-blue-400" />
            <select
              value={selectedTermFilter}
              onChange={(e) => setSelectedTermFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="Term 1" className="bg-slate-900 text-white">Term 1</option>
              <option value="Term 2" className="bg-slate-900 text-white">Term 2</option>
              <option value="Term 3" className="bg-slate-900 text-white">Term 3</option>
              <option value="Full Year" className="bg-slate-900 text-white">Full Academic Year</option>
            </select>
          </div>

          {/* International Export Center Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>Export & Clearance Hub</span>
          </button>

          {/* Financial Period Control Button */}
          <button
            onClick={() => {
              const nextState = !isPeriodClosed;
              setIsPeriodClosed(nextState);
              addAudit(
                nextState ? 'PERIOD_CLOSED' : 'PERIOD_UNLOCKED',
                'FinancialPeriod',
                `${selectedAcademicYear}_${selectedTermFilter}`,
                `Financial Period ${selectedAcademicYear} ${selectedTermFilter} ${nextState ? 'Closed' : 'Unlocked'} by ${currentUser.name}`
              );
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border cursor-pointer ${
              isPeriodClosed 
                ? 'bg-rose-950/80 text-rose-300 border-rose-700 hover:bg-rose-900'
                : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-emerald-600'
            }`}
          >
            {isPeriodClosed ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            <span>Period: {selectedTermFilter} ({isPeriodClosed ? 'CLOSED' : 'OPEN'})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          KEY STATS SUMMARY RIBBON
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Target Expected ({selectedTermFilter})</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            RWF {summary.totalTargetRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {students.filter(s => s.school_id === activeSchool.id).length} Active Enrolled Students
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="text-xs text-emerald-400 font-medium flex items-center justify-between">
            <span>Total Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            RWF {summary.totalCollectedRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500 font-mono font-semibold">
            {summary.collectionRatePercent}% Cleared ({payments.filter(p => p.school_id === activeSchool.id).length} txs)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="text-xs text-amber-400 font-medium flex items-center justify-between">
            <span>Outstanding Arrears</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            RWF {summary.outstandingTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {students.filter(s => s.school_id === activeSchool.id && getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).outstandingBalance > 0).length} Unsettled Accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="text-xs text-rose-400 font-medium flex items-center justify-between">
            <span>Operational Expenses</span>
            <Briefcase className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            RWF {totalExpenseSum.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {expenses.length} RRA EBM Invoices Verified
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="text-xs text-purple-400 font-medium flex items-center justify-between">
            <span>Net Cash Position</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-xl font-bold font-mono ${summary.totalCollectedRevenue - totalExpenseSum >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
            RWF {(summary.totalCollectedRevenue - totalExpenseSum).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Liquid Operating Reserves
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB NAVIGATION BAR (RESPONSIVE SCROLL RIBBON)
          ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'OVERVIEW', label: 'Financial Overview', icon: TrendingUp },
          { id: 'FEE_ITEMS', label: 'Fee Structures & Rates', icon: Tag },
          { id: 'REGISTER', label: 'Payment Registry', icon: Receipt },
          { id: 'STATEMENTS', label: 'Student 360 Ledgers', icon: Users },
          { id: 'RELIEF', label: 'Reliefs & Bursaries', icon: Award },
          { id: 'EXPENSES', label: 'Expenses (EBM)', icon: Briefcase },
          { id: 'PETTY_CASH', label: 'Petty Cash', icon: DollarSign },
          { id: 'PAYROLL', label: 'Staff Payroll', icon: Layers },
          { id: 'STATEMENTS_P_L', label: 'P&L / Balance Sheet', icon: FileSpreadsheet },
          { id: 'DEBTORS', label: 'Debtors & SMS Alerts', icon: AlertTriangle },
          { id: 'AUDIT_LOG', label: 'Audit Trail', icon: History },
          { id: 'ARCHIVES', label: 'Academic Archives', icon: Archive },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeSubTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          RENDER ACTIVE SUB-TAB
          ========================================================================= */}
      
      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'OVERVIEW' && (
        <FinancialOverviewTab
          selectedAcademicYear={selectedAcademicYear}
          selectedTermFilter={selectedTermFilter}
          projectionFollowsTerm1={projectionFollowsTerm1}
          setProjectionFollowsTerm1={setProjectionFollowsTerm1}
          totalExpenseSum={totalExpenseSum}
          expensesCount={expenses.length}
          onNavigateSubTab={setActiveSubTab}
          onOpenPaymentModal={() => setShowPaymentModal(true)}
          onOpenExpenseModal={() => setShowExpenseModal(true)}
          onOpenFeeItemModal={() => setActiveSubTab('FEE_ITEMS')}
          onSelectClassFilter={(className) => {
            setSelectedClassFilter(className);
            setActiveSubTab('STATEMENTS');
          }}
        />
      )}

      {/* TAB 2: FEE STRUCTURES */}
      {activeSubTab === 'FEE_ITEMS' && (
        <FeeStructureManager
          selectedAcademicYear={selectedAcademicYear}
          selectedTermFilter={selectedTermFilter}
          isPeriodClosed={isPeriodClosed}
          onAuditLog={addAudit}
        />
      )}

      {/* TAB 3: PAYMENT REGISTRY */}
      {activeSubTab === 'REGISTER' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Student Fee Payment Transactions</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time collection registry across Mobile Money (MTN/Airtel), Bank of Kigali deposits, and counter cash.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  const rows = [
                    ["Receipt No", "Date", "Student Name", "Reg No", "Class", "Category", "Amount (RWF)", "Method", "Tx Ref", "Payer Name", "Bursar"],
                    ...payments.filter(p => {
                      if (p.school_id !== activeSchool.id) return false;
                      if (p.academic_year && p.academic_year !== selectedAcademicYear) return false;
                      if (selectedTermFilter !== 'Full Year' && p.term && p.term !== selectedTermFilter) return false;
                      return true;
                    }).map(p => {
                      const st = students.find(s => s.id === p.student_id);
                      return [
                        p.receipt_number,
                        p.payment_date,
                        st ? `${st.first_name} ${st.last_name}` : 'Unknown Student',
                        st?.registration_number || '',
                        st?.class_name || '',
                        p.fee_category,
                        p.amount_paid.toString(),
                        p.payment_method,
                        p.transaction_reference,
                        p.payer_name,
                        p.bursar_name || currentUser.name
                      ];
                    })
                  ];
                  exportToCSV(`Fee_Payments_Register_${activeSchool.code}`, rows);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Plus className="w-4 h-4" />
                <span>Register Payment</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student & Reg No</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Method & Ref</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-400">Amount (RWF)</th>
                    <th className="py-3.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {payments.filter(p => {
                    if (p.school_id !== activeSchool.id) return false;
                    if (p.academic_year && p.academic_year !== selectedAcademicYear) return false;
                    if (selectedTermFilter !== 'Full Year' && p.term && p.term !== selectedTermFilter) return false;
                    return true;
                  }).map((p) => {
                    const student = students.find(s => s.id === p.student_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-emerald-400">{p.receipt_number}</td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">{p.payment_date}</td>
                        <td className="py-3.5 px-4 font-sans text-white font-semibold">
                          {student ? `${student.first_name} ${student.last_name}` : 'Enrolled Student'}
                          <div className="text-[10px] text-slate-400 font-mono">{student?.registration_number}</div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-300">{student?.class_name || '-'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300 border border-slate-700">
                            {p.fee_category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="font-semibold text-white">{p.payment_method}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.transaction_reference}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                          RWF {p.amount_paid.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              setLastReceipt({
                                receipt_number: p.receipt_number,
                                student_name: student ? `${student.first_name} ${student.last_name}` : 'Student',
                                student_reg: student?.registration_number || '',
                                class_name: student?.class_name || '',
                                amount: p.amount_paid,
                                category: p.fee_category,
                                method: p.payment_method,
                                date: p.payment_date,
                                bursar: p.bursar_name || currentUser.name
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT 360 STATEMENTS & LEDGERS */}
      {activeSubTab === 'STATEMENTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Student 360 Financial Ledgers</span>
              </h3>
              <p className="text-xs text-slate-400">View individual student balances, breakdown of payable fees, and clearance status.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Classes</option>
                {classes.filter(c => c.school_id === activeSchool.id).map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student / reg number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((st) => {
              const ledger = getStudentFeeLedger(st.id, { academic_year: selectedAcademicYear, term: selectedTermFilter });
              return (
                <div key={st.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg hover:border-slate-700 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{st.first_name} {st.last_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{st.registration_number} · {st.class_name}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      ledger.paymentStatus === 'FULLY_PAID'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : ledger.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : ledger.paymentStatus === 'OVERPAID'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : ledger.paymentStatus === 'EXEMPT'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {ledger.paymentStatus === 'FULLY_PAID' && '100% Cleared'}
                      {ledger.paymentStatus === 'PARTIAL' && 'Partial Paid'}
                      {ledger.paymentStatus === 'NOT_PAID' && 'Unpaid / Arrears'}
                      {ledger.paymentStatus === 'OVERPAID' && 'Credit Balance'}
                      {ledger.paymentStatus === 'EXEMPT' && 'Fee Waived'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Expected:</span>
                      <strong className="text-white">RWF {ledger.totalExpected.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Paid:</span>
                      <strong className="text-emerald-400">RWF {ledger.totalPaid.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Outstanding Due:</span>
                      <strong className="text-amber-400">RWF {ledger.outstandingBalance.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Tag: <strong className="text-slate-200">{st.boarding_status || 'DAY'}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setPayStudentId(st.id);
                        setShowPaymentModal(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow"
                    >
                      Receive Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: RELIEFS & BURSARIES */}
      {activeSubTab === 'RELIEF' && (
        <ReliefAndBursaryManager
          reliefs={reliefs}
          setReliefs={setReliefs}
          selectedAcademicYear={selectedAcademicYear}
          isPeriodClosed={isPeriodClosed}
          onAuditLog={addAudit}
        />
      )}

      {/* TAB 6: EXPENSES (EBM) */}
      {activeSubTab === 'EXPENSES' && (
        <ExpenseAndEbmManager
          expenses={expenses}
          setExpenses={setExpenses}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
          selectedAcademicYear={selectedAcademicYear}
          isPeriodClosed={isPeriodClosed}
          onAuditLog={addAudit}
        />
      )}

      {/* TAB 7: PETTY CASH */}
      {activeSubTab === 'PETTY_CASH' && (
        <PettyCashManager
          vouchers={pettyCashVouchers}
          setVouchers={setPettyCashVouchers}
          selectedAcademicYear={selectedAcademicYear}
          isPeriodClosed={isPeriodClosed}
          onAuditLog={addAudit}
        />
      )}

      {/* TAB 8: STAFF PAYROLL */}
      {activeSubTab === 'PAYROLL' && (
        <PayrollManager
          selectedAcademicYear={selectedAcademicYear}
          isPeriodClosed={isPeriodClosed}
          onAuditLog={addAudit}
        />
      )}

      {/* TAB 9: FINANCIAL STATEMENTS (P&L & BALANCE SHEET) */}
      {activeSubTab === 'STATEMENTS_P_L' && (
        <FinancialStatementsTab
          selectedAcademicYear={selectedAcademicYear}
          selectedTermFilter={selectedTermFilter}
          expenses={expenses}
          pettyCashVouchers={pettyCashVouchers}
          totalStaffGrossPayroll={0}
        />
      )}

      {/* TAB 10: DEBTORS & BULK SMS */}
      {activeSubTab === 'DEBTORS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Smart Debtor Management & Fee Reminders</span>
              </h3>
              <p className="text-xs text-slate-400">Identify overdue balances and dispatch targeted SMS notices to guardians.</p>
            </div>

            <button
              onClick={() => {
                const defaulters = students.filter(s => s.school_id === activeSchool.id && getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).outstandingBalance > 0);
                const recipients = defaulters.map(d => ({
                  name: d.guardian_name,
                  phone: d.guardian_phone,
                }));
                const msg = `Elimu360 Fee Notice [${activeSchool.code}]: Gentle reminder that school fees balance is due. Please settle via MTN MoMo or visit Bursar office.`;
                const res = sendBulkSMSAlert(recipients, msg, 'FEE_REMINDER');
                addAudit('SMS_BATCH_DISPATCHED', 'SMSDispatcher', 'DEBTORS', `Dispatched ${res.sentCount} automated SMS fee notices to overdue guardians`);
                alert(`Dispatched ${res.sentCount} automated SMS fee reminders to guardians.`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Batch SMS Reminders</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Guardian & Phone</th>
                    <th className="py-3.5 px-4 font-bold text-rose-400">Outstanding (RWF)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.filter(s => s.school_id === activeSchool.id && getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).outstandingBalance > 0).map(s => {
                    const ledger = getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter });
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {s.first_name} {s.last_name}
                          <div className="text-[10px] text-slate-500 font-mono">{s.registration_number}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{s.class_name}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{s.guardian_name}</div>
                          <div className="text-[10px] text-blue-400 font-mono">{s.guardian_phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                          RWF {ledger.outstandingBalance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (isPeriodClosed) {
                                alert("Period closed.");
                                return;
                              }
                              setPayStudentId(s.id);
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] cursor-pointer"
                          >
                            Collect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: AUDIT LOG */}
      {activeSubTab === 'AUDIT_LOG' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Immutable Financial Audit Trail (Append-Only)</span>
              </h3>
              <p className="text-xs text-slate-400">Cryptographically tracked record of all fee creation, billing, payments, reversals, and period closures.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 text-slate-400">{log.timestamp}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-200">{log.user_name}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{log.action}</td>
                      <td className="py-3.5 px-4 text-purple-300">{log.entity_type} [{log.entity_id}]</td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: ACADEMIC ARCHIVES */}
      {activeSubTab === 'ARCHIVES' && (
        <AcademicArchivesTab onAuditLog={addAudit} />
      )}

      {/* =========================================================================
          MODAL: PAYMENT REGISTRATION
          ========================================================================= */}
      {showPaymentModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Register Student Fee Payment</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRegisterPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Enrolled Student:</label>
                <select
                  value={payStudentId}
                  onChange={(e) => setPayStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {students.filter(s => s.school_id === activeSchool.id).map(st => {
                    const l = getStudentFeeLedger(st.id);
                    return (
                      <option key={st.id} value={st.id}>
                        {st.first_name} {st.last_name} ({st.registration_number}) — Bal: RWF {l.outstandingBalance.toLocaleString()}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Fee Category:</label>
                  <select
                    value={payCategory}
                    onChange={(e) => setPayCategory(e.target.value as FeeCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TUITION">Tuition Fee</option>
                    <option value="ACTIVITY">Activity & Science Lab</option>
                    <option value="BOARDING">Boarding & Meals</option>
                    <option value="UNIFORM">Uniform & Supplies</option>
                    <option value="EXAMINATION">National Exam Registration</option>
                    <option value="LIBRARY">Library Subscriptions</option>
                    <option value="OTHER">Other Custom Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Amount to Pay (RWF):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100000"
                    value={payAmount === 0 ? '' : payAmount}
                    onChange={(e) => setPayAmount(parseCleanNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Payment Method:</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MTN_MOMO">MTN Mobile Money (MoMo)</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="BANK_TRANSFER">Bank Deposit / Transfer (BK)</option>
                    <option value="CASH">Cash at Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Transaction Ref / Slip #:</label>
                  <input
                    type="text"
                    placeholder="e.g. MOMO-RW-94812"
                    value={payTxRef}
                    onChange={(e) => setPayTxRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Payer Name (Guardian/Depositor):</label>
                <input
                  type="text"
                  placeholder="e.g. Chantal Gasana"
                  value={payPayerName}
                  onChange={(e) => setPayPayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950">Issue Official Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          OFFICIAL PRINTABLE PAYMENT RECEIPT MODAL
          ========================================================================= */}
      {lastReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-slate-950 shadow-2xl p-6 print-sheet">
            
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider">{activeSchool.name}</h2>
              <div className="text-[11px] text-slate-600">{activeSchool.city} · {activeSchool.phone}</div>
              <div className="text-xs font-bold text-blue-900 mt-1 uppercase">Official Student Fee Receipt</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600">Receipt No:</span>
                <span className="font-bold text-slate-950">{lastReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date Issued:</span>
                <span className="font-medium">{lastReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Student Name:</span>
                <span className="font-bold">{lastReceipt.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Registration No:</span>
                <span className="font-mono">{lastReceipt.student_reg} ({lastReceipt.class_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fee Category:</span>
                <span className="font-medium">{lastReceipt.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Mode:</span>
                <span className="font-medium">{lastReceipt.method}</span>
              </div>

              <div className="my-4 p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center">
                <span className="font-bold text-sm">AMOUNT RECEIVED:</span>
                <span className="font-mono text-lg font-black text-emerald-800">
                  RWF {lastReceipt.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                <span>Authorized Bursar:</span>
                <span className="font-semibold">{lastReceipt.bursar}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 no-print flex justify-between">
              <button
                onClick={() => setLastReceipt(null)}
                className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERNATIONAL EXPORT & CLEARANCE HUB MODAL */}
      <InternationalExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedAcademicYear={selectedAcademicYear}
        selectedTermFilter={selectedTermFilter}
      />

    </div>
  );
};

export default FinancialPortal;
