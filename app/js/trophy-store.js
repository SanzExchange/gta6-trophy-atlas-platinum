// Trophy store — Atlas Platinum Leonida (retry build).
// One small job: move trophy data and earned-progress between the JSON file,
// the browser's localStorage, an exported file, an imported file and a link.
export const STORAGE_KEY = 'atlas-platinum-leonida-progress-v3';

export async function loadTrophyList() {
  const response = await fetch('data/trophies.json');
  const parsed = await response.json();
  return Array.isArray(parsed) ? parsed : parsed.trophies;
}

export function loadEarnedSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarnedSet(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    /* storage blocked or full: the atlas still works, progress just will not persist */
  }
}

export function downloadProgressFile(earned) {
  const payload = JSON.stringify(
    { atlas: 'Atlas Platinum Leonida — Peta Perjalanan 55 Trophy', earned: [...earned].sort((a, b) => a - b) },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'atlas-platinum-leonida-progress.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function readProgressFile(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('that file holds no earned list');
    return new Set(ids.filter((n) => Number.isInteger(n)));
  });
}

export function buildProgressLink(earned) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('earned', [...earned].sort((a, b) => a - b).join(','));
  return url.toString();
}
