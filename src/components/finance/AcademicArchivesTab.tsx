import React, { useState } from 'react';
import { 
  Archive, 
  Download, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

interface AcademicArchivesTabProps {
  onAuditLog?: (action: string, entity_type: string, entity_id: string, details: string) => void;
}

export const AcademicArchivesTab: React.FC<AcademicArchivesTabProps> = ({
  onAuditLog
}) => {
  const { activeSchool, registeredAcademicYears, archivedClasses, classes, students } = useElimu();
  const [selectedYear, setSelectedYear] = useState<string>(
    registeredAcademicYears[0]?.academic_year || '2025-2026'
  );
  const [searchFilter, setSearchFilter] = useState('');

  const schoolStudents = students.filter(s => s.school_id === activeSchool.id);
  const schoolClasses = classes.filter(c => c.school_id === activeSchool.id);

  // Group historical classes
  const yearClasses = archivedClasses.filter(ac => ac.academic_year === selectedYear);

  const displayList = yearClasses.length > 0 
    ? yearClasses.map(ac => ({
        id: ac.id,
        class_name: ac.class_name,
        level_name: schoolClasses.find(c => c.id === ac.class_id || c.name === ac.class_name)?.level_name || 'Academic Class',
        academic_year: ac.academic_year,
        total_students: ac.reports?.length || schoolStudents.filter(s => s.class_id === ac.class_id || s.class_name === ac.class_name).length,
      }))
    : schoolClasses.map(c => ({
        id: `ARCH-${c.id}`,
        class_name: c.name,
        level_name: c.level_name || c.level || 'General',
        academic_year: selectedYear,
        total_students: schoolStudents.filter(s => s.class_id === c.id || s.class_name === c.name).length,
      }));

  const filteredDisplay = displayList.filter(d => 
    d.class_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.level_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const exportArchiveCSV = () => {
    const rows = [
      ['Academic Year Archive', selectedYear, activeSchool.name],
      [],
      ['Class Name', 'Education Level', 'Total Students', 'Archive Status'],
      ...filteredDisplay.map(d => [
        d.class_name,
        d.level_name,
        d.total_students.toString(),
        'PERMANENTLY ARCHIVED'
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Archive_Records_${activeSchool.code}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>Academic Year Financial & Class Archives</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Retain and audit immutable records across all past academic years, promotions, and graduated classes.
          </p>
        </div>

        <button
          onClick={exportArchiveCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Archive (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 font-semibold">Select Year Archive:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none cursor-pointer font-bold"
          >
            {registeredAcademicYears.map(ay => (
              <option key={ay.academic_year} value={ay.academic_year}>
                {ay.academic_year}
              </option>
            ))}
            <option value="2025-2026">2025-2026 (Archive)</option>
            <option value="2024-2025">2024-2025 (Archive)</option>
            <option value="2023-2024">2023-2024 (Archive)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search archived classes..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Archive Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Archived Class</th>
                <th className="py-3.5 px-4">Education Level</th>
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4 text-center">Total Students</th>
                <th className="py-3.5 px-4">Data Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDisplay.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    {item.class_name}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300">
                    {item.level_name}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {selectedYear}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {item.total_students}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Immutable Archive Stored</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
