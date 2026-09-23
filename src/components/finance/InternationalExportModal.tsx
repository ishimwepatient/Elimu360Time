import React, { useState, useRef } from 'react';
import { 
  Download, 
  Printer, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  School, 
  UserCheck, 
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { StudentPaymentStatus } from '../../types';

interface InternationalExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAcademicYear: string;
  selectedTermFilter: string;
}

export const InternationalExportModal: React.FC<InternationalExportModalProps> = ({
  isOpen,
  onClose,
  selectedAcademicYear,
  selectedTermFilter,
}) => {
  const { activeSchool, students, classes, getStudentFeeLedger, payments } = useElimu();

  const [statusFilter, setStatusFilter] = useState<StudentPaymentStatus | 'ALL'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [boardingFilter, setBoardingFilter] = useState<'ALL' | 'DAY' | 'BOARDING'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter students
  const activeSchoolStudents = students.filter(s => s.school_id === activeSchool.id && s.status === 'ACTIVE');
  const activeSchoolClasses = classes.filter(c => c.school_id === activeSchool.id);

  const processedData = activeSchoolStudents.map(s => {
    const ledger = getStudentFeeLedger(s.id, {
      academic_year: selectedAcademicYear,
      term: selectedTermFilter,
    });
    return {
      student: s,
      ledger,
    };
  }).filter(({ student, ledger }) => {
    // Status Filter
    if (statusFilter !== 'ALL' && ledger.paymentStatus !== statusFilter) return false;

    // Class Filter
    if (classFilter !== 'ALL' && student.class_name !== classFilter && student.class_id !== classFilter) return false;

    // Boarding Filter
    if (boardingFilter !== 'ALL' && (student.boarding_status || 'DAY').toUpperCase() !== boardingFilter) return false;

    // Gender Filter
    if (genderFilter !== 'ALL' && (student.gender || '').toUpperCase() !== genderFilter) return false;

    return true;
  });

  // Calculate totals for filtered dataset
  const totalExpectedSum = processedData.reduce((acc, item) => acc + item.ledger.totalExpected, 0);
  const totalPaidSum = processedData.reduce((acc, item) => acc + item.ledger.totalPaid, 0);
  const totalOutstandingSum = processedData.reduce((acc, item) => acc + item.ledger.outstandingBalance, 0);
  const overallClearanceRate = totalExpectedSum > 0 ? Math.min(100, Math.round((totalPaidSum / totalExpectedSum) * 100)) : 100;

  // Status counts in filtered scope
  const fullyPaidCount = processedData.filter(d => d.ledger.paymentStatus === 'FULLY_PAID').length;
  const partialPaidCount = processedData.filter(d => d.ledger.paymentStatus === 'PARTIAL').length;
  const notPaidCount = processedData.filter(d => d.ledger.paymentStatus === 'NOT_PAID').length;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Academic Year",
      "Term",
      "School Code",
      "School Name",
      "Registration Number",
      "Student First Name",
      "Student Last Name",
      "Gender",
      "Class",
      "Boarding Status",
      "Guardian Name",
      "Guardian Phone",
      "Total Fees Expected (RWF)",
      "Total Fees Paid (RWF)",
      "Outstanding Arrears (RWF)",
      "Clearance Rate (%)",
      "Payment Status",
      "Last Payment Date",
      "Currency"
    ];

    const rows = processedData.map(({ student, ledger }) => {
      // Find last payment date
      const studentPayments = payments.filter(p => p.student_id === student.id);
      const lastPayment = studentPayments.length > 0 ? studentPayments[studentPayments.length - 1].payment_date : "N/A";

      return [
        selectedAcademicYear,
        selectedTermFilter,
        activeSchool.code,
        activeSchool.name,
        student.registration_number,
        student.first_name,
        student.last_name,
        student.gender || 'N/A',
        student.class_name,
        student.boarding_status || 'DAY',
        student.guardian_name,
        student.guardian_phone,
        ledger.totalExpected.toString(),
        ledger.totalPaid.toString(),
        ledger.outstandingBalance.toString(),
        ledger.clearanceRatePercent.toString(),
        ledger.paymentStatus,
        lastPayment,
        "RWF"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const timeStr = new Date().toISOString().substring(0, 10);
    link.setAttribute("download", `FIN_REPORT_${activeSchool.code}_${statusFilter}_${selectedAcademicYear}_${selectedTermFilter}_${timeStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" />
              <span>International Standard Financial Reporting & Export Engine</span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-display mt-0.5">
              Fee Collections & Payment Status Export Portal
            </h2>
            <p className="text-xs text-slate-400">
              Generate UNESCO / REB compliant student financial registers, fee defaulters lists, and clearance certificates.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Ribbon */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Payment Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Payment Status Category
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Payment Statuses ({activeSchoolStudents.length})</option>
              <option value="FULLY_PAID">100% Fully Paid ({activeSchoolStudents.filter(s => getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).paymentStatus === 'FULLY_PAID').length})</option>
              <option value="PARTIAL">Partial Paid - Arrears ({activeSchoolStudents.filter(s => getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).paymentStatus === 'PARTIAL').length})</option>
              <option value="NOT_PAID">0% Paid - Defaulters ({activeSchoolStudents.filter(s => getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).paymentStatus === 'NOT_PAID').length})</option>
              <option value="OVERPAID">Overpaid - Credit ({activeSchoolStudents.filter(s => getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).paymentStatus === 'OVERPAID').length})</option>
              <option value="EXEMPT">Exempt / Fee Waived ({activeSchoolStudents.filter(s => getStudentFeeLedger(s.id, { academic_year: selectedAcademicYear, term: selectedTermFilter }).paymentStatus === 'EXEMPT').length})</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Class Grade / Level
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {activeSchoolClasses.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Boarding Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Boarding Category
            </label>
            <select
              value={boardingFilter}
              onChange={(e) => setBoardingFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Boarding Types</option>
              <option value="DAY">Day Scholars Only</option>
              <option value="BOARDING">Boarding Students Only</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

        </div>

        {/* Aggregated Quick Metrics */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400">Filtered Count</div>
            <div className="text-lg font-black text-white font-mono mt-0.5">{processedData.length} Students</div>
            <div className="text-[10px] text-slate-500">Period: {selectedAcademicYear} · {selectedTermFilter}</div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-blue-400">Total Fee Target</div>
            <div className="text-lg font-black text-blue-400 font-mono mt-0.5">RWF {totalExpectedSum.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Expected Collections</div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Total Fee Collected</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">RWF {totalPaidSum.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-500 font-semibold">{overallClearanceRate}% Overall Clearance</div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-amber-400">Outstanding Arrears</div>
            <div className="text-lg font-black text-amber-400 font-mono mt-0.5">RWF {totalOutstandingSum.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Uncollected Net</div>
          </div>
        </div>

        {/* Table Body Preview */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/50">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reg No & Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Expected Fee</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Amount Paid</th>
                  <th className="py-3 px-4 text-right text-amber-400">Outstanding Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                      No students match the selected filter criteria for {selectedAcademicYear} - {selectedTermFilter}.
                    </td>
                  </tr>
                ) : (
                  processedData.map(({ student, ledger }) => (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">
                        {student.first_name} {student.last_name}
                        <div className="text-[10px] text-slate-400 font-mono">{student.registration_number}</div>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-300">{student.class_name}</td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {student.boarding_status || 'DAY'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-200">
                        RWF {ledger.totalExpected.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                        RWF {ledger.totalPaid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-400">
                        RWF {ledger.outstandingBalance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-center font-sans">
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
                          {ledger.paymentStatus === 'FULLY_PAID' && '100% FULLY PAID'}
                          {ledger.paymentStatus === 'PARTIAL' && 'PARTIAL ARREARS'}
                          {ledger.paymentStatus === 'NOT_PAID' && '0% UNPAID / DEFAULTER'}
                          {ledger.paymentStatus === 'OVERPAID' && 'OVERPAID CREDIT'}
                          {ledger.paymentStatus === 'EXEMPT' && 'FEES EXEMPT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ISO/UNESCO Education Data Interchange Standard Compliant</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              disabled={processedData.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export ISO CSV Register</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={processedData.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Clearance Register</span>
            </button>
          </div>
        </div>

      </div>

      {/* PRINT-ONLY OFFICIAL INSTITUTIONAL REPORT VIEW */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-[9999]" ref={printRef}>
        
        {/* Printable Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
            REPUBLIC OF RWANDA · MINISTRY OF EDUCATION / REB
          </div>
          <h1 className="text-2xl font-black uppercase text-black mt-1">{activeSchool.name}</h1>
          <div className="text-xs font-semibold text-slate-800">
            School Code: {activeSchool.code} · District: {activeSchool.district || 'Gasabo'} · Category: {activeSchool.ownership_type || 'PUBLIC'}
          </div>
          <div className="text-sm font-bold text-emerald-800 mt-2 uppercase border-t border-slate-300 pt-1">
            OFFICIAL STUDENT FEE PAYMENT & CLEARANCE REGISTER · {selectedAcademicYear} ({selectedTermFilter})
          </div>
          <div className="text-[10px] text-slate-600">
            Filter Status: {statusFilter} | Generated Date: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Printable Summary Banner */}
        <div className="grid grid-cols-4 gap-4 p-3 border border-black rounded mb-6 text-xs bg-slate-50">
          <div>
            <div className="font-bold text-slate-600">Total Students Listed:</div>
            <div className="text-sm font-black">{processedData.length}</div>
          </div>
          <div>
            <div className="font-bold text-slate-600">Total Expected Fees:</div>
            <div className="text-sm font-black">RWF {totalExpectedSum.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-bold text-slate-600">Total Collected:</div>
            <div className="text-sm font-black text-emerald-800">RWF {totalPaidSum.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-bold text-slate-600">Outstanding Arrears:</div>
            <div className="text-sm font-black text-rose-800">RWF {totalOutstandingSum.toLocaleString()}</div>
          </div>
        </div>

        {/* Printable Data Table */}
        <table className="w-full text-left text-[11px] border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-slate-200 text-black uppercase font-bold border-b border-black">
              <th className="border border-black p-1.5">#</th>
              <th className="border border-black p-1.5">Reg Number</th>
              <th className="border border-black p-1.5">Student Name</th>
              <th className="border border-black p-1.5">Class</th>
              <th className="border border-black p-1.5 text-right">Expected (RWF)</th>
              <th className="border border-black p-1.5 text-right">Paid (RWF)</th>
              <th className="border border-black p-1.5 text-right">Arrears (RWF)</th>
              <th className="border border-black p-1.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(({ student, ledger }, idx) => (
              <tr key={student.id} className="border-b border-slate-300 font-mono">
                <td className="border border-black p-1.5 font-sans">{idx + 1}</td>
                <td className="border border-black p-1.5">{student.registration_number}</td>
                <td className="border border-black p-1.5 font-sans font-bold">{student.first_name} {student.last_name}</td>
                <td className="border border-black p-1.5 font-sans">{student.class_name}</td>
                <td className="border border-black p-1.5 text-right font-bold">{ledger.totalExpected.toLocaleString()}</td>
                <td className="border border-black p-1.5 text-right text-emerald-800 font-bold">{ledger.totalPaid.toLocaleString()}</td>
                <td className="border border-black p-1.5 text-right text-rose-800 font-bold">{ledger.outstandingBalance.toLocaleString()}</td>
                <td className="border border-black p-1.5 text-center font-sans font-bold text-[10px]">
                  {ledger.paymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Sign-Off Block */}
        <div className="grid grid-cols-3 gap-8 text-xs font-sans mt-12 pt-6 border-t border-black">
          <div>
            <div className="font-bold text-black uppercase">Prepared By (Chief Bursar):</div>
            <div className="mt-8 border-b border-black w-48"></div>
            <div className="text-[10px] text-slate-600 mt-1">Signature & Date</div>
          </div>

          <div>
            <div className="font-bold text-black uppercase">Verified By (School Principal):</div>
            <div className="mt-8 border-b border-black w-48"></div>
            <div className="text-[10px] text-slate-600 mt-1">Signature & Date</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-black uppercase mb-2">Official School Stamp:</div>
            <div className="border-2 border-dashed border-slate-400 h-20 w-32 mx-auto rounded flex items-center justify-center text-[10px] text-slate-400">
              [ OFFICIAL STAMP HERE ]
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
