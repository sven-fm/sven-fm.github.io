# sven.fm – next steps

Open items from the SEO / GEO pass on 2026-09-04. Things that are either a
scope decision, or live outside the repo. Everything that was a code fix has
shipped.

## 1. Service pages – the one lever left with real upside

One page can rank for a handful of intents, not a portfolio of them. Today
sven.fm ranks #1 for the long-tail query ("fractional head of growth consumer
subscription Berlin ex-Spotify"). To own the head terms – "fractional head of
growth", "interim chief growth officer", "consumer subscription advisor",
"board member consumer growth" – each needs a page with its own title, H1,
opening paragraph and FAQ.

Suggestion, so the home page stays uncluttered:

- Keep `/` exactly as it is: the story, the proof, one CTA.
- Add four thin pages under `/work/`, one per intent, each ~300 words:
  `/work/fractional-head-of-growth`, `/work/interim-cgo`,
  `/work/board-member`, `/work/advisor`. Each reuses the matching engagement
  row as its opening, adds two or three specifics (what the first 30 days
  look like, who it's for, how it's priced or scoped), and closes with the
  same Book-a-call CTA and three FAQ rows in `FAQPage` JSON-LD.
- Link to them only from the five engagement rows (the title becomes the
  link) and from the sitemap. No new nav item.
- Same design system, same `styles.css` – a page is a `section` and a few
  `row`s.

Worth doing when there's an hour for the copy; the layout is a template.

## 2. Profile consistency – highest-value GEO action, outside the repo

LLMs triangulate an entity across sources. The bare name "Sven Ahrens"
collides with an archaeologist, a physicist and an R&D director, and today
sven.fm does not appear for the name alone. Make every profile say the same
thing and point home:

- LinkedIn: headline "Consumer monetization & growth leader · ex-Spotify,
  ex-CEO Yousician · Berlin", website field = https://sven.fm
- Crunchbase (`crunchbase.com/person/sven-ahrens-235f`): same one-liner,
  website = sven.fm
- CB Insights (`cbinsights.com/investor/sven-ahrens`): same
- The Org (`theorg.com/org/yousician/org-chart/sven-ahrens`): same

The Person JSON-LD now lists all four as `sameAs` and carries a
`disambiguatingDescription`; the reverse links are what closes the loop.

## 3. Indexes

- Google Search Console: request indexing of `/` once after this deploy so
  the old em-dash title drops out of the index.
- Bing Webmaster Tools: submit `sitemap.xml` and turn on IndexNow. Bing's
  index is what ChatGPT search and Copilot cite; without IndexNow, copy
  changes take weeks to show up there.

## 4. Declined for now

- Inlining `styles.css` into `<head>` (≈370ms on throttled mobile, +2
  Lighthouse points). Costs the three-file parity in `design-system/`.
  Revisit only if a Core Web Vitals report ever flags render blocking.
- FAQ rich results: Google limits them to government and health sites since
  2023. The `FAQPage` schema stays because LLMs extract from it; no SERP
  snippet is expected.
