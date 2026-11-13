# Panth Haveliwala · Portfolio

**PH-1 Station**: a scroll-driven 3D tour of the International Space Station. The camera flies past the outside of the station, docks at the forward port and then moves through the real modules. Each part of the station shows one part of my profile: the solar array holds my stats, the lab racks hold my projects, the patch wall holds my achievements and the cupola holds my contact form.

- **GitHub:** https://github.com/PANTH2517
- **Stack:** plain HTML, CSS and JavaScript (ES modules), three.js, GSAP and Lenis. There's no build step and no framework.
- **Content:** every text, project, achievement and link lives in [`data.js`](data.js).

---

## Contents

1. [The tour (current version)](#the-tour-current-version)
2. [Project structure](#project-structure)
3. [Running locally](#running-locally)
4. [Editing content](#editing-content)
5. [Deploying](#deploying)
6. [How it works](#how-it-works)
7. [Performance and accessibility](#performance-and-accessibility)
8. [Version history](#version-history)
9. [Credits and licences](#credits-and-licences)

---

## The tour (current version)

Scrolling moves the camera along one continuous path with 17 stops. At each stop a panel pins to the screen, and an amber leader line connects it to the real part of the station it describes.

| # | Where the camera is | Real ISS component | What it shows |
|---|---|---|---|
| 0 | Approach | Whole station over Earth | Hero: name, roles, tagline |
| 1 | Starboard truss | S4 Solar Array Wing 1A | About me and count-up stats (batch rank #1, CGPA 8.75, 15+ hackathons / 3 wins, 11 projects) |
| 2 | Zenith side | SGANT Ku-band antenna | Live GitHub telemetry: contribution heat map and recently pushed repos |
| 3 | Forward port | IDA-2 docking adapter | "Current orbit": what I'm working on now |
| | *docking flash: the camera passes into the station* | | |
| 4 | Node 2 · Harmony | Crew quarters wall | Crew card with photo, quick facts and education |
| 5–10 | Destiny lab | EXPRESS Racks 2, 1, 7, 6, 11B and Galley | Six featured projects, each on a laptop mounted to a real rack. Click one to open the full case file |
| 11 | Node 1 · Unity | Port wall | Mission patches: achievements and record |
| 12 | PMM · Leonardo | Cargo transfer bags | Archive of every other project, as tagged stowage bags |
| 13 | Cupola | Robotics workstation (MSS) | Services and skills |
| 14 | Cupola | Seven-window cupola, Earth below | "That's home down there" |
| 15 | Cupola | Comms laptop | Contact form |
| 16 | Undock | Exterior, pulling away | Sign-off |

Other features:

- Top navigation links (Station, Crew, Lab, Patches, Cargo, Cupola, Comms) and a progress rail fly the camera straight to a module. Deep links such as `/#lab` and `/#comms` also work.
- A readout shows the current module and stop. An orbit indicator shows tour progress.
- **Case files:** a full-screen overlay for each featured project, with the problem, how it was built, the stack and links.
- The contact form sends through FormSubmit. If that fails, it falls back to a `mailto:` link.
- **Mobile:** panels become a bottom sheet, and the camera shifts so the hardware stays visible above it. Phones get a lighter station model.

---

## Project structure

```
index.html              page markup: loader, HUD, 17 tour stops, case-file overlay
data.js                 ALL portfolio content (window.PORTFOLIO)
css/
  station.css           all styles (tokens, HUD, pins, loader, responsive)
js/
  main.js               content rendering, scroll → T mapping, pinned panels,
                        leader lines, loader, case files, contact form, GitHub telemetry
  station.js            the 3D scene: exterior + interior, camera path,
                        lighting, mounted devices (laptops, patches, bags, crew card)
assets/
  profile.jpg           profile photo (profile-original.jpg = uncropped source)
  favicon.svg
  models/
    iss-ext.glb         ISS exterior, desktop (≈11 MB, 1.37 M triangles)
    iss-ext-lite.glb    ISS exterior, phones (≈7 MB, 0.64 M triangles)
    interior.glb        ISS interior: Node 1, Node 2, Destiny, PMM, Cupola (≈7 MB)
  tex/                  Earth day / night / cloud textures
  vendor/               three.js r160 + loaders/post-processing, Draco decoder,
                        GSAP, Lenis (all vendored, so no CDN is needed)
```

---

## Running locally

The site uses ES modules and loads `.glb` files, so open it through a local web server. Opening `index.html` directly from disk (`file://`) won't work.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Any static server works, for example `npx serve .`.

Debug flag: `?snap` turns off camera easing so each stop renders instantly. It's useful for screenshots.

---

## Editing content

Everything shown on the site comes from **`data.js`**. Edit it, save, refresh the page. There's nothing to build.

| Key | Used for |
|---|---|
| `profile` | Name, roles, tagline, photo, email, GitHub and LinkedIn |
| `stats` | Count-up numbers on the solar array |
| `statement`, `facts` | About text and fact rows |
| `now`, `nowUpdated` | "Current orbit" cards at the docking port. Update the date whenever you edit them |
| `education` | Crew quarters |
| `projects` | All projects. The first six featured ones go onto the lab racks (5–10). The rest go into cargo stowage |
| `achievements` | Mission patches on the Node 1 wall |
| `services`, `skills` | Robotics workstation |

To add a project or achievement, copy an existing entry and change the fields.

---

## Deploying

The site is fully static. Upload the whole folder to any static host, such as Vercel, Netlify or GitHub Pages. The host must serve `.glb` and `.wasm` files with their normal MIME types; all three of those hosts already do.

**When updating from an older version, upload these:**

- `index.html`, `data.js`, `README.md`
- the whole `css/` and `js/` folders
- `assets/models/`, `assets/tex/`, `assets/vendor/` (including `vendor/draco/`)
- `assets/profile.jpg` and `assets/favicon.svg`

**Files from older versions that should be deleted:** `styles.css`, `script.js`, `js/app.js`, `js/cosmos.js`, `js/scene.js`, `js/journey.js`, `js/extras.js`, `js/portrait.js`, `assets/portrait-cutout.png`, `assets/avatar.jpg`, `assets/models/issB.glb`, `assets/vendor/ScrollTrigger.min.js`.

---

## How it works

### Scroll → camera

- Each tour stop is a tall `<section>` with an invisible marker. `main.js` measures where each marker sits and turns the scroll position into a continuous value **T** (0 → 16).
- Lenis smooths the scrolling.
- `station.js` eases toward T every frame. It interpolates the camera position, look target and "up" vector between keyframes. Some segments use Bézier curves so the camera swings around hardware instead of passing through it.

### Two scenes

- The exterior and interior are separate three.js scenes.
- Between stop 3 and stop 4 (docking) and between 15 and 16 (undocking), a white flash hides the switch.
- The interior model starts loading in the background after the exterior is ready. Until it arrives, the path uses placeholder positions.

### Framing

- `frame()` moves the look target so the hardware sits on the side of the screen opposite the panel. On phones the hardware sits above the bottom sheet.
- Every frame, the page projects the 3D anchor point to screen coordinates and redraws the SVG leader line from the panel's edge to it.

### Devices on the station

These are all real meshes placed on real surfaces. The page fires a ray at the module wall to find each mounting point:

- six laptops on the EXPRESS rack bases, with screens drawn live from `data.js` onto a canvas;
- eight patches on the Node 1 wall;
- five cargo transfer bags with tags in the PMM;
- a crew card in Node 2;
- a comms laptop in the cupola.

### Lighting

- The station keeps the original physically based (PBR) materials from the NASA models.
- An environment map is generated from a gradient shader, plus one directional sun light and some light reflected from Earth.
- ACES tone mapping, plus a light bloom pass whose strength is tuned separately for the exterior and the interior.

### Models

The source models come from NASA 3D Resources (see [Credits](#credits-and-licences)). They were cut down for the web with `@gltf-transform`:

- dedupe, prune and weld;
- simplify only the meshes that carry fine detail;
- convert textures to WebP at 768 px;
- compress geometry with Draco.

Result: the 96 MB / 2.7 M-triangle exterior became 11 MB (desktop) and 7 MB (phones). The interior arrived as a 301 MB FBX, was converted to glTF in the browser with three.js `FBXLoader` and `GLTFExporter`, and was then compressed the same way.

### GitHub telemetry

The heat map comes from the public `github-contributions-api.jogruber.de` API. The recent repos come from the GitHub REST API. Both are cached in `sessionStorage`, and the panel hides itself quietly if either API fails.

---

## Performance and accessibility

- **First view:** about 11 MB on desktop and about 7 MB on phones. The interior (about 7 MB) streams in while you read the exterior stops.
- A cinematic loader shows the real download and parse progress. It never claims 100% until the models are actually built.
- Pixel ratio is capped, and bloom is lighter on phones.
- `prefers-reduced-motion` turns off smooth scrolling and shortens the loader and overlay animations to near-instant.
- Panels are real DOM text, so screen readers and search engines can read them. Panels that are out of view are made `inert`, so they can't be reached by keyboard.
- The nav, rail, case files and form all work by keyboard. The case-file overlay closes with Esc and returns focus to where you were.

---

## Version history

Every version was built and tested locally first, then uploaded by hand.

### v0 · Cockpit HUD (June 2026)

The original site, and the first commits in this repository.

- A sci-fi cockpit "heads-up display" layout with an interactive terminal, sound effects and a boot screen with an animated logo.
- Pages for biography, projects (7 cards with launch links) and achievements.
- Added later: GitHub stats cards, a contribution "snake", a profile-views counter, scanline overlays, and responsive breakpoints at 1024, 768 and 480 px.

### v1 · Content refresh and redesign (Nov 2026)

`index.html` · `styles.css` · `script.js` · `data.js`

- Updated all projects, achievements and the profile photo.
- Moved all content into a single `data.js` file so the site is easy to edit.
- A cleaner single-page layout replaced the cockpit HUD.
- Uploaded as the commit *"Redesign portfolio and update projects and achievements"*.

### v2 · Universe

`js/scene.js` · `js/main.js` · `js/portrait.js`

- The first WebGL version, written in three.js.
- A fixed full-screen universe behind the page: a spiral particle galaxy that rotates in a shader, a twinkling starfield, warp streaks that stretch with scroll speed, and a procedural gas-giant planet with an atmosphere glow whose colour changes per section.
- An interactive portrait made from a cut-out of the profile photo.

### v3 · Mission control

Added `js/extras.js`.

- An altitude readout that rises through real space zones as you scroll.
- Hold SPACE (or tap a button) to warp.
- Ambient sound generated with Web Audio, with no audio files.
- A ⌘K command palette.
- First live GitHub telemetry: contribution heat map and recent repos.
- A "Current orbit" section, a "Payload" section, and hover previews on the project archive.

### v4 · The Journey

`js/journey.js`. Inspired by 3D scroll-path portfolios.

- One continuous 3D camera path through four chapters:
  1. **Constellations:** star clusters that link themselves together.
  2. **Wormhole:** a twisting tunnel where every achievement is a portal ring.
  3. **Solar system:** a gravity-assist slingshot around one planet per project.
  4. **Event horizon:** a spiral descent into a black hole's accretion disk.

### v5 · The Distance

`js/cosmos.js`

- A scroll-driven flight outward from Earth, past **18 real places** at their real distances:

  Earth → Moon → Sun → Mars → asteroid belt → Jupiter, Io, Europa, Ganymede, Callisto → Saturn → Voyager 1 → Oort Cloud → Alpha Centauri → Orion Nebula → Sagittarius A* → Andromeda → the cosmic web.

- A live "distance from Earth" readout counts up from kilometres to light-years. Each stop shows a real science fact next to a piece of my profile.
- Earth uses NASA Blue Marble and Black Marble imagery.
- Lenis smooth scrolling, with a vignette and film-grain overlay.
- Hackathon wording corrected: 15+ hackathons competed, 3 won. "Inter-college top 3" is listed separately and isn't counted as a win.

### v6 · The Distance, cinematic

- Slower, smoother camera motion, with easing between stops instead of a fast, jumpy scroll.
- Post-processing with an Unreal bloom pass, so the Sun, stars and nebulae glow.
- Better framing: the 3D object stays on one side and the content card on the other.

### v7 · Launch sequence

- A completely new loader: launch countdown, ignition flash, telemetry log and progress readouts.
- Same journey from Earth to the cosmic web as v6. This version changes the first impression.

### v8 · Signal & Noise (experimental, not used)

`css/style.css` · `js/main.js`

- A from-scratch, dark, editorial design that dropped the space theme.
- Six featured projects shown as data "exhibits" drawn on canvas with a thermal colour ramp.
- Rejected because it lost the interactive space concept. The project went back to v7 and moved to the ISS idea.

### v9 · PH-1 Station (first ISS version)

`css/station.css` · `js/station.js` · `js/main.js`

- The new concept: a spaceship tour. Scrolling moves the camera through the parts of a space station, and my details sit on the station's own hardware and devices.
- Panels pin to the screen, with leader lines to the 3D parts. The page is split into modules: Crew, Lab, Patches, Cargo, Cupola and Comms.
- Used a single generic ISS model (`issB.glb`) plus interior props built in code.
- Feedback: it still looked "AI-made", not real enough.

### v10 · PH-1 Station, real NASA hardware (current)

- Switched to **NASA's own ISS models** for both the outside and the inside, with their original materials and textures.
- **Every stop is anchored to a named, real component:**
  - S4 solar array wing 1A, SGANT Ku-band antenna and IDA-2 docking adapter on the outside;
  - Node 2 Harmony, Destiny's EXPRESS racks, Node 1 Unity's wall, the PMM, and the cupola's robotics workstation and windows on the inside.
- **Real interior:** Destiny, Unity, Harmony, Leonardo (the PMM) and the Cupola. The shutters are opened so Earth shows through all seven windows.
- Laptops in a ThinkPad style are mounted on the real rack bases. Patches, cargo bags and the crew card are fixed to the real walls.
- A separate lighter model for phones. Models load in stages, and the loader shows real progress.
- Lighting reworked: sun from the front-right, a darker environment, physically based materials, and tuned bloom.
- Removed all v2–v9 leftovers (old scripts, cut-out portrait, `issB.glb`, ScrollTrigger).

---

## Credits and licences

- **ISS 3D models:** NASA 3D Resources ([github.com/nasa/NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources)): "International Space Station (ISS)" exterior and "ISS (E) Internal". Used under NASA's media usage guidelines; NASA doesn't endorse this site.
- **Earth textures:** NASA Blue Marble and Black Marble (public domain).
- **three.js** r160 (MIT), with GLTFLoader, DRACOLoader and the post-processing passes.
- **Draco** decoder (Apache-2.0).
- **GSAP** (GreenSock standard licence).
- **Lenis** (MIT).
- **Fonts:** Barlow and Barlow Condensed (SIL Open Font License, via Google Fonts).

Code and content © Panth Haveliwala. All rights reserved.
