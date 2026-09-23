import React, { useState } from 'react';
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Award, 
  Eye, 
  FileText,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { School, SchoolOnboardingSurvey } from '../../types';
import { SchoolOnboardingSurveyModal } from '../survey/SchoolOnboardingSurveyModal';

export const ProductIntelligenceDashboard: React.FC = () => {
  const { availableSchools, toggleSchoolPilotStatus, updateSchoolSurvey } = useElimu();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPilotStatus, setFilterPilotStatus] = useState<'ALL' | 'FIRST_TERM_PILOT' | 'LOYAL'>('ALL');
  const [selectedSchoolForSurvey, setSelectedSchoolForSurvey] = useState<School | null>(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [inspectSurveySchool, setInspectSurveySchool] = useState<School | null>(null);

  // Filtered Schools
  const surveyedSchools = availableSchools.filter(s => !!s.onboarding_survey);
  
  // Key Analytics Calculations
  const totalSchools = availableSchools.length;
  const totalSurveyed = surveyedSchools.length;
  
  // Pilot vs Loyal Count
  const pilotCount = availableSchools.filter(s => s.pilot_status !== 'LOYAL').length;
  const loyalCount = availableSchools.filter(s => s.pilot_status === 'LOYAL').length;
  const pilotPercentage = totalSchools > 0 ? Math.round((pilotCount / totalSchools) * 100) : 0;

  // Reachability breakdown
  const reachabilityCounts: Record<string, number> = {
    'Very easy': 0,
    'Easy': 0,
    'Moderate': 0,
    'Difficult': 0,
    'Very difficult': 0
  };

  // Interest breakdown
  const interestCounts: Record<string, number> = {
    'Extremely interested': 0,
    'Very interested': 0,
    'Moderately interested': 0,
    'Slightly interested': 0,
    'Not interested': 0
  };

  // Feature Attraction Matrix
  const featureCounts: Record<string, number> = {};
  
  // Objections breakdown
  const objectionCounts: Record<string, number> = {};

  // Competitor breakdown
  const competitorCounts: Record<string, number> = {};

  // Requested features list
  const requestedFeaturesList: { schoolName: string; text: string; conductedBy: string }[] = [];

  surveyedSchools.forEach(s => {
    const survey = s.onboarding_survey!;
    
    // Reachability
    if (survey.decision_maker_reachability) {
      reachabilityCounts[survey.decision_maker_reachability] = (reachabilityCounts[survey.decision_maker_reachability] || 0) + 1;
    }

    // Interest
    if (survey.school_interest_level) {
      interestCounts[survey.school_interest_level] = (interestCounts[survey.school_interest_level] || 0) + 1;
    }

    // Attracting features
    if (Array.isArray(survey.attracting_features)) {
      survey.attracting_features.forEach(feat => {
        featureCounts[feat] = (featureCounts[feat] || 0) + 1;
      });
    }

    // Objections
    if (survey.biggest_objection) {
      objectionCounts[survey.biggest_objection] = (objectionCounts[survey.biggest_objection] || 0) + 1;
    }

    // Competitors
    if (survey.competitor_or_current_system) {
      competitorCounts[survey.competitor_or_current_system] = (competitorCounts[survey.competitor_or_current_system] || 0) + 1;
    }

    // Requested features
    if (survey.requested_missing_features?.trim()) {
      requestedFeaturesList.push({
        schoolName: s.name,
        text: survey.requested_missing_features,
        conductedBy: survey.conducted_by_name || 'Registrar/Coordinator'
      });
    }
  });

  // Top attracting feature
  const sortedFeatures = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]);
  const topFeature = sortedFeatures.length > 0 ? sortedFeatures[0][0] : 'Academics & Report Cards';

  // Top objection
  const sortedObjections = Object.entries(objectionCounts).sort((a, b) => b[1] - a[1]);
  const topObjection = sortedObjections.length > 0 ? sortedObjections[0][0] : 'Current Process Satisfaction';

  // Table Filter
  const filteredTableSchools = availableSchools.filter(s => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = (s.name || '').toLowerCase().includes(term) || 
                          (s.code || '').toLowerCase().includes(term) ||
                          (s.city || '').toLowerCase().includes(term);
    const isLoyal = s.pilot_status === 'LOYAL';
    const matchesStatus = filterPilotStatus === 'ALL' || 
                          (filterPilotStatus === 'LOYAL' && isLoyal) || 
                          (filterPilotStatus === 'FIRST_TERM_PILOT' && !isLoyal);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/60 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Product Intelligence & Market Strategy Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
            Onboarding Survey & Field Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Real-time strategic analysis of decision-maker accessibility, school objections, competitor usage, and requested product features collected during registrar & coordinator onboarding surveys.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Surveyed Schools</span>
            <ClipboardList className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            {totalSurveyed} <span className="text-xs font-normal text-slate-400">/ {totalSchools}</span>
          </div>
          <div className="text-[11px] text-blue-300">
            {totalSchools > 0 ? Math.round((totalSurveyed / totalSchools) * 100) : 0}% Field Coverage
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Pilot Stage Status</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-display">
            {pilotCount} <span className="text-xs font-normal text-emerald-400">({loyalCount} Loyal)</span>
          </div>
          <div className="text-[11px] text-amber-400">
            {pilotPercentage}% First-Term Pilot
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Top Feature Attraction</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-300 line-clamp-1" title={topFeature}>
            {topFeature}
          </div>
          <div className="text-[11px] text-slate-400">
            Primary driver for school enrollment
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Primary Objection</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-rose-300 line-clamp-1" title={topObjection}>
            {topObjection}
          </div>
          <div className="text-[11px] text-slate-400">
            Main hesitation in field visits
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Decision Access</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-display">
            {totalSurveyed > 0 
              ? `${Math.round(((reachabilityCounts['Easy'] + reachabilityCounts['Very easy']) / Math.max(1, totalSurveyed)) * 100)}%` 
              : 'N/A'}
          </div>
          <div className="text-[11px] text-purple-300">
            Easy access to Directors
          </div>
        </div>

      </div>

      {/* Grid: Charts & Feature Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attracting Feature Matrix */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Feature Attraction Ranking</span>
            </h3>
            <span className="text-xs text-slate-400">{totalSurveyed} Schools Surveyed</span>
          </div>

          <div className="space-y-3">
            {sortedFeatures.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No feature attraction survey data recorded yet. Register a school to complete survey.
              </div>
            ) : (
              sortedFeatures.map(([feature, count]) => {
                const percentage = totalSurveyed > 0 ? Math.round((count / totalSurveyed) * 100) : 0;
                return (
                  <div key={feature} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{feature}</span>
                      <span className="text-blue-400 font-mono">{count} schools ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Competitors & Current Systems Used */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              <span>Current System / Competitor Landscape</span>
            </h3>
            <span className="text-xs text-slate-400">Market Share Replaced</span>
          </div>

          <div className="space-y-3">
            {Object.keys(competitorCounts).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No competitor system data available yet.
              </div>
            ) : (
              Object.entries(competitorCounts).sort((a,b) => b[1] - a[1]).map(([comp, count]) => {
                const percentage = totalSurveyed > 0 ? Math.round((count / totalSurveyed) * 100) : 0;
                return (
                  <div key={comp} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{comp}</div>
                      <div className="text-[10px] text-slate-400">Replaced during onboarding</div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-extrabold font-mono text-sm">{count}</span>
                      <div className="text-[10px] text-slate-500">{percentage}% of market</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Requested Missing Features Repository */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Requested Features & Product Improvement Wishlist</span>
          </h3>
          <span className="text-xs text-purple-300 font-mono">{requestedFeaturesList.length} Direct Field Requests</span>
        </div>

        {requestedFeaturesList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No specific custom features requested by school directors yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestedFeaturesList.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-400">{item.schoolName}</span>
                  <span className="text-[10px] text-slate-500">{item.conductedBy}</span>
                </div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* School Survey Table & Badge Management */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Registered Schools & Institutional Badge Control</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every school starts in First-Term Pilot badge mode and transitions to Loyal institution status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search school name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterPilotStatus}
              onChange={(e) => setFilterPilotStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Badges</option>
              <option value="FIRST_TERM_PILOT">First-Term Pilot Only</option>
              <option value="LOYAL">Loyal Institution Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">School Name & Code</th>
                <th className="p-3">Location / District</th>
                <th className="p-3">Institutional Badge</th>
                <th className="p-3">Survey Status</th>
                <th className="p-3">Onboarding Agent</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTableSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No schools match the selected search/filter parameters.
                  </td>
                </tr>
              ) : (
                filteredTableSchools.map(school => {
                  const isLoyal = school.pilot_status === 'LOYAL';
                  const survey = school.onboarding_survey;

                  return (
                    <tr key={school.id} className="hover:bg-slate-950/50 transition">
                      
                      <td className="p-3">
                        <div className="font-bold text-white text-xs">{school.name}</div>
                        <div className="font-mono text-[10px] text-blue-400">Code: [{school.code}]</div>
                      </td>

                      <td className="p-3 text-slate-400 text-xs">
                        {school.city || 'Kigali'}, {school.district || 'District'}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                            isLoyal
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            <Award className="w-3 h-3" />
                            <span>{isLoyal ? 'Loyal' : 'First-Term Pilot'}</span>
                          </span>

                          <button
                            onClick={() => toggleSchoolPilotStatus(school.id)}
                            title="Toggle Badge between First-Term Pilot & Loyal"
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 cursor-pointer transition"
                          >
                            Switch to {isLoyal ? 'Pilot' : 'Loyal'}
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        {survey ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                            Completed ({survey.attracting_features?.length || 0} features)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500 text-[10px]">
                            Pending Survey
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-400 text-xs">
                        {school.registered_by_name || 'System Auto'}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSchoolForSurvey(school);
                            setIsSurveyModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-[11px] flex items-center gap-1.5 ml-auto transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{survey ? 'Edit Survey' : 'Fill Survey'}</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Modal Trigger */}
      {selectedSchoolForSurvey && (
        <SchoolOnboardingSurveyModal
          schoolName={selectedSchoolForSurvey.name}
          isOpen={isSurveyModalOpen}
          onClose={() => {
            setIsSurveyModalOpen(false);
            setSelectedSchoolForSurvey(null);
          }}
          initialData={selectedSchoolForSurvey.onboarding_survey}
          onSubmitSurvey={(survey) => {
            updateSchoolSurvey(selectedSchoolForSurvey.id, survey);
            setIsSurveyModalOpen(false);
            setSelectedSchoolForSurvey(null);
          }}
        />
      )}

    </div>
  );
};
