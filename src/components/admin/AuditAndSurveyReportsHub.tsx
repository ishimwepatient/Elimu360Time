import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Building2, 
  AlertTriangle, 
  ShieldAlert, 
  Download, 
  Sparkles, 
  RefreshCw,
  Activity,
  FileText
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { ProductIntelligenceDashboard } from '../analytics/ProductIntelligenceDashboard';

export const AuditAndSurveyReportsHub: React.FC = () => {
  const { currentUser, auditLogs, refreshDataFromCloud } = useElimu();
  const [activeTab, setActiveTab] = useState<'SURVEY_REPORTS' | 'SECURITY_AUDIT_LOGS'>('SURVEY_REPORTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Strict Super Admin Access Enforced
  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-rose-800 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white font-display">Super Admin Access Enforced</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          System Security Audit Logs and Onboarding Survey Reports are restricted strictly to the <strong>Super Administrator</strong> under institutional platform governance.
        </p>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDataFromCloud();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filtered Audit Logs
  const entityTypes = Array.from(new Set(auditLogs.map(a => a.entity_type).filter(Boolean)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = selectedEntityFilter === 'ALL' || log.entity_type === selectedEntityFilter;

    return matchesSearch && matchesEntity;
  });

  const handleExportAuditCsv = () => {
    if (filteredLogs.length === 0) {
      alert('No audit logs available to export.');
      return;
    }

    const headers = ['Timestamp', 'User Name', 'Role', 'Action', 'Entity Type', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.user_name || 'System'}"`,
      `"${l.user_role || 'SYSTEM'}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || '127.0.0.1'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Elimu360_System_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 border border-blue-800/60 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Restricted Access · System Audit & Field Survey Reports</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
            System Audit & Onboarding Survey Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Centralized intelligence module receiving field onboarding survey reports from school visits, alongside immutable security audit logs tracking system actions and role assignments across Elimu360 SIMS.
          </p>
        </div>
      </div>

      {/* Primary Tab Selector */}
      <div className="flex border-b border-slate-800 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('SURVEY_REPORTS')}
          className={`pb-3 flex items-center gap-2 transition cursor-pointer border-b-2 ${
            activeTab === 'SURVEY_REPORTS'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Onboarding Survey Reports & Field Intelligence</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Field Reports
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY_AUDIT_LOGS')}
          className={`pb-3 flex items-center gap-2 transition cursor-pointer border-b-2 ${
            activeTab === 'SECURITY_AUDIT_LOGS'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security & System Audit Telemetry</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
            {auditLogs.length} Events
          </span>
        </button>
      </div>

      {/* Tab 1: Survey Reports & Product Intelligence */}
      {activeTab === 'SURVEY_REPORTS' && (
        <ProductIntelligenceDashboard />
      )}

      {/* Tab 2: System Security Audit Telemetry */}
      {activeTab === 'SECURITY_AUDIT_LOGS' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs by user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedEntityFilter}
                onChange={(e) => setSelectedEntityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Event Categories</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportAuditCsv}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/30 transition cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Logs CSV</span>
            </button>

          </div>

          {/* Audit Log Stream Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User & Role</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No audit events match the current search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-950/50 transition">
                        
                        <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-white text-xs">{log.user_name || 'System Auto'}</div>
                          <div className="text-[10px] text-blue-400 font-mono">{log.user_role || 'SYSTEM'}</div>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 text-[10px] font-mono font-bold">
                            {log.action}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                          {log.entity_type}
                        </td>

                        <td className="p-3 text-slate-300 text-xs leading-relaxed max-w-md">
                          {log.details}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
