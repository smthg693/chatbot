import React, { useState } from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  Sliders, 
  Lock, 
  Zap,
  LogOut,
  User
} from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  memories, 
  onOpenApiKeyModal, 
  onOpenConsentModal,
  apiKeyConfig,
  onResetSession,
  currentUser,
  onLogout
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const longTermCount = memories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const sessionCount = memories.filter(m => m.scope === 'session' && m.status === 'active').length;

  const initials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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

      {/* Main Navigation Tabs */}
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

      {/* User Profile Badge & Settings Trigger */}
      <div className="header-right">
        {currentUser && (
          <div className="user-profile-badge" title={`Logged in as ${currentUser.email}`}>
            <div 
              className="user-avatar-circle"
              style={{ backgroundColor: currentUser.avatarColor || '#10A37F' }}
            >
              {initials}
            </div>
            <span className="user-name-text">{currentUser.name.split(' ')[0]}</span>
            
            <button 
              className="logout-icon-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

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
        currentUser={currentUser}
        onLogout={onLogout}
      />
    </header>
  );
}
