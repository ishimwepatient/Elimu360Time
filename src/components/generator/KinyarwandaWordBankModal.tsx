import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Copy, 
  Check, 
  BookOpen, 
  Award, 
  Sparkles, 
  Layers, 
  Filter,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { KINYARWANDA_PEDAGOGICAL_DICTIONARY } from '../../utils/kinyarwandaPedagogicalBank';

interface KinyarwandaWordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord?: (word: string, category: string) => void;
}

export const KinyarwandaWordBankModal: React.FC<KinyarwandaWordBankModalProps> = ({
  isOpen,
  onClose,
  onSelectWord
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Amagambo Yose' },
    { id: 'inshingaMwarimu', name: 'Inshinga za Mwarimu' },
    { id: 'inshingaAbana', name: "Inshinga z'Abanyeshuri" },
    { id: 'bloom', name: 'Inshinga za Bloom (Nzego 6)' },
    { id: 'ubushobozi', name: 'Ubushobozi Rusange (CBC)' },
    { id: 'insanganyamatsiko', name: 'Insanganyamatsiko Zambukiranya' },
    { id: 'imfashanyigisho', name: 'Imfashanyigisho n\'Ibikoresho' },
    { id: 'indangagaciro', name: 'Indangagaciro n\'Imyifatire' }
  ];

  // Flattened search items
  const allItems = useMemo(() => {
    const list: Array<{ id: string; word: string; category: string; categoryLabel: string; details?: string }> = [];

    // Teacher verbs
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.inshingaZaMwarimu.forEach((w, idx) => {
      list.push({ id: `tm_${idx}`, word: w, category: 'inshingaMwarimu', categoryLabel: "Imirimo y'umwarimu" });
    });

    // Student verbs
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.inshingaZAbanyeshuri.forEach((w, idx) => {
      list.push({ id: `lr_${idx}`, word: w, category: 'inshingaAbana', categoryLabel: "Imirimo y'abanyeshuri" });
    });

    // Bloom verbs
    Object.entries(KINYARWANDA_PEDAGOGICAL_DICTIONARY.bloomVerbs).forEach(([level, verbs]) => {
      verbs.forEach((w, idx) => {
        list.push({ 
          id: `bl_${level}_${idx}`, 
          word: w, 
          category: 'bloom', 
          categoryLabel: `Bloom: Urwego rwo ${level.replace('_', ' ')}` 
        });
      });
    });

    // Generic Competences
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.ubushoboziRusange.forEach((c, idx) => {
      list.push({ 
        id: `ub_${idx}`, 
        word: c.izina, 
        category: 'ubushobozi', 
        categoryLabel: 'Ubushobozi Rusange bwa REB CBC',
        details: c.ibisobanuro 
      });
    });

    // Cross-cutting issues
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.insanganyamatsikoZambukiranya.forEach((iss, idx) => {
      list.push({ 
        id: `ins_${idx}`, 
        word: iss.izina, 
        category: 'insanganyamatsiko', 
        categoryLabel: 'Insanganyamatsiko yambukiranya amasomo',
        details: iss.ibisobanuro 
      });
    });

    // Materials
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.imfashanyigisho.forEach((m, idx) => {
      list.push({ id: `mat_${idx}`, word: m, category: 'imfashanyigisho', categoryLabel: 'Imfashanyigisho' });
    });

    // Values
    KINYARWANDA_PEDAGOGICAL_DICTIONARY.indangagaciro.forEach((v, idx) => {
      list.push({ id: `val_${idx}`, word: v, category: 'indangagaciro', categoryLabel: 'Indangagaciro' });
    });

    return list;
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchQuery = !searchQuery.trim() || 
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.details && item.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allItems, activeCategory, searchQuery]);

  const handleCopy = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Ikigega cy'Amagambo n'Inshinga by'Ikinyarwanda
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  REB CBC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Amagambo arenga {allItems.length} akoreshwa mu iteguriro ry'isomo ry'Ikinyarwanda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shakisha inshinga, ubushobozi, imfashanyigisho, urwego rwa Bloom..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Guhanagura
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer text-xs ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Words Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1 pb-1">
            <span>Byabonetse: <strong className="text-amber-400 font-bold">{filteredItems.length}</strong></span>
            <span className="italic text-[11px]">Kanda kuri "Koresha" cyangwa "Kopera"</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white capitalize leading-snug">
                      {item.word}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 shrink-0 font-medium">
                      {item.categoryLabel}
                    </span>
                  </div>
                  {item.details && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.word)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedWord === item.word ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Yakopewe</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Kopera</span>
                      </>
                    )}
                  </button>

                  {onSelectWord && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWord(item.word, item.category);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/20 hover:border-amber-500 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Koresha</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">Nta jambo ryabonetse rijyanye n'iryo washatse.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="text-xs text-amber-400 hover:underline"
              >
                Gusubiramo amagambo yose
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Integanyanyigisho ya REB CBC mu Kinyarwanda</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
