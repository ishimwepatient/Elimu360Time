import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  FileText,
  ShieldCheck,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { ElimuLogo } from '../brand/ElimuLogo';
import { TermsOfService } from '../legal/TermsOfService';
import { PrivacyPolicy } from '../legal/PrivacyPolicy';

export const LoginPage: React.FC = () => {
  const { 
    login, 
    claimAccountAndSetPassword, 
    setCurrentView,
    theme,
    toggleTheme
  } = useElimu();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'CLAIM'>('LOGIN');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Claim / Password Setup Form State
  const [claimIdentifier, setClaimIdentifier] = useState('');
  const [claimToken, setClaimToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showClaimPassword, setShowClaimPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Legal Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setLoginLoading(true);

    setTimeout(() => {
      const res = login(loginIdentifier, loginPassword);
      setLoginLoading(false);
      if (res.success) {
        setLoginSuccess(res.message);
      } else {
        if (res.requireSetup) {
          setLoginError(res.message);
          setClaimIdentifier(loginIdentifier);
          // If token available on user object, we can pre-set
          if (res.user?.activation_token) {
            setClaimToken(res.user.activation_token);
          }
          setActiveTab('CLAIM');
        } else {
          setLoginError(res.message);
        }
      }
    }, 400);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);
    setClaimSuccess(null);

    if (!acceptedTerms) {
      setClaimError('You must accept the Elimu360 Terms of Service and Privacy Policy to activate your account.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setClaimError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (newPassword.length < 6) {
      setClaimError('Password must be at least 6 characters in length for institutional security.');
      return;
    }

    setClaimLoading(true);

    setTimeout(() => {
      const res = claimAccountAndSetPassword(claimIdentifier, claimToken, newPassword, acceptedTerms);
      setClaimLoading(false);
      if (res.success) {
        setClaimSuccess(res.message);
      } else {
        setClaimError(res.message);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Subtle Academic Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.2),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10 py-2">
        <button
          onClick={() => setCurrentView('LANDING')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-medium">Dark</span>
              </>
            )}
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <button
            onClick={() => setCurrentView('ABOUT_SYSTEM')}
            className="text-xs text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Elimu360</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Encrypted SIMS Gateway</span>
          </div>
        </div>
      </div>

      {/* Central Auth Container */}
      <div className="max-w-xl mx-auto w-full my-auto py-8 z-10">
        
        {/* Logo & Headline */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <ElimuLogo size="xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Institutional Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Unified multi-tenant authentication for Administrators, Academic Staff, Bursars, Teachers, Parents & Students.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto mb-6 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('LOGIN');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'LOGIN' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('CLAIM');
              setClaimError(null);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'CLAIM' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Claim Staff Account</span>
          </button>
        </div>

        {/* TAB 1: STANDARD SIGN IN */}
        {activeTab === 'LOGIN' && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email / Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ishimwepatient001@gmail.com or +250 788..."
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimIdentifier(loginIdentifier);
                      setActiveTab('CLAIM');
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    First time signing in?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your personal password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Success Banner */}
              {loginSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Institutional Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: CLAIM ACCOUNT / FIRST LOGIN PASSWORD SETUP */}
        {activeTab === 'CLAIM' && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-300">Single-Use Account Activation:</strong> Enter your exact registered institutional email and your one-time activation code. Once configured with your new password, this code is consumed and you will sign in using your password.
              </div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              
              {/* Email / Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. director@gsapadec.edu.rw or bursar@kigali-academy.rw"
                    value={claimIdentifier}
                    onChange={(e) => setClaimIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Activation Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Activation Code or Registry Code</span>
                  <span className="text-[10px] text-amber-400 font-normal normal-case">Directors can use Registry Code</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. REG-2026-8812 or DIR-GSAP-4821"
                    value={claimToken}
                    onChange={(e) => setClaimToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-amber-300 uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showClaimPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showClaimPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showClaimPw"
                  checked={showClaimPassword}
                  onChange={(e) => setShowClaimPassword(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="showClaimPw" className="text-xs text-slate-400 cursor-pointer">
                  Show passwords in plain text
                </label>
              </div>

              {/* Mandatory Terms & Policy Checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4 shrink-0"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-amber-400 font-semibold underline hover:text-amber-300 cursor-pointer"
                    >
                      Master Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-amber-400 font-semibold underline hover:text-amber-300 cursor-pointer"
                    >
                      Institutional Privacy Policy
                    </button>.
                  </span>
                </label>
              </div>

              {/* Error Banner */}
              {claimError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{claimError}</span>
                </div>
              )}

              {/* Success Banner */}
              {claimSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{claimSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={claimLoading}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {claimLoading ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <span>Set Password & Enter SIMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </div>

      {/* Footer Navigation & Compliance */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6 border-t border-slate-800/60 z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          Elimu360 SIMS · Developed by <strong className="text-slate-300">The Palace Tech House</strong>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button 
            onClick={() => setCurrentView('TERMS_OF_SERVICE')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Terms of Service
          </button>
          <span>·</span>
          <button 
            onClick={() => setCurrentView('PRIVACY_POLICY')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button 
            onClick={() => setCurrentView('ABOUT_SYSTEM')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            About System
          </button>
          <span>·</span>
          <button 
            onClick={() => setCurrentView('CONTACT_US')} 
            className="hover:text-amber-400 transition cursor-pointer font-bold text-emerald-400"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <TermsOfService isModal={true} onBack={() => setShowTermsModal(false)} />
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <PrivacyPolicy isModal={true} onBack={() => setShowPrivacyModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
