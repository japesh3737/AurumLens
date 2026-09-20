import React, { useState } from 'react';
import { PairResult } from '../types';

interface RadarProps {
  pairs: Record<string, PairResult>;
  onSelectPair?: (pairName: string) => void;
  selectedPair?: string;
}

export function RadarChart({ pairs, onSelectPair, selectedPair }: RadarProps) {
  const [hoveredPair, setHoveredPair] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 4 Nodes arranged in a diamond:
  // Top: GOLDM, Right: GOLDTEN, Bottom: GOLDPETAL, Left: GOLDGUINEA
  const size = 320;
  const center = size / 2;
  const radius = 105;

  const nodes: Record<string, { x: number; y: number; label: string; full: string; color: string; desc: string }> = {
    GOLDM: { x: center, y: center - radius, label: 'GOLDM', full: 'Gold Mini (100g)', color: '#D4AF37', desc: '100g Lot · 995 Purity' },
    GOLDTEN: { x: center + radius, y: center, label: 'GOLDTEN', full: 'Gold 10g', color: '#D4AF37', desc: '10g Benchmark · 999 Purity' },
    GOLDPETAL: { x: center, y: center + radius, label: 'G.PETAL', full: 'Gold Petal (1g)', color: '#8A929E', desc: '1g Retail · 999 Purity' },
    GOLDGUINEA: { x: center - radius, y: center, label: 'G.GUINEA', full: 'Gold Guinea (8g)', color: '#C26828', desc: '8g Sovereign · 999 Purity' },
  };

  const edgeDefinitions = [
    { pair: 'GOLDTEN-GOLDPETAL', a: 'GOLDTEN', b: 'GOLDPETAL' },
    { pair: 'GOLDGUINEA-GOLDPETAL', a: 'GOLDGUINEA', b: 'GOLDPETAL' },
    { pair: 'GOLDTEN-GOLDGUINEA', a: 'GOLDTEN', b: 'GOLDGUINEA' },
    { pair: 'GOLDM-GOLDTEN', a: 'GOLDM', b: 'GOLDTEN' },
    { pair: 'GOLDM-GOLDGUINEA', a: 'GOLDM', b: 'GOLDGUINEA' },
    { pair: 'GOLDM-GOLDPETAL', a: 'GOLDM', b: 'GOLDPETAL' },
  ];

  const handleNodeClick = (sym: string) => {
    // Find highest z-score pair containing this symbol
    const related = edgeDefinitions.filter((e) => e.a === sym || e.b === sym);
    let bestPair = related[0]?.pair;
    let maxZ = -1;
    for (const r of related) {
      const z = Math.abs(pairs[r.pair]?.z_score || 0);
      if (z > maxZ) {
        maxZ = z;
        bestPair = r.pair;
      }
    }
    if (bestPair && onSelectPair) {
      onSelectPair(bestPair);
    }
  };

  const activeFocusPair = hoveredPair || selectedPair || 'GOLDTEN-GOLDPETAL';
  const activeFocusData = pairs[activeFocusPair];

  return (
    <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-2">
        <span className="text-xs uppercase tracking-widest font-mono text-gold font-bold">
          Relative Value Radar · 6 Cross-Pairs
        </span>
        <span className="text-[10px] font-mono text-ink-muted dark:text-silver">
          Click any pair or node
        </span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Boundary Concentric Rings */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--hair)" strokeDasharray="3 3" opacity={0.8} />
          <circle cx={center} cy={center} r={radius * 0.65} fill="none" stroke="var(--hair)" strokeDasharray="2 2" opacity={0.6} />
          <circle cx={center} cy={center} r={radius * 0.35} fill="none" stroke="var(--hair)" opacity={0.4} />

          {/* 6 Edges */}
          {edgeDefinitions.map((edge) => {
            const pData = pairs[edge.pair];
            const nodeA = nodes[edge.a];
            const nodeB = nodes[edge.b];
            if (!nodeA || !nodeB) return null;

            const z = pData?.z_score ? Math.abs(pData.z_score) : 0;
            const isSelected = selectedPair === edge.pair;
            const isHovered = hoveredPair === edge.pair;
            const isNodeRelated = hoveredNode === edge.a || hoveredNode === edge.b;
            const status = pData?.status || 'NORMAL';

            let strokeColor = 'var(--hair-strong)';
            let strokeWidth = 1.8;
            let glow = false;

            if (status === 'POTENTIAL SIGNAL') {
              strokeColor = '#16A34A'; // Crisp Emerald
              strokeWidth = 3.5;
              glow = true;
            } else if (status === 'ELEVATED') {
              strokeColor = '#D4AF37'; // Radiant Gold
              strokeWidth = 3.0;
              glow = true;
            } else if (status === 'WATCH') {
              strokeColor = '#C26828'; // Warm Copper
              strokeWidth = 2.2;
            }

            if (isSelected || isHovered || isNodeRelated) {
              strokeWidth += 2;
            }

            const midX = (nodeA.x + nodeB.x) / 2;
            const midY = (nodeA.y + nodeB.y) / 2;

            return (
              <g
                key={edge.pair}
                className="cursor-pointer group"
                onClick={() => onSelectPair && onSelectPair(edge.pair)}
                onMouseEnter={() => setHoveredPair(edge.pair)}
                onMouseLeave={() => setHoveredPair(null)}
              >
                {/* Connecting Line */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className={`transition-all duration-200 ${
                    glow ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''
                  }`}
                />

                {/* Edge Chip Badge (Midpoint) */}
                <circle
                  cx={midX}
                  cy={midY}
                  r={12}
                  fill="var(--ivory-card)"
                  stroke={strokeColor}
                  strokeWidth={isSelected || isHovered ? 2.5 : 1.2}
                  className="transition-transform duration-200 group-hover:scale-110 shadow-sm"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  className="text-[8.5px] font-mono fill-ink dark:fill-ivory font-bold pointer-events-none"
                >
                  {z > 0 ? z.toFixed(1) : '—'}
                </text>
              </g>
            );
          })}

          {/* 4 Corner Contract Nodes */}
          {Object.entries(nodes).map(([sym, pos]) => {
            const isHovered = hoveredNode === sym;
            return (
              <g
                key={sym}
                className="cursor-pointer group"
                onClick={() => handleNodeClick(sym)}
                onMouseEnter={() => setHoveredNode(sym)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Glow / Ring on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={27}
                    fill="none"
                    stroke={pos.color}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={22}
                  fill="var(--ivory-card)"
                  stroke={pos.color}
                  strokeWidth={isHovered ? 3 : 2}
                  className="drop-shadow-md transition-all duration-200 group-hover:scale-105"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4.5}
                  textAnchor="middle"
                  fill={pos.color}
                  fontSize="9.5"
                  fontFamily="IBM Plex Mono"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {pos.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Information & Feedback Strip */}
      <div className="w-full mt-3 pt-3 border-t border-hair dark:border-hair/50 flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center gap-2 text-ink dark:text-ivory">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="font-bold text-gold">
            {hoveredNode ? `${nodes[hoveredNode]?.full} (${nodes[hoveredNode]?.desc})` : activeFocusPair}
          </span>
          {activeFocusData && !hoveredNode && (
            <span className="text-ink-muted dark:text-silver text-[11px]">
              · Z: <strong>{activeFocusData.z_score ? (activeFocusData.z_score >= 0 ? `+${activeFocusData.z_score.toFixed(2)}` : activeFocusData.z_score.toFixed(2)) : '—'}σ</strong>
              {' '}({activeFocusData.status})
            </span>
          )}
        </div>
        <button
          onClick={() => onSelectPair && onSelectPair(activeFocusPair)}
          className="text-[11px] font-bold text-gold hover:underline cursor-pointer"
        >
          Open Pair Detail →
        </button>
      </div>
    </div>
  );
}

export default RadarChart;
