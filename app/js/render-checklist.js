// Checklist rendering — Atlas Platinum Leonida (retry build).
// One row per visible trophy: earned checkbox, official name, official
// description, grade chip, kind, roadmap stage, hidden marker and — for the
// single missable trophy — a red flag. Spoiler-safe rows stay masked.
import { selectVisibleTrophies, maskForSpoiler, describeCurrentView } from './filters.js';

function makeTag(label, extraClass) {
  const span = document.createElement('span');
  span.className = 'tag' + (extraClass ? ' ' + extraClass : '');
  span.textContent = label;
  return span;
}

export function renderChecklist(state, handlers) {
  const visible = selectVisibleTrophies(state);
  const host = document.getElementById('trophyRows');
  host.innerHTML = '';
  for (const trophy of visible) {
    const view = maskForSpoiler(trophy, state);
    const isEarned = state.earned.has(trophy.id);
    const row = document.createElement('div');
    row.className = 'trophy-row' + (isEarned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => handlers.onToggle(trophy.id));

    const body = document.createElement('div');
    const nameLine = document.createElement('div');
    nameLine.className = 'row-name' + (view.masked ? ' masked' : '');
    nameLine.textContent = view.name;
    const descLine = document.createElement('div');
    descLine.className = 'row-desc' + (view.masked ? ' masked' : '');
    descLine.textContent = view.description;
    const tagLine = document.createElement('div');
    tagLine.className = 'row-tags';
    tagLine.appendChild(makeTag(trophy.grade.toUpperCase(), 'grade-' + trophy.grade));
    tagLine.appendChild(makeTag(trophy.kind));
    tagLine.appendChild(makeTag('Stage ' + trophy.stage));
    if (trophy.hidden) tagLine.appendChild(makeTag('hidden', 'hidden-tag'));
    if (trophy.missable) tagLine.appendChild(makeTag('⚑ MISSABLE', 'flag'));
    body.append(nameLine, descLine, tagLine);

    row.append(box, body);
    row.addEventListener('click', () => handlers.onSelect(trophy.id));
    host.appendChild(row);
  }
  document.getElementById('emptyState').hidden = visible.length > 0;
  document.getElementById('filterNote').textContent = describeCurrentView(state, visible.length);
  document.getElementById('checklistHeading').textContent =
    state.kind === 'all' && !state.stage && !state.search
      ? 'Checklist — all 55 trophies'
      : `Checklist — ${visible.length} trophies shown`;
}
