// Bundle budgets (PLAN §8, OQ-1/OQ-3). Run after `npm run build`:
//   node scripts/bundle-report.mjs           → prints the report
//   node scripts/bundle-report.mjs --check   → also exits 1 when a budget is exceeded
//
// first-load = gzipped size of every <script src> referenced by out/index.html (≤ 200 KB)
// 3D         = chunks containing three.js / R3F code (≤ 380 KB, Gate 3)
// deferred   = every other chunk the home page can load later (≤ 150 KB)
// Chunks referenced only by out/404.html are reported separately and not budgeted.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const OUT = 'out';
const CHUNKS = join(OUT, '_next', 'static', 'chunks');
const BUDGET = { firstLoad: 200, deferred: 150, three: 380 };
const check = process.argv.includes('--check');

if (!existsSync(join(OUT, 'index.html'))) {
  console.error('bundle-report: out/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));

const scriptsIn = (html) =>
  new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => join(OUT, decodeURIComponent(m[1]).replace(/^\//, ''))));

const index = readFileSync(join(OUT, 'index.html'), 'utf8');
const initial = scriptsIn(index);
const notFound = existsSync(join(OUT, '404.html')) ? scriptsIn(readFileSync(join(OUT, '404.html'), 'utf8')) : new Set();

const kb = (bytes) => bytes / 1024;
const rows = { firstLoad: [], deferred: [], three: [], notFoundOnly: [] };

for (const file of walk(CHUNKS).filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(file);
  const gz = gzipSync(src, { level: 9 }).length;
  const text = src.toString('utf8');
  const name = file.replace(`${OUT}/`, '');
  if (initial.has(file)) rows.firstLoad.push([name, gz]);
  else if (/WebGLRenderer|WebGL2RenderingContext|@react-three/.test(text)) rows.three.push([name, gz]);
  else if (notFound.has(file)) rows.notFoundOnly.push([name, gz]);
  else rows.deferred.push([name, gz]);
}

const total = (list) => list.reduce((s, [, gz]) => s + gz, 0);
let failed = false;
const section = (title, list, budget) => {
  const t = kb(total(list));
  const over = budget != null && t > budget;
  if (over) failed = true;
  console.log(`\n${title}: ${t.toFixed(1)} KB gz${budget != null ? ` (budget ${budget} KB) ${over ? 'OVER' : 'ok'}` : ''}`);
  for (const [name, gz] of list.sort((a, b) => b[1] - a[1])) console.log(`  ${kb(gz).toFixed(1).padStart(7)} KB  ${name}`);
};

console.log('bundle-report (gzip -9)');
section('First-load JS (scripts in out/index.html)', rows.firstLoad, BUDGET.firstLoad);
section('Deferred chunks (idle / on intent)', rows.deferred, BUDGET.deferred);
section('3D chunks', rows.three, BUDGET.three);
if (rows.notFoundOnly.length) section('404-only chunks (not budgeted)', rows.notFoundOnly);

if (check && failed) {
  console.error('\nbundle-report: budget exceeded.');
  process.exit(1);
}
