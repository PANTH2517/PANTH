/* PH-1 STATION — scroll-driven tour of the International Space Station.
   Exterior: NASA IGOAL ISS model (NASA 3D Resources, public domain), optimised for the web.
   Interior: NASA ISS interior model (Node 1, Destiny lab, Node 2, Node 3, PMM, Cupola, Columbus, Kibo).
   Earth: NASA Blue Marble / Black Marble imagery. Portfolio data is shown on station hardware:
   laptops on real EXPRESS racks, a crew-quarters ID card, mission patches, stowage tags. */
import * as THREE from "three";
import { GLTFLoader } from "../assets/vendor/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../assets/vendor/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "../assets/vendor/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../assets/vendor/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../assets/vendor/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "../assets/vendor/jsm/postprocessing/OutputPass.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoother = (x) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const UY = V(0, 1, 0), UZ = V(0, 0, 1);

/* ------------------------------------------------------------------ canvas helpers */
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData.redraw = (fn) => { fn(g, w, h); t.needsUpdate = true; };
  return t;
}
const FONT = (w, s, fam = "Barlow") => `${w} ${s}px ${fam}, Arial, sans-serif`;
function wrap(g, text, x, y, maxW, lh, maxLines = 99) {
  const words = String(text).split(" "); let line = "", n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (g.measureText(test).width > maxW && line) { if (++n >= maxLines) { while (line.length > 3 && g.measureText(line + "…").width > maxW) line = line.slice(0, -1); g.fillText(line + "…", x, y); return y + lh; } g.fillText(line, x, y); y += lh; line = words[i]; }
    else line = test;
  }
  g.fillText(line, x, y); return y + lh;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

