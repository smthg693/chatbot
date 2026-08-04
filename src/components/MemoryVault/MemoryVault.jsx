import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Plus, 
  Lock, 
  Zap, 
  Trash2, 
  Edit3, 
  Filter, 
  Layers, 
  Network, 
  ShieldAlert, 
  Clock, 
  ArrowRightLeft,
  Check,
  X
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../data/mockScenarios';
import MemoryNodeGraph from './MemoryNodeGraph';

export default function MemoryVault({ 
  memories, 
  onAddMemory, 
  onUpdateMemoryScope, 
  onDeleteMemory,
  onUpdateMemoryText 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'graph'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Memory Form State
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Preference');
  const [newScope, setNewScope] = useState('long-term');

  // Inline editing memory state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const filteredMemories = memories.filter(m => {
    const matchesSearch = (m.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesScope = selectedScope === 'all' ? true :
                         selectedScope === 'long-term' ? m.scope === 'long-term' && m.status === 'active' :
                         selectedScope === 'session' ? m.scope === 'session' && m.status === 'active' :
                         selectedScope === 'pending' ? m.status === 'pending' :
                         selectedScope === 'rejected' ? m.status === 'rejected' : true;

    const matchesCat = selectedCategory === 'all' ? true : m.category === selectedCategory;

    return matchesSearch && matchesScope && matchesCat;
  });

  const handleCreateMemory = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    onAddMemory({
      text: newText.trim(),
      category: newCategory,
      scope: newScope,
      status: 'active',
      confidence: 1.0,
      sensitivity: 'low',
      reason: 'Manually added by user in Memory Vault'
    });

    setNewText('');
    setIsAddModalOpen(false);
  };

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
    <div className="memory-vault-container">
      {/* Header Controls */}
      <div className="vault-header-bar glass-card">
        <div className="vault-title-area">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-cyan-400" size={24} />
            <h2 className="vault-title">AI Memory Vault</h2>
          </div>
          <p className="vault-subtitle">
            View, edit, scope, or purge all knowledge snippets the AI retains about you.
          </p>
        </div>

        <div className="vault-actions">
          {/* View Mode Selector */}
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <Layers size={16} /> Grid
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
              title="Visual Node Graph View"
            >
              <Network size={16} /> Knowledge Graph
            </button>
          </div>

          <button 
            className="btn-primary-action"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add Memory
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="vault-filters-bar glass-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon text-slate-400" />
          <input 
            type="text"
            className="vault-search-input"
            placeholder="Search memory vault by keyword, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <span className="filter-label"><Filter size={12} /> Scope:</span>
          <button 
            className={`filter-chip ${selectedScope === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedScope('all')}
          >
            All ({memories.length})
          </button>
          <button 
            className={`filter-chip chip-lt ${selectedScope === 'long-term' ? 'active' : ''}`}
            onClick={() => setSelectedScope('long-term')}
          >
            <Lock size={12} /> Long-Term ({memories.filter(m => m.scope === 'long-term' && m.status === 'active').length})
          </button>
          <button 
            className={`filter-chip chip-se ${selectedScope === 'session' ? 'active' : ''}`}
            onClick={() => setSelectedScope('session')}
          >
            <Zap size={12} /> Session ({memories.filter(m => m.scope === 'session' && m.status === 'active').length})
          </button>
          <button 
            className={`filter-chip chip-pe ${selectedScope === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedScope('pending')}
          >
            <Clock size={12} /> Pending ({memories.filter(m => m.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Content View: Grid or Graph */}
      {viewMode === 'graph' ? (
        <MemoryNodeGraph 
          memories={filteredMemories}
          onSelectMemory={(mem) => {
            setSearchQuery(mem.text);
            setViewMode('grid');
          }}
        />
      ) : (
        <div className="memory-cards-grid">
          {filteredMemories.length === 0 ? (
            <div className="no-memories-state glass-card">
              <BrainCircuit size={40} className="text-slate-500 mb-2" />
              <h3>No Memories Found</h3>
              <p>Try adjusting your search query or filters.</p>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const catStyle = CATEGORY_COLORS[mem.category] || CATEGORY_COLORS['Preference'];

              return (
                <div key={mem.id} className="vault-memory-card glass-card">
                  <div className="card-top">
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

                    <div className="scope-status-pill">
                      {mem.status === 'pending' ? (
                        <span className="scope-pill-pending"><Clock size={10} /> Pending</span>
                      ) : mem.scope === 'long-term' ? (
                        <span className="scope-pill-lt"><Lock size={10} /> Long-Term</span>
                      ) : (
                        <span className="scope-pill-se"><Zap size={10} /> Session</span>
                      )}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="card-body">
                    {editingId === mem.id ? (
                      <div className="edit-memory-box mt-1 mb-2">
                        <input 
                          type="text"
                          className="edit-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(mem.id)}
                        />
                        <button className="btn-mini btn-save" onClick={() => handleSaveEdit(mem.id)}>
                          <Check size={12} />
                        </button>
                        <button className="btn-mini btn-cancel" onClick={() => setEditingId(null)}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <p className="memory-statement">"{mem.text}"</p>
                    )}

                    <div className="meta-row">
                      <span className="meta-reason">{mem.reason || 'Extracted via conversation'}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="card-footer-actions">
                    <div className="toggle-scope-btns">
                      {mem.scope === 'long-term' ? (
                        <button 
                          className="btn-action-sm btn-demote"
                          onClick={() => onUpdateMemoryScope(mem.id, 'session')}
                          title="Demote memory scope to current session only"
                        >
                          <ArrowRightLeft size={12} /> Make Session-Only
                        </button>
                      ) : (
                        <button 
                          className="btn-action-sm btn-promote"
                          onClick={() => onUpdateMemoryScope(mem.id, 'long-term')}
                          title="Promote memory scope to persistent long-term"
                        >
                          <Lock size={12} /> Make Long-Term
                        </button>
                      )}

                      <button 
                        className="btn-action-sm btn-edit"
                        onClick={() => handleStartEdit(mem)}
                        title="Edit text statement"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>

                    <button 
                      className="btn-action-sm btn-delete text-rose-400 hover:bg-rose-500/20"
                      onClick={() => onDeleteMemory(mem.id)}
                      title="Permanently remove memory from system"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Custom Memory Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card animate-scale-up">
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <BrainCircuit className="text-cyan-400" size={18} />
                Manually Add Negotiated Memory
              </h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="modal-form">
              <div className="form-group">
                <label>Memory Statement / Fact:</label>
                <textarea
                  className="form-input"
                  placeholder="e.g. User prefers Python and FastAPI for backend development"
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Category:</label>
                  <select 
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Preference">Preference</option>
                    <option value="Technical Context">Technical Context</option>
                    <option value="Personal Fact">Personal Fact</option>
                    <option value="Goal/Project">Goal/Project</option>
                    <option value="Constraint/Privacy">Constraint/Privacy</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Initial Scope:</label>
                  <select 
                    className="form-select"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                  >
                    <option value="long-term">🔒 Long-Term (Persistent)</option>
                    <option value="session">⚡ Session-Scoped</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
