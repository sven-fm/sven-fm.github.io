/* sven.fm interactions, route C3 Signal.
   Vanilla, progressive enhancement: the page is complete without this file.
   No scroll listeners: section tracking uses IntersectionObserver. */
(() => {
  const root = document.querySelector(".site");
  const mq = (q) => window.matchMedia(q);
  const sticky = mq("(min-width: 901px) and (min-height: 640px)");
  const narrow = mq("(max-width: 900px)");

  /* 1. Control panel: which section is in the middle of the viewport.
        Sets data-sec on .site; CSS moves the readout reel, the meter and the portrait (desktop panel)
        or the stats bar (mobile). On mobile, data-bar marks the panel as scrolled away, which shows the bar. */
  let io = null, panelIo = null;
  const sections = [...document.querySelectorAll("[data-sec]")];
  const panel = document.querySelector(".panel");
  const track = () => {
    if (io) { io.disconnect(); io = null; }
    if (panelIo) { panelIo.disconnect(); panelIo = null; }
    if (!root) return;
    root.removeAttribute("data-bar");
    if (!(sticky.matches || narrow.matches) || !("IntersectionObserver" in window) || !sections.length) {
      root.removeAttribute("data-sec");
      return;
    }
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) root.dataset.sec = e.target.dataset.sec;
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach((s) => io.observe(s));
    if (panel && narrow.matches) {
      panelIo = new IntersectionObserver(([e]) => {
        root.toggleAttribute("data-bar", !e.isIntersecting && e.boundingClientRect.top < 0);
      });
      panelIo.observe(panel);
    }
  };
  track();
  sticky.addEventListener("change", track);
  narrow.addEventListener("change", track);

  /* 2. Link underline draws in from the side the pointer entered. */
  document.addEventListener("pointerover", (e) => {
    const a = e.target.closest(".link");
    if (!a || a.contains(e.relatedTarget)) return;
    const r = a.getBoundingClientRect();
    a.style.setProperty("--o", e.clientX - r.left < r.width / 2 ? "left" : "right");
  });

  /* 2b. Product shelf: the tab of the slide in view is current; a tab scrolls its slide in.
         Without JS the tabs are plain anchors and the track still swipes and snaps. */
  const shelf = document.querySelector(".shelf__track");
  if (shelf && "IntersectionObserver" in window) {
    const tabs = [...document.querySelectorAll(".shelf__tab")];
    const slides = [...shelf.children];
    const mark = (i) => tabs.forEach((t, j) => t.setAttribute("aria-current", String(i === j)));
    const sio = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) mark(slides.indexOf(e.target));
    }, { root: shelf, threshold: 0.6 });
    slides.forEach((s) => sio.observe(s));
    tabs.forEach((t, i) => t.addEventListener("click", (e) => {
      e.preventDefault();
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      shelf.scrollTo({ left: slides[i].offsetLeft - shelf.offsetLeft, behavior: instant ? "auto" : "smooth" });
      mark(i);
    }));
  }

  /* 3. CTA press: short haptic tick on Android; silently ignored elsewhere. */
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".cta, .cta-li") && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
  });

  /* 4. Portfolio: pointing at or focusing a name writes what the company does into the caption line. */
  const list = document.querySelector(".portfolio__list");
  const cap = document.querySelector(".portfolio__caption");
  if (list && cap) {
    const show = (e) => {
      const li = e.target.closest("li[data-d]");
      if (li) cap.textContent = li.dataset.name + ": " + li.dataset.d;
    };
    cap.textContent = "Point at or tap a name to see what they do.";
    /* Descriptions are also in the list itself for screen readers, so the caption is decorative. */
    list.addEventListener("pointerover", show);
  }

  /* 5. Contact form (home and /apps/): send without leaving the page.
        Without JS the form posts normally and /api/contact redirects back to #contact-sent or #contact-failed. */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    /* /apps/?app=Seconds preselects the app in the select. */
    const pick = new URLSearchParams(location.search).get("app");
    const sel = form.querySelector('select[name="app"]');
    if (pick && sel) for (const o of sel.options) if (o.value === pick) o.selected = true;
    const FAIL = "Something went wrong. Please try again, or book a call instead.";
    form.addEventListener("submit", (e) => {
      if (!window.fetch) return;
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = form.querySelector("button");
      btn.disabled = true;
      status.textContent = "Sending…";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
        .then((r) => r.json().catch(() => ({})).then((j) => {
          if (!r.ok) throw Object.assign(new Error(j.error || FAIL), { fromServer: !!j.error });
          form.reset();
          status.textContent = "Thanks, your message is on its way.";
        }))
        /* Network failures (offline, blocked) surface as TypeError with browser wording; never show that. */
        .catch((err) => { status.textContent = err.fromServer ? err.message : FAIL; })
        .finally(() => { btn.disabled = false; });
    });
  }

  /* 6. Theme toggle: light for everyone by default; the choice is remembered. */
  const html = document.documentElement;
  const sync = () => {
    const dark = html.dataset.theme === "dark";
    document.querySelectorAll(".theme-toggle").forEach((b) => b.setAttribute("aria-pressed", String(dark)));
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-toggle")) return;
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (_) {}
    sync();
  });
  sync();
})();
