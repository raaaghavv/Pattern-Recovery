import { useState, useRef, useCallback, useEffect } from "react";
import { NODE_POSITIONS, isValidMove } from "../utils/patternGenerator";

const PADDING = 0.2;
const NODES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function getPos(node, size) {
  const p = NODE_POSITIONS[node];
  const usable = size * (1 - 2 * PADDING);
  return {
    x: p.x * usable + size * PADDING,
    y: p.y * usable + size * PADDING,
  };
}

export default function PatternLock({
  size = 300,
  onPattern,
  onDrawStart,
  status = "idle",
  disabled = false,
}) {
  const [path, setPath] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef(null);
  const pathRef = useRef([]);

  const dotR = size * 0.035;
  const hitR = size * 0.08;
  const activeR = size * 0.055;
  const lineWidth = size * 0.02;

  const getSvgPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null) return null;
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const findNearNode = useCallback(
    (svgPt) => {
      if (!svgPt) return null;
      for (const node of NODES) {
        const pos = getPos(node, size);
        const dx = svgPt.x - pos.x;
        const dy = svgPt.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitR) {
          return node;
        }
      }
      return null;
    },
    [size, hitR],
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled) return;
      e.preventDefault();
      onDrawStart?.();
      const svgPt = getSvgPoint(e);
      const node = findNearNode(svgPt);
      pathRef.current = node ? [node] : [];
      setPath(pathRef.current);
      setIsDrawing(true);
      setMousePos(svgPt);
    },
    [disabled, onDrawStart, getSvgPoint, findNearNode],
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDrawing || disabled) return;
      e.preventDefault();
      const svgPt = getSvgPoint(e);
      setMousePos(svgPt);
      const node = findNearNode(svgPt);
      if (node && isValidMove(pathRef.current, node)) {
        pathRef.current = [...pathRef.current, node];
        setPath(pathRef.current);
      }
    },
    [isDrawing, disabled, getSvgPoint, findNearNode],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setMousePos(null);
    if (pathRef.current.length > 0 && onPattern) {
      onPattern([...pathRef.current]);
    }
  }, [isDrawing, onPattern]);

  useEffect(() => {
    const handler = () => handlePointerUp();
    document.addEventListener("pointerup", handler);
    document.addEventListener("pointercancel", handler);
    return () => {
      document.removeEventListener("pointerup", handler);
      document.removeEventListener("pointercancel", handler);
    };
  }, [handlePointerUp]);

  // Reset path when status changes to idle
  useEffect(() => {
    if (status === "idle") {
      pathRef.current = [];
      setPath([]);
      setMousePos(null);
    }
  }, [status]);

  const statusColor =
    status === "success"
      ? "#22c55e"
      : status === "error"
        ? "#ef4444"
        : "#3b82f6";
  const pathSet = new Set(path);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ touchAction: "none", cursor: disabled ? "default" : "pointer" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Lines between connected nodes */}
      {path.map((node, i) => {
        if (i === 0) return null;
        const from = getPos(path[i - 1], size);
        const to = getPos(node, size);
        return (
          <line
            key={`line-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={statusColor}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}

      {/* Trailing line to cursor */}
      {isDrawing && path.length > 0 && mousePos && (
        <line
          x1={getPos(path[path.length - 1], size).x}
          y1={getPos(path[path.length - 1], size).y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke={statusColor}
          strokeWidth={lineWidth * 0.7}
          strokeLinecap="round"
          opacity={0.4}
        />
      )}

      {/* Dots */}
      {NODES.map((node) => {
        const pos = getPos(node, size);
        const isActive = pathSet.has(node);
        return (
          <g key={node}>
            {/* Invisible hit area */}
            <circle cx={pos.x} cy={pos.y} r={hitR} fill="transparent" />
            {/* Active ring */}
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={activeR}
                fill={statusColor}
                opacity={0.2}
              />
            )}
            {/* Dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={dotR}
              fill={isActive ? statusColor : "#9ca3af"}
            />
          </g>
        );
      })}
    </svg>
  );
}
