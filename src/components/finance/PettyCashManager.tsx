import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  FileText
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { parseCleanNumber } from '../../utils/numberUtils';

export interface PettyCashRecord {
  id: string;
  voucher_number: string;
  requested_by: string;
  purpose: string;
  amount_rwf: number;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  approved_by: string;
  created_at: string;
}

interface PettyCashManagerProps {
  vouchers: PettyCashRecord[];
  setVouchers: React.Dispatch<React.SetStateAction<PettyCashRecord[]>>;
  selectedAcademicYear: string;
  isPeriodClosed: boolean;
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const PettyCashManager: React.FC<PettyCashManagerProps> = ({
  vouchers,
  setVouchers,
  selectedAcademicYear,
  isPeriodClosed,
  onAuditLog
}) => {
  const { activeSchool, currentUser } = useElimu();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [requestedBy, setRequestedBy] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState<number>(25000);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }
    if (!requestedBy.trim() || !purpose.trim()) {
      alert("Please provide the requester and purpose.");
      return;
    }

    const cleanAmt = parseCleanNumber(amount);
    if (cleanAmt <= 0) {
      alert("Please specify a valid disbursement amount greater than 0 RWF.");
      return;
    }

    const newVoucher: PettyCashRecord = {
      id: `PCV-${Date.now()}`,
      voucher_number: `PCV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      requested_by: requestedBy.trim(),
      purpose: purpose.trim(),
      amount_rwf: cleanAmt,
      status: 'APPROVED',
      approved_by: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10)
    };

    setVouchers(prev => [newVoucher, ...prev]);
    onAuditLog?.('PETTY_CASH_APPROVED', 'PettyCashRecord', newVoucher.voucher_number, `Bursar approved petty cash voucher of RWF ${cleanAmt.toLocaleString()} for ${requestedBy}`);
    setShowModal(false);
    setRequestedBy('');
    setPurpose('');
    setAmount(25000);
  };

  const handleUpdateStatus = (id: string, nextStatus: PettyCashRecord['status']) => {
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: nextStatus } : v));
    onAuditLog?.('PETTY_CASH_STATUS_UPDATED', 'PettyCashRecord', id, `Voucher status set to ${nextStatus}`);
  };

  const handleDeleteVoucher = (id: string, voucherNo: string) => {
    if (isPeriodClosed) {
      alert("Error: Current financial period is CLOSED.");
      return;
    }
    if (confirm(`Delete petty cash voucher ${voucherNo}?`)) {
      setVouchers(prev => prev.filter(v => v.id !== id));
      onAuditLog?.('PETTY_CASH_DELETED', 'PettyCashRecord', id, `Deleted voucher ${voucherNo}`);
    }
  };

  const totalPettyCash = vouchers.reduce((sum, v) => sum + v.amount_rwf, 0);

  const exportCSV = () => {
    const rows = [
      ['Voucher #', 'Requested By', 'Purpose', 'Amount (RWF)', 'Status', 'Approved By', 'Date'],
      ...vouchers.map(v => [
        v.voucher_number,
        v.requested_by,
        v.purpose,
        v.amount_rwf.toString(),
        v.status,
        v.approved_by,
        v.created_at
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Petty_Cash_Vouchers_${activeSchool.code}_${selectedAcademicYear}.csv`);
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
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Petty Cash Float & Imprest Vouchers</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage daily small school expenses, laboratory consumables, and emergency maintenance disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportCSV}
            disabled={vouchers.length === 0}
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
            <span>Issue Voucher</span>
          </button>
        </div>
      </div>

      {/* Petty Cash Table */}
      {vouchers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Petty Cash Vouchers</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click &apos;Issue Voucher&apos; to create a new imprest disbursement record.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Issue First Voucher</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Voucher #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Requested By</th>
                  <th className="py-3.5 px-4">Purpose / Department</th>
                  <th className="py-3.5 px-4 font-bold text-emerald-400">Amount (RWF)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {v.voucher_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {v.created_at}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {v.requested_by}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {v.purpose}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      RWF {v.amount_rwf.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        v.status === 'APPROVED' || v.status === 'DISBURSED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : v.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'DISBURSED')}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold cursor-pointer"
                          >
                            Mark Disbursed
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVoucher(v.id, v.voucher_number)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition cursor-pointer border border-rose-900/50"
                          title="Delete Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ISSUE PETTY CASH VOUCHER
          ========================================================================= */}
      {showModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Issue Petty Cash Imprest Voucher</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Requested By (Staff / Department):</label>
                <input
                  type="text"
                  placeholder="e.g. Jean de Dieu (Lab Technician)"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Amount (RWF):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 100000"
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => setAmount(parseCleanNumber(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Purpose / Justification:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Science lab chemical reagent purchase for Senior 5 practical examination"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                  Approve & Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
