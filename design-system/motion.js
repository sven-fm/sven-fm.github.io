/* ============================================================================
   sven.fm — Motion · "Pine"
   ----------------------------------------------------------------------------
   The behaviour layer. Identical to /main.js in the production build — this
   copy is the reference; change both together or they drift.

     1. Mobile menu       hamburger morphs to an X, sheet under the sticky bar
     2. Role crossfade    hero role cycles, pauses on hover/focus and hidden tab
     3. Scroll reveals    [data-reveal] fades + rises once into view
     4. Parallax drift    [data-drift] eases against its own document position
     5. Metric count-up   [data-count] counts 0 -> target on scroll-into-view
     6. Favicon chips     .fav img[data-domain] -> /assets/portfolio, letter fallback
     7. Footer year       #year

   Markup hooks:

     <p data-drift="0.035">…</p>                      parallax, rate per element
     <div data-reveal>…</div>                          fade + rise into view
     <div data-count="60" data-suffix="%+">60%+</div>  count 0 -> 60, render "60%+"
     <span data-roles='["a","b"]'>a.</span>            crossfade through phrases
     <span class="fav"><span class="fav__letter">A</span>
       <img data-domain="alba.tech" alt="" loading="lazy" /></span>

   Every value the markup needs is already rendered in the HTML, so the page is
   complete with JavaScript off, and every motion drops to static under
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.2,.7,.2,1)";
  var MOBILE = "(max-width: 820px)";

  /* ── 1. Mobile menu ───────────────────────────────────────────────────
     Display of the button and the sheet is CSS-driven (820px breakpoint);
     this only carries the open/closed state. */
  function initMenu() {
    var btn = document.getElementById("menu-btn");
    var sheet = document.getElementById("menu-sheet");
    if (!btn || !sheet) return;

    function set(open) {
      btn.setAttribute("aria-expanded", String(open));
      sheet.classList.toggle("is-open", open);
    }
    set(false);

    btn.addEventListener("click", function () {
      set(btn.getAttribute("aria-expanded") !== "true");
    });
    // Any tap on a nav item closes the sheet.
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("a")) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") set(false);
    });
    // Leaving the mobile breakpoint resets the state.
    var mq = matchMedia(MOBILE);
    var onChange = function () { set(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ── 2. Role crossfade ────────────────────────────────────────────────
     Out (opacity + rise + blur), swap the text, back in. Never a hard swap. */
  function initRoles() {
    var el = document.querySelector("[data-roles]");
    if (!el) return;
    var roles;
    try { roles = JSON.parse(el.dataset.roles); } catch (e) { return; }
    if (!Array.isArray(roles) || !roles.length) return;

    var i = 0;
    el.textContent = roles[0] + ".";
    if (reduced) return; // one fixed phrase, no cycling

    var paused = false;
    setInterval(function () {
      if (paused) return;
      el.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % roles.length;
        el.textContent = roles[i] + ".";
        el.classList.remove("is-out");
      }, 420);
    }, 3400);

    var host = el.closest(".roleline") || el;
    host.addEventListener("mouseenter", function () { paused = true; });
    host.addEventListener("mouseleave", function () { paused = false; });
    host.addEventListener("focusin", function () { paused = true; });
    host.addEventListener("focusout", function () { paused = false; });
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
    });
  }

  /* ── 3. Scroll reveals ────────────────────────────────────────────────
     Only blocks below the fold are hidden to begin with, and a scroll sweep
     catches anything the observer misses — a deep link or a restored scroll
     position must never leave a block invisible. */
  function initReveals() {
    var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length || reduced) return;

    var TRANS = "opacity 900ms " + EASE + ", transform 900ms " + EASE;
    function show(el) {
      el.style.transition = TRANS;
      el.style.opacity = "1";
      el.style.transform = "none";
      if (io) io.unobserve(el);
    }

    var io = "IntersectionObserver" in window
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
        }, { rootMargin: "0px 0px -12% 0px" })
      : null;

    var pending = [];
    els.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already in view
      el.style.opacity = "0";
      el.style.transform = "translate3d(0," + 16 + "px,0)";
      el.style.transitionDelay = ((i % 4) * 70) + "ms";
      pending.push(el);
      if (io) io.observe(el);
    });
    if (!pending.length) return;

    function sweep() {
      pending = pending.filter(function (el) {
        if (el.style.opacity !== "0") return false;
        if (el.getBoundingClientRect().top < window.innerHeight) { show(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener("scroll", sweep);
    }
    window.addEventListener("scroll", sweep, { passive: true });
    if (!io) sweep();
  }

  /* ── 4. Parallax drift ────────────────────────────────────────────────
     Offset comes from each element's own document position, smoothed and
     clamped. Driving it off absolute scrollY accumulates 100px+ far down the
     page and collides with neighbouring text. */
  function initDrift() {
    var els = [].slice.call(document.querySelectorAll("[data-drift]"));
    if (!els.length || reduced) return;

    var anchors = new Map();
    function measure() {
      els.forEach(function (el) {
        var prev = el.style.transform;
        el.style.transform = "none";
        anchors.set(el, el.getBoundingClientRect().top + window.scrollY);
        el.style.transform = prev;
      });
    }
    els.forEach(function (el) { el.style.willChange = "transform"; });
    measure();
    window.addEventListener("resize", measure);

    var cur = window.scrollY;
    (function tick() {
      cur += (window.scrollY - cur) * 0.06;
      els.forEach(function (el) {
        var rate = parseFloat(el.getAttribute("data-drift")) || 0;
        var rel = (cur + window.innerHeight / 2) - (anchors.get(el) || 0);
        var y = Math.max(-44, Math.min(44, -rel * rate));
        el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ── 5. Metric count-up ───────────────────────────────────────────────
     The final value is already in the markup, so this only ever animates
     toward what is rendered without JS. */
  function initCounters() {
    var els = [].slice.call(document.querySelectorAll("[data-count]"));
    if (!els.length || reduced) return;

    els.forEach(function (el) {
      var target = parseFloat(el.dataset.count) || 0;
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      var set = function (v) { el.textContent = prefix + Math.round(v) + suffix; };

      set(0);

      var started = false;
      function run() {
        if (started) return;
        started = true;
        var t0 = performance.now();
        (function frame(now) {
          var p = Math.min(1, (now - t0) / 1300);
          set(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(frame);
        })(t0);
      }

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); run(); } });
        }, { threshold: 0.4 });
        io.observe(el);
      } else { run(); }
      setTimeout(run, 2600); // safety net
    });
  }

  /* ── 6. Portfolio favicons ────────────────────────────────────────────
     The white chip renders the company initial; the icon fades in over it if
     one exists in /assets/portfolio (fetched once by
     design-system/fetch-favicons.py — no third-party request per visit).
     A missing file 404s, a blank one has naturalWidth < 8, and either way the
     letter stays. Requested after first paint, never blocking. */
  function initFavicons() {
    setTimeout(function () {
      document.querySelectorAll(".fav img[data-domain]").forEach(function (img) {
        var chip = img.closest(".fav");
        var letter = chip && chip.querySelector(".fav__letter");
        var dual = chip && chip.classList.contains("fav--dual");
        function fail() { img.style.display = "none"; }
        img.addEventListener("load", function () {
          if (img.naturalWidth < 8 || img.naturalHeight < 8) return fail();
          img.style.opacity = "1";
          if (letter) {
            letter.style.opacity = "0";
            // Dual chips lay out in flow, so the letter has to leave the box.
            if (dual) letter.style.display = "none";
            else letter.style.visibility = "hidden";
          }
        });
        img.addEventListener("error", fail);
        img.src = "/assets/portfolio/" + img.getAttribute("data-domain") + ".png";
      });
    }, 80);
  }

  /* ── boot ─────────────────────────────────────────────────────────────
     Reveal/drift measure after layout has settled. */
  function init() {
    initMenu();
    initRoles();
    initFavicons();
    initCounters();
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
    setTimeout(function () { initReveals(); initDrift(); }, 60);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
