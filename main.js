/* sven.fm interactions, route C3 Signal.
   Vanilla, progressive enhancement: the page is complete without this file.
   No scroll listeners: section tracking uses IntersectionObserver. */
(() => {
  const root = document.querySelector(".site");
  const mq = (q) => window.matchMedia(q);
  const reduced = mq("(prefers-reduced-motion: reduce)");
  const finePointer = mq("(hover: hover) and (pointer: fine)");
  const sticky = mq("(min-width: 901px) and (min-height: 640px)");

  /* 1. Control panel: which section is in the middle of the viewport.
        Sets data-sec on .site; CSS moves the readout reel, the meter and the portrait. */
  let io = null;
  const sections = [...document.querySelectorAll("[data-sec]")];
  const track = () => {
    if (io) { io.disconnect(); io = null; }
    if (!root) return;
    if (!sticky.matches || !("IntersectionObserver" in window) || !sections.length) {
      root.removeAttribute("data-sec");
      return;
    }
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) root.dataset.sec = e.target.dataset.sec;
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach((s) => io.observe(s));
  };
  track();
  sticky.addEventListener("change", track);

  /* 2. Link underline draws in from the side the pointer entered. */
  document.addEventListener("pointerover", (e) => {
    const a = e.target.closest(".link");
    if (!a || a.contains(e.relatedTarget)) return;
    const r = a.getBoundingClientRect();
    a.style.setProperty("--o", e.clientX - r.left < r.width / 2 ? "left" : "right");
  });

  /* 3. Product plates: screenshot follows the cursor inside its frame, like a print under glass. */
  let raf = 0;
  document.addEventListener("pointermove", (e) => {
    if (!finePointer.matches || reduced.matches) return;
    const p = e.target.closest(".plate");
    if (!p) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = p.getBoundingClientRect();
      p.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      p.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const p = e.target.closest(".plate");
    if (!p || p.contains(e.relatedTarget)) return;
    p.style.setProperty("--px", "0");
    p.style.setProperty("--py", "0");
  });

  /* 4. CTA press: short haptic tick on Android; silently ignored elsewhere. */
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".cta, .cta-li") && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
  });

  /* 5. Portfolio: pointing at or focusing a name writes what the company does into the caption line. */
  const list = document.querySelector(".portfolio__list");
  const cap = document.querySelector(".portfolio__caption");
  if (list && cap) {
    const show = (e) => {
      const li = e.target.closest("li[data-d]");
      if (li) cap.textContent = li.dataset.name + ": " + li.dataset.d;
    };
    cap.textContent = "Point at or tap a name to see what they do.";
    list.addEventListener("pointerover", show);
    list.addEventListener("focusin", show);
  }

  /* 6. Contact form (home and /apps/): send without leaving the page.
        Without JS the form posts normally and /api/contact redirects back with ?sent=1 or ?sent=0. */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    if (/[?&]sent=1/.test(location.search)) status.textContent = "Thanks, your message is on its way.";
    if (/[?&]sent=0/.test(location.search)) status.textContent = "Something went wrong. Please try again.";
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
          if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
          form.reset();
          status.textContent = "Thanks, your message is on its way.";
        }))
        .catch((err) => { status.textContent = err.message; })
        .finally(() => { btn.disabled = false; });
    });
  }
})();
