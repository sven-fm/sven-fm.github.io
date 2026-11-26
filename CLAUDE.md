# sven.fm

Static site on Vercel. Every page uses the C3 Signal route. /styles.css and /main.js are the source of truth: edit them directly. design/round2/ is the original spec and is not kept in sync. design/, *.md and other working files are kept off the deploy by .vercelignore. Home and /about/ use the split panel; /apps/ pages use the doc layout (dark band header, one column).

## sven.fm design rules (route C3 Signal): do not

- Do not add horizontal rules, hairlines or borders between sections, rows or list items. Space and type do the separating.
- Do not animate anything in the right column on scroll. The left panel (readout reel, meter, portrait) is the only scroll-reactive element.
- Do not add entrance animations, fade-ups, count-ups, marquees, parallax, page loaders, typewriter or scramble text, custom cursors, cursor followers, magnetic buttons, scroll-jacking or smooth-scroll libraries.
- Do not use GSAP, Framer Motion or any animation library. Interaction JS stays vanilla, progressive and under 8 KB gzip; the page must work without it.
- Do not animate width, height, top, left or margins. Only transform, opacity, clip-path and font-weight (variable axis).
- Do not put hover effects outside `@media (hover: hover) and (pointer: fine)`. Do not ship any motion without its `prefers-reduced-motion` fallback.
- Do not use any font other than Funnel Display (display roles, 600 to 800) and Host Grotesk (everything else, including all numbers). No monospace for figures. Never load fonts from the Google Fonts CDN or Adobe Fonts.
- Do not add a second call to action. "Book a call" exists twice: panel and footer, each with the square LinkedIn icon button right next to it. No nav button, no section buttons, no stacked CTAs.
- Do not publish an email address anywhere on the site (spam). Contact is Book a call, LinkedIn and the contact forms (home and /apps/), which send through /api/contact so the address stays in Vercel env vars.
- Do not use the signal colour anywhere except the CTA fill, the progress meter, the "exit" marker and the /apps/ form submit.
- Do not round corners, add shadows, gradients, glass, blobs, dot grids or mesh backgrounds. `--radius` is 0.
- Do not use uppercase eyebrow labels, 01/02/03 numbering, middle-dot separators, arrows after links, emoji, pill badges, icon sets, bento boxes or 3-card feature grids. Do not present the offer as cards.
- Do not show client logos in colour, in a marquee, or under a "Trusted by" heading. Logos come from the sprite and use currentColor.
- Do not use iframes or device mockup frames for the product proof. Static AVIF/WebP screenshots, ≤ 80 KB each, lazy-loaded, with width and height.
- Do not use hard-coded values in components. Every colour, size, space and duration comes from `tokens.css`.
- Do not change the portrait crop or treatment by hand. Re-run `tools/stylize-portrait.py`, and keep the chin clear of the name.
- Do not write em dashes, hedging or marketing tone. First person, verbs over titles. Yousician is past tense and the exit is never explained. Never invent numbers.
- Do not put long-form or visually hidden SEO text on the homepage. It belongs on /about, in JSON-LD and in llms.txt.
- Do not add availability lines or job titles to the panel; the hero headline is the h1 and the only title on the page.
- Do not make dark mode automatic. Light is the default for everyone; dark only through the nav toggle (saved in localStorage "theme").
