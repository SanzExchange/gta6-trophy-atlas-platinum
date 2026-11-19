// Filtering + spoiler masking: one place decides which trophies a view shows
// and what a spoiler-safe view is allowed to reveal about story trophies.
import { ROADMAP_STAGES } from './render-roadmap.js';

export function spoilerMask(trophy, earned, spoilerOn) {
  const hidden = spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
  return {
    name: hidden ? 'Hidden story trophy' : trophy.name,
    description: hidden ? '??? — earn it to reveal the name and description.' : trophy.description,
    masked: hidden,
  };
}

export function applyFilters(trophies, state) {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.stage !== null) {
      const stage = ROADMAP_STAGES.find((s) => s.id === state.stage);
      if (!stage || !stage.trophies.includes(t.id)) return false;
    }
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online' && t.kind !== 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && state.kind !== 'online' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function filterNoteText(state, shown, total) {
  const parts = [];
  if (state.stage !== null) {
    const stage = ROADMAP_STAGES.find((s) => s.id === state.stage);
    parts.push(`Roadmap stage ${stage.id} — ${stage.name}`);
  }
  if (state.kind === 'missable') parts.push('Missable trophies only — PowerPyx & GTABase flag just 1 of 55');
  if (state.kind === 'online') parts.push('No online trophies exist in this list — all 55 are offline single-player');
  if (state.kind !== 'all' && state.kind !== 'missable' && state.kind !== 'online') parts.push(`Kind: ${state.kind}`);
  if (state.grade !== 'all') parts.push(`Grade: ${state.grade}`);
  if (state.search.trim()) parts.push(`Search: “${state.search.trim()}”`);
  if (state.hideEarned) parts.push('earned hidden');
  if (state.spoiler) parts.push('spoiler-safe on — story trophies stay hidden until earned');
  const head = parts.length ? parts.join(' · ') + ' — ' : '';
  return `${head}Showing ${shown} of ${total} trophies.`;
}
