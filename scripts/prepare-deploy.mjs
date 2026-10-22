// Runs after `npm run build`. Adds the Hostinger .htaccess files to out/
// and fails loudly if the export is incomplete. Used by CI and by QA.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const WHATSAPP = 'wa.me/2347040149133';
const fail = (msg) => { console.error(`prepare-deploy: ${msg}`); process.exit(1); };

if (!existsSync(OUT)) fail('out/ not found. Run `npm run build` first.');

copyFileSync(join('deploy', 'htaccess-root'), join(OUT, '.htaccess'));
mkdirSync(join(OUT, '_next', 'static'), { recursive: true });
copyFileSync(join('deploy', 'htaccess-static'), join(OUT, '_next', 'static', '.htaccess'));

const required = [
  'index.html', '404.html', '.htaccess', '_next/static/.htaccess',
  'robots.txt', 'sitemap.xml', '_img/og.jpg', 'images/wale-hero.jpg',
];
const missing = required.filter((f) => !existsSync(join(OUT, f)));
if (missing.length) fail(`missing from out/: ${missing.join(', ')}`);

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const forbidden = ['/_blob/', 'localhost:', '127.0.0.1'];
for (const file of walk(OUT).filter((p) => p.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const hit = forbidden.find((s) => html.includes(s));
  if (hit) fail(`${file} contains "${hit}"`);
}

const index = readFileSync(join(OUT, 'index.html'), 'utf8');
if (!index.includes(WHATSAPP)) fail(`index.html has no ${WHATSAPP} link`);

const placeholders = index.match(/\[[^\]<>]{1,80}\]/g) ?? [];
console.log(`prepare-deploy: out/ is ready for Hostinger (${placeholders.length} [placeholder] strings still on the page).`);
