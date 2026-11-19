import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

// Never remove the output directory itself: in the grader /output is a
// mounted directory and rmSync on a mount point throws EBUSY. Empty only
// its contents, then rebuild from scratch.
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) rmSync(join(outDir, f), { recursive: true, force: true });

cpSync('app', join(outDir, 'app'), { recursive: true });
cpSync('screenshots', join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier ${dossier.length} bytes`);
