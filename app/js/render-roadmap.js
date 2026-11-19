// Roadmap: the six stages in play order, with their trophies, the map above
// them, and the per-stage progress that turns a stage gold when it is done.
import { buildAtlasMap } from './atlas-map.js';

export const ROADMAP_STAGES = [
  { id: 1, name: 'Landfall', span: 'Chapters 1–2', trophies: [2, 3, 4, 8], blurb: 'Gone Fishing · Ch. 1 · Ch. 2 · Breakfast Run' },
  { id: 2, name: 'Vice City Rising', span: 'Chapters 3–4', trophies: [5, 6, 9, 10, 11, 12, 13], blurb: 'Ch. 3 · Ch. 4 · heists & takedowns' },
  { id: 3, name: 'The Crew', span: 'Side characters', trophies: [22, 23, 24, 26, 27, 25], blurb: 'Andy · Kenton · Billy · Randy · Tyrone · strangers' },
  { id: 4, name: 'Leonida Playground', span: 'Activities', trophies: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32], blurb: 'Stunts · range · races · fishing · meditation' },
  { id: 5, name: 'Heat & Heists', span: 'Open world', trophies: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51], blurb: 'Partner · robberies · feats · one-offs' },
  { id: 6, name: 'Platinum Cleanup', span: 'Collectibles & 100%', trophies: [30, 31, 35, 42, 52, 53, 54, 55, 14, 7, 1], blurb: 'Cards · WAiNK · vehicles · 100% · platinum' },
];

export function renderRoadmap(state, handlers) {
  const mapEl = document.getElementById('roadmapMap');
  mapEl.innerHTML = buildAtlasMap(ROADMAP_STAGES, state.earned, state.stage);
  mapEl.querySelectorAll('.map-region').forEach((region) => {
    region.addEventListener('click', () => handlers.onStage(Number(region.dataset.stage)));
  });

  const list = document.getElementById('roadmapStages');
  list.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const done = stage.trophies.filter((id) => state.earned.has(id)).length;
    const li = document.createElement('li');
    if (state.stage === stage.id) li.classList.add('active');
    li.addEventListener('click', () => handlers.onStage(stage.id));

    const num = document.createElement('span');
    num.className = 'stage-num' + (done === stage.trophies.length ? ' done' : '');
    num.textContent = String(stage.id);
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'stage-name';
    name.textContent = `${stage.name} — ${stage.span}`;
    const blurb = document.createElement('div');
    blurb.className = 'stage-trophies';
    blurb.textContent = stage.blurb;
    body.append(name, blurb);
    const meta = document.createElement('span');
    meta.className = 'stage-meta';
    meta.textContent = `${done}/${stage.trophies.length}`;
    li.append(num, body, meta);
    list.append(li);
  }
}
