// Trophy data + saved progress: load the official list, keep the earned set in
// localStorage, export it to a file, import it back, and build shareable links.
export const STORAGE_KEY = 'atlas-platinum-leonida-v1';

export async function loadTrophyList() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

export function loadEarned(trophies) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    const known = new Set(trophies.map((t) => t.id));
    return new Set(ids.filter((id) => known.has(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode / storage off: the atlas still works for this visit.
  }
}

export function exportProgress(earned) {
  const payload = {
    app: 'Atlas Platinum Leonida',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'atlas-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file, trophies) {
  try {
    const doc = JSON.parse(await file.text());
    const raw = Array.isArray(doc) ? doc : doc.earned;
    if (!Array.isArray(raw)) return null;
    const known = new Set(trophies.map((t) => t.id));
    const ids = raw.map(Number).filter((id) => known.has(id));
    return new Set(ids);
  } catch {
    alert('That file is not a valid Atlas progress export.');
    return null;
  }
}

export function progressLink(earned) {
  const url = new URL(location.href);
  url.search = '';
  if (earned.size > 0) url.searchParams.set('earned', [...earned].sort((a, b) => a - b).join(','));
  return url.toString();
}
