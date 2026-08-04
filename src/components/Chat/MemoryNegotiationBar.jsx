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
  Ban,
  Calendar
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
          <Sparkles size={18} className="text-amber-400 animate-pulse" />
          <span className="negotiation-title">Negotiate AI Memory Retention</span>
          <span className="count-badge">{pendingMemories.length} item(s)</span>
        </div>
        <span className="negotiation-hint">
          Choose how long the AI should remember this insight
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
                    <span className="badge-sensitivity-high">
                      <ShieldAlert size={12} /> Privacy Sensitive
                    </span>
                  )}

                  <span className="confidence-pill">
                    {(mem.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <button 
                  className="icon-action-btn hover:text-amber-300"
                  onClick={() => handleStartEdit(mem)}
                  title="Edit text before saving"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              {/* WHAT: Memory Content Text */}
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
                    <button className="btn-mini btn-save" onClick={() => handleSaveEdit(mem.id)}>
                      <Check size={12} /> Save
                    </button>
                    <button className="btn-mini btn-cancel" onClick={() => setEditingId(null)}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="memory-text">"{mem.text}"</p>
                )}

                {/* WHY: Extraction Reason */}
                <div className="extraction-reason">
                  <HelpCircle size={12} className="text-slate-400 inline mr-1" />
                  <span><strong>Why extracted:</strong> {mem.reason}</span>
                </div>
              </div>

              {/* 4 Explicit Retention Choices */}
              <div className="card-negotiation-footer flex-wrap">
                <button 
                  className="btn-negotiate btn-longterm"
                  onClick={() => onConfirmMemory(mem.id, 'long-term')}
                  title="Remember across all future sessions"
                >
                  <Lock size={13} />
                  <span>Remember Forever</span>
                </button>

                <button 
                  className="btn-negotiate btn-session"
                  onClick={() => onConfirmMemory(mem.id, 'session')}
                  title="Keep active for today only"
                >
                  <Calendar size={13} />
                  <span>Remember Today Only</span>
                </button>

                <button 
                  className="btn-negotiate btn-chat-only"
                  onClick={() => onConfirmMemory(mem.id, 'session')}
                  title="Forget immediately after this chat"
                >
                  <Clock size={13} />
                  <span>Forget After Chat</span>
                </button>

                <button 
                  className="btn-negotiate btn-discard"
                  onClick={() => onRejectMemory(mem.id)}
                  title="Never remember this information"
                >
                  <Ban size={13} />
                  <span>Never Remember</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