/* ------------------------------------------------------------------ main */
export function createStation(canvas, state, D, opts = {}) {
  const mobile = matchMedia("(max-width: 760px)").matches || matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.03, 30000);
  const EXT = new THREE.Scene(), INT = new THREE.Scene();
  EXT.background = new THREE.Color(0x000002); INT.background = new THREE.Color(0x000002);
  const texLoader = new THREE.TextureLoader();
  const gltf = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("assets/vendor/draco/"));
  const loadGLB = (url, onProgress) => new Promise((ok, fail) => gltf.load(url, ok, onProgress, fail));

  /* ================================================================ shared: stars, sun glow, Earth */
  function stars(scene, n, r) {
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(r);
      p.set([v.x, v.y, v.z], i * 3); const k = 0.35 + Math.random() ** 3 * 0.65, w = Math.random();
      c.set([k * (w > 0.85 ? 1 : 0.88), k * 0.92, k * (w < 0.15 ? 0.8 : 1)], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false })));
  }
  const glowTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.12, "rgba(255,246,230,0.85)"); gr.addColorStop(0.4, "rgba(255,200,140,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const sprite = (color, scale, opacity = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(scale); return s; };
  const tex = (f) => { const t = texLoader.load(f); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const dayT = tex("assets/tex/earth-day.jpg"), nightT = tex("assets/tex/earth-night.jpg"), cloudT = texLoader.load("assets/tex/earth-clouds.jpg");
  const uTime = { value: 0 };
  function earth(scene, R, center, sunDir) {
    const sunPos = center.clone().add(sunDir.clone().multiplyScalar(R * 60));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uDay: { value: dayT }, uNight: { value: nightT }, uClouds: { value: cloudT }, uSun: { value: sunPos }, uTime },
      vertexShader: `varying vec2 vUv; varying vec3 vWN; varying vec3 vW; void main(){ vUv=uv; vWN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D uDay,uNight,uClouds; uniform vec3 uSun; uniform float uTime; varying vec2 vUv; varying vec3 vWN; varying vec3 vW;
        void main(){
          vec3 L=normalize(uSun-vW); float ndl=dot(vWN,L);
          float dayMix=smoothstep(-0.12,0.25,ndl);
          vec3 day=texture2D(uDay,vUv).rgb;
          vec3 night=texture2D(uNight,vUv).rgb; night=pow(night,vec3(1.4))*vec3(2.4,1.7,1.0)*3.0;
          float cl=texture2D(uClouds,vUv+vec2(uTime*0.0006,0.0)).r;
          vec3 dayCol=day*(0.06+max(ndl,0.0)*1.2);
          dayCol=mix(dayCol,vec3(1.0)*(0.05+max(ndl,0.0)*1.0),cl*0.9);
          vec3 nightCol=night*(1.0-cl*0.85)+vec3(0.004,0.008,0.02)*cl;
          vec3 col=mix(nightCol,dayCol,dayMix);
          vec3 Vd=normalize(cameraPosition-vW);
          float rim=pow(1.0-max(dot(vWN,Vd),0.0),2.5);
          col+=vec3(0.25,0.5,1.0)*rim*(0.08+1.2*smoothstep(-0.25,0.45,ndl));
          col+=vec3(1.0,0.45,0.15)*rim*smoothstep(-0.25,0.0,ndl)*(1.0-smoothstep(0.0,0.25,ndl))*1.4;
          float spec=pow(max(dot(reflect(-L,vWN),Vd),0.0),60.0)*(1.0-cl)*step(0.0,ndl)*(1.0-smoothstep(0.1,0.3,length(day-vec3(0.05,0.1,0.25))));
          col+=vec3(1.0,0.85,0.6)*spec*0.8;
          gl_FragColor=vec4(col,1.0);
        }`,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 160), mat); m.position.copy(center);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.018, 128, 128), new THREE.ShaderMaterial({
      uniforms: { uSun: { value: sunPos } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      vertexShader: `varying vec3 vWN; varying vec3 vW; void main(){ vWN=normalize(mat3(modelMatrix)*normal); vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uSun; varying vec3 vWN; varying vec3 vW; void main(){ vec3 Vd=normalize(cameraPosition-vW); float i=pow(clamp(1.0-abs(dot(vWN,Vd)),0.0,1.0),5.0); float lit=smoothstep(-0.45,0.35,dot(-vWN,normalize(uSun-vW))); gl_FragColor=vec4(vec3(0.3,0.6,1.0)*i*lit*2.2,1.0); }`,
    }));
    atmo.position.copy(center); scene.add(m, atmo);
    const lat = THREE.MathUtils.degToRad(20.6), lon = THREE.MathUtils.degToRad(72.93);
    const local = V(-Math.cos(lon + Math.PI) * Math.cos(lat), Math.sin(lat), Math.sin(lon + Math.PI) * Math.cos(lat));
    return { mesh: m, local, R, center };
  }
  const aimEarth = (E, worldDir) => E.mesh.quaternion.setFromUnitVectors(E.local.clone().normalize(), worldDir.clone().normalize());
  const valsadWorld = (E) => E.local.clone().applyQuaternion(E.mesh.quaternion).multiplyScalar(E.R * 1.001).add(E.center);

  /* ================================================================ reflections */
  const pmrem = new THREE.PMREMGenerator(renderer);
  function envFrom(bottom, top, sunCol, sunDir, sunPow, upAxis = UY) {
    const sc = new THREE.Scene();
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uB: { value: new THREE.Color(bottom) }, uT: { value: new THREE.Color(top) }, uS: { value: new THREE.Color(sunCol) }, uD: { value: sunDir }, uP: { value: sunPow }, uU: { value: upAxis } },
      vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uB,uT,uS,uD,uU; uniform float uP; varying vec3 vD; void main(){ float h=dot(vD,uU); vec3 c=mix(uB,uT,smoothstep(-0.25,0.35,h)); c+=uS*pow(max(dot(vD,uD),0.0),uP)*6.0; gl_FragColor=vec4(c,1.0); }` })));
    return pmrem.fromScene(sc, 0.02).texture;
  }

  /* ================================================================ EXTERIOR */
  const SUN_DIR = V(0.78, 0.38, 0.5).normalize(); // sun front-right of the approach, so the station is lit
  stars(EXT, 6000, 12000);
  const sunE = sprite(0xfff6e8, 1100); sunE.position.copy(SUN_DIR.clone().multiplyScalar(10000)); EXT.add(sunE);
  EXT.add(sprite(0xffb070, 3800, 0.28).translateOnAxis(SUN_DIR, 10000));
  EXT.environment = envFrom(0x1e2836, 0x000000, 0xfff1dc, SUN_DIR, 60.0);
  EXT.add(new THREE.HemisphereLight(0x9cbcff, 0x0a0a14, 0.25));
  const sunL = new THREE.DirectionalLight(0xfff4e6, 4.2); sunL.position.copy(SUN_DIR.clone().multiplyScalar(100)); EXT.add(sunL);
  const earthShine = new THREE.DirectionalLight(0x6f8fd0, 0.35); earthShine.position.set(0, -100, 0); EXT.add(earthShine);
  const EARTH_R = 1600;
  const E1 = earth(EXT, EARTH_R, V(0, -EARTH_R - 140, 0), SUN_DIR);
  aimEarth(E1, V(0.3, 1, -0.15));

  const A = {}; // exterior anchors
  const SCALE = 13; // model units -> scene units (ISS ≈ 109 m across)
  const bboxOf = (obj) => new THREE.Box3().setFromObject(obj);
  const centerOf = (root, name) => { const o = root.getObjectByName(name); return o ? bboxOf(o).getCenter(V()) : null; };
  let extReady, intReady;
  const progress = { ext: 0, int: 0 };
  extReady = loadGLB(mobile ? "assets/models/iss-ext-lite.glb" : "assets/models/iss-ext.glb", (e) => { if (e.total) progress.ext = Math.min(0.99, e.loaded / e.total); }).then((g) => {
    const m = g.scene;
    m.traverse((o) => { if (o.isMesh) { o.frustumCulled = true; const mt = o.material; if (mt && mt.map) mt.map.anisotropy = 8; } });
    const holder = new THREE.Group(); holder.add(m);
    const c = bboxOf(m).getCenter(V()); m.position.sub(c);
    holder.rotation.y = Math.PI / 2; holder.scale.setScalar(SCALE);
    EXT.add(holder); holder.updateMatrixWorld(true);
    A.box = bboxOf(holder); A.center = A.box.getCenter(V());
    A.wing = centerOf(holder, "S4_Array_1A") || A.center.clone().add(V(40, 10, 0));
    A.antenna = centerOf(holder, "Payload_SGANT") || A.center.clone().add(V(0, 10, 0));
    A.dock = centerOf(holder, "IDA2") || A.center.clone().add(V(0, 0, 30));
    A.cupola = centerOf(holder, "Cupola") || A.center.clone();
    // blinking strobes (real ISS has none this bright; keep them subtle)
    progress.ext = 1;
  }).catch((e) => { console.warn("exterior model failed", e); progress.ext = 1; });

  /* ================================================================ INTERIOR */
  stars(INT, 3000, 8000);
  const INT_SUN = V(0.35, 0.25, 0.9).normalize(); // sun above the station so the Earth under the cupola is in daylight
  INT.environment = envFrom(0x2a2d33, 0x6e737b, 0x000000, UZ, 6.0, UZ);
  const hemi = new THREE.HemisphereLight(0xf2f5ff, 0x6c7079, 0.75); hemi.position.set(0, 0, 1); INT.add(hemi);
  const I = {};
  const ray = new THREE.Raycaster();
  let INTERIOR = null;
  const hitWall = (from, dir, max = 4) => { if (!INTERIOR) return null; ray.set(from, dir.clone().normalize()); ray.far = max; const h = ray.intersectObject(INTERIOR, true).find((x) => x.face); if (!h) return null; const n = h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize(); if (n.dot(dir) > 0) n.negate(); return { p: h.point, n }; };
  // a ThinkPad-style station laptop showing a canvas screen
  function laptop(screenTex, scale = 1) {
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.55, metalness: 0.15 });
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.225, 0.012), body); g.add(lid);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.195), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); scr.position.z = 0.0065; g.add(scr);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.018, 0.235), body); base.position.set(0, -0.12, 0.11); base.rotation.x = 0.05; g.add(base);
    const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.8 })); keys.rotation.x = -Math.PI / 2 + 0.05; keys.position.set(0, -0.11, 0.09); g.add(keys);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.004, 12), new THREE.MeshBasicMaterial({ color: 0xd11a2a })); dot.rotation.x = -Math.PI / 2 + 0.05; dot.position.set(0, -0.109, 0.12); g.add(dot);
    // velcro mount arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.7, roughness: 0.35 })); arm.rotation.x = Math.PI / 2; arm.position.set(0, -0.12, -0.06); g.add(arm);
    g.scale.setScalar(scale); g.userData.screen = scr; return g;
  }
  const mountOn = (obj, hit, up, out = 0.16, along = V()) => { obj.position.copy(hit.p).addScaledVector(hit.n, out).add(along); obj.up.copy(up); obj.lookAt(obj.position.clone().add(hit.n)); INT.add(obj); obj.updateMatrixWorld(true); return obj; };

  function drawRackScreen(c, w, h, p, k, t) {
    c.fillStyle = "#0a0f1a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#1f2937"; c.fillRect(0, 0, w, 52); // window title bar
    c.fillStyle = "#cbd5e1"; c.font = FONT(600, 26); c.fillText(`${p.name} — EXPRESS Rack ${k + 1} payload`, 24, 35);
    ["#ef4444", "#f59e0b", "#22c55e"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(w - 40 - i * 32, 26, 9, 0, 7); c.fill(); });
    c.fillStyle = p.accent; c.fillRect(0, 52, w, 6);
    c.fillStyle = "#94a3b8"; c.font = FONT(600, 30, "Barlow Condensed"); c.fillText(String(p.kicker).toUpperCase() + " · " + p.year, 40, 116);
    c.fillStyle = "#ffffff"; c.font = FONT(700, 110, "Barlow Condensed"); c.fillText(p.name, 36, 225);
    c.fillStyle = "#cbd5e1"; c.font = FONT(500, 33); wrap(c, p.summary, 40, 290, w - 80, 46, 3);
    (p.metrics || []).slice(0, 3).forEach((m, i) => { const x = 40 + i * 400; c.fillStyle = p.accent; c.font = FONT(700, 76, "Barlow Condensed"); c.fillText(m.k, x, 540); c.fillStyle = "#94a3b8"; c.font = FONT(500, 28); c.fillText(m.v, x, 582); });
    c.strokeStyle = p.accent; c.lineWidth = 3; c.beginPath();
    for (let x = 0; x <= w - 80; x += 6) { const y = 690 + Math.sin(x * 0.02 + t * 2 + k) * 16 + Math.sin(x * 0.051 + t * 3.1) * 9; x ? c.lineTo(40 + x, y) : c.moveTo(40, y); }
    c.stroke();
    c.fillStyle = "#64748b"; c.font = FONT(500, 22); c.fillText(`telemetry ${new Date().toISOString().slice(11, 19)} UTC`, 40, h - 24);
  }

  intReady = (async () => {
    await extReady; // exterior first, then stream the interior
    const g = await loadGLB("assets/models/interior.glb", (e) => { if (e.total) progress.int = Math.min(0.99, e.loaded / e.total); });
    const m = g.scene; m.scale.setScalar(100);
    const glass = m.getObjectByName("Cupola_Int_Glass"); if (glass) { glass.scale.multiplyScalar(0.01); glass.position.multiplyScalar(0.01); }
    // open the cupola window shutters so Earth is visible
    m.traverse((o) => { if (/^Cupola_WC_/.test(o.name)) o.visible = false; });
    m.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mt) => {
        const n = mt.name || "";
        if (/Glass/.test(n)) { mt.transparent = true; mt.opacity = 0.08; mt.roughness = 0.05; mt.metalness = 0; mt.depthWrite = false; mt.color.set(0xb8c8dc); return; }
        if (/Light/i.test(n)) { mt.emissive = new THREE.Color(0xffffff); mt.emissiveIntensity = 1.6; mt.emissiveMap = mt.emissiveMap || mt.map; }
        if (/Metal|Hub/.test(n)) { mt.metalness = 0.55; mt.roughness = 0.42; } else { mt.metalness = 0.04; mt.roughness = 0.78; }
        if (mt.map) mt.map.anisotropy = 8;
      });
    });
    INT.add(m); m.updateMatrixWorld(true); INTERIOR = m;
    // module lights (the real ISS uses LED light panels; these stand in for their glow)
    [[14, 3.38, 0], [10.4, 3.43, -0.2], [7, 3.43, -0.2], [3.6, 3.43, -0.2], [-0.6, 3.38, 0], [0.1, 7.6, 0], [5.2, 9.81, 0], [0, 9.81, -1.7]].forEach(([x, y, z], i) => { const l = new THREE.PointLight(i === 7 ? 0xdbe6ff : 0xf5f7ff, 2.2, 6, 1.6); l.position.set(x, y, z); INT.add(l); });

    /* ---- crew quarters (Node 2, port): crew ID card on the sleep-station door */
    {
      const camPos = V(12.94, 3.3, 0.12);
      const hit = hitWall(camPos, V(0, 1, 0)) || { p: V(12.94, 4.12, 0.12), n: V(0, -1, 0) };
      const photo = new Image(); photo.src = "assets/profile.jpg";
      const t = canvasTex(1024, 1400, () => {});
      const draw = (g, w, h) => {
        g.fillStyle = "#f4f2ec"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#0b3d91"; g.fillRect(0, 0, w, 190);
        g.fillStyle = "#fff"; g.font = FONT(700, 64, "Barlow Condensed"); g.fillText("PH-1 · CREW", 60, 120);
        g.font = FONT(600, 34, "Barlow Condensed"); g.textAlign = "right"; g.fillText("EXPEDITION 2026", w - 60, 120); g.textAlign = "left";
        if (photo.complete && photo.naturalWidth) { g.save(); rr(g, 60, 250, 420, 525, 18); g.clip(); g.drawImage(photo, 0, 0, 640, 800, 60, 250, 420, 525); g.restore(); }
        g.fillStyle = "#101418"; g.font = FONT(700, 74, "Barlow Condensed"); g.fillText("PANTH", 530, 330); g.fillText("HAVELIWALA", 530, 410);
        g.fillStyle = "#c2410c"; g.font = FONT(700, 34, "Barlow Condensed"); g.fillText("MISSION SPECIALIST", 530, 480);
        g.font = FONT(500, 30); [["Role", "AI & full-stack engineer"], ["Home", "Valsad, India"], ["Base", "NMIMS Shirpur"], ["Since", "2024"]].forEach(([k, v], i) => { g.fillStyle = "#7a808a"; g.fillText(k, 530, 560 + i * 60); g.fillStyle = "#101418"; g.fillText(v, 650, 560 + i * 60); });
        g.fillStyle = "#101418"; g.font = FONT(700, 40, "Barlow Condensed"); g.fillText("TRAINING", 60, 870);
        g.fillStyle = "#3a3f47"; g.font = FONT(500, 32); let y = 925;
        ["B.Tech Computer Engineering, 2024–2028", "Batch rank #1 · semesters 3 and 4", "CGPA 8.75 / 10"].forEach((s) => { g.fillText("—  " + s, 60, y); y += 52; });
        g.fillStyle = "#101418"; g.font = FONT(700, 40, "Barlow Condensed"); g.fillText("SPECIALTIES", 60, 1160);
        g.fillStyle = "#3a3f47"; g.font = FONT(500, 32); wrap(g, "Media forensics · applied cryptography · full-stack products", 60, 1215, w - 120, 46, 2);
        g.fillStyle = "#0b3d91"; g.fillRect(0, h - 30, w, 30);
      };
      t.userData.redraw(draw); photo.onload = () => t.userData.redraw(draw); document.fonts && document.fonts.ready.then(() => t.userData.redraw(draw));
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.575), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }));
      mountOn(card, hit, UZ, 0.012, V(-0.25, 0, 0.05));
      I.crew = card.getWorldPosition(V()); I.crewCam = camPos; I.crewLook = hit.p.clone();
    }

    /* ---- experiment racks: a laptop on each real EXPRESS rack shows one project */
    const featured = ["veritas", "nyayavault", "startin", "guardian", "space-scope", "roomfix"].map((id) => D.projects.find((p) => p.id === id)).filter(Boolean);
    const RACKS = [["EXPRESS_Racks_ATLAS_2_Base", "z"], ["EXPRESS_Racks_ATLAS_1_Base", "z"], ["EXPRESS_Racks_ATLAS_7_Base", "y"], ["EXPRESS_Racks_ATLAS_6_Base", "z"], ["EXPRESS_Racks_ATLAS_11B_Base", "y"], ["EXPRESS_Racks_ATLAS_Galley_Base", "y"]];
    I.racks = [];
    featured.forEach((p, k) => {
      const [name, face] = RACKS[k];
      const o = m.getObjectByName(name); const c = o ? bboxOf(o).getCenter(V()) : V(8 - k, 4.6, 0);
      const axisY = k === 5 ? 3.38 : 3.43, axisZ = k === 5 ? 0 : -0.2;
      const dir = face === "z" ? V(0, 0, 1) : V(0, 1, 0);
      const up = face === "z" ? UY : UZ;
      const camPos = face === "z" ? V(c.x + 0.12, axisY, axisZ - 0.25) : V(c.x + 0.12, axisY - 0.55, axisZ + 0.05);
      const hit = hitWall(face === "z" ? V(c.x, c.y, axisZ) : V(c.x, axisY, c.z), dir) || { p: c.clone(), n: dir.clone().negate() };
      const st = canvasTex(1280, 800, (cc, w, h) => drawRackScreen(cc, w, h, p, k, 0));
      const lap = laptop(st, 1.25);
      mountOn(lap, hit, up, 0.17, up.clone().multiplyScalar(0.18));
      I.racks.push({ p, k, screen: lap.userData.screen.getWorldPosition(V()), tex: st, camPos, up, look: lap.userData.screen.getWorldPosition(V()) });
    });

    /* ---- Node 1 patch wall: my 8 patches beside the real expedition patches */
    {
      const PATCHES = [
        { t: "RANK #1", s: "SEMESTER 3", n: "9.41", c: "#f59e0b" }, { t: "RANK #1", s: "SEMESTER 4", n: "9.24", c: "#f97316" },
        { t: "CGPA", s: "OVERALL", n: "8.75", c: "#38bdf8" }, { t: "HACKATHONS", s: "COMPETED", n: "15+", c: "#a78bfa" },
        { t: "HACKATHONS", s: "WON", n: "3", c: "#facc15" }, { t: "TOP 3", s: "INTER-COLLEGE", n: "III", c: "#34d399" },
        { t: "NPTEL", s: "DSA · 2025", n: "IIT", c: "#f472b6" }, { t: "HACKERRANK", s: "PYTHON · C++", n: "5★", c: "#22d3ee" },
      ];
      const camPos = V(0.55, 3.15, 0.05);
      const base = hitWall(V(0.95, 3.38, 0.05), V(0, 1, 0)) || { p: V(0.95, 4.42, 0.05), n: V(0, -1, 0) };
      const grp = new THREE.Group();
      PATCHES.forEach((pa, i) => {
        const t = canvasTex(512, 512, (c, w) => {
          const r = w / 2; c.clearRect(0, 0, w, w);
          c.fillStyle = pa.c; c.beginPath(); c.arc(r, r, r - 4, 0, 7); c.fill();
          c.fillStyle = "#0b1020"; c.beginPath(); c.arc(r, r, r - 38, 0, 7); c.fill();
          c.strokeStyle = "rgba(255,255,255,0.55)"; c.setLineDash([10, 8]); c.lineWidth = 4; c.beginPath(); c.arc(r, r, r - 22, 0, 7); c.stroke(); c.setLineDash([]);
          c.strokeStyle = pa.c; c.lineWidth = 6; c.beginPath(); c.ellipse(r, r + 10, r - 80, 60, -0.35, 0, 7); c.stroke();
          c.fillStyle = "#fff"; c.textAlign = "center"; c.font = FONT(800, pa.n.length > 3 ? 120 : 150, "Barlow Condensed"); c.fillText(pa.n, r, r + 50);
          c.font = FONT(700, 44, "Barlow Condensed"); c.fillStyle = pa.c; c.fillText(pa.t, r, r - 95);
          c.font = FONT(600, 34, "Barlow Condensed"); c.fillStyle = "#e5e7eb"; c.fillText(pa.s, r, r + 130);
        });
        const mm = new THREE.Mesh(new THREE.CircleGeometry(0.105, 48), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.95, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.08 }));
        mm.position.set((i % 4) * 0.25 - 0.375, Math.floor(i / 4) * -0.26 + 0.13, 0); mm.rotation.z = (Math.random() - 0.5) * 0.25; grp.add(mm);
      });
      mountOn(grp, base, UZ, 0.008);
      I.patches = grp.getWorldPosition(V()); I.patchCam = camPos;
    }

    /* ---- PMM stowage: cargo bags with project tags */
    {
      const archive = D.projects.filter((p) => !featured.includes(p));
      const bagTex = canvasTex(256, 256, (c, w) => { c.fillStyle = "#e9e4d6"; c.fillRect(0, 0, w, w); c.strokeStyle = "rgba(0,0,0,0.06)"; for (let i = 0; i < w; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.strokeStyle = "rgba(0,0,0,0.25)"; c.setLineDash([6, 5]); c.strokeRect(10, 10, w - 20, w - 20); });
      const bagMat = new THREE.MeshStandardMaterial({ map: bagTex, roughness: 0.95 });
      I.bags = [];
      archive.forEach((p, k) => {
        const g = new THREE.Group();
        const sz = [0.5 + (k % 2) * 0.12, 0.42, 0.3];
        const geo = new THREE.BoxGeometry(...sz, 4, 4, 4); const pos = geo.attributes.position; const v = V();
        for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); v.addScaledVector(v.clone().normalize(), 0.025); pos.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, bagMat));
        const strap = new THREE.Mesh(new THREE.BoxGeometry(sz[0] + 0.06, 0.04, sz[2] + 0.06), new THREE.MeshStandardMaterial({ color: 0x24324a, roughness: 0.85 })); g.add(strap);
        const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.17), new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(600, 340, (c, w, h) => { c.fillStyle = "#fffef8"; c.fillRect(0, 0, w, h); c.fillStyle = "#111"; c.fillRect(0, 0, w, 6); c.font = FONT(600, 26, "Barlow Condensed"); c.fillStyle = "#555"; c.fillText("CTB · PH-1 STOWAGE", 24, 46); c.fillStyle = "#111"; c.font = FONT(700, 56, "Barlow Condensed"); wrap(c, p.name.toUpperCase(), 24, 112, w - 48, 56, 2); c.fillStyle = "#444"; c.font = FONT(500, 26); c.fillText(String(p.kicker).slice(0, 34), 24, 290); c.fillText(p.year, w - 90, 290); }) }));
        tag.position.set(0, 0, sz[2] / 2 + 0.03); g.add(tag);
        const side = k % 2 ? -1 : 1;
        g.position.set(3.6 + k * 0.62, 9.81 + side * 0.8, -0.35 + (k % 3) * 0.32);
        g.up.copy(UZ); g.lookAt(V(2.6, 9.81, 0));
        g.rotateZ((Math.random() - 0.5) * 0.3);
        g.userData.float = { base: g.position.clone(), ph: Math.random() * 6 };
        INT.add(g); I.bags.push({ g, p });
      });
      I.stow = V(4.8, 9.81, 0); I.stowCam = V(2.3, 9.81, 0.15);
    }

    /* ---- Cupola: robotics laptops (skills), comms laptop, Earth below */
    {
      const glassC = glass ? bboxOf(glass).getCenter(V()) : V(0, 9.8, -2.86);
      const cupC = V(glassC.x, glassC.y, -2.25);
      const rws = m.getObjectByName("Cupola_Int_MSS_AV");
      const rwsC = rws ? bboxOf(rws).getCenter(V()) : cupC.clone().add(V(0.6, 0, 0.1));
      I.robotics = rwsC.clone();
      const away = cupC.clone().sub(rwsC); away.z = 0; away.normalize();
      I.roboCam = cupC.clone().addScaledVector(away, 0.35).add(V(0, 0, 0.5));
      const commsTex = canvasTex(800, 500, (g, w, h) => { g.fillStyle = "#0b1220"; g.fillRect(0, 0, w, h); g.fillStyle = "#fbbf24"; g.font = FONT(700, 40, "Barlow Condensed"); g.fillText("OPEN CHANNEL · S-BAND", 40, 80); g.fillStyle = "#e5e7eb"; g.font = FONT(500, 30); g.fillText("To: Panth Haveliwala", 40, 160); g.fillText(D.profile.email, 40, 210); g.fillStyle = "#22c55e"; g.font = FONT(600, 28, "Barlow Condensed"); g.fillText("● LINK READY", 40, 300); g.strokeStyle = "#334155"; g.strokeRect(40, 340, w - 80, 110); g.fillStyle = "#64748b"; g.font = FONT(500, 26); g.fillText("Type your message…", 60, 405); });
      const cdir = V(-1, 0.15, 0).normalize();
      const chit = hitWall(cupC, cdir, 2) || { p: cupC.clone().addScaledVector(cdir, 0.95), n: cdir.clone().negate() };
      const clap = laptop(commsTex, 1.1); mountOn(clap, chit, UZ, 0.2, V(0, 0, 0.15));
      I.comms = clap.userData.screen.getWorldPosition(V()); I.commsCam = cupC.clone().add(V(0.5, -0.05, 0.25));
      I.cupola = glassC.clone(); I.cupCam = cupC.clone().add(V(0.05, 0, 0.02));
      const E2 = earth(INT, 3000, glassC.clone().add(V(0, 0, -3000 - 900)), INT_SUN);
      aimEarth(E2, V(0.1, -0.05, 1));
      I.valsad = valsadWorld(E2);
      const sunI = sprite(0xfff3e0, 600); sunI.position.copy(glassC).add(V(2600, 1400, -2500)); INT.add(sunI);
      const sunLi = new THREE.DirectionalLight(0xfff2e0, 1.4); sunLi.position.copy(INT_SUN.clone().multiplyScalar(50)); INT.add(sunLi);
    }
    progress.int = 1;
  })().catch((e) => { console.warn("interior model failed", e); progress.int = 1; });

  /* ================================================================ CAMERA PATH */
  const K = [];
  const sides = opts.sides || [];
  function frame(k) { // push the subject to the side away from its panel (or up, above the mobile sheet)
    const e = K[k]; if (!e) return;
    const s = sides[k] || "left", mob = innerWidth < 761, up = e.up || UY;
    const fwd = e.look.clone().sub(e.pos), dist = fwd.length(); fwd.normalize();
    const right = fwd.clone().cross(up).normalize(), upv = right.clone().cross(fwd).normalize();
    const fov = THREE.MathUtils.degToRad(e.scene === "int" ? 64 : 46), hh = Math.tan(fov / 2) * dist, hw = hh * (innerWidth / innerHeight);
    const fx = mob ? 0 : s === "left" ? 0.34 : s === "right" ? -0.34 : 0;
    const fy = mob ? 0.4 : s === "center" ? 0.28 : 0;
    e.look = e.look.clone().addScaledVector(right, -fx * hw).addScaledVector(upv, -fy * hh);
  }
  const P = (scene, pos, look, pin, up = UY, via = null) => ({ scene, pos: pos.clone(), look: look.clone(), pin: pin && pin.clone(), up, via });
  function buildPath() {
    const c = A.center || V(), span = A.box ? A.box.max.x - A.box.min.x : 130;
    K.length = 0;
    // exterior
    const far = innerWidth < innerHeight ? 2.7 : 1; // portrait screens need more distance to fit the station
    K.push(P("ext", c.clone().add(V(-span * 0.12, span * 0.16, span * 1.05).multiplyScalar(far)), c.clone().add(V(0, -span * 0.05, 0)), c));
    K.push(P("ext", A.wing.clone().add(V(-span * 0.08, span * 0.12, span * 0.26)), A.wing.clone(), A.wing, UY, c.clone().add(V(span * 0.45, span * 0.25, span * 0.7))));
    K.push(P("ext", A.antenna.clone().add(V(9, 6, 14)), A.antenna.clone(), A.antenna, UY, c.clone().add(V(span * 0.2, span * 0.3, span * 0.4))));
    K.push(P("ext", A.dock.clone().add(V(7, 4, 16)), A.dock.clone(), A.dock, UY, A.dock.clone().add(V(24, 14, 18))));
    // interior (crew → six racks → patches → PMM → cupola)
    K.push(P("int", I.crewCam || V(12.9, 3.3, 0.1), I.crewLook || V(12.9, 4.4, 0.1), I.crew, UZ));
    (I.racks || Array.from({ length: 6 }, (_, k) => ({ camPos: V(9 - k, 3.43, -0.2), look: V(9 - k, 3.43, 1.2), screen: V(9 - k, 3.43, 1.2), up: UY }))).forEach((r, k) => K.push(P("int", r.camPos, r.look, r.screen, r.up, k === 5 ? V(1.2, 3.38, 0.05) : null)));
    K.push(P("int", I.patchCam || V(0.5, 3.2, 0), I.patches || V(0.9, 4.4, 0), I.patches, UZ));
    K.push(P("int", I.stowCam || V(2.3, 9.81, 0.1), I.stow || V(5, 9.81, 0), I.stow, UZ, V(0.05, 9.0, 0.1)));
    K.push(P("int", I.roboCam || V(0, 9.81, -2), I.robotics || V(1, 9.81, -2.2), I.robotics, UZ, V(0.2, 9.81, -0.6)));
    K.push(P("int", I.cupCam || V(0, 9.81, -1.9), (I.cupola || V(0, 9.8, -2.86)).clone().add(V(0.25, 0.15, -1.5)), I.valsad, V(1, 0, 0)));
    K.push(P("int", I.commsCam || V(0.4, 9.81, -2), I.comms || V(-1, 9.81, -2.1), I.comms, UZ));
    K.push(P("ext", c.clone().add(V(-span * 0.85, span * 0.32, span * 1.15)), c.clone().add(V(0, -span * 0.18, 0)), c, UY, c.clone().add(V(-span * 0.15, -span * 0.05, span * 0.35))));
    // scene changes
    K[3].exit = A.dock.clone().add(V(0, 0, 0.6)); K[3].exitLook = A.dock.clone().add(V(0, 0, -12));
    K[4].entry = V(16.2, 3.38, 0.0); K[4].entryLook = V(10, 3.4, 0); K[4].entryUp = UZ;
    const glassC = I.cupola || V(0, 9.8, -2.86);
    K[15].exit = glassC.clone().add(V(0, 0, -0.8)); K[15].exitLook = glassC.clone().add(V(0, 0, -20));
    K[16].entry = (A.cupola || c).clone().add(V(0, -4, 2)); K[16].entryLook = (A.cupola || c).clone().add(V(0, -60, 10));
    for (let k = 0; k < K.length; k++) frame(k);
  }

  /* ================================================================ composer */
  let composer = null, bloom = null;
  if (!mobile && opts.bloom !== false) {
    try {
      composer = new EffectComposer(renderer);
      composer.renderPass = new RenderPass(EXT, camera); composer.addPass(composer.renderPass);
      bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.55, 0.86); composer.addPass(bloom);
      composer.addPass(new OutputPass());
    } catch (e) { composer = null; }
  }
  addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer && composer.setSize(innerWidth, innerHeight); });

  /* ================================================================ tick */
  const pos = V(), look = V(), lookS = V(), upT = V(), upS = V(0, 1, 0), tmp = V(), drift = V();
  let T = 0, t = 0, last = performance.now(), built = false, scene = EXT;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => { mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const N = 17;
  const bez = (a, v, b, f, out) => { if (!v) return out.copy(a).lerp(b, f); const u = 1 - f; return out.set(u * u * a.x + 2 * u * f * v.x + f * f * b.x, u * u * a.y + 2 * u * f * v.y + f * f * b.y, u * u * a.z + 2 * u * f * v.z + f * f * b.z); };
  const api = { scenes: { EXT, INT }, camera, N, flash: 0, progress, anchors: (i) => K[i] && K[i].pin, sceneOf: (i) => K[i] && K[i].scene, ready: extReady, interiorReady: intReady };
  const rebuild = () => { buildPath(); built = true; };
  extReady.then(() => { rebuild(); lookS.copy(K[0].look); });
  intReady.then(rebuild);
  let rbT; addEventListener("resize", () => { clearTimeout(rbT); rbT = setTimeout(() => built && buildPath(), 200); });

  function tick() {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt; uTime.value = t;
    if (built) {
      const tgt = Math.min(N - 1, Math.max(0, state.T));
      const ti = Math.min(N - 2, Math.floor(tgt)), eased = ti + smoother(tgt - ti);
      T += (eased - T) * (1 - Math.exp(-dt * 2.2));
      if (state.snap) T = eased;
      const i0 = Math.min(N - 2, Math.floor(T)), f = T - i0, a = K[i0], b = K[i0 + 1];
      let flash = 0;
      if (a.scene === b.scene) {
        bez(a.pos, b.via, b.pos, f, pos);
        look.copy(a.look).lerp(b.look, sstep(0.15, 0.85, f));
        upT.copy(a.up).lerp(b.up, sstep(0.2, 0.8, f));
        scene = a.scene === "ext" ? EXT : INT;
      } else {
        if (f < 0.5) { const k = smoother(f * 2); pos.copy(a.pos).lerp(a.exit, k); look.copy(a.look).lerp(a.exitLook, k); upT.copy(a.up); scene = a.scene === "ext" ? EXT : INT; flash = sstep(0.25, 0.5, f); }
        else { const k = smoother((f - 0.5) * 2); pos.copy(b.entry).lerp(b.pos, k); look.copy(b.entryLook).lerp(b.look, k); upT.copy(b.entryUp || b.up).lerp(b.up, k); scene = b.scene === "ext" ? EXT : INT; flash = 1 - sstep(0.5, 0.75, f); }
      }
      api.flash = flash;
      const mk = 1 - Math.exp(-dt * 2); mouse.x += (mouse.tx - mouse.x) * mk; mouse.y += (mouse.ty - mouse.y) * mk;
      const amp = scene === EXT ? 1.0 : 0.035;
      drift.set(Math.sin(t * 0.21) * amp, Math.sin(t * 0.17 + 1) * amp * 0.6, Math.cos(t * 0.13) * amp * 0.5);
      camera.position.copy(pos).add(drift);
      if (state.introP < 1 && scene === EXT && A.center) { const e = 1 - smoother(state.introP); camera.position.add(tmp.copy(K[0].pos).sub(A.center).multiplyScalar(e * 1.4)); }
      const rate = a.scene === b.scene ? 3.0 : 12;
      lookS.lerp(look, 1 - Math.exp(-dt * rate)); upS.lerp(upT.lengthSq() ? upT.clone().normalize() : UY, 1 - Math.exp(-dt * rate)).normalize();
      if (state.snap) { lookS.copy(look); upS.copy(upT).normalize(); }
      camera.up.copy(upS);
      camera.lookAt(lookS);
      camera.rotateY(-mouse.x * (scene === INT ? 0.03 : 0.015)); camera.rotateX(-mouse.y * (scene === INT ? 0.02 : 0.01));
      camera.fov = scene === INT ? 64 : 46; camera.updateProjectionMatrix();
      if (I.bags) I.bags.forEach(({ g }) => { const u = g.userData.float; g.position.z = u.base.z + Math.sin(t * 0.5 + u.ph) * 0.02; g.rotateY(Math.sin(t * 0.3 + u.ph) * 0.0004); });
      if (scene === INT && I.racks) { const r = I.racks[Math.round(Math.min(5, Math.max(0, T - 5)))]; if (r && Math.abs(T - 5 - r.k) < 1.2 && Math.floor(t * 10) % 2 === 0) r.tex.userData.redraw((c, w, h) => drawRackScreen(c, w, h, r.p, r.k, t)); }
      E1.mesh.rotateY(dt * 0.001);
    }
    if (bloom) bloom.strength = scene === INT ? 0.12 : 0.45;
    if (composer) { composer.renderPass.scene = scene; composer.render(); } else renderer.render(scene, camera);
    api.scene = scene === EXT ? "ext" : "int"; api.T = T;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  api.project = (v, out = { x: 0, y: 0, z: 0 }) => { tmp.copy(v).project(camera); out.x = (tmp.x * 0.5 + 0.5) * innerWidth; out.y = (-tmp.y * 0.5 + 0.5) * innerHeight; out.z = tmp.z; return out; };
  return api;
}
