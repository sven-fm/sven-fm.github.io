# sven.fm, Round 2: route C3 Signal, code-ready

Everything Claude Code needs to rebuild the homepage as C3 Signal. `reference.html` is the complete
homepage in production markup; the CSS and JS next to it are final. Injecting it is mechanical:
copy, wire, delete the old styles.

## File map

| File (in `design/round2/` unless it starts with `/`) | Goes to | What it is |
|---|---|---|
| `css/tokens.css` | top of `/styles.css` | Every colour, type, spacing, radius and motion token, both themes |
| `css/fonts.css` | `/styles.css`, before tokens | `@font-face` for the 2 web fonts and their metric-matched fallbacks |
| `css/components.css` | `/styles.css`, after tokens | All components, hover/press/focus states, responsive, reduced motion |
| `js/interactions.js` | `/main.js` (replace) | All interaction JS. 3.9 KB raw, 1.6 KB gzip, under 1 KB minified+gzip |
| `reference.html` | `/index.html` (body + head order) | Final markup, JSON-LD (Person + ProfessionalService) |
| `/assets/fonts/*.woff2` | already in place | Subset variable fonts, 15.2 KB + 18.3 KB |
| `/assets/logos/sprite.svg` | already in place | 5 client logos as `<symbol>`s, currentColor, 11.8 KB raw / 4.8 KB gzip |
| `/assets/img/sven-portrait-*` | already in place | Stylized portrait, AVIF + WebP, 424w and 848w |
| `tools/subset-fonts.sh` | keep in `design/` | Rebuilds the font files from the Google Fonts sources |
| `tools/stylize-portrait.py` | keep in `design/` | Rebuilds the portrait from any source photo |
| `tools/shoot-screens.mjs` | keep in `design/` | Captures and encodes the two product screenshots |
| `CLAUDE-donts.md` | paste into `/CLAUDE.md` | The "do not" list for this route |

The binary assets (fonts, sprite, portrait) are already in their final places under `/assets/`.
CSS, JS, markup, tools and this spec live in `/design/round2/`. Preview before integrating: run `npx serve .`
from the repo root and open `/design/round2/reference.html` (only the two product screenshots and the
Knowunity PNG are missing; see open items).

## Integration steps for Claude Code

1. Replace `/styles.css` with `fonts.css` + `tokens.css` + `components.css`, concatenated in that order.
   Delete the old Instrument Sans and Syne font files and `design-system/` styling (superseded).
2. Replace the `<body>` of `/index.html` with the body of `reference.html`. Keep the existing pre-paint theme
   script but make it respect `prefers-color-scheme` when no choice is saved (tokens handle both).
3. In `<head>`: the two `rel="preload"` font links, then one stylesheet, then `main.js` with `defer`.
   Merge the JSON-LD with the current graph (keep `WebSite`, `ProfilePage`, Newconic `Organization`, `sameAs`).
4. Replace `/main.js` with `interactions.js`.
5. Create `/about/` from the current `/profile/` content (long-form SEO/GEO text lives there, plus JSON-LD and `llms.txt`).
   Give its `<h1>` the class `readout__name` so the name morphs between pages (cross-document View Transitions).
   301 `/profile/` to `/about/` in `vercel.json`.
6. Fill the open items below, then run Lighthouse mobile.

## Fonts

| Role | Family | File | Weights | Size |
|---|---|---|---|---|
| Display (name, headlines, sub-headings, CTA, company names) | Funnel Display | `funnel-display-latin-600-800.woff2` | 600 to 800 (variable) | 15.2 KB |
| Text (body, numbers, readout figures) | Host Grotesk | `host-grotesk-latin-300-700.woff2` | 300 to 700 (variable) | 18.3 KB |

- 2 files, 33.5 KB total (budget: 4 files, 160 KB). Both are preloaded; both are needed above the fold.
- Subset: Basic Latin, Latin-1 (all German umlauts and ß), en dash, curly quotes, ellipsis, euro, minus.
- Numbers use Host Grotesk. Its figures are tabular by default (every digit is 650 units wide), so
  `font-variant-numeric: tabular-nums` is set on `body` for intent, not because the font needs it.
- Fallback overrides, measured against Arial metrics (Liberation Sans) on this site's own copy:

| Fallback face | Source | size-adjust | ascent-override | descent-override | line-gap-override |
|---|---|---|---|---|---|
| Host Grotesk Fallback | Arial | 104.41% | 97.21% | 30.17% | 0% |
| Funnel Display Fallback | Arial Bold | 102.07% | 97.97% | 24.49% | 0% |

