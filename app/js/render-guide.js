// Guide panel rendering: the selected trophy's official text, the atlas's own
// guide with steps, the missable warning when it applies, and the source it cites.
import { spoilerMask } from './filters.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function renderGuide(state, handlers) {
  const body = document.getElementById('guideBody');
  const trophy = state.trophies.find((t) => t.id === state.selectedId) || state.trophies[0];
  if (!trophy) {
    body.innerHTML = '<p class="guide-empty">No trophy data loaded yet.</p>';
    return;
  }
  const earned = state.earned.has(trophy.id);
  const view = spoilerMask(trophy, state.earned, state.spoiler);
  body.replaceChildren();

  const title = document.createElement('h3');
  title.className = 'guide-title';
  title.textContent = view.name;
  body.append(title);

  const official = document.createElement('p');
  official.className = 'guide-official';
  official.textContent = view.masked
    ? 'Official description hidden by the spoiler setting.'
    : `Official: “${trophy.description}”`;
  body.append(official);

  const badges = document.createElement('div');
  badges.className = 'guide-badges';
  const grade = document.createElement('span');
  grade.className = `grade-badge grade-${trophy.grade}`;
  grade.textContent = GRADE_LABEL[trophy.grade];
  badges.append(grade);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag missable-tag';
    flag.textContent = '⚑ MISSABLE — do this before Chapter 1 ends';
    badges.append(flag);
  }
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'tag';
    hidden.textContent = 'Hidden on PSN until earned';
    badges.append(hidden);
  }
  const stage = document.createElement('span');
  stage.className = 'tag kind-tag';
  stage.textContent = `Roadmap ${trophy.stage}`;
  badges.append(stage);
  body.append(badges);

  const source = document.createElement('div');
  source.className = 'guide-source';
  source.innerHTML = '<strong>Source: </strong>';
  const link = document.createElement('a');
  link.href = trophy.source.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = trophy.source.name;
  source.append(link);
  source.append(document.createTextNode(
    ' — names, descriptions, and grades are the official PS5 list via Exophase & PSNProfiles (18 Nov 2026).',
  ));
  body.append(source);

  if (trophy.missable) {
    const callout = document.createElement('div');
    callout.className = 'missable-callout';
    callout.innerHTML = '<strong>⚑ Missable — read this first.</strong> ';
    callout.append(document.createTextNode(
      'PowerPyx and GTABase both flag this as the list’s only possibly-missable trophy: ' +
      'the first meditation spot is offered at Jason’s house in Chapter 1 and is gone after ' +
      'that chapter. There is no mission replay, so do it during Chapter 1 — before moving on.',
    ));
    body.append(callout);
  }

  const how = document.createElement('h3');
  how.textContent = 'How to earn it';
  body.append(how);
  const text = document.createElement('div');
  text.className = 'guide-text';
  for (const para of trophy.guide.split('\n\n')) {
    const p = document.createElement('p');
    p.textContent = para;
    text.append(p);
  }
  body.append(text);

  if (trophy.steps && trophy.steps.length) {
    const stepsTitle = document.createElement('h3');
    stepsTitle.textContent = 'Steps';
    body.append(stepsTitle);
    const steps = document.createElement('ol');
    steps.className = 'guide-steps';
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.append(li);
    }
    body.append(steps);
  }

  if (trophy.unconfirmed) {
    const note = document.createElement('p');
    note.className = 'guide-text';
    note.innerHTML = '<strong>Unconfirmed at launch:</strong> ';
    note.append(document.createTextNode(
      'PowerPyx and GTABase both list this trophy’s method as not yet known (18 Nov 2026). ' +
      'The steps above are the atlas’s best reading of the official description — check the cited guide for updates as players confirm it.',
    ));
    body.append(note);
  }

  const nav = document.createElement('div');
  nav.className = 'guide-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'btn';
  prev.textContent = '← Previous trophy';
  prev.disabled = trophy.id <= 1;
  prev.addEventListener('click', () => handlers.onNavigate(trophy.id - 1));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'btn';
  next.textContent = 'Next trophy →';
  next.disabled = trophy.id >= state.trophies.length;
  next.addEventListener('click', () => handlers.onNavigate(trophy.id + 1));
  nav.append(prev, next);
  body.append(nav);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn gold earned-toggle';
  toggle.textContent = earned ? '✓ Earned — click to unmark' : 'Mark as earned';
  toggle.addEventListener('click', () => handlers.onToggleEarned(trophy.id));
  body.append(toggle);
}
