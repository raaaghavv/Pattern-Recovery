import { useState, useRef, useEffect } from "react";
import { generatePatterns, patternToString } from "../utils/patternGenerator";
import PatternMini from "./PatternMini";

const NODES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MAX_DISPLAY = 500;

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <span
      className="info-tip-wrap"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        setOpen((v) => !v);
      }}
    >
      <svg
        className="info-tip"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span className={`info-tip-text ${open ? "visible" : ""}`}>{text}</span>
    </span>
  );
}

function NodeGrid({ selected, onToggle, label, tooltip }) {
  return (
    <div className="node-grid-wrapper">
      <label>
        {label} <InfoTip text={tooltip} />
      </label>
      <div className="node-grid">
        {NODES.map((n) => (
          <button
            key={n}
            className={`node-btn ${selected.has(n) ? "active" : ""}`}
            onClick={() => onToggle(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {selected.size > 0 && (
        <button className="clear-selection" onClick={() => onToggle(null)}>
          Clear
        </button>
      )}
    </div>
  );
}

export default function FilteredSearch({
  triedPatterns,
  onMarkTried,
  onFoundIt,
}) {
  const [startNode, setStartNode] = useState(new Set());
  const [endNode, setEndNode] = useState(new Set());
  const [requiredNodes, setRequiredNodes] = useState(new Set());
  const [excludedNodes, setExcludedNodes] = useState(new Set());
  const [minLength, setMinLength] = useState(4);
  const [maxLength, setMaxLength] = useState(9);
  const [adjacentOnly, setAdjacentOnly] = useState(false);
  const [allowVertical, setAllowVertical] = useState(true);
  const [allowHorizontal, setAllowHorizontal] = useState(true);
  const [results, setResults] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const toggleMulti = (setter) => (n) => {
    if (n === null) {
      setter(new Set());
      return;
    }
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const handleSearch = () => {
    const patterns = generatePatterns({
      startNodes: startNode.size > 0 ? [...startNode] : null,
      endNodes: endNode.size > 0 ? [...endNode] : null,
      minLength,
      maxLength,
      requiredNodes,
      excludedNodes,
      adjacentOnly,
      allowVertical,
      allowHorizontal,
    });
    setResults(patterns);
  };

  const triedSet =
    triedPatterns instanceof Set ? triedPatterns : new Set(triedPatterns);

  return (
    <div className="filtered-search">
      <button
        className="filter-toggle"
        onClick={() => setShowFilters((v) => !v)}
      >
        <span className={`filter-chevron ${showFilters ? "open" : ""}`}>
          &#9654;
        </span>
        {showFilters ? "Hide filters" : "Show filters"}
      </button>

      {showFilters && (
        <div className="search-controls">
          <NodeGrid
            selected={startNode}
            onToggle={toggleMulti(setStartNode)}
            label="Start nodes"
            tooltip="Pattern must begin from one of these nodes"
          />
          <NodeGrid
            selected={endNode}
            onToggle={toggleMulti(setEndNode)}
            label="End nodes"
            tooltip="Pattern must end on one of these nodes"
          />
          <NodeGrid
            selected={requiredNodes}
            onToggle={toggleMulti(setRequiredNodes)}
            label="Must include"
            tooltip="Pattern must pass through all selected nodes"
          />
          <NodeGrid
            selected={excludedNodes}
            onToggle={toggleMulti(setExcludedNodes)}
            label="Must not include"
            tooltip="Pattern will not use any of these nodes"
          />

          <div className="length-controls">
            <label>
              <span>
                Min length{" "}
                <InfoTip text="Minimum number of nodes in the pattern (4-9)" />
              </span>
              <input
                type="number"
                min={4}
                max={9}
                value={minLength}
                onChange={(e) => {
                  const v = Math.max(4, Math.min(9, Number(e.target.value)));
                  setMinLength(v);
                  if (v > maxLength) setMaxLength(v);
                }}
              />
            </label>
            <label>
              <span>
                Max length{" "}
                <InfoTip text="Maximum number of nodes in the pattern (4-9)" />
              </span>
              <input
                type="number"
                min={4}
                max={9}
                value={maxLength}
                onChange={(e) => {
                  const v = Math.max(4, Math.min(9, Number(e.target.value)));
                  setMaxLength(v);
                  if (v < minLength) setMinLength(v);
                }}
              />
            </label>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={adjacentOnly}
                onChange={(e) => setAdjacentOnly(e.target.checked)}
              />
              Adjacent only{" "}
              <InfoTip text="Only allow moves to directly neighboring nodes (no knight-like jumps)" />
              <span className="toggle-hint">
                No jumping over gaps (e.g. 3 can only reach 2, 5, 6)
              </span>
            </label>

            <label className="toggle-label">
              <input
                type="checkbox"
                checked={allowVertical}
                onChange={(e) => setAllowVertical(e.target.checked)}
              />
              Allow vertical{" "}
              <InfoTip text="Allow straight up/down moves within the same column" />
              <span className="toggle-hint">
                Straight up/down moves (e.g. 1↔4↔7, 2↔5↔8)
              </span>
            </label>

            <label className="toggle-label">
              <input
                type="checkbox"
                checked={allowHorizontal}
                onChange={(e) => setAllowHorizontal(e.target.checked)}
              />
              Allow horizontal{" "}
              <InfoTip text="Allow straight left/right moves within the same row" />
              <span className="toggle-hint">
                Straight left/right moves (e.g. 1↔2↔3, 4↔5↔6)
              </span>
            </label>
          </div>
        </div>
      )}

      <button className="search-btn" onClick={handleSearch}>
        Search Patterns
      </button>

      {results !== null &&
        (() => {
          const untried = results.filter(
            (p) => !triedSet.has(patternToString(p)),
          );
          const displayed = untried.slice(0, MAX_DISPLAY);
          const displayedCodes = displayed.map((p) => patternToString(p));
          return (
            <div className="search-results">
              <div className="results-header">
                <p className="results-count">
                  {untried.length} untried pattern
                  {untried.length !== 1 ? "s" : ""} found
                  {results.length > untried.length &&
                    ` (${results.length - untried.length} already tried hidden)`}
                  {untried.length > MAX_DISPLAY &&
                    ` — showing first ${MAX_DISPLAY}`}
                </p>
                {displayedCodes.length > 0 && (
                  <button
                    className="mark-all-btn"
                    onClick={() =>
                      displayedCodes.forEach((c) => onMarkTried(c))
                    }
                  >
                    Mark all as tried ({displayedCodes.length})
                  </button>
                )}
              </div>
              <div className="results-grid">
                {displayed.map((pattern) => {
                  const code = patternToString(pattern);
                  return (
                    <div key={code} className="result-card">
                      <div className="result-content">
                        <PatternMini
                          pattern={pattern}
                          size={70}
                          highlighted
                        />
                        <span className="result-code">
                          {code.split("").join("-")}
                        </span>
                      </div>
                      <div className="result-actions">
                        <button
                          className="mark-tried-btn"
                          onClick={() => onMarkTried(code)}
                        >
                          Mark tried
                        </button>
                        <button
                          className="found-it-btn"
                          onClick={() => onFoundIt?.()}
                        >
                          <CheckIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
