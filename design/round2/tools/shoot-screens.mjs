// Capture and encode the two product proof plates.
// usage (repo root): npm i -D playwright sharp && npx playwright install chromium && node design/round2/tools/shoot-screens.mjs
// Output: assets/img/{trainingzones,kalle}-{800,1600}.{avif,webp}, each AVIF must stay <= 80 KB.
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";

const shots = [
  { name: "trainingzones", url: "https://www.trainingzones.app" },
  { name: "kalle", url: "https://www.trainwithkalle.com" },
];
const OUT = "assets/img";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.25 }); // 1600 x 1000
for (const s of shots) {
  await page.goto(s.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // let web fonts and first paint settle
  const png = await page.screenshot({ type: "png" });
  for (const w of [800, 1600]) {
    const img = sharp(png).resize({ width: w });
    for (const [fmt, opts] of [["avif", { quality: 52, effort: 6 }], ["webp", { quality: 78 }]]) {
      const file = `${OUT}/${s.name}-${w}.${fmt}`;
      await img.clone()[fmt](opts).toFile(file);
      const kb = (await stat(file)).size / 1024;
      console.log(file, kb.toFixed(1) + " KB", fmt === "avif" && kb > 80 ? "OVER BUDGET: lower quality" : "");
    }
  }
}
await browser.close();
