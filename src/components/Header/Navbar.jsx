import React from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  History, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  Zap,
  Lock,
  Clock
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  memories, 
  onOpenApiKeyModal, 
  onOpenConsentModal,
  apiKeyConfig,
  onResetSession,
  onLoadScenario
}) {
  const longTermCount = memories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const sessionCount = memories.filter(m => m.scope === 'session' && m.status === 'active').length;
  const pendingCount = memories.filter(m => m.status === 'pending').length;

  return (
    <header className="app-header glass-nav">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-icon-wrapper">
            <BrainCircuit className="logo-icon animate-pulse-glow" />
          </div>
          <div>
            <div className="logo-title-row">
              <h1 className="logo-text">Memori<span className="logo-gradient">Flow</span></h1>
              <span className="badge-beta">PS06 Memory Negotiation</span>
            </div>
            <p className="logo-subtitle">Active AI Memory & Context Negotiation Interface</p>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={18} />
          <span>Chat & Negotiate</span>
          {pendingCount > 0 && (
            <span className="badge-pending-counter">{pendingCount} pending</span>
          )}
        </button>

        <button 
          className={`nav-tab ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <BrainCircuit size={18} />
          <span>Memory Vault & Graph</span>
          <div className="tab-pill-group">
            <span className="pill-lt" title="Long-term Memories"><Lock size={10} /> {longTermCount}</span>
            <span className="pill-se" title="Session Memories"><Zap size={10} /> {sessionCount}</span>
          </div>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={18} />
          <span>Consent Audit Log</span>
        </button>
      </nav>

      <div className="header-right">
        <button 
          className="icon-btn header-btn"
          onClick={onOpenConsentModal}
          title="Privacy & Consent Policy Settings"
        >
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="btn-label">Consent & Privacy</span>
        </button>

        <button 
          className={`icon-btn header-btn ${apiKeyConfig?.key ? 'active-key' : ''}`}
          onClick={onOpenApiKeyModal}
          title="Configure Gemini or OpenAI API Key"
        >
          <Key size={18} className={apiKeyConfig?.key ? 'text-amber-400' : 'text-slate-400'} />
          <span className="btn-label">
            {apiKeyConfig?.provider === 'gemini' && apiKeyConfig.key ? 'Gemini Active' : 
             apiKeyConfig?.provider === 'openai' && apiKeyConfig.key ? 'OpenAI Active' : 
             'API Key'}
          </span>
        </button>

        <button 
          className="icon-btn header-btn text-rose-400 hover:bg-rose-500/20"
          onClick={onResetSession}
          title="Clear Session Scoped Context"
        >
          <RotateCcw size={16} />
          <span className="btn-label">Reset Session</span>
        </button>
      </div>
    </header>
  );
}
