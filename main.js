/* sven.fm · progressive enhancement only. The page is complete without it. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");

  /* 1. First paint: name, photo and deck land in sequence once fonts are in. */
  function ready() { root.classList.add("is-ready"); }
  if (reduced) ready();
  else {
    var go = function () { requestAnimationFrame(function () { requestAnimationFrame(ready); }); };
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 700); })]).then(go);
    } else { go(); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* 2. Header turns to glass after the first scroll. */
    var hdr = document.getElementById("hdr");
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 24); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* 3. Reveals. Anything already on screen, or missed, is shown at once. */
    var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
    var show = function (el) { el.classList.add("is-in"); };
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(show); }
    else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el, i) {
        el.style.transitionDelay = ((i % 3) * 70) + "ms";
        io.observe(el);
      });
      window.addEventListener("load", function () {
        setTimeout(function () {
          els.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) show(el); });
        }, 300);
      });
    }

    /* 4. The portrait leans a few pixels toward the pointer. Desktop only. */
    var photo = document.querySelector(".hero__photo img");
    if (photo && !reduced && window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 821px)").matches) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var tick = function () {
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        photo.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0) scale(1.03)";
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : 0;
      };
      document.querySelector(".hero").addEventListener("pointermove", function (e) {
        tx = (e.clientX / innerWidth - 0.5) * -14;
        ty = (e.clientY / innerHeight - 0.5) * -10;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    }

    /* 5. Theme toggle. Dark unless the visitor picked light; a click is remembered. */
    var btn = document.getElementById("theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    var apply = function (t) {
      root.dataset.theme = t;
      if (meta) meta.content = t === "light" ? "#DCE4D2" : "#08100B";
      if (btn) btn.setAttribute("aria-label", t === "light" ? "Switch to dark mode" : "Switch to light mode");
    };
    apply(root.dataset.theme === "light" ? "light" : "dark");
    if (btn) btn.addEventListener("click", function () {
      var t = root.dataset.theme === "light" ? "dark" : "light";
      apply(t);
      try { localStorage.setItem("theme", t); } catch (e) {}
    });

    /* 6. Year. */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
