/* PH-1 STATION — page logic: content, scroll → tour position, pinned panels, HUD, loader */
import { createStation } from "./station.js";

const D = window.PORTFOLIO;
const { gsap, Lenis } = window;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n, l = 2) => String(n).padStart(l, "0");
const FEATURED = ["veritas", "nyayavault", "startin", "guardian", "space-scope", "roomfix"];
const state = { T: 0, velocity: 0, introP: reduce ? 1 : 0, snap: /[?&]snap\b/.test(location.search) };
let lenis = null, station = null, N = 17;

/* ================================================================ content */
function render() {
  const fill = (k, html) => $$(`[data-fill="${k}"]`).forEach((el) => (el.innerHTML = html));
  fill("statement", esc(D.statement));
  fill("stats", D.stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.prefix || "")}${s.decimals ? s.value.toFixed(s.decimals) : s.value}${esc(s.suffix || "")}</dd></div>`).join(""));
  fill("now", D.now.map((n) => `<li><b>${esc(n.title)}</b><span>${esc(n.body)}</span>${n.link ? `<a href="${esc(n.link.url)}" target="_blank" rel="noopener">${esc(n.link.label)}</a>` : ""}</li>`).join(""));
  fill("nowUpdated", `Updated ${esc(D.nowUpdated)}`);
  fill("facts", D.facts.filter((f) => f.k !== "Now").map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join(""));
  fill("education", D.education.map((e) => `<div class="edu-item"><p class="edu-when">${esc(e.period)}</p><h3>${esc(e.title)}</h3><p class="edu-place">${esc(e.place)}</p><ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join(""));
  // lab racks 5–10
  const feat = FEATURED.map((id) => D.projects.find((p) => p.id === id)).filter(Boolean);
  fill("racks", feat.map((p, k) => `
    <section class="stop" data-stop="${5 + k}" id="${k === 0 ? "lab-1" : "lab-" + (k + 1)}" data-label="Rack ${k + 1} · ${esc(p.name)}" data-mod="${k < 5 ? "Destiny lab" : "Node 1 · Unity"}">
      <i class="stop-mark" data-t="${5 + k}"></i>
      <article class="pin" data-side="${k % 2 ? "right" : "left"}" style="--accent:${p.accent}">
        <p class="pin-code">${k < 5 ? "DESTINY LAB" : "NODE 1 GALLEY"} · EXPRESS RACK ${["2", "1", "7", "6", "11B", "GALLEY"][k]}</p>
        <h2 class="pin-title">${esc(p.name)}</h2>
        <p class="pin-kicker">${esc(p.kicker)} · ${esc(p.year)}</p>
        <p class="pin-text">${esc(p.summary)}</p>
        ${p.metrics ? `<dl class="metrics">${p.metrics.map((m) => `<div><dd>${esc(m.k)}</dd><dt>${esc(m.v)}</dt></div>`).join("")}</dl>` : ""}
        <p class="stack">${p.stack.map(esc).join(" · ")}</p>
        <div class="pin-actions">
          <button class="btn btn-solid" type="button" data-project="${esc(p.id)}">Open case file</button>
          ${p.live ? `<a class="btn" href="${esc(p.live)}" target="_blank" rel="noopener">Live site</a>` : ""}
          ${p.repo ? `<a class="btn btn-quiet" href="${esc(p.repo)}" target="_blank" rel="noopener">Code</a>` : ""}
        </div>
      </article>
    </section>`).join(""));
  // archive
  fill("archive", D.projects.filter((p) => !FEATURED.includes(p.id)).map((p) => `<li style="--accent:${p.accent}"><button type="button" data-project="${esc(p.id)}"><b>${esc(p.name)}</b><span>${esc(p.summary)}</span><em>${esc(p.stack.slice(0, 3).join(" · "))} · ${esc(p.year)}</em></button></li>`).join(""));
  // record
  fill("record", D.achievements.map((a) => `<li><span class="rec-badge">${esc(a.badge)}</span><div><b>${esc(a.title)}</b><span>${esc(a.body)}</span></div><time>${esc(a.date)}</time></li>`).join(""));
  // services + skills
  fill("services", D.services.map((s) => `<div class="svc"><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join(""));
  fill("skills", D.skills.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd></div>`).join(""));
  // rail
  const stops = $$(".stop").sort((a, b) => +a.dataset.stop - +b.dataset.stop);
  N = stops.length;
  $("#rail").innerHTML = stops.map((s) => `<li><button type="button" data-go="${s.dataset.stop}" aria-label="${esc(s.dataset.label)}"><i></i><span>${esc(s.dataset.label)}</span></button></li>`).join("");
}

