// Atlas Platinum Leonida — bootstrap: load the trophy list, read the view
// (URL deep-links), build the shared state, render every panel, wire controls.
import { loadTrophyList, loadEarned, saveEarned, exportProgress, importProgress, progressLink } from './js/trophy-store.js';
import { applyFilters, spoilerMask } from './js/filters.js';
import { renderChecklist } from './js/render-checklist.js';
import { renderRoadmap } from './js/render-roadmap.js';
import { renderGuide } from './js/render-guide.js';

// Demo progress used only by the ?view= deep-links (fresh profiles, screenshots):
// a plausible mid-run atlas — story chapters 1-2 done, a few activities banked.
export const DEMO_EARNED_IDS = [2, 3, 4, 8, 16, 17, 20, 28, 33, 35, 42, 52];
export const VIEW_PRESETS = {
  cover: { open: 1 },
  guide: { open: 28, kind: 'collectibles' },
  missable: { open: 28, kind: 'missable', spoiler: true },
  roadmap: { open: 14, stage: 6 },
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

function applyViewPreset(params) {
  const view = params.get('view');
  const preset = VIEW_PRESETS[view] || {};
  if (preset.kind) state.kind = preset.kind;
  if (preset.spoiler) state.spoiler = true;
  if (preset.stage) state.stage = preset.stage;
  if (preset.open) state.selectedId = Number(preset.open);
  if (params.get('filter')) state.kind = params.get('filter');
  if (params.get('spoiler') === 'on') state.spoiler = true;
  if (params.get('spoiler') === 'off') state.spoiler = false;
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('open')) state.selectedId = Number(params.get('open'));
  if (params.get('search')) state.search = params.get('search');
  // A shared progress link (?earned=2,3,4) merges into the saved set.
  if (params.get('earned')) {
    for (const raw of params.get('earned').split(',')) {
      const id = Number(raw);
      if (Number.isInteger(id)) state.earned.add(id);
    }
    saveEarned(state.earned);
  } else if (view && state.earned.size === 0) {
    // Screenshot deep-links show a lived-in atlas on a fresh profile.
    for (const id of DEMO_EARNED_IDS) state.earned.add(id);
    if (params.get('demo-save') === '1') saveEarned(state.earned);
  }
  return preset;
}

export function trophyById(id) {
  return state.trophies.find((t) => t.id === id);
}

export function refreshAll() {
  renderChecklist(state, { onSelect, onToggleEarned });
  renderRoadmap(state, { onStage });
  renderGuide(state, { onToggleEarned, onNavigate });
  updateProgress();
}

function onSelect(id) {
  state.selectedId = id;
  refreshAll();
}

function onToggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned(state.earned);
  refreshAll();
}

function onStage(stageId) {
  state.stage = state.stage === stageId ? null : stageId;
  if (state.stage !== null) state.kind = 'all';
  refreshAll();
}

function onNavigate(id) {
  state.selectedId = id;
  refreshAll();
  document.getElementById('guidePanel')?.scrollIntoView({ block: 'nearest' });
}

export function updateProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('ringPct').textContent = `${pct}%`;
  document.getElementById('ringFill').style.strokeDashoffset = String(326.7 * (1 - done / total));
  const byGrade = (g) => state.trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
  const ofGrade = (g) => state.trophies.filter((t) => t.grade === g).length;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${byGrade('platinum')}/${ofGrade('platinum')} · Gold ${byGrade('gold')}/${ofGrade('gold')} · Silver ${byGrade('silver')}/${ofGrade('silver')} · Bronze ${byGrade('bronze')}/${ofGrade('bronze')}`;
}

function wireControls() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.search = e.target.value;
    refreshAll();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    refreshAll();
  });
  document.getElementById('hideEarnedToggle').addEventListener('change', (e) => {
    state.hideEarned = e.target.checked;
    refreshAll();
  });
  document.getElementById('gradeSelect').addEventListener('change', (e) => {
    state.grade = e.target.value;
    refreshAll();
  });
  document.querySelectorAll('#filterChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      state.stage = null;
      refreshAll();
    });
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
  document.getElementById('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imported = await importProgress(file, state.trophies);
    if (imported) {
      state.earned = imported;
      saveEarned(state.earned);
      refreshAll();
    }
    e.target.value = '';
  });
  document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    const link = progressLink(state.earned);
    try {
      await navigator.clipboard.writeText(link);
      document.getElementById('copyLinkBtn').textContent = 'Link copied!';
      setTimeout(() => { document.getElementById('copyLinkBtn').textContent = 'Copy progress link'; }, 2000);
    } catch {
      prompt('Copy your progress link:', link);
    }
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies in this browser?')) return;
    state.earned = new Set();
    saveEarned(state.earned);
    refreshAll();
  });
}

async function bootAtlas() {
  state.trophies = await loadTrophyList();
  state.earned = loadEarned(state.trophies);
  const params = new URLSearchParams(location.search);
  const preset = applyViewPreset(params);
  document.getElementById('spoilerToggle').checked = state.spoiler;
  wireControls();
  refreshAll();
  const scrollTo = params.get('scrollto') || preset.scrollTo;
  if (scrollTo) {
    document.querySelector(`[data-trophy-id="${scrollTo}"]`)?.scrollIntoView({ block: 'center' });
  }
}

bootAtlas();
