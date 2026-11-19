// Roadmap data for the rebuild: six stages in travel order. Each stage owns a
// set of trophy ids; the stage keys match the "stage" field in trophies.json.
export const ROADMAP_STAGES = [
  { key: 'I', name: 'First Landfall', desc: 'Chapters 1–2 and the opening missions. Meditate at Jason\u2019s house before Chapter 1 ends — the one missable step on the whole chart.', ids: [2, 3, 4, 8] },
  { key: 'II', name: 'The Rising Route', desc: 'Chapters 3–4 and the mid-story set pieces: the cartel heist, VCIA takedown, Operation Savage Glory.', ids: [5, 6, 9, 10, 11, 12, 13] },
  { key: 'III', name: 'Strand Country', desc: 'The side-character strands. Finish eight strands for the Strangers & Freaks silver; the five named finals each pay a bronze.', ids: [22, 23, 24, 25, 26, 27] },
  { key: 'IV', name: 'Fairgrounds & Wilds', desc: 'Activities sampler and the open-world grinds: 250 stunts, 42 range golds, drone races, fishing — plus every meditation spot for the missable ⚑.', ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32] },
  { key: 'V', name: 'Feats & Felonies', desc: 'Partner feats and the robbery line: shops, vaults, armoured trucks, gang operations, and the hidden free-roam oddities.', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
  { key: 'VI', name: 'The Platinum Meridian', desc: 'Finale, 100% completion gold, card sets, garages, laundering and spending — the cleanup sweep that closes the atlas.', ids: [1, 7, 14, 30, 31, 35, 42, 52, 53, 54, 55] },
];

import { buildAtlasMap } from './atlas-map.js';

export function stageOf(trophy) {
  return ROADMAP_STAGES.find((s) => s.key === trophy.stage) || null;
}

export function renderRoadmap(state, onStageSelect) {
  const mapHost = document.getElementById('roadmapMap');
  mapHost.innerHTML = buildAtlasMap(ROADMAP_STAGES, state.earned, state.stage);
  const list = document.getElementById('roadmapStages');
  list.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const done = stage.ids.filter((id) => state.earned.has(id)).length;
    const li = document.createElement('li');
    li.className = 'stage-card' + (state.stage === stage.key ? ' active' : '') + (done === stage.ids.length ? ' done' : '');
    li.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'stage-head';
    const name = document.createElement('span');
    name.className = 'stage-name';
    name.textContent = `Stage ${stage.key} — ${stage.name}`;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done}/${stage.ids.length} earned`;
    head.append(name, count);
    const desc = document.createElement('p');
    desc.className = 'stage-desc';
    desc.textContent = stage.desc;
    li.append(head, desc);
    li.addEventListener('click', () => onStageSelect(state.stage === stage.key ? null : stage.key));
    list.appendChild(li);
  }
}
