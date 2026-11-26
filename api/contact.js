/* POST /api/contact: Vercel Function behind the forms on / (home) and /apps/.
   Sends the message through Resend to an address that never appears in the page.

   Env vars (Vercel project settings):
     RESEND_API_KEY  Resend API key with send access
     CONTACT_TO      where messages land (kept private)
     CONTACT_FROM    verified sender, e.g. "Newconic Ventures <apps@sven.fm>" */

const LIMITS = { name: 120, email: 200, message: 5000 };
// Where each form lives. Only these paths are used for the no-JS redirect back.
const PAGES = { home: "/", apps: "/apps/" };
// The values of the select on /apps/. Anything else is stored as "Something else".
const APPS = ["Train with Kalle", "TrainingZones", "Snanify", "Seconds", "Rosie", "Something else"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Requests must come from the site itself (or a local preview).
const ORIGIN = /^https:\/\/(www\.)?sven\.fm$|^http:\/\/localhost(:\d+)?$/;

// Simple per-instance rate limit: 5 messages per IP per 10 minutes.
// Fluid Compute reuses instances, so this stops bursts; it is not a global quota.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function originOf(req) {
  const o = req.headers.origin;
  if (o) return o;
  try { return new URL(req.headers.referer || "").origin; } catch { return ""; }
}

module.exports = async (req, res) => {
  const wantsJson = String(req.headers.accept || "").includes("application/json");
  const body = typeof req.body === "object" && req.body ? req.body : {};
  const source = Object.hasOwn(PAGES, body.source) ? body.source : "apps";
  const reply = (code, error) => {
    if (wantsJson) return res.status(code).json(error ? { error } : { ok: true });
    res.statusCode = 303;
    res.setHeader("Location", PAGES[source] + (error ? "#contact-failed" : "#contact-sent"));
    return res.end();
  };

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ORIGIN.test(originOf(req))) return reply(403, "Please send the form from sven.fm.");

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return reply(429, "Too many messages. Please try again in a few minutes.");

  const field = (k) => String(body[k] || "").trim().slice(0, LIMITS[k]);
  const name = field("name");
  const email = field("email");
  const message = field("message");
  const picked = String(body.app || "");
  const app = source === "home" ? "sven.fm" : APPS.includes(picked) ? picked : "Something else";

  // Honeypot filled: pretend success so bots learn nothing.
  if (body.hp_x7) return reply(200);

  if (!name || !message || !EMAIL.test(email)) {
    return reply(400, "Please fill in your name, a valid email and a message.");
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error("contact: missing RESEND_API_KEY, CONTACT_TO or CONTACT_FROM");
    return reply(500, "The form is not set up yet. Please try again later.");
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: `[${app}] Message from ${name}`.replace(/[\r\n]+/g, " "),
        text: `${source === "home" ? "" : `App: ${app}\n`}Name: ${name}\nEmail: ${email}\n\n${message}\n\nSent from sven.fm${PAGES[source]}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      console.error("contact: Resend error", r.status, await r.text());
      return reply(502, "Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("contact: Resend request failed", err && err.name);
    return reply(502, "Something went wrong. Please try again.");
  }
  return reply(200);
};
