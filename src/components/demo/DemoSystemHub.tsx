import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  Smartphone, 
  Users, 
  Award, 
  TrendingUp, 
  ArrowRight,
  FileCheck2,
  Printer,
  Eye,
  X,
  Plus,
  QrCode,
  Shield,
  Wallet,
  Clock,
  Laptop,
  CheckCircle
} from 'lucide-react';
import { parseCleanNumber, formatRWF } from '../../utils/numberUtils';

// =========================================================================
// ISOLATED HARDCODED DEMO DATASET (ZERO CROSS-TENANT PROFILE LEAKS)
// =========================================================================
const DEMO_INSTITUTION = {
  name: 'Elimu360 Model Demonstration Academy',
  code: 'DEMO-KGL-001',
  motto: 'Excellence in Competency & Integrity',
  city: 'Gasabo District, Kigali City',
  principal: 'Dr. Emmanuel Habimana',
  dos: 'Madame Claire Mukamana',
  bursar: 'Jean Claude Nshimiyimana',
  dod: 'Major (Rtd) Alphonse Gasana',
  academic_year: '2026-2027 Academic Year',
  active_term: 'Term 1',
  phone: '+250 788 360 360',
  email: 'model.academy@elimu360.rw',
  accreditation: 'MINEDUC / REB National Standard Grade A'
};

const DEMO_METRICS = {
  total_students: 840,
  total_teachers: 42,
  expected_fees_rwf: 126000000,
  collected_fees_rwf: 108500000,
  collection_rate: 86.1,
  arrears_rwf: 17500000,
  rwanda_pass_rate: 98.4,
  sms_delivery_rate: 100
};

interface DemoStudent {
  id: string;
  name: string;
  reg_no: string;
  class_name: string;
  gender: 'F' | 'M';
  parent_name: string;
  parent_phone: string;
  tuition_expected: number;
  tuition_paid: number;
  conduct_score: number;
  class_rank: string;
  average_grade: string;
  marks: { subject: string; cat: number; exam: number; total: number; grade: string; remarks: string }[];
}

