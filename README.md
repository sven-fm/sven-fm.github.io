# sven.fm

Personal site of Sven Ahrens. Plain static HTML, CSS and a little JS, deployed on Vercel from `main`. No framework, no build step.

| Path | What |
|---|---|
| `index.html` | Home: control panel with name and booking, fractional offer, track record, Newconic Ventures. |
| `about/index.html` | The full record for readers and crawlers, with its own JSON-LD. `/profile/` 301s here. |
| `apps/` | Newconic Ventures app list, developer contact form (App Store support URL), Seconds privacy and terms. |
| `api/contact.js` | Vercel Function behind the form: sends via Resend. Env: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. |
| `styles.css`, `main.js` | Route C3 Signal, built from `design/round2/` (fonts + tokens + components, plus doc-page styles). |
| `llms.txt`, `sitemap.xml`, `robots.txt` | For crawlers and LLMs. |
| `design/` | Design spec (`round2/README.md`), source CSS/JS and asset tools. |

After a deploy that changes copy: `bash design/tools/indexnow.sh / /about/`, then request indexing in Google Search Console.
