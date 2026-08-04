import React from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  History, 
  RotateCcw, 
  BrainCircuit, 
  Lock, 
  Zap, 
  Sliders, 
  Cpu, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function SidebarDrawer({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  memories, 
  onOpenApiKeyModal, 
  onOpenConsentModal, 
  apiKeyConfig, 
  onResetSession 
}) {
  if (!isOpen) return null;

  const longTermCount = memories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const sessionCount = memories.filter(m => m.scope === 'session' && m.status === 'active').length;

  return (
    <div className="drawer-backdrop animate-fade-in" onClick={onClose}>
      <aside 
        className="sidebar-drawer-panel glass-card animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <div className="drawer-icon-box">
              <Sliders size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="drawer-title">System Settings</h3>
              <p className="drawer-subtitle">Memory & Provider Control Center</p>
            </div>
          </div>

          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-content space-y-5">
          {/* Section 1: Active Memory Overview */}
          <div className="drawer-section">
            <div className="section-label">Active Memory Metrics</div>
            <div className="metrics-grid">
              <div className="metric-card lt-card">
                <div className="flex items-center justify-between">
                  <span className="metric-title">Long-Term</span>
                  <Lock size={14} className="text-emerald-400" />
                </div>
                <div className="metric-value">{longTermCount}</div>
                <div className="metric-desc">Persisted snippets</div>
              </div>

              <div className="metric-card se-card">
                <div className="flex items-center justify-between">
                  <span className="metric-title">Session</span>
                  <Zap size={14} className="text-sky-400" />
                </div>
                <div className="metric-value">{sessionCount}</div>
                <div className="metric-desc">Scoped to chat</div>
              </div>
            </div>
          </div>

          {/* Section 2: AI Provider & API Settings */}
          <div className="drawer-section">
            <div className="section-label">AI Engine & Model</div>
            <button 
              className="drawer-action-btn"
              onClick={() => {
                onOpenApiKeyModal();
                onClose();
              }}
            >
              <div className="action-btn-left">
                <div className="btn-icon-bg bg-amber-500/15">
                  <Key size={16} className="text-amber-400" />
                </div>
                <div className="text-left">
                  <div className="action-title">API Key & Model Selection</div>
                  <div className="action-subtitle">
                    {apiKeyConfig?.provider === 'gemini' && apiKeyConfig.key ? 'Google Gemini (Active)' : 
                     apiKeyConfig?.provider === 'openai' && apiKeyConfig.key ? 'OpenAI (Active)' : 
                     'Offline Simulator Engine Active'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Section 3: Privacy & Consent Policies */}
          <div className="drawer-section">
            <div className="section-label">Privacy & Transparency</div>

            <button 
              className="drawer-action-btn"
              onClick={() => {
                onOpenConsentModal();
                onClose();
              }}
            >
              <div className="action-btn-left">
                <div className="btn-icon-bg bg-emerald-500/15">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="action-title">Privacy & Consent Rules</div>
                  <div className="action-subtitle">Strict consent, PII alerts, citations</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </button>

            <button 
              className="drawer-action-btn"
              onClick={() => {
                setActiveTab('audit');
                onClose();
              }}
            >
              <div className="action-btn-left">
                <div className="btn-icon-bg bg-sky-500/15">
                  <History size={16} className="text-sky-400" />
                </div>
                <div className="text-left">
                  <div className="action-title">Consent Audit Log</div>
                  <div className="action-subtitle">Timestamped memory decision trail</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Section 4: Session Scope Reset */}
          <div className="drawer-section">
            <div className="section-label">Session Management</div>
            <button 
              className="drawer-action-btn btn-danger"
              onClick={() => {
                onResetSession();
                onClose();
              }}
            >
              <div className="action-btn-left">
                <div className="btn-icon-bg bg-rose-500/15">
                  <RotateCcw size={16} className="text-rose-400" />
                </div>
                <div className="text-left">
                  <div className="action-title text-rose-400">Reset Active Session</div>
                  <div className="action-subtitle text-slate-400">Clear temporary session memories</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <BrainCircuit size={14} className="text-emerald-400 inline mr-1" />
          <span>MemoriFlow PS06 Architecture</span>
        </div>
      </aside>
    </div>
  );
}
