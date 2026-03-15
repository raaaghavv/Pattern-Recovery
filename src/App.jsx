import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import PatternLock from "./components/PatternLock";
import PatternList from "./components/PatternList";
const FilteredSearch = lazy(() => import("./components/FilteredSearch"));
import { patternToString } from "./utils/patternGenerator";
import { loadTriedPatterns, saveTriedPatterns } from "./utils/storage";
import "./App.css";

const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#ff6eb4",
  "#c084fc",
  "#22c55e",
  "#f97316",
];

function generateConfetti(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const x = Math.random() * 100;
    const w = 8 + Math.random() * 14;
    const h = 6 + Math.random() * 10;
    const d = 2.5 + Math.random() * 2.5;
    const delay = Math.random() * 2;
    const rot = 360 + Math.random() * 720;
    const br = Math.random() > 0.5 ? "50%" : "2px";
    return { i, color, x, w, h, d, delay, rot, br };
  });
}

function CelebrationOverlay({ onClose }) {
  const [confetti] = useState(() => generateConfetti());

  return (
    <div className="celebration-overlay" onClick={onClose}>
      {confetti.map((c) => (
        <div
          key={c.i}
          className="confetti-piece"
          style={{
            "--c": c.color,
            "--x": `${c.x}%`,
            "--w": `${c.w}px`,
            "--h": `${c.h}px`,
            "--d": `${c.d}s`,
            "--delay": `${c.delay}s`,
            "--rot": `${c.rot}deg`,
            "--br": c.br,
          }}
        />
      ))}
      <div className="celebration-text">
        <h2>Congratulations!</h2>
        <p>You found your pattern!</p>
        <span className="about-link">
          Built by{" "}
          <a
            href="https://x.com/raaaghavvvvv"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            @raaaghavvvvv
          </a>
        </span>
      </div>
      <span className="celebration-dismiss">click anywhere to dismiss</span>
    </div>
  );
}

function App() {
  const [triedPatterns, setTriedPatterns] = useState(() => loadTriedPatterns());
  const [activeTab, setActiveTab] = useState("search");
  const [drawStatus, setDrawStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    saveTriedPatterns(triedPatterns);
  }, [triedPatterns]);

  const handlePattern = useCallback(
    (path) => {
      if (path.length < 4) {
        setDrawStatus("error");
        setStatusMessage("Pattern must connect at least 4 nodes");
        return;
      }
      const code = patternToString(path);
      if (triedPatterns.includes(code)) {
        setDrawStatus("error");
        setStatusMessage(`Already tried! (${code.split("").join("-")})`);
        return;
      }
      setTriedPatterns((prev) => [code, ...prev]);
      setDrawStatus("success");
      setStatusMessage(`Pattern ${code.split("").join("-")} saved`);
    },
    [triedPatterns],
  );

  const handleClear = () => {
    setDrawStatus("idle");
    setStatusMessage("");
  };

  const handleRemove = (code) => {
    setTriedPatterns((prev) => prev.filter((p) => p !== code));
  };

  const handleMarkTried = (code) => {
    if (!triedPatterns.includes(code)) {
      setTriedPatterns((prev) => [code, ...prev]);
    }
  };

  const handleFoundIt = useCallback(() => {
    setShowCelebration(true);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <h1>Pattern Recovery</h1>
          <span className="x-link">
            by{" "}
            <a
              href="https://x.com/raaaghavvvvv"
              target="_blank"
              rel="noopener noreferrer"
            >
              @raaaghavvvvv
            </a>
          </span>
        </div>
        <nav className="tabs">
          <button
            className={`tab ${activeTab === "draw" ? "active" : ""}`}
            onClick={() => setActiveTab("draw")}
          >
            Draw
          </button>
          <button
            className={`tab ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search
          </button>
          <button
            className={`tab tried-tab ${activeTab === "tried" ? "active" : ""}`}
            onClick={() => setActiveTab("tried")}
          >
            Tried ({triedPatterns.length})
          </button>
        </nav>
      </header>

      <div className="app-body">
        <main className="main-panel">
          <div
            className="draw-panel"
            style={{ display: activeTab === "draw" ? undefined : "none" }}
          >
            <PatternLock
              size={280}
              onPattern={handlePattern}
              onDrawStart={handleClear}
              status={drawStatus}
            />
            {statusMessage && (
              <p className={`status-msg ${drawStatus}`}>{statusMessage}</p>
            )}
            {drawStatus !== "idle" && (
              <div className="draw-actions">
                <button className="clear-btn" onClick={handleClear}>
                  Clear
                </button>
                {drawStatus === "success" && (
                  <button className="success-btn" onClick={handleFoundIt}>
                    Found it!
                  </button>
                )}
              </div>
            )}
          </div>
          <div style={{ display: activeTab === "search" ? undefined : "none" }}>
            <Suspense fallback={null}>
              <FilteredSearch
                triedPatterns={new Set(triedPatterns)}
                onMarkTried={handleMarkTried}
                onFoundIt={handleFoundIt}
              />
            </Suspense>
          </div>
          <div
            className="tried-panel"
            style={{ display: activeTab === "tried" ? undefined : "none" }}
          >
            <div className="sidebar-header">
              <h2>Tried ({triedPatterns.length})</h2>
              {triedPatterns.length > 0 && (
                <button
                  className="clear-all-btn"
                  onClick={() => setTriedPatterns([])}
                >
                  Clear all
                </button>
              )}
            </div>
            <PatternList
              patterns={triedPatterns}
              onRemove={handleRemove}
              onFoundIt={handleFoundIt}
            />
          </div>
        </main>

        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Tried ({triedPatterns.length})</h2>
            {triedPatterns.length > 0 && (
              <button
                className="clear-all-btn"
                onClick={() => setTriedPatterns([])}
              >
                Clear all
              </button>
            )}
          </div>
          <PatternList
            patterns={triedPatterns}
            onRemove={handleRemove}
            onFoundIt={handleFoundIt}
          />
        </aside>
      </div>

      {showCelebration && (
        <CelebrationOverlay onClose={() => setShowCelebration(false)} />
      )}
    </div>
  );
}

export default App;
