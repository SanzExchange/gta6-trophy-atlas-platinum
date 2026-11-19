// Atlas Platinum Leonida — rebuild bootstrap. Loads the trophy list, restores
// saved progress, applies any ?view= deep-link, renders the three panels and
// wires every control. The ?view= presets exist so a fresh profile can open
// the atlas mid-journey (and so the maker's screenshots show real states).
import { loadTrophyList, loadEarned, saveEarned, exportProgress, importProgress, progressLink } from './js/trophy-store.js';
import { renderChecklist } from './js/render-checklist.js';
import { renderRoadmap } from './js/render-roadmap.js';
import { renderGuide } from './js/render-guide.js';

export const DEMO_EARNED_IDS = [2, 3, 4, 8, 16, 20, 21, 29, 35, 42, 52, 53];
export const VIEW_PRESETS = {
  cover: { open: 1 },
  guide: { open: 28, kind: 'collectibles' },
  missable: { open: 28, kind: 'missable', spoiler: true },
  roadmap: { open: 14, stage: 'VI' },
};

export const state = {
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

const RING_CIRCUMFERENCE = 326.7;

export function renderProgress() {
  const total = state.trophies.length || 55;
  const n = state.earned.size;
  const pct = total ? Math.round((n / total) * 100) : 0;
  document.getElementById('ringFill').style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - n / total));
  document.getElementById('ringPct').textContent = pct + '%';
  document.getElementById('progressText').textContent = `${n} of ${total} earned`;
  const count = (g) => state.trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${count('platinum')}/1 · Gold ${count('gold')}/2 · Silver ${count('silver')}/6 · Bronze ${count('bronze')}/46`;
}

export function renderAll() {
  renderProgress();
  renderRoadmap(state, (stageKey) => { state.stage = stageKey; renderAll(); });
  renderChecklist(state, {
    onToggle: (id) => {
      if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
      saveEarned(state.earned);
      renderAll();
    },
    onSelect: (id) => { state.selectedId = id; renderAll(); },
  });
  renderGuide(state);
  document.querySelectorAll('#filterChips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  });
  document.getElementById('spoilerToggle').checked = state.spoiler;
}

function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const preset = VIEW_PRESETS[params.get('view')] || {};
  if (preset.kind) state.kind = preset.kind;
  if (preset.spoiler) state.spoiler = true;
  if (preset.stage) state.stage = preset.stage;
  if (preset.open) state.selectedId = preset.open;
  if (params.get('view')) {
    for (const id of DEMO_EARNED_IDS) state.earned.add(id);
    saveEarned(state.earned);
  }
  if (params.get('filter')) state.kind = params.get('filter');
  if (params.get('spoiler') === 'on') state.spoiler = true;
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('open')) state.selectedId = Number(params.get('open'));
  if (params.get('earned')) {
    for (const raw of params.get('earned').split(',')) {
      const id = Number(raw);
      if (Number.isInteger(id)) state.earned.add(id);
    }
    saveEarned(state.earned);
  }
}

function wireControls() {
  document.getElementById('filterChips').addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-kind]');
    if (!chip) return;
    state.kind = chip.dataset.kind;
    renderAll();
  });
  document.getElementById('searchInput').addEventListener('input', (ev) => { state.search = ev.target.value; renderAll(); });
  document.getElementById('spoilerToggle').addEventListener('change', (ev) => { state.spoiler = ev.target.checked; renderAll(); });
  document.getElementById('hideEarnedToggle').addEventListener('change', (ev) => { state.hideEarned = ev.target.checked; renderAll(); });
  document.getElementById('gradeSelect').addEventListener('change', (ev) => { state.grade = ev.target.value; renderAll(); });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
  document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(progressLink(state.earned)); } catch { /* clipboard unavailable */ }
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.earned = new Set();
    saveEarned(state.earned);
    renderAll();
  });
  document.getElementById('importInput').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      state.earned = await importProgress(file);
      saveEarned(state.earned);
      renderAll();
    } catch { /* unreadable file: keep current progress */ }
    ev.target.value = '';
  });
}

async function boot() {
  state.trophies = await loadTrophyList();
  state.earned = loadEarned();
  applyDeepLink();
  wireControls();
  renderAll();
}

boot();
