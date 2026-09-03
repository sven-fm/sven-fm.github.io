# sven.fm — Design System · "Pine"

The visual system for **sven.fm**, the page that books Sven Ahrens as a
fractional / interim consumer monetization & growth leader. One direction,
fully specced and code-ready: plain static HTML/CSS/JS on Vercel — no
framework, no build step, no dependencies.

> **"Pine."** A deep pine field alternating with a pistachio-sage paper band.
> Brass is the only accent. Oversized Syne display type does the talking; paper
> grain sits over everything; buttons are physically deep; the light moves
> slowly and almost invisibly.

This replaces the previous "Editorial + kinetic" system (emerald accent,
Newsreader serif, the `<fm-waveform>` signature, a light/dark toggle). None of
that survives — see [What changed](#what-changed) at the bottom.

---

## The signature

Three things, all CSS, no canvas and no images:

1. **Paper grain.** One fixed, inert layer over the whole page — a 180×180
   `feTurbulence` tile as a data-URI, `opacity: .5`, `mix-blend-mode:
   soft-light`. It gives both surfaces a heavy-paper tooth. Ship it generated;
   never fetch a texture.
2. **Ambient light.** Two oversized fixed radials that drift on 46s and 62s
   loops — warm brass from the top-left, cool sage from the bottom-right. They
   sit **above** the section backgrounds (`z-index: 55`) so a band edge cannot
   clip them, and they **translate only**: scaling, or a gradient that never
   reaches `transparent`, shows a moving hard edge.
3. **The arch.** The portrait sits in a `200px 200px 34px 34px` frame with a
   brass halo behind it and a mask that fades its base into the field.

The page root must use `overflow-x: clip`, never `overflow: hidden` — hidden
clips the fixed layers.

---

## The accent

**Brass.** One accent, two values, chosen by surface — the bright one fails
contrast on paper, so it never appears there.

| Token | Value | Use |
|---|---|---|
| `--brass` | `#D0A928` | Accent on pine: eyebrows, ordinals, rules, the wordmark dot, hover borders |
| `--brass-on-sage` | `#7A5C0A` | Accent on sage: eyebrows and inline links |
| `--brass-button` | `linear-gradient(180deg,#E0BC48,#C79E20)` | Primary button fill, always with `#13291F` ink |
| `--brass-halo` | `rgba(208,169,40,.24)` | Portrait halo, dot glow |

> **Contrast floor.** Small uppercase labels are tuned to clear WCAG AA on both
> surfaces (≈5.4:1). Don't dim them below **72%** opacity on pine — earlier
> passes at 45–50% measured 3.5–4.0:1 and failed.

---

## Files

| File | What it is | Load |
|---|---|---|
| `fonts.css` | The four self-hosted `@font-face` declarations (Syne + Work Sans, latin and latin-ext). | 1st |
| `tokens.css` | All custom properties: surface, text, accent, type, space, radius, elevation, motion. **Single source of truth.** | 2nd |
| `base.css` | Reset, atmosphere layers, and every component pattern. | 3rd |
| `motion.js` | Menu, role crossfade, reveals, parallax, count-up, favicon chips, year. | `defer` |
| `example.html` | Working reference build — every pattern on one page. Start here. | — |
| `og.html` | Source for the Open Graph card. | — |
| `icon.html` | Source for the favicon / app icon mark. | — |
| `render-assets.mjs` | Rasterises both into the shipped image assets. | — |

```html
<link rel="preload" href="/assets/fonts/syne-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<script src="motion.js" defer></script>
```

**Relationship to the shipped site.** `/styles.css` at the repo root carries
the same rules in the same order as `fonts.css` + `tokens.css` + `base.css`,
and `/main.js` is `motion.js` verbatim — only the header comments differ. The
site is one page with no build step, so it ships as two flat files; this folder
is the reference copy. Change a value in both, or they drift. Serve `example.html` from the repo root (`python3 -m http.server`) —
font and image paths are absolute.

---

## Surfaces

One theme. No `data-theme`, no light mode, no toggle. A section picks a surface
and the text tokens come with it:

```html
<section class="section">…</section>              <!-- pine, the default -->
<section class="section section--sage">…</section><!-- sage paper band -->
```

The page alternates pine → sage → pine → sage → pine, so the sage bands break
the field into chapters. Text on pine is `--text-on-pine` (#DCE4D2) with body
copy at 74% and muted labels at 72%; text on sage is `--text-on-sage`
(#13291F) with body at 72% and labels at 74%. Rules follow the same split:
`--rule-on-pine` / `--rule-on-sage`.

---

## Type

Two families, both self-hosted variable woff2 subsets. The display face is
preloaded because the hero headline is above the fold.

| Role | Family | Token | Weights |
|---|---|---|---|
| Display | **Syne** | `--font-display` | 600 / 700 / 800 |
| Body | **Work Sans** | `--font-body` | 400 / 500 / 600 |

Syne takes every headline, title, ordinal, question and metric value. Work Sans
takes every sentence, label and button. Nothing else — there is no third face
and no mono.

### Scale

| Token | Size | Role |
|---|---|---|
| `--fs-h1` | `min(10.5vw, calc((100vw - 40px) / 8.6), 158px)` | Hero headline |
| `--fs-h2-closing` | 52 → 190px | "Let's talk." |
| `--fs-h2` | 30 → 72px | Section headline |
| `--fs-about-lead` | 22 → 38px | About lead |
| `--fs-h3` / `--fs-role` | 20 → 32px / 21 → 32px | Row titles / rotating role |
| `--fs-metric` | 34 → 58px | Metric values |
| `--fs-career` | 19 → 27px | Career role |
| `--fs-faq` | 18 → 25px | Question |
| `--fs-hero-body` | 16 → 19px | Hero paragraph |
| `--fs-portfolio` | 16 → 19px | Card name |
| `--fs-body` / `--fs-body-sm` | 16px / 15.5px | Body / dense body |
| `--fs-nav` / `--fs-card` / `--fs-metric-label` | 13.5 / 13.5 / 13px | Nav, card copy, metric label |
| `--fs-eyebrow` / `--fs-tag` | 11.5px / 11px | Uppercase labels, tags |

> **Why `--fs-h1` isn't a plain `clamp()`.** 10.5vw is tuned so the longest word
> in the headline ("companies") exactly fills the line. Below ~400px the gutter
> stops shrinking with the viewport, so a fixed floor overflows the container
> and clips the word — the second term takes over there and keeps it inside.

Tracking: `--track-display -.045em` · `--track-h2 -.04em` · `--track-h3 -.03em`
· `--track-eyebrow .22em` · `--track-meta .16em` · `--track-tag .12em`.
Display line-heights run tight (.85–.98); body runs 1.5–1.7.

---

## Space, radii, elevation

Layout: `--gutter` clamp 20→72px · `--section-y` clamp 52→120px ·
`--hero-top` clamp 40→110px · `--col-gap` clamp 16→56px · `--row-y` clamp
20→32px · `--maxw` 1320px. Every section is `padding: var(--section-y)
var(--gutter)` with a `.container` inside.

Radii: `--r-pill 999` · `--r-card 20` · `--r-chip 8` · `--r-portrait-frame
200px 200px 34px 34px` · `--r-portrait-img 184px 184px 22px 22px`.

Elevation is where the system gets physical. `--shadow-btn` stacks an inner
top highlight, an inner bottom shade, a contact shadow and a long cast;
`--shadow-btn-active` replaces them with an inset press so the button sinks
rather than stepping down a hard edge. `--shadow-portrait`, `--shadow-card`,
`--shadow-ghost` and `--shadow-favicon` follow the same logic at lower volume.

Breakpoint: **820px**, one only. Below it the nav becomes a sheet and every
two-column row stacks.

---

## Motion

| Token | Value | Drives |
|---|---|---|
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | everything |
| `--dur-press` | 300ms | button + card hover/press |
| `--dur-role-fade` | 420ms | role crossfade out/in |
| `--dur-role-hold` | 3400ms | role rotation cadence |
| `--dur-reveal` | 900ms | scroll reveal, `(index % 4) * 70ms` stagger |
| `--dur-count` | 1300ms | metric count-up |
| `--reveal-offset` | 16px | reveal rise distance |
| `--parallax-clamp` | 44px | drift ceiling, both directions |

**Parallax is measured per element**, from its own document position:
`-(smoothedScroll + innerHeight/2 - elementTop) * rate`, lerped at 0.06 and
clamped to ±44px. Never drive it off absolute `scrollY` — a negative rate
6000px down the page accumulates 100px+ and collides with its neighbours.
Anchors re-measure on resize.

**Reveals need the fail-safe.** Anything at or above the viewport on init
reveals immediately, and a scroll sweep catches whatever the observer missed,
detaching once nothing is pending. A deep link or a restored scroll position
must never leave a block invisible.

**Every motion degrades to static under `prefers-reduced-motion: reduce`** —
reveals render at rest, the role phrase is fixed, drift and ambient light don't
run, counters show their final value.

### Hooks (markup → behaviour, via `motion.js`)

```html
<!-- parallax drift; the rate is per element, sign included -->
<p class="eyebrow" data-drift="0.035">…</p>

<!-- fade + rise into view -->
<div class="row" data-reveal>…</div>

<!-- count 0 → 60 and render "60%+"; the final value is already in the markup -->
<div class="metric__value" data-count="60" data-suffix="%+">60%+</div>

<!-- crossfade through phrases; the trailing period lives inside the span -->
<span class="role" data-roles='["fractional Head of Growth","board member"]'>fractional Head of Growth.</span>

<!-- favicon chip: the letter is the graceful state -->
<span class="fav"><span class="fav__letter">A</span><img data-domain="alba.tech" alt="" loading="lazy"></span>
```

---

## Components (`base.css`)

- **Layout** — `.section` (`--sage`, `--portfolio` variants), `.container`,
  `.band` (the tighter numbers rhythm).
- **Type** — `.eyebrow` (brass uppercase label, recolours itself on sage),
  `.meta` (uppercase meta line), `.rule` (the 26×1px brass hairline),
  `.section__h2`, `.about__lead`.
- **Buttons** — `.btn` (brass, physically deep) with `--ghost`, `--sm` (header,
  44px min) and `--lg` (closing) variants; `.cta-row` / `.cta-row--center`.
- **Header** — `.hdr` (sticky glass) → `.wordmark` + `.wordmark__dot`, `.nav`,
  `.menu-btn` (three bars that morph to an X on `aria-expanded`), `.sheet`.
- **Hero** — `.hero__h1` (`<em>` marks the brass word), `.roleline` + `.role`
  (`.is-out` is the mid-crossfade state), `.hero__body`, `.availability` with
  its pulsing dot, `.portrait` → `__halo` / `__frame` / `__img` / `__cap`.
- **Numbers** — `.metrics` → `.metric__value` / `.metric__label`.
- **Rows** — `.row` (1fr : 1.25fr) with `.mode__num` / `.mode__title` /
  `.mode__desc`; `.career-row` (1fr : 1.3fr) with `.career__sub` pills;
  `.faq-row` (1fr : 1.3fr, `<dl>` semantics, always open — no accordion).
- **Cards** — `.pf` (flex, **not** grid: no phantom empty cells at any column
  count) → `.pf-card` → `.pf-card__name` / `__desc`, `.tag`, and the `.fav`
  favicon chip (`.fav--dual` for a two-icon card).
- **Press** — `.press` → `.press__pub` / `.press__title`, rule turns brass on
  hover.
- **Closing + footer** — `.close`, `.close__h2`, `.close__body`, `.footer`.

> **Numbers tracks are 250px, not the 170px the comp specified.** At 58px Syne
> 800 the widest value ("20M+") measures ~250px and spilled into its
> neighbour. Keeping the display size costs a column: the band is four across
> on a wide screen, not six.

---

## Image assets

The share card and every icon are **rendered from the system**, not drawn by
hand — same tokens, same fonts, so they can never drift from the page.

| Source | Output |
|---|---|
| `og.html` | `assets/og.jpg` — 1200×630, JPEG q88 |
| `icon.html` | `favicon.ico` (16/32/48), `assets/favicon-16x16.png`, `assets/favicon-32x32.png`, `apple-touch-icon.png` (180), `assets/icon-192.png`, `assets/icon-512.png` |

```bash
python3 -m http.server 8765 &            # serve the repo root
PLAYWRIGHT="$(npm root)/playwright" node design-system/render-assets.mjs
```

Everything renders at 2–4× and downsamples, so 16px type stays crisp.

**The mark** is the wordmark's S in Syne 800 on the brass button gradient with
pine ink — the primary button, miniaturized. Syne 800 at full weight all the
way down to 16px: the glyph is scaled to fill 95% of the tile width at 16–48px,
and scaling it up widens the counters in absolute pixels, so the distinctive
wide S survives instead of needing a lighter weight. Width is what binds — the
S is ~1.45× as wide as it is tall — and the air above and below is the glyph's
own proportion, not padding. At 100% it touches the tile edge, so 95% is the
ceiling; the larger app icons sit back at 86%.

The glyph is painted into a `<canvas>` and placed by its measured ink box, not
by a CSS line box, because Syne's S sits high in the em and half a pixel of
drift shows at 16px. Canvas doesn't trigger a webfont load on its own, so the
template calls `document.fonts.load()` first and asserts the face is there —
without it `measureText` silently reports a fallback serif and the icon renders
in the wrong typeface.

`icon.html?variant=pine` renders the inverted mark (brass S on pine) if the
field is ever wrong for a context; `ICON_VARIANT=pine` ships it.

**The card is a JPEG, not a PNG.** It carries a photo and the grain layer,
which PNG stores at roughly ten times the bytes (878KB vs 87KB) for no visible
difference. `og:image:type` says `image/jpeg` to match.

---

## Accessibility (quality floor)

- **Works with JavaScript off.** All copy, every anchor and every metric value
  is in the HTML. `motion.js` is enhancement only.
- Responsive to **320px** with no horizontal scroll at any width.
- Visible **keyboard focus** — `:focus-visible`, 2px brass ring, 3px offset.
- **AA contrast** on both surfaces; the 72% floor above is not negotiable.
- **`prefers-reduced-motion`** fully respected (see Motion).
- Hit targets **44px minimum** — the header CTA sets the floor.
- Decorative elements (grain, glows, halo, hamburger bars, rules) are
  `aria-hidden`; every icon-free glyph is text.

---

## Production notes

- **No icon set anywhere.** The only glyphs are text ("→") and CSS shapes: the
  wordmark dot, the hairlines, the hamburger bars. Don't introduce a library.
- Portfolio favicons come from `https://icons.duckduckgo.com/ip3/<domain>.ico`
  at runtime — third-party, unversioned, sometimes a blank 1px image. Treat
  `naturalWidth < 8` as a failure; the letter chip is the required fallback.
  Cache the icons into `assets/` if you'd rather not depend on it.
- The grain is generated, not an image file. Keep it that way.
- Sticky header is always visible; there is no scroll-triggered CTA and no
  fixed bottom bar — the header carries the one conversion action at every
  breakpoint.

---

## What changed

Retired with the previous system, and deliberately not carried over:

| Gone | Replaced by |
|---|---|
| `<fm-waveform>` + `signature.js` | Paper grain and ambient light — CSS, no canvas |
| Emerald accent (`#23E5A2`) | Brass, split by surface |
| Light/dark toggle, `data-theme`, `localStorage` | One theme, two surfaces |
| Newsreader / Hanken Grotesk / Geist Mono | Syne + Work Sans |
| Corner-tick "tuning crop" portrait | The arch frame, halo and base fade |
| `fm-` class prefix | Unprefixed names, matching the shipped build |
| Hairline-ruled mono `.fm-ledger` | `.metrics`, Syne values on the sage band |
