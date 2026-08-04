import React, { useMemo } from 'react';
import { Lock, Zap, Clock, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { CATEGORY_COLORS } from '../../data/mockScenarios';

export default function MemoryNodeGraph({ memories, onSelectMemory }) {
  const activeMemories = memories.filter(m => m.status === 'active' || m.status === 'pending');

  const nodes = useMemo(() => {
    const categories = ['Preference', 'Technical Context', 'Personal Fact', 'Goal/Project', 'Constraint/Privacy'];
    
    // Position center hub
    const centerNode = { id: 'hub', label: 'User Memory Core', type: 'hub', x: 400, y: 250 };
    
    // Position category hubs around center
    const categoryNodes = categories.map((cat, idx) => {
      const angle = (idx / categories.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 160;
      return {
        id: `cat_${cat}`,
        label: cat,
        type: 'category',
        x: centerNode.x + Math.cos(angle) * radius,
        y: centerNode.y + Math.sin(angle) * radius,
        color: CATEGORY_COLORS[cat]?.text || '#38bdf8'
      };
    });

    // Position memory leaf nodes around their category
    const leafNodes = activeMemories.map((mem, idx) => {
      const catNode = categoryNodes.find(c => c.label === mem.category) || categoryNodes[0];
      const itemsInCat = activeMemories.filter(m => m.category === mem.category);
      const itemIdx = itemsInCat.findIndex(m => m.id === mem.id);
      
      const angleOffset = ((itemIdx - (itemsInCat.length - 1) / 2) * 0.5) || 0;
      const leafRadius = 90;
      const baseAngle = Math.atan2(catNode.y - centerNode.y, catNode.x - centerNode.x);
      const finalAngle = baseAngle + angleOffset;

      return {
        id: mem.id,
        label: mem.text,
        type: 'leaf',
        scope: mem.scope,
        status: mem.status,
        category: mem.category,
        x: catNode.x + Math.cos(finalAngle) * leafRadius,
        y: catNode.y + Math.sin(finalAngle) * leafRadius,
        catId: catNode.id,
        rawMem: mem
      };
    });

    return { centerNode, categoryNodes, leafNodes };
  }, [activeMemories]);

  if (activeMemories.length === 0) {
    return (
      <div className="graph-empty-container">
        <BrainCircuit size={48} className="text-slate-600 animate-pulse" />
        <p>No active memory nodes yet. Chat with MemoriAI or add a memory to populate the knowledge graph!</p>
      </div>
    );
  }

  return (
    <div className="memory-graph-canvas glass-card">
      <div className="graph-legend">
        <div className="legend-item"><span className="dot dot-lt"></span> 🔒 Long-Term Memory</div>
        <div className="legend-item"><span className="dot dot-se"></span> ⚡ Session-Scoped Memory</div>
        <div className="legend-item"><span className="dot dot-pe"></span> ⏳ Pending Negotiation</div>
      </div>

      <svg className="graph-svg" viewBox="0 0 800 500">
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Lines from Center to Categories */}
        {nodes.categoryNodes.map(cNode => (
          <line
            key={`line_${cNode.id}`}
            x1={nodes.centerNode.x}
            y1={nodes.centerNode.y}
            x2={cNode.x}
            y2={cNode.y}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}

        {/* Lines from Category to Memory Nodes */}
        {nodes.leafNodes.map(lNode => (
          <line
            key={`line_leaf_${lNode.id}`}
            x1={nodes.categoryNodes.find(c => c.id === lNode.catId)?.x || 400}
            y1={nodes.categoryNodes.find(c => c.id === lNode.catId)?.y || 250}
            x2={lNode.x}
            y2={lNode.y}
            stroke={lNode.scope === 'long-term' ? 'rgba(99, 102, 241, 0.4)' : lNode.scope === 'session' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
            strokeWidth="1.5"
          />
        ))}

        {/* Center Node */}
        <g transform={`translate(${nodes.centerNode.x}, ${nodes.centerNode.y})`}>
          <circle r="36" fill="url(#hubGlow)" className="animate-pulse" />
          <circle r="22" fill="#4f46e5" />
          <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="11" fontWeight="bold">
            USER CORE
          </text>
        </g>

        {/* Category Nodes */}
        {nodes.categoryNodes.map(cNode => (
          <g key={cNode.id} transform={`translate(${cNode.x}, ${cNode.y})`}>
            <circle r="22" fill="rgba(15, 23, 42, 0.85)" stroke={cNode.color} strokeWidth="2" />
            <text textAnchor="middle" dy="3" fill={cNode.color} fontSize="9" fontWeight="600">
              {cNode.label.split(' ')[0]}
            </text>
          </g>
        ))}

        {/* Leaf Memory Nodes */}
        {nodes.leafNodes.map(lNode => {
          const color = lNode.status === 'pending' ? '#f59e0b' : lNode.scope === 'long-term' ? '#818cf8' : '#38bdf8';

          return (
            <g 
              key={lNode.id} 
              transform={`translate(${lNode.x}, ${lNode.y})`}
              className="graph-leaf-group cursor-pointer"
              onClick={() => onSelectMemory && onSelectMemory(lNode.rawMem)}
            >
              <circle 
                r="14" 
                fill="rgba(15, 23, 42, 0.9)" 
                stroke={color} 
                strokeWidth="2.5" 
                className="hover:scale-125 transition-transform"
              />
              <title>{`${lNode.label} (${lNode.scope})`}</title>
              <text textAnchor="middle" dy="-20" fill="#cbd5e1" fontSize="10" className="pointer-events-none">
                {lNode.label.length > 18 ? lNode.label.substring(0, 16) + '...' : lNode.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
