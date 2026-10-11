import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, CheckCircle2, Download, FileText, Smartphone, WifiOff, RefreshCw } from 'lucide-react';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';

interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'PWA & Offline' | 'Lesson Generator' | 'Converter';
}

const FAQ_LIST: FAQItem[] = [
  {
    question: 'How do I install Elimu360 on my phone or computer?',
    answer: 'Simply tap the "Install App" button in the navigation header or banner. On Chrome or Android, tap "Install". On iPhone/iPad (Safari), tap the Share icon at the bottom of Safari, scroll down, and tap "Add to Home Screen". Once installed, it works just like a native app from the Play Store or App Store!',
    category: 'PWA & Offline'
  },
  {
    question: 'Can I use Elimu360 when I have no internet or low connection?',
    answer: 'Yes! Elimu360 is built as a Progressive Web App (PWA) with a local service worker cache and an embedded pedagogical engine. Once loaded in your browser, you can generate REB lesson plans, convert documents, and open saved plans completely offline without requiring mobile data.',
    category: 'PWA & Offline'
  },
  {
    question: 'Are the generated lesson plans compliant with Rwanda Education Board (REB) standards?',
    answer: 'Yes, 100%. Every lesson plan follows the standard REB Competency-Based Curriculum (CBC) layout, including Key Unit Competences, Bloom’s taxonomy action verbs, the 3-step timing methodology (Introduction, Lesson Development, Conclusion), cross-cutting issues, and learner-centered activities.',
    category: 'Lesson Generator'
  },
  {
    question: 'How does the Direct Unit Folder Export work without needing to unzip?',
    answer: 'Instead of forcing you to download a ZIP archive and figure out how to extract it, our system uses the modern File System Access API. When you click "Save All to Unit Folder", your browser asks you where to save it, creates a real named folder on your computer (e.g. Unit_1_Algebra), and places all individual lesson files inside directly.',
    category: 'Lesson Generator'
  },
  {
    question: 'Why do my converted Word files (PDF to DOCX) now have proper spacing and formatting?',
    answer: 'Our document converter features an intelligent bounding-box layout reconstruction engine. It calculates exact horizontal word gaps to prevent merged words, preserves bold and italic typography, maps headings into real Word Heading styles, and reconstructs multi-column tables into editable Microsoft Word tables.',
    category: 'Converter'
  },
  {
    question: 'Is Elimu360 really free for teachers?',
    answer: 'Yes, Elimu360 is completely free. We do not charge subscription fees or require credit cards. The system is sponsored by non-intrusive educational promotions and grants from our technology partners, allowing us to deliver sovereign educational tools freely to all educators across Africa.',
    category: 'General'
  },
  {
    question: 'Who develops and maintains Elimu360?',
    answer: 'Elimu360 Open System is developed and published by The Palace, Inc — The Palace Tech House. All rights are reserved under international copyright standards.',
    category: 'General'
  }
];

export const FAQCenter: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const filteredFAQs = selectedCategory === 'All' 
    ? FAQ_LIST 
    : FAQ_LIST.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Educator Help Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Quick answers to common questions about offline usage, app installation, lesson generation, and document conversion.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['All', 'PWA & Offline', 'Lesson Generator', 'Converter', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFAQs.map((item, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition hover:border-slate-700 shadow-md"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                    Q
                  </span>
                  <span className="text-sm font-bold text-white font-display">
                    {item.question}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 leading-relaxed bg-slate-950/40">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strategic Native Ad Banner */}
      <AdsterraNativeBanner badgeLabel="Curated Educational Scholarships & Educator Grants" />

    </div>
  );
};
