/* ==========================================================================
   Panth Haveliwala: Portfolio interactions
   Content comes from data.js (window.PORTFOLIO)
   ========================================================================== */
(() => {
  "use strict";

  const D = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Icons ---------- */
  const ICONS = {
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    brain: '<path d="M9.5 2a2.5 2.5 0 0 0-2.4 3.2A3 3 0 0 0 4.5 9a3 3 0 0 0 .4 5.6A3 3 0 0 0 9 19.5 2.5 2.5 0 0 0 12 21V4.5A2.5 2.5 0 0 0 9.5 2zM14.5 2A2.5 2.5 0 0 1 16.9 5.2 3 3 0 0 1 19.5 9a3 3 0 0 1-.4 5.6A3 3 0 0 1 15 19.5 2.5 2.5 0 0 1 12 21"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    server: '<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    vault: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7M12 17v-1.5M15.5 12H17M7 12h1.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-4A13 13 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    heart: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 0 0-.9 2.6V22"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.code}</svg>`;
  const PROJECT_ICON = { nyayavault: "vault", veritas: "eye", startin: "rocket", guardian: "heart" };
  const ACH_ICON = { academic: "🥇", hackathon: "🏆", cert: "📜" };

  /* ---------- Bind simple profile fields ---------- */
  function bindProfile() {
    const p = D.profile;
    $$("[data-bind]").forEach((el) => {
      const v = p[el.dataset.bind];
      if (v != null) el.textContent = v;
    });
    const hrefs = { github: p.github, linkedin: p.linkedin, mailto: `mailto:${p.email}` };
    $$("[data-href]").forEach((el) => (el.href = hrefs[el.dataset.href]));
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Render sections ---------- */
  function renderStats() {
    $("#stats").innerHTML = D.stats
      .map(
        (s, i) => `<li class="reveal" style="--d:${i * 0.08}s">
          <span class="stat-num" data-count="${s.value}" data-decimals="${s.decimals || 0}" data-prefix="${s.prefix || ""}" data-suffix="${s.suffix || ""}">${s.prefix || ""}${s.value}${s.suffix || ""}</span>
          <span class="stat-label">${esc(s.label)}</span></li>`
      )
      .join("");
  }

  function renderMarquee() {
    const all = [...new Set(D.skills.flatMap((g) => g.items))];
    const row = all.map((t) => `<span>${esc(t)}</span>`).join("");
    $("#marquee").innerHTML = row + row;
  }

  function renderAbout() {
    $("#about-text").innerHTML = D.about.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#now-list").innerHTML = D.now.map((n) => `<li>${esc(n)}</li>`).join("");
    $("#education").innerHTML = D.education
      .map(
        (e) => `<li>
          <span class="tl-period">${esc(e.period)}</span>
          <div class="tl-title">${esc(e.title)}</div>
          <div class="tl-place">${esc(e.place)}</div>
          <ul class="tl-points">${e.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </li>`
      )
      .join("");
  }

  const tags = (arr, n = arr.length) =>
    `<div class="tags">${arr.slice(0, n).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}${arr.length > n ? `<span class="tag">+${arr.length - n}</span>` : ""}</div>`;
  const metrics = (m = []) =>
    m.length ? `<div class="metrics">${m.map((x) => `<div class="metric"><b>${esc(x.k)}</b><small>${esc(x.v)}</small></div>`).join("")}</div>` : "";

  function renderProjects() {
    const feat = D.projects.filter((p) => p.featured);
    const rest = D.projects.filter((p) => !p.featured);

    $("#featured").innerHTML = feat
      .map(
        (p, i) => `<button class="feat spot reveal" style="--c:${p.accent};--d:${(i % 2) * 0.08}s" data-project="${p.id}" aria-label="Open ${esc(p.name)} details">
          <div class="feat-bg"></div><div class="feat-grid"></div>
          <div class="feat-top">
            <div><span class="kicker">${esc(p.kicker)} · ${esc(p.year)}</span><h3>${esc(p.name)}</h3></div>
            <span class="feat-icon">${icon(PROJECT_ICON[p.id])}</span>
          </div>
          <p>${esc(p.summary)}</p>
          ${metrics(p.metrics)}
          <div class="feat-foot">${tags(p.stack, i === 0 ? 7 : 4)}<span class="open-hint">Case study ${icon("arrow")}</span></div>
        </button>`
      )
      .join("");

    $("#project-grid").innerHTML = rest
      .map(
        (p) => `<button class="pcard spot reveal" style="--c:${p.accent}" data-project="${p.id}" data-cat="${p.category.join(" ")}" aria-label="Open ${esc(p.name)} details">
          <div class="row"><span class="bar"></span><span class="year">${esc(p.year)}</span></div>
          <div><span class="kicker">${esc(p.kicker)}</span><h4>${esc(p.name)}</h4></div>
          <p>${esc(p.summary)}</p>
          <div class="row">${tags(p.stack, 3)}<span class="open-hint">${icon("arrow")}</span></div>
        </button>`
      )
      .join("");
  }

  function renderAchievements() {
    $("#ach-list").innerHTML = D.achievements
      .map(
        (a, i) => `<li class="ach spot reveal" data-type="${a.type}" style="--d:${Math.min(i, 4) * 0.06}s">
          <span class="ach-ico" aria-hidden="true">${ACH_ICON[a.type] || "⭐"}</span>
          <div><span class="ach-date">${esc(a.date)}</span><h4>${esc(a.title)}</h4><p>${esc(a.body)}</p></div>
          <span class="badge">${esc(a.badge)}</span>
        </li>`
      )
      .join("");
  }

  function renderSkills() {
    $("#skills-grid").innerHTML = D.skills
      .map(
        (g, i) => `<div class="skill-card spot reveal" style="--d:${(i % 4) * 0.06}s">
          <div class="skill-head"><span class="feat-icon">${icon(g.icon)}</span><h4>${esc(g.group)}</h4></div>
          <div class="skill-items">${g.items.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
        </div>`
      )
      .join("");
  }

  /* ---------- Project filter ---------- */
  function initFilters() {
    const chips = $$("#filters .chip");
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        chips.forEach((x) => {
          x.classList.toggle("active", x === c);
          x.setAttribute("aria-selected", x === c);
        });
        const f = c.dataset.filter;
        $$(".pcard").forEach((card) => {
          const show = f === "all" || card.dataset.cat.split(" ").includes(f);
          card.classList.toggle("hide", !show);
          card.classList.remove("enter");
          if (show) {
            void card.offsetWidth;
            card.classList.add("enter", "in");
          }
        });
      })
    );
  }

  /* ---------- Project drawer ---------- */
  let lastFocus = null;
  function openProject(id) {
    const p = D.projects.find((x) => x.id === id);
    if (!p) return;
    lastFocus = document.activeElement;
    $("#drawer-body").innerHTML = `
      <div class="drawer-hero" style="--c:${p.accent}">
        <span class="kicker" style="--c:${p.accent}">${esc(p.kicker)} · ${esc(p.year)}</span>
        <h2 id="drawer-title">${esc(p.name)}</h2>
        <p>${esc(p.summary)}</p>
      </div>
      ${p.metrics ? `<h5>Key numbers</h5>${metrics(p.metrics)}` : ""}
      <h5>What I built</h5>
      <ul class="hl-list" style="--c:${p.accent}">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
      <h5>Stack</h5>
      ${tags(p.stack)}
      <div class="drawer-actions">
        ${p.live ? `<a class="btn btn-primary" href="${esc(p.live)}" target="_blank" rel="noopener">Live demo ${icon("ext")}</a>` : ""}
        ${p.repo ? `<a class="btn btn-ghost" href="${esc(p.repo)}" target="_blank" rel="noopener">${icon("github")} Source</a>` : ""}
      </div>`;
    $("#drawer").hidden = false;
    $("#drawer-backdrop").hidden = false;
    document.body.style.overflow = "hidden";
    $("#drawer").scrollTop = 0;
    $("#drawer-close").focus();
    history.replaceState(null, "", `#project/${p.id}`);
  }
  function closeProject() {
    if ($("#drawer").hidden) return;
    $("#drawer").hidden = true;
    $("#drawer-backdrop").hidden = true;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
    lastFocus && lastFocus.focus();
  }
  function initDrawer() {
    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-project]");
      if (card) openProject(card.dataset.project);
    });
    $("#drawer-close").addEventListener("click", closeProject);
    $("#drawer-backdrop").addEventListener("click", closeProject);
    // focus trap
    $("#drawer").addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$("a, button", $("#drawer"));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    const m = location.hash.match(/^#project\/(.+)$/);
    if (m) setTimeout(() => openProject(m[1]), 300);
  }

  /* ---------- Command palette ---------- */
  function initPalette() {
    const wrap = $("#palette"), input = $("#palette-input"), list = $("#palette-list");
    const go = (id) => () => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    const cmds = [
      { g: "Navigate", label: "Home", ico: "hash", run: go("top") },
      { g: "Navigate", label: "About & education", ico: "hash", run: go("about") },
      { g: "Navigate", label: "Projects", ico: "hash", run: go("projects") },
      { g: "Navigate", label: "Achievements", ico: "hash", run: go("achievements") },
      { g: "Navigate", label: "Skills", ico: "hash", run: go("skills") },
      { g: "Navigate", label: "Contact", ico: "hash", run: go("contact") },
      ...D.projects.map((p) => ({ g: "Projects", label: p.name, hint: p.kicker, ico: PROJECT_ICON[p.id] || "code", run: () => openProject(p.id) })),
      { g: "Actions", label: "Copy email address", ico: "copy", run: copyEmail },
      { g: "Actions", label: "Toggle light / dark theme", ico: "sun", run: toggleTheme },
      { g: "Links", label: "GitHub", hint: D.profile.githubHandle, ico: "github", run: () => window.open(D.profile.github, "_blank", "noopener") },
      { g: "Links", label: "LinkedIn", ico: "ext", run: () => window.open(D.profile.linkedin, "_blank", "noopener") },
      { g: "Links", label: "Send an email", ico: "mail", run: () => (location.href = `mailto:${D.profile.email}`) },
    ];
    let shown = [], sel = 0;

    function draw() {
      const q = input.value.trim().toLowerCase();
      shown = cmds.filter((c) => !q || (c.label + " " + (c.hint || "") + " " + c.g).toLowerCase().includes(q));
      sel = Math.min(sel, Math.max(shown.length - 1, 0));
      if (!shown.length) { list.innerHTML = `<li class="pal-empty">No results for “${esc(q)}”</li>`; return; }
      let html = "", group = "";
      shown.forEach((c, i) => {
        if (c.g !== group) { group = c.g; html += `<li class="pal-group" role="presentation">${group}</li>`; }
        html += `<li class="pal-item${i === sel ? " sel" : ""}" role="option" aria-selected="${i === sel}" data-i="${i}">
          <span class="pi">${icon(c.ico)}</span>${esc(c.label)}${c.hint ? `<small>${esc(c.hint)}</small>` : ""}</li>`;
      });
      list.innerHTML = html;
      const s = $(".pal-item.sel", list);
      s && s.scrollIntoView({ block: "nearest" });
    }
    function open() { wrap.hidden = false; input.value = ""; sel = 0; draw(); input.focus(); document.body.style.overflow = "hidden"; }
    function close() { wrap.hidden = true; document.body.style.overflow = ""; }
    function run(i) { const c = shown[i]; if (!c) return; close(); setTimeout(c.run, 60); }

    $("#open-palette").addEventListener("click", open);
    input.addEventListener("input", () => { sel = 0; draw(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; draw(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; draw(); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
    });
    list.addEventListener("click", (e) => { const it = e.target.closest(".pal-item"); if (it) run(+it.dataset.i); });
    list.addEventListener("mousemove", (e) => {
      const it = e.target.closest(".pal-item");
      if (it && +it.dataset.i !== sel) { sel = +it.dataset.i; $$(".pal-item", list).forEach((x) => x.classList.toggle("sel", +x.dataset.i === sel)); }
    });
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); wrap.hidden ? open() : close(); }
      else if (e.key === "/" && wrap.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
      else if (e.key === "Escape") { if (!wrap.hidden) close(); else closeProject(); }
    });
  }

  /* ---------- Theme ---------- */
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    $('meta[name="theme-color"]').setAttribute("content", next === "light" ? "#f7f7fb" : "#0a0a0f");
  }

  /* ---------- Email copy + toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(D.profile.email);
      toast("Email copied to clipboard");
      const s = $(".copy-state"); s.textContent = "Copied ✓";
      setTimeout(() => (s.textContent = "Copy"), 2000);
    } catch (e) {
      location.href = `mailto:${D.profile.email}`;
    }
  }

  /* ---------- Contact form (FormSubmit, mailto fallback) ---------- */
  function initForm() {
    const form = $("#contact-form"), status = $("#form-status"), btn = $("#cf-submit"), label = $(".btn-label", btn);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      ["cf-name", "cf-email", "cf-msg"].forEach((id) => {
        const el = $("#" + id);
        const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
        el.parentElement.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { status.className = "form-status err"; status.textContent = "Please fill in every field with a valid email."; return; }
      if (form._honey.value) return;

      const name = $("#cf-name").value.trim(), email = $("#cf-email").value.trim(), message = $("#cf-msg").value.trim();
      btn.disabled = true; label.textContent = "Sending…"; status.className = "form-status"; status.textContent = "";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${D.profile.email}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, email, message, _subject: `Portfolio message from ${name}`, _template: "table" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === "false" || data.success === false) throw new Error(data.message || "Failed");
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Thanks! Your message is on its way. I'll reply soon.";
      } catch (err) {
        status.className = "form-status err";
        status.textContent = "Couldn't send from here, so I've opened your email app instead.";
        location.href = `mailto:${D.profile.email}?subject=${encodeURIComponent("Portfolio message from " + name)}&body=${encodeURIComponent(message + "\n\n— " + name + " (" + email + ")")}`;
      } finally {
        btn.disabled = false; label.textContent = "Send message";
      }
    });
  }

  /* ---------- Typed roles ---------- */
  function initTyped() {
    const el = $("#typed");
    const words = D.profile.typed;
    if (reduceMotion) { el.textContent = words[0]; return; }
    let w = 0, c = 0, del = false;
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1800); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 70);
    })();
  }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.decimals || 0;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduceMotion) return;
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          $$("[data-count]", en.target).forEach(countUp);
          if (en.target.matches("[data-count]")) countUp(en.target);
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".reveal, .big-stat").forEach((el) => io.observe(el));
  }

  /* ---------- Nav: active section, indicator, scroll state ---------- */
  function initNav() {
    const nav = $("#nav"), links = $$(".nav-links a"), ind = $(".nav-indicator"), bar = $(".scroll-progress");
    const moveInd = (a) => {
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1; ind.style.left = a.offsetLeft + "px"; ind.style.width = a.offsetWidth + "px";
    };
    const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
    let ticking = false;
    function onScroll() {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      nav.classList.toggle("scrolled", y > 20);
      let cur = null;
      sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = links[i]; });
      links.forEach((a) => a.classList.toggle("active", a === cur));
      moveInd(cur);
      ticking = false;
    }
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();

    const btn = $("#menu-btn"), menu = $("#mobile-menu");
    btn.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open);
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.hidden = true; btn.setAttribute("aria-expanded", false); }));
  }

  /* ---------- Pointer effects: spotlight, tilt, magnetic ---------- */
  function initPointer() {
    if (!finePointer) return;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });

    if (reduceMotion) return;
    const p = $("#portrait");
    p.addEventListener("pointermove", (e) => {
      const r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      p.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg) scale(1.02)`;
      p.style.setProperty("--gx", x * 100 + "%");
      p.style.setProperty("--gy", y * 100 + "%");
    });
    p.addEventListener("pointerleave", () => (p.style.transform = ""));

    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  /* ---------- Hero particle constellation ---------- */
  function initCanvas() {
    const cv = $("#hero-canvas");
    const ctx = cv.getContext("2d");
    let w, h, dpr, pts = [], mouse = { x: -9999, y: -9999 }, raf, visible = true;
    const rgb = () => getComputedStyle(document.documentElement).getPropertyValue("--particle").trim() || "180,170,255";
    let color = rgb();

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 14000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.4 + 0.4,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const LINK = 130;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { const f = (1 - d2 / 22000) * 0.6; p.x += (dx / Math.sqrt(d2 + 1)) * f; p.y += (dy / Math.sqrt(d2 + 1)) * f; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(${color},.55)`; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], ex = p.x - q.x, ey = p.y - q.y, e2 = ex * ex + ey * ey;
          if (e2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(${color},${(1 - Math.sqrt(e2) / LINK) * 0.16})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      raf = visible ? requestAnimationFrame(frame) : null;
    }
    size();
    if (reduceMotion) { frame(); cancelAnimationFrame(raf); return; }
    frame();
    addEventListener("resize", () => { clearTimeout(cv._t); cv._t = setTimeout(size, 150); });
    $(".hero").addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    $(".hero").addEventListener("pointerleave", () => (mouse.x = mouse.y = -9999));
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) frame(); }).observe(cv);
    new MutationObserver(() => (color = rgb())).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- Boot ---------- */
  bindProfile();
  renderStats();
  renderMarquee();
  renderAbout();
  renderProjects();
  renderAchievements();
  renderSkills();
  initFilters();
  initDrawer();
  initPalette();
  initForm();
  initTyped();
  initReveal();
  initNav();
  initPointer();
  initCanvas();
  $("#theme-toggle").addEventListener("click", toggleTheme);
  $("#email-copy").addEventListener("click", copyEmail);
})();
