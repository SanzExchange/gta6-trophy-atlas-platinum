// Atlas Platinum Leonida — retry build bootstrap.
// Loads the official trophy list, restores the progress saved in this
// browser, applies any ?view= deep link, renders the three atlas panels
// (roadmap chart, checklist, open guide) and wires every control. The ?view=
// presets open the atlas mid-journey in a fresh profile — they are also how
// the maker's screenshots show real, earned states instead of an empty book.
import { loadTrophyList, loadEarnedSet, saveEarnedSet, downloadProgressFile, readProgressFile, buildProgressLink } from './js/trophy-store.js';
import { renderChecklist } from './js/render-checklist.js';
import { renderRoadmap } from './js/render-roadmap.js';
import { renderGuide } from './js/render-guide.js';

export const DEMO_EARNED_IDS = [2, 3, 4, 8, 16, 20, 21, 29, 35, 42, 52, 53];
export const VIEW_PRESETS = {
  cover: { openGuideFor: 1 },
  guide: { openGuideFor: 28, kind: 'collectibles' },
  missable: { openGuideFor: 28, kind: 'missable', spoiler: true },
  roadmap: { openGuideFor: 14, stage: 'VI' },
};

export const atlasState = {
  trophies: [],
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  search: '',
  spoiler: false,
  hideEarned: false,
  stage: null,
  selectedId: 1,
};

const COMPASS_RING_CIRCUMFERENCE = 326.7;

export function renderProgressRing() {
  const total = atlasState.trophies.length || 55;
  const earnedCount = atlasState.earned.size;
  const percent = total ? Math.round((earnedCount / total) * 100) : 0;
  document.getElementById('ringFill').style.strokeDashoffset = String(COMPASS_RING_CIRCUMFERENCE * (1 - earnedCount / total));
  document.getElementById('ringPct').textContent = percent + '%';
  document.getElementById('progressText').textContent = `${earnedCount} of ${total} earned`;
  const earnedOfGrade = (grade) => atlasState.trophies.filter((t) => t.grade === grade && atlasState.earned.has(t.id)).length;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${earnedOfGrade('platinum')}/1 · Gold ${earnedOfGrade('gold')}/2 · Silver ${earnedOfGrade('silver')}/6 · Bronze ${earnedOfGrade('bronze')}/46`;
}

export function renderAtlas() {
  renderProgressRing();
  renderRoadmap(atlasState, (stageKey) => { atlasState.stage = stageKey; renderAtlas(); });
  renderChecklist(atlasState, {
    onToggle: (id) => {
      if (atlasState.earned.has(id)) atlasState.earned.delete(id); else atlasState.earned.add(id);
      saveEarnedSet(atlasState.earned);
      renderAtlas();
    },
    onSelect: (id) => { atlasState.selectedId = id; renderAtlas(); },
  });
  renderGuide(atlasState);
  document.querySelectorAll('#filterChips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === atlasState.kind);
  });
  document.getElementById('spoilerToggle').checked = atlasState.spoiler;
}

function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const preset = VIEW_PRESETS[params.get('view')] || {};
  if (preset.kind) atlasState.kind = preset.kind;
  if (preset.spoiler) atlasState.spoiler = true;
  if (preset.stage) atlasState.stage = preset.stage;
  if (preset.openGuideFor) atlasState.selectedId = preset.openGuideFor;
  if (params.get('view')) {
    for (const id of DEMO_EARNED_IDS) atlasState.earned.add(id);
    saveEarnedSet(atlasState.earned);
  }
  if (params.get('filter')) atlasState.kind = params.get('filter');
  if (params.get('spoiler') === 'on') atlasState.spoiler = true;
  if (params.get('grade')) atlasState.grade = params.get('grade');
  if (params.get('open')) atlasState.selectedId = Number(params.get('open'));
  if (params.get('earned')) {
    for (const rawId of params.get('earned').split(',')) {
      const id = Number(rawId);
      if (Number.isInteger(id)) atlasState.earned.add(id);
    }
    saveEarnedSet(atlasState.earned);
  }
}

function wireAtlasControls() {
  document.getElementById('filterChips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    atlasState.kind = chip.dataset.kind;
    renderAtlas();
  });
  document.getElementById('searchInput').addEventListener('input', (event) => { atlasState.search = event.target.value; renderAtlas(); });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => { atlasState.spoiler = event.target.checked; renderAtlas(); });
  document.getElementById('hideEarnedToggle').addEventListener('change', (event) => { atlasState.hideEarned = event.target.checked; renderAtlas(); });
  document.getElementById('gradeSelect').addEventListener('change', (event) => { atlasState.grade = event.target.value; renderAtlas(); });
  document.getElementById('exportBtn').addEventListener('click', () => downloadProgressFile(atlasState.earned));
  document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(buildProgressLink(atlasState.earned)); } catch { /* clipboard unavailable in this browser */ }
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    atlasState.earned = new Set();
    saveEarnedSet(atlasState.earned);
    renderAtlas();
  });
  document.getElementById('importInput').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      atlasState.earned = await readProgressFile(file);
      saveEarnedSet(atlasState.earned);
      renderAtlas();
    } catch { /* unreadable file: keep the current progress untouched */ }
    event.target.value = '';
  });
}

async function bootAtlas() {
  atlasState.trophies = await loadTrophyList();
  atlasState.earned = loadEarnedSet();
  applyDeepLink();
  wireAtlasControls();
  renderAtlas();
}

bootAtlas();
