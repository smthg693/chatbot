import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BrainCircuit, 
  Lock, 
  Zap, 
  ShieldCheck, 
  PlayCircle, 
  RefreshCw, 
  Info,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import MemoryNegotiationBar from './MemoryNegotiationBar';
import { PRESET_SCENARIOS } from '../../data/mockScenarios';

export default function ChatWindow({ 
  messages, 
  onSendMessage, 
  isThinking, 
  pendingMemories, 
  activeMemories, 
  onConfirmMemory, 
  onRejectMemory, 
  onUpdateMemoryText,
  onLoadScenario,
  apiKeyConfig,
  consentSettings,
  onUpdateConsentSettings,
  autoStoreNotification
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, pendingMemories, autoStoreNotification]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isThinking) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleQuickInsert = (snippet) => {
    setInputText(snippet);
  };

  const toggleAutoStore = () => {
    onUpdateConsentSettings({
      ...consentSettings,
      strictConsent: !consentSettings.strictConsent
    });
  };

  const activeLongTermCount = activeMemories.filter(m => m.scope === 'long-term' && m.status === 'active').length;
  const activeSessionCount = activeMemories.filter(m => m.scope === 'session' && m.status === 'active').length;

  return (
    <div className="chat-window-container">
      {/* Top Context & Preset Scenarios Header Bar */}
      <div className="chat-header-bar glass-card">
        <div className="scenario-pills">
          <span className="scenario-label">Quick Scenarios:</span>
          {PRESET_SCENARIOS.map(sc => (
            <button 
              key={sc.id}
              className="scenario-btn"
              onClick={() => onLoadScenario(sc)}
              title={sc.subtitle}
            >
              <PlayCircle size={13} className="text-amber-400" />
              <span>{sc.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-Judge & Store Mode Pill */}
          <button 
            className={`auto-store-toggle-btn ${!consentSettings.strictConsent ? 'auto-on' : 'auto-off'}`}
            onClick={toggleAutoStore}
            title={!consentSettings.strictConsent ? "Auto-Judge Mode ON: AI automatically classifies & stores memories" : "Manual Mode: Require manual click for every memory proposal"}
          >
            {!consentSettings.strictConsent ? (
              <>
                <Zap size={13} className="text-emerald-400 animate-pulse" />
                <span>Auto-Store: ON</span>
              </>
            ) : (
              <>
                <SlidersHorizontal size={13} className="text-amber-400" />
                <span>Manual Review</span>
              </>
            )}
          </button>

          <div className="active-scope-badge" title="Active memory items currently shaping AI responses">
            <BrainCircuit size={14} className="text-cyan-400" />
            <span className="scope-pill-lt"><Lock size={10} /> {activeLongTermCount} Long-Term</span>
            <span className="scope-pill-se"><Zap size={10} /> {activeSessionCount} Session</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="hero-icon-container">
              <BrainCircuit className="hero-brain-icon animate-pulse-glow" />
            </div>
            <h2>Autonomous & Negotiable AI Memory</h2>
            <p className="hero-description">
              Type anything to start chatting. Memories are <strong>automatically evaluated, judged, and stored into active context</strong>, or you can switch to Manual Review mode anytime.
            </p>

            <div className="quick-prompt-chips">
              <button 
                className="chip-prompt"
                onClick={() => handleQuickInsert("I strictly prefer TypeScript and Tailwind CSS for my web projects.")}
              >
                <Sparkles size={12} className="text-indigo-400" />
                "I strictly prefer TypeScript and Tailwind CSS..."
              </button>
              <button 
                className="chip-prompt"
                onClick={() => handleQuickInsert("For this session only, help me debug an Express CORS issue.")}
              >
                <Zap size={12} className="text-cyan-400" />
                "For this session only, help me debug..."
              </button>
              <button 
                className="chip-prompt"
                onClick={() => handleQuickInsert("Do NOT remember my financial details across conversations.")}
              >
                <ShieldCheck size={12} className="text-rose-400" />
                "Do NOT remember my financial details..."
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}
            >
              <div className="avatar-wrapper">
                {msg.sender === 'user' ? (
                  <div className="avatar user-avatar"><User size={16} /></div>
                ) : (
                  <div className="avatar ai-avatar"><Bot size={16} /></div>
                )}
              </div>

              <div className="message-content-wrapper">
                <div className="message-header-info">
                  <span className="sender-name">
                    {msg.sender === 'user' ? 'You' : 'MemoriAI'}
                  </span>
                  <span className="timestamp">{msg.timestamp}</span>
                  {msg.provider && (
                    <span className="provider-tag">{msg.provider}</span>
                  )}
                </div>

                <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                  <div className="markdown-content whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Render citations if AI used active memories */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="memory-citations">
                      <div className="citation-title">
                        <BrainCircuit size={12} className="text-cyan-400" />
                        <span>Active Memory Context Applied:</span>
                      </div>
                      <div className="citation-pills">
                        {msg.citations.map((cit, idx) => (
                          <span key={idx} className="citation-pill">{cit}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isThinking && (
          <div className="message-row ai-row">
            <div className="avatar ai-avatar"><Bot size={16} /></div>
            <div className="message-content-wrapper">
              <div className="thinking-bubble glass-card">
                <RefreshCw size={14} className="animate-spin text-cyan-400" />
                <span>Evaluating task context & formulating response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Auto-Store Toast Notification */}
      {autoStoreNotification && (
        <div className="auto-store-banner glass-card animate-slide-down">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{autoStoreNotification}</span>
        </div>
      )}

      {/* Floating In-Stream Negotiation Bar (Used in Manual Review Mode) */}
      <MemoryNegotiationBar 
        pendingMemories={pendingMemories}
        onConfirmMemory={onConfirmMemory}
        onRejectMemory={onRejectMemory}
        onUpdateMemoryText={onUpdateMemoryText}
      />

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="chat-input-form glass-card">
        <div className="input-row">
          <textarea
            className="chat-textarea"
            placeholder="Type your message... (e.g. 'I prefer dark mode, but for this task I am writing Python')"
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          <button 
            type="submit" 
            className="send-btn"
            disabled={!inputText.trim() || isThinking}
          >
            <Send size={18} />
          </button>
        </div>

        <div className="input-footer-hint">
          <div className="hint-item">
            <Sparkles size={11} className="text-amber-400 inline" />
            <span>
              {!consentSettings.strictConsent ? 
                'Auto-Store Mode ON: Memories are automatically judged & stored. You can manage them in Memory Vault anytime.' : 
                'Manual Review Mode: Extracted candidates are queued above for your explicit confirmation.'}
            </span>
          </div>
          <div className="hint-item">
            <kbd>Shift + Enter</kbd> for new line
          </div>
        </div>
      </form>
    </div>
  );
}
