/* sven.fm interactions, route C3 Signal.
   Vanilla, progressive enhancement: the page is complete without this file.
   No scroll listeners: section tracking uses IntersectionObserver. */
(() => {
  const root = document.querySelector(".site");
  if (!root) return;
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
    if (e.target.closest(".cta") && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
  });

  /* 5. Email: click copies, label swaps to "Copied" in place, reverts after 1.2s. mailto stays the no-JS path. */
  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-copy]");
    if (!m || !navigator.clipboard) return;
    e.preventDefault();
    const label = m.querySelector(".mail__label") || m;
    const text = m.dataset.copy;
    const done = () => {
      label.textContent = "Copied";
      m.classList.add("is-copied");
      clearTimeout(m._t);
      m._t = setTimeout(() => { label.textContent = text; m.classList.remove("is-copied"); }, 1200);
    };
    navigator.clipboard.writeText(text).then(done, () => { location.href = m.href; });
  });

  /* 6. Portfolio: pointing at or focusing a name writes what the company does into the caption line. */
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
})();