const DEMO_STUDENTS: DemoStudent[] = [
  {
    id: 'DEMO-STU-001',
    name: 'Keza Aline',
    reg_no: '2026/S1/001',
    class_name: 'Senior 1 - A',
    gender: 'F',
    parent_name: 'Jean Paul Mugisha',
    parent_phone: '+250 788 123 456',
    tuition_expected: 150000,
    tuition_paid: 150000,
    conduct_score: 39,
    class_rank: '1st / 45',
    average_grade: 'A (88.4%)',
    marks: [
      { subject: 'Mathematics', cat: 36, exam: 54, total: 90, grade: 'A', remarks: 'Outstanding logical reasoning' },
      { subject: 'English Language', cat: 35, exam: 52, total: 87, grade: 'A', remarks: 'Fluent and articulate analysis' },
      { subject: 'Kinyarwanda', cat: 38, exam: 55, total: 93, grade: 'A', remarks: 'Exemplary cultural proficiency' },
      { subject: 'Physics', cat: 34, exam: 51, total: 85, grade: 'A', remarks: 'Strong practical comprehension' },
      { subject: 'Chemistry', cat: 32, exam: 53, total: 85, grade: 'A', remarks: 'Excellent lab report execution' },
      { subject: 'Biology', cat: 36, exam: 50, total: 86, grade: 'A', remarks: 'Deep anatomical understanding' },
      { subject: 'ICT & Coding', cat: 39, exam: 57, total: 96, grade: 'A', remarks: 'Mastered Python syntax' }
    ]
  },
  {
    id: 'DEMO-STU-002',
    name: 'Mugisha David',
    reg_no: '2026/S1/002',
    class_name: 'Senior 1 - A',
    gender: 'M',
    parent_name: 'Beata Mukandori',
    parent_phone: '+250 788 234 567',
    tuition_expected: 150000,
    tuition_paid: 90000,
    conduct_score: 36,
    class_rank: '2nd / 45',
    average_grade: 'B (76.8%)',
    marks: [
      { subject: 'Mathematics', cat: 30, exam: 48, total: 78, grade: 'B', remarks: 'Solid algebraic foundation' },
      { subject: 'English Language', cat: 28, exam: 46, total: 74, grade: 'B', remarks: 'Good written grammar' },
      { subject: 'Kinyarwanda', cat: 34, exam: 50, total: 84, grade: 'A', remarks: 'Very good comprehension' },
      { subject: 'Physics', cat: 29, exam: 44, total: 73, grade: 'B', remarks: 'Consistent effort shown' },
      { subject: 'Chemistry', cat: 31, exam: 45, total: 76, grade: 'B', remarks: 'Attentive during experiments' },
      { subject: 'Biology', cat: 30, exam: 47, total: 77, grade: 'B', remarks: 'Good diagrams presentation' },
      { subject: 'ICT & Coding', cat: 35, exam: 49, total: 84, grade: 'A', remarks: 'Great enthusiasm for tech' }
    ]
  },
  {
    id: 'DEMO-STU-003',
    name: 'Ineza Grace',
    reg_no: '2026/S2/015',
    class_name: 'Senior 2 - B',
    gender: 'F',
    parent_name: 'Francois Kayinamura',
    parent_phone: '+250 788 345 678',
    tuition_expected: 160000,
    tuition_paid: 160000,
    conduct_score: 40,
    class_rank: '1st / 48',
    average_grade: 'A (91.2%)',
    marks: [
      { subject: 'Mathematics', cat: 38, exam: 56, total: 94, grade: 'A', remarks: 'Brilliant problem solver' },
      { subject: 'English Language', cat: 36, exam: 54, total: 90, grade: 'A', remarks: 'Exemplary essay writing' },
      { subject: 'Kinyarwanda', cat: 39, exam: 57, total: 96, grade: 'A', remarks: 'Flawless linguistic mastery' },
      { subject: 'Physics', cat: 37, exam: 52, total: 89, grade: 'A', remarks: 'Outstanding scientific reasoning' },
      { subject: 'Chemistry', cat: 35, exam: 53, total: 88, grade: 'A', remarks: 'Precise quantitative analysis' },
      { subject: 'Biology', cat: 36, exam: 53, total: 89, grade: 'A', remarks: 'Excellent project work' },
      { subject: 'ICT & Coding', cat: 40, exam: 59, total: 99, grade: 'A', remarks: 'Exceptional programming talent' }
    ]
  },
  {
    id: 'DEMO-STU-004',
    name: 'Uwase Diane',
    reg_no: '2026/S3/044',
    class_name: 'Senior 3 - A',
    gender: 'F',
    parent_name: 'Jeanne Umutoni',
    parent_phone: '+250 788 456 789',
    tuition_expected: 175000,
    tuition_paid: 100000,
    conduct_score: 38,
    class_rank: '4th / 42',
    average_grade: 'B (79.5%)',
    marks: [
      { subject: 'Mathematics', cat: 31, exam: 47, total: 78, grade: 'B', remarks: 'Capable in trigonometry' },
      { subject: 'English Language', cat: 34, exam: 50, total: 84, grade: 'A', remarks: 'Articulate debating skills' },
      { subject: 'Kinyarwanda', cat: 35, exam: 49, total: 84, grade: 'A', remarks: 'Expressive literature essays' },
      { subject: 'Physics', cat: 28, exam: 46, total: 74, grade: 'B', remarks: 'Good grasp of thermodynamics' },
      { subject: 'Chemistry', cat: 32, exam: 48, total: 80, grade: 'A', remarks: 'Active laboratory leader' },
      { subject: 'Biology', cat: 30, exam: 47, total: 77, grade: 'B', remarks: 'Diligent genetics research' },
      { subject: 'ICT & Coding', cat: 33, exam: 48, total: 81, grade: 'A', remarks: 'Strong database fundamentals' }
    ]
  },
  {
    id: 'DEMO-STU-005',
    name: 'Ndayisaba Eric',
    reg_no: '2026/S4/008',
    class_name: 'Senior 4 - MCB',
    gender: 'M',
    parent_name: 'Charles Nshimiyimana',
    parent_phone: '+250 788 567 890',
    tuition_expected: 200000,
    tuition_paid: 200000,
    conduct_score: 37,
    class_rank: '3rd / 38',
    average_grade: 'A (84.1%)',
    marks: [
      { subject: 'Mathematics (Advanced)', cat: 33, exam: 50, total: 83, grade: 'A', remarks: 'Strong calculus integration' },
      { subject: 'Chemistry (Advanced)', cat: 34, exam: 51, total: 85, grade: 'A', remarks: 'Exemplary organic titration' },
      { subject: 'Biology (Advanced)', cat: 35, exam: 52, total: 87, grade: 'A', remarks: 'Deep cellular biochemistry' },
      { subject: 'General Paper (GP)', cat: 32, exam: 49, total: 81, grade: 'A', remarks: 'Critical societal analysis' },
      { subject: 'Entrepreneurship', cat: 34, exam: 51, total: 85, grade: 'A', remarks: 'Compelling business plan' }
    ]
  }
];

