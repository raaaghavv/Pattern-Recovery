import PatternMini from "./PatternMini";
import { stringToPattern } from "../utils/patternGenerator";

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

export default function PatternList({ patterns = [], onRemove, onFoundIt }) {
  if (patterns.length === 0) {
    return (
      <p className="empty-list">No patterns tried yet. Draw one to start!</p>
    );
  }

  return (
    <div className="pattern-list">
      {patterns.map((code, index) => (
        <div key={code + "-" + index} className="pattern-list-item">
          <PatternMini
            pattern={stringToPattern(code)}
            size={50}
            highlighted
          />
          <div className="pattern-info">
            <span className="pattern-code">{code.split("").join("-")}</span>
            <span className="pattern-length">{code.length} nodes</span>
          </div>
          <div className="pattern-actions">
            <button
              className="found-it-icon-btn"
              onClick={() => onFoundIt?.()}
              title="This is my pattern!"
            >
              <CheckIcon />
            </button>
            {onRemove && (
              <button
                className="remove-btn"
                onClick={() => onRemove(code)}
                title="Remove from tried list"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
