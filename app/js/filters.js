// Filters & spoiler masking — Atlas Platinum Leonida (retry build).
// This module alone decides which trophies a view lists, and what a
// spoiler-safe view is allowed to reveal about a story trophy.
export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function selectVisibleTrophies(state) {
  const query = state.search.trim().toLowerCase();
  return state.trophies.filter((trophy) => {
    if (!trophyMatchesKind(trophy, state.kind)) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.stage && trophy.stage !== state.stage) return false;
    if (state.hideEarned && state.earned.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function maskForSpoiler(trophy, state) {
  const mustMask = state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
  if (!mustMask) return { name: trophy.name, description: trophy.description, masked: false };
  return {
    name: '✦ story trophy — hidden by spoiler-safe ✦',
    description: 'Name and description stay covered until this trophy is earned.',
    masked: true,
  };
}

export function describeCurrentView(state, shownCount) {
  if (state.kind === 'online') {
    return 'Online view: the official PS5 list holds 0 online trophies — all 55 are earned offline, in single player.';
  }
  if (state.kind === 'missable') {
    return '⚑ Exactly 1 of the 55 trophies is missable: Positive Mental Attitude. Its first meditation spot, at Jason\u2019s house, exists only during Chapter 1.';
  }
  if (state.spoiler) {
    return `Spoiler-safe is ON: unearned story trophies show neither their name nor their description. Showing ${shownCount} of 55.`;
  }
  if (state.stage) {
    return `Roadmap stage ${state.stage} is selected on the chart — showing its ${shownCount} trophies of 55. Select the stage again to clear it.`;
  }
  return `Showing ${shownCount} of 55 trophies on the chart.`;
}
