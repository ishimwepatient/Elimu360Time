import React, { useState } from 'react';
import { 
  ClipboardList, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Building2, 
  Send,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { SchoolOnboardingSurvey } from '../../types';

interface SchoolOnboardingSurveyModalProps {
  schoolName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSurvey: (survey: SchoolOnboardingSurvey) => void;
  initialData?: Partial<SchoolOnboardingSurvey>;
  isEmbeddedInRegistration?: boolean;
}

const FEATURE_OPTIONS = [
  'Academics & Automated REB Report Cards',
  'A4 REB Competency-Based Lesson Planner',
  'Fee Management, Receipts & Defaulters Ledger',
  'Attendance Tracking & Parent Messaging',
  'Gate Security & Visitor Identification',
  'Discipline & Conduct Records',
  'Student 360 Profiles & Transcripts',
  'Library & Asset Management'
];

const OBJECTION_OPTIONS = [
  'Pricing & Budget Constraints',
  'Lack of Technical Literacy among Staff',
  'Satisfaction with Current Systems / Paper',
  'Limited Internet Connectivity',
  'Reluctance to Change School Workflows',
  'None / Highly Enthusiastic',
  'Other'
];

const COMPETITOR_OPTIONS = [
  'Paper Ledgers & Manual Registers',
  'Microsoft Excel Spreadsheets',
  'In-House Custom Software',
  'Competitor School Management Software',
  'No System in Place'
];

export const SchoolOnboardingSurveyModal: React.FC<SchoolOnboardingSurveyModalProps> = ({
  schoolName,
  isOpen,
  onClose,
  onSubmitSurvey,
  initialData,
  isEmbeddedInRegistration = false
}) => {
  const [decisionMakerReachability, setDecisionMakerReachability] = useState<SchoolOnboardingSurvey['decision_maker_reachability']>(
    initialData?.decision_maker_reachability || 'Easy'
  );
  const [schoolInterestLevel, setSchoolInterestLevel] = useState<SchoolOnboardingSurvey['school_interest_level']>(
    initialData?.school_interest_level || 'Very interested'
  );
  const [explainingEase, setExplainingEase] = useState<SchoolOnboardingSurvey['explaining_ease']>(
    initialData?.explaining_ease || 'Easy'
  );
  const [attractingFeatures, setAttractingFeatures] = useState<string[]>(
    initialData?.attracting_features || ['Academics & Automated REB Report Cards', 'Fee Management, Receipts & Defaulters Ledger']
  );
  const [biggestObjection, setBiggestObjection] = useState<string>(
    initialData?.biggest_objection || 'Satisfaction with Current Systems / Paper'
  );
  const [competitorOrCurrentSystem, setCompetitorOrCurrentSystem] = useState<string>(
    initialData?.competitor_or_current_system || 'Microsoft Excel Spreadsheets'
  );
  const [requestedMissingFeatures, setRequestedMissingFeatures] = useState<string>(
    initialData?.requested_missing_features || ''
  );
  const [likelihoodToJoinPilot, setLikelihoodToJoinPilot] = useState<SchoolOnboardingSurvey['likelihood_to_join_pilot']>(
    initialData?.likelihood_to_join_pilot || 'Likely'
  );
  const [improvementSuggestions, setImprovementSuggestions] = useState<string>(
    initialData?.improvement_suggestions || ''
  );
  const [fieldNotes, setFieldNotes] = useState<string>(
    initialData?.field_notes || ''
  );

  if (!isOpen) return null;

  const toggleFeature = (feature: string) => {
    setAttractingFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const survey: SchoolOnboardingSurvey = {
      decision_maker_reachability: decisionMakerReachability,
      school_interest_level: schoolInterestLevel,
      explaining_ease: explainingEase,
      attracting_features: attractingFeatures,
      biggest_objection: biggestObjection,
      competitor_or_current_system: competitorOrCurrentSystem,
      requested_missing_features: requestedMissingFeatures,
      likelihood_to_join_pilot: likelihoodToJoinPilot,
      improvement_suggestions: improvementSuggestions,
      field_notes: fieldNotes
    };
    onSubmitSurvey(survey);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Product Intelligence Survey</span>
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">
                Onboarding Survey: <span className="text-blue-300">{schoolName}</span>
              </h2>
            </div>
          </div>

          {!isEmbeddedInRegistration && (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Survey Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-[11px] leading-relaxed">
            <p>
              This intelligence survey fuels the <strong>Super Admin Product Development Engine</strong> to refine Elimu360 based on real field feedback from Rwandan school directors and registrars.
            </p>
          </div>

          {/* Q1: Reach Decision Maker */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              1. How easy was it to reach the decision maker (Director/Principal)?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Very difficult', 'Difficult', 'Moderate', 'Easy', 'Very easy'] as const).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDecisionMakerReachability(val)}
                  className={`p-2.5 rounded-xl border font-bold text-[11px] transition text-center cursor-pointer ${
                    decisionMakerReachability === val
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: School Interest */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              2. How interested was the school during presentation?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Not interested', 'Slightly interested', 'Moderately interested', 'Very interested', 'Extremely interested'] as const).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSchoolInterestLevel(val)}
                  className={`p-2.5 rounded-xl border font-bold text-[11px] transition text-center cursor-pointer ${
                    schoolInterestLevel === val
                      ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Explaining Ease */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              3. How easy was Elimu360 to explain to school leaders?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Very difficult', 'Difficult', 'Moderate', 'Easy', 'Very easy'] as const).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setExplainingEase(val)}
                  className={`p-2.5 rounded-xl border font-bold text-[11px] transition text-center cursor-pointer ${
                    explainingEase === val
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Q4: Features Attracted */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block mb-1">
              4. Which features attracted the school most? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURE_OPTIONS.map(feat => {
                const isSelected = attractingFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-600 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[11px]">{feat}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q5: Biggest Objection */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              5. What was the biggest objection raised?
            </label>
            <select
              value={biggestObjection}
              onChange={(e) => setBiggestObjection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              {OBJECTION_OPTIONS.map(obj => (
                <option key={obj} value={obj}>{obj}</option>
              ))}
            </select>
          </div>

          {/* Q6: Competitor System */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              6. What competitor/current system do they currently use?
            </label>
            <select
              value={competitorOrCurrentSystem}
              onChange={(e) => setCompetitorOrCurrentSystem(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
            >
              {COMPETITOR_OPTIONS.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Q7: Requested Missing Features */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              7. What feature did they request that Elimu360 doesn&apos;t currently have?
            </label>
            <input
              type="text"
              placeholder="e.g. Automatic WhatsApp report card alerts, biometric teacher attendance clocking..."
              value={requestedMissingFeatures}
              onChange={(e) => setRequestedMissingFeatures(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
          </div>

          {/* Q8: Likelihood to join pilot */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              8. How likely is the school to join First-Term Pilot?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Unlikely', 'Somewhat likely', 'Likely', 'Very likely', 'Already committed'] as const).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLikelihoodToJoinPilot(val)}
                  className={`p-2.5 rounded-xl border font-bold text-[11px] transition text-center cursor-pointer ${
                    likelihoodToJoinPilot === val
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Q9: What should Elimu360 improve? */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              9. What should Elimu360 improve based on feedback?
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Simplify bulk student Excel import format, make report card PDF preview faster..."
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Field Notes */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="font-bold text-white text-xs block">
              Agent Field Notes / Next Follow-up Action:
            </label>
            <textarea
              rows={2}
              placeholder="Write any personal context, director phone call logs, or scheduled follow-up dates..."
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            {!isEmbeddedInRegistration && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-blue-900/40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Save Product Intelligence Survey</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
