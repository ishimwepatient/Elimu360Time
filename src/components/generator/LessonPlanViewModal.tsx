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
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                <span>Rwanda Education Board (REB)</span>
                <span>Competency-Based Curriculum (CBC)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-display uppercase">
                Official Lesson Plan
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Elimu360 Open System — Sovereign Lesson Planning Platform
              </p>
            </div>

            {/* School & Basic Info Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-800">
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800 w-1/4">School Name:</td>
                    <td className="p-2.5 border-r border-slate-800 w-1/4 font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPlan.schoolName}
                          onChange={e => setEditedPlan({ ...editedPlan, schoolName: e.target.value })}
                          className="w-full p-1 bg-amber-50 border border-amber-300 rounded text-slate-900 font-semibold"
                        />
                      ) : (plan.schoolName || 'GS AMAROHO KIGALI')}
                    </td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800 w-1/4">Teacher's Name:</td>
                    <td className="p-2.5 font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPlan.teacherName}
                          onChange={e => setEditedPlan({ ...editedPlan, teacherName: e.target.value })}
                          className="w-full p-1 bg-amber-50 border border-amber-300 rounded text-slate-900 font-semibold"
                        />
                      ) : (plan.teacherName || 'TEACHER')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Term:</td>
                    <td className="p-2.5 border-r border-slate-800 font-semibold">{plan.term}</td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Date:</td>
                    <td className="p-2.5 font-semibold">{plan.date}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Subject:</td>
                    <td className="p-2.5 border-r border-slate-800 font-semibold">{plan.subject}</td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Class Level:</td>
                    <td className="p-2.5 font-semibold">{plan.classLevel}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Unit No:</td>
                    <td className="p-2.5 border-r border-slate-800 font-semibold">{plan.unitNumber}</td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Lesson No:</td>
                    <td className="p-2.5 font-semibold">{plan.lessonNumber}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Duration:</td>
                    <td className="p-2.5 border-r border-slate-800 font-semibold">{plan.duration}</td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Class Size:</td>
                    <td className="p-2.5 font-semibold">{plan.classSize} Learners</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Location:</td>
                    <td className="p-2.5 border-r border-slate-800 font-semibold">{plan.location}</td>
                    <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800">Special Needs:</td>
                    <td className="p-2.5 font-semibold text-slate-700">{plan.specialNeeds || 'None'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Titles & Competence Section */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">Unit Title:</span>
                <p className="font-extrabold text-slate-950 text-sm">{plan.unitTitle}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">Key Unit Competence:</span>
                <p className="text-slate-800 leading-relaxed font-medium">{plan.keyUnitCompetence}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <span className="font-bold text-amber-900 block mb-1 uppercase tracking-wide">Lesson Title:</span>
                <p className="font-black text-amber-950 text-sm">{plan.lessonTitle}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">Instructional Objective:</span>
                <p className="text-slate-900 leading-relaxed font-semibold">{plan.instructionalObjective}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-800 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">Learning Materials:</span>
                  <p className="text-slate-800 leading-relaxed">{plan.learningMaterials}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-800 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">References:</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line">{plan.references}</p>
                </div>
              </div>
            </div>

            {/* Main REB Step-by-Step Activities Table */}
            <div>
              <h3 className="font-extrabold text-slate-950 uppercase text-xs mb-2 tracking-wider">
                Detailed Lesson Execution & Competences
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-900">
                      <th className="p-2.5 border-r border-slate-700 w-1/6 text-left">Timing & Step</th>
                      <th className="p-2.5 border-r border-slate-700 w-1/3 text-left">Teacher's Activities</th>
                      <th className="p-2.5 border-r border-slate-700 w-1/3 text-left">Learner's Activities</th>
                      <th className="p-2.5 w-1/4 text-left">Generic Competences & Cross-Cutting Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Step 1: Introduction */}
                    <tr className="border-b border-slate-800">
                      <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800 align-top">
                        <span className="text-slate-950 block font-extrabold">1. Introduction</span>
                        <span className="text-slate-600 text-[11px]">({plan.steps.introduction.duration})</span>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {plan.steps.introduction.teacherActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {plan.steps.introduction.learnerActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 align-top leading-relaxed bg-slate-50/50">
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {plan.steps.introduction.competencesAndCrossCutting.map((comp, i) => (
                            <li key={i}>{comp}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Step 2: Development */}
                    <tr className="border-b border-slate-800">
                      <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800 align-top">
                        <span className="text-slate-950 block font-extrabold">2. Lesson Development</span>
                        <span className="text-slate-600 text-[11px]">({plan.steps.development.duration})</span>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1.5">
                          {plan.steps.development.teacherActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1.5">
                          {plan.steps.development.learnerActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 align-top leading-relaxed bg-slate-50/50">
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-800">
                          {plan.steps.development.competencesAndCrossCutting.map((comp, i) => (
                            <li key={i}>{comp}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Step 3: Conclusion */}
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 border-r border-slate-800 align-top">
                        <span className="text-slate-950 block font-extrabold">3. Conclusion & Assessment</span>
                        <span className="text-slate-600 text-[11px]">({plan.steps.conclusion.duration})</span>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {plan.steps.conclusion.teacherActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 align-top leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                          {plan.steps.conclusion.learnerActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 align-top leading-relaxed bg-slate-50/50">
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {plan.steps.conclusion.competencesAndCrossCutting.map((comp, i) => (
                            <li key={i}>{comp}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Self Evaluation */}
            <div className="p-4 bg-slate-50 border border-slate-800 rounded-lg text-xs">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">Teacher's Self-Evaluation:</span>
              <p className="text-slate-800 italic leading-relaxed">
                {plan.selfEvaluation || 'Lesson delivered effectively following official REB Competency-Based Curriculum guidelines. Instructional objectives met; learners engaged in cooperative group work and formative assessment.'}
              </p>
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
