# Wale — Live Saxophonist (Ajah, Lagos)

Landing page for Wale, a saxophonist who performs at homes, halls and hotels anywhere in Lagos. Every booking button, and the floating WhatsApp button bottom-right, opens a chat with **0903 603 3056** with a pre-filled message asking for date, location and occasion.

Plain static site: one `index.html` and an `images/` folder. No build step.

## Replace the images

Drop new photos into `images/` using the **same file names**:

| File | Where it shows | Shape |
| --- | --- | --- |
| `wale-hero.jpg` | Hero (real photo, Efizzy Studios) | 1200×1553 portrait |
| `wale-sax-detail.jpg` | "Based in Ajah. Plays anywhere." | 4:5 portrait |
| `occ-weddings.jpg` | Occasions: Weddings | 4:5 portrait |
| `occ-birthdays.jpg` | Occasions: Birthdays & surprises | 4:5 portrait |
| `occ-proposals.jpg` | Occasions: Proposals & anniversaries | 4:5 portrait |
| `occ-dinners.jpg` | Occasions: Dinners, launches & lounges | 4:5 portrait |
| `gal-video.jpg` | Watch: video poster | 16:9 landscape |
| `gal-1.jpg` – `gal-4.jpg` | Watch: photo grid | 1:1 square |

Keep photos under ~300 KB each (export at 80% JPEG quality) so the page loads fast on mobile data.

## Fill in the placeholders

Search `index.html` for `[` to find every bracketed placeholder:

- `[00]+` events played and `[0] years` on stage (hero)
- Client quotes, names and events (one big quote + three cards)
- `[@handle]` Instagram (Watch section and footer); change those links' `href` too
- The video link: the big video tile and "More on Instagram" point at `#watch`, so swap in the real Instagram/YouTube URL
- FAQ: optional starting price, and whether Wale brings his own sound
- The genre chips under "He plays", trimmed to what he actually plays

## Change the WhatsApp number or colours

- **WhatsApp**: search for `wa.me/2349036033056` and `tel:+2349036033056` and replace the number in international format (no `+`, no leading `0`).
- **Accent colour**: edit `--accent` at the top of the `<style>` block.
- **Pinstripes**: set `--stripes` to `none` to turn them off.

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from `main`, root), Netlify, Vercel, or upload the folder to Hostinger's `public_html`.
