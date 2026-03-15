import { NODE_POSITIONS } from "../utils/patternGenerator";

const PADDING = 0.15;

function getPos(node, size) {
  const p = NODE_POSITIONS[node];
  const usable = size * (1 - 2 * PADDING);
  return {
    x: p.x * usable + size * PADDING,
    y: p.y * usable + size * PADDING,
  };
}

export default function PatternMini({
  pattern = [],
  size = 60,
  highlighted = false,
}) {
  const dotR = size * 0.06;
  const activeR = size * 0.04;
  const lineWidth = size * 0.03;
  const patternSet = new Set(pattern);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Lines */}
      {pattern.map((node, i) => {
        if (i === 0) return null;
        const from = getPos(pattern[i - 1], size);
        const to = getPos(node, size);
        return (
          <line
            key={`l${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={highlighted ? "#3b82f6" : "#6b7280"}
            strokeWidth={lineWidth}
            strokeLinecap="round"
          />
        );
      })}
      {/* Dots */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((node) => {
        const pos = getPos(node, size);
        const isActive = patternSet.has(node);
        return (
          <circle
            key={node}
            cx={pos.x}
            cy={pos.y}
            r={isActive ? activeR : dotR}
            fill={isActive ? (highlighted ? "#3b82f6" : "#6b7280") : "#d1d5db"}
          />
        );
      })}
    </svg>
  );
}
