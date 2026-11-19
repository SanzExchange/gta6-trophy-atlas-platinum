// Atlas Platinum Leonida — Peta Perjalanan 55 Trophy.
// Hand-in program, Node 22 standard library only.
//
// What this entry is: a static, offline atlas of the 55 PlayStation 5
// trophies of Grand Theft Auto VI. The whole guide lives under app/ as plain
// files — app/index.html opens it in desktop Chrome with the network off, its
// data sits in app/data/trophies.json, and nothing it shows is fetched.
//
// What this program does: copy app/ and screenshots/ from this repository
// into the output directory, verify the trophy data the gate reads by name,
// then write dossier.json there with buildDossier from
// vendor/makefun-frontend.ts. The vendored file stays byte-identical to the
// kit's copy because the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

export function copyEntryIntoOutput() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  }
}

export function readTrophyListFromOutput() {
  const parsed = JSON.parse(readFileSync(join(outputDir, 'app', 'data', 'trophies.json'), 'utf8'));
  return Array.isArray(parsed) ? parsed : parsed.trophies;
}

// The gate reads app/data/trophies.json by name and compares it against the
// official list, so fail loudly here — before grading — if the atlas data is
// short, if any trophy lost the guide written for it, if a guide lost the
// named source it must cite, or if the official shape of the list (grade
// mix, 28 hidden, exactly one missable, ids 1–55 without repeats) drifted.
export function assertAtlasDataComplete(trophyList) {
  if (!Array.isArray(trophyList) || trophyList.length !== 55) {
    throw new Error(`trophies.json must hold exactly 55 trophies, found ${Array.isArray(trophyList) ? trophyList.length : 'none'}`);
  }
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const seenIds = new Set();
  let hiddenCount = 0;
  let missableCount = 0;
  for (const trophy of trophyList) {
    if (!trophy || typeof trophy.name !== 'string' || !trophy.name.trim()) {
      throw new Error('a trophy is missing its official name');
    }
    if (typeof trophy.guide !== 'string' || !trophy.guide.trim()) {
      throw new Error(`trophy "${trophy.name}" has an empty guide`);
    }
    if (!trophy.source || typeof trophy.source.name !== 'string' || !trophy.source.name.trim()) {
      throw new Error(`trophy "${trophy.name}" cites no named source for its guide`);
    }
    if (!Number.isInteger(trophy.id) || trophy.id < 1 || trophy.id > 55 || seenIds.has(trophy.id)) {
      throw new Error(`trophy "${trophy.name}" has a missing, out-of-range or repeated id`);
    }
    seenIds.add(trophy.id);
    if (trophy.grade in grades) grades[trophy.grade] += 1;
    if (trophy.hidden === true) hiddenCount += 1;
    if (trophy.missable === true) missableCount += 1;
  }
  if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
    throw new Error(`grade mix must be 1 platinum, 2 gold, 6 silver, 46 bronze; found ${JSON.stringify(grades)}`);
  }
  if (hiddenCount !== 28) {
    throw new Error(`the official list has exactly 28 hidden trophies; found ${hiddenCount}`);
  }
  if (missableCount !== 1) {
    throw new Error(`the official list has exactly 1 missable trophy; found ${missableCount}`);
  }
}

copyEntryIntoOutput();
assertAtlasDataComplete(readTrophyListFromOutput());

// The caps below mirror the scorer's gate, so an entry the gate would refuse
// fails in this program first: at most 4 screenshots of 256 KiB each, at most
// 993 files and directories under app/, at most 48 MiB of app files in total.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
