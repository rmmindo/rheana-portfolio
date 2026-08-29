// sync-content.mjs
// Copies the raysume-generated resume JSON into the web app.
//
// The generated file is committed rather than built in CI, so the site builds
// without a Python toolchain on the runner. Re-run this after any edit to
// ray-of-productivity/scripts/raysume/source/.
//
// Usage: node tools/sync-content.mjs [path-to-raysume-output]

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

const src = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(repoRoot, '../ray-of-productivity/scripts/raysume/output/rheana-mindo-resume-web.json');

if (!existsSync(src)) {
  console.error(`resume JSON not found at ${src}`);
  console.error('Build it first:  python raysume.py build web');
  process.exit(1);
}

const raw = await readFile(src, 'utf8');
const data = JSON.parse(raw);

// The web variant must never carry these. Asserted here as well as in the
// raysume test suite, because this is the last gate before the data reaches a
// public page and the cost of a leak is permanent.
const FORBIDDEN = [
  { label: 'phone number', re: /\+?63[)\s-]*9\d{2}[\s-]*\d{3}[\s-]*\d{4}/ },
  { label: 'city-level address', re: /cotabato/i },
];
for (const { label, re } of FORBIDDEN) {
  if (re.test(raw)) {
    console.error(`refusing to sync: ${label} present in ${src}`);
    console.error('Check contact_order and profile_overrides in web.variant.yaml.');
    process.exit(1);
  }
}

const dest = join(repoRoot, 'apps/web/src/content/resume.json');
await writeFile(dest, JSON.stringify(data, null, 2) + '\n');

const entries = data.sections.flatMap(s => s.entries ?? []).length;
console.log(`synced ${data.sections.length} sections, ${entries} entries -> apps/web/src/content/resume.json`);
