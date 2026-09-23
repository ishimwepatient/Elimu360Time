import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, Edit3, Save, Sparkles, Award } from 'lucide-react';
import { LessonPlanData } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  plan: LessonPlanData;
  onClose: () => void;
  onSave?: (updatedPlan: LessonPlanData) => void;
}

export const LessonPlanViewModal: React.FC<Props> = ({ plan, onClose, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<LessonPlanData>({ ...plan });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
REB / CBC LESSON PLAN — ELIMU360 OPEN SYSTEM
=====================================================
School Name: ${plan.schoolName}
Teacher's Name: ${plan.teacherName}
Term: ${plan.term} | Date: ${plan.date} | Duration: ${plan.duration}
Subject: ${plan.subject} | Class Level: ${plan.classLevel} | Class Size: ${plan.classSize}
Unit No: ${plan.unitNumber} | Unit Title: ${plan.unitTitle}
Lesson No: ${plan.lessonNumber} | Lesson Title: ${plan.lessonTitle}

KEY UNIT COMPETENCE:
${plan.keyUnitCompetence}

INSTRUCTIONAL OBJECTIVE:
${plan.instructionalObjective}

LOCATION: ${plan.location}
LEARNING MATERIALS: ${plan.learningMaterials}
REFERENCES: ${plan.references}

LESSON STEPS:
1. INTRODUCTION (${plan.steps.introduction.duration}):
Teacher Activities: ${plan.steps.introduction.teacherActivities.join('\n- ')}
Learner Activities: ${plan.steps.introduction.learnerActivities.join('\n- ')}
Competences & Cross-Cutting: ${plan.steps.introduction.competencesAndCrossCutting.join('\n- ')}

2. LESSON DEVELOPMENT (${plan.steps.development.duration}):
Teacher Activities: ${plan.steps.development.teacherActivities.join('\n- ')}
Learner Activities: ${plan.steps.development.learnerActivities.join('\n- ')}
Competences & Cross-Cutting: ${plan.steps.development.competencesAndCrossCutting.join('\n- ')}

3. CONCLUSION (${plan.steps.conclusion.duration}):
Teacher Activities: ${plan.steps.conclusion.teacherActivities.join('\n- ')}
Learner Activities: ${plan.steps.conclusion.learnerActivities.join('\n- ')}
Competences & Cross-Cutting: ${plan.steps.conclusion.competencesAndCrossCutting.join('\n- ')}

SELF EVALUATION:
${plan.selfEvaluation || 'Lesson successfully executed.'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('reb-lesson-plan-print-area');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `LessonPlan_${plan.subject}_${plan.classLevel}_Unit${plan.unitNumber}_${plan.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveEdit = () => {
    if (onSave) {
      onSave(editedPlan);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg line-clamp-1">
                {plan.lessonTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {plan.subject} • {plan.classLevel} • Unit {plan.unitNumber} ({plan.lessonNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSave && (
              isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan Changes</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Plan</span>
                </button>
              )
            )}

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Text Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Exporting PDF...' : 'Export PDF Now'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Lesson Plan</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REB Printable Content Document Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950 text-slate-100 flex-1 print:p-0 print:bg-white print:text-black">
          <div 
            id="reb-lesson-plan-print-area" 
            className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-xl max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:max-w-none print:p-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {/* Document Title Header */}
            <div className="text-center space-y-1 pb-2 border-b border-slate-900">
              <h1 className="text-xl font-black tracking-wider text-slate-950 uppercase font-display">
                LESSON PLAN
              </h1>
            </div>

            {/* School Name & Teacher's Name Header Line */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-slate-950 px-1 py-1">
              <div>
                <span>School Name: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPlan.schoolName}
                    onChange={e => setEditedPlan({ ...editedPlan, schoolName: e.target.value })}
                    className="p-1 bg-amber-50 border border-amber-300 rounded font-semibold"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">{plan.schoolName || 'GS Amahoro'}</span>
                )}
              </div>
              <div>
                <span>Teacher's Name: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPlan.teacherName}
                    onChange={e => setEditedPlan({ ...editedPlan, teacherName: e.target.value })}
                    className="p-1 bg-amber-50 border border-amber-300 rounded font-semibold"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">{plan.teacherName || 'NISHIMWE Joel Patient'}</span>
                )}
              </div>
            </div>

            {/* Main REB Table 1: Metadata */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-900">
                <tbody>
                  {/* Row 1: Term, Date, Subject, Class, Unit No, Lesson No, Duration, Class size */}
                  <tr className="border-b border-slate-900 bg-slate-100/80 font-bold">
                    <td className="p-1.5 border-r border-slate-900">Term</td>
                    <td className="p-1.5 border-r border-slate-900">Date</td>
                    <td className="p-1.5 border-r border-slate-900">Subject</td>
                    <td className="p-1.5 border-r border-slate-900">Class</td>
                    <td className="p-1.5 border-r border-slate-900">Unit No</td>
                    <td className="p-1.5 border-r border-slate-900">Lesson No</td>
                    <td className="p-1.5 border-r border-slate-900">Duration</td>
                    <td className="p-1.5">Class size</td>
                  </tr>
                  <tr className="border-b border-slate-900 font-medium">
                    <td className="p-1.5 border-r border-slate-900">{plan.term}</td>
                    <td className="p-1.5 border-r border-slate-900 whitespace-nowrap">{plan.date}</td>
                    <td className="p-1.5 border-r border-slate-900 font-semibold">{plan.subject}</td>
                    <td className="p-1.5 border-r border-slate-900">{plan.classLevel}</td>
                    <td className="p-1.5 border-r border-slate-900">{plan.unitNumber}</td>
                    <td className="p-1.5 border-r border-slate-900">{plan.lessonNumber}</td>
                    <td className="p-1.5 border-r border-slate-900">{plan.duration}</td>
                    <td className="p-1.5">{plan.classSize}</td>
                  </tr>

                  {/* Row 2: Special Needs */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={4} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Type of special educational needs to be catered for in this lesson and number of learners in each category
                    </td>
                    <td colSpan={4} className="p-2 font-medium">
                      {plan.specialNeeds || 'Attention disorder'}
                    </td>
                  </tr>

                  {/* Row 3: Unit Title */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Unit title
                    </td>
                    <td colSpan={6} className="p-2 font-bold text-slate-950 uppercase tracking-wide">
                      {plan.unitTitle}
                    </td>
                  </tr>

                  {/* Row 4: Key Unit Competence */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Key unit competence
                    </td>
                    <td colSpan={6} className="p-2 font-medium leading-relaxed">
                      {plan.keyUnitCompetence}
                    </td>
                  </tr>

                  {/* Row 5: Title of the lesson */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Title of the lesson
                    </td>
                    <td colSpan={6} className="p-2 font-bold text-slate-950">
                      {plan.lessonTitle}
                    </td>
                  </tr>

                  {/* Row 6: Instructional Objectives */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Instructional objectives
                    </td>
                    <td colSpan={6} className="p-2 font-medium leading-relaxed">
                      {plan.instructionalObjective}
                    </td>
                  </tr>

                  {/* Row 7: Plan of this class (Location) */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Plan of this class (Location)
                    </td>
                    <td colSpan={6} className="p-2 font-medium">
                      {plan.location || 'Classroom'}
                    </td>
                  </tr>

                  {/* Row 8: Learning materials */}
                  <tr className="border-b border-slate-900">
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      Learning materials
                    </td>
                    <td colSpan={6} className="p-2 font-medium leading-relaxed">
                      {plan.learningMaterials}
                    </td>
                  </tr>

                  {/* Row 9: References */}
                  <tr>
                    <td colSpan={2} className="p-2 font-bold bg-slate-50 border-r border-slate-900">
                      References
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
                      Timing for each step
                    </th>
                    <th colSpan={2} className="p-2 border-r border-slate-900 w-3/5 text-center align-middle">
                      Description of teaching and learning activities
                    </th>
                    <th className="p-2 w-1/5 text-left align-middle">
                      Generic competences and cross-cutting issues + some explanations
                    </th>
                  </tr>
                  {/* Summary row across description column */}
                  <tr className="border-b border-slate-900 italic text-slate-800 bg-slate-50/80">
                    <td className="border-r border-slate-900"></td>
                    <td colSpan={2} className="p-1.5 border-r border-slate-900 text-center font-medium">
                      {plan.activitySummary || `Students will engage in discussions and structured group activities on ${plan.lessonTitle.toLowerCase()}.`}
                    </td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-900 bg-slate-100 font-bold">
                    <td className="border-r border-slate-900"></td>
                    <td className="p-1.5 border-r border-slate-900 text-left w-1/2">Teacher's activity</td>
                    <td className="p-1.5 border-r border-slate-900 text-left w-1/2">Learner's activity</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {/* Step 1: Introduction */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-900 align-top">
                      Introduction ({plan.steps.introduction.duration})
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.introduction.teacherActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.introduction.learnerActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.introduction.competencesAndCrossCutting.map((comp, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>

                  {/* Step 2: Lesson Development */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-900 align-top">
                      Lesson Development ({plan.steps.development.duration})
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1.5">
                        {plan.steps.development.teacherActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1.5">
                        {plan.steps.development.learnerActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 align-top leading-relaxed">
                      <ul className="space-y-1.5">
                        {plan.steps.development.competencesAndCrossCutting.map((comp, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>

                  {/* Step 3: Conclusion */}
                  <tr className="border-b border-slate-900">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-900 align-top">
                      Conclusion ({plan.steps.conclusion.duration})
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.conclusion.teacherActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 border-r border-slate-900 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.conclusion.learnerActivities.map((act, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 align-top leading-relaxed">
                      <ul className="space-y-1">
                        {plan.steps.conclusion.competencesAndCrossCutting.map((comp, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="shrink-0">-</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>

                  {/* Bottom Row: Teacher's self-evaluation */}
                  <tr>
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-900 align-top">
                      Teacher's self-evaluation
                    </td>
                    <td colSpan={3} className="p-2 font-medium italic text-slate-900 leading-relaxed">
                      {plan.selfEvaluation || 'Lesson delivered effectively following official REB Competency-Based Curriculum guidelines. Instructional objectives met; learners engaged in cooperative group work and formative assessment.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer stamp */}
            <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600 inline" /> Verified REB Format — Generated via Elimu360 Open System
              </span>
              <span>Document ID: {plan.id}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