Measured in headless Chrome against the reference page: CLS 0 with fonts swapping in.

### Subsetting commands

```bash
pip install fonttools brotli
curl -L -o "FunnelDisplay[wght].ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/funneldisplay/FunnelDisplay%5Bwght%5D.ttf"
curl -L -o "HostGrotesk[wght].ttf"  "https://raw.githubusercontent.com/google/fonts/main/ofl/hostgrotesk/HostGrotesk%5Bwght%5D.ttf"

U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013,U+2018-201A,U+201C-201E,U+2026,U+20AC,U+2212"
FEAT="kern,liga,calt,ccmp,locl,mark,mkmk,tnum,lnum,pnum,case"

# Funnel Display
fonttools varLib.instancer "FunnelDisplay[wght].ttf" wght=600:800 -o funnel.ttf
pyftsubset funnel.ttf --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 \
  --no-hinting --desubroutinize --name-IDs='*' --output-file=assets/fonts/funnel-display-latin-600-800.woff2

# Host Grotesk
fonttools varLib.instancer "HostGrotesk[wght].ttf" wght=300:700 -o host.ttf
pyftsubset host.ttf --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 \
  --no-hinting --desubroutinize --name-IDs='*' --output-file=assets/fonts/host-grotesk-latin-300-700.woff2
```

`tools/subset-fonts.sh` runs exactly this. Both fonts are SIL OFL 1.1; licences are in `assets/fonts/`.
No paid licence is needed for this route.

## Tokens (summary; `css/tokens.css` is the source of truth)

| Group | Tokens |
|---|---|
| Colour | `--panel` #0F0F0E, `--panel-ink` #F3F1EC, `--panel-ink-2` #A9A7A0, `--page` #F4F2ED / dark #161615, `--ink` #111110 / #F1EFEA, `--ink-2` #3B3A36 / #C3C1BA, `--ink-3` #6B6A64 / #95938C, `--tint` #E8E5DD / #23221F, `--signal` #FF4F2A, `--on-signal` #111110, `--signal-text` #B93216 / #FF6A48 |
| Type | `--t-name` 64→116, `--t-readout` 72→140, `--t-hero` 44→72, `--t-h2` 32→46, `--t-h3` 24, `--t-fig` 32→44, `--t-lead` 19→22, `--t-body` 17, `--t-small` 15, `--t-micro` 12, `--t-cta` 22 |
| Weights | 300 light (inactive readout), 400 body, 500 links, 600 figures, 700 sub-headings and CTA, 800 headlines |
| Line height | name .86, display .95, heading 1, sub 1.15, caption 1.35, lead 1.4, body 1.5, figures .95 |
| Spacing | 8, 16, 24, 40, 64, 64→104, 104→160; `--pad` 20→48; `--gutter-main` 32→88 |
| Radii | 0 everywhere. Square corners are part of the route; no exception is argued for. |
| Motion | instant 80, fast 160, base 240, slow 420, reel 680, fade 520, weight 560, revert 1200 ms; `--ease-out` cubic-bezier(.2,.8,.2,1); `--ease-spring` linear() with ~5% overshoot; press .97 (touch .95) |

All text pairs pass WCAG AA (lowest: `--ink-3` on `--page`, 4.8:1; signal as small text uses `--signal-text`, 5.2:1).

## Component specs

### 1. Control panel + hero (the header)
- **Layout:** two-column split, `5fr 7fr`. The left panel is near-black in both themes. From 901px wide and 640px tall it is
  sticky and one viewport high (`100svh`).
- **Panel content, top to bottom:** nav (wordmark, About), then the readout window, then the booking CTA with "Pick a slot in my calendar."
- **Portrait:** stylized mono (`tools/stylize-portrait.py`), absolutely positioned behind the panel content.
  It is 88% of the panel height, top -9%, shifted 30% off the left edge. The chin must stay clear of the name:
  check after any crop change. When the header scrolls past (`data-sec` ≠ 0) it fades out (520 ms) and drifts
  6% left, then returns on the way back up.
- **Right column hero:** `h2` "Fractional COO & Chief Growth Officer" at `--t-hero`, max 14ch, then the scope line (lead, `--ink-2`),
  then the stats strip anchored to the bottom of the first viewport. The stats bottom aligns with the CTA bottom on the left.
