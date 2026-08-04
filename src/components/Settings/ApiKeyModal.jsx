import React, { useState } from 'react';
import { Key, ShieldCheck, Cpu, Check, X, Sparkles, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKeyConfig, onSaveApiKeyConfig }) {
  const [provider, setProvider] = useState(apiKeyConfig?.provider || 'mock');
  const [key, setKey] = useState(apiKeyConfig?.key || '');
  const [model, setModel] = useState(apiKeyConfig?.model || 'gemini-1.5-flash');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKeyConfig({ provider, key, model });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card animate-scale-up">
        <div className="modal-header">
          <h3 className="modal-title flex items-center gap-2">
            <Key className="text-amber-400" size={20} />
            Configure AI Engine & API Key
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>AI Provider Selection:</label>
            <div className="provider-options">
              <label className={`provider-card ${provider === 'mock' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="mock" 
                  checked={provider === 'mock'}
                  onChange={() => setProvider('mock')}
                />
                <div className="provider-info">
                  <div className="font-semibold text-sky-400">⚡ Built-in Smart Simulator (Offline)</div>
                  <div className="text-xs text-slate-400">Works 100% locally out-of-the-box without any API keys.</div>
                </div>
              </label>

              <label className={`provider-card ${provider === 'gemini' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="gemini" 
                  checked={provider === 'gemini'}
                  onChange={() => {
                    setProvider('gemini');
                    setModel('gemini-1.5-flash');
                  }}
                />
                <div className="provider-info">
                  <div className="font-semibold text-emerald-400">✨ Google Gemini API</div>
                  <div className="text-xs text-slate-400">Use your Google AI Studio API Key.</div>
                </div>
              </label>

              <label className={`provider-card ${provider === 'openai' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="openai" 
                  checked={provider === 'openai'}
                  onChange={() => {
                    setProvider('openai');
                    setModel('gpt-4o-mini');
                  }}
                />
                <div className="provider-info">
                  <div className="font-semibold text-indigo-400">🤖 OpenAI API</div>
                  <div className="text-xs text-slate-400">Use your OpenAI API Key.</div>
                </div>
              </label>
            </div>
          </div>

          {provider !== 'mock' && (
            <>
              <div className="form-group">
                <label className="flex items-center justify-between">
                  <span>API Key:</span>
                  <a 
                    href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Get Key <ExternalLink size={10} />
                  </a>
                </label>
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
                <label>Model Version:</label>
                <select 
                  className="form-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {provider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                      <option value="gpt-4o">GPT-4o (Standard)</option>
                    </>
                  )}
                </select>
              </div>
            </>
          )}

          <div className="security-notice">
            <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              API Keys are stored exclusively in memory/localStorage in your local browser and are never sent to external servers other than directly to official Google / OpenAI API endpoints.
            </p>
          </div>

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
