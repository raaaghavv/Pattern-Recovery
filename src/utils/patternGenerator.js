// Android pattern lock rules: skip map and pattern generation

// To go directly from node A to node B, the intermediate node must already be visited
const SKIP_MAP = {
  "1,3": 2,
  "3,1": 2,
  "1,7": 4,
  "7,1": 4,
  "1,9": 5,
  "9,1": 5,
  "2,8": 5,
  "8,2": 5,
  "3,7": 5,
  "7,3": 5,
  "3,9": 6,
  "9,3": 6,
  "4,6": 5,
  "6,4": 5,
  "7,9": 8,
  "9,7": 8,
};

// Adjacency map: which nodes are direct neighbors (edge or diagonal)
const ADJACENT = {
  1: [2, 4, 5],
  2: [1, 3, 4, 5, 6],
  3: [2, 5, 6],
  4: [1, 2, 5, 7, 8],
  5: [1, 2, 3, 4, 6, 7, 8, 9],
  6: [2, 3, 5, 8, 9],
  7: [4, 5, 8],
  8: [4, 5, 6, 7, 9],
  9: [5, 6, 8],
};

// Vertical moves: pairs in the same column
const VERTICAL_PAIRS = new Set([
  "1,4",
  "4,1",
  "4,7",
  "7,4",
  "1,7",
  "7,1",
  "2,5",
  "5,2",
  "5,8",
  "8,5",
  "2,8",
  "8,2",
  "3,6",
  "6,3",
  "6,9",
  "9,6",
  "3,9",
  "9,3",
]);

// Horizontal moves: pairs in the same row
const HORIZONTAL_PAIRS = new Set([
  "1,2",
  "2,1",
  "2,3",
  "3,2",
  "1,3",
  "3,1",
  "4,5",
  "5,4",
  "5,6",
  "6,5",
  "4,6",
  "6,4",
  "7,8",
  "8,7",
  "8,9",
  "9,8",
  "7,9",
  "9,7",
]);

// Node positions on a 3x3 grid (normalized 0-1 range)
// Node 1 = top-left, Node 9 = bottom-right
export const NODE_POSITIONS = {
  1: { x: 0, y: 0 },
  2: { x: 0.5, y: 0 },
  3: { x: 1, y: 0 },
  4: { x: 0, y: 0.5 },
  5: { x: 0.5, y: 0.5 },
  6: { x: 1, y: 0.5 },
  7: { x: 0, y: 1 },
  8: { x: 0.5, y: 1 },
  9: { x: 1, y: 1 },
};

export function isValidMove(path, nextNode) {
  if (path.includes(nextNode)) return false;
  if (path.length === 0) return true;
  const current = path[path.length - 1];
  const skip = SKIP_MAP[current + "," + nextNode];
  if (skip !== undefined && !path.includes(skip)) return false;
  return true;
}

export function generatePatterns({
  startNodes = null,
  endNodes = null,
  minLength = 4,
  maxLength = 9,
  requiredNodes = new Set(),
  excludedNodes = new Set(),
  adjacentOnly = false,
  allowVertical = true,
  allowHorizontal = true,
} = {}) {
  const results = [];
  const starts =
    startNodes && startNodes.length > 0
      ? startNodes
      : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const endSet = endNodes && endNodes.length > 0 ? new Set(endNodes) : null;
  const opts = { adjacentOnly, allowVertical, allowHorizontal };

  for (const s of starts) {
    if (excludedNodes.has(s)) continue;
    dfs(
      [s],
      new Set([s]),
      results,
      minLength,
      maxLength,
      requiredNodes,
      excludedNodes,
      endSet,
      opts,
    );
  }
  return results;
}

function dfs(
  path,
  visited,
  results,
  minLen,
  maxLen,
  required,
  excluded,
  endSet,
  opts,
) {
  if (path.length >= minLen && path.length <= maxLen) {
    const hasAll = [...required].every((n) => visited.has(n));
    const endsCorrectly = endSet === null || endSet.has(path[path.length - 1]);
    if (hasAll && endsCorrectly) {
      results.push([...path]);
    }
  }
  if (path.length >= maxLen) return;

  const current = path[path.length - 1];
  const candidates = opts.adjacentOnly
    ? ADJACENT[current]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const next of candidates) {
    if (visited.has(next)) continue;
    if (excluded.has(next)) continue;
    const pair = current + "," + next;
    const skip = SKIP_MAP[pair];
    if (skip !== undefined && !visited.has(skip)) continue;
    if (!opts.allowVertical && VERTICAL_PAIRS.has(pair)) continue;
    if (!opts.allowHorizontal && HORIZONTAL_PAIRS.has(pair)) continue;
    visited.add(next);
    path.push(next);
    dfs(
      path,
      visited,
      results,
      minLen,
      maxLen,
      required,
      excluded,
      endSet,
      opts,
    );
    path.pop();
    visited.delete(next);
  }
}

export function patternToString(path) {
  return path.join("");
}

export function stringToPattern(str) {
  return str.split("").map(Number);
}
