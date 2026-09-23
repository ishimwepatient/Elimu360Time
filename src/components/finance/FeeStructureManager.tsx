import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Archive, 
  Layers, 
  Users, 
  Building2, 
  Globe, 
  Bookmark, 
  X,
  Check
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { FeeCategory, FeeStructure } from '../../types';
import { parseCleanNumber } from '../../utils/numberUtils';

interface FeeStructureManagerProps {
  selectedAcademicYear: string;
  selectedTermFilter: string;
  isPeriodClosed: boolean;
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const FeeStructureManager: React.FC<FeeStructureManagerProps> = ({
  selectedAcademicYear,
  selectedTermFilter,
  isPeriodClosed,
  onAuditLog
}) => {
  const { 
    activeSchool, 
    feeStructures, 
    addFeeStructure, 
    updateFeeStructure, 
    deleteFeeStructure,
    classes,
    students
  } = useElimu();

  // Filters
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'GLOBAL' | 'LEVEL' | 'CLASS' | 'STUDENT_TAG'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeStructure | null>(null);

  // Form Fields
  const [feeCategory, setFeeCategory] = useState<FeeCategory>('TUITION');
  const [feeName, setFeeName] = useState('');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [feeMandatory, setFeeMandatory] = useState<boolean>(true);
  const [feeFrequency, setFeeFrequency] = useState<'PER_TERM' | 'PER_YEAR' | 'ONE_TIME'>('PER_TERM');
  const [feeScope, setFeeScope] = useState<'GLOBAL' | 'LEVEL' | 'CLASS' | 'STUDENT_TAG'>('GLOBAL');
  const [feeEducationLevel, setFeeEducationLevel] = useState<string>('Ordinary Level');
  const [feeTargetClassId, setFeeTargetClassId] = useState<string>(classes[0]?.id || '');
  const [feeTargetTag, setFeeTargetTag] = useState<string>('BOARDER');
  const [feeDueDate, setFeeDueDate] = useState<string>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));

  // Active School Fee Structures (Filtered by Academic Year & Term)
  const schoolFeeStructures = feeStructures.filter(f => {
    if (f.school_id !== activeSchool.id) return false;
    if (f.academic_year && f.academic_year !== selectedAcademicYear) return false;
    if (selectedTermFilter !== 'Full Year' && f.term && f.term !== 'ALL_TERMS' && f.term !== 'Full Year' && f.term !== selectedTermFilter) return false;
    return true;
  });

  const filteredFeeStructures = schoolFeeStructures.filter(f => {
    const matchScope = scopeFilter === 'ALL' || f.allocation_scope === scopeFilter || (!f.allocation_scope && scopeFilter === 'GLOBAL');
    const matchCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchScope && matchCategory;
  });

  // Calculate affected students preview for the form
  const getAffectedStudentsCount = (scope: string, level: string, classId: string, tag: string) => {
    const schoolStudents = students.filter(s => s.school_id === activeSchool.id && s.status === 'ACTIVE');
    if (scope === 'GLOBAL') {
      return schoolStudents.length;
    }
    if (scope === 'LEVEL') {
      const levelClasses = classes.filter(c => 
        c.level_name?.toLowerCase().includes(level.toLowerCase()) || 
        c.level?.toLowerCase().includes(level.toLowerCase())
      );
      return schoolStudents.filter(s => levelClasses.some(c => c.id === s.class_id || c.name === s.class_name)).length;
    }
    if (scope === 'CLASS') {
      const targetClass = classes.find(c => c.id === classId);
      return schoolStudents.filter(s => s.class_id === classId || (targetClass && s.class_name === targetClass.name)).length;
    }
    if (scope === 'STUDENT_TAG') {
      if (tag === 'BOARDER') {
        return schoolStudents.filter(s => s.boarding_status === 'BOARDING').length;
      }
      if (tag === 'DAY') {
        return schoolStudents.filter(s => s.boarding_status === 'DAY' || !s.boarding_status).length;
      }
      return schoolStudents.length;
    }
    return schoolStudents.length;
  };

  const previewCount = getAffectedStudentsCount(feeScope, feeEducationLevel, feeTargetClassId, feeTargetTag);

  const handleOpenCreateModal = () => {
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED. Unlock the period to create or modify fee structures.");
      return;
    }
    setEditingItem(null);
    setFeeCategory('TUITION');
    setFeeName('');
    setFeeAmount(0);
    setFeeMandatory(true);
    setFeeFrequency('PER_TERM');
    setFeeScope('GLOBAL');
    setFeeEducationLevel('Ordinary Level');
    setFeeTargetClassId(classes[0]?.id || '');
    setFeeTargetTag('BOARDER');
    setFeeDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));
    setShowModal(true);
  };

  const handleOpenEditModal = (item: FeeStructure) => {
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED. Unlock the period to modify fee structures.");
      return;
    }
    setEditingItem(item);
    setFeeCategory(item.category);
    setFeeName(item.category_label || '');
    setFeeAmount(item.amount);
    setFeeMandatory(item.mandatory);
    setFeeFrequency(item.frequency || 'PER_TERM');
    setFeeScope(item.allocation_scope || 'GLOBAL');
    setFeeEducationLevel(item.education_level || 'Ordinary Level');
    setFeeTargetClassId(item.target_class_id || classes[0]?.id || '');
    setFeeTargetTag(item.target_tag || 'BOARDER');
    setFeeDueDate(item.due_date || '2026-03-31');
    setShowModal(true);
  };

  const handleSubmitFeeStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName.trim()) {
      alert("Please provide a descriptive fee name.");
      return;
    }

    const cleanAmt = parseCleanNumber(feeAmount);
    if (cleanAmt <= 0) {
      alert("Please specify a valid payable fee amount greater than 0.");
      return;
    }

    const selectedClass = classes.find(c => c.id === feeTargetClassId);

    if (editingItem) {
      const updated: FeeStructure = {
        ...editingItem,
        category: feeCategory,
        category_label: feeName.trim(),
        amount: cleanAmt,
        mandatory: feeMandatory,
        frequency: feeFrequency,
        allocation_scope: feeScope,
        education_level: feeScope === 'LEVEL' ? feeEducationLevel : undefined,
        target_class_id: feeScope === 'CLASS' ? feeTargetClassId : undefined,
        target_class_name: feeScope === 'CLASS' && selectedClass ? selectedClass.name : undefined,
        target_tag: feeScope === 'STUDENT_TAG' ? feeTargetTag : undefined,
        due_date: feeDueDate,
      };
      updateFeeStructure(updated);
      onAuditLog?.('FEE_STRUCTURE_UPDATED', 'FeeStructure', editingItem.id, `Bursar modified fee '${feeName}' to RWF ${cleanAmt.toLocaleString()}`);
    } else {
      const newFee: Omit<FeeStructure, 'id'> = {
        school_id: activeSchool.id,
        academic_year: selectedAcademicYear,
        term: selectedTermFilter === 'Full Year' ? 'ALL_TERMS' : selectedTermFilter,
        class_level: feeScope === 'GLOBAL' ? 'ALL' : feeScope === 'LEVEL' ? feeEducationLevel : feeScope === 'CLASS' && selectedClass ? selectedClass.name : 'ALL',
        category: feeCategory,
        category_label: feeName.trim(),
        amount: cleanAmt,
        currency: 'RWF',
        due_date: feeDueDate,
        mandatory: feeMandatory,
        allocation_scope: feeScope,
        education_level: feeScope === 'LEVEL' ? feeEducationLevel : undefined,
        target_class_id: feeScope === 'CLASS' ? feeTargetClassId : undefined,
        target_class_name: feeScope === 'CLASS' && selectedClass ? selectedClass.name : undefined,
        target_tag: feeScope === 'STUDENT_TAG' ? feeTargetTag : undefined,
        frequency: feeFrequency,
        status: 'ACTIVE'
      };
      addFeeStructure(newFee);
      onAuditLog?.('FEE_STRUCTURE_CREATED', 'FeeStructure', feeName, `Bursar created new fee '${feeName}' (RWF ${cleanAmt.toLocaleString()}, scope: ${feeScope})`);
    }

    setShowModal(false);
  };

  const handleDeleteFee = (id: string, name: string) => {
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED.");
      return;
    }
    if (confirm(`Are you sure you want to delete the fee structure '${name}'? This will remove this payable fee from student billing ledgers.`)) {
      deleteFeeStructure(id);
      onAuditLog?.('FEE_STRUCTURE_DELETED', 'FeeStructure', id, `Bursar deleted fee '${name}'`);
    }
  };

  const handleToggleStatus = (item: FeeStructure) => {
    if (isPeriodClosed) {
      alert("Error: The current financial period is CLOSED.");
      return;
    }
    const nextStatus = item.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    updateFeeStructure({ ...item, status: nextStatus });
    onAuditLog?.('FEE_STRUCTURE_STATUS_CHANGED', 'FeeStructure', item.id, `Status set to ${nextStatus} for fee '${item.category_label}'`);
  };

  const exportCSV = () => {
    const rows = [
      ['Fee Name', 'Category', 'Scope', 'Target / Level / Class', 'Frequency', 'Mandatory', 'Amount (RWF)', 'Due Date', 'Status'],
      ...filteredFeeStructures.map(f => [
        f.category_label,
        f.category,
        f.allocation_scope || 'GLOBAL',
        f.allocation_scope === 'LEVEL' ? (f.education_level || '') : f.allocation_scope === 'CLASS' ? (f.target_class_name || '') : f.allocation_scope === 'STUDENT_TAG' ? (f.target_tag || '') : 'Whole School',
        f.frequency || 'PER_TERM',
        f.mandatory ? 'YES' : 'NO',
        f.amount.toString(),
        f.due_date,
        f.status || 'ACTIVE'
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Structures_${activeSchool.code}_${selectedAcademicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Actions */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>School Fee Structure & Rate Setting</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Set and manage payable fees for the school. Configurable globally, by education level, class-by-class, or by student accommodation tag.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportCSV}
            disabled={schoolFeeStructures.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fee Item</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Scope:</span>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
          >
            <option value="ALL">All Allocation Scopes</option>
            <option value="GLOBAL">🌍 Whole School (Global)</option>
            <option value="LEVEL">🎓 By Education Level</option>
            <option value="CLASS">🏫 Class-by-Class</option>
            <option value="STUDENT_TAG">🏷️ Student Tag (Boarders/Day)</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="TUITION">Tuition</option>
            <option value="BOARDING">Boarding & Catering</option>
            <option value="ACTIVITY">Activity & Science Lab</option>
            <option value="UNIFORM">Uniform & Supplies</option>
            <option value="EXAMINATION">National Examination</option>
            <option value="LIBRARY">Library</option>
            <option value="OTHER">Other Custom</option>
          </select>
        </div>

        <div className="ml-auto text-slate-400 font-mono text-[11px]">
          Showing <strong className="text-white">{filteredFeeStructures.length}</strong> of {schoolFeeStructures.length} Fee Items
        </div>
      </div>

      {/* Fee Table or Empty State */}
      {filteredFeeStructures.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No School Fee Structures Configured</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              The bursar has not added payable fee items for this school yet. Click &apos;Create Fee Item&apos; to define tuition, boarding, lab fees, or examination fees.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Fee Structure</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Fee Item & Category</th>
                  <th className="py-3.5 px-4">Allocation Scope</th>
                  <th className="py-3.5 px-4">Target Specification</th>
                  <th className="py-3.5 px-4">Frequency & Type</th>
                  <th className="py-3.5 px-4">Amount (RWF)</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFeeStructures.map((fee) => {
                  const scope = fee.allocation_scope || 'GLOBAL';
                  const isArchived = fee.status === 'ARCHIVED';
                  return (
                    <tr key={fee.id} className={`hover:bg-slate-800/40 transition ${isArchived ? 'opacity-60 bg-slate-950/30' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{fee.category_label || fee.category}</div>
                        <span className="text-[10px] text-blue-400 font-mono font-medium">{fee.category}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          scope === 'GLOBAL' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          scope === 'LEVEL' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                          scope === 'CLASS' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                          'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {scope === 'GLOBAL' && <Globe className="w-3 h-3" />}
                          {scope === 'LEVEL' && <Layers className="w-3 h-3" />}
                          {scope === 'CLASS' && <Building2 className="w-3 h-3" />}
                          {scope === 'STUDENT_TAG' && <Bookmark className="w-3 h-3" />}
                          <span>{scope}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {scope === 'GLOBAL' && <span className="text-slate-400">Whole School (All Enrolled)</span>}
                        {scope === 'LEVEL' && <span className="text-blue-300 font-semibold">{fee.education_level || 'All Levels'}</span>}
                        {scope === 'CLASS' && <span className="text-purple-300 font-semibold">{fee.target_class_name || 'Specific Class'}</span>}
                        {scope === 'STUDENT_TAG' && (
                          <span className="text-amber-300 font-semibold">
                            {fee.target_tag === 'BOARDER' ? 'Boarding Students Only' : fee.target_tag === 'DAY' ? 'Day Scholars Only' : fee.target_tag}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{fee.frequency?.replace('_', ' ') || 'PER TERM'}</div>
                        <span className={`text-[10px] font-semibold ${fee.mandatory ? 'text-rose-400' : 'text-slate-400'}`}>
                          {fee.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        RWF {fee.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {fee.due_date || 'End of Term'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fee.status === 'ARCHIVED' 
                            ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {fee.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(fee)}
                            title="Edit Rate or Parameters"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(fee)}
                            title={isArchived ? "Activate" : "Archive"}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee.id, fee.category_label || fee.category)}
                            title="Delete Fee Structure"
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition cursor-pointer border border-rose-900/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT FEE STRUCTURE
          ========================================================================= */}
      {showModal && (
        <div className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Edit School Fee Structure' : 'Create New School Fee Structure'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeeStructure} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-medium text-slate-300 mb-1">Fee Item Name / Description:</label>
                <input
                  type="text"
                  placeholder="e.g. Primary 5 Academic Tuition, Boarding & Meals, Science Lab"
                  value={feeName}
                  onChange={(e) => setFeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Fee Category:</label>
                  <select
                    value={feeCategory}
                    onChange={(e) => setFeeCategory(e.target.value as FeeCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TUITION">Tuition & Academic</option>
                    <option value="BOARDING">Boarding & Catering</option>
                    <option value="ACTIVITY">Activity & Science Lab</option>
                    <option value="UNIFORM">Uniform & Materials</option>
                    <option value="EXAMINATION">National Exam Registration</option>
                    <option value="LIBRARY">Library Subscription</option>
                    <option value="OTHER">Other Custom Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Amount (RWF):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100000"
                    value={feeAmount === 0 ? '' : feeAmount}
                    onChange={(e) => setFeeAmount(parseCleanNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Allocation Scope Selection */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Allocation Scope (Who pays this fee?):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'GLOBAL', label: 'Whole School', icon: Globe },
                    { id: 'LEVEL', label: 'By Level', icon: Layers },
                    { id: 'CLASS', label: 'By Class', icon: Building2 },
                    { id: 'STUDENT_TAG', label: 'By Tag', icon: Bookmark },
                  ].map(sc => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setFeeScope(sc.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        feeScope === sc.id 
                          ? 'bg-emerald-950/80 border-emerald-600 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <sc.icon className="w-4 h-4 mb-1 text-emerald-400" />
                      <span className="font-bold text-[11px]">{sc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Scope Fields */}
              {feeScope === 'LEVEL' && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Select Education Level:</label>
                  <select
                    value={feeEducationLevel}
                    onChange={(e) => setFeeEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Nursery">Nursery / Pre-Primary</option>
                    <option value="Primary">Primary School</option>
                    <option value="Ordinary Level">Ordinary Level (O-Level / S1-S3)</option>
                    <option value="Advanced Level">Advanced Level (A-Level / S4-S6)</option>
                    <option value="TSS">Technical / TVET / TSS</option>
                  </select>
                </div>
              )}

              {feeScope === 'CLASS' && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Select Target Class:</label>
                  <select
                    value={feeTargetClassId}
                    onChange={(e) => setFeeTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.level_name || 'General'})</option>
                    ))}
                  </select>
                </div>
              )}

              {feeScope === 'STUDENT_TAG' && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Select Target Tag:</label>
                  <select
                    value={feeTargetTag}
                    onChange={(e) => setFeeTargetTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BOARDER">Boarding Students Only (BOARDER)</option>
                    <option value="DAY">Day Scholars Only (DAY)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Billing Frequency:</label>
                  <select
                    value={feeFrequency}
                    onChange={(e) => setFeeFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PER_TERM">Per Term (Recurring 3x/year)</option>
                    <option value="PER_YEAR">Annual (1x per Academic Year)</option>
                    <option value="ONE_TIME">One-Time Registration Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Fee Obligation:</label>
                  <select
                    value={feeMandatory ? 'MANDATORY' : 'OPTIONAL'}
                    onChange={(e) => setFeeMandatory(e.target.value === 'MANDATORY')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MANDATORY">Compulsory (Mandatory)</option>
                    <option value="OPTIONAL">Elective / Optional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Fee Due Date:</label>
                <input
                  type="date"
                  value={feeDueDate}
                  onChange={(e) => setFeeDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Dynamic Impact Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="text-slate-400">
                  <span>Targeted Active Students: </span>
                  <strong className="text-white font-mono">{previewCount} Students</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Projected Target Total:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    RWF {(previewCount * feeAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-950"
                >
                  {editingItem ? 'Save Changes' : 'Create Fee Structure'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
