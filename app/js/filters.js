// Filters and spoiler masking for the rebuild. One module decides which
// trophies a view lists, and what a spoiler-safe view may reveal.
export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return trophy.kind === kind;
}

export function applyFilters(state) {
  const q = state.search.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (!matchesKind(t, state.kind)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.stage && t.stage !== state.stage) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function spoilerMask(trophy, state) {
  const masked = state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
  if (!masked) return { name: trophy.name, description: trophy.description, masked: false };
  return { name: '— story trophy (spoiler-safe) —', description: 'Hidden by the spoiler setting until earned.', masked: true };
}

export function filterNoteText(state, shownCount) {
  if (state.kind === 'online') {
    return 'Online: the official PS5 list contains 0 online trophies — every one of the 55 is earned offline, in single player.';
  }
  if (state.kind === 'missable') {
    return '⚑ Exactly 1 of the 55 trophies is missable: Positive Mental Attitude. Its first meditation spot, at Jason\u2019s house, exists only during Chapter 1.';
  }
  if (state.spoiler) {
    return `Spoiler-safe is ON: unearned story trophies show neither name nor description. Showing ${shownCount} of 55.`;
  }
  if (state.stage) {
    return `Roadmap stage ${state.stage} selected — showing ${shownCount} of 55 trophies. Select the stage again to clear it.`;
  }
  return `Showing ${shownCount} of 55 trophies.`;
}
