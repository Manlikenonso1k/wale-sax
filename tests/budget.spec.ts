import { test } from '@playwright/test';
import { gate } from './helpers';

// BUD (PLAN §8, OQ-1/OQ-3): node scripts/bundle-report.mjs --check — Gate 2 (first-load +
// deferred) and Gate 3 (3D). The script is an M2 deliverable.
test('BUD: bundle budgets (first-load ≤ 200 KB gz, deferred ≤ 150 KB, 3D ≤ 380 KB)', async () => {
  gate(2, 'bundle-report.mjs');
});
