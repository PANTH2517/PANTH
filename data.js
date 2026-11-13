/* ==========================================================================
   PORTFOLIO CONTENT
   --------------------------------------------------------------------------
   Everything shown on the site lives in this one file.
   To add a project / achievement / hackathon, copy an existing entry and
   edit it. No build step needed: save, commit, and Vercel redeploys.
   ========================================================================== */

window.PORTFOLIO = {
  profile: {
    name: "Panth Haveliwala",
    firstName: "Panth",
    roles: [
      "AI / ML Engineer",
      "Full-Stack Developer",
      "Security-minded Builder",
      "Hackathon Team Lead",
    ],
    /* rotating words after "I build …" in the hero */
    typed: ["AI systems.", "secure software.", "full-stack products.", "deepfake detectors.", "things that ship."],
    tagline:
      "I build AI systems and secure full-stack products, from deepfake forensics to tamper-proof evidence vaults, and I ship them to production.",
    location: "Valsad, Gujarat, India",
    university: "SVKM's NMIMS, MPSTME Shirpur",
    degree: "B.Tech Computer Engineering · 2024 – 2028",
    photo: "assets/profile.jpg",
    email: "panthhaveliwala@gmail.com",
    github: "https://github.com/PANTH2517",
    githubHandle: "PANTH2517",
    linkedin: "https://www.linkedin.com/in/panth-haveliwala-06811131a",
    linkedinHandle: "panth-haveliwala",
  },

  /* Count-up numbers in the hero strip */
  stats: [
    { value: 1, prefix: "#", suffix: "", label: "Batch rank · Sem 3 & Sem 4" },
    { value: 8.75, decimals: 2, suffix: "", label: "Overall CGPA / 10" },
    { value: 15, suffix: "+", label: "Hackathons competed · 3 won" },
    { value: 11, suffix: "", label: "Projects shipped" },
  ],

  /* Big scroll-reveal statement in the About section */
  statement:
    "I build AI that catches deepfakes, systems that can prove nobody tampered with them, and full-stack products that survive production. Batch rank #1 two semesters in a row. 15+ hackathons, usually as team lead, with 3 wins.",

  /* Small fact rows under the statement */
  facts: [
    { k: "Based in", v: "Valsad, Gujarat, India" },
    { k: "Studying", v: "B.Tech CE · NMIMS MPSTME Shirpur · 2024–28" },
    { k: "Focus", v: "Media forensics · applied crypto · full-stack" },
    { k: "Now", v: "Hardening NyayaVault's blockchain anchoring" },
  ],

  /* "Current orbit": what you're doing right now. Update `updated` when you edit this. */
  nowUpdated: "November 2026",
  now: [
    { title: "Hardening NyayaVault", body: "Anchoring evidence audit checkpoints to a 4-node Proof-of-Authority chain, so Police, Prosecution and Court can each verify the chain of custody.", link: { label: "NyayaVault", url: "https://nyayavault.vercel.app" } },
    { title: "Teaching Veritas to hear fakes", body: "Extending the deepfake engine from faces to voice clones and video frames with STFT spectrogram signals.", link: { label: "Veritas AI", url: "https://veritas-ai-ashen.vercel.app" } },
    { title: "Semester 5 at NMIMS", body: "Ranked #1 in the CE batch in Sem 3 and Sem 4. Going for three in a row." },
    { title: "Next hackathon", body: "15+ hackathons in. Always up for a 36-hour build with a sharp team." },
    { title: "Open to internships", body: "AI/ML, security engineering and full-stack roles, remote or on-site." },
  ],

  /* "What I'd build for you": proof = project ids that open their case files */
  services: [
    { title: "AI that survives the real world", body: "Models behind real APIs, calibrated and explainable: hybrid CNN + forensic-signal pipelines, edge inference with TF Lite, not just notebooks.", proof: ["veritas", "guardian"] },
    { title: "Systems you can audit", body: "Security-first backends: AES-256-GCM at rest, TOTP MFA, rotating JWTs, RBAC/CBAC and hash-chained, tamper-evident logs.", proof: ["nyayavault", "cloud-anomaly"] },
    { title: "Platforms people actually use", body: "Full-stack products from schema to deploy: role dashboards, lifecycles, notifications and mobile apps.", proof: ["startin", "playnear"] },
  ],

  /* ---------------------------------------------------------------------
     THE DISTANCE: real stops on the way out from Earth.
     km = approximate distance from Earth (used for the live distance readout).
     Facts are real-world approximations; edit freely.
     --------------------------------------------------------------------- */
  stops: [
    { id: "earth", name: "Earth", region: "HOME", km: 0, fact: "You are here: 20.6° N, 72.9° E, Valsad, India. Earth's radius is 6,371 km." },
    { id: "moon", name: "The Moon", region: "EARTH–MOON SYSTEM", km: 384400, fact: "384,400 km away. Its light reaches us in 1.28 seconds; Apollo 11 took about 3 days." },
    { id: "sun", name: "The Sun", region: "INNER SOLAR SYSTEM", km: 149.6e6, fact: "1 AU = 149.6 million km. The sunlight on your skin left the Sun 8 min 20 s ago." },
    { id: "mars", name: "Mars", region: "INNER SOLAR SYSTEM", km: 225e6, fact: "On average ~225 million km away. A radio command takes 3 to 22 minutes to arrive." },
    { id: "belt", name: "Asteroid Belt", region: "MAIN BELT", km: 4.2e8, fact: "Millions of rocks between Mars and Jupiter, yet mostly empty: probes cross it without dodging." },
    { id: "jupiter", name: "Jupiter", region: "OUTER SOLAR SYSTEM", km: 7.0e8, fact: "11× Earth's width with 95+ known moons. Galileo found the four largest in 1610." },
    { id: "io", name: "Io", region: "JUPITER SYSTEM", km: 7.01e8, fact: "The most volcanic world known: 400+ active volcanoes driven by Jupiter's tides." },
    { id: "europa", name: "Europa", region: "JUPITER SYSTEM", km: 7.02e8, fact: "Hides a salty ocean under ~15–25 km of ice, with more water than all of Earth's oceans." },
    { id: "ganymede", name: "Ganymede", region: "JUPITER SYSTEM", km: 7.03e8, fact: "The largest moon in the solar system, bigger than Mercury, with its own magnetic field." },
    { id: "callisto", name: "Callisto", region: "JUPITER SYSTEM", km: 7.04e8, fact: "The most heavily cratered surface known: a 4-billion-year record of impacts." },
    { id: "saturn", name: "Saturn", region: "OUTER SOLAR SYSTEM", km: 1.35e9, fact: "Its rings span ~280,000 km but are often only ~10 m to 1 km thick." },
    { id: "voyager", name: "Voyager 1", region: "INTERSTELLAR SPACE", km: 2.5e10, fact: "~25 billion km away, the farthest human-made object. Launched 1977 carrying the Golden Record." },
    { id: "oort", name: "Oort Cloud", region: "EDGE OF THE SUN'S REACH", km: 1.5e12, fact: "A shell of icy bodies from ~2,000 to 100,000 AU, the home of long-period comets." },
    { id: "alphacen", name: "Alpha Centauri", region: "NEAREST STARS", km: 4.134e13, fact: "4.37 light-years, the nearest star system. At Voyager's speed: ~75,000 years." },
    { id: "orion", name: "Orion Nebula", region: "ORION ARM", km: 1.2716e16, fact: "1,344 light-years. A stellar nursery you can see with the naked eye in Orion's sword." },
    { id: "sgra", name: "Sagittarius A*", region: "GALACTIC CENTRE", km: 2.5232e17, fact: "26,670 light-years. A 4.3-million-solar-mass black hole, first imaged in 2022." },
    { id: "andromeda", name: "Andromeda", region: "LOCAL GROUP", km: 2.4e19, fact: "2.5 million light-years. Approaching at ~110 km/s; the light you see left before humans existed." },
    { id: "web", name: "The Cosmic Web", region: "OBSERVABLE UNIVERSE", km: 4.4e23, fact: "The observable universe is ~46.5 billion light-years in radius; galaxies trace dark-matter filaments." },
  ],

  education: [
    {
      period: "2024 – 2028",
      title: "B.Tech in Computer Engineering",
      place: "SVKM's NMIMS · Mukesh Patel School of Technology Management & Engineering, Shirpur",
      points: [
        "Rank 1 in the CE batch in Semester 3 (GPA 9.41) and Semester 4 (GPA 9.24)",
        "Overall CGPA 8.75 / 10",
        "Coursework: DSA, Analysis of Algorithms, DBMS, Web Programming, Mobile App Development, Microprocessors",
      ],
    },
    {
      period: "2010 – 2024",
      title: "Schooling · Science & Mathematics",
      place: "Saraswati International School, Valsad",
      points: ["Class 12: 65.4%", "Class 10: 76.4%"],
    },
  ],

  skills: [
    {
      group: "Languages",
      icon: "code",
      items: ["Python", "TypeScript", "JavaScript", "C++", "C", "Java", "SQL"],
    },
    {
      group: "AI / ML",
      icon: "brain",
      items: ["TensorFlow", "Keras", "TF Lite", "MobileNetV2", "Scikit-learn", "Pandas", "OpenCV", "Gemini API"],
    },
    {
      group: "Frontend",
      icon: "layout",
      items: ["React 19", "Vite", "Tailwind CSS", "Three.js", "GSAP", "Leaflet", "Chart.js"],
    },
    {
      group: "Backend",
      icon: "server",
      items: ["Node.js", "Express", "FastAPI", "Flask", "Django", "Prisma", "Sequelize", "REST APIs"],
    },
    {
      group: "Data & Cloud",
      icon: "database",
      items: ["PostgreSQL", "Supabase", "MongoDB", "Firebase", "Vercel", "Render", "Cloudinary"],
    },
    {
      group: "Security",
      icon: "shield",
      items: ["JWT + refresh rotation", "TOTP MFA", "Argon2id", "AES-256-GCM", "RBAC / CBAC", "Hash-chained audit logs"],
    },
    {
      group: "Mobile",
      icon: "phone",
      items: ["Android (Java/XML)", "Flutter", "Firebase Realtime DB"],
    },
    {
      group: "Tools",
      icon: "tool",
      items: ["Git & GitHub", "Streamlit", "Postman", "Linux", "VS Code"],
    },
  ],

  /* category: ai | security | web | mobile   (used by the filter chips)
     featured: true puts the project in the big bento grid at the top      */
  projects: [
    {
      id: "nyayavault",
      featured: true,
      name: "NyayaVault",
      kicker: "Digital Evidence Management",
      year: "2026",
      category: ["security", "web"],
      accent: "#7c5cff",
      summary:
        "A cryptographically verifiable evidence vault for police, prosecution and courts. Every action lands in a hash-chained audit ledger anchored to a 4-node blockchain.",
      highlights: [
        "AES-256-GCM envelope encryption of every evidence payload in a custom authenticated NYEV binary format",
        "SHA-256 integrity checks at ingestion, storage and retrieval, plus a sequence-numbered, hash-chained audit ledger with a verify endpoint",
        "Permissioned 4-node Proof-of-Authority chain (Police · Prosecution · Court · Admin) anchoring audit checkpoints",
        "Argon2id, 15-min JWTs with rotating HttpOnly refresh tokens, RFC 6238 TOTP MFA and recovery codes",
        "RBAC + case-based access control, and a DRAFT → UNDER_REVIEW → APPROVED → SEALED lifecycle with role guards",
      ],
      stack: ["React 18", "TypeScript", "Node.js", "Prisma", "PostgreSQL", "Supabase", "Blockchain (PoA)"],
      metrics: [
        { k: "AES-256", v: "GCM at rest" },
        { k: "4", v: "authority nodes" },
        { k: "MFA", v: "TOTP + recovery" },
      ],
      live: "https://nyayavault.vercel.app",
      repo: "https://github.com/PANTH2517/NyayaVault",
    },
    {
      id: "veritas",
      featured: true,
      name: "Veritas AI",
      kicker: "Deepfake Forensics Platform",
      year: "2026",
      category: ["ai", "security"],
      accent: "#22d3ee",
      summary:
        "Detects synthetic images, audio and video by fusing a fine-tuned MobileNetV2 with 22 hand-crafted forensic signals, and returns probability breakdowns and anomaly heatmaps.",
      highlights: [
        "Hybrid fusion engine: MobileNetV2 CNN (86% weight) + 22-channel forensic MLP (14% weight)",
        "Signals include DCT grid artifacts, FFT ring energy, chroma-noise asymmetry, bilateral face asymmetry and noise-floor absence",
        "STFT spectrogram pipeline for voice-clone detection, plus video frame extraction",
        "FastAPI backend deployed as Vercel serverless functions",
      ],
      stack: ["Python", "TensorFlow / Keras", "MobileNetV2", "OpenCV", "FastAPI", "Vercel"],
      metrics: [
        { k: "87.66%", v: "validation accuracy" },
        { k: "0.88", v: "F1-score" },
        { k: "22", v: "forensic signals" },
      ],
      live: "https://veritas-ai-ashen.vercel.app",
      repo: "https://github.com/PANTH2517/Veritas-AI",
    },
    {
      id: "startin",
      featured: true,
      name: "StartIn",
      kicker: "Startup Incubation Platform (ISIP)",
      year: "2026",
      category: ["web"],
      accent: "#f59e0b",
      summary:
        "One portal for the whole campus startup journey: idea → verification → mentoring → milestones → investor funding → incubation, with dashboards for 4 roles.",
      highlights: [
        "Role-based dashboards for founders, mentors, investors and the incubation cell",
        "Startup lifecycle Draft → Pending → Approved → Incubated, where incubation unlocks only once funding is secured",
        "Investor offers, mentor meetings, milestone reviews, workshop sign-ups with auto-generated PDF certificates",
        "AES-256-GCM field encryption, Helmet, rate limiting, audit logging, and Render cold-start handling",
      ],
      stack: ["React 19", "Vite", "Tailwind v4", "Express 5", "Sequelize", "PostgreSQL", "Chart.js"],
      metrics: [
        { k: "4", v: "user roles" },
        { k: "6", v: "lifecycle stages" },
        { k: "PDF", v: "auto certificates" },
      ],
      live: "https://isip-theta.vercel.app",
      repo: "https://github.com/PANTH2517/ISIP",
    },
    {
      id: "guardian",
      featured: true,
      name: "Guardian AI",
      kicker: "Real-time Fall Detection",
      year: "2026",
      category: ["ai", "web"],
      accent: "#34d399",
      summary:
        "An AI safety system that watches for falls in real time and pushes instant alerts to caregivers, built to cut response time for elderly people living alone.",
      highlights: [
        "Lightweight neural network optimised with TensorFlow Lite for low-latency inference",
        "Flask inference API with a responsive React monitoring dashboard",
        "Firebase Cloud Messaging for instant push alerts",
      ],
      stack: ["Python", "TensorFlow Lite", "Flask", "React", "Firebase FCM"],
      metrics: [
        { k: "Real-time", v: "inference" },
        { k: "FCM", v: "instant alerts" },
      ],
      live: "https://orion-guardian-ai.vercel.app/",
      repo: "https://github.com/PANTH2517/ORION_Guardian_AI",
    },
    {
      id: "playnear",
      name: "PlayNear",
      kicker: "Android · Nearby Sports Games",
      year: "2026",
      category: ["mobile"],
      accent: "#f472b6",
      summary:
        "An Android app for finding and hosting recreational sports games at venues near you in Shirpur and Dhule, sorted by live GPS distance.",
      highlights: [
        "7 activities built in Java/XML: find, join, create and leave games; add venues by tapping a map",
        "LocationManager-based nearest-first sorting with 2 / 5 / 10 km filters",
        "Firebase Realtime Database over raw HTTP (HttpURLConnection + JSON), salted SHA-256 passwords",
        "OpenStreetMap/Leaflet venue picker in a WebView and Google Maps navigation intents",
        "Mobile App Development mini-project, team of 3",
      ],
      stack: ["Java", "Android SDK", "XML", "Firebase RTDB", "Leaflet / OSM"],
      metrics: [
        { k: "7", v: "activities" },
        { k: "GPS", v: "nearest-first" },
      ],
      repo: "https://github.com/PANTH2517/PlayNear",
    },
    {
      id: "cloud-anomaly",
      name: "Cloud Login Anomaly Detection",
      kicker: "DA-IICT Hackathon",
      year: "2025",
      category: ["ai", "security"],
      accent: "#a78bfa",
      summary:
        "ML-driven detection of account takeovers and credential attacks, scoring login risk from geo-profiles, IP reputation, timestamps and impossible-travel velocity.",
      highlights: [
        "Scikit-learn classifiers over login telemetry",
        "Impossible-travel velocity and geofencing rules for dynamic session risk scoring",
        "Built during the DA-IICT Hackathon",
      ],
      stack: ["Python", "Scikit-learn", "Pandas", "Streamlit"],
      live: "https://ai-anomalous-hackdaiict1725.streamlit.app/",
      repo: "https://github.com/PANTH2517/DA-IICT-Hackathon-",
    },
    {
      id: "space-scope",
      name: "Space Scope",
      kicker: "MERN Space Catalog",
      year: "2026",
      category: ["web"],
      accent: "#60a5fa",
      summary:
        "A MERN-stack cosmic object catalog and viewer with Express microservices, Google sign-in and MongoDB clusters.",
      highlights: ["Express API microservices", "Google OAuth authentication", "MongoDB Atlas data layer"],
      stack: ["MongoDB", "Express", "React", "Node.js", "Google Auth"],
      live: "https://space-scope-pi.vercel.app/login",
      repo: "https://github.com/PANTH2517/Space-Scope",
    },
    {
      id: "ecoroute",
      name: "EcoRoute",
      kicker: "Green Path Finder",
      year: "2026",
      category: ["web"],
      accent: "#4ade80",
      summary:
        "A routing visualiser that finds the greenest, most fuel-efficient path between two points and estimates the carbon saved.",
      highlights: ["Interactive Leaflet maps", "Carbon-cost route comparison", "React + Vite SPA on Vercel"],
      stack: ["React", "Leaflet", "Vite"],
      live: "https://eco-route-three.vercel.app/",
      repo: "https://github.com/PANTH2517/EcoRoute",
    },
    {
      id: "roomfix",
      name: "RoomFix",
      kicker: "Hostel Complaint DBMS",
      year: "2026",
      category: ["web"],
      accent: "#fb923c",
      summary:
        "A portal that connects hostel residents with administration to file complaints, schedule room fixes and manage priority queues.",
      highlights: ["Normalised relational schema", "Priority queue for complaints", "Role-based resident and admin views"],
      stack: ["AngularJS", "SQL", "Vercel"],
      live: "https://wp-dbms-project.vercel.app/#!/login",
      repo: "https://github.com/PANTH2517/WP-DBMS-Project",
    },
    {
      id: "loc-tracer",
      name: "LOC-Tracer",
      kicker: "GPS Tracking Dashboard",
      year: "2025",
      category: ["ai", "web"],
      accent: "#2dd4bf",
      summary:
        "Upload GPS logs, clean coordinate anomalies, and plot trajectories as interactive map layers.",
      highlights: ["Pandas cleaning and indexing", "Folium interactive layers", "Streamlit upload UI"],
      stack: ["Python", "Streamlit", "Folium", "Pandas"],
      live: "https://loc-checker.streamlit.app/",
      repo: "https://github.com/PANTH2517/LOC-TRACER",
    },
    {
      id: "recommender",
      name: "Movie Recommender",
      kicker: "Content-based Filtering",
      year: "2025",
      category: ["ai"],
      accent: "#e879f9",
      summary:
        "Recommends movies with TF-IDF vectors and cosine similarity over movie metadata, so it has no cold-start problem for new users.",
      highlights: ["TF-IDF vectorisation", "Cosine similarity ranking", "Streamlit front-end"],
      stack: ["Python", "Scikit-learn", "TF-IDF", "Streamlit"],
      live: "https://panthhaveliwala17-pp-project.streamlit.app/",
      repo: "https://github.com/PANTH2517/PP-project",
    },
  ],

  /* Newest first. type: academic | hackathon | cert */
  achievements: [
    {
      date: "2026",
      type: "academic",
      title: "Batch Topper · Semester 4",
      body: "Ranked #1 in the B.Tech Computer Engineering batch at NMIMS Shirpur with a 9.24 GPA, taking the overall CGPA to 8.75.",
      badge: "Rank 1",
    },
    {
      date: "2024 – 2026",
      type: "hackathon",
      title: "15+ Hackathons · 3 Wins",
      body: "Competed in more than 15 college, inter-college and national hackathons, mostly as team lead of 2–5 member teams, and won 3 of them.",
      badge: "3 Wins",
    },
    {
      date: "2025",
      type: "academic",
      title: "Batch Topper · Semester 3",
      body: "Ranked #1 in the CE batch with a 9.41 GPA.",
      badge: "Rank 1",
    },
    {
      date: "Nov 2025",
      type: "cert",
      title: "NPTEL · Data Structures & Algorithms",
      body: "Certified by NPTEL (IIT) in Data Structures and Algorithms.",
      badge: "Certified",
    },
    {
      date: "2025",
      type: "hackathon",
      title: "DA-IICT Hackathon",
      body: "Built the Cloud Login Anomaly Detection system, an ML-based detector for account takeovers.",
      badge: "Participant",
    },
    {
      date: "2024 – 2025",
      type: "hackathon",
      title: "Inter-College Hackathon · Top 3",
      body: "Led the technical build and finished in the top 3.",
      badge: "Top 3",
    },
    {
      date: "2025",
      type: "cert",
      title: "HackerRank · 5★ Python & 5★ C++",
      body: "Gold 5-star problem-solving badges in both Python and C++.",
      badge: "5★",
    },
  ],
};
