/* ============================================================
   Shreyash Naik - Portfolio · interactions
   ============================================================ */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme (dark / light) ---------- */
  const THEME_KEY = "sn-theme";
  const mqLight = window.matchMedia("(prefers-color-scheme: light)");
  const themeBtn = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(theme === "light"));
      themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
    window.__theme = theme;
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || (mqLight.matches ? "light" : "dark"));

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
  mqLight.addEventListener?.("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "light" : "dark");
  });

  /* ---------- Header scrolled state ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".site-nav a").forEach(a => {
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(el => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.revealDelay || 0);
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------- Project card pointer glow ---------- */
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });

  /* ---------- Smooth anchor scroll + URL update ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const targetId = a.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", targetId);
    });
  });

  /* ---------- Ambient particle / neural-net background ---------- */
  const canvas = document.getElementById("bg-canvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let nodes = [];
    let raf = 0;

    const cfg = {
      density: 0.000055,    // nodes per pixel
      maxNodes: 90,
      minNodes: 30,
      linkDist: 140,
      speed: 0.18,
      nodeColor: "rgba(200, 255, 235, 0.55)",
      linkColor: "rgba(139, 255, 217, ",
    };

    function applyCanvasTheme() {
      if (document.documentElement.getAttribute("data-theme") === "light") {
        cfg.nodeColor = "rgba(5, 150, 105, 0.55)";
        cfg.linkColor = "rgba(5, 150, 105, ";
      } else {
        cfg.nodeColor = "rgba(200, 255, 235, 0.55)";
        cfg.linkColor = "rgba(139, 255, 217, ";
      }
    }
    applyCanvasTheme();
    window.addEventListener("themechange", applyCanvasTheme);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.max(cfg.minNodes, Math.min(cfg.maxNodes, Math.floor(w * h * cfg.density)));
      nodes = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r: Math.random() * 1.4 + 0.4,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }

      // Links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < cfg.linkDist * cfg.linkDist) {
            const alpha = (1 - Math.sqrt(d2) / cfg.linkDist) * 0.35;
            ctx.strokeStyle = cfg.linkColor + alpha.toFixed(3) + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.fillStyle = cfg.nodeColor;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function start() { if (!raf) raf = requestAnimationFrame(step); }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ============================================================
     TOKENIZER DEMO
     Word / mock-BPE subword / character modes, all client-side.
     ============================================================ */
  const tokInput    = document.getElementById("tok-input");
  const tokOutput   = document.getElementById("tok-output");
  const tokCountEl  = document.getElementById("tok-count");
  const tokCharsEl  = document.getElementById("tok-chars");
  const tokAvgEl    = document.getElementById("tok-avg");
  const tokUniqueEl = document.getElementById("tok-unique");
  const tokModeBtns = document.querySelectorAll(".demo-mode [data-tok-mode]");

  if (tokInput && tokOutput) {
    let mode = "word";

    // Deterministic hue from a string — same token always renders same color.
    const hue = (s) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h % 360;
    };

    const tokenStyle = (s) => {
      const H = hue(s.toLowerCase());
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const bg = isLight ? `hsla(${H}, 70%, 92%, 1)` : `hsla(${H}, 60%, 22%, 0.85)`;
      const fg = isLight ? `hsla(${H}, 55%, 28%, 1)` : `hsla(${H}, 85%, 82%, 1)`;
      const br = isLight ? `hsla(${H}, 55%, 70%, 0.45)` : `hsla(${H}, 70%, 55%, 0.35)`;
      return `background:${bg};color:${fg};border-color:${br};`;
    };

    // Mock BPE: split long/complex words into reasonable-looking pieces.
    const mockBPE = (word) => {
      if (word.length <= 3) return [word];
      const vowels = /[aeiouAEIOU]/;
      const pieces = [];
      let cur = "";
      for (let i = 0; i < word.length; i++) {
        cur += word[i];
        const isBoundary =
          (cur.length >= 3 && vowels.test(cur[cur.length - 1]) && i + 1 < word.length && !vowels.test(word[i + 1])) ||
          cur.length >= 4;
        if (isBoundary && word.length - (i + 1) >= 2) {
          pieces.push(cur);
          cur = "";
        }
      }
      if (cur) pieces.push(cur);
      return pieces.length ? pieces : [word];
    };

    const renderToken = (text, kind = "word", isContinuation = false) => {
      const el = document.createElement("span");
      el.className = "token";
      if (kind === "space")      el.classList.add("token-space");
      else if (kind === "punct") el.classList.add("token-punct");
      else if (isContinuation)   el.classList.add("token-subword-cont");
      if (kind !== "space") el.setAttribute("style", tokenStyle(text));
      el.textContent = text;
      el.title = `"${text}" · ${text.length} chars`;
      return el;
    };

    const render = () => {
      const text = tokInput.value;
      tokOutput.innerHTML = "";

      let tokens = [];

      if (mode === "char") {
        tokens = Array.from(text).map(ch => ({
          text: ch,
          kind: /\s/.test(ch) ? "space" : /[^\p{L}\p{N}]/u.test(ch) ? "punct" : "char",
          cont: false,
        }));
      } else {
        // word / subword: split into words + whitespace + punctuation
        const re = /(\s+)|([.,!?;:"'()\[\]{}\/\\|@#\$%\^&\*\+=~`<>-]+)|([\p{L}\p{N}_]+)/gu;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (m[1]) { tokens.push({ text: m[1], kind: "space", cont: false }); continue; }
          if (m[2]) { tokens.push({ text: m[2], kind: "punct", cont: false }); continue; }
          if (m[3]) {
            if (mode === "subword") {
              const pieces = mockBPE(m[3]);
              pieces.forEach((p, i) => tokens.push({ text: p, kind: "word", cont: i > 0 }));
            } else {
              tokens.push({ text: m[3], kind: "word", cont: false });
            }
          }
        }
      }

      const frag = document.createDocumentFragment();
      tokens.forEach(t => frag.appendChild(renderToken(t.text, t.kind, t.cont)));
      tokOutput.appendChild(frag);

      const real = tokens.filter(t => t.kind !== "space");
      const chars = text.length;
      const avg = real.length ? real.reduce((s, t) => s + t.text.length, 0) / real.length : 0;
      const unique = new Set(real.map(t => t.text.toLowerCase())).size;

      tokCountEl.textContent  = real.length.toLocaleString();
      tokCharsEl.textContent  = chars.toLocaleString();
      tokAvgEl.textContent    = avg.toFixed(2);
      tokUniqueEl.textContent = unique.toLocaleString();
    };

    tokInput.addEventListener("input", render);
    tokModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tokModeBtns.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        mode = btn.dataset.tokMode;
        render();
      });
    });
    window.addEventListener("themechange", render);
    render();
  }

  /* ============================================================
     HERO TELEMETRY — synthetic but plausible inference metrics.
     Values jitter inside SLO bands typical of an edge inference
     deployment: p50 ~70 ms, p99 ~180 ms, ~120 rps, ~55% GPU util.
     ============================================================ */
  (() => {
    const cells = document.querySelectorAll(".telemetry [data-metric]");
    if (!cells.length) return;

    const SERIES = {
      p50: { base: 72,  jitter: 6,  unit: "ms",  hist: [] },
      p99: { base: 178, jitter: 14, unit: "ms",  hist: [] },
      qps: { base: 124, jitter: 18, unit: "rps", hist: [] },
      gpu: { base: 56,  jitter: 8,  unit: "%",   hist: [] },
    };
    const HIST_LEN = 28;

    // Pre-seed with realistic walks so sparklines render immediately.
    Object.values(SERIES).forEach(s => {
      let v = s.base;
      for (let i = 0; i < HIST_LEN; i++) {
        v += (Math.random() - 0.5) * s.jitter * 0.8;
        v = Math.max(s.base * 0.5, Math.min(s.base * 1.5, v));
        s.hist.push(v);
      }
    });

    const sparkSvgs = {};
    document.querySelectorAll(".telemetry [data-spark]").forEach(node => {
      const key = node.dataset.spark;
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 100 24");
      svg.setAttribute("preserveAspectRatio", "none");
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-width", "1.4");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
      node.appendChild(svg);
      sparkSvgs[key] = path;
    });

    const accentStroke = () =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? "rgba(5, 150, 105, 0.85)"
        : "rgba(139, 255, 217, 0.85)";

    const fmt = (key, v) => {
      const u = SERIES[key].unit;
      if (u === "%") return v.toFixed(1) + " %";
      if (u === "ms") return v.toFixed(0) + " ms";
      return v.toFixed(0) + " " + u;
    };

    const draw = () => {
      const stroke = accentStroke();
      Object.entries(SERIES).forEach(([key, s]) => {
        const min = Math.min(...s.hist);
        const max = Math.max(...s.hist);
        const range = (max - min) || 1;
        const pts = s.hist.map((v, i) => {
          const x = (i / (HIST_LEN - 1)) * 100;
          const y = 22 - ((v - min) / range) * 20;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        const path = sparkSvgs[key];
        if (path) {
          path.setAttribute("d", "M" + pts.join(" L"));
          path.setAttribute("stroke", stroke);
        }
      });
      cells.forEach(c => {
        const k = c.dataset.metric;
        c.textContent = fmt(k, SERIES[k].hist[SERIES[k].hist.length - 1]);
      });
    };

    const tick = () => {
      Object.values(SERIES).forEach(s => {
        const last = s.hist[s.hist.length - 1];
        // Mean-reverting random walk so values stay realistic.
        const pull = (s.base - last) * 0.18;
        const next = last + pull + (Math.random() - 0.5) * s.jitter;
        s.hist.push(next);
        if (s.hist.length > HIST_LEN) s.hist.shift();
      });
      draw();
    };

    draw();
    let interval = setInterval(tick, 1400);
    document.addEventListener("visibilitychange", () => {
      clearInterval(interval);
      if (!document.hidden) interval = setInterval(tick, 1400);
    });
    window.addEventListener("themechange", draw);
  })();

  /* ============================================================
     LAB TABS — switch between in-browser demos
     ============================================================ */
  (() => {
    const tabs   = document.querySelectorAll("[data-lab-tab]");
    const panels = document.querySelectorAll("[data-lab-panel]");
    if (!tabs.length) return;
    tabs.forEach(t => t.addEventListener("click", () => {
      const id = t.dataset.labTab;
      tabs.forEach(x => {
        const on = x === t;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-selected", String(on));
      });
      panels.forEach(p => {
        p.hidden = p.dataset.labPanel !== id;
      });
      // Notify demos that need to re-measure on first show.
      window.dispatchEvent(new CustomEvent("labtab", { detail: { id } }));
    }));
  })();

  /* ============================================================
     EMBEDDINGS DEMO — hand-curated 2D semantic projection.
     Hover/tap a token, see its 5 nearest neighbours by distance
     in the projected space. Reproducible (no random jitter).
     ============================================================ */
  (() => {
    const svg   = document.getElementById("emb-svg");
    const stage = document.querySelector(".emb-stage");
    const hint  = document.querySelector(".emb-panel-hint");
    const panel = document.getElementById("emb-detail");
    const word  = document.getElementById("emb-word");
    const coord = document.getElementById("emb-coord");
    const list  = document.getElementById("emb-neighbors");
    if (!svg || !stage) return;

    const COLORS = {
      ml:     { dark: "#8bffd9", light: "#059669" },
      speech: { dark: "#c4b5ff", light: "#7c3aed" },
      infra:  { dark: "#93c5fd", light: "#1d4ed8" },
      sec:    { dark: "#fcd34d", light: "#b45309" },
    };

    // Coordinates in [-0.95, 0.95]; clusters chosen for legibility.
    const TOKENS = [
      // ML core (top-left)
      { w: "transformer", x: -0.78, y:  0.62, c: "ml" },
      { w: "tensor",      x: -0.55, y:  0.78, c: "ml" },
      { w: "gradient",    x: -0.40, y:  0.85, c: "ml" },
      { w: "embedding",   x: -0.85, y:  0.45, c: "ml" },
      { w: "attention",   x: -0.62, y:  0.40, c: "ml" },
      { w: "softmax",     x: -0.38, y:  0.55, c: "ml" },
      { w: "BERT",        x: -0.70, y:  0.25, c: "ml" },

      // Speech (top-right)
      { w: "Whisper",     x:  0.62, y:  0.72, c: "speech" },
      { w: "Wav2Vec2",    x:  0.78, y:  0.55, c: "speech" },
      { w: "phoneme",     x:  0.45, y:  0.82, c: "speech" },
      { w: "spectrogram", x:  0.85, y:  0.78, c: "speech" },
      { w: "ASR",         x:  0.55, y:  0.45, c: "speech" },
      { w: "audio",       x:  0.38, y:  0.62, c: "speech" },

      // Infra (bottom-left)
      { w: "Docker",      x: -0.72, y: -0.55, c: "infra" },
      { w: "FastAPI",     x: -0.85, y: -0.35, c: "infra" },
      { w: "Postgres",    x: -0.45, y: -0.70, c: "infra" },
      { w: "Redis",       x: -0.60, y: -0.80, c: "infra" },
      { w: "Nginx",       x: -0.35, y: -0.45, c: "infra" },
      { w: "Celery",      x: -0.55, y: -0.30, c: "infra" },

      // Security (bottom-right)
      { w: "AES-256",     x:  0.55, y: -0.62, c: "sec" },
      { w: "JWT",         x:  0.78, y: -0.45, c: "sec" },
      { w: "RBAC",        x:  0.40, y: -0.78, c: "sec" },
      { w: "bcrypt",      x:  0.85, y: -0.70, c: "sec" },
      { w: "Fernet",      x:  0.60, y: -0.32, c: "sec" },
      { w: "audit-log",   x:  0.32, y: -0.50, c: "sec" },
    ];

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
    const colorFor = (c) => isLight() ? COLORS[c].light : COLORS[c].dark;

    const NS = "http://www.w3.org/2000/svg";

    const render = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // axes
      const axes = document.createElementNS(NS, "g");
      const ax1 = document.createElementNS(NS, "line");
      ax1.setAttribute("x1", "-1"); ax1.setAttribute("x2", "1");
      ax1.setAttribute("y1", "0");  ax1.setAttribute("y2", "0");
      ax1.setAttribute("stroke", "currentColor");
      ax1.setAttribute("stroke-width", "0.003");
      ax1.setAttribute("opacity", "0.3");
      const ax2 = document.createElementNS(NS, "line");
      ax2.setAttribute("y1", "-1"); ax2.setAttribute("y2", "1");
      ax2.setAttribute("x1", "0");  ax2.setAttribute("x2", "0");
      ax2.setAttribute("stroke", "currentColor");
      ax2.setAttribute("stroke-width", "0.003");
      ax2.setAttribute("opacity", "0.3");
      axes.appendChild(ax1); axes.appendChild(ax2);
      svg.appendChild(axes);

      const linkLayer  = document.createElementNS(NS, "g"); linkLayer.setAttribute("data-layer", "links");
      const tokenLayer = document.createElementNS(NS, "g"); tokenLayer.setAttribute("data-layer", "tokens");
      svg.appendChild(linkLayer);
      svg.appendChild(tokenLayer);

      TOKENS.forEach((t, idx) => {
        const g = document.createElementNS(NS, "g");
        g.classList.add("emb-token");
        g.dataset.idx = String(idx);
        g.setAttribute("transform", `translate(${t.x} ${-t.y})`); // flip y for screen
        g.style.color = colorFor(t.c);

        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", "0");
        c.setAttribute("cy", "0");
        c.setAttribute("r", "0.022");
        c.setAttribute("fill", colorFor(t.c));
        c.setAttribute("opacity", "0.9");
        g.appendChild(c);

        const label = document.createElementNS(NS, "text");
        label.setAttribute("x", "0.035");
        label.setAttribute("y", "0.012");
        label.textContent = t.w;
        g.appendChild(label);

        g.addEventListener("pointerenter", () => activate(idx));
        g.addEventListener("click",        () => activate(idx));
        g.addEventListener("focus",        () => activate(idx));
        g.setAttribute("tabindex", "0");

        tokenLayer.appendChild(g);
      });
    };

    const activate = (idx) => {
      const target = TOKENS[idx];
      const ranked = TOKENS
        .map((t, i) => ({ t, i, d: i === idx ? Infinity : dist(t, target) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 5);

      stage.classList.add("has-active");
      svg.querySelectorAll(".emb-token").forEach(el => {
        el.classList.toggle("is-active",   Number(el.dataset.idx) === idx);
        el.classList.toggle("is-neighbor", ranked.some(r => r.i === Number(el.dataset.idx)));
      });

      // Draw links from active to its 5 neighbours.
      const linkLayer = svg.querySelector('[data-layer="links"]');
      while (linkLayer.firstChild) linkLayer.removeChild(linkLayer.firstChild);
      ranked.forEach(r => {
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(target.x));
        line.setAttribute("y1", String(-target.y));
        line.setAttribute("x2", String(r.t.x));
        line.setAttribute("y2", String(-r.t.y));
        line.setAttribute("class", "emb-link");
        line.setAttribute("stroke", colorFor(target.c));
        linkLayer.appendChild(line);
      });

      // Update side panel.
      hint.hidden = true;
      panel.hidden = false;
      word.textContent = target.w;
      coord.textContent = `(${target.x.toFixed(2)}, ${target.y.toFixed(2)}) · cluster: ${target.c}`;
      list.innerHTML = "";
      ranked.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `<b>${r.t.w}</b><span>${r.d.toFixed(3)}</span>`;
        list.appendChild(li);
      });
    };

    render();
    window.addEventListener("themechange", render);
  })();

  /* ============================================================
     ATTENTION DEMO — synthesizes a per-head attention matrix from
     simple linguistic rules. Three heads:
       0 syntax — local, distance-decayed
       1 coref  — pronouns & determiners point back at content nouns
       2 topic  — every token attends to high-content nouns
     ============================================================ */
  (() => {
    const input    = document.getElementById("att-input");
    const grid     = document.getElementById("att-grid");
    const explain  = document.getElementById("att-explain");
    const headBtns = document.querySelectorAll("[data-att-head]");
    if (!input || !grid) return;

    let head = 0;

    const FUNCTION_WORDS = new Set([
      "the","a","an","of","and","or","but","in","on","at","to","for",
      "with","is","are","was","were","be","been","by","as","that","this",
      "it","its","each","next",
    ]);
    const PRONOUNS = new Set(["it","its","this","that","they","them","he","she","his","her"]);

    const tokenize = (s) => {
      const re = /[A-Za-z][A-Za-z0-9_-]*|\d+/g;
      const out = [];
      let m;
      while ((m = re.exec(s)) !== null) out.push(m[0]);
      return out.slice(0, 12);  // cap for visual clarity
    };

    const isContent = (t) => !FUNCTION_WORDS.has(t.toLowerCase());

    const compute = (tokens, h) => {
      const n = tokens.length;
      const W = Array.from({ length: n }, () => new Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let s = 0;
          if (h === 0) {
            // syntax: local + slight self-loop
            const d = Math.abs(i - j);
            s = Math.exp(-d * 0.65);
            if (i === j) s *= 0.9;
          } else if (h === 1) {
            // coref: pronouns/determiners → content nouns earlier in seq
            const ti = tokens[i].toLowerCase();
            if (PRONOUNS.has(ti) || ti === "the" || ti === "this") {
              s = isContent(tokens[j]) && j < i ? 1 / (i - j + 0.5) : 0.05;
            } else {
              s = i === j ? 0.7 : Math.exp(-Math.abs(i - j) * 0.9);
            }
          } else {
            // topic: everything looks at content nouns globally
            s = isContent(tokens[j]) ? 1 + (tokens[j][0] === tokens[j][0].toUpperCase() ? 0.4 : 0) : 0.08;
            if (i === j) s += 0.15;
          }
          W[i][j] = s;
        }
        // softmax row
        const max = Math.max(...W[i]);
        const exp = W[i].map(v => Math.exp(v - max));
        const sum = exp.reduce((a, b) => a + b, 0) || 1;
        W[i] = exp.map(v => v / sum);
      }
      return W;
    };

    const HEAD_DESC = [
      "Head <b>0 · syntax</b>: weights decay with token distance. Each token leans on its immediate left/right neighbours — exactly what you see in real lower-layer attention heads.",
      "Head <b>1 · coreference</b>: pronouns and determiners (<i>the</i>, <i>this</i>, <i>it</i>) re-direct their probability mass back to nearby content nouns. This is the head that resolves referents.",
      "Head <b>2 · topic</b>: every token, regardless of position, concentrates attention on the few high-content nouns in the sentence. Where a model decides what the sentence is <em>about</em>.",
    ];

    const render = () => {
      const tokens = tokenize(input.value);
      if (!tokens.length) {
        grid.innerHTML = "";
        explain.innerHTML = HEAD_DESC[head];
        return;
      }
      const W = compute(tokens, head);
      const n = tokens.length;
      grid.style.gridTemplateColumns = `minmax(80px, 1fr) repeat(${n}, minmax(40px, 1fr))`;
      grid.innerHTML = "";

      // header row: blank + col labels
      const blank = document.createElement("div");
      blank.className = "att-cell label-row label-col";
      grid.appendChild(blank);
      tokens.forEach(t => {
        const c = document.createElement("div");
        c.className = "att-cell label-row";
        c.textContent = t;
        grid.appendChild(c);
      });

      // body: row label + heat cells
      for (let i = 0; i < n; i++) {
        const lab = document.createElement("div");
        lab.className = "att-cell label-col";
        lab.textContent = tokens[i];
        grid.appendChild(lab);
        for (let j = 0; j < n; j++) {
          const v = W[i][j];
          const cell = document.createElement("div");
          cell.className = "att-cell heat";
          const isLight = document.documentElement.getAttribute("data-theme") === "light";
          // Map weight [0..1] → color intensity. Use accent hue.
          const alpha = Math.min(1, 0.05 + v * 1.4);
          cell.style.background = isLight
            ? `rgba(5, 150, 105, ${alpha.toFixed(3)})`
            : `rgba(139, 255, 217, ${alpha.toFixed(3)})`;
          cell.style.borderColor = isLight
            ? `rgba(5, 150, 105, ${(alpha * 0.9).toFixed(3)})`
            : `rgba(139, 255, 217, ${(alpha * 0.6).toFixed(3)})`;
          cell.textContent = v >= 0.1 ? v.toFixed(2) : "·";
          cell.title = `${tokens[i]} → ${tokens[j]} : ${v.toFixed(3)}`;
          grid.appendChild(cell);
        }
      }

      explain.innerHTML = HEAD_DESC[head];
    };

    input.addEventListener("input", render);
    headBtns.forEach(b => b.addEventListener("click", () => {
      headBtns.forEach(x => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      head = Number(b.dataset.attHead);
      render();
    }));
    window.addEventListener("themechange", render);
    window.addEventListener("labtab", (e) => { if (e.detail?.id === "att") render(); });
    render();
  })();

  /* ============================================================
     INFERENCE ECONOMICS DEMO — interactive scatter of model
     variants on the latency-vs-WER plane. Slider sets a budget;
     we highlight the lowest-WER model that fits.
     ============================================================ */
  (() => {
    const svg     = document.getElementById("lat-svg");
    const slider  = document.getElementById("lat-budget");
    const valEl   = document.getElementById("lat-budget-val");
    const bestEl  = document.getElementById("lat-best");
    const msEl    = document.getElementById("lat-ms");
    const werEl   = document.getElementById("lat-wer");
    const costEl  = document.getElementById("lat-cost");
    if (!svg || !slider) return;

    // x = latency (ms, log scale-ish). y = WER (%). cost ≈ latency × hourly compute.
    const MODELS = [
      { name: "Whisper · large-v3", ms: 1480, wer:  4.2, cost: 5.8, hl: false },
      { name: "Whisper · medium",   ms:  720, wer:  5.8, cost: 2.9, hl: false },
      { name: "Whisper · small",    ms:  340, wer:  7.6, cost: 1.4, hl: false },
      { name: "Whisper · base",     ms:  190, wer: 10.4, cost: 0.8, hl: false },
      { name: "Whisper · tiny",     ms:  110, wer: 13.9, cost: 0.5, hl: false },
      { name: "Distilled · INT8",   ms:   95, wer:  6.4, cost: 0.4, hl: true  },
      { name: "Distilled · INT4",   ms:   58, wer:  8.1, cost: 0.3, hl: false },
    ];

    const W = 600, H = 320;
    const M = { l: 56, r: 24, t: 18, b: 44 };
    const xMin = 40, xMax = 1600;
    const yMin = 0,  yMax = 16;

    // log scale on x
    const lx = (ms) => Math.log10(ms);
    const lxMin = lx(xMin), lxMax = lx(xMax);
    const xScale = (ms) => M.l + ((lx(ms) - lxMin) / (lxMax - lxMin)) * (W - M.l - M.r);
    const yScale = (wer) => M.t + ((wer - yMin) / (yMax - yMin)) * (H - M.t - M.b);

    const NS = "http://www.w3.org/2000/svg";

    const render = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const budget = Number(slider.value);
      valEl.textContent = budget;

      // budget shaded region (everything to the left of the budget line)
      const fill = document.createElementNS(NS, "rect");
      fill.setAttribute("x", String(M.l));
      fill.setAttribute("y", String(M.t));
      fill.setAttribute("width", String(Math.max(0, xScale(budget) - M.l)));
      fill.setAttribute("height", String(H - M.t - M.b));
      fill.setAttribute("class", "budget-fill");
      svg.appendChild(fill);

      // gridlines (horizontal — every 4% WER)
      for (let y = 0; y <= yMax; y += 4) {
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(M.l));
        line.setAttribute("x2", String(W - M.r));
        line.setAttribute("y1", String(yScale(y)));
        line.setAttribute("y2", String(yScale(y)));
        line.setAttribute("class", "grid");
        svg.appendChild(line);

        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", String(M.l - 8));
        t.setAttribute("y", String(yScale(y) + 3));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("class", "tick-label");
        t.textContent = y + "%";
        svg.appendChild(t);
      }

      // x ticks (log-spaced)
      [50, 100, 200, 400, 800, 1500].forEach(ms => {
        const x = xScale(ms);
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(x));
        line.setAttribute("x2", String(x));
        line.setAttribute("y1", String(M.t));
        line.setAttribute("y2", String(H - M.b));
        line.setAttribute("class", "grid");
        svg.appendChild(line);

        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", String(x));
        t.setAttribute("y", String(H - M.b + 16));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("class", "tick-label");
        t.textContent = ms + "ms";
        svg.appendChild(t);
      });

      // axis lines
      const xAxis = document.createElementNS(NS, "line");
      xAxis.setAttribute("x1", String(M.l));
      xAxis.setAttribute("x2", String(W - M.r));
      xAxis.setAttribute("y1", String(H - M.b));
      xAxis.setAttribute("y2", String(H - M.b));
      xAxis.setAttribute("class", "axis");
      svg.appendChild(xAxis);

      const yAxis = document.createElementNS(NS, "line");
      yAxis.setAttribute("x1", String(M.l));
      yAxis.setAttribute("x2", String(M.l));
      yAxis.setAttribute("y1", String(M.t));
      yAxis.setAttribute("y2", String(H - M.b));
      yAxis.setAttribute("class", "axis");
      svg.appendChild(yAxis);

      // axis labels
      const xl = document.createElementNS(NS, "text");
      xl.setAttribute("x", String((W - M.r + M.l) / 2));
      xl.setAttribute("y", String(H - 6));
      xl.setAttribute("text-anchor", "middle");
      xl.setAttribute("class", "axis-label");
      xl.textContent = "latency (log)";
      svg.appendChild(xl);

      const yl = document.createElementNS(NS, "text");
      yl.setAttribute("transform", `rotate(-90 ${M.l - 38} ${(H + M.t) / 2})`);
      yl.setAttribute("x", String(M.l - 38));
      yl.setAttribute("y", String((H + M.t) / 2));
      yl.setAttribute("text-anchor", "middle");
      yl.setAttribute("class", "axis-label");
      yl.textContent = "WER";
      svg.appendChild(yl);

      // pareto-ish frontier through ascending-latency points sorted by WER
      const sorted = [...MODELS].sort((a, b) => a.ms - b.ms);
      let bestWer = Infinity;
      const frontier = [];
      sorted.forEach(m => {
        if (m.wer < bestWer) { frontier.push(m); bestWer = m.wer; }
      });
      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", "frontier");
      path.setAttribute("d", "M" + frontier.map(m => `${xScale(m.ms)},${yScale(m.wer)}`).join(" L"));
      svg.appendChild(path);

      // budget line
      const bx = xScale(budget);
      const bl = document.createElementNS(NS, "line");
      bl.setAttribute("x1", String(bx)); bl.setAttribute("x2", String(bx));
      bl.setAttribute("y1", String(M.t)); bl.setAttribute("y2", String(H - M.b));
      bl.setAttribute("class", "budget-line");
      svg.appendChild(bl);

      // pick best model that fits
      const fit = MODELS.filter(m => m.ms <= budget).sort((a, b) => a.wer - b.wer)[0] || null;

      // points
      MODELS.forEach(m => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "point" + (fit && m === fit ? " is-best" : "") + (m.ms > budget ? " is-out" : ""));
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", String(xScale(m.ms)));
        c.setAttribute("cy", String(yScale(m.wer)));
        c.setAttribute("r", m.hl ? "6" : "4.5");
        c.setAttribute("fill", m.hl
          ? "var(--accent)"
          : (document.documentElement.getAttribute("data-theme") === "light" ? "#52525b" : "#d4d4d8"));
        c.setAttribute("stroke", "var(--bg)");
        c.setAttribute("stroke-width", "1.5");
        g.appendChild(c);
        const t = document.createElementNS(NS, "text");
        const right = xScale(m.ms) + 9;
        t.setAttribute("x", String(right));
        t.setAttribute("y", String(yScale(m.wer) + 3.5));
        t.textContent = m.name;
        g.appendChild(t);
        svg.appendChild(g);
      });

      // stats
      if (fit) {
        bestEl.textContent = fit.name;
        msEl.textContent   = fit.ms + " ms";
        werEl.textContent  = fit.wer.toFixed(1) + " %";
        costEl.textContent = fit.cost.toFixed(2) + " ¢";
      } else {
        bestEl.textContent = "no model fits";
        msEl.textContent = "—"; werEl.textContent = "—"; costEl.textContent = "—";
      }
    };

    slider.addEventListener("input", render);
    window.addEventListener("themechange", render);
    window.addEventListener("labtab", (e) => { if (e.detail?.id === "lat") render(); });
    window.addEventListener("resize", render, { passive: true });
    render();
  })();

  /* ============================================================
     COMMAND PALETTE (⌘K / Ctrl+K)
     Substring + acronym scoring across sections, projects, demos,
     models, and skills. Keyboard-driven.
     ============================================================ */
  (() => {
    const root    = document.getElementById("cmdk");
    const trigger = document.getElementById("cmdk-trigger");
    const input   = document.getElementById("cmdk-input");
    const list    = document.getElementById("cmdk-list");
    if (!root || !trigger || !input || !list) return;

    const ITEMS = [
      // Sections
      { g: "Section",  n: "About",                   h: "01 · who I am",                          a: () => go("#about") },
      { g: "Section",  n: "Experience",              h: "02 · timeline",                          a: () => go("#experience") },
      { g: "Section",  n: "Live ML lab",             h: "03 · in-browser demos",                  a: () => go("#playground") },
      { g: "Section",  n: "Selected work",           h: "04 · shipped products",                  a: () => go("#work") },
      { g: "Section",  n: "Case study",              h: "05 · HR recruitment teardown",           a: () => go("#case-study") },
      { g: "Section",  n: "Skills",                  h: "06 · stack",                             a: () => go("#skills") },
      { g: "Section",  n: "Credentials",             h: "07 · education + recognition",           a: () => go("#credentials") },
      { g: "Section",  n: "Contact",                 h: "email · LinkedIn · phone",               a: () => go("#contact") },
      // Demos
      { g: "Lab demo", n: "Tokenizer",               h: "word · sub-word · char",                 a: () => goLab("tok") },
      { g: "Lab demo", n: "Embedding space",         h: "2D semantic projection",                 a: () => goLab("emb") },
      { g: "Lab demo", n: "Attention heatmap",       h: "syntax · coref · topic heads",           a: () => goLab("att") },
      { g: "Lab demo", n: "Inference economics",     h: "latency vs WER frontier",                a: () => goLab("lat") },
      // Projects
      { g: "Project",  n: "Document management platform",       h: "tamper-evident · isolated tenancy",    a: () => go("#work") },
      { g: "Project",  n: "HR recruitment platform",            h: "9-service Docker stack · Ollama LLM",  a: () => go("#work") },
      { g: "Project",  n: "HR incident management platform",    h: "SHA-256 hash-chained audit log",       a: () => go("#work") },
      // Models / topics — these jump to skills
      { g: "Model",    n: "BERT",                    h: "multilingual · domain-specific",         a: () => go("#skills") },
      { g: "Model",    n: "Whisper",                 h: "speech recognition",                     a: () => go("#skills") },
      { g: "Model",    n: "Wav2Vec2",                h: "speech recognition",                     a: () => go("#skills") },
      { g: "Model",    n: "Phi-3",                   h: "distilled / quantized LLM",              a: () => go("#skills") },
      { g: "Model",    n: "Ollama",                  h: "local LLM serving",                      a: () => go("#skills") },
      // Skills
      { g: "Skill",    n: "PyTorch",                 h: "ML framework",                           a: () => go("#skills") },
      { g: "Skill",    n: "Hugging Face Transformers", h: "fine-tuning · serving",                a: () => go("#skills") },
      { g: "Skill",    n: "FastAPI · async",         h: "Python backend",                         a: () => go("#skills") },
      { g: "Skill",    n: "PostgreSQL · Redis · Elasticsearch", h: "data layer",                  a: () => go("#skills") },
      { g: "Skill",    n: "Docker · CI/CD · Nginx",  h: "platform",                               a: () => go("#skills") },
      { g: "Skill",    n: "AES-256 · JWT · RBAC · audit logs", h: "security",                     a: () => go("#skills") },
      // Actions
      { g: "Action",   n: "Download CV (PDF)",       h: "one-page resume",                        a: () => { const a = document.createElement("a"); a.href = "assets/Shreyash_Naik_Resume.pdf"; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); } },
      { g: "Action",   n: "Email Shreyash",          h: "Shreyash@gmail.com",                     a: () => location.href = "mailto:Shreyash@gmail.com" },
      { g: "Action",   n: "Open LinkedIn",           h: "linkedin.com/in/shreyash",               a: () => window.open("https://www.linkedin.com/in/shreyash/", "_blank", "noopener") },
      { g: "Action",   n: "Toggle theme",            h: "dark ↔ light",                           a: () => document.getElementById("theme-toggle")?.click() },
    ];

    const ICON = {
      "Section": "§",
      "Lab demo": "λ",
      "Project": "P",
      "Model": "M",
      "Skill": "•",
      "Action": "→",
    };

    let active = 0;
    let results = [];

    function go(hash) {
      close();
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", hash);
    }
    function goLab(id) {
      go("#playground");
      setTimeout(() => {
        const tab = document.querySelector(`[data-lab-tab="${id}"]`);
        if (tab && !tab.classList.contains("is-active")) tab.click();
      }, prefersReducedMotion ? 0 : 320);
    }

    const score = (q, item) => {
      if (!q) return 1;
      const Q = q.toLowerCase();
      const N = item.n.toLowerCase();
      const H = item.h.toLowerCase();
      let s = 0;
      if (N.startsWith(Q))      s += 100;
      else if (N.includes(Q))   s += 60;
      if (H.includes(Q))        s += 25;
      // acronym match: "ie" matches "Inference economics"
      const initials = item.n.split(/\s|·|-/).filter(Boolean).map(w => w[0]?.toLowerCase() || "").join("");
      if (initials.startsWith(Q)) s += 50;
      return s;
    };

    const highlight = (text, q) => {
      if (!q) return text;
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return text;
      return text.slice(0, i) + "<mark>" + text.slice(i, i + q.length) + "</mark>" + text.slice(i + q.length);
    };

    const render = () => {
      const q = input.value.trim();
      results = ITEMS
        .map(it => ({ it, s: score(q, it) }))
        .filter(r => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12)
        .map(r => r.it);

      list.innerHTML = "";
      if (!results.length) {
        const empty = document.createElement("div");
        empty.className = "cmdk-empty";
        empty.textContent = `No matches for "${q}"`;
        list.appendChild(empty);
        return;
      }

      let lastGroup = null;
      results.forEach((it, i) => {
        if (it.g !== lastGroup) {
          const h = document.createElement("div");
          h.className = "cmdk-group";
          h.textContent = it.g;
          list.appendChild(h);
          lastGroup = it.g;
        }
        const li = document.createElement("li");
        li.className = "cmdk-item" + (i === active ? " is-active" : "");
        li.setAttribute("role", "option");
        li.dataset.idx = String(i);
        li.innerHTML = `
          <span class="cmdk-item-icon">${ICON[it.g] || "·"}</span>
          <div class="cmdk-item-body">
            <div class="cmdk-item-name">${highlight(it.n, q)}</div>
            <div class="cmdk-item-hint">${it.h}</div>
          </div>
          <span class="cmdk-item-kbd">↵</span>`;
        li.addEventListener("mousemove", () => { setActive(i); });
        li.addEventListener("click", () => results[i]?.a());
        list.appendChild(li);
      });
    };

    const setActive = (i) => {
      if (!results.length) return;
      active = (i + results.length) % results.length;
      list.querySelectorAll(".cmdk-item").forEach(el => {
        el.classList.toggle("is-active", Number(el.dataset.idx) === active);
      });
      const cur = list.querySelector(".cmdk-item.is-active");
      if (cur) cur.scrollIntoView({ block: "nearest" });
    };

    const open = () => {
      root.hidden = false;
      input.value = "";
      active = 0;
      render();
      setTimeout(() => input.focus(), 30);
      document.documentElement.style.overflow = "hidden";
    };
    const close = () => {
      root.hidden = true;
      document.documentElement.style.overflow = "";
    };

    trigger.addEventListener("click", open);
    root.querySelectorAll("[data-cmdk-close]").forEach(el => el.addEventListener("click", close));
    input.addEventListener("input", () => { active = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        results[active]?.a();
      }
    });
    document.addEventListener("keydown", (e) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (root.hidden) open(); else close();
      } else if (e.key === "Escape" && !root.hidden) {
        close();
      } else if (e.key === "/" && document.activeElement === document.body) {
        // "/" anywhere on the page also opens the palette — VSCode/Linear style.
        e.preventDefault();
        open();
      }
    });
  })();
})();
