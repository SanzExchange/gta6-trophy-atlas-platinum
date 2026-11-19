// Guide panel — Atlas Platinum Leonida (retry build).
// Shows the selected trophy the way the atlas promises: official name and
// official description first, the missable warning where one applies, then
// the atlas's own-words guide, its numbered steps, and the named source the
// guide is cited from. Under spoiler-safe, an unearned story trophy reveals
// none of it.
import { maskForSpoiler } from './filters.js';

export function renderGuide(state) {
  const host = document.getElementById('guideBody');
  const trophy = state.trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    host.innerHTML = '<p class="guide-empty">Pick any marker in the checklist and its full guide opens here — official text, our own words, steps, and the source each fact is cited from.</p>';
    return;
  }
  const view = maskForSpoiler(trophy, state);
  host.innerHTML = '';

  if (trophy.missable) {
    const banner = document.createElement('div');
    banner.className = 'missable-banner';
    banner.textContent = '⚑ MISSABLE — one meditation spot, at Jason\u2019s house, exists only during Chapter 1. Use it before that chapter ends, and keep a manual save from Chapter 1 as insurance.';
    host.appendChild(banner);
  }

  const heading = document.createElement('h3');
  heading.textContent = view.name;
  const officialLine = document.createElement('p');
  officialLine.className = 'guide-official';
  officialLine.textContent = view.masked ? view.description : `\u201C${trophy.description}\u201D — official PlayStation description`;
  const metaLine = document.createElement('div');
  metaLine.className = 'guide-meta';
  const metaLabels = [
    trophy.grade.toUpperCase(),
    trophy.kind,
    'Roadmap stage ' + trophy.stage,
    trophy.hidden ? 'hidden on PS5' : 'visible on PS5',
    state.earned.has(trophy.id) ? '✓ earned' : 'not yet earned',
  ];
  for (const label of metaLabels) {
    const chip = document.createElement('span');
    chip.className = 'tag';
    chip.textContent = label;
    metaLine.appendChild(chip);
  }
  const guideText = document.createElement('p');
  guideText.className = 'guide-text';
  guideText.textContent = view.masked
    ? 'Spoiler-safe is on, so this story trophy\u2019s guide stays covered until the trophy is earned. Tick it in the checklist and the full guide — words, steps and source — is revealed.'
    : trophy.guide;
  host.append(heading, officialLine, metaLine, guideText);

  if (!view.masked && Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    const steps = document.createElement('ol');
    steps.className = 'guide-steps';
    for (const stepText of trophy.steps) {
      const item = document.createElement('li');
      item.textContent = stepText;
      steps.appendChild(item);
    }
    host.appendChild(steps);
  }

  if (!view.masked && trophy.source) {
    const sourceLine = document.createElement('p');
    sourceLine.className = 'guide-source';
    sourceLine.append('Source cited for this guide: ');
    const link = document.createElement('a');
    link.href = trophy.source.url;
    link.textContent = trophy.source.name;
    link.rel = 'noreferrer';
    sourceLine.appendChild(link);
    sourceLine.append('. The guide above is written in this atlas\u2019s own words — a source is cited, never copied.');
    host.appendChild(sourceLine);
  }
}
