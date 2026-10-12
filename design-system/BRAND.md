# sven.fm

Pine, quiet. The personal site of Sven Ahrens: a name, one sentence, three numbers, a record, and one way to get in touch.

## Content fundamentals

The page is read by founders, boards and recruiters in under a minute, and by crawlers in full. Those are two different documents, so they are two pages.

- **Home (`/`)** carries about 170 words. Name, a "Berlin" kicker, one deck sentence, three figures, a six-row experience ledger, a wall of investment names, one contact link.
- **Profile (`/profile/`)** carries everything else, typeset as a document: summary, full experience with sub-roles, ways to work together, areas, investments with one-line descriptions, press, background and plain questions with FAQPage JSON-LD.
- **llms.txt** and the Person JSON-LD carry the entity for machines.

Voice:

- First person on the home page, third person on the profile (it reads like a speaker bio).
- Facts, not adjectives, and no titles in the hero: "Consumer growth leader and AI tinkerer. Previously Spotify, Yousician and Bain." Not "one of Europe's top growth leaders". Titles live in the ledger.
- No em dashes. Year ranges use an en dash in the ledger only ("2016–24"); prose writes "2016 to 2024".
- Banned on sight: help, passionate, bias for action, hard call, roll up my sleeves, compound, door is open, rotating role lines, "Yes, that's me", "open to".
- No availability pitch on the home page. Openness to roles is answered once, plainly, in the profile questions.
- One call to action on the page: "Book a call". LinkedIn is the quiet alternative.

## Visual foundations

**Surfaces.** Three, in a fixed order. `night` holds the hero and matches the portrait backdrop, so the photo has no frame at all: it dissolves into the stage through two masks (from the left edge and from the bottom). `night` eases into `pine` below the fold with a gradient, never a band edge. `paper` appears once per page as a band (Investments), and as the whole `/profile/` page.

**Accent.** `brass` marks state, not decoration: the wordmark dot, the kicker rule, the ledger hover arrow, the contact underline. On paper it becomes `brass-ink`. If a design needs a second brass element on screen, cut one.

**Type.** Syne for anything you look at, Instrument Sans for anything you read. Syne runs at 600 to 700 with tight negative tracking; it never sets a sentence. Instrument Sans never goes above 24px. Numbers are tabular.

**Hairlines over boxes.** Structure comes from `sage-rule` and `ink-rule` hairlines (ledger rows, figure tops, profile sections). No cards, no borders around content, no shadows. The one rounded surface is the ledger hover plate (`radius-row`).

**Grain.** A fixed SVG turbulence layer at 28% opacity in soft-light over everything, generated inline, never fetched.

**Motion.** One easing, `cubic-bezier(.16, 1, .3, 1)`. On load: kicker, then each line of the name rising out of a clip, then the deck (120, 180, 290, 520ms). The portrait fades in and settles from 1.045 scale over 2.6s, then leans up to 7px toward the pointer on desktop. Sections rise 22px over 1.1s as they enter. Figures rise out of a clip. Nothing loops. All of it is off under reduced motion.

**Layout.** Content width `width-max` (1360px) with `space-gutter` on each side; header, hero text and sections share the same left edge. Sections below the hero use a 3:9 grid: a sticky label on the left, content on the right.

## Contrast

| Pair | Ratio |
|---|---|
| `sage-body` on `pine` | 8.0:1 |
| `sage-muted` on `pine` (floor) | 5.4:1 |
| `brass` on `pine` | 6.9:1 |
| `ink-body` on `paper` | 7.2:1 |
| `ink-muted` on `paper` (floor) | 5.0:1 |
| `brass-ink` on `paper` | 4.8:1 |

## Iconography and imagery

No icons except one: a 45° arrow drawn as a 3.2px stroke, used on the contact link and as "→" in ledger rows. No logos of other companies; portfolio companies appear as type only.

One photograph: the portrait, shot on a near-black green backdrop (`#070d09`). Any replacement must be shot on the same dark backdrop or the hero dissolve breaks. Source at 2000px wide or more; the current 848px file is about 1.4x upscaled on retina.

There is no logo. The wordmark is "sven.fm" in Syne 700 with the brass dot before it.

## Where it lives

The site is plain static HTML and CSS on Vercel: `index.html`, `profile/index.html`, `styles.css`, `main.js`. `styles.css` is the source of truth; `design-system/tokens.css` mirrors its `:root`.
