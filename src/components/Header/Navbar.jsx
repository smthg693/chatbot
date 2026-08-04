import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  History, 
  Key, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  Lock,
  MoreVertical,
  Sliders,
  X
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  memories, 
  onOpenApiKeyModal, 
  onOpenConsentModal,
  apiKeyConfig,
  onResetSession
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const longTermCount = memories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const sessionCount = memories.filter(m => m.scope === 'session' && m.status === 'active').length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            </div>
          </div>
        </div>
      </div>

      {/* Main Essential Tabs Only */}
      <nav className="header-nav">
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          <span>Chat</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <BrainCircuit size={16} />
          <span>Memory Vault</span>
          <div className="tab-pill-group">
            <span className="pill-lt" title="Long-term Memories"><Lock size={10} /> {longTermCount}</span>
            <span className="pill-se" title="Session Memories"><Zap size={10} /> {sessionCount}</span>
          </div>
        </button>
      </nav>

      {/* Three Dots (...) Overflow Menu for Secondary Actions */}
      <div className="header-right" ref={menuRef}>
        <div className="relative">
          <button 
            className="icon-btn header-btn three-dots-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="More Options"
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div className="overflow-menu-dropdown glass-card animate-scale-up">
              <div className="menu-header">
                <span>Settings & Options</span>
                <button className="menu-close-btn" onClick={() => setIsMenuOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <button 
                className="dropdown-item"
                onClick={() => {
                  setActiveTab('audit');
                  setIsMenuOpen(false);
                }}
              >
                <History size={15} className="text-cyan-400" />
                <span>Consent Audit Log</span>
              </button>

              <button 
                className="dropdown-item"
                onClick={() => {
                  onOpenConsentModal();
                  setIsMenuOpen(false);
                }}
              >
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Privacy & Consent</span>
              </button>

              <button 
                className="dropdown-item"
                onClick={() => {
                  onOpenApiKeyModal();
                  setIsMenuOpen(false);
                }}
              >
                <Key size={15} className={apiKeyConfig?.key ? 'text-amber-400' : 'text-slate-400'} />
                <span>
                  {apiKeyConfig?.provider === 'gemini' && apiKeyConfig.key ? 'API Key (Gemini Active)' : 
                   apiKeyConfig?.provider === 'openai' && apiKeyConfig.key ? 'API Key (OpenAI Active)' : 
                   'API Key Settings'}
                </span>
              </button>

              <div className="menu-divider" />

              <button 
                className="dropdown-item text-rose-400 hover:bg-rose-500/10"
                onClick={() => {
                  onResetSession();
                  setIsMenuOpen(false);
                }}
              >
                <RotateCcw size={15} />
                <span>Reset Current Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