- `h1` is the name inside the panel. It is the only `h1`.

### 2. Readout (inside the panel)
- **Structure:** a fixed window (`--readout-win`, max 40vh) holding a vertical reel of 4 items, one per section:
  name + one-liner, "Up to 2", "2016–24", "18+", each with a caption.
- **Behaviour:** JS sets `data-sec` on `.site`; CSS moves the reel by 25% per section with the spring curve. The active item flows
  from weight 300 to 600 and from opacity .2 to 1. Items 2 to 4 are `aria-hidden` (they duplicate visible content).
- **No JS, or below the sticky breakpoint:** only the name item shows.

### 3. Progress meter
- A 4px signal bar on the panel's right edge. `scaleY` .25 / .5 / .75 / 1 by section, with the same spring.

### 4. Stats strip (hero)
- **Content:** 3 figures in a `1.45fr 1fr 1fr` grid: "20M to 200M", "$1B+", "20M+".
- **Type:** figures are Host Grotesk 600 at `--t-fig`, tracking -0.04em; labels are `--t-small` in `--ink-2`.
- **Below 900px:** stacked.
- No count-up and no entrance motion.

### 5. Fractional offer block (section 2)
- `h2` "Operations and growth", then two equal columns (Operations, Growth: `h3` + paragraph), then the
  "Embedded from day one, hands-on and AI-forward." lead.
- No cards, borders or icons.

### 6. Client logo row
- **Content:** 6 logos in a `space-between` flex row, `--s-6` above the row.
- **Source:** inline SVG via `<use href="/assets/logos/sprite.svg#logo-…">`, `fill: currentColor`.
- **Size by height, not width:** Zellerfeld 24, Kittl 27, Peloton 16, Algoriddim 22, Female Invest 24, Knowunity 22.
- **Colour:** `--ink-3` at rest. Hover: `--ink` and a 2px rise (spring).
- **Below the row:** the line "Now: Zellerfeld, 3D-printed footwear (collaborations with Nike, Reebok, Havaianas, Justin Bieber)."
- **Knowunity:** typeset stand-in until `/assets/logos/knowunity.png` exists. Then add `logo--mask` and set `--ar`.

### 7. Product proof plates
- **Copy:** `h3` "I ship, not slides." + one paragraph with the AI operations numbers.
- **Plates:** two equal plates, 16:10 frame, `--tint` ground, no border, no device frame.
- **Images:** screenshots are `<picture>` AVIF + WebP at 800w/1600w, `width`/`height` set, `loading="lazy"`, ≤ 80 KB each.
  Produce them with `tools/shoot-screens.mjs`.
- **Hover (fine pointer only):** the image follows the cursor up to 5px inside its frame.
- **Caption:** domain as a text link + one-line description. The whole plate links to the live site; no iframes.

### 8. Career table (section 3)
- **Grid:** `88px 190px 1fr auto`: years, company (Funnel 700, 22px), role (`--ink-2`), number (600, right-aligned).
  No rules between rows.
- **Row interaction:** each row is focusable. Hover/focus: `--tint` background, and a detail line reveals inline under the company
  (opacity + clip-path wipe).
- **Touch:** the detail is always visible.
- **Below the table:** the education line (WHU must stay visible).

### 9. Portfolio list (section 4)
- **Heading:** `h2` "Newconic Ventures" + the lead "18+ angel investments, 2 exits: Butter to Miro, Petli to Agria."
- **List:** 20 names in 3 columns (2 below 900px), Funnel 600 19px. Exits carry a 12px "exit" superscript in `--signal-text`.
- **Interaction:** pointing at or focusing a name writes "Name: what they do." into the caption line below (`aria-live="polite"`).
  Without JS the caption stays empty; the detail lives on /about.
- **Boards line:** "Board Observer at Female Invest since 2024. Advisor to Peloton, Knowunity and Kittl."

### 10. Booking CTA
- **Placement:** the only CTA on the page. It appears in the panel (always visible on desktop) and repeats once in the footer.
- **Style:** signal fill, ink label in Funnel 700 22px, 64px tall, 32px side padding, square corners.
- **Press:** compresses to .97 in 80 ms, then springs back over 420 ms with ~5% overshoot. Touch screens press to .95.
  `navigator.vibrate(8)` on press (Android), ignored elsewhere.
- **Footer row:** CTA, then the email (click copies; label swaps to "Copied", shifts 6px, reverts after 1.2 s; `mailto:` without JS),
  then LinkedIn.

