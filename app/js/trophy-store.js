// Trophy store for the rebuild: fetch the official list, persist the earned
// set in localStorage, and move progress in and out as a JSON file or a link.
export const STORAGE_KEY = 'atlas-platinum-leonida-rebuild-v2';

export async function loadTrophyList() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  return Array.isArray(data) ? data : data.trophies;
}

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    /* storage unavailable: progress simply will not persist */
  }
}

export function exportProgress(earned) {
  const payload = JSON.stringify({ atlas: 'Atlas Platinum Leonida', earned: [...earned].sort((a, b) => a - b) }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'atlas-platinum-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function importProgress(file) {
  return file.text().then((text) => {
    const data = JSON.parse(text);
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('No earned list in that file.');
    return new Set(ids.filter((n) => Number.isInteger(n)));
  });
}

export function progressLink(earned) {
  const u = new URL(window.location.href);
  u.search = '';
  u.searchParams.set('earned', [...earned].sort((a, b) => a - b).join(','));
  return u.toString();
}
