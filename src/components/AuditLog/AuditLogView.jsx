import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Trash2, 
  Edit3, 
  Download, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  Search
} from 'lucide-react';

export default function AuditLogView({ auditLogs, onClearAuditLogs }) {
  const [filterAction, setFilterAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = filterAction === 'all' ? true : log.action === filterAction;
    const matchesSearch = (log.memoryText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `memoriflow_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="audit-log-container">
      {/* Header */}
      <div className="audit-header-bar glass-card">
        <div className="flex items-center gap-3">
          <div className="icon-badge-glow">
            <History className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="audit-title">Memory Consent Audit Trail</h2>
            <p className="audit-subtitle">
              Immutable timestamped log of all memory negotiation choices, promotion/demotion actions, and privacy policies.
            </p>
          </div>
        </div>

        <div className="audit-header-actions">
          <button className="btn-secondary" onClick={handleExportJSON}>
            <Download size={15} /> Export Audit Log
          </button>
          <button 
            className="btn-secondary text-rose-400 hover:bg-rose-500/20"
            onClick={onClearAuditLogs}
          >
            <Trash2 size={15} /> Clear Trail
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="audit-filters-bar glass-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon text-slate-400" />
          <input 
            type="text"
            className="vault-search-input"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button 
            className={`filter-chip ${filterAction === 'all' ? 'active' : ''}`}
            onClick={() => setFilterAction('all')}
          >
            All Actions ({auditLogs.length})
          </button>
          <button 
            className={`filter-chip chip-lt ${filterAction === 'SAVED_LONG_TERM' ? 'active' : ''}`}
            onClick={() => setFilterAction('SAVED_LONG_TERM')}
          >
            Saved Long-Term
          </button>
          <button 
            className={`filter-chip chip-se ${filterAction === 'SAVED_SESSION' ? 'active' : ''}`}
            onClick={() => setFilterAction('SAVED_SESSION')}
          >
            Saved Session
          </button>
          <button 
            className={`filter-chip chip-pe ${filterAction === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilterAction('REJECTED')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Log List */}
      <div className="audit-log-list glass-card">
        {filteredLogs.length === 0 ? (
          <div className="no-logs-state">
            <FileText size={40} className="text-slate-600 mb-2" />
            <p>No audit events recorded matching your criteria.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="audit-log-item">
              <div className="log-icon-col">
                {log.action === 'SAVED_LONG_TERM' && <Lock size={16} className="text-indigo-400" />}
                {log.action === 'SAVED_SESSION' && <Zap size={16} className="text-sky-400" />}
                {log.action === 'REJECTED' && <XCircle size={16} className="text-rose-400" />}
                {log.action === 'EDITED' && <Edit3 size={16} className="text-amber-400" />}
                {log.action === 'DELETED' && <Trash2 size={16} className="text-rose-500" />}
              </div>

              <div className="log-details-col">
                <div className="log-action-line">
                  <span className={`action-badge badge-${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                  <span className="log-memory-text">"{log.memoryText}"</span>
                </div>

                <div className="log-meta-line">
                  <span className="log-timestamp">{log.timestamp}</span>
                  <span className="dot-divider">•</span>
                  <span className="log-user-consent">Consent: Explicit User Selection</span>
                  {log.category && (
                    <>
                      <span className="dot-divider">•</span>
                      <span className="log-cat">Category: {log.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
