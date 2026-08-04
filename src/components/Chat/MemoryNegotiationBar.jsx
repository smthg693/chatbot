import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Zap, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldAlert, 
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../data/mockScenarios';

export default function MemoryNegotiationBar({ 
  pendingMemories, 
  onConfirmMemory, 
  onRejectMemory, 
  onUpdateMemoryText 
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!pendingMemories || pendingMemories.length === 0) return null;

  const handleStartEdit = (mem) => {
    setEditingId(mem.id);
    setEditText(mem.text);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      onUpdateMemoryText(id, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="negotiation-banner animate-slide-down">
      <div className="negotiation-header">
        <div className="flex items-center gap-2">
          <div className="sparkle-pulse">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <span className="negotiation-title">AI Memory Negotiation Proposed</span>
          <span className="count-badge">{pendingMemories.length} item(s) to negotiate</span>
        </div>
        <span className="negotiation-hint">
          Decide how the AI should retain these extracted insights
        </span>
      </div>

      <div className="negotiation-cards-container">
        {pendingMemories.map((mem) => {
          const catStyle = CATEGORY_COLORS[mem.category] || CATEGORY_COLORS['Preference'];

          return (
            <div key={mem.id} className="negotiation-card glass-card">
              <div className="card-top">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="cat-badge"
                    style={{ 
                      backgroundColor: catStyle.bg, 
                      color: catStyle.text, 
                      borderColor: catStyle.border 
                    }}
                  >
                    {mem.category}
                  </span>

                  {mem.sensitivity === 'high' && (
                    <span className="badge-sensitivity-high" title="Contains potential PII or confidential information">
                      <ShieldAlert size={12} /> High Privacy Risk
                    </span>
                  )}
                  {mem.sensitivity === 'medium' && (
                    <span className="badge-sensitivity-med">
                      <AlertTriangle size={12} /> Sensitive
                    </span>
                  )}

                  <span className="confidence-pill" title="AI Extraction Confidence Score">
                    {(mem.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <div className="card-actions-quick">
                  <button 
                    className="icon-action-btn hover:text-amber-300"
                    onClick={() => handleStartEdit(mem)}
                    title="Edit extracted memory before saving"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>

              {/* Memory Content Text */}
              <div className="card-body">
                {editingId === mem.id ? (
                  <div className="edit-memory-box">
                    <input 
                      type="text"
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(mem.id)}
                    />
                    <button 
                      className="btn-mini btn-save"
                      onClick={() => handleSaveEdit(mem.id)}
                    >
                      <Check size={12} /> Save
                    </button>
                    <button 
                      className="btn-mini btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="memory-text">"{mem.text}"</p>
                )}

                <div className="extraction-reason">
                  <HelpCircle size={12} className="text-slate-400 inline mr-1" />
                  <span>Reason: {mem.reason}</span>
                </div>
              </div>

              {/* Decision Choice Buttons */}
              <div className="card-negotiation-footer">
                <button 
                  className="btn-negotiate btn-longterm"
                  onClick={() => onConfirmMemory(mem.id, 'long-term')}
                  title="Remember across ALL future conversations"
                >
                  <Lock size={14} />
                  <span>Store Long-Term</span>
                </button>

                <button 
                  className="btn-negotiate btn-session"
                  onClick={() => onConfirmMemory(mem.id, 'session')}
                  title="Remember ONLY for this active session"
                >
                  <Zap size={14} />
                  <span>Session Only</span>
                </button>

                <button 
                  className="btn-negotiate btn-discard"
                  onClick={() => onRejectMemory(mem.id)}
                  title="Do NOT store this memory anywhere"
                >
                  <Trash2 size={14} />
                  <span>Discard / Forget</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
