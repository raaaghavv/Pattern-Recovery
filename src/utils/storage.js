const STORAGE_KEY = "pattern-password-tried";

export function loadTriedPatterns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTriedPatterns(patterns) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}
