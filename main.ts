// Atlas Platinum Leonida — hand-in program for the rebuild (Node 22, standard
// library only). The entry is this repository's app/ folder: plain static
// files, opened at app/index.html in desktop Chrome, fully offline — it loads
// nothing over the network and keeps its data in app/data/trophies.json.
// This program copies app/ and screenshots/ into the output directory and
// writes dossier.json there with buildDossier from vendor/makefun-frontend.ts.
// The vendored library must stay byte-identical to the kit's copy: the scorer
// rebuilds the dossier with its own copy and compares them byte for byte.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Guard the one file the gate reads by name: app/data/trophies.json must parse
// and carry all 55 official trophies, each with a non-blank guide of its own.
// Failing here, loudly, beats an invalid entry at the scorer.
const trophyData = JSON.parse(readFileSync(join(outputDir, 'app', 'data', 'trophies.json'), 'utf8'));
const trophyList = Array.isArray(trophyData) ? trophyData : trophyData.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== 55) {
  throw new Error(`trophies.json must list exactly 55 trophies, found ${Array.isArray(trophyList) ? trophyList.length : 'none'}`);
}
for (const trophy of trophyList) {
  if (!trophy || typeof trophy.name !== 'string' || !trophy.name.trim()) throw new Error('a trophy is missing its official name');
  if (typeof trophy.guide !== 'string' || !trophy.guide.trim()) throw new Error(`trophy "${trophy.name}" has a blank guide`);
}

// Caps mirror the scorer's gate, so an entry the gate would refuse fails here
// first instead of at grading: at most 4 screenshots of 256 KiB each, at most
// 993 files and directories in app/, at most 48 MiB of app files in total.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
