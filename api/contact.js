/* POST /api/contact · Vercel Function behind the form on /apps/.
   Sends the message through Resend to an address that never appears in the page.

   Env vars (Vercel project settings):
     RESEND_API_KEY  Resend API key with send access
     CONTACT_TO      where messages land (kept private)
     CONTACT_FROM    verified sender, e.g. "Newconic Ventures <apps@sven.fm>" */

const LIMITS = { name: 120, email: 200, app: 60, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  const wantsJson = String(req.headers.accept || "").includes("application/json");
  const reply = (code, error) => {
    if (wantsJson) return res.status(code).json(error ? { error } : { ok: true });
    res.statusCode = 303;
    res.setHeader("Location", "/apps/?sent=" + (error ? "0" : "1") + "#contact");
    return res.end();
  };

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const field = (k) => String(body[k] || "").trim().slice(0, LIMITS[k]);
  const name = field("name");
  const email = field("email");
  const app = field("app") || "Not specified";
  const message = field("message");

  // Honeypot filled: pretend success so bots learn nothing.
  if (body.company) return reply(200);

  if (!name || !message || !EMAIL.test(email)) {
    return reply(400, "Please fill in your name, a valid email and a message.");
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error("contact: missing RESEND_API_KEY, CONTACT_TO or CONTACT_FROM");
    return reply(500, "The form is not set up yet. Please try again later.");
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: email,
      subject: `[${app}] Message from ${name}`.replace(/[\r\n]+/g, " "),
      text: `App: ${app}\nName: ${name}\nEmail: ${email}\n\n${message}\n\n— sent from sven.fm/apps`,
    }),
  });

  if (!r.ok) {
    console.error("contact: Resend error", r.status, await r.text());
    return reply(502, "Something went wrong. Please try again.");
  }
  return reply(200);
};
