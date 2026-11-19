// Leonida 55 — entry hand-in for make.fun gta6-trophy-guide-01.
//
// Copies app/ and screenshots/ from this repository into the output directory
// (MAKEFUN_OUTPUT_DIR, or /output) and writes /output/dossier.json with the
// kit's own buildDossier, so the dossier the scorer recomputes matches byte
// for byte. Deterministic: same input files, same dossier bytes.
//
//   MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Start from a clean output directory so a re-run cannot leave stale files.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of ['app', 'screenshots']) {
  cpSync(join(repoRoot, name), join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
