import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Header/Navbar';
import ChatWindow from './components/Chat/ChatWindow';
import MemoryVault from './components/MemoryVault/MemoryVault';
import AuditLogView from './components/AuditLog/AuditLogView';
import ApiKeyModal from './components/Settings/ApiKeyModal';
import ConsentSettingsModal from './components/Settings/ConsentSettingsModal';

import { extractMemoriesFromText } from './services/memoryExtractor';
import { generateAIResponse } from './services/aiEngine';

const INITIAL_MEMORIES = [
  {
    id: 'mem_init_1',
    text: 'User prefers Dark Mode and high-contrast glassmorphic design interfaces.',
    category: 'Preference',
    scope: 'long-term',
    status: 'active',
    confidence: 0.98,
    sensitivity: 'low',
    reason: 'Default user preference',
    createdAt: new Date().toLocaleTimeString()
  },
  {
    id: 'mem_init_2',
    text: 'Primary programming language stack: TypeScript & React.',
    category: 'Technical Context',
    scope: 'long-term',
    status: 'active',
    confidence: 0.95,
    sensitivity: 'low',
    reason: 'Core developer profile',
    createdAt: new Date().toLocaleTimeString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'vault' | 'audit'
  
  // Memories State with LocalStorage Persistence
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('memoriflow_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  // Messages Transcript
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // Audit Logs with Persistence
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('memoriflow_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log_init_1',
        action: 'AUTO_SAVED_LONG_TERM',
        memoryText: 'User prefers Dark Mode and high-contrast glassmorphic design interfaces.',
        category: 'Preference',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  // Settings
  const [apiKeyConfig, setApiKeyConfig] = useState(() => {
    const saved = localStorage.getItem('memoriflow_apikey_config');
    return saved ? JSON.parse(saved) : { provider: 'mock', key: '', model: '' };
  });

  // Default strictConsent to FALSE so memories are auto-judged and stored automatically!
  const [consentSettings, setConsentSettings] = useState({
    strictConsent: false, // Auto-Approve & Auto-Scope Mode is ON by default!
    autoFlagPii: true,
    showCitations: true,
    autoClearSession: true
  });

  // Modal States
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Toast notification state for auto-stored memories
  const [autoStoreNotification, setAutoStoreNotification] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('memoriflow_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('memoriflow_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('memoriflow_apikey_config', JSON.stringify(apiKeyConfig));
  }, [apiKeyConfig]);

  // Derived pending memories
  const pendingMemories = memories.filter(m => m.status === 'pending');

  // Trigger celebration micro-interaction
  const triggerConfetti = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#38bdf8', '#4ade80']
    });
  };

  // Helper to add audit event
  const logAuditEvent = (action, memoryText, category = '') => {
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      action,
      memoryText,
      category,
      timestamp: new Date().toLocaleTimeString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handle User Input & Memory Extraction
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setAutoStoreNotification(null);

    // 1. Extract memory candidates live from text
    const extractedCandidates = extractMemoriesFromText(text, memories);

    let updatedMemories = [...memories];

    if (extractedCandidates.length > 0) {
      if (!consentSettings.strictConsent) {
        // AUTO-JUDGE MODE: Automatically classify scope and store as active immediately!
        let autoLtCount = 0;
        let autoSeCount = 0;

        const autoProcessed = extractedCandidates.map(cand => {
          const autoScope = cand.suggestedScope || 'long-term';
          if (autoScope === 'long-term') autoLtCount++;
          else autoSeCount++;

          logAuditEvent(
            autoScope === 'long-term' ? 'AUTO_SAVED_LONG_TERM' : 'AUTO_SAVED_SESSION',
            cand.text,
            cand.category
          );

          return {
            ...cand,
            status: 'active',
            scope: autoScope,
            reason: `Auto-judged & classified as ${autoScope === 'long-term' ? 'Long-Term' : 'Session-Scoped'}`
          };
        });

        updatedMemories = [...memories, ...autoProcessed];
        setMemories(updatedMemories);
        triggerConfetti();

        setAutoStoreNotification(`✨ Auto-Judged & Stored: ${autoLtCount} Long-Term, ${autoSeCount} Session Memory item(s)`);
      } else {
        // STRICT MANUAL NEGOTIATION MODE: Queue as pending for user clicks
        updatedMemories = [...memories, ...extractedCandidates];
        setMemories(updatedMemories);
      }
    }

    // 2. Query AI Engine with updated active memories
    try {
      const aiResult = await generateAIResponse({
        messages: [...messages, userMsg],
        activeMemories: updatedMemories,
        apiKeyConfig: apiKeyConfig
      });

      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: aiResult.text,
        provider: aiResult.provider,
        citations: consentSettings.showCitations ? aiResult.citations : [],
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setIsThinking(false);
    }
  };

  // Negotiation Actions
  const handleConfirmMemory = (id, targetScope) => {
    const targetMem = memories.find(m => m.id === id);
    if (!targetMem) return;

    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'active', scope: targetScope };
      }
      return m;
    }));

    const actionName = targetScope === 'long-term' ? 'SAVED_LONG_TERM' : 'SAVED_SESSION';
    logAuditEvent(actionName, targetMem.text, targetMem.category);
    triggerConfetti();
  };

  const handleRejectMemory = (id) => {
    const targetMem = memories.find(m => m.id === id);
    if (!targetMem) return;

    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'rejected', scope: 'discarded' };
      }
      return m;
    }));

    logAuditEvent('REJECTED', targetMem.text, targetMem.category);
  };

  const handleUpdateMemoryText = (id, newText) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, text: newText };
      }
      return m;
    }));

    logAuditEvent('EDITED', newText);
  };

  const handleAddCustomMemory = (memData) => {
    const newMem = {
      id: 'mem_custom_' + Date.now(),
      ...memData,
      createdAt: new Date().toLocaleTimeString()
    };

    setMemories(prev => [...prev, newMem]);
    logAuditEvent(memData.scope === 'long-term' ? 'SAVED_LONG_TERM' : 'SAVED_SESSION', memData.text, memData.category);
    triggerConfetti();
  };

  const handleUpdateMemoryScope = (id, newScope) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, scope: newScope };
      }
      return m;
    }));

    const actionName = newScope === 'long-term' ? 'PROMOTED_LONG_TERM' : 'DEMOTED_SESSION';
    const target = memories.find(m => m.id === id);
    logAuditEvent(actionName, target?.text || '');
  };

  const handleDeleteMemory = (id) => {
    const target = memories.find(m => m.id === id);
    setMemories(prev => prev.filter(m => m.id !== id));
    logAuditEvent('DELETED', target?.text || '');
  };

  const handleResetSession = () => {
    if (consentSettings.autoClearSession) {
      setMemories(prev => prev.filter(m => m.scope !== 'session'));
    }
    setMessages([]);
    logAuditEvent('SESSION_RESET', 'Cleared session-scoped conversation state');
  };

  const handleLoadScenario = (scenario) => {
    setMessages([]);
    handleSendMessage(scenario.initialMessage);
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memories={memories}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenConsentModal={() => setIsConsentModalOpen(true)}
        apiKeyConfig={apiKeyConfig}
        onResetSession={handleResetSession}
        onLoadScenario={handleLoadScenario}
      />

      <main className="app-main-content">
        {activeTab === 'chat' && (
          <ChatWindow 
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            pendingMemories={pendingMemories}
            activeMemories={memories}
            onConfirmMemory={handleConfirmMemory}
            onRejectMemory={handleRejectMemory}
            onUpdateMemoryText={handleUpdateMemoryText}
            onLoadScenario={handleLoadScenario}
            apiKeyConfig={apiKeyConfig}
            consentSettings={consentSettings}
            onUpdateConsentSettings={setConsentSettings}
            autoStoreNotification={autoStoreNotification}
          />
        )}

        {activeTab === 'vault' && (
          <MemoryVault 
            memories={memories}
            onAddMemory={handleAddCustomMemory}
            onUpdateMemoryScope={handleUpdateMemoryScope}
            onDeleteMemory={handleDeleteMemory}
            onUpdateMemoryText={handleUpdateMemoryText}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView 
            auditLogs={auditLogs}
            onClearAuditLogs={() => setAuditLogs([])}
          />
        )}
      </main>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKeyConfig={apiKeyConfig}
        onSaveApiKeyConfig={(config) => setApiKeyConfig(config)}
      />

      <ConsentSettingsModal 
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        consentSettings={consentSettings}
        onUpdateConsentSettings={setConsentSettings}
      />
    </div>
  );
}
