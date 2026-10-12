# sven.fm · Design system · "Pine, quiet"

Plain static HTML and CSS on Vercel. No framework, no build step.
`/styles.css` is the whole system; `tokens.css` and `fonts.css` here mirror it
for the asset templates.

## Principles

1. **Say less.** The home page carries a name, one sentence, three numbers, a
   ledger, a wall of names and one way to get in touch. Everything else lives
   on `/profile/`, typeset as a document, and in the JSON-LD and `llms.txt`.
2. **Facts, not adjectives.** No "help", no "passionate", no rotating role
   lines, no availability pitch, no FAQ on the home page. Numbers carry the claim.
3. **One accent.** Brass marks state (the live dot, an exit, a hover). Never a
   fill, never a gradient, never on paper (use `--brass-ink` there).
4. **Tactile, not decorative.** Grain, a portrait that leans a few pixels
   toward the pointer, hover states that move like objects. Nothing loops.

## Surfaces

| Token | Value | Use |
|---|---|---|
| `--night` | `#08100B` | Hero stage. Matches the portrait's backdrop so the photo dissolves in. |
| `--pine` | `#13291F` | The field. Every section after the hero. |
| `--paper` | `#DCE4D2` | One band per page (Investments) and the whole `/profile/` page. |

## Themes

Both pages come in dark (pine) and light (paper). The sun/moon button in the
header switches them. Dark is the default for everyone, whatever the system
setting; a click on the toggle is saved in `localStorage`. Below the token block, CSS paints only with the theme tokens
(`--bg`, `--fg`, `--fg-body`, `--fg-muted`, `--rule`, `--accent`, ...), never the
raw colors. `.block--paper` always takes the opposite theme. In light mode the
portrait swaps to `sven-light*`, the same shot on a sage backdrop graded to
exactly `--paper`, so it dissolves into the page the way the original does into
night. Same box, same masks: switching themes never moves it.

## Ink

| Token | On | Contrast |
|---|---|---|
| `--sage` | pine, night | headings |
| `--sage-body` (.80) | pine | 8.0:1 |
| `--sage-muted` (.62) | pine | 5.4:1, floor for small text |
| `--ink` / `--ink-body` (.82) | paper | 7.2:1 |
| `--ink-muted` (.70) | paper | 5.0:1, floor |
| `--brass` | pine | 6.9:1 |
| `--brass-ink` | paper | 4.8:1 |

## Type

| Role | Family | Size | Weight / tracking |
|---|---|---|---|
| Name | Syne | `clamp(78px, 12.4vw, 196px)`, lh .84 | 700, -.05em |
| Contact link | Syne | `clamp(54px, 10.5vw, 168px)` | 700, -.05em |
| Numbers | Syne | `clamp(64px, 8.2vw, 132px)` | 600, -.055em, tabular |
| Names wall | Syne | `clamp(25px, 3.3vw, 50px)` | 600, -.035em |
| Ledger role | Syne | `clamp(19px, 1.9vw, 27px)` | 600, -.03em |
| Deck | Instrument Sans | `clamp(19px, 1.65vw, 24px)`, lh 1.38 | 400, -.01em |
| Body | Instrument Sans | 17px, lh 1.55 | 400 |
| Caption | Instrument Sans | 15px | 400 |
| Label | Instrument Sans | 12.5px, caps | 500, +.16em |

Syne for anything you look at, Instrument Sans for anything you read.

## Motion

`--ease: cubic-bezier(.16, 1, .3, 1)` for everything that lands.
First paint: kicker 120ms, name lines 180ms and 290ms (rise from a clip),
deck 520ms, status 660ms; portrait fades and settles from 1.045 over 2.6s.
Reveals rise 22px over 1.1s. Numbers rise out of a clip. All of it is off
under `prefers-reduced-motion`.

## Files

| File | What |
|---|---|
| `tokens.css` | Mirror of `:root` in `/styles.css`, plus two aliases for `icon.html`. |
| `fonts.css` | Mirror of the `@font-face` block. |
| `og.html` | Source for `/assets/og.jpg`. |
| `icon.html` | Source for the favicon set. |
| `render-assets.mjs` | Rasterises both. |
| `indexnow.sh` | Pings Bing and friends after a deploy. Run it for `/` and `/profile/`. |

## Assets wanted

The portrait is 848px wide (letterbox cropped from the supplied PNG). On a
retina screen the hero shows it at about 1.4x. A 2000px original of the same
shot would make it fully crisp.
