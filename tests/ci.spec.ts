import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gate } from './helpers';

// §16.2 Q29 — CI readiness (+ M-03/M-04/M-19 file checks). Filesystem only.

const PROMPT = readFileSync('docs/BUILD-PROMPT.md', 'utf8');

/** The first fenced code block after `marker` in BUILD-PROMPT.md. */
function blockAfter(marker: string, lang: string): string {
  const at = PROMPT.indexOf(marker);
  expect(at, `marker "${marker}" in BUILD-PROMPT.md`).toBeGreaterThan(-1);
  const open = PROMPT.indexOf('```' + lang + '\n', at);
  const start = open + lang.length + 4;
  const end = PROMPT.indexOf('\n```', start);
  return PROMPT.slice(start, end + 1); // keep the final newline
}

const verbatim = (file: string, marker: string, lang: string) => {
  expect(existsSync(file), `${file} exists`).toBe(true);
  const actual = readFileSync(file, 'utf8');
  expect(actual, `${file} matches BUILD-PROMPT.md exactly`).toBe(blockAfter(marker, lang));
};

test.describe.configure({ mode: 'serial' });

test('Q29: package-lock.json has the four Linux native packages (§17 pitfall 28)', () => {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  for (const p of [
    'node_modules/@img/sharp-linux-x64',
    'node_modules/@tailwindcss/oxide-linux-x64-gnu',
    'node_modules/lightningcss-linux-x64-gnu',
    'node_modules/@next/swc-linux-x64-gnu',
  ]) {
    expect(lock.packages[p], p).toBeTruthy();
  }
});

test('Q29: deploy/htaccess-root matches §15.3', () => {
  verbatim('deploy/htaccess-root', '`deploy/htaccess-root`, copied to', 'apache');
});

test('Q29: deploy/htaccess-static matches §15.3', () => {
  verbatim('deploy/htaccess-static', '`deploy/htaccess-static`, copied to', 'apache');
});

test('Q29: scripts/prepare-deploy.mjs matches §15.4', () => {
  verbatim('scripts/prepare-deploy.mjs', '### 15.4 `scripts/prepare-deploy.mjs`', 'js');
});

test('Q29: .github/workflows/deploy.yml matches §15.2', () => {
  gate(4, 'deploy workflow is an M4 deliverable');
  verbatim('.github/workflows/deploy.yml', '### 15.2 `.github/workflows/deploy.yml`', 'yaml');
});

test('Q29: .nvmrc is 22 and .gitattributes is * text=auto eol=lf', () => {
  expect(readFileSync('.nvmrc', 'utf8').trim()).toBe('22');
  expect(readFileSync('.gitattributes', 'utf8').trim()).toBe('* text=auto eol=lf');
});

test('M-03: next.config.ts is §4.5 verbatim', () => {
  verbatim('next.config.ts', '`next.config.ts`, verbatim:', 'ts');
});

test('M-19: package.json scripts are §4.5 verbatim and cross-platform', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const want = JSON.parse(blockAfter('`package.json` scripts, all cross-platform:', 'json')).scripts;
  expect(pkg.scripts).toEqual(want);
  for (const [k, v] of Object.entries<string>(pkg.scripts)) {
    expect(v, k).not.toMatch(/\b(rm|cp|mv|bash|sh)\b|&&|\|\||;/);
  }
  // Exact pins (D-005), no TypeScript 7 / ESLint 10
  for (const [k, v] of Object.entries<string>({ ...pkg.dependencies, ...pkg.devDependencies })) {
    expect(v, `${k} pinned exactly`).toMatch(/^\d+\.\d+\.\d+$/);
  }
  expect(pkg.devDependencies.typescript).toMatch(/^5\./);
  expect(pkg.devDependencies.eslint).toMatch(/^9\./);
});

test('M-04: out/, .next/ and node_modules/ are not tracked by git', () => {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n');
  const bad = files.filter((f) => /^(out|\.next|node_modules|public\/_img)\//.test(f));
  expect(bad).toEqual([]);
  const ignore = readFileSync('.gitignore', 'utf8');
  for (const p of ['/out/', '/.next/', '/public/_img/', '/qa/', '/playwright-report/', '/test-results/', '/.lighthouseci/']) {
    expect(ignore, p).toContain(p);
  }
});

test('M-03: no forbidden static-export features in src/', () => {
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
  const hits: string[] = [];
  for (const f of walk('src').filter((p) => /\.(ts|tsx)$/.test(p))) {
    const src = readFileSync(f, 'utf8');
    for (const re of [/['"]use server['"]/, /from ['"]next\/headers['"]/, /export const revalidate/, /export const runtime/, /from ['"]next\/image['"]/]) {
      if (re.test(src)) hits.push(`${f}: ${re}`);
    }
  }
  expect(hits).toEqual([]);
  expect(existsSync('src/middleware.ts') || existsSync('middleware.ts')).toBe(false);
});
