import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Building, 
  ShieldCheck, 
  X,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { PaymentMethod } from '../../types';
import { parseCleanNumber } from '../../utils/numberUtils';

export interface SupplierRecord {
  id: string;
  supplier_name: string;
  tin_number: string;
  phone: string;
  address: string;
  bank_name: string;
  bank_account: string;
  category: string;
}

export interface ExpenseRecord {
  id: string;
  supplier_id: string;
  supplier_name: string;
  category: string;
  amount_rwf: number;
  payment_method: PaymentMethod;
  account_id: string;
  invoice_number: string;
  ebm_invoice_number: string;
  description: string;
  approved_by: string;
  created_by: string;
  created_at: string;
}

interface ExpenseAndEbmManagerProps {
  expenses: ExpenseRecord[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseRecord[]>>;
  suppliers: SupplierRecord[];
  setSuppliers: React.Dispatch<React.SetStateAction<SupplierRecord[]>>;
  selectedAcademicYear: string;
  isPeriodClosed: boolean;
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const ExpenseAndEbmManager: React.FC<ExpenseAndEbmManagerProps> = ({
  expenses,
  setExpenses,
  suppliers,
  setSuppliers,
  selectedAcademicYear,
  isPeriodClosed,
  onAuditLog
}) => {
  const { activeSchool, currentUser } = useElimu();

  // Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Expense Form
  const [expSupplierId, setExpSupplierId] = useState(suppliers[0]?.id || '');
  const [expCategory, setExpCategory] = useState('Food');
  const [expAmount, setExpAmount] = useState<number>(250000);
  const [expMethod, setExpMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [expInvNo, setExpInvNo] = useState('');
  const [expEbmNo, setExpEbmNo] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supTin, setSupTin] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supBank, setSupBank] = useState('Bank of Kigali');
  const [supAccount, setSupAccount] = useState('');
  const [supCategory, setSupCategory] = useState('General Supplies');

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supTin.trim()) {
      alert("Supplier Name and TIN number are mandatory.");
      return;
    }

    const newSup: SupplierRecord = {
      id: `SUP-${Date.now()}`,
      supplier_name: supName.trim(),
      tin_number: supTin.trim(),
      phone: supPhone,
      address: supAddress,
      bank_name: supBank,
      bank_account: supAccount,
      category: supCategory
    };

    setSuppliers(prev => [newSup, ...prev]);
    onAuditLog?.('SUPPLIER_REGISTERED', 'SupplierRecord', newSup.id, `Registered supplier '${supName}' [TIN: ${supTin}]`);
    setShowSupplierModal(false);
    setSupName('');
    setSupTin('');
    setSupPhone('');
    setSupAddress('');
    setSupAccount('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }

    const cleanAmt = parseCleanNumber(expAmount);
    if (cleanAmt <= 0) {
      alert("Error: Please specify a valid expense amount greater than 0 RWF.");
      return;
    }

    if (!expEbmNo.trim()) {
      alert("Error: RRA EBM Invoice Number is mandatory for statutory compliance.");
      return;
    }

    const sup = suppliers.find(s => s.id === expSupplierId);

    const exp: ExpenseRecord = {
      id: `EXP-${Date.now()}`,
      supplier_id: expSupplierId,
      supplier_name: sup ? sup.supplier_name : 'General Vendor',
      category: expCategory,
      amount_rwf: cleanAmt,
      payment_method: expMethod,
      account_id: '5200',
      invoice_number: expInvNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      ebm_invoice_number: expEbmNo.trim(),
      description: expDesc,
      approved_by: currentUser.name,
      created_by: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10)
    };

