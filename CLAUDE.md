# sven.fm

Static site on Vercel. Every page uses the C3 Signal route. /styles.css and /main.js are the source of truth: edit them directly. This file is the only rulebook: design/round2/ is the original spec, kept for history, and where it differs this file wins. design/, *.md and other working files are kept off the deploy by .vercelignore. Home and /about/ use the split panel; /apps/ pages use the doc layout (dark band header, one column).

## sven.fm design rules (route C3 Signal): do not

- Do not add horizontal rules, hairlines or borders between sections, rows or list items. Space and type do the separating.
- Do not animate the right column on scroll unless it is needed or asked for. By default the left panel (readout reel, meter, portrait) and the phone stats bar are the scroll-reactive elements.
- Do not add entrance animations, fade-ups, count-ups, marquees, parallax, page loaders, typewriter or scramble text, custom cursors, cursor followers, magnetic buttons, scroll-jacking or smooth-scroll libraries. A carousel may auto-advance only when asked for, and then it pauses on hover and touch and stays still under reduced motion.
- Do not use GSAP, Framer Motion or any animation library. Interaction JS stays vanilla, progressive and under 8 KB gzip; the page must work without it.
- Do not put hover effects outside `@media (hover: hover) and (pointer: fine)`. Do not ship any motion without its `prefers-reduced-motion` fallback.
- Do not use any font other than Funnel Display (display roles, 600 to 800) and Host Grotesk (everything else, including all numbers). No monospace for figures. Never load fonts from the Google Fonts CDN or Adobe Fonts.
- Do not add a second call to action. "Book a call" exists in the panel and the footer, each with the square LinkedIn icon button right next to it, plus on phones a small square phone-icon button fixed in the bottom-right corner (only once the panel has scrolled away). No nav button, no section buttons, no stacked CTAs.
- Do not publish an email address anywhere on the site (spam). Contact is Book a call, LinkedIn and the contact forms (home and /apps/), which send through /api/contact so the address stays in Vercel env vars.
- Do not spread the signal colour around. It fills the CTA and marks the progress meter, the "exit" marker and the /apps/ form submit; beyond those, use it sparingly on a key element only where it adds value, never as a background wash or decoration.
- Do not round corners, add shadows, gradients, glass, blobs, dot grids or mesh backgrounds. `--radius` is 0.
- Do not use uppercase eyebrow labels, 01/02/03 numbering, middle-dot separators, decorative arrows after link text, emoji, pill badges, icon libraries or icon fonts, bento boxes or 3-card feature grids. Do not present the offer as cards. Single inline SVG icons in currentColor are fine (LinkedIn, phone, theme toggle, carousel arrows), and so are arrow buttons that control a carousel.
- Do not show client logos in colour. Logos come from the sprite and use currentColor.
- Do not use iframes for the product proof. Device frames are fine. Static AVIF/WebP screenshots, ≤ 200 KB each, lazy-loaded, with width and height.
- Do not use hard-coded values in components. Every colour, size, space and duration comes from the tokens in the `:root` block of `styles.css`.
- Do not change the portrait crop or treatment by hand. Re-run `design/round2/tools/stylize-portrait.py`, and keep the chin clear of the name. Positioning the image with CSS (the `--portrait-*` tokens) is fine.
- Do not write em dashes, hedging or marketing tone. First person, verbs over titles. Yousician is past tense and the exit is never explained.
- Do not write ranges with anything but a short dash set in the site font, Host Grotesk: $5-200M, 2016–24.
- Do not put long-form or visually hidden SEO text on the homepage. It belongs on /about, in JSON-LD and in llms.txt.
- Do not add availability lines or job titles to the panel; the hero headline is the h1 and the only title on the page.
- Do not make dark mode automatic. Light is the default for everyone; dark only through the nav toggle (saved in localStorage "theme").

## Working rules

- Push to main (which deploys) only when Sven says so. Commit locally first, then ask.
- Never send real data to the live /api/contact. Test the form locally or with invalid input.
- Never commit `.claude/` or `.env*`.
- Never publish personal data from Sven's product accounts (Kalle chat history, activity log, locations) in screenshots or the repo.
- Images in /assets/img are cached for a week: give a changed image a new file name.