export const DemoSystemHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'DIRECTOR' | 'DOS' | 'BURSAR' | 'DOD' | 'TEACHER' | 'PARENT'
  >('OVERVIEW');

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<DemoStudent | null>(null);

  // Bursar Interactive Simulator State
  const [demoPayerName, setDemoPayerName] = useState('Jean Paul Mugisha');
  const [demoPayerPhone, setDemoPayerPhone] = useState('+250 788 123 456');
  const [demoPaymentAmount, setDemoPaymentAmount] = useState<number | string>(100000);
  const [demoFeeCategory, setDemoFeeCategory] = useState('Tuition & Feeding Fee');
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_OF_KIGALI' | 'CASH'>('MTN_MOMO');
  const [demoSimulatedReceipt, setDemoSimulatedReceipt] = useState<{
    receipt_no: string;
    amount: number;
    payer: string;
    sms: string;
    time: string;
  } | null>(null);

  // DOS Marks Simulator State
  const [demoTestScore, setDemoTestScore] = useState<number>(34);
  const [demoExamScore, setDemoExamScore] = useState<number>(54);
  const demoTotal = Math.min(100, Math.max(0, demoTestScore + demoExamScore));
  const demoPercentage = demoTotal;
  const demoGrade = demoPercentage >= 80 ? 'A' : demoPercentage >= 70 ? 'B' : demoPercentage >= 60 ? 'C' : demoPercentage >= 50 ? 'D' : demoPercentage >= 40 ? 'E' : 'F';

  // DOD Infraction Simulator State
  const [demoDodConduct, setDemoDodConduct] = useState(38);
  const [demoInfractionText, setDemoInfractionText] = useState('Late arrival for morning assembly');
  const [demoGatePassStudent, setDemoGatePassStudent] = useState('Keza Aline (Senior 1 - A)');
  const [demoGatePassGenerated, setDemoGatePassGenerated] = useState<string | null>(null);

  const handleCopyDemoLink = () => {
    const demoUrl = `${window.location.origin}${window.location.pathname}?view=demo`;
    navigator.clipboard.writeText(demoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseCleanNumber(demoPaymentAmount);
    if (cleanAmt <= 0) {
      alert("Please enter a valid amount greater than 0 RWF.");
      return;
    }

    const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const sms = `Elimu360 Alert [${DEMO_INSTITUTION.code}]: Fee payment receipt ${receiptNo} recorded for Keza Aline. Amount: RWF ${cleanAmt.toLocaleString()} (${demoFeeCategory}) via ${demoPaymentMethod.replace('_', ' ')}. Verified by Bursar Office. Thank you!`;
    
    setDemoSimulatedReceipt({
      receipt_no: receiptNo,
      amount: cleanAmt,
      payer: demoPayerName,
      sms: sms,
      time: new Date().toLocaleTimeString()
    });
  };

  const handleGenerateGatePass = () => {
    const passId = `GP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setDemoGatePassGenerated(passId);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* =========================================================================
          HERO PRESENTATION BANNER (SANDBOX CLONE)
          ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Isolated Pitch & Live Simulation Sandbox</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Elimu360 Institutional SIMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-200">Interactive Demo Clone</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Demonstrate the complete ecosystem to <strong>School Owners, Headmasters, Principals, and Education Boards</strong> using <strong>100% hard-coded, zero-risk sandbox data</strong> that never touches or exposes private school tenants.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 100% Isolated Sandbox
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <CheckCircle2 className="w-4 h-4" /> Real Rwanda REB Report Cards
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <CheckCircle2 className="w-4 h-4" /> Live Mobile MoMo & SMS Simulator
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleCopyDemoLink}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Pitch Link Copied!' : 'Copy Demo Link for School Owners'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print Institutional Pitch Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE SANDBOX NAVIGATION RIBBON
          ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { key: 'OVERVIEW', label: '1. Executive Pitch Overview', icon: Building2 },
          { key: 'DIRECTOR', label: '2. 👔 School Director Console', icon: Award },
          { key: 'DOS', label: '3. 📚 DOS & REB Report Cards', icon: FileCheck2 },
          { key: 'BURSAR', label: '4. 💰 Chief Bursar & MoMo SMS', icon: CreditCard },
          { key: 'DOD', label: '5. ⚖️ DOD Behavioral Conduct (/40)', icon: ShieldCheck },
          { key: 'TEACHER', label: '6. 👨‍🏫 Teacher CBC Planner', icon: BookOpen },
          { key: 'PARENT', label: '7. 👨‍👩‍👧 Parent & Student Mobile', icon: Smartphone }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: EXECUTIVE PITCH OVERVIEW
          ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Institutional KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demo Enrollment</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">{DEMO_METRICS.total_students}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Students (S1 - S6)</span>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tuition Inflow</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">86.1%</div>
              <span className="text-[10px] text-slate-400">RWF 108.5M Collected</span>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">REB Pass Rate</span>
              <div className="text-2xl font-black text-amber-300 mt-1 font-mono">98.4%</div>
              <span className="text-[10px] text-amber-400/80 font-semibold">MINEDUC Standard A</span>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Certified Teachers</span>
              <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">{DEMO_METRICS.total_teachers}</div>
              <span className="text-[10px] text-slate-400">100% CBC Compliant</span>
            </div>
          </div>

          {/* Three Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-white">85% Faster Report Card Deliberation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eliminate manual arithmetic errors and late nights. Calculates CAT, Exam, Midterm, and End-of-Term Rwandan weights automatically according to REB national standards.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('DOS')}
                  className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>See Rwanda REB Report Card Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
                🔒
              </div>
              <h3 className="text-lg font-bold text-white">Zero Hardcoded Financial Leaks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Empower your Chief Bursar to set school-specific payable fees (Day, Boarder, Level by Level). Every payment generates an instant printable receipt and SMS alert.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('BURSAR')}
                  className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Test Live Bursar Payment Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xl">
                📲
              </div>
              <h3 className="text-lg font-bold text-white">Instant Automated Parent SMS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct integration with Africa's Talking SMS API. Parents receive instant notifications when payments are recorded, report cards are published, or gates are passed.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('PARENT')}
                  className="text-xs text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Simulate Parent Portal View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SCHOOL DIRECTOR CONSOLE (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'DIRECTOR' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Persona 1 · Executive Management</span>
                <h3 className="text-lg font-bold text-white mt-0.5">School Director & Headmaster Executive Console</h3>
                <p className="text-xs text-slate-400">Institutional Governance & MINEDUC Compliance Dials</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MINEDUC Accredited (REB Grade A)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400">Total Academic Revenue</span>
                <div className="text-xl font-black text-white font-mono">RWF 108,500,000</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86.1%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Collected: 86.1%</span>
                  <span>Target: 126M</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400">Staff Delegation Matrix</span>
                <div className="text-xl font-black text-indigo-300 font-mono">42 Teaching · 6 Admin</div>
                <div className="text-xs text-slate-300">DOS, DOD, Bursar, 39 Class Subject Teachers</div>
                <div className="text-[10px] text-emerald-400 font-semibold">100% Roles Assigned</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400">Academic Year Status</span>
                <div className="text-xl font-black text-amber-300 font-mono">2026-2027 · Term 1</div>
                <div className="text-xs text-slate-300">Deliberation Protocol: Ready</div>
                <div className="text-[10px] text-indigo-300 font-semibold">Term Closes in 18 Days</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs text-slate-300">
              <strong className="text-indigo-200">Director Demonstration Script:</strong>
              <p>
                "As the school proprietor or headmaster, you have absolute oversight over all departments. You can audit fee collections live without waiting for end-of-month spreadsheets, verify teacher lesson planning, and monitor campus security in real time."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DOS & REB REPORT CARDS (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'DOS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Calculator */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Persona 2 · Academic Directorate</span>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Rwanda REB Marks & Grade Simulator</span>
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Demonstrate how Elimu360 calculates Continuous Assessment Tests (CAT /40) and Terminal Examinations (/60) to yield final 100% REB Rwanda Letter Grades:
              </p>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Continuous Assessment Tests (CAT / Test Mark):</span>
                    <span className="text-amber-400 font-bold">{demoTestScore} / 40</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={demoTestScore}
                    onChange={(e) => setDemoTestScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Terminal Examination Mark:</span>
                    <span className="text-indigo-400 font-bold">{demoExamScore} / 60</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={demoExamScore}
                    onChange={(e) => setDemoExamScore(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Calculated Total:</span>
                    <div className="text-2xl font-black text-white font-mono">{demoTotal} <span className="text-sm font-normal text-slate-400">/ 100 ({demoPercentage}%)</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">REB Letter Grade:</span>
                    <div className={`text-2xl font-black ${demoGrade === 'A' ? 'text-emerald-400' : demoGrade === 'B' ? 'text-indigo-400' : demoGrade === 'C' ? 'text-amber-400' : 'text-rose-400'}`}>
                      Grade {demoGrade}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Report Card Roster */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <span>1-Click Rwanda REB Report Card Generator</span>
              </h3>
              <p className="text-xs text-slate-300">
                Click any student below to inspect their authentic, MINEDUC-formatted A4 Terminal Dossier with QR verification and automatic promotion deliberation:
              </p>

              <div className="space-y-2.5">
                {DEMO_STUDENTS.map(stu => (
                  <div 
                    key={stu.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{stu.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({stu.reg_no})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {stu.class_name} · Rank: <strong className="text-amber-300">{stu.class_rank}</strong> · Conduct: <strong className="text-emerald-400">{stu.conduct_score}/40</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReportStudent(stu)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Report</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CHIEF BURSAR & MOMO SMS (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'BURSAR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Payment Simulator Form */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Persona 3 · Financial Directorate</span>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Live Bursar Fee Payment Simulator</span>
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Demonstrate how the Chief Bursar records school fees (supports formats like 100000, 150,000, etc.) and triggers instant automated parent SMS receipts:
              </p>

              <form onSubmit={handleSimulatePayment} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student / Candidate:</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                    {DEMO_STUDENTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class_name}) - Expected: RWF {s.tuition_expected.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fee Category:</label>
                    <select
                      value={demoFeeCategory}
                      onChange={(e) => setDemoFeeCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="Tuition & Feeding Fee">Tuition & Feeding Fee</option>
                      <option value="Boarding & Welfare Fee">Boarding & Welfare Fee</option>
                      <option value="Examination Registration">Examination Registration</option>
                      <option value="Science Lab & ICT Levy">Science Lab & ICT Levy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Channel:</label>
                    <select
                      value={demoPaymentMethod}
                      onChange={(e) => setDemoPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="MTN_MOMO">MTN Mobile Money (*182#)</option>
                      <option value="AIRTEL_MONEY">Airtel Money (*500#)</option>
                      <option value="BANK_OF_KIGALI">Bank of Kigali (BK Slip)</option>
                      <option value="CASH">Institutional Cash Office</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Amount to Pay (RWF):</label>
                    <input
                      type="text"
                      placeholder="e.g. 100000 or 150,000"
                      value={demoPaymentAmount}
                      onChange={(e) => setDemoPaymentAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payer Name / Guardian:</label>
                    <input
                      type="text"
                      value={demoPayerName}
                      onChange={(e) => setDemoPayerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Record Payment & Simulate Instant SMS Dispatch</span>
                </button>
              </form>
            </div>

            {/* Simulated Live SMS & Receipt Preview */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <span>Africa's Talking Parent SMS Terminal</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Preview what the guardian instantly receives on their mobile phone upon fee verification:
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                    <span>GATEWAY: AFRICA'S TALKING MULTI-CARRIER</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      DELIVERED (100%)
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-200">
                    {demoSimulatedReceipt?.sms || `Elimu360 Alert [${DEMO_INSTITUTION.code}]: Fee payment receipt REC-2026-8812 recorded for Keza Aline. Amount: RWF 100,000 (Tuition & Feeding Fee). Recorded by Bursar. Thank you!`}
                  </p>
                  {demoSimulatedReceipt && (
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      Dispatched at {demoSimulatedReceipt.time} · Serial: {demoSimulatedReceipt.receipt_no}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-2 text-xs text-slate-300">
                <strong className="text-amber-200">Bursar Pitch Value Proposition:</strong>
                <p>
                  "No more disputes with parents over fake receipts or lost bank slips. Every payment generates a verifiable serial number, balances the double-entry ledger, and sends an SMS receipt to the parent's phone within 2 seconds."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: DOD BEHAVIORAL CONDUCT (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'DOD' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Persona 4 · Disciplinary Directorate</span>
            <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>Director of Discipline (DOD) Rwanda 40-Mark System</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              In Rwandan primary & secondary schools, student conduct begins at 40 Marks. Infractions deduct points and impact the terminal report card.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center">
              <span className="text-2xl font-black text-emerald-400">36 - 40</span>
              <h4 className="text-xs font-bold text-white">Grade A (Exemplary)</h4>
              <p className="text-[11px] text-slate-400">Outstanding disciplinary standing</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1 text-center">
              <span className="text-2xl font-black text-indigo-400">30 - 35</span>
              <h4 className="text-xs font-bold text-white">Grade B (Good)</h4>
              <p className="text-[11px] text-slate-400">Satisfactory behavioral record</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-center">
              <span className="text-2xl font-black text-amber-400">24 - 29</span>
              <h4 className="text-xs font-bold text-white">Grade C (Warning)</h4>
              <p className="text-[11px] text-slate-400">Parent conference recommended</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-center">
              <span className="text-2xl font-black text-rose-400">&lt; 24</span>
              <h4 className="text-xs font-bold text-white">Grade D / F (Probation)</h4>
              <p className="text-[11px] text-slate-400">Severe disciplinary intervention</p>
            </div>
          </div>

          {/* Interactive Gate Pass Generator */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-rose-400" />
              <span>Interactive Digital Gate Exit Pass Generator</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={demoGatePassStudent}
                onChange={(e) => setDemoGatePassStudent(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="Keza Aline (Senior 1 - A)">Keza Aline (Senior 1 - A) · Reason: Medical Appointment</option>
                <option value="Mugisha David (Senior 1 - A)">Mugisha David (Senior 1 - A) · Reason: Family Event</option>
                <option value="Ineza Grace (Senior 2 - B)">Ineza Grace (Senior 2 - B) · Reason: Inter-school Debate</option>
              </select>

              <button
                type="button"
                onClick={handleGenerateGatePass}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
              >
                Generate Authorized Gate Pass
              </button>
            </div>

            {demoGatePassGenerated && (
              <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">Official Gate Pass #{demoGatePassGenerated}</div>
                  <div className="text-slate-400 mt-0.5">Authorized for {demoGatePassStudent} · Valid for 4 Hours</div>
                </div>
                <div className="text-emerald-400 font-bold font-mono px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800">
                  QR VERIFIED & ACTIVE
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: TEACHER & CBC PLANNER (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'TEACHER' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Persona 5 · Teaching Faculty</span>
            <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Competency-Based Curriculum (CBC) Lesson Planner</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Demonstrate how teachers create REB-compliant weekly schemes of work with Key Unit Competences, Bloom's Taxonomy, and assessment criteria:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-300">Unit Competence Title</span>
              <p className="text-xs text-slate-200 font-semibold">Unit 4: Linear Algebra & Coordinate Geometry</p>
              <span className="text-[10px] text-slate-400">Class: Senior 2 Mathematics · 6 Periods</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-300">Learning Outcomes</span>
              <p className="text-xs text-slate-200">Plot 2D coordinates, calculate slopes, solve simultaneous linear equations graphically.</p>
              <span className="text-[10px] text-emerald-400">Cognitive & Psychomotor skills</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300">Teaching Methodology</span>
              <p className="text-xs text-slate-200">Learner-centered group graphing practicals and GeoGebra tablet demonstrations.</p>
              <span className="text-[10px] text-amber-400">100% CBC REB Standard</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: PARENT & STUDENT PORTAL (DEMO CLONE)
          ========================================================================= */}
      {activeTab === 'PARENT' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Persona 6 & 7 · Community Trust</span>
            <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <span>Parent Portal & Student Learning Space</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Parents can check real-time attendance, fee receipts, and terminal report card downloads from any smartphone:
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 rounded-3xl bg-slate-950 border-2 border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Parent Guardian Space</span>
              </div>
              <span className="text-[11px] font-mono text-purple-300">Keza Aline (S1-A)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Term 1 Tuition Status:</span>
                <span className="text-emerald-400 font-bold font-mono">FULLY PAID (RWF 150,000)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Disciplinary Conduct:</span>
                <span className="text-emerald-400 font-bold font-mono">39 / 40 (Grade A)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Class Rank:</span>
                <span className="text-amber-300 font-bold font-mono">1st Position in Class</span>
              </div>

              <button
                onClick={() => setSelectedReportStudent(DEMO_STUDENTS[0])}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Official Terminal Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RWANDA REB OFFICIAL A4 REPORT CARD PREVIEW (DEMO CLONE)
          ========================================================================= */}
      {selectedReportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-700" />
                <span className="font-bold text-sm text-slate-900">Official Rwanda REB Terminal Report Card Preview</span>
              </div>
              <button
                onClick={() => setSelectedReportStudent(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Official Rwandan Document Header */}
            <div className="text-center space-y-1.5 border-b pb-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">REPUBLIC OF RWANDA</div>
              <div className="text-[10px] font-semibold text-slate-500">MINISTRY OF EDUCATION (MINEDUC) · RWANDA EDUCATION BOARD (REB)</div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">{DEMO_INSTITUTION.name}</h2>
              <div className="text-xs text-slate-600">{DEMO_INSTITUTION.city} · Code: {DEMO_INSTITUTION.code}</div>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold font-mono mt-1">
                ACADEMIC DOSSIER · {DEMO_INSTITUTION.academic_year} · {DEMO_INSTITUTION.active_term}
              </div>
            </div>

            {/* Student Dossier Bio */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900">{selectedReportStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Registration No</span>
                <span className="font-bold font-mono text-slate-900">{selectedReportStudent.reg_no}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Class / Stream</span>
                <span className="font-bold text-slate-900">{selectedReportStudent.class_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Disciplinary Conduct</span>
                <span className="font-bold text-emerald-700 font-mono">{selectedReportStudent.conduct_score} / 40 Marks</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2.5 rounded-l-lg">Subject Name</th>
                    <th className="p-2.5 text-center">CAT (/40)</th>
                    <th className="p-2.5 text-center">Exam (/60)</th>
                    <th className="p-2.5 text-center">Total (/100)</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 rounded-r-lg">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedReportStudent.marks.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{m.subject}</td>
                      <td className="p-2.5 text-center font-mono text-slate-700">{m.cat}</td>
                      <td className="p-2.5 text-center font-mono text-slate-700">{m.exam}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900">{m.total}%</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">{m.grade}</td>
                      <td className="p-2.5 text-slate-600 italic">{m.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary & Signatures */}
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Deliberation Decision:</div>
                <div className="text-emerald-700 font-bold">PROMOTED TO NEXT ACADEMIC LEVEL (Rank: {selectedReportStudent.class_rank})</div>
                <div className="text-slate-500 text-[11px]">Academic Average: {selectedReportStudent.average_grade}</div>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <div className="text-[11px] text-slate-500">School Headmaster Signature & Stamp</div>
                <div className="font-bold text-slate-900 font-serif italic text-sm">{DEMO_INSTITUTION.principal}</div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold">QR SECURE VERIFIED · NO SIGNATURE FORGERY</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportStudent(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
