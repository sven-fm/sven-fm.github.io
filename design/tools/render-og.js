// Renders design/tools/og.html to assets/og-c3.jpg (1200x630). Needs playwright and sharp installed.
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");
(async () => {
  const root = path.resolve(__dirname, "../..");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(root, "design/tools/og.html"));
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, "assets/og-c3.jpg"));
  await browser.close();
})();
