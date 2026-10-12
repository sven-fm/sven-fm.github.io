# sven.fm

Personal site of Sven Ahrens. Plain static HTML, CSS and a little JS, deployed on Vercel from `main`. No framework, no build step.

| Path | What |
|---|---|
| `index.html` | Home: name, one sentence, three numbers, experience, investments, contact. |
| `profile/index.html` | The full record for readers and crawlers, with its own JSON-LD. |
| `styles.css`, `main.js` | The whole design system in code, and progressive enhancement (reveals, theme toggle, portrait parallax). |
| `llms.txt`, `sitemap.xml`, `robots.txt` | For crawlers and LLMs. |
| `design-system/` | `BRAND.md` (voice and visual rules), `README.md` (engineering reference), `tokens.json`, component specs, OG card and favicon sources. |

After a deploy that changes copy: `bash design-system/indexnow.sh / /profile/`, then request indexing in Google Search Console.
