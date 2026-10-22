// Image pipeline (BUILD-PROMPT §14). Runs before `dev` and `build`.
// Source of truth: public/images/*.{jpg,jpeg,png,webp} (replace a photo by uploading
// a file with the same name). Output (gitignored): public/_img/
//   <name>-<w>.avif / .webp for w in WIDTHS that fit the source, og.jpg, manifest.json
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SRC = join('public', 'images');
const OUT = join('public', '_img');
const WIDTHS = [480, 800, 1200, 1600];
const OG_SOURCE = 'wale-hero.jpg';

const isNewer = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

async function main() {
  if (!existsSync(SRC)) {
    console.log('optimize-images: public/images not found, nothing to do.');
    return;
  }
  const files = readdirSync(SRC)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  if (files.length === 0) {
    console.log('optimize-images: public/images is empty, nothing to do.');
    return;
  }
  mkdirSync(OUT, { recursive: true });

  const manifest = {};
  let written = 0;
  let skipped = 0;

  for (const file of files) {
    const src = join(SRC, file);
    const { name } = parse(file);
    const meta = await sharp(src).rotate().metadata();
    // Account for EXIF orientation: rotated images swap width and height.
    const swap = (meta.orientation ?? 1) >= 5;
    const width = swap ? meta.height : meta.width;
    const height = swap ? meta.width : meta.height;
    if (!width || !height) throw new Error(`cannot read dimensions of ${src}`);

    let widths = WIDTHS.filter((w) => w <= width);
    if (widths.length === 0) widths = [width];

    const avif = [];
    const webp = [];
    for (const w of widths) {
      const base = `${name}-${w}`;
      const avifOut = join(OUT, `${base}.avif`);
      const webpOut = join(OUT, `${base}.webp`);
      if (isNewer(avifOut, src)) skipped++;
      else {
        await sharp(src).rotate().resize({ width: w }).avif({ quality: 50, effort: 4 }).toFile(avifOut);
        written++;
      }
      if (isNewer(webpOut, src)) skipped++;
      else {
        await sharp(src).rotate().resize({ width: w }).webp({ quality: 72 }).toFile(webpOut);
        written++;
      }
      avif.push(`/_img/${base}.avif ${w}w`);
      webp.push(`/_img/${base}.webp ${w}w`);
    }

    manifest[file] = {
      width,
      height,
      avif: avif.join(', '),
      webp: webp.join(', '),
      src: `/images/${file}`,
    };
  }

  // Open Graph image: 1200x630 on #0A090B, hero fitted to full height on the right,
  // 1px brass hairline frame inset 24px. No text.
  const ogSrc = join(SRC, OG_SOURCE);
  const ogOut = join(OUT, 'og.jpg');
  if (existsSync(ogSrc)) {
    if (isNewer(ogOut, ogSrc)) skipped++;
    else {
      const W = 1200;
      const H = 630;
      const hero = await sharp(ogSrc).rotate().resize({ height: H }).toBuffer({ resolveWithObject: true });
      const heroW = Math.min(hero.info.width, Math.round(W / 3) + 120);
      const heroBuf = await sharp(hero.data).resize({ width: heroW, height: H, fit: 'cover' }).toBuffer();
      const frame = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
          `<rect x="24.5" y="24.5" width="${W - 49}" height="${H - 49}" fill="none" stroke="#D4A64A" stroke-opacity="0.7" stroke-width="1"/>` +
          `</svg>`,
      );
      await sharp({ create: { width: W, height: H, channels: 3, background: '#0A090B' } })
        .composite([
          { input: heroBuf, left: W - heroW, top: 0 },
          { input: frame, left: 0, top: 0 },
        ])
        .jpeg({ quality: 82 })
        .toFile(ogOut);
      written++;
    }
  }

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `optimize-images: ${files.length} images, ${written} files updated, ${skipped} up to date → public/_img/`,
  );
}

main().catch((err) => {
  console.error('optimize-images: failed:', err?.message ?? err);
  process.exit(1);
});
