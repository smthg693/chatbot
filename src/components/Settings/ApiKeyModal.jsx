import React, { useState } from 'react';
import { Key, ShieldCheck, Check, X, Sparkles, ExternalLink, Bot, Cpu } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKeyConfig, onSaveApiKeyConfig }) {
  const [provider, setProvider] = useState(apiKeyConfig?.provider || 'mock');
  const [key, setKey] = useState(apiKeyConfig?.key || '');
  const [model, setModel] = useState(apiKeyConfig?.model || 'gemini-3.6-flash');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const finalModel = isCustomModel && customModelName.trim() ? customModelName.trim() : model;
    onSaveApiKeyConfig({ provider, key, model: finalModel });
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="modal-icon-badge">
              <Key className="text-amber-400" size={20} />
            </div>
            <div>
              <h3 className="modal-title">AI Engine Settings</h3>
              <p className="modal-subtitle">Configure Provider & API Key</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label">AI Provider Selection:</label>
            <div className="provider-options">
              {/* Option 1: Mock Simulator */}
              <label 
                className={`provider-card ${provider === 'mock' ? 'selected' : ''}`}
                onClick={() => setProvider('mock')}
              >
                <div className="provider-radio">
                  <div className={`radio-dot ${provider === 'mock' ? 'checked' : ''}`} />
                </div>
                <div className="provider-info">
                  <div className="provider-name flex items-center gap-2 text-emerald-400 font-semibold">
                    <Sparkles size={15} /> Built-in Smart Simulator (Offline)
                  </div>
                  <div className="provider-desc">
                    Works 100% locally out-of-the-box without requiring any API keys.
                  </div>
                </div>
              </label>

              {/* Option 2: Google Gemini API */}
              <label 
                className={`provider-card ${provider === 'gemini' ? 'selected' : ''}`}
                onClick={() => {
                  setProvider('gemini');
                  setModel('gemini-3.6-flash');
                }}
              >
                <div className="provider-radio">
                  <div className={`radio-dot ${provider === 'gemini' ? 'checked' : ''}`} />
                </div>
                <div className="provider-info">
                  <div className="provider-name flex items-center gap-2 text-cyan-400 font-semibold">
                    <Cpu size={15} /> Google Gemini API
                  </div>
                  <div className="provider-desc">
                    Use your Google AI Studio API Key (supports Gemini 3.6 Flash).
                  </div>
                </div>
              </label>

              {/* Option 3: OpenAI API */}
              <label 
                className={`provider-card ${provider === 'openai' ? 'selected' : ''}`}
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4o-mini');
                }}
              >
                <div className="provider-radio">
                  <div className={`radio-dot ${provider === 'openai' ? 'checked' : ''}`} />
                </div>
                <div className="provider-info">
                  <div className="provider-name flex items-center gap-2 text-purple-400 font-semibold">
                    <Bot size={15} /> OpenAI API
                  </div>
                  <div className="provider-desc">
                    Use your official OpenAI API Key (GPT-4o / GPT-4o Mini).
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional API Key Input */}
          {provider !== 'mock' && (
            <div className="api-key-fields space-y-4">
              <div className="form-group">
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">API Key:</label>
                  <a 
                    href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Get Key <ExternalLink size={11} />
                  </a>
                </div>
                <input 
                  type="password"
                  className="form-input font-mono"
                  placeholder={provider === 'gemini' ? "AIzaSy..." : "sk-..."}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model Version:</label>
                {!isCustomModel ? (
                  <select 
                    className="form-select"
                    value={model}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomModel(true);
                      } else {
                        setModel(e.target.value);
                      }
                    }}
                  >
                    {provider === 'gemini' ? (
                      <>
                        <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="custom">✏️ Enter Custom Model Identifier...</option>
                      </>
                    ) : (
                      <>
                        <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                        <option value="gpt-4o">GPT-4o (Standard)</option>
                        <option value="custom">✏️ Enter Custom Model Identifier...</option>
                      </>
                    )}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="form-input font-mono flex-1"
                      placeholder="e.g. gemini-3.6-flash"
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-secondary text-xs px-3"
                      onClick={() => setIsCustomModel(false)}
                    >
                      Presets
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Security Box */}
          <div className="security-notice flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              API Keys are stored exclusively in local memory/browser storage and are never sent to external servers other than directly to official Google / OpenAI API endpoints.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