/* ================================================================ scroll → T */
let anchors = [];
function measureAnchors() {
  const els = $$("[data-t]").map((el) => ({ y: el.getBoundingClientRect().top + scrollY - innerHeight * 0.5, t: parseFloat(el.dataset.t) }));
  els.sort((a, b) => a.y - b.y);
  els[0] = { y: 0, t: 0 };
  const max = document.documentElement.scrollHeight - innerHeight;
  els[els.length - 1] = { y: max, t: N - 1 };
  anchors = els.filter((a, i, arr) => i === 0 || a.y > arr[i - 1].y);
}
function scrollToT(y) {
  for (let i = 0; i < anchors.length - 1; i++) { const a = anchors[i], b = anchors[i + 1]; if (y < b.y) return Math.max(0, a.t + (b.t - a.t) * ((y - a.y) / Math.max(1, b.y - a.y))); }
  return N - 1;
}
const yForStop = (i) => { const a = anchors.find((x) => x.t === i); if (a) return a.y; const el = $(`.stop[data-stop="${i}"] .stop-mark`); return el ? el.getBoundingClientRect().top + scrollY - innerHeight * 0.5 : 0; };
function go(i) {
  closeMenu();
  const y = i <= 0 ? 0 : yForStop(i);
  const dist = Math.abs(i - (station ? station.T : state.T));
  lenis ? lenis.scrollTo(y, { duration: Math.min(6, 1.6 + dist * 0.35), easing: (x) => 1 - Math.pow(1 - x, 3) }) : scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}
function initScroll() {
  if (!reduce) {
    lenis = new Lenis({ duration: 1.5, smoothWheel: true, wheelMultiplier: 0.75, touchMultiplier: 1.2 });
    lenis.on("scroll", (e) => { state.velocity = e.velocity; });
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]"); if (!g) return;
    e.preventDefault(); go(+g.dataset.go);
    const id = g.getAttribute("href"); if (id && id.startsWith("#")) history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });
  measureAnchors();
  addEventListener("resize", () => setTimeout(measureAnchors, 200));
  let roT; new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(measureAnchors, 150); }).observe($("#tour"));
  // deep link: #lab, #crew …
  const h = location.hash && $(location.hash.split("/")[0]);
  if (h && !location.hash.startsWith("#case")) { const s = h.closest(".stop") || $(".stop", h); if (s) setTimeout(() => { measureAnchors(); const y = yForStop(+s.dataset.stop); lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, 60); }
}

