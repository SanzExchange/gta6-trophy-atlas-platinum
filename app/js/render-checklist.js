// Checklist rendering for the rebuild: one row per trophy with its earned
// checkbox, official name and description, grade chip, kind, stage and the
// red missable flag. Spoiler-safe rows mask story trophies until earned.
import { applyFilters, spoilerMask, filterNoteText } from './filters.js';

function tag(text, cls) {
  const s = document.createElement('span');
  s.className = 'tag' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

export function renderChecklist(state, handlers) {
  const rows = applyFilters(state);
  const host = document.getElementById('trophyRows');
  host.innerHTML = '';
  for (const trophy of rows) {
    const view = spoilerMask(trophy, state);
    const row = document.createElement('div');
    row.className = 'trophy-row' + (state.earned.has(trophy.id) ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (ev) => ev.stopPropagation());
    box.addEventListener('change', () => handlers.onToggle(trophy.id));
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'row-name' + (view.masked ? ' masked' : '');
    name.textContent = view.name;
    const desc = document.createElement('div');
    desc.className = 'row-desc' + (view.masked ? ' masked' : '');
    desc.textContent = view.description;
    const tags = document.createElement('div');
    tags.className = 'row-tags';
    tags.appendChild(tag(trophy.grade.toUpperCase(), 'grade-' + trophy.grade));
    tags.appendChild(tag(trophy.kind));
    tags.appendChild(tag('Stage ' + trophy.stage));
    if (trophy.hidden) tags.appendChild(tag('hidden', 'hidden-tag'));
    if (trophy.missable) tags.appendChild(tag('⚑ MISSABLE', 'flag'));
    body.append(name, desc, tags);
    row.append(box, body);
    row.addEventListener('click', () => handlers.onSelect(trophy.id));
    host.appendChild(row);
  }
  document.getElementById('emptyState').hidden = rows.length > 0;
  document.getElementById('filterNote').textContent = filterNoteText(state, rows.length);
  document.getElementById('checklistHeading').textContent =
    state.kind === 'all' && !state.stage ? 'Checklist — all 55 trophies' : `Checklist — ${rows.length} shown`;
}
