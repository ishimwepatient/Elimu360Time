import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Globe2, 
  ShieldCheck, 
  Award,
  Sparkles
} from 'lucide-react';
import { ElimuLogo } from '../brand/ElimuLogo';

interface ContactProps {
  onBack?: () => void;
  isModal?: boolean;
}

export const ContactUs: React.FC<ContactProps> = ({ onBack, isModal = false }) => {
  const [schoolName, setSchoolName] = useState('');
  const [repName, setRepName] = useState('');
  const [repRole, setRepRole] = useState('Headteacher / Director');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className={`text-slate-100 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : 'min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8'}`}>
      <div className="max-w-5xl mx-auto space-y-10">
        
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
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Title Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <MessageSquare className="w-4 h-4 fill-emerald-400/20" />
            <span>24/7 INSTITUTIONAL ONBOARDING & SUPPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Contact Elimu360 Onboarding & Executive Support Team
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Partner with Elimu360 to modernize your school&apos;s administration, fee reconciliation, continuous assessment grading, and parent communications. Our regional team is ready to guide your institution.
          </p>
        </div>

        {/* Quick WhatsApp Hero Contact Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Instant Institutional Chat
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Direct WhatsApp Desk:</span>
              <span className="text-emerald-400 font-mono">+250 792 612 139</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-lg">
              Get immediate responses regarding school onboarding, 1st-term free pilots, custom pricing, and regional registrar support.
            </p>
          </div>

          <a
            href="https://wa.me/250792612139?text=Hello%20Elimu360!%20Our%20school%20would%20like%20to%20get%20started."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 shrink-0 flex items-center justify-center gap-2.5 cursor-pointer relative z-10"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            <span>Chat On WhatsApp Now</span>
          </a>
        </div>

        {/* Main Content Grid: Information Cards + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Direct Contact Information */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Headquarters & Desk</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Phone & WhatsApp</span>
                    <a href="tel:+250792612139" className="font-bold text-white hover:text-amber-400 transition font-mono">
                      +250 792 612 139
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Official Email</span>
                    <a href="mailto:info@elimu360.rw" className="font-bold text-white hover:text-amber-400 transition">
                      info@elimu360.rw
                    </a>
                    <div className="text-[11px] text-slate-400 mt-0.5">onboarding@elimu360.rw</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Physical Office Location</span>
                    <strong className="text-white">The Palace Tech House</strong>
                    <div className="text-slate-400 text-[11px] mt-0.5">Kigali Innovation City, Kigali, Rwanda</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">Working Hours</span>
                    <strong className="text-white">Monday - Saturday: 8:00 AM - 6:00 PM CAT</strong>
                    <div className="text-slate-400 text-[11px] mt-0.5">24/7 Emergency Support for Onboarded Schools</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Support Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Globe2 className="w-4 h-4" />
                <span>East African Regional Network</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Field Officers and Regional Coordinators are deployed across Kigali City, Northern, Southern, Eastern, and Western provinces of Rwanda to conduct live in-person demonstrations for school boards.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive School Partnership Request Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Request School Partnership & Onboarding Demo</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fill out this quick request form and our dedicated Regional Coordinator will reach out within 2 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Onboarding Request Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for your interest in Elimu360 SIMS. Our Regional Representative will contact <strong>{repName}</strong> at <strong>{phone || email}</strong> shortly.
                </p>
                <div className="pt-3">
                  <a
                    href="https://wa.me/250792612139?text=Hello%20Elimu360!%20I%20just%20submitted%20an%20onboarding%20form%20for%20my%20school."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Speed up on WhatsApp (+250 792 612 139)</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      School Institution Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kicukiro Technical College"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Representative Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Director Jean-Paul Gasana"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Role / Title</label>
                    <select
                      value={repRole}
                      onChange={(e) => setRepRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Headteacher / Director">Headteacher / Director</option>
                      <option value="School Owner / Board Member">School Owner / Board Member</option>
                      <option value="Dean of Studies (DOS)">Dean of Studies (DOS)</option>
                      <option value="Bursar / Accountant">Bursar / Accountant</option>
                      <option value="IT Director / Registrar">IT Director / Registrar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="director@school.rw"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+250 788 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Gasabo, Kigali"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Student Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      value={estimatedStudents}
                      onChange={(e) => setEstimatedStudents(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry / Primary Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your current administrative challenges (e.g. fee arrears reconciliation, report cards generation, SMS notifications to parents)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Partnership Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