/* ================================================================ pins + HUD (every frame) */
function initPins() {
  const pins = $$(".stop").map((s) => ({ i: +s.dataset.stop, el: $(".pin", s), label: s.dataset.label, mod: s.dataset.mod }));
  pins.sort((a, b) => a.i - b.i);
  const path = $("#leader-path"), dot = $("#leader-dot"), ring = $("#leader-ring"), flash = $("#flash");
  const roMod = $("#ro-mod"), roStop = $("#ro-stop"), cue = $("#scroll-cue");
  const railBtns = $$("#rail button"), navLinks = $$(".modules a");
  const P = { x: 0, y: 0, z: 0 };
  let active = -1, lastLabel = "";
  pins.forEach((p) => p.el.setAttribute("inert", ""));
  const tick = () => {
    state.T = scrollToT(lenis ? lenis.scroll : scrollY);
    const T = station ? station.T ?? state.T : state.T;
    const k = Math.round(T), d = Math.abs(T - k);
    // panel visibility
    pins.forEach((p) => {
      const on = p.i === k && d < 0.32;
      const o = p.i === k ? 1 - Math.min(1, Math.max(0, (d - 0.12) / 0.2)) : 0;
      p.el.style.opacity = o.toFixed(3);
      p.el.style.transform = `translateY(calc(var(--ty) + ${((1 - o) * 18).toFixed(1)}px))`;
      if (on && active !== p.i) { p.el.removeAttribute("inert"); p.el.classList.add("on"); }
      if (!on && p.el.classList.contains("on")) { p.el.setAttribute("inert", ""); p.el.classList.remove("on"); }
    });
    if (d < 0.32) active = k; else active = -1;
    // leader line from the panel to the device it describes
    const cur = pins[k];
    let lineOn = false;
    if (station && cur && d < 0.32 && cur.el.dataset.side !== "center" && station.scene === station.sceneOf(k)) {
      const a = station.anchors(k);
      if (a) {
        station.project(a, P);
        const r = cur.el.getBoundingClientRect();
        const vis = P.z < 1 && P.x > -40 && P.x < innerWidth + 40 && P.y > -40 && P.y < innerHeight + 40;
        if (vis && r.width) {
          const mobile = innerWidth < 761;
          let sx, sy, mx, my;
          if (mobile) { sx = Math.min(r.right - 24, Math.max(r.left + 24, P.x)); sy = r.top; mx = sx; my = sy - 24; }
          else if (cur.el.dataset.side === "left") { sx = r.right; sy = Math.min(r.bottom - 32, Math.max(r.top + 32, P.y)); mx = sx + 32; my = sy; }
          else { sx = r.left; sy = Math.min(r.bottom - 32, Math.max(r.top + 32, P.y)); mx = sx - 32; my = sy; }
          const inside = P.x > r.left && P.x < r.right && P.y > r.top && P.y < r.bottom;
          if (!inside) {
            path.setAttribute("d", `M${sx.toFixed(1)},${sy.toFixed(1)} L${mx.toFixed(1)},${my.toFixed(1)} L${P.x.toFixed(1)},${P.y.toFixed(1)}`);
            dot.setAttribute("cx", P.x); dot.setAttribute("cy", P.y); ring.setAttribute("cx", P.x); ring.setAttribute("cy", P.y);
            lineOn = true;
          }
        }
      }
    }
    $("#leaders").style.opacity = lineOn ? Math.max(0, 1 - d / 0.25).toFixed(3) : "0";
    flash.style.opacity = station ? station.flash.toFixed(3) : 0;
    // readout + rail + nav
    const near = pins[Math.min(pins.length - 1, Math.max(0, Math.round(T)))];
    if (near && near.label !== lastLabel) {
      lastLabel = near.label; roMod.textContent = near.mod; roStop.textContent = near.label;
      railBtns.forEach((b) => b.classList.toggle("cur", +b.dataset.go === near.i));
      railBtns.forEach((b) => b.classList.toggle("past", +b.dataset.go < near.i));
      const navOf = (i) => (i < 4 ? 0 : i < 5 ? 4 : i < 11 ? 5 : i < 12 ? 11 : i < 13 ? 12 : i < 15 ? 14 : i < 16 ? 15 : 0);
      navLinks.forEach((a) => a.classList.toggle("cur", +a.dataset.go === navOf(near.i)));
    }
    cue.classList.toggle("gone", T > 0.15);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ================================================================ loader */
function loaderFX(canvas) {
  const ctx = canvas.getContext("2d");
  const fx = { speed: 0.06, glow: 0, alive: true };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  const cols = ["#ffffff", "#dbe7ff", "#7dd3fc", "#fbbf24", "#f97316"];
  const st = Array.from({ length: innerWidth < 700 ? 420 : 950 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), c: cols[(Math.random() ** 2.2 * cols.length) | 0] }));
  let last = performance.now();
  const frame = (now) => {
    if (!fx.alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const cx = W / 2, cy = H / 2, f = Math.max(W, H) * 0.42, v = fx.speed;
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = `rgba(3,4,10,${Math.max(0.18, 0.9 - v * 0.35)})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const g = 0.12 + fx.glow * 0.9 + v * 0.05, r0 = Math.min(W, H) * (0.35 + fx.glow * 0.5);
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0); gr.addColorStop(0, `rgba(200,220,255,${g * 0.5})`); gr.addColorStop(0.35, `rgba(251,191,36,${g * 0.18})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    for (const s of st) {
      const pz = s.z; s.z -= v * dt;
      if (s.z <= 0.015) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; continue; }
      const sx = cx + (s.x / s.z) * f, sy = cy + (s.y / s.z) * f;
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) { s.z = 1; continue; }
      const tz = Math.min(1, pz + v * 0.045 * (1 + v * 2)), px = cx + (s.x / tz) * f, py = cy + (s.y / tz) * f;
      ctx.strokeStyle = s.c; ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4); ctx.lineWidth = Math.max(0.5, (1 - s.z) * 2.6);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
    }
    ctx.globalAlpha = 1; requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  fx.stop = () => { fx.alive = false; removeEventListener("resize", size); };
  return fx;
}
function intro(ready) {
  const num = $("#loader-num"), bar = $("#loader-bar"), status = $("#loader-status"), log = $("#ld-log"), c3 = $("#ld-count3");
  const fx = loaderFX($("#loader-fx")); if (reduce) fx.speed = 0.01;
  const GL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>+=";
  const letters = [];
  $$("#loader-name .ln-w").forEach((w) => { const t = w.textContent; w.textContent = ""; [...t].forEach((ch) => { const sp = document.createElement("span"); sp.className = "ln-ch scr"; sp.textContent = GL[(Math.random() * GL.length) | 0]; sp.dataset.c = ch; w.appendChild(sp); letters.push(sp); }); });
  const order = letters.map((_, i) => i).sort(() => Math.random() - 0.5);
  let locked = 0, lastScr = 0;
  const decode = (pct) => {
    const want = Math.floor(letters.length * Math.min(1, pct / 88));
    while (locked < want) { const el = letters[order[locked++]]; el.textContent = el.dataset.c; el.classList.remove("scr"); el.classList.add("hit"); }
    const now = performance.now(); if (now - lastScr > 55) { lastScr = now; letters.forEach((el) => { if (el.classList.contains("scr")) el.textContent = GL[(Math.random() * GL.length) | 0]; }); }
  };
  const lines = [[0, "SYS", "boot sequence · PH-1 tour"], [10, "NAV", "launch site locked · Valsad, IN"], [24, "GEO", "NASA IGOAL ISS model · 1.3M triangles"], [40, "TEX", "NASA blue marble · day / night / clouds"], [56, "INT", "Destiny · Harmony · Unity · Cupola"], [71, "LAB", "EXPRESS racks 1 · 2 · 6 · 7 · 11B powered"], [86, "RDV", "rendezvous burn computed"], [97, "GO ", "all systems <b>nominal</b>"]];
  let li = 0; const t0 = performance.now();
  const pushLog = (pct) => { while (li < lines.length && pct >= lines[li][0]) { const [, k, m] = lines[li++]; const d = document.createElement("div"); d.innerHTML = `[${((performance.now() - t0) / 1000).toFixed(2).padStart(5, "0")}] <em>${k}</em>  ${m}`; log.appendChild(d); while (log.children.length > 5) log.removeChild(log.firstChild); } };
  const clock = $("#ld-clock"); const tickClock = () => { clock.textContent = "UTC " + new Date().toISOString().slice(11, 19); }; tickClock(); const clk = setInterval(tickClock, 1000);
  const msgs = ["BOOT SEQUENCE", "LOADING STATION MODEL", "LOADING EARTH IMAGERY", "PLOTTING RENDEZVOUS", "PRESSURISING MODULES", "READY FOR LAUNCH"];
  const p = { v: 0 };
  const loaded = Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)))]), new Promise((r) => setTimeout(r, 9000))]);
  const tl = gsap.timeline({ paused: true });
  tl.to(".ld-kicker", { opacity: 1, duration: 0.8, ease: "power2.out" })
    .to(p, { v: 100, duration: reduce ? 0.2 : 2.8, ease: "power1.inOut", onUpdate: () => { const v = p.v; num.textContent = pad(Math.round(v), 3); bar.style.transform = `scaleX(${v / 100})`; status.textContent = msgs[Math.min(msgs.length - 1, Math.floor(v / 18))]; if (!reduce) fx.speed = 0.06 + (v / 100) ** 2.2 * 0.55; decode(v); pushLog(v); } }, "<")
    .add(() => { status.textContent = "T-MINUS"; })
    .to(c3, { duration: reduce ? 0.01 : 1.5, ease: "none", onStart: () => { c3.textContent = "· 3 ·"; }, onUpdate: function () { c3.textContent = `· ${Math.max(1, 3 - Math.floor(this.progress() * 3))} ·`; } })
    .to(fx, { speed: reduce ? 0.01 : 0.42, glow: 0.25, duration: 1.5, ease: "none" }, "<")
    .add(() => { c3.textContent = "IGNITION"; status.textContent = "LIFTOFF"; })
    .to(fx, { speed: reduce ? 0.01 : 3.4, glow: 1, duration: 1.3, ease: "power3.in" })
    .to(".ld-rings i", { scale: 3.2, opacity: 0, duration: 1.2, ease: "power3.in", stagger: 0.06 }, "<")
    .to(".loader-name", { scale: 1.25, letterSpacing: "0.12em", filter: "blur(10px)", opacity: 0, duration: 1.1, ease: "power3.in" }, "<0.15")
    .to(".ld-kicker, .ld-count3, .loader-top, .loader-bottom, .loader-bar", { opacity: 0, duration: 0.6, ease: "power2.in" }, "<0.3")
    .to("#ld-flash", { opacity: 1, duration: 0.35, ease: "power2.in" }, "-=0.35")
    .to("#loader", { "--hole": "130%", duration: 1.6, ease: "expo.inOut" }, "-=0.05")
    .to("#ld-flash", { opacity: 0, duration: 1.0, ease: "power2.out" }, "<0.2")
    .add(() => { fx.stop(); clearInterval(clk); document.body.classList.remove("is-loading"); const L = $("#loader"); L && L.parentNode.removeChild(L); measureAnchors(); })
    .to(state, { introP: 1, duration: reduce ? 0.01 : 4.5, ease: "none" }, "-=1.7")
    .from(".hud > *, .rail, .readout, .orbit, .scroll-cue", { opacity: 0, y: -10, stagger: 0.05, duration: 0.8, ease: "power3.out" }, "-=3.2");
  lenis && lenis.stop();
  loaded.then(() => { tl.play(); tl.eventCallback("onComplete", () => lenis && lenis.start()); });
}

