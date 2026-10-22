import { test } from '@playwright/test';
import { gate } from './helpers';

// §16.2 3D (Q19–Q22). M3 scope (Gate 3).

test('Q19: ?tier=high — cosmos + gallery canvases, keyboard, Lightbox, drag, vertical wheel scrolls', async () => {
  gate(3, '3D');
});

test('Q20: ?tier=low and --disable-webgl — no canvases, DOM gallery + Lightbox work', async () => {
  gate(3, 'fallbacks');
});

test('Q21: WEBGL_lose_context drops to the poster with no errors or broken layout', async () => {
  gate(3, 'context loss');
});

test('Q22: gallery colour fidelity — DOM vs 3D luminance < 6%', async () => {
  gate(3, 'colour fidelity');
});
