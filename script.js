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
     AI CHAT WIDGET
     Keyword-matched, streamed character-by-character. No network.
     ============================================================ */
  const aiWidget = document.getElementById("ai-widget");
  const aiFab    = document.getElementById("ai-fab");
  const aiPanel  = document.getElementById("ai-panel");
  const aiClose  = document.getElementById("ai-panel-close");
  const aiChat   = document.getElementById("ai-chat");
  const aiForm   = document.getElementById("ai-form");
  const aiInput  = document.getElementById("ai-input");
  const aiSugg   = document.getElementById("ai-suggestions");

  if (aiWidget && aiFab && aiPanel && aiChat && aiForm && aiInput) {
    const KB = [
      {
        k: ["hi", "hello", "hey", "yo"],
        a: "Hey 👋  I'm a small client-side demo that knows Shreyash's resume. Try asking about his <strong>models</strong>, <strong>current role</strong>, <strong>stack</strong> or <strong>projects</strong>.",
      },
      {
        k: ["model", "models", "ml", "bert", "whisper", "wav2vec", "phi", "llm", "nlp"],
        a: "In production he's shipped <strong>BERT</strong> (incl. a domain-specific Spanish BERT for compliance), <strong>Whisper</strong> and <strong>Wav2Vec2</strong> for ASR, and <strong>Phi-3</strong> deployments with knowledge distillation and quantization. Plus local LLM work via <strong>Ollama</strong> for in-app AI.",
      },
      {
        k: ["speech", "asr", "audio", "voice"],
        a: "Speech is a core strength: production pipelines built on <strong>Whisper</strong> and <strong>Wav2Vec2</strong>, fine-tuned for healthcare (ICD-10 / CPT coding) and multilingual workflows, with quantization for edge deployment.",
      },
      {
        k: ["current", "now", "ethernet", "spoc", "role", "today", "recent"],
        a: "Currently at <strong>Ethernet Xpress</strong> (Goa, since Jun 2025). He's the sole technical SPOC on an enterprise CRM / OSS / BSS programme — authored the full requirements spec, ran vendor selection and now owns delivery, security review, and change management. He also architected and shipped three internal enterprise SaaS products.",
      },
      {
        k: ["trellissoft", "previous", "past", "before"],
        a: "Before that, 3.4 years at <strong>Trellissoft Engineering Services</strong> — Jr. SWE → SWE → AI Engineer. Owned full ML pipelines for global clients (US, EU, MENA, India) in healthcare, finance and compliance.",
      },
      {
        k: ["experience", "years", "how long", "yoe", "seniority"],
        a: "<strong>4+ years</strong> in production ML. 3.4 years at Trellissoft (Jun 2021 – Oct 2024), a focused break for GATE prep (Nov 2024 – May 2025), then Ethernet Xpress from Jun 2025 onwards.",
      },
      {
        k: ["break", "gap", "gate", "career break"],
        a: "Between Oct 2024 and May 2025 he took a deliberate break to prepare for <strong>GATE</strong> (Graduate Aptitude Test in Engineering) — deepening core CS fundamentals. It's on the timeline, no hiding.",
      },
      {
        k: ["stack", "tech", "tools", "framework", "languages"],
        a: "<strong>Python</strong> + <strong>PyTorch</strong> + <strong>Hugging Face</strong> for ML. <strong>FastAPI</strong> (async) + <strong>SQLAlchemy 2.0</strong> + <strong>PostgreSQL</strong> + <strong>Redis</strong> + <strong>Elasticsearch 8</strong> + <strong>Celery</strong> + <strong>MinIO</strong> for backends. <strong>Angular 17</strong> (standalone, Signals) + <strong>Tailwind</strong> on the front end. Ships on <strong>Docker Compose</strong> behind <strong>Nginx</strong>.",
      },
      {
        k: ["project", "projects", "work", "built", "shipped", "full-stack", "fullstack"],
        a: "Three enterprise SaaS products, architected and shipped end-to-end:<br>• <strong>Document management</strong> — tamper-evident, multi-dept workflow tree, AES-256, isolated-tenancy.<br>• <strong>HR recruitment</strong> — 9-service Docker stack, Elasticsearch, Socket.IO, Ollama resume parsing.<br>• <strong>HR incident management</strong> — SHA-256 hash-chained audit log, AES-256-GCM + Fernet, multi-tenant.",
      },
      {
        k: ["document", "dms"],
        a: "The document management platform is a subscription SaaS with provable, tamper-evident records, a live visual multi-department workflow tree, cryptographic audit trail, and AES-256 at rest on a <strong>dedicated isolated server</strong> per tenant. Next: an embedded, locally-running fine-tuned AI agent for on-prem document Q&amp;A.",
      },
      {
        k: ["hr", "recruitment", "staff", "incident"],
        a: "Two HR products: a recruitment platform (FastAPI + Angular 17 + Elasticsearch + Celery + Ollama resume parsing, 9 Docker services) and a multi-tenant incident management platform with a SHA-256 hash-chained, tamper-detectable audit log and AES-256-GCM file encryption.",
      },
      {
        k: ["security", "encryption", "crypto", "audit"],
        a: "Security is first-class: <strong>JWT</strong> (15-min access + 7-day httpOnly refresh), <strong>bcrypt</strong>, <strong>AES-256-GCM</strong> file encryption, <strong>Fernet</strong> field encryption, <strong>SHA-256</strong> hash-chained tamper-detectable audit logs, RBAC with fine-grained permissions, rate limiting, TLS via Let's Encrypt.",
      },
      {
        k: ["docker", "devops", "deploy", "infra", "ci", "cd"],
        a: "Ships Dockerized model services via CI/CD, multi-region (US, EU, MENA, India). Full-stack products run on Docker Compose stacks behind Nginx with Alembic migrations and structured rotating logs.",
      },
      {
        k: ["contact", "email", "reach", "hire", "phone"],
        a: "Best route is email: <strong>Shreyash@gmail.com</strong>. LinkedIn at <strong>linkedin.com/in/shreyash</strong>. Based in Goa, open to relocation.",
      },
      {
        k: ["location", "where", "goa", "india", "relocate"],
        a: "Based in <strong>Goa, India</strong>, open to relocation globally.",
      },
      {
        k: ["education", "degree", "college", "university"],
        a: "Bachelor's from <strong>Don Bosco College of Engineering</strong>, Goa University (2021). Also completed the Coursera NLP Specialization (4 courses) and DeepLearning.AI's ML Specialization the same year.",
      },
      {
        k: ["award", "achievement", "recognition"],
        a: "Fast &amp; Furious Coder (2024). Employee of Q2 · Star Player of the Team (2022). Both at Trellissoft.",
      },
      {
        k: ["ai coding", "ai agent", "cursor", "copilot", "how", "build"],
        a: "For full-stack products he owns architecture, data modelling, security design and AI integration — and delegates implementation to AI coding agents. The systems are entirely his responsibility and are all in daily production use inside the business.",
      },
      {
        k: ["thanks", "thank"],
        a: "Anytime. For a real conversation, email him at <strong>Shreyash@gmail.com</strong>.",
      },
    ];

    const FALLBACK = "I'm a keyword-matched demo so I don't have a great answer for that. Try <em>models</em>, <em>current role</em>, <em>stack</em>, <em>projects</em>, or <em>contact</em>.";

    const answer = (q) => {
      const s = q.toLowerCase();
      let best = null, bestScore = 0;
      for (const row of KB) {
        const score = row.k.reduce((acc, kw) => acc + (s.includes(kw) ? kw.length : 0), 0);
        if (score > bestScore) { best = row; bestScore = score; }
      }
      return best ? best.a : FALLBACK;
    };

    const scrollChat = () => { aiChat.scrollTop = aiChat.scrollHeight; };

    const addMsg = (html, who = "bot") => {
      const el = document.createElement("div");
      el.className = `ai-msg ai-msg-${who}`;
      el.innerHTML = html;
      aiChat.appendChild(el);
      scrollChat();
      return el;
    };

    const stream = (el, html, speed = 14) => {
      return new Promise(resolve => {
        // Parse HTML to a list of text/tag tokens so we can type text gradually
        // while preserving tags.
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const fullText = tmp.innerHTML;
        el.innerHTML = '<span class="cursor"></span>';
        const cursor = el.querySelector(".cursor");

        let i = 0;
        let buf = "";
        const tick = () => {
          // Advance past a full tag in one step, else one character
          if (fullText[i] === "<") {
            const end = fullText.indexOf(">", i);
            if (end !== -1) {
              buf += fullText.slice(i, end + 1);
              i = end + 1;
            } else {
              buf += fullText[i++];
            }
          } else {
            buf += fullText[i++];
          }
          el.innerHTML = buf + '<span class="cursor"></span>';
          scrollChat();
          if (i < fullText.length) {
            setTimeout(tick, speed + Math.random() * 10);
          } else {
            const c = el.querySelector(".cursor");
            if (c) c.remove();
            resolve();
          }
        };
        tick();
      });
    };

    const ask = async (q) => {
      if (!q.trim()) return;
      addMsg(escapeHTML(q), "user");
      const botEl = addMsg("", "bot");
      await new Promise(r => setTimeout(r, 280));
      await stream(botEl, answer(q), prefersReducedMotion ? 0 : 14);
    };

    const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

    // Open / close
    const setOpen = (open) => {
      aiWidget.setAttribute("data-open", String(open));
      aiPanel.hidden = !open;
      aiFab.setAttribute("aria-expanded", String(open));
      if (open) {
        if (!aiChat.childElementCount) {
          addMsg("Hi — I'm a tiny client-side assistant that knows Shreyash's resume. Ask me about his <strong>models</strong>, <strong>stack</strong>, or <strong>projects</strong>. For real conversations, email him at <strong>Shreyash@gmail.com</strong>.", "bot");
        }
        setTimeout(() => aiInput.focus(), 60);
      }
    };

    aiFab.addEventListener("click", () => setOpen(true));
    aiClose?.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && aiWidget.getAttribute("data-open") === "true") setOpen(false);
    });

    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = aiInput.value;
      aiInput.value = "";
      ask(q);
    });

    aiSugg?.querySelectorAll("button[data-q]").forEach(b => {
      b.addEventListener("click", () => ask(b.dataset.q));
    });
  }
})();