## Interaction table

| Element | Trigger | Property | From → to | Duration | Easing | Reduced motion |
|---|---|---|---|---|---|---|
| Text link | hover (fine pointer), focus-visible | `::after` transform scaleX, origin = side the pointer entered | 0 → 1 | 240 ms | ease-out | Underline appears instantly |
| Client logo | hover | color; transform translateY | `--ink-3` → `--ink`; 0 → -2px | 160 ms; 240 ms | ease-out; spring | Colour only |
| Plate screenshot | pointermove (fine pointer) | transform translate | 0 → ±5px x/y, following cursor | 240 ms | ease-out | Off |
| Plate screenshot | pointer leaves | transform translate | current → 0 | 240 ms | ease-out | Off |
| Career row | hover, focus-visible | background-color | transparent → `--tint` | 160 ms | ease-out | 120 ms fade |
| Career detail | hover, focus-visible | opacity; clip-path | 0 → 1; inset(0 100% 0 0) → inset(0) | 160 ms; 240 ms | ease-out | Opacity only |
| Portfolio name | hover, focus | background-color; caption text | transparent → `--tint`; text swap | 160 ms; instant | ease-out | Same |
| CTA | press | transform scale | 1 → .97 (touch .95) | 80 ms | ease-out | Off |
| CTA | release | transform scale | .97 → 1, ~5% overshoot | 420 ms | spring | Off |
| CTA | hover | filter brightness | 1 → 1.07 | 160 ms | ease-out | Same |
| CTA | pointerdown | `navigator.vibrate(8)` | n/a | 8 ms | n/a | Same |
| Email | click | label text; transform translateX | address → "Copied"; 0 → 6px; reverts after 1.2 s | 240 ms | spring | Text swap only |
| Readout reel | section crosses viewport middle | transform translateY | -(n × 25%) | 680 ms | spring | Instant |
| Readout item | same | font-weight; opacity | 300 → 600; .2 → 1 | 560 ms; 320 ms | ease-out | 120 ms |
| Progress meter | same | transform scaleY | n/4 → (n+1)/4 | 680 ms | spring | Instant |
| Portrait | header leaves (`data-sec` ≠ 0) | opacity; transform translateX | 1 → 0; 0 → -6% | 520 ms; 680 ms | ease-out | Opacity 120 ms, no drift |
| Any focusable | focus-visible | outline | none → 2px currentColor, offset 4px | instant | n/a | Same |
| Name, Home ↔ /about | navigation | view-transition group `sven-name` | morph | 420 ms | ease-out | Off |

Hover rules live only inside `@media (hover: hover) and (pointer: fine)`. On touch, details are always shown
and the press state carries the feel (deeper scale).

## Deliberate changes from the original brief

- **Scroll motion lives only in the left panel.** The right column is static on scroll by design: no hairline extension,
  no headline axis scrub, no stat settling. Feedback from the C3 review: right-column motion competed with the panel.
- **Section tracking uses IntersectionObserver, not CSS `animation-timeline`.** It is not a scroll listener, and it works in
  Firefox, which still lacks scroll-driven animations. The page is static and complete without it.
- **The hero carries the fractional headline,** not just name + one-liner (your call).
- **No separate stats strip in track record.** Each career row carries its number, which removes the repeated stats.
- **A photo is now part of the route** (header only).

## Open items before launch

1. **Portrait source:** the current original is 848×1108, soft at this size on retina. Re-run `tools/stylize-portrait.py` on an original ≥ 1800px tall.
2. **Product screenshots:** run `tools/shoot-screens.mjs` (needs network). The 404s in the reference preview are these files.
3. **Knowunity:** add `/assets/logos/knowunity.png` (white-on-transparent wordmark), then switch to `.logo--mask`.
4. **Email:** confirm `hallo@svenahrens.com`; the repo has no public address apart from `apps@sven.fm`.
5. **Career numbers:** Muse Group ("LTV model") and Bain ("Munich") have no real figure in the repo.
6. **`llms.txt` and `/profile/`** still pitch full-time and interim roles; align them with the fractional-only offer when building `/about/`.
7. **Lighthouse mobile targets:** LCP < 1.8s, CLS < 0.02, Performance 95+, Accessibility 100.
   - Measured on the reference page (local, headless Chrome): CLS 0.
   - LCP will be the portrait or the hero headline. The portrait is 6 KB (424w AVIF) on mobile, with `fetchpriority="high"`.
