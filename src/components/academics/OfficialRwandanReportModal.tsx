import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { useElimu } from '../../context/ElimuContext';
import { StudentReportCard, School } from '../../types';
import { RwandaCoatOfArms } from '../brand/RwandaCoatOfArms';
import { SchoolCrest } from '../brand/SchoolCrest';
import { calculateRwandanGradeLetter } from '../../utils/reportCardGenerator';

interface OfficialRwandanReportModalProps {
  report: StudentReportCard;
  school?: School;
  reportType?: 'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL';
  onClose: () => void;
  autoDownloadOnMount?: boolean;
}

export const OfficialRwandanReportModal: React.FC<OfficialRwandanReportModalProps> = ({
  report,
  school,
  reportType = 'PROGRESSIVE',
  onClose,
  autoDownloadOnMount = false
}) => {
  const { activeSchool: contextSchool } = useElimu();
  const activeSchool = school || contextSchool;
  const [selectedFormat, setSelectedFormat] = useState<'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL'>(reportType);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate Scannable Auto-Download Verification QR Code
  useEffect(() => {
    const downloadUrl = `${window.location.origin}/?verify_report=${report.student.id}&registration=${encodeURIComponent(report.student.registration_number)}&autodownload=true`;
    QRCode.toDataURL(downloadUrl, { width: 140, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [report.student.id, report.student.registration_number]);

  // Auto-download or open print prompt if scanned via QR auto-download
  useEffect(() => {
    if (autoDownloadOnMount) {
      const timer = setTimeout(() => {
        window.print();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadOnMount]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isPrePrimary = report.isPrePrimary || 
    (report.student.class_name?.toLowerCase().includes('nursery') || 
     report.student.class_name?.toLowerCase().includes('n1') ||
     report.student.class_name?.toLowerCase().includes('n2') ||
     report.student.class_name?.toLowerCase().includes('n3') ||
     report.student.class_name?.toLowerCase().includes('baby') ||
     report.student.class_name?.toLowerCase().includes('middle') ||
     report.student.class_name?.toLowerCase().includes('top'));

  // Color appreciation helper for Pre-Primary
  const getPrePrimaryColorClass = (pct: number) => {
    if (pct >= 90) return { bg: 'bg-emerald-200 text-emerald-900', text: 'Excellent', hex: '#bbf7d0' };
    if (pct >= 70) return { bg: 'bg-purple-200 text-purple-900', text: 'Very Good', hex: '#ddd6fe' };
    if (pct >= 50) return { bg: 'bg-yellow-200 text-yellow-900', text: 'Good', hex: '#fef08a' };
    return { bg: 'bg-pink-200 text-pink-900', text: 'Fair', hex: '#fbcfe8' };
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 my-2 flex flex-col shrink-0 print:m-0 print:max-h-none print:border-none print:shadow-none print:bg-white">
        
        {/* Modal Action Bar (Fixed at top of modal, hidden during Print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Format:
            </span>
            <div className="flex items-center rounded-lg bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setSelectedFormat('PROGRESSIVE')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  selectedFormat === 'PROGRESSIVE' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Termly Progressive
              </button>
              <button
                onClick={() => setSelectedFormat('MIDTERM')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  selectedFormat === 'MIDTERM' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Midterm
              </button>
              <button
                onClick={() => setSelectedFormat('ANNUAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  selectedFormat === 'ANNUAL' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Annual Report
              </button>
              <button
                onClick={() => setSelectedFormat('SPECIAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  selectedFormat === 'SPECIAL' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Special Test
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official A4 Report</span>
            </button>

            <button
              onClick={onClose}
              title="Close Preview (Esc)"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with White A4 sheet */}
        <div className="p-3 sm:p-6 bg-slate-200/90 overflow-y-auto flex justify-center print:p-0 print:bg-white">
          <div className="w-full max-w-[210mm] bg-white text-slate-950 font-sans text-xs shadow-xl rounded-sm p-6 sm:p-8 print:p-4 print:shadow-none print:text-[10px] leading-tight">
            
            {/* HEADER ROW: Coat of Arms (Left) | Ministry & School Title (Center) | School Crest (Right) */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-4 mb-4 text-center">
              {/* Left: Coat of Arms of Rwanda */}
              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center">
                <RwandaCoatOfArms size="md" />
                <span className="text-[7.5px] uppercase font-bold text-slate-700 mt-1 block">
                  MINEDUC
                </span>
              </div>

              {/* Center: Official Title */}
              <div className="flex-1 px-3">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">
                  REPUBLIC OF RWANDA
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  MINISTRY OF EDUCATION
                </div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-950 font-display mt-0.5">
                  {activeSchool.name}
                </h1>
                <div className="text-[10px] text-slate-700 font-medium">
                  Tel: {activeSchool.phone || '+250 792 612 139'} · Email: {activeSchool.contact_email}
                </div>

                {/* Boxed Title matching official Rwandan standard */}
                <div className="mt-2 inline-block px-5 py-1 border-2 border-slate-900 rounded-sm font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-50 text-blue-900">
                  {selectedFormat === 'PROGRESSIVE' 
                    ? (isPrePrimary ? 'PROGRESSIVE REPORT' : '[ PROGRESSIVE REPORT ]')
                    : selectedFormat === 'MIDTERM'
                    ? 'MIDTERM'
                    : selectedFormat === 'ANNUAL'
                    ? 'STUDENT ANNUAL REPORT'
                    : `[ ${report.specialAssessmentType?.toUpperCase() || 'SPECIAL TEST'} REPORT ]`
                  }
                </div>
              </div>

              {/* Right: School Crest / Logo */}
              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center">
                <SchoolCrest school={activeSchool} size="md" />
                <span className="text-[7.5px] uppercase font-bold text-slate-700 mt-1 block">
                  {activeSchool.code || 'REB-2026'}
                </span>
              </div>
            </div>

            {/* STUDENT BIOGRAPHICAL METADATA BOX */}
            <div className="border border-slate-300 rounded-md p-3 mb-4 bg-slate-50/70 grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] print:text-[9.5px]">
              <div>
                <span className="font-bold text-slate-700">STUDENT&apos;S NAME: </span>
                <span className="font-black text-slate-950 uppercase">{report.student.first_name} {report.student.last_name}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">REGISTRATION NUMBER: </span>
                <span className="font-mono font-bold text-blue-900">{report.student.registration_number}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">CLASS: </span>
                <span className="font-black text-slate-950">{report.student.class_name}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">ACADEMIC YEAR: </span>
                <span className="font-bold text-slate-900">{report.academicYear} · {report.term}</span>
              </div>
            </div>

          {/* =========================================================================
              FORMAT 1: PRE-PRIMARY PROGRESSIVE REPORT (COLOR APPRECIATIONS)
              ========================================================================= */}
          {isPrePrimary && selectedFormat === 'PROGRESSIVE' ? (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[10px] border-b border-slate-400">
                    <th className="py-2 px-3 border-r border-slate-400">SUBJECT</th>
                    <th className="py-2 px-3 text-center border-r border-slate-400 w-28">MARKS %</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-44">APPRECIATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr className="bg-slate-200/60 font-bold text-[10px] uppercase text-slate-800">
                    <td colSpan={3} className="py-1 px-3">CORE SUBJECTS</td>
                  </tr>
                  {report.subjectGrades.map((subG, idx) => {
                    const app = getPrePrimaryColorClass(subG.percentage);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                          {subG.subject.name}
                        </td>
                        <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                          {subG.percentage}%
                        </td>
                        <td className="py-1 px-3 border-r border-slate-300">
                          <span 
                            className="inline-block px-2.5 py-0.5 rounded font-black text-[10px]"
                            style={{ backgroundColor: app.hex }}
                          >
                            {app.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td className="py-2 px-3 uppercase text-slate-900">AVERAGE:</td>
                    <td className="py-2 px-3 text-center font-mono font-black text-blue-900">
                      {report.overallAveragePercentage}%
                    </td>
                    <td className="py-2 px-3">
                      <span 
                        className="inline-block px-3 py-1 rounded font-black text-[11px]"
                        style={{ backgroundColor: getPrePrimaryColorClass(report.overallAveragePercentage).hex }}
                      >
                        {getPrePrimaryColorClass(report.overallAveragePercentage).text}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Appreciation Color Meaning Reference Box */}
              <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50">
                <span className="text-[10px] font-black uppercase text-slate-800 block mb-1.5">
                  Appreciation Color Meaning :
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className="p-1.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Excellent (100 - 90)
                  </div>
                  <div className="p-1.5 rounded bg-purple-200 text-purple-900 border border-purple-300">
                    Very Good (89 - 70)
                  </div>
                  <div className="p-1.5 rounded bg-yellow-200 text-yellow-900 border border-yellow-300">
                    Good (69 - 50)
                  </div>
                  <div className="p-1.5 rounded bg-pink-200 text-pink-900 border border-pink-300">
                    Fair (49 - 0)
                  </div>
                </div>
              </div>
            </div>
          ) : selectedFormat === 'MIDTERM' ? (
            /* =========================================================================
               FORMAT 2: MIDTERM REPORT
               ========================================================================= */
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[10px] border-b border-slate-400">
                    <th className="py-2 px-3 border-r border-slate-400">Subject</th>
                    <th className="py-2 px-3 text-center border-r border-slate-400 w-28">MAX</th>
                    <th className="py-2 px-3 text-center border-r border-slate-400 w-28">MARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr className="bg-slate-200/60 font-bold text-[10px] uppercase text-slate-800">
                    <td colSpan={3} className="py-1 px-3">CORE SUBJECTS</td>
                  </tr>

                  {report.subjectGrades.map((subG, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-300">
                        {subG.subject.name}
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono text-slate-600 border-r border-slate-300">
                        {subG.totalMaxMarks}
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                        {subG.totalMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td className="py-2 px-3 uppercase text-slate-900">TERM TOTAL (ACADEMIC MARKS):</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">{report.totalMaxPossible}</td>
                    <td className="py-2 px-3 text-center font-mono font-black text-blue-900">{report.totalMarksObtained}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-1.5 px-3 uppercase text-slate-900">PERCENTAGE:</td>
                    <td colSpan={2} className="py-1.5 px-3 text-center font-mono font-black text-blue-900 text-sm">
                      {report.overallAveragePercentage}%
                    </td>
                  </tr>
                  <tr className="bg-amber-50 font-bold">
                    <td className="py-1.5 px-3 uppercase text-slate-900">POSITION:</td>
                    <td colSpan={2} className="py-1.5 px-3 text-center font-mono font-black text-amber-800 text-sm">
                      {report.classRank} / {report.totalStudentsInClass}
                    </td>
                  </tr>
                  <tr className="bg-blue-50/70 font-bold border-t border-slate-300">
                    <td className="py-1.5 px-3 uppercase text-slate-900">CONDUCT SCORE (BEHAVIOUR):</td>
                    <td colSpan={2} className="py-1.5 px-3 text-center font-mono font-black text-slate-900 text-sm">
                      {report.conductScore ?? 40} / 40
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : selectedFormat === 'ANNUAL' ? (
            /* =========================================================================
               FORMAT 3: ANNUAL END OF YEAR REPORT
               ========================================================================= */
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[9px] border-b border-slate-400 text-center">
                    <th className="py-2 px-2 text-left border-r border-slate-400">Subjects</th>
                    <th className="py-2 px-1 border-r border-slate-400">MAX</th>
                    <th className="py-2 px-1 border-r border-slate-400">Term 1</th>
                    <th className="py-2 px-1 border-r border-slate-400">Term 2</th>
                    <th className="py-2 px-1 border-r border-slate-400">Term 3</th>
                    <th className="py-2 px-1 border-r border-slate-400 bg-blue-50">Annual %</th>
                    <th className="py-2 px-1 border-r border-slate-400">GR</th>
                    <th className="py-2 px-1">2nd Sitting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {report.subjectGrades.map((subG, idx) => {
                    const annGrade = report.annualSubjectGrades?.find(a => a.subject.id === subG.subject.id);
                    const t1 = annGrade?.term1Total ?? subG.totalMarks;
                    const t2 = annGrade?.term2Total ?? subG.totalMarks;
                    const t3 = annGrade?.term3Total ?? subG.totalMarks;
                    const annAvg = annGrade?.annualAverageOutOf100 ?? subG.percentage;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 text-center">
                        <td className="py-1.5 px-2 text-left font-semibold text-slate-900 border-r border-slate-300">
                          {subG.subject.name}
                        </td>
                        <td className="py-1.5 px-1 font-mono text-slate-600 border-r border-slate-300">{subG.totalMaxMarks}</td>
                        <td className="py-1.5 px-1 font-mono text-slate-800 border-r border-slate-300">{t1}</td>
                        <td className="py-1.5 px-1 font-mono text-slate-800 border-r border-slate-300">{t2}</td>
                        <td className="py-1.5 px-1 font-mono text-slate-800 border-r border-slate-300">{t3}</td>
                        <td className="py-1.5 px-1 font-mono font-bold text-blue-900 border-r border-slate-300 bg-blue-50/50">{annAvg}%</td>
                        <td className="py-1.5 px-1 font-bold border-r border-slate-300">{calculateRwandanGradeLetter(annAvg)}</td>
                        <td className="py-1.5 px-1 text-slate-400 font-mono">-</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-center">
                    <td className="py-2 px-2 text-left uppercase text-slate-900">Total % & Position:</td>
                    <td className="py-2 px-1 font-mono">{report.totalMaxPossible}</td>
                    <td className="py-2 px-1 font-mono text-blue-900">#{report.annualSummary?.term1Rank ?? report.classRank}</td>
                    <td className="py-2 px-1 font-mono text-blue-900">#{report.annualSummary?.term2Rank ?? report.classRank}</td>
                    <td className="py-2 px-1 font-mono text-blue-900">#{report.annualSummary?.term3Rank ?? report.classRank}</td>
                    <td className="py-2 px-1 font-mono font-black text-blue-950 bg-blue-50">{report.overallAveragePercentage}%</td>
                    <td className="py-2 px-1 font-bold">{calculateRwandanGradeLetter(report.overallAveragePercentage)}</td>
                    <td className="py-2 px-1 text-slate-500 font-mono">-</td>
                  </tr>
                </tfoot>
              </table>

              {/* Deliberation Decisions Box */}
              <div className="border border-slate-300 rounded-md p-3 bg-slate-50 text-[10px] space-y-2">
                <div className="flex items-center justify-between font-black border-b border-slate-200 pb-1.5 text-blue-900 text-[10.5px]">
                  <span>OFFICIAL ANNUAL DELIBERATION RECORD</span>
                  <span className="font-mono text-slate-600 text-[9.5px]">
                    {report.deliberationDetails?.criteriaSummary || 'Criteria: Promoted (x ≥ 65%), 2nd Sitting (50% - 64.9%), Repeat (x < 50%)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                  <div className="md:col-span-8 space-y-1">
                    <span className="font-bold text-slate-800 block uppercase text-[9px]">Deliberation Choices & Status:</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-700 font-medium">
                      <label className="flex items-center gap-1 cursor-default select-none">
                        <input
                          type="checkbox"
                          checked={report.deliberationDetails?.decisionCode === 'PROMOTED'}
                          readOnly
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span className={report.deliberationDetails?.decisionCode === 'PROMOTED' ? 'font-bold text-emerald-800' : ''}>
                          Promoted (≥ {report.deliberationDetails?.promotionCutoff ?? 65}%)
                        </span>
                      </label>

                      {report.deliberationDetails?.secondSittingEnabled && (
                        <label className="flex items-center gap-1 cursor-default select-none">
                          <input
                            type="checkbox"
                            checked={report.deliberationDetails?.decisionCode === '2ND_SITTING'}
                            readOnly
                            className="rounded text-amber-600 focus:ring-0"
                          />
                          <span className={report.deliberationDetails?.decisionCode === '2ND_SITTING' ? 'font-bold text-amber-800' : ''}>
                            2nd Sitting ({report.deliberationDetails?.secondSittingMinCutoff ?? 50}% - {((report.deliberationDetails?.promotionCutoff ?? 65) - 0.1).toFixed(1)}%)
                          </span>
                        </label>
                      )}

                      <label className="flex items-center gap-1 cursor-default select-none">
                        <input
                          type="checkbox"
                          checked={report.deliberationDetails?.decisionCode === 'REPEAT'}
                          readOnly
                          className="rounded text-rose-600 focus:ring-0"
                        />
                        <span className={report.deliberationDetails?.decisionCode === 'REPEAT' ? 'font-bold text-rose-800' : ''}>
                          Repeat (&lt; {report.deliberationDetails?.secondSittingEnabled ? (report.deliberationDetails?.secondSittingMinCutoff ?? 50) : (report.deliberationDetails?.promotionCutoff ?? 65)}%)
                        </span>
                      </label>

                      <label className="flex items-center gap-1 cursor-default select-none">
                        <input
                          type="checkbox"
                          checked={report.deliberationDetails?.decisionCode === 'PROMOTE_ANYWHERE'}
                          readOnly
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className={report.deliberationDetails?.decisionCode === 'PROMOTE_ANYWHERE' ? 'font-bold text-blue-800' : ''}>
                          Promote Anywhere
                        </span>
                      </label>

                      <label className="flex items-center gap-1 cursor-default select-none">
                        <input
                          type="checkbox"
                          checked={report.deliberationDetails?.decisionCode === 'REPEAT_ANYWHERE'}
                          readOnly
                          className="rounded text-red-700 focus:ring-0"
                        />
                        <span className={report.deliberationDetails?.decisionCode === 'REPEAT_ANYWHERE' ? 'font-bold text-red-900' : ''}>
                          Repeat Anywhere
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-md text-center">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Ratified Council Decision</span>
                    <span className={`text-[11px] font-black mt-0.5 ${
                      report.deliberationDetails?.decisionCode === 'PROMOTED' || report.deliberationDetails?.decisionCode === 'PROMOTE_ANYWHERE'
                        ? 'text-emerald-700'
                        : report.deliberationDetails?.decisionCode === '2ND_SITTING'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}>
                      {report.deliberationDetails?.decisionLabel || report.annualSummary?.deliberationDecision || 'PENDING DELIBERATION'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedFormat === 'SPECIAL' ? (
            /* =========================================================================
               FORMAT 4: SPECIAL / TEST REPORT
               ========================================================================= */
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[10px] border-b border-slate-400 text-center">
                    <th className="py-2 px-3 text-left border-r border-slate-400">Subject</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-24">MAX</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-24">MARKS</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-24 bg-blue-50">%</th>
                    <th className="py-2 px-3 border-r border-slate-400 w-20">GRADE</th>
                    <th className="py-2 px-3 text-left">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {report.subjectGrades.map((subG, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 text-center">
                      <td className="py-1.5 px-3 text-left font-semibold text-slate-900 border-r border-slate-300">
                        {subG.subject.name}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-slate-600 border-r border-slate-300">{subG.totalMaxMarks}</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-300">{subG.totalMarks}</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-blue-900 border-r border-slate-300 bg-blue-50/50">{subG.percentage}%</td>
                      <td className="py-1.5 px-3 font-black border-r border-slate-300">{subG.gradeLetter}</td>
                      <td className="py-1.5 px-3 text-left text-[10px] text-slate-600">{subG.remarks}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-center">
                    <td className="py-2 px-3 text-left uppercase text-slate-900">Total:</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{report.totalMaxPossible}</td>
                    <td className="py-2 px-3 font-mono font-black text-blue-900">{report.totalMarksObtained}</td>
                    <td className="py-2 px-3 font-mono font-black text-blue-950 bg-blue-100">{report.overallAveragePercentage}%</td>
                    <td className="py-2 px-3 font-bold">{calculateRwandanGradeLetter(report.overallAveragePercentage)}</td>
                    <td className="py-2 px-3 text-left text-slate-500">Evaluation Completed</td>
                  </tr>
                  <tr className="bg-amber-50 font-bold text-center">
                    <td className="py-1.5 px-3 text-left uppercase text-slate-900">POSITION:</td>
                    <td colSpan={5} className="py-1.5 px-3 text-center font-mono font-black text-amber-800 text-sm">
                      {report.classRank} / {report.totalStudentsInClass}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            /* =========================================================================
               FORMAT 5: PRIMARY PROGRESSIVE TERMLY REPORT (M.T + EX)
               ========================================================================= */
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[9.5px] border-b border-slate-400">
                    <th rowSpan={2} className="py-2 px-3 border-r border-slate-400 text-left">Subject</th>
                    <th colSpan={7} className="py-1 px-2 text-center border-b border-slate-400 bg-blue-50/70 font-black">
                      {report.term}.
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-700 font-bold text-[9px] border-b border-slate-400 text-center">
                    <th className="py-1 px-2 border-r border-slate-400 w-14">M.T</th>
                    <th className="py-1 px-2 border-r border-slate-400 w-14">MAX</th>
                    <th className="py-1 px-2 border-r border-slate-400 w-14">EX</th>
                    <th className="py-1 px-2 border-r border-slate-400 w-14">MAX</th>
                    <th className="py-1 px-2 border-r border-slate-400 w-16 bg-blue-50/50">TOT</th>
                    <th className="py-1 px-2 border-r border-slate-400 w-14">MAX</th>
                    <th className="py-1 px-2 w-12 font-black">GRADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr className="bg-slate-200/60 font-bold text-[9.5px] uppercase text-slate-800">
                    <td colSpan={8} className="py-1 px-3">Core subjects</td>
                  </tr>

                  {report.subjectGrades.map((subG, idx) => {
                    const testMark = subG.testMark ?? 0;
                    const testMax = subG.testMax ?? subG.totalMaxMarks;
                    const examMark = subG.examMark ?? 0;
                    const examMax = subG.examMax ?? subG.totalMaxMarks;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 text-center">
                        <td className="py-1 px-3 text-left font-semibold text-slate-900 border-r border-slate-400">
                          {subG.subject.name}
                        </td>
                        <td className="py-1 px-2 font-mono text-slate-800 border-r border-slate-400">{testMark}</td>
                        <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-400">{testMax}</td>
                        <td className="py-1 px-2 font-mono text-slate-800 border-r border-slate-400">{examMark}</td>
                        <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-400">{examMax}</td>
                        <td className="py-1 px-2 font-mono font-bold text-slate-950 border-r border-slate-400 bg-blue-50/50">{subG.totalMarks}</td>
                        <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-400">{subG.totalMaxMarks}</td>
                        <td className="py-1 px-2 font-black text-blue-900">{subG.gradeLetter}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-center">
                    <td className="py-1.5 px-3 text-left uppercase text-slate-900">Term Total:</td>
                    <td className="py-1 px-2 font-mono text-slate-800 border-r border-slate-400">
                      {report.subjectGrades.reduce((sum, g) => sum + (g.testMark || 0), 0).toFixed(1)}
                    </td>
                    <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-400">
                      {report.subjectGrades.reduce((sum, g) => sum + (g.testMax || g.totalMaxMarks), 0)}
                    </td>
                    <td className="py-1 px-2 font-mono text-slate-800 border-r border-slate-400">
                      {report.subjectGrades.reduce((sum, g) => sum + (g.examMark || 0), 0).toFixed(1)}
                    </td>
                    <td className="py-1 px-2 font-mono text-slate-600 border-r border-slate-400">
                      {report.subjectGrades.reduce((sum, g) => sum + (g.examMax || g.totalMaxMarks), 0)}
                    </td>
                    <td className="py-1.5 px-2 font-mono font-black text-blue-950 border-r border-slate-400 bg-blue-100">
                      {report.totalMarksObtained}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-slate-700 border-r border-slate-400">
                      {report.totalMaxPossible}
                    </td>
                    <td className="py-1.5 px-2 font-bold text-emerald-800">
                      {calculateRwandanGradeLetter(report.overallAveragePercentage)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-black text-xs text-center">
                    <td className="py-1.5 px-3 text-left uppercase text-slate-900">PERCENTAGE:</td>
                    <td colSpan={7} className="py-1.5 px-3 text-center font-mono font-black text-blue-900 text-sm">
                      {report.overallAveragePercentage} %
                    </td>
                  </tr>
                  <tr className="bg-amber-50 font-black text-xs text-center">
                    <td className="py-1.5 px-3 text-left uppercase text-slate-900">POSITION:</td>
                    <td colSpan={7} className="py-1.5 px-3 text-center font-mono font-black text-amber-800 text-sm">
                      {report.classRank} / {report.totalStudentsInClass}
                    </td>
                  </tr>
                  <tr className="bg-blue-50/70 font-black text-xs text-center border-t border-slate-300">
                    <td className="py-1.5 px-3 text-left uppercase text-slate-900">CONDUCT SCORE (BEHAVIOUR):</td>
                    <td colSpan={7} className="py-1.5 px-3 text-center font-mono font-black text-slate-900 text-sm">
                      {report.conductScore ?? 40} / 40
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Official Rwanda REB Grading Scale Table */}
              <div className="border border-slate-300 rounded-md p-2 bg-slate-50/60">
                <span className="text-[9.5px] font-black uppercase text-slate-800 block mb-1">
                  Grading Scale
                </span>
                <table className="w-full text-center text-[9px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <th className="py-1 px-1 border-r border-slate-300 text-left">Percentage</th>
                      <th className="py-1 px-1 border-r border-slate-300">80-100</th>
                      <th className="py-1 px-1 border-r border-slate-300">75-79</th>
                      <th className="py-1 px-1 border-r border-slate-300">70-74</th>
                      <th className="py-1 px-1 border-r border-slate-300">65-69</th>
                      <th className="py-1 px-1 border-r border-slate-300">60-64</th>
                      <th className="py-1 px-1 border-r border-slate-300">50-59</th>
                      <th className="py-1 px-1">0-49</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-semibold text-slate-800">
                    <tr>
                      <td className="py-1 px-1 text-left font-bold border-r border-slate-300">Grade</td>
                      <td className="border-r border-slate-300 text-emerald-800 font-bold">A</td>
                      <td className="border-r border-slate-300 text-blue-800 font-bold">B</td>
                      <td className="border-r border-slate-300 text-sky-800 font-bold">C</td>
                      <td className="border-r border-slate-300 text-amber-800 font-bold">D</td>
                      <td className="border-r border-slate-300 text-orange-800 font-bold">E</td>
                      <td className="border-r border-slate-300 text-purple-800 font-bold">S</td>
                      <td className="text-rose-800 font-bold">F</td>
                    </tr>
                    <tr className="text-[8.5px]">
                      <td className="py-1 px-1 text-left font-bold border-r border-slate-300">Descriptor</td>
                      <td className="border-r border-slate-300">Excellent</td>
                      <td className="border-r border-slate-300">Very Good</td>
                      <td className="border-r border-slate-300">Good</td>
                      <td className="border-r border-slate-300">Satisfactory</td>
                      <td className="border-r border-slate-300">Adequate</td>
                      <td className="border-r border-slate-300">Minimum Pass</td>
                      <td>Fail</td>
                    </tr>
                    <tr className="font-mono">
                      <td className="py-1 px-1 text-left font-bold border-r border-slate-300">Value</td>
                      <td className="border-r border-slate-300">6</td>
                      <td className="border-r border-slate-300">5</td>
                      <td className="border-r border-slate-300">4</td>
                      <td className="border-r border-slate-300">3</td>
                      <td className="border-r border-slate-300">2</td>
                      <td className="border-r border-slate-300">1</td>
                      <td>0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              SIGNATURES, HEADMASTER STAMP & VERIFICATION QR CODE
              ========================================================================= */}
          <div className="mt-6 pt-3 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-[10px] print:text-[8.5px]">
            {/* Class Teacher Signature */}
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                Class Teacher&apos;s Remarks and Signature:
              </span>
              <p className="italic text-slate-600 text-[9.5px]">
                &ldquo;Hardworking student with consistent academic progress.&rdquo;
              </p>
              <div className="mt-7 border-b border-slate-500 w-36" />
              <div className="text-[8.5px] text-slate-500 mt-0.5">Signature & Date</div>
            </div>

            {/* Parent Signature */}
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                Parent&apos;s Signature:
              </span>
              <div className="mt-9 border-b border-slate-500 w-36" />
              <div className="text-[8.5px] text-slate-500 mt-0.5">Guardian Signature</div>
            </div>

            {/* Headmaster Approval, Official Stamp & QR Code */}
            <div className="text-right flex flex-col items-end">
              <span className="font-bold text-slate-900 block mb-1">
                Headmaster Stamp and Signature:
              </span>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-16 h-16 border border-slate-400 p-1 rounded bg-white flex flex-col items-center justify-center text-[6px] font-mono text-slate-800 text-center shadow-xs shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Scan to Auto-Download Report" className="w-12 h-12 object-contain" />
                  ) : (
                    <QrCode className="w-8 h-8 text-slate-800" />
                  )}
                  <span className="font-extrabold text-[5.5px] text-blue-900 tracking-tighter uppercase">SCAN TO DOWNLOAD</span>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-500 w-32" />
                  <div className="text-[8.5px] text-slate-700 font-bold mt-1">
                    {activeSchool.headteacher_name || activeSchool.principal_name || 'School Principal / Headmaster'}
                  </div>
                  <div className="text-[8px] text-slate-500">
                    Date: {formattedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              CUSTOM FOOTER
              ========================================================================= */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-500 flex items-center justify-between">
            <span>School Contacts: {activeSchool.phone} · {activeSchool.contact_email}</span>
            <span className="font-semibold text-slate-700">
              Report made using Elimu360 SIMS · System Verification: {activeSchool.code || 'U6CRG'}
            </span>
          </div>

          </div>

        </div>

      </div>
    </div>
  );
};
