import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2, FileText, ArrowLeft, Database, Globe, UserCheck, ShieldAlert } from 'lucide-react';
import { ElimuLogo } from '../brand/ElimuLogo';

interface PrivacyProps {
  onBack?: () => void;
  isModal?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyProps> = ({ onBack, isModal = false }) => {
  return (
    <div className={`text-slate-100 ${isModal ? 'p-6 max-h-[80vh] overflow-y-auto' : 'min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <ElimuLogo size="md" />
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to System</span>
            </button>
          )}
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          {/* Main Title Banner */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>COMPLIANT WITH RWANDAN LAW N° 058/2021 & GDPR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Elimu360 SIMS Institutional Privacy & Data Sovereignty Policy
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Effective Date: August 2026 · Master Public Disclosure and Educational Information Safeguards
            </p>
          </div>

          <p className="text-slate-300 text-sm">
            This Institutional Privacy & Data Sovereignty Policy governs the collection, processing, isolation, and protection of 
            personally identifiable educational records, financial ledger transactions, and user logs within the 
            <strong> Elimu360 School Information Management System (SIMS)</strong>. Designed for strict adherence to the Law of Rwanda No 058/2021 relating to the 
            Protection of Personal Data and Privacy, the system operates as a zero-commercialization, role-isolated, and high-performance sovereign multi-tenant portal.
          </p>

          {/* Core Commitments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Zero Commercialization</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Elimu360 has never, does not, and will never sell, lease, rent, or trade student, staff, parent, or financial data to any third-party advertizers or corporate brokers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <Database className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Strict Multi-Tenant Isolation</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every record is hard-isolated behind database scoping keys. It is impossible for users in one school to query or view records of another school.
              </p>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-6">
            
            {/* Section 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>1. Processing of Minor & Student Educational Records</span>
              </h2>
              <p className="text-xs text-slate-300">
                Under educational governance frameworks, student data processed within Elimu360 (including full names, dates of birth, 
                stream grades, discipline notes, and guardian linkages) is classified as <strong>Institutional Public Record</strong>, 
                maintained strictly for the purposes of curriculum compliance, REB certifications, and school operational workflows.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pl-4 list-disc">
                <li>
                  <strong className="text-slate-200">Consent & Guardianship:</strong> Guardian phone numbers are processed solely to issue direct SMS receipts, emergency notices, or attendance departures.
                </li>
                <li>
                  <strong className="text-slate-200">Accuracy & Access:</strong> Parents and guardians are granted transparent inspect-only access to their respective children's attendance and academic progress reports.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span>2. Multi-Tenant Cryptographic Partitioning</span>
              </h2>
              <p className="text-xs text-slate-300">
                To prevent accidental leakage or malicious cross-tenant querying, Elimu360 implements strict structural partition keys 
                and server-side rules.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pl-4 list-disc">
                <li>
                  <strong className="text-slate-200">Transit Protocols:</strong> All API requests and server-client transmissions are locked behind TLS 1.3 cryptographic tunnels.
                </li>
                <li>
                  <strong className="text-slate-200">Encrypted Storage:</strong> System credentials, passwords, and security answers are stored as irreversible cryptographic salted hashes using the Bcrypt hashing algorithm. No plaintext answers are ever logged.
                </li>
                <li>
                  <strong className="text-slate-200">Database Safeguards:</strong> Storage buckets are configured with granular Security Rules that block all non-authenticated operations.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span>3. Telecommunications & SMS Gateway Disclosures</span>
              </h2>
              <p className="text-xs text-slate-300">
                Automated SMS dispatches (including MTN MoMo fee payments, Gate Permissions, and Emergency Announcements) are routed through authorized 
                national telecommunications aggregators (including MTN Rwanda and Airtel Rwanda).
              </p>
              <p className="text-xs text-slate-400">
                The gateway is strictly configured to transmit transactional metrics. No behavioral logs or parent profile records are shared with telecom operators.
              </p>
            </div>

            {/* Section 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>4. Audit Logging & National Inspection Access</span>
              </h2>
              <p className="text-xs text-slate-300">
                To guarantee fiscal integrity and grade-ledger precision, every administrative or write operation (e.g., fee collection, 
                grade modifications, staff appointments) creates an irreversible, permanent **System Audit Trail**.
              </p>
              <p className="text-xs text-slate-400">
                Audit logs are non-deletable and are made accessible upon legal subpoena to certified school inspectors, board members, 
                and auditors from the Ministry of Education (MINEDUC) and Rwanda Education Board (REB).
              </p>
            </div>

            {/* Section 5 */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/30 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>5. Breach Notification Protocol</span>
              </h2>
              <p className="text-xs text-slate-300">
                In compliance with Rwanda Personal Data Protection and Privacy Law, in the highly improbable event of a validated structural data 
                incident or breach, Elimu360 operations officers will notify the affected School Heads and the National Cybersecurity Authority (NCSA) 
                within **72 hours**, followed by immediate multi-tenant credentials recycling.
              </p>
            </div>

          </div>

          {/* Institutional Contact */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Privacy & Compliance Inquiries</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For any questions regarding data rights, regulatory compliance audits, or data deletion inquiries, please reach out directly to:
            </p>
            <div className="text-xs text-amber-400 font-bold mt-1">
              compliance@elimu360.com · The Palace Tech House Legal Team
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
