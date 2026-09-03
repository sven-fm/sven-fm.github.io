/* ============================================================================
   sven.fm — asset renderer
   ----------------------------------------------------------------------------
   Rasterises the two templates in this folder into the shipped image assets:

     og.html    -> assets/og.jpg                       1200x630, q88
     icon.html  -> favicon.ico                         16, 32, 48
                   assets/favicon-16x16.png
                   assets/favicon-32x32.png
                   assets/icon-192.png
                   assets/icon-512.png
                   apple-touch-icon.png                180

   Everything is rendered at 4x and downsampled, so the type stays crisp at
   16px. Run from the repo root with a static server on :8765 —

     python3 -m http.server 8765 &
     node design-system/render-assets.mjs

   Requires Pillow (the .ico container) and playwright. If playwright isn't
   installed in this repo, point the PLAYWRIGHT env var at any copy of it:

     npm i playwright          # or set PLAYWRIGHT to an existing install:
     PLAYWRIGHT="$(npm root)/playwright" node design-system/render-assets.mjs

   ICON_VARIANT=pine renders the inverted mark instead of the shipped brass one.
   ========================================================================== */
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'http://localhost:8765';
const OUT = process.argv[2] || '.';          // repo root
const tmp = mkdtempSync(join(tmpdir(), 'svenfm-assets-'));
const browser = await chromium.launch();

/* — Open Graph card ----------------------------------------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/design-system/og.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${tmp}/og@2x.png` });
  await page.close();
  // JPEG, not PNG: the card is photographic and carries grain, which PNG
  // stores at ~10x the bytes for no visible gain. 4:4:4 keeps the brass type
  // crisp.
  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open("${tmp}/og@2x.png").convert("RGB").resize((1200, 630), Image.LANCZOS)
im.save("${OUT}/assets/og.jpg", quality=88, optimize=True, progressive=True, subsampling=0)
`]);
  console.log('assets/og.jpg');
}

/* — Icons --------------------------------------------------------------- */
const variant = process.env.ICON_VARIANT || 'brass';
const icons = [
  { size: 16,  tight: 1, out: 'assets/favicon-16x16.png' },
  { size: 32,  tight: 1, out: 'assets/favicon-32x32.png' },
  { size: 48,  tight: 1, out: `${tmp}/icon-48.png` },
  { size: 180, tight: 0, out: 'apple-touch-icon.png' },
  { size: 192, tight: 0, out: 'assets/icon-192.png' },
  { size: 512, tight: 0, out: 'assets/icon-512.png' },
];
for (const { size, tight, out } of icons) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 4 });
  await page.goto(`${BASE}/design-system/icon.html?variant=${variant}&tight=${tight}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${tmp}/raw-${size}.png` });
  await page.close();
  const dest = out.startsWith(tmp) ? out : `${OUT}/${out}`;
  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open("${tmp}/raw-${size}.png").convert("RGBA")
im.resize((${size}, ${size}), Image.LANCZOS).save("${dest}", optimize=True)
`]);
  console.log(dest.replace(`${OUT}/`, ''));
}

/* favicon.ico carries 16 / 32 / 48 as PNG payloads. The largest render is the
   base — Pillow drops any requested size bigger than it. */
execFileSync('python3', ['-c', `
from PIL import Image
Image.open("${tmp}/icon-48.png").save(
    "${OUT}/favicon.ico", format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=[Image.open("${OUT}/assets/favicon-16x16.png"),
                   Image.open("${OUT}/assets/favicon-32x32.png")])
`]);
console.log('favicon.ico');

await browser.close();
