// Guide panel for the rebuild: the selected trophy's official name and
// description, the missable warning where it applies, the atlas's own guide
// text, its steps, and the named source the guide cites.
import { spoilerMask } from './filters.js';

export function renderGuide(state) {
  const host = document.getElementById('guideBody');
  const trophy = state.trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    host.innerHTML = '<p class="guide-empty">Select a trophy in the checklist to read its guide here.</p>';
    return;
  }
  const view = spoilerMask(trophy, state);
  host.innerHTML = '';
  if (trophy.missable) {
    const banner = document.createElement('div');
    banner.className = 'missable-banner';
    banner.textContent = '⚑ MISSABLE — the first meditation spot, at Jason\u2019s house, exists only during Chapter 1. Do it before that chapter ends, or keep a manual save from Chapter 1.';
    host.appendChild(banner);
  }
  const title = document.createElement('h3');
  title.textContent = view.name;
  const official = document.createElement('p');
  official.className = 'guide-official';
  official.textContent = view.masked ? view.description : `\u201C${trophy.description}\u201D — official description`;
  const meta = document.createElement('div');
  meta.className = 'guide-meta';
  for (const label of [trophy.grade.toUpperCase(), trophy.kind, 'Roadmap stage ' + trophy.stage, trophy.hidden ? 'hidden on PS5' : 'visible on PS5', state.earned.has(trophy.id) ? '✓ earned' : 'not yet earned']) {
    const s = document.createElement('span');
    s.className = 'tag';
    s.textContent = label;
    meta.appendChild(s);
  }
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = view.masked
    ? 'Spoiler-safe is on: this story trophy\u2019s guide is hidden until the trophy is earned. Tick it in the checklist to reveal the full guide.'
    : trophy.guide;
  host.append(title, official, meta, guide);
  if (!view.masked && Array.isArray(trophy.steps) && trophy.steps.length) {
    const ol = document.createElement('ol');
    ol.className = 'guide-steps';
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ol.appendChild(li);
    }
    host.appendChild(ol);
  }
  if (!view.masked && trophy.source) {
    const src = document.createElement('p');
    src.className = 'guide-source';
    src.append('Source cited for this guide: ');
    const a = document.createElement('a');
    a.href = trophy.source.url;
    a.textContent = trophy.source.name;
    a.rel = 'noreferrer';
    src.appendChild(a);
    src.append('. Guide written in the atlas\u2019s own words; no text copied.');
    host.appendChild(src);
  }
}
