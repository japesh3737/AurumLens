import React from 'react';
import { PairResult } from '../types';

interface RadarProps {
  pairs: Record<string, PairResult>;
  onSelectPair?: (pairName: string) => void;
  selectedPair?: string;
}

export function RadarChart({ pairs, onSelectPair, selectedPair }: RadarProps) {
  // 4 Nodes arranged in a diamond:
  // Top: GOLDM, Right: GOLDTEN, Bottom: GOLDPETAL, Left: GOLDGUINEA
  const size = 320;
  const center = size / 2;
  const radius = 105;

  const nodes: Record<string, { x: number; y: number; label: string; full: string; color: string }> = {
    GOLDM: { x: center, y: center - radius, label: 'GOLDM', full: 'Gold Mini (100g)', color: '#C9A227' },
    GOLDTEN: { x: center + radius, y: center, label: 'GOLDTEN', full: 'Gold 10g', color: '#C9A227' },
    GOLDPETAL: { x: center, y: center + radius, label: 'G.PETAL', full: 'Gold Petal (1g)', color: '#B8BCC2' },
    GOLDGUINEA: { x: center - radius, y: center, label: 'G.GUINEA', full: 'Gold Guinea (8g)', color: '#B87333' },
  };

  const edgeDefinitions = [
    { pair: 'GOLDTEN-GOLDPETAL', a: 'GOLDTEN', b: 'GOLDPETAL' },
    { pair: 'GOLDGUINEA-GOLDPETAL', a: 'GOLDGUINEA', b: 'GOLDPETAL' },
    { pair: 'GOLDTEN-GOLDGUINEA', a: 'GOLDTEN', b: 'GOLDGUINEA' },
    { pair: 'GOLDM-GOLDTEN', a: 'GOLDM', b: 'GOLDTEN' },
    { pair: 'GOLDM-GOLDGUINEA', a: 'GOLDM', b: 'GOLDGUINEA' },
    { pair: 'GOLDM-GOLDPETAL', a: 'GOLDM', b: 'GOLDPETAL' },
  ];

  return (
    <div className="terminal-card p-5 border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 border-b border-hair dark:border-hair/50 mb-2">
        <span className="text-xs uppercase tracking-widest font-mono text-gold font-semibold">
          Relative Value Radar · 6 Cross-Pairs
        </span>
        <span className="text-[10px] font-mono text-ink-muted dark:text-silver">Click pair to analyze</span>
      </div>

      <div className="relative">
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Boundary Rings */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--hair)" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="var(--hair)" opacity={0.6} />

          {/* 6 Edges */}
          {edgeDefinitions.map((edge) => {
            const pData = pairs[edge.pair];
            const nodeA = nodes[edge.a];
            const nodeB = nodes[edge.b];
            if (!nodeA || !nodeB) return null;

            const z = pData?.z_score ? Math.abs(pData.z_score) : 0;
            const isSelected = selectedPair === edge.pair;
            const status = pData?.status || 'NORMAL';

            let strokeColor = 'var(--hair)';
            let strokeWidth = 1.5;
            let glow = false;

            if (status === 'POTENTIAL SIGNAL') {
              strokeColor = '#2E8B57';
              strokeWidth = 3.5;
              glow = true;
            } else if (status === 'ELEVATED') {
              strokeColor = '#C9A227';
              strokeWidth = 3.0;
              glow = true;
            } else if (status === 'WATCH') {
              strokeColor = '#B87333';
              strokeWidth = 2.0;
            }

            if (isSelected) {
              strokeWidth += 1.5;
            }

            const midX = (nodeA.x + nodeB.x) / 2;
            const midY = (nodeA.y + nodeB.y) / 2;

            return (
              <g
                key={edge.pair}
                className="cursor-pointer group"
                onClick={() => onSelectPair && onSelectPair(edge.pair)}
              >
                {/* Connecting Line */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className={`transition-all duration-300 ${
                    glow ? 'drop-shadow-[0_0_8px_rgba(201,162,39,0.4)]' : ''
                  }`}
                />

                {/* Edge Chip Badge (Midpoint) */}
                <circle cx={midX} cy={midY} r={10} fill="var(--ivory-card)" stroke={strokeColor} strokeWidth={1} />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  className="text-[8px] font-mono fill-ink dark:fill-ivory font-bold pointer-events-none"
                >
                  {z > 0 ? z.toFixed(1) : '—'}
                </text>
              </g>
            );
          })}

          {/* 4 Corner Contract Nodes */}
          {Object.entries(nodes).map(([sym, pos]) => (
            <g key={sym} className="select-none">
              <circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill="var(--ivory-card)"
                stroke={pos.color}
                strokeWidth={2}
                className="drop-shadow-sm"
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill={pos.color}
                fontSize="9"
                fontFamily="IBM Plex Mono"
                fontWeight="bold"
              >
                {pos.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default RadarChart;
