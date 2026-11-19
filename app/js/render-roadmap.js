// Roadmap — Atlas Platinum Leonida (retry build).
// Six stages in the order to travel them; the stage keys match the "stage"
// field of every trophy in app/data/trophies.json, and each stage owns the
// trophy ids listed here. Selecting a stage card filters the checklist to
// that leg of the journey.
export const ROADMAP_STAGES = [
  { key: 'I', name: 'First Landfall', desc: 'Chapters 1–2 and the opening missions. Meditate at Jason\u2019s house before Chapter 1 ends — the single missable step on the entire chart lives here.', ids: [2, 3, 4, 8] },
  { key: 'II', name: 'The Rising Route', desc: 'Chapters 3–4 and the mid-story set pieces: the cartel heist, the VCIA takedown, Operation Savage Glory.', ids: [5, 6, 9, 10, 11, 12, 13] },
  { key: 'III', name: 'Strand Country', desc: 'The side-character strands. Eight finished strands pay the Strangers & Freaks silver; the five named finals each pay a bronze of their own.', ids: [22, 23, 24, 25, 26, 27] },
  { key: 'IV', name: 'Fairgrounds & Wilds', desc: 'The activities sampler and the open-world counts: 250 stunts, 42 range golds, drone races, fishing — plus every meditation spot behind the ⚑ missable flag.', ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32] },
  { key: 'V', name: 'Feats & Felonies', desc: 'Partner feats and the robbery line: shops back-to-back, five bank vaults, armoured trucks, one operation per gang, and the hidden free-roam oddities.', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
  { key: 'VI', name: 'The Platinum Meridian', desc: 'The finale, the 100% gold, card sets, 100 vehicles, every garage, the laundering and spending totals — the cleanup sweep that closes the atlas.', ids: [1, 7, 14, 30, 31, 35, 42, 52, 53, 54, 55] },
];

import { buildAtlasMap } from './atlas-map.js';

export function stageOfTrophy(trophy) {
  return ROADMAP_STAGES.find((stage) => stage.key === trophy.stage) || null;
}

export function renderRoadmap(state, onStageSelect) {
  document.getElementById('roadmapMap').innerHTML = buildAtlasMap(ROADMAP_STAGES, state.earned, state.stage);
  const listHost = document.getElementById('roadmapStages');
  listHost.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const earnedCount = stage.ids.filter((id) => state.earned.has(id)).length;
    const card = document.createElement('li');
    card.className = 'stage-card'
      + (state.stage === stage.key ? ' active' : '')
      + (earnedCount === stage.ids.length ? ' done' : '');
    const head = document.createElement('div');
    head.className = 'stage-head';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'stage-name';
    nameSpan.textContent = `Stage ${stage.key} — ${stage.name}`;
    const countSpan = document.createElement('span');
    countSpan.className = 'stage-count';
    countSpan.textContent = `${earnedCount}/${stage.ids.length} earned`;
    head.append(nameSpan, countSpan);
    const descPara = document.createElement('p');
    descPara.className = 'stage-desc';
    descPara.textContent = stage.desc;
    card.append(head, descPara);
    card.addEventListener('click', () => onStageSelect(state.stage === stage.key ? null : stage.key));
    listHost.appendChild(card);
  }
}