/* ================================================================ case file */
let lastFocus;
function openCase(id) {
  const p = D.projects.find((x) => x.id === id); if (!p) return;
  lastFocus = document.activeElement;
  const rack = FEATURED.indexOf(p.id);
  $("#case-inner").innerHTML = `
    <header class="case-head" style="--accent:${p.accent}">
      <p class="pin-code">${rack >= 0 ? (rack < 5 ? "DESTINY LAB · EXPRESS RACK " : "NODE 1 · ") + ["2", "1", "7", "6", "11B", "GALLEY RACK"][rack] : "PMM · STOWAGE"} · ${esc(p.kicker)} · ${esc(p.year)}</p>
      <h2 id="case-title">${esc(p.name)}</h2>
      <p class="case-sum">${esc(p.summary)}</p>
    </header>
    ${p.metrics ? `<dl class="metrics case-metrics" style="--accent:${p.accent}">${p.metrics.map((m) => `<div><dd>${esc(m.k)}</dd><dt>${esc(m.v)}</dt></div>`).join("")}</dl>` : ""}
    <div class="case-body" style="--accent:${p.accent}">
      <section><h3>What I built</h3><ul class="case-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></section>
      <section><h3>Stack</h3><p class="case-stack">${p.stack.map(esc).join(" · ")}</p>
        <div class="pin-actions">${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener" class="btn btn-solid">Open live site</a>` : ""}${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener" class="btn">Read the code</a>` : ""}</div>
      </section>
    </div>`;
  const el = $("#case"); el.hidden = false; el.scrollTop = 0; lenis && lenis.stop();
  document.documentElement.classList.add("case-open");
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduce ? 0.01 : 0.35, ease: "power2.out" });
  gsap.from(".case-inner > *", { y: 24, opacity: 0, stagger: 0.06, duration: reduce ? 0.01 : 0.6, ease: "power3.out" });
  $("#case-close").focus({ preventScroll: true });
  history.replaceState(null, "", `#case/${p.id}`);
}
function closeCase() {
  const el = $("#case"); if (el.hidden) return;
  gsap.to(el, { opacity: 0, duration: reduce ? 0.01 : 0.25, onComplete: () => { el.hidden = true; document.documentElement.classList.remove("case-open"); lenis && lenis.start(); lastFocus && lastFocus.focus({ preventScroll: true }); } });
  history.replaceState(null, "", location.pathname + location.search);
}
function initCase() {
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-project]"); if (t) openCase(t.dataset.project); });
  $("#case-close").addEventListener("click", closeCase);
  $("#case").addEventListener("click", (e) => { if (e.target.id === "case") closeCase(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCase(); closeMenu(); } });
  const m = location.hash.match(/^#case\/(.+)$/); if (m) setTimeout(() => openCase(m[1]), 9000);
}

