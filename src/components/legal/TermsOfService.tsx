import React from 'react';
import { ShieldCheck, FileText, Lock, CheckCircle2, AlertTriangle, ArrowLeft, ShieldAlert, BadgeCheck, Scale } from 'lucide-react';
import { ElimuLogo } from '../brand/ElimuLogo';

interface TermsProps {
  onBack?: () => void;
  isModal?: boolean;
}

export const TermsOfService: React.FC<TermsProps> = ({ onBack, isModal = false }) => {
  return (
    <div className={`text-slate-100 ${isModal ? 'p-6 max-h-[80vh] overflow-y-auto' : 'min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
              <Scale className="w-4 h-4" />
              <span>SOVEREIGN OPERATIONAL LICENSING FRAMEWORK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Elimu360 Master Terms of Service & Acceptable Use Protocol
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Last Updated: August 2026 · Governed Under Rwandan Commercial Software Statutes & International Standards
            </p>
          </div>

          <p className="text-slate-300 text-sm">
            Please read these Master Terms of Service carefully before provisionining or accessing any school tenant instance 
            within the <strong>Elimu360 School Information Management System (SIMS)</strong>. These terms establish a legally binding 
            agreement between the subscribing educational institution, its delegated administrative officers, teachers, librarians, 
            bursars, parents, and Elimu360 SIMS Operations (The Palace Tech House).
          </p>

          {/* Acceptable Use Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <BadgeCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-white text-xs">Lawful Authorisation</h4>
              <p className="text-[10px] text-slate-400">Only accredited educational officers are authorized to operate system accounts.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <Lock className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white text-xs">Tenant Boundaries</h4>
              <p className="text-[10px] text-slate-400">Strictly isolated database scopes. Any probing is immediately flagged.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-white text-xs">Immutable Ledgers</h4>
              <p className="text-[10px] text-slate-400">Financial records and payment receipts are unalterable once saved.</p>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-6">

            {/* Section 1: Tenant Licensing */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>1. Multi-Tenant Logical Partition Scopes</span>
              </h2>
              <p className="text-xs text-slate-300">
                Elimu360 SIMS delivers structural multi-tenant partitioning under unique school identifier keys. 
                Subscribing schools operate with sovereign rights over their student logs, academic rosters, grading rubrics, 
                and bursar ledgers.
              </p>
              <p className="text-xs text-slate-400">
                Any effort by any user to forge, query, or enumerate parameters outside their designated `<code className="text-amber-300 font-mono">school_id</code>` 
                constitutes a critical security breach, triggering automatic account locks, IP restriction, and referral to the National Cyber Security Authority (NCSA).
              </p>
            </div>

            {/* Section 2: Role Responsibilities */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>2. Dynamic Role Isolation & Access Accountability</span>
              </h2>
              <p className="text-xs text-slate-300">
                Access privileges within the platform are rigidly restricted through role-based access control (RBAC). 
                Each user role is accountable for actions within their respective scope:
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pl-4 list-disc">
                <li>
                  <strong className="text-white">Super Administrator:</strong> Governing platform health, school provisioning, and multi-tenant scaling. Under privacy safeguards, Super Admins have NO authority to modify grade files.
                </li>
                <li>
                  <strong className="text-white">Director of Studies (DOS):</strong> Configuring streams, timetables, academic periods, and teachers. Banned from bursar fee portals.
                </li>
                <li>
                  <strong className="text-white">Chief Bursar:</strong> Enforcing fee structures, tracking payments, and issuing receipts. Bursar logs are permanent and fully audit-trailed.
                </li>
                <li>
                  <strong className="text-white">Teachers & Staff:</strong> Uploading grades, taking daily attendance, and updating profiles. Passwords must be kept secure.
                </li>
              </ul>
            </div>

            {/* Section 3: Financial Integrity */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>3. Financial Portals & Ledger Immutability</span>
              </h2>
              <p className="text-xs text-slate-300">
                School fees entered manually or reconciled via MTN Mobile Money API generate receipts with cryptographic references. 
                To ensure public trust and prevent fraudulent accounting, Elimu360 SIMS forbids retrograde deletion of finalized fee payment slips. 
                Correction parameters must be declared through explicit, audit-logged adjusting entries.
              </p>
            </div>

            {/* Section 4: Performance Caching */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>4. Caching Continuity & Device Responsibility</span>
              </h2>
              <p className="text-xs text-slate-300">
                To minimize bandwidth consumption on cellular connections, Elimu360 operates on a local-first batch loading model. 
                Data loads during active sessions and syncs securely. 
                Users are solely responsible for keeping their browser/devices updated to guarantee synchronization and prevent local cache corruption.
              </p>
            </div>

            {/* Section 5: Enforcement */}
            <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/30 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>5. Revocation & Termination of Access</span>
              </h2>
              <p className="text-xs text-slate-300">
                Suspected fraudulent activity, unauthorized grade manipulation, or account sharing with non-institutional personnel 
                will lead to immediate suspension of the offending user's account and termination of school-wide platform licensing 
                following a 7-day administrative notice.
              </p>
            </div>

          </div>

          {/* Legal Acceptancy */}
          <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-200">
            By logging in, creating your secure salted password, or operating any module of Elimu360 SIMS, you signify your 
            unconditional agreement to adhere strictly to these terms and acceptable use guidelines.
          </div>

        </div>
      </div>
    </div>
  );
};
