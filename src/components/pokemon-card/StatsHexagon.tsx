"use client";

import { useEffect, useRef, useState } from "react";

interface StatsHexagonProps {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  color: string;
  size?: number;
}

const STAT_LABELS = ["HP", "ATK", "DEF", "SpA", "SpD", "SPD"];
const MAX_STAT = 255;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function StatsHexagon({ stats, color, size = 100 }: StatsHexagonProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const labelR = size * 0.48;
  const angles = [0, 60, 120, 180, 240, 300];

  const statValues = [
    stats.hp, stats.attack, stats.defense,
    stats.spAtk, stats.spDef, stats.speed,
  ];

  // Background hexagon points
  const bgPoints = angles
    .map((a) => polarToCartesian(cx, cy, maxR, a))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Stat polygon points
  const statPoints = angles.map((a, i) => {
    const r = animated ? (statValues[i] / MAX_STAT) * maxR : 0;
    return polarToCartesian(cx, cy, r, a);
  });
  const statPolygon = statPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid lines (3 levels)
  const gridLevels = [0.33, 0.66, 1.0];

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Stats hexagon chart"
    >
      {/* Grid hexagons */}
      {gridLevels.map((level) => {
        const pts = angles
          .map((a) => polarToCartesian(cx, cy, maxR * level, a))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const end = polarToCartesian(cx, cy, maxR, a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Stat fill */}
      <polygon
        points={statPolygon}
        fill={`${color}55`}
        stroke={color}
        strokeWidth="1.5"
        style={{
          transition: animated ? "all 0.8s ease-out" : "none",
        }}
      />

      {/* Stat dots */}
      {statPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
      ))}

      {/* Labels */}
      {angles.map((a, i) => {
        const lp = polarToCartesian(cx, cy, labelR, a);
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.09}
            fill="rgba(255,255,255,0.85)"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {STAT_LABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}