/* ================================================================ menu, contact, telemetry */
function closeMenu() { const m = $("#menu"); if (m && !m.hidden) { m.hidden = true; $("#menu-btn").setAttribute("aria-expanded", "false"); } }
function initMenu() { $("#menu-btn").addEventListener("click", () => { const m = $("#menu"); m.hidden = !m.hidden; $("#menu-btn").setAttribute("aria-expanded", String(!m.hidden)); }); }
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }
function initContact() {
  $("#mail-big").addEventListener("click", async (e) => { e.preventDefault(); try { await navigator.clipboard.writeText(D.profile.email); toast("Email address copied"); } catch { location.href = `mailto:${D.profile.email}`; } });
  const form = $("#contact-form"), status = $("#form-status"), btn = $("#cf-submit"), label = $(".send-label", btn);
  const check = (el) => { const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value)); el.parentElement.classList.toggle("invalid", bad); return !bad; };
  ["cf-name", "cf-email", "cf-msg"].forEach((id) => { const el = $("#" + id); el.addEventListener("blur", () => el.value && check(el)); el.addEventListener("input", () => el.parentElement.classList.remove("invalid")); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = ["cf-name", "cf-email", "cf-msg"].map((id) => check($("#" + id))).every(Boolean);
    if (!ok) { status.className = "form-status err"; status.textContent = "Add your name, a valid email and a message."; return; }
    if (form._honey.value) return;
    const name = $("#cf-name").value.trim(), email = $("#cf-email").value.trim(), message = $("#cf-msg").value.trim();
    btn.disabled = true; label.textContent = "Sending…"; status.textContent = ""; status.className = "form-status";
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${D.profile.email}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name, email, message, _subject: `Portfolio message from ${name}`, _template: "table" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === "false") throw new Error();
      form.reset(); status.className = "form-status ok"; status.textContent = "Message sent. I'll reply within a day.";
    } catch {
      status.className = "form-status err"; status.textContent = "The form relay didn't answer, so your email app is opening with the message instead.";
      location.href = `mailto:${D.profile.email}?subject=${encodeURIComponent("Portfolio message from " + name)}&body=${encodeURIComponent(message + "\n\n— " + name + " (" + email + ")")}`;
    } finally { btn.disabled = false; label.textContent = "Send message"; }
  });
}
async function cached(key, url, ttlMin = 30) {
  try { const c = JSON.parse(sessionStorage.getItem(key) || "null"); if (c && Date.now() - c.t < ttlMin * 60000) return c.d; } catch {}
  const r = await fetch(url); if (!r.ok) throw new Error(r.status); const d = await r.json();
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch {}
  return d;
}
const fmtDate = (s) => new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const ago = (iso) => { const d = (Date.now() - new Date(iso)) / 864e5; return d < 1 ? "today" : d < 2 ? "yesterday" : d < 30 ? `${Math.round(d)} days ago` : d < 365 ? `${Math.round(d / 30)} mo ago` : `${Math.round(d / 365)} yr ago`; };
function initTelemetry() {
  const user = D.profile.githubHandle, status = $("#tele-status");
  const go = async () => {
    try {
      const data = await cached("tele-contrib", `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`);
      const days = (data.contributions || []).filter((d) => d && d.date); if (!days.length) throw 0;
      let total = 0, active = 0, streak = 0, run = 0;
      days.forEach((d) => { total += d.count; if (d.count > 0) { active++; run++; streak = Math.max(streak, run); } else run = 0; });
      const set = (k, v) => { const el = $(`[data-k="${k}"]`); if (el) el.textContent = v; };
      set("total", total.toLocaleString("en-US")); set("active", active); set("streak", `${streak} day${streak === 1 ? "" : "s"}`);
      const heat = $("#heat"), tip = $("#heat-tip");
      const offset = new Date(days[0].date + "T00:00:00").getDay();
      heat.innerHTML = Array(offset).fill('<i class="pad"></i>').concat(days.map((d) => `<i class="l${Math.min(4, d.level ?? 0)}" data-d="${d.date}" data-c="${d.count}"></i>`)).join("");
      heat.addEventListener("pointerover", (e) => { const c = e.target.closest("i[data-d]"); if (!c) { tip.hidden = true; return; } const n = +c.dataset.c; tip.textContent = `${n} contribution${n === 1 ? "" : "s"}, ${fmtDate(c.dataset.d)}`; const r = c.getBoundingClientRect(), pr = heat.parentElement.getBoundingClientRect(); tip.style.left = r.left - pr.left + r.width / 2 + "px"; tip.style.top = r.top - pr.top - 8 + "px"; tip.hidden = false; });
      heat.addEventListener("pointerleave", () => (tip.hidden = true));
      status.textContent = "Signal locked · live from GitHub"; status.classList.add("ok");
    } catch { status.innerHTML = `Downlink unavailable right now. <a href="https://github.com/${esc(user)}" target="_blank" rel="noopener">See the activity on GitHub</a>`; status.classList.add("err"); }
    try {
      const repos = await cached("tele-repos", `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=12`);
      const list = repos.filter((r) => !r.fork && r.name.toLowerCase() !== user.toLowerCase()).slice(0, 4); if (!list.length) throw 0;
      $("#shipped-list").innerHTML = `<li class="sh-head">Recently pushed</li>` + list.map((r) => `<li><a href="${esc(r.html_url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${r.language ? esc(r.language) + " · " : ""}${ago(r.pushed_at)}</span></a></li>`).join("");
    } catch { $("#shipped-list").innerHTML = ""; }
  };
  setTimeout(go, 2500);
}

/* ================================================================ boot */
render();
const sides = $$(".stop").sort((x, y) => +x.dataset.stop - +y.dataset.stop).map((st) => $(".pin", st).dataset.side);
try { station = createStation($("#gl"), state, D, { sides }); } catch (err) { console.warn("WebGL unavailable", err); document.documentElement.classList.add("no-webgl"); }
if (state.snap) window.__station = station; // test hook (only with ?snap)
initScroll();
initPins();
initMenu();
initCase();
initContact();
initTelemetry();
intro(station ? station.ready : Promise.resolve());
addEventListener("load", measureAnchors);
