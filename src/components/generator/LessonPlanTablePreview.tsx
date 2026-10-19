import React from 'react';
import { Award, Printer, Copy, Check, FileDown, Layers } from 'lucide-react';
import { LessonPlanData } from '../../types';

interface LessonPlanTablePreviewProps {
  plan: LessonPlanData;
  onOpenExportModal?: () => void;
  showExportButton?: boolean;
}

export const LessonPlanTablePreview: React.FC<LessonPlanTablePreviewProps> = ({ 
  plan, 
  onOpenExportModal,
  showExportButton = true 
}) => {
  const [copied, setCopied] = React.useState(false);

  const isKinyarwanda = 
    plan.subject?.toLowerCase().includes('kinyarwanda') ||
    plan.subject?.toLowerCase().includes('imibare') ||
    plan.subject?.toLowerCase().includes('ibidukikije') ||
    plan.subject?.toLowerCase().includes('ubugeni') ||
    plan.steps?.introduction?.teacherActivities?.[0]?.includes('abanyeshuri') ||
    (plan as any).language === 'kinyarwanda';

  const handleCopyText = () => {
    const text = `
REB / CBC LESSON PLAN — ELIMU360 OPEN SYSTEM
=====================================================
School Name: ${plan.schoolName || 'GS Amahoro'}
Teacher's Name: ${plan.teacherName || 'Teacher'}
Term: ${plan.term} | Date: ${plan.date} | Duration: ${plan.duration}
Subject: ${plan.subject} | Class Level: ${plan.classLevel} | Class Size: ${plan.classSize}
Unit No: ${plan.unitNumber} | Unit Title: ${plan.unitTitle}
Lesson No: ${plan.lessonNumber} | Lesson Title: ${plan.lessonTitle}

KEY UNIT COMPETENCE:
${plan.keyUnitCompetence}

INSTRUCTIONAL OBJECTIVE:
${plan.instructionalObjective}

LOCATION: ${plan.location || 'Classroom'}
LEARNING MATERIALS: ${plan.learningMaterials}
REFERENCES: ${plan.references}

LESSON STEPS:
1. INTRODUCTION (${plan.steps?.introduction?.duration || '7 min'}):
Teacher Activities: ${(plan.steps?.introduction?.teacherActivities || []).join('\n- ')}
Learner Activities: ${(plan.steps?.introduction?.learnerActivities || []).join('\n- ')}
Competences & Cross-Cutting: ${(plan.steps?.introduction?.competencesAndCrossCutting || []).join('\n- ')}

2. LESSON DEVELOPMENT (${plan.steps?.development?.duration || '25 min'}):
Teacher Activities: ${(plan.steps?.development?.teacherActivities || []).join('\n- ')}
Learner Activities: ${(plan.steps?.development?.learnerActivities || []).join('\n- ')}
Competences & Cross-Cutting: ${(plan.steps?.development?.competencesAndCrossCutting || []).join('\n- ')}

3. CONCLUSION (${plan.steps?.conclusion?.duration || '8 min'}):
Teacher Activities: ${(plan.steps?.conclusion?.teacherActivities || []).join('\n- ')}
Learner Activities: ${(plan.steps?.conclusion?.learnerActivities || []).join('\n- ')}
Competences & Cross-Cutting: ${(plan.steps?.conclusion?.competencesAndCrossCutting || []).join('\n- ')}

SELF EVALUATION:
${plan.selfEvaluation || 'Lesson successfully executed.'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar on Top of Preview */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Official REB Competency-Based Curriculum Table Layout</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print View</span>
          </button>

          {showExportButton && onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Layers className="w-3.5 h-3.5 fill-slate-950" />
              <span>Export Options</span>
            </button>
          )}
        </div>
      </div>

      {/* The Exact REB Document Presentation Card (identical to Saved Plans View Modal) */}
      <div 
        id="reb-lesson-plan-preview-card"
        className="bg-white text-slate-900 p-6 sm:p-9 rounded-2xl border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-5 overflow-x-auto"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Document Title Header */}
        <div className="text-center space-y-1 pb-2 border-b-2 border-slate-900">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 uppercase font-display">
            {isKinyarwanda ? "ITEGURIRO RY'ISOMO / LESSON PLAN" : "LESSON PLAN"}
          </h1>
        </div>

        {/* School Name & Teacher's Name Header Line */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-slate-950 px-1 py-1 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 uppercase text-[11px]">{isKinyarwanda ? "Ishuri / School:" : "School Name:"}</span>
            <span className="font-extrabold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
              {plan.schoolName || 'GS Amahoro'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 uppercase text-[11px]">{isKinyarwanda ? "Umwarimu / Teacher:" : "Teacher's Name:"}</span>
            <span className="font-extrabold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
              {plan.teacherName || 'NISHIMWE Joel Patient'}
            </span>
          </div>
        </div>

        {/* Main REB Table 1: Metadata */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-900">
            <tbody>
              {/* Row 1: Term, Date, Subject, Class, Unit No, Lesson No, Duration, Class size */}
              <tr className="border-b border-slate-900 bg-slate-100 font-bold text-center">
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Igihembwe" : "Term"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Itariki" : "Date"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Isomo" : "Subject"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Umwaka" : "Class"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Umutwe" : "Unit No"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Isomo No" : "Lesson No"}</td>
                <td className="p-2 border-r border-slate-900">{isKinyarwanda ? "Igihe" : "Duration"}</td>
                <td className="p-2">{isKinyarwanda ? "Abanyeshuri" : "Class size"}</td>
              </tr>
              <tr className="border-b border-slate-900 font-medium text-center">
                <td className="p-2 border-r border-slate-900">{plan.term || 'Term 1'}</td>
                <td className="p-2 border-r border-slate-900 whitespace-nowrap">{plan.date}</td>
                <td className="p-2 border-r border-slate-900 font-bold text-slate-950">{plan.subject}</td>
                <td className="p-2 border-r border-slate-900">{plan.classLevel}</td>
                <td className="p-2 border-r border-slate-900">{plan.unitNumber}</td>
                <td className="p-2 border-r border-slate-900">{plan.lessonNumber}</td>
                <td className="p-2 border-r border-slate-900">{plan.duration}</td>
                <td className="p-2">{plan.classSize}</td>
              </tr>

              {/* Row 2: Special Needs */}
              <tr className="border-b border-slate-900">
                <td colSpan={3} className="p-2.5 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda 
                    ? "Abafite ibibazo byihariye mu myigire n'umubare wabo muri buri cyiciro" 
                    : "Type of special educational needs to be catered for in this lesson and number of learners in each category"}
                </td>
                <td colSpan={5} className="p-2.5 font-medium leading-relaxed">
                  {plan.specialNeeds || 'Abanyeshuri bakeneye ubufasha bwihariye bicajwe imbere hafi y\'ikibaho.'}
                </td>
              </tr>

              {/* Row 3: Unit Title */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Umutwe w'isomo" : "Unit title"}
                </td>
                <td colSpan={6} className="p-2 font-extrabold text-slate-950 uppercase tracking-wide">
                  {plan.unitTitle}
                </td>
              </tr>

              {/* Row 4: Key Unit Competence */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Ubushobozi bw'ingenzi bwitezwe ku mutwe" : "Key unit competence"}
                </td>
                <td colSpan={6} className="p-2 font-medium leading-relaxed">
                  {plan.keyUnitCompetence}
                </td>
              </tr>

              {/* Row 5: Title of the lesson */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Umutwe w'isomo ry'uyu munsi" : "Title of the lesson"}
                </td>
                <td colSpan={6} className="p-2 font-extrabold text-slate-950 text-sm">
                  {plan.lessonTitle}
                </td>
              </tr>

              {/* Row 6: Instructional Objectives */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Intego y'isomo" : "Instructional objectives"}
                </td>
                <td colSpan={6} className="p-2 font-medium leading-relaxed text-slate-900">
                  {plan.instructionalObjective}
                </td>
              </tr>

              {/* Row 7: Location */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Aho isomo riberera" : "Plan of this class (Location)"}
                </td>
                <td colSpan={6} className="p-2 font-medium">
                  {plan.location || (isKinyarwanda ? 'Mu ishuri / Ahasanzwe higirwa' : 'Classroom / Science Corner')}
                </td>
              </tr>

              {/* Row 8: Learning materials */}
              <tr className="border-b border-slate-900">
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Imfashanyigisho" : "Learning materials"}
                </td>
                <td colSpan={6} className="p-2 font-medium leading-relaxed">
                  {plan.learningMaterials}
                </td>
              </tr>

              {/* Row 9: References */}
              <tr>
                <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                  {isKinyarwanda ? "Ibitabo byifashishijwe" : "References"}
                </td>
                <td colSpan={6} className="p-2 font-medium leading-relaxed whitespace-pre-line">
                  {plan.references}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main REB Table 2: Detailed Lesson Execution */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-900">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-100 font-bold">
                <th className="p-2 border-r border-slate-900 w-1/5 text-left align-middle">
                  {isKinyarwanda ? "Intambwe n'igihe cyayo" : "Timing for each step"}
                </th>
                <th colSpan={2} className="p-2 border-r border-slate-900 w-3/5 text-center align-middle">
                  {isKinyarwanda ? "Ibisobanuro by'ibikorwa byo kwigisha no kwiga" : "Description of teaching and learning activities"}
                </th>
                <th className="p-2 w-1/5 text-left align-middle">
                  {isKinyarwanda ? "Ubushobozi n'ingingo ngiro zambukiranya amasomo" : "Generic competences and cross-cutting issues + some explanations"}
                </th>
              </tr>
              {/* Summary row across description column */}
              <tr className="border-b border-slate-900 italic text-slate-800 bg-slate-50/80">
                <td className="border-r border-slate-900"></td>
                <td colSpan={2} className="p-2 border-r border-slate-900 text-center font-medium">
                  {plan.activitySummary || (isKinyarwanda 
                    ? `Abanyeshuri baritegereza, baganire mu matsinda kuri ${(plan.lessonTitle || '').toLowerCase()}.` 
                    : `Students will engage in discussions and structured group activities on ${(plan.lessonTitle || '').toLowerCase()}.`)}
                </td>
                <td></td>
              </tr>
              <tr className="border-b border-slate-900 bg-slate-100 font-bold text-center">
                <td className="border-r border-slate-900"></td>
                <td className="p-1.5 border-r border-slate-900 text-left w-1/2">{isKinyarwanda ? "Imirimo y'umwarimu" : "Teacher's activity"}</td>
                <td className="p-1.5 border-r border-slate-900 text-left w-1/2">{isKinyarwanda ? "Imirimo y'umunyeshuri" : "Learner's activity"}</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {/* Step 1: Introduction */}
              <tr className="border-b border-slate-900">
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900 align-top">
                  {isKinyarwanda ? "Intangiriro" : "Introduction"} ({plan.steps?.introduction?.duration || '5-7 min'})
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.introduction?.teacherActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.introduction?.learnerActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.introduction?.competencesAndCrossCutting || []).map((comp, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>

              {/* Step 2: Lesson Development */}
              <tr className="border-b border-slate-900">
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900 align-top">
                  {isKinyarwanda ? "Iterambere ry'isomo" : "Lesson Development"} ({plan.steps?.development?.duration || '20-25 min'})
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.development?.teacherActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.development?.learnerActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.development?.competencesAndCrossCutting || []).map((comp, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>

              {/* Step 3: Conclusion */}
              <tr className="border-b border-slate-900">
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900 align-top">
                  {isKinyarwanda ? "Umwanzuro n'isuzumabumenyi" : "Conclusion"} ({plan.steps?.conclusion?.duration || '8-10 min'})
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.conclusion?.teacherActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 border-r border-slate-900 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.conclusion?.learnerActivities || []).map((act, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2.5 align-top leading-relaxed">
                  <ul className="space-y-1.5">
                    {(plan.steps?.conclusion?.competencesAndCrossCutting || []).map((comp, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="shrink-0 text-slate-500 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>

              {/* Bottom Row: Teacher's self-evaluation */}
              <tr>
                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-900 align-top">
                  {isKinyarwanda ? "Isuzuma ry'umwarimu ku isomo rye" : "Teacher's self-evaluation"}
                </td>
                <td colSpan={3} className="p-2.5 font-medium italic text-slate-900 leading-relaxed">
                  {plan.selfEvaluation || (isKinyarwanda 
                    ? 'Intego y\'isomo yagezweho ku kigero gishimishije; abanyeshuri bitabiriye imirimo yo mu matsinda n\'isuzuma.' 
                    : 'Lesson delivered effectively following official REB Competency-Based Curriculum guidelines. Instructional objectives met; learners engaged in cooperative group work and formative assessment.')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer stamp */}
        <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600 inline" /> Official REB Standard Lesson Plan • Verified Format
          </span>
          <span>Sovereign Education Engine</span>
        </div>
      </div>
    </div>
  );
};