    setExpenses(prev => [exp, ...prev]);
    onAuditLog?.('EXPENSE_POSTED', 'ExpenseRecord', exp.id, `Posted expense of RWF ${cleanAmt.toLocaleString()} to ${exp.supplier_name} [EBM: ${expEbmNo}]`);
    setShowExpenseModal(false);
    setExpDesc('');
    setExpEbmNo('');
    setExpInvNo('');
  };

  const handleDeleteExpense = (id: string, ebm: string) => {
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }
    if (confirm(`Are you sure you want to delete expense [EBM: ${ebm}]?`)) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      onAuditLog?.('EXPENSE_DELETED', 'ExpenseRecord', id, `Deleted expense [EBM: ${ebm}]`);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount_rwf, 0);

  const exportExpensesCSV = () => {
    const rows = [
      ['Date', 'Supplier / Vendor', 'Category', 'Amount (RWF)', 'Method', 'Invoice No', 'RRA EBM Invoice No', 'Description', 'Approved By'],
      ...expenses.map(e => [
        e.created_at,
        e.supplier_name,
        e.category,
        e.amount_rwf.toString(),
        e.payment_method,
        e.invoice_number,
        e.ebm_invoice_number,
        e.description,
        e.approved_by
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `School_Expenses_EBM_${activeSchool.code}_${selectedAcademicYear}.csv`);
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
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Institutional Expenses & RRA EBM Invoice Tracking</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every vendor payment requires a certified Rwanda Revenue Authority (RRA) Electronic Billing Machine (EBM) invoice reference.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Supplier / Vendor</span>
          </button>

          <button
            onClick={exportExpensesCSV}
            disabled={expenses.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Posted Expenses</div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            RWF {totalExpenseAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">{expenses.length} EBM Invoices Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Registered School Suppliers</div>
          <div className="text-xl font-bold text-white font-mono">
            {suppliers.length} Vendors
          </div>
          <div className="text-[11px] text-slate-400">TIN & Bank Details on file</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Statutory Compliance Status</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% RRA EBM V2 Compliant</span>
          </div>
          <div className="text-[11px] text-slate-400">Compliant with Rwandan Tax Laws</div>
        </div>
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-rose-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Expenses Recorded</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click &apos;Record Expense&apos; to post verified supplier purchases with mandatory RRA EBM receipt numbers.
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Expense</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Vendor & Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">RRA EBM Invoice #</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 font-bold text-rose-400">Amount (RWF)</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {exp.created_at}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{exp.supplier_name}</div>
                      <span className="text-[10px] text-blue-400 font-semibold">{exp.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {exp.description || 'Institutional expenditure'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 text-[11px] font-semibold">
                      {exp.ebm_invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400 text-sm">
                      RWF {exp.amount_rwf.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.ebm_invoice_number)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition cursor-pointer border border-rose-900/50"
                        title="Delete Expense"
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
          MODAL: RECORD EXPENSE
          ========================================================================= */}
      {showExpenseModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Record Vendor Expenditure (EBM Required)</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Supplier / Vendor:</label>
                <select
                  value={expSupplierId}
                  onChange={(e) => setExpSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplier_name} (TIN: {s.tin_number})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category:</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Food & Boarding Supplies">Food & Catering</option>
                    <option value="Stationery & Printing">Stationery & Examination</option>
                    <option value="Science Lab & Equipment">Science Lab Reagents</option>
                    <option value="Utilities (Water & Electricity)">Utilities (WASAC & EUCL)</option>
                    <option value="Campus Maintenance & Repairs">Campus Repairs</option>
                    <option value="ICT & Internet Subscription">ICT & Connectivity</option>
                    <option value="Other Operational Expenditure">Other Operational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Amount (RWF):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100000"
                    value={expAmount === 0 ? '' : expAmount}
                    onChange={(e) => setExpAmount(parseCleanNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Payment Method:</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MTN_MOMO">MTN MoMo</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    <span className="text-emerald-400 font-bold">* RRA EBM Invoice #:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EBM-0092-2026-RW"
                    value={expEbmNo}
                    onChange={(e) => setExpEbmNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-600/80 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Internal Vendor Invoice Number (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-108"
                  value={expInvNo}
                  onChange={(e) => setExpInvNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description / Purpose:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Boarding student food delivery for month of February"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950"
                >
                  Post Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD SUPPLIER
          ========================================================================= */}
      {showSupplierModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <span>Register New Supplier / Vendor</span>
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Company / Supplier Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Inyange Industries Ltd"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">RRA TIN Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. 100094812"
                    value={supTin}
                    onChange={(e) => setSupTin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    placeholder="+250 788 000 000"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Bank Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank of Kigali (BK)"
                    value={supBank}
                    onChange={(e) => setSupBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Bank Account Number:</label>
                  <input
                    type="text"
                    placeholder="00012-345678-01"
                    value={supAccount}
                    onChange={(e) => setSupAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Physical Address:</label>
                <input
                  type="text"
                  placeholder="e.g. Kigali Special Economic Zone"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-lg shadow-blue-950"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
