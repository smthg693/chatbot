import React, { useState } from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  Sliders, 
  Lock, 
  Zap
} from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  memories, 
  onOpenApiKeyModal, 
  onOpenConsentModal,
  apiKeyConfig,
  onResetSession
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const longTermCount = memories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const sessionCount = memories.filter(m => m.scope === 'session' && m.status === 'active').length;

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

      {/* Main Essential Navigation Tabs */}
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

      {/* Neat Settings Drawer Toggle Button */}
      <div className="header-right">
        <button 
          className={`sidebar-toggle-btn ${isDrawerOpen ? 'active' : ''}`}
          onClick={() => setIsDrawerOpen(true)}
          title="Open Settings Drawer"
        >
          <Sliders size={17} className="text-emerald-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Slide-out Sidebar Settings Panel */}
      <SidebarDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memories={memories}
        onOpenApiKeyModal={onOpenApiKeyModal}
        onOpenConsentModal={onOpenConsentModal}
        apiKeyConfig={apiKeyConfig}
        onResetSession={onResetSession}
      />
    </header>
  );
}
