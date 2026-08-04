import React from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, X, Sparkles, AlertTriangle } from 'lucide-react';

export default function ConsentSettingsModal({ 
  isOpen, 
  onClose, 
  consentSettings, 
  onUpdateConsentSettings 
}) {
  if (!isOpen) return null;

  const toggle = (key) => {
    onUpdateConsentSettings({
      ...consentSettings,
      [key]: !consentSettings[key]
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card animate-scale-up">
        <div className="modal-header">
          <h3 className="modal-title flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={20} />
            Privacy & Consent Policy Settings
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="policy-toggle-item">
            <div className="toggle-info">
              <div className="font-semibold text-slate-200">Strict In-Stream Consent Mode</div>
              <div className="text-xs text-slate-400">
                Always require explicit user click on [Long-Term] or [Session] before any memory is used in AI context.
              </div>
            </div>
            <button className="toggle-switch-btn" onClick={() => toggle('strictConsent')}>
              {consentSettings.strictConsent ? (
                <ToggleRight className="text-emerald-400" size={32} />
              ) : (
                <ToggleLeft className="text-slate-600" size={32} />
              )}
            </button>
          </div>

          <div className="policy-toggle-item">
            <div className="toggle-info">
              <div className="font-semibold text-slate-200">Auto-Flag Sensitive PII</div>
              <div className="text-xs text-slate-400">
                Automatically detect credit cards, passwords, or health records and alert high privacy risk.
              </div>
            </div>
            <button className="toggle-switch-btn" onClick={() => toggle('autoFlagPii')}>
              {consentSettings.autoFlagPii ? (
                <ToggleRight className="text-emerald-400" size={32} />
              ) : (
                <ToggleLeft className="text-slate-600" size={32} />
              )}
            </button>
          </div>

          <div className="policy-toggle-item">
            <div className="toggle-info">
              <div className="font-semibold text-slate-200">Show Memory Citations</div>
              <div className="text-xs text-slate-400">
                Display explicit pills under AI responses showing which active memory items shaped the response.
              </div>
            </div>
            <button className="toggle-switch-btn" onClick={() => toggle('showCitations')}>
              {consentSettings.showCitations ? (
                <ToggleRight className="text-emerald-400" size={32} />
              ) : (
                <ToggleLeft className="text-slate-600" size={32} />
              )}
            </button>
          </div>

          <div className="policy-toggle-item">
            <div className="toggle-info">
              <div className="font-semibold text-slate-200">Auto-Clear Session Scope on Reset</div>
              <div className="text-xs text-slate-400">
                Automatically purge session-scoped memories whenever a new conversation session is initiated.
              </div>
            </div>
            <button className="toggle-switch-btn" onClick={() => toggle('autoClearSession')}>
              {consentSettings.autoClearSession ? (
                <ToggleRight className="text-emerald-400" size={32} />
              ) : (
                <ToggleLeft className="text-slate-600" size={32} />
              )}
            </button>
          </div>
        </div>

        <div className="modal-footer mt-4">
          <button type="button" className="btn-primary-action" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
