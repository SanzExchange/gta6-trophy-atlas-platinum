// Checklist rendering: one row per trophy — checkbox, grade badge, official name
// and description, kind + missable tags, and a link into the guide panel.
import { applyFilters, spoilerMask, filterNoteText } from './filters.js';

const GRADE_LABEL = { platinum: 'Plat', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', meta: 'Platinum' };

export function renderChecklist(state, handlers) {
  const rowsEl = document.getElementById('trophyRows');
  const shown = applyFilters(state.trophies, state);
  rowsEl.replaceChildren();
  for (const trophy of shown) {
    rowsEl.append(buildTrophyRow(state, trophy, handlers));
  }
  document.getElementById('emptyState').hidden = shown.length > 0;
  document.getElementById('filterNote').textContent = filterNoteText(state, shown.length, state.trophies.length);
  document.querySelectorAll('#filterChips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  });
  document.getElementById('checklistHeading').textContent =
    state.stage !== null ? `Checklist — roadmap stage ${state.stage}` : 'Checklist — every trophy';
}

function buildTrophyRow(state, trophy, handlers) {
  const earned = state.earned.has(trophy.id);
  const view = spoilerMask(trophy, state.earned, state.spoiler);
  const row = document.createElement('div');
  row.className = 'trophy-row' + (earned ? ' earned-row' : '') + (state.selectedId === trophy.id ? ' selected' : '');
  row.dataset.trophyId = String(trophy.id);
  row.setAttribute('role', 'button');
  row.tabIndex = 0;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => handlers.onToggleEarned(trophy.id));

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = GRADE_LABEL[trophy.grade];

  const main = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = view.name;
  if (trophy.hidden) {
    const mark = document.createElement('span');
    mark.className = 'hidden-mark';
    mark.textContent = ' · hidden on PSN';
    name.append(mark);
  }
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = view.description;
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag kind-tag';
  kindTag.textContent = KIND_LABEL[trophy.kind] || trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag missable-tag';
    flag.textContent = '⚑ MISSABLE';
    tags.append(flag);
  }
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = `Roadmap ${trophy.stage}`;
  tags.append(stageTag);
  main.append(name, desc, tags);

  const link = document.createElement('span');
  link.className = 'guide-link';
  link.textContent = 'Guide →';

  const open = () => handlers.onSelect(trophy.id);
  row.addEventListener('click', open);
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

  row.append(box, badge, main, link);
  return row;
}
