/* ============================================================================
   sven.fm — main.js
   ----------------------------------------------------------------------------
   Everything client-side, vanilla, no dependencies:

     1. <fm-waveform>     the signature ambient signal (canvas custom element)
     2. Theme toggle      persisted in localStorage, follows OS until overridden
     3. Role rotation     crossfade through engagement modes, pauses on hover/focus
     4. Scroll reveals    [data-reveal] fade + rise once into view
     5. Metric count-up   [data-count] counts 0 → target on scroll-into-view
     6. Sticky CTA        [data-sticky-cta] appears once the hero is scrolled past
     7. Portfolio favicons DuckDuckGo icon with a letter-chip fallback

   Core content (copy, links, the static "Book a call" anchors) works with JS
   off. Everything here is progressive enhancement and degrades to static under
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  function cssMs(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    if (!v) return fallback;
    return v.indexOf("ms") > -1 ? parseFloat(v) : parseFloat(v) * 1000;
  }

  /* ── 1. Signature waveform <fm-waveform> ──────────────────────────────── */
  class FMWaveform extends HTMLElement {
    connectedCallback() {
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("aria-hidden", "true");
      Object.assign(this.canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
        pointerEvents: "none",
      });
      if (getComputedStyle(this).position === "static") this.style.position = "relative";
      this.appendChild(this.canvas);

      this.reduced = reduced;
      this._visible = true;
      this._ro = new ResizeObserver(() => this._size());
      this._ro.observe(this);
      this._size();

      // Pause the loop when scrolled off-screen (saves battery / main thread).
      if ("IntersectionObserver" in window) {
        this._io = new IntersectionObserver((entries) => {
          this._visible = entries[0].isIntersecting;
          if (this._visible && !this.reduced && !this._raf) this._loop();
        }, { threshold: 0 });
        this._io.observe(this);
      }

      if (this.reduced) this._draw(0.8);
      else this._loop();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
    }

    _num(attr, fallback) {
      var v = parseFloat(this.getAttribute(attr));
      return Number.isFinite(v) ? v : fallback;
    }
    _accent() {
      return getComputedStyle(this).getPropertyValue("--accent").trim() || "#23E5A2";
    }
    _size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = this.clientWidth || 1;
      var h = this.clientHeight || 120;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this._ctx = this.canvas.getContext("2d");
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._w = w; this._h = h;
      if (this.reduced) this._draw(0.8);
    }
    _draw(t) {
      var ctx = this._ctx, w = this._w, h = this._h, accent = this._accent();
      if (!ctx) return;
      var base = h * this._num("baseline", 0.62);
      var amp = this._num("amplitude", 0.18);
      var speed = this._num("speed", 0.9);
      var glow = this._num("glow", 10);

      ctx.clearRect(0, 0, w, h);

      // resting baseline
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.18; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(w, base); ctx.stroke();

      var wave = function (a, freq, sp, phase, alpha, lw, g) {
        ctx.globalAlpha = alpha; ctx.lineWidth = lw;
        ctx.strokeStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = g;
        ctx.beginPath();
        for (var x = 0; x <= w; x += 2) {
          var env = 0.5 + 0.5 * Math.sin(x * 0.004 + t * 0.4); // slow modulation
          var y = base + Math.sin(x * freq + t * sp + phase) * a * env;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
      };

      wave(h * amp, 0.012, speed, 0, 0.9, 2, glow);                // primary
      wave(h * amp * 0.55, 0.022, -speed * 0.67, 1.6, 0.35, 1.2, 0); // harmonic
      ctx.globalAlpha = 1;
    }
    _loop() {
      if (!this._visible) { this._raf = null; return; }
      this._draw(performance.now() / 1000);
      this._raf = requestAnimationFrame(() => this._loop());
    }
  }
  if (!customElements.get("fm-waveform")) customElements.define("fm-waveform", FMWaveform);

  /* ── 2. Theme toggle ──────────────────────────────────────────────────── */
  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    function sync() {
      var t = root.getAttribute("data-theme") || "dark";
      btn.textContent = t === "dark" ? "Light" : "Dark";
      btn.setAttribute("aria-pressed", String(t === "light"));
    }
    sync();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("fm-theme", next); } catch (e) {}
      sync();
    });
    // Follow OS changes until the user has made an explicit choice.
    try {
      var mq = matchMedia("(prefers-color-scheme: light)");
      var handler = function (e) {
        var stored = null;
        try { stored = localStorage.getItem("fm-theme"); } catch (err) {}
        if (!stored) { root.setAttribute("data-theme", e.matches ? "light" : "dark"); sync(); }
      };
      if (mq.addEventListener) mq.addEventListener("change", handler);
      else if (mq.addListener) mq.addListener(handler);
    } catch (e) {}
  }

  /* ── 3. Role rotation ─────────────────────────────────────────────────── */
  function initRoles() {
    var el = document.querySelector("[data-roles]");
    if (!el) return;
    var roles;
    try { roles = JSON.parse(el.dataset.roles); } catch (e) { return; }
    if (!Array.isArray(roles) || !roles.length) return;

    var i = 0;
    el.textContent = roles[0];
    if (reduced) return; // one fixed phrase, no cycling

    el.style.transition = "opacity var(--dur-swap, 280ms) var(--ease-out, ease)";
    var swap = cssMs("--dur-swap", 280);
    var interval = cssMs("--rotate-interval", 2400);
    var paused = false, timer = null;

    function advance() {
      if (paused) return;
      el.style.opacity = "0";
      setTimeout(function () {
        i = (i + 1) % roles.length;
        el.textContent = roles[i];
        el.style.opacity = "1";
      }, swap);
    }
    timer = setInterval(advance, interval);

    // Pause on hover/focus of the surrounding line, and when the tab is hidden.
    var host = el.closest(".fm-roleline") || el;
    var pause = function () { paused = true; };
    var resume = function () { paused = false; };
    host.addEventListener("mouseenter", pause);
    host.addEventListener("mouseleave", resume);
    host.addEventListener("focusin", pause);
    host.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
    });
  }

  /* ── 4. Scroll reveals ────────────────────────────────────────────────── */
  function initReveals() {
    var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;

    if (reduced) { els.forEach(function (e) { e.style.opacity = "1"; e.style.transform = "none"; }); return; }

    var dur = cssMs("--dur-reveal", 700);
    els.forEach(function (e) {
      e.style.opacity = "0";
      e.style.transform = "translateY(18px)";
      e.style.transition = "opacity " + dur + "ms var(--ease-out, ease), transform " + dur + "ms var(--ease-out, ease)";
    });
    function show(e) { e.style.opacity = "1"; e.style.transform = "none"; e.dataset.shown = "1"; }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (e) { io.observe(e); });
    }
    setTimeout(function () { els.forEach(function (e) { if (!e.dataset.shown) show(e); }); }, 2600);
  }

  /* ── 5. Metric count-up ───────────────────────────────────────────────── */
  function initCounters() {
    var els = [].slice.call(document.querySelectorAll("[data-count]"));
    if (!els.length) return;

    els.forEach(function (el) {
      var target = parseFloat(el.dataset.count) || 0;
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      var set = function (v) { el.textContent = prefix + Math.round(v) + suffix; };

      if (reduced) { set(target); return; }
      set(0);

      var dur = cssMs("--dur-count", 1300);
      var started = false;
      function run() {
        if (started) return; started = true;
        var t0 = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          set(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); run(); } });
        }, { threshold: 0.4 });
        io.observe(el);
      } else { run(); }
      setTimeout(run, 2600); // safety net
    });
  }

  /* ── 6. Sticky CTA — appears once the hero is scrolled past ───────────── */
  function initSticky() {
    var ctas = [].slice.call(document.querySelectorAll("[data-sticky-cta]"));
    var hero = document.querySelector(".fm-hero");
    var closing = document.querySelector(".fm-close");
    if (!ctas.length || !hero) return;

    // Show once the hero is gone, but hide again when the closing CTA (which
    // already offers "Book a call") is on screen, so it never sits redundantly.
    var pastHero = false, atClosing = false;
    function apply() { var v = pastHero && !atClosing; ctas.forEach(function (c) { c.classList.toggle("is-visible", v); }); }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        pastHero = !e[0].isIntersecting; apply();
      }, { threshold: 0, rootMargin: "-40% 0px 0px 0px" }).observe(hero);

      if (closing) {
        new IntersectionObserver(function (e) {
          atClosing = e[0].isIntersecting; apply();
        }, { threshold: 0 }).observe(closing);
      }
    } else {
      window.addEventListener("scroll", function () {
        pastHero = window.scrollY > hero.offsetHeight * 0.6;
        atClosing = closing ? closing.getBoundingClientRect().top < window.innerHeight : false;
        apply();
      }, { passive: true });
    }
  }

  /* ── 7. Portfolio favicons (DuckDuckGo → letter chip) ─────────────────── */
  function initFavicons() {
    document.querySelectorAll(".fm-fav__img").forEach(function (img) {
      var domain = img.getAttribute("data-domain");
      if (!domain) return;
      img.addEventListener("error", function () {
        var parent = img.closest(".fm-fav");
        if (parent) parent.classList.add("is-fallback");
      });
      img.addEventListener("load", function () {
        if (img.naturalWidth < 8 || img.naturalHeight < 8) img.dispatchEvent(new Event("error"));
      });
      img.src = "https://icons.duckduckgo.com/ip3/" + domain + ".ico";
    });
  }

  /* ── boot ─────────────────────────────────────────────────────────────── */
  function init() {
    initTheme();
    initRoles();
    initReveals();
    initCounters();
    initSticky();
    initFavicons();
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
