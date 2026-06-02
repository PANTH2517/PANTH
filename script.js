/**
 * Spaceship Cockpit HUD Core & Orchestration Script
 * Bundles Starfield, Audio Synthesizer, Subspace CLI, and HUD controllers into a single file
 * to enable running on local filesystems (bypassing browser module CORS constraints).
 */

// ==========================================
// 1. 3D Starfield Engine
// ==========================================
class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 450;
        this.baseSpeed = 0.8;
        this.speed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;
        this.warpFactor = 1.0;
        this.maxDepth = 1000;
        
        // Steering offsets
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.resize();
        
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * this.canvas.width * 2,
                y: (Math.random() - 0.5) * this.canvas.height * 2,
                z: Math.random() * this.maxDepth,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(0, 240, 255, ',   // Cyan
            'rgba(157, 0, 255, ',   // Purple
            'rgba(255, 0, 127, ',   // Pink
            'rgba(255, 255, 255, '  // White
        ];
        if (Math.random() > 0.3) {
            return colors[3];
        }
        return colors[Math.floor(Math.random() * 3)];
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            this.targetOffsetX = -x * 8;
            this.targetOffsetY = -y * 8;
        });
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            this.targetSpeed = this.baseSpeed * 8;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.targetSpeed = this.baseSpeed * this.warpFactor;
            }, 300);
        });
    }
    
    setWarpFactor(factor) {
        this.warpFactor = factor;
        this.targetSpeed = this.baseSpeed * factor;
    }
    
    start() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    
    update() {
        this.speed += (this.targetSpeed - this.speed) * 0.05;
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.05;
        this.offsetY += (this.targetOffsetY - this.offsetY) * 0.05;
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            star.z -= this.speed;
            star.x += this.offsetX * (this.speed * 0.15);
            star.y += this.offsetY * (this.speed * 0.15);
            
            if (star.z <= 0) {
                star.z = this.maxDepth;
                star.x = (Math.random() - 0.5) * this.canvas.width * 2;
                star.y = (Math.random() - 0.5) * this.canvas.height * 2;
            }
        }
    }
    
    draw() {
        const alpha = this.speed > 5 ? 0.15 : 0.45;
        this.ctx.fillStyle = `rgba(4, 4, 12, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const fov = 180;
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const px = (star.x / star.z) * fov + centerX;
            const py = (star.y / star.z) * fov + centerY;
            
            if (px < 0 || px > this.canvas.width || py < 0 || py > this.canvas.height) {
                continue;
            }
            
            const opacity = Math.min(1, (1 - star.z / this.maxDepth) * 1.5);
            this.ctx.strokeStyle = star.color + opacity + ')';
            this.ctx.fillStyle = star.color + opacity + ')';
            
            if (this.speed > 2.5) {
                const prevZ = star.z + this.speed * 1.8;
                const ppx = (star.x / prevZ) * fov + centerX;
                const ppy = (star.y / prevZ) * fov + centerY;
                
                this.ctx.beginPath();
                this.ctx.lineWidth = Math.min(2.5, (1 - star.z / this.maxDepth) * 3);
                this.ctx.moveTo(ppx, ppy);
                this.ctx.lineTo(px, py);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                const radius = Math.min(2.0, (1 - star.z / this.maxDepth) * 2.5);
                this.ctx.arc(px, py, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(30, 30, this.canvas.width - 60, this.canvas.height - 60);
    }
}

// ==========================================
// 2. Web Audio API Sound Synthesizer
// ==========================================
class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientOsc = null;
        this.ambientGain = null;
        this.ambientHumActive = false;
        console.log("SoundSynthesizer constructor called.");
    }
    
    initContext() {
        try {
            if (this.ctx) {
                if (this.ctx.state === 'suspended') {
                    console.log("Resuming suspended AudioContext...");
                    this.ctx.resume().then(() => {
                        console.log("AudioContext resumed successfully. State:", this.ctx.state);
                    }).catch(e => {
                        console.warn("Failed to resume AudioContext:", e);
                    });
                }
                return;
            }
            
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                console.log("Created new AudioContext. State:", this.ctx.state);
            } else {
                console.error("Web Audio API is not supported in this browser.");
            }
        } catch (e) {
            console.error("Failed to initialize AudioContext:", e);
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        console.log("Sound effects toggled. Muted:", this.muted);
        return this.muted;
    }
    
    playHover() {
        this.initContext();
        if (this.muted || !this.ctx) return;
        
        try {
            const time = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, time);
            
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.linearRampToValueAtTime(0.001, time + 0.06);
            
            osc.start(time);
            osc.stop(time + 0.07);
        } catch (e) {
            console.warn("Error playing hover sound:", e);
        }
    }
    
    playClick() {
        this.initContext();
        if (this.muted || !this.ctx) return;
        
        try {
            const time = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, time);
            osc.frequency.linearRampToValueAtTime(950, time + 0.07);
            
            gain.gain.setValueAtTime(0.20, time);
            gain.gain.linearRampToValueAtTime(0.001, time + 0.08);
            
            osc.start(time);
            osc.stop(time + 0.09);
        } catch (e) {
            console.warn("Error playing click sound:", e);
        }
    }
    
    playError() {
        this.initContext();
        if (this.muted || !this.ctx) return;
        
        try {
            const time = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, time);
            osc.frequency.linearRampToValueAtTime(110, time + 0.18);
            
            gain.gain.setValueAtTime(0.20, time);
            gain.gain.linearRampToValueAtTime(0.001, time + 0.2);
            
            osc.start(time);
            osc.stop(time + 0.22);
        } catch (e) {
            console.warn("Error playing error sound:", e);
        }
    }
    
    playBootSequence() {
        this.initContext();
        if (this.muted || !this.ctx) return;
        
        try {
            const time = this.ctx.currentTime;
            
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(100, time);
            osc1.frequency.linearRampToValueAtTime(1200, time + 1.2);
            gain1.gain.setValueAtTime(0.02, time);
            gain1.gain.linearRampToValueAtTime(0.15, time + 0.6);
            gain1.gain.linearRampToValueAtTime(0.001, time + 1.2);
            osc1.start(time);
            osc1.stop(time + 1.3);
            
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                try {
                    const osc2 = this.ctx.createOscillator();
                    const gain2 = this.ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(this.ctx.destination);
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(440, this.ctx.currentTime);
                    osc2.frequency.setValueAtTime(554.37, this.ctx.currentTime + 0.2);
                    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.4);
                    gain2.gain.setValueAtTime(0.20, this.ctx.currentTime);
                    gain2.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                    osc2.start(this.ctx.currentTime);
                    osc2.stop(this.ctx.currentTime + 0.9);
                } catch (e) {
                    console.warn("Error playing boot chord:", e);
                }
            }, 300);
        } catch (e) {
            console.warn("Error playing boot sequence:", e);
        }
    }

    toggleAmbientHum() {
        this.initContext();
        if (!this.ctx) return false;
        
        try {
            if (this.ctx.state === 'suspended') {
                console.log("Resuming AudioContext for ambient hum...");
                this.ctx.resume();
            }

            if (this.ambientHumActive) {
                console.log("Stopping ambient hum...");
                if (this.ambientOsc) {
                    try {
                        this.ambientOsc.stop();
                    } catch(e) {}
                    this.ambientOsc = null;
                }
                this.ambientHumActive = false;
            } else {
                if (this.muted) {
                    console.log("Cannot start ambient hum: muted state is active.");
                    return false;
                }
                
                console.log("Starting ambient hum oscillator (58Hz triangle)...");
                const time = this.ctx.currentTime;
                
                this.ambientOsc = this.ctx.createOscillator();
                this.ambientGain = this.ctx.createGain();
                const lowpass = this.ctx.createBiquadFilter();
                
                this.ambientOsc.connect(lowpass);
                lowpass.connect(this.ambientGain);
                this.ambientGain.connect(this.ctx.destination);
                
                this.ambientOsc.type = 'triangle';
                this.ambientOsc.frequency.setValueAtTime(58, time);
                
                lowpass.type = 'lowpass';
                lowpass.frequency.setValueAtTime(100, time);
                
                this.ambientGain.gain.setValueAtTime(0.20, time);
                
                this.ambientOsc.start(time);
                this.ambientHumActive = true;
            }
        } catch (e) {
            console.error("Error toggling ambient hum:", e);
        }
        
        return this.ambientHumActive;
    }
}

// ==========================================
// 3. Subspace Terminal CLI
// ==========================================
class InteractiveTerminal {
    constructor(screenId, inputId, options = {}) {
        this.screen = document.getElementById(screenId);
        this.input = document.getElementById(inputId);
        this.onWarp = options.onWarp || (() => {});
        this.playSound = options.playSound || (() => {});
        this.playError = options.playError || (() => {});
        
        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }
    }
    
    executeCommand(cmdRaw) {
        const cmdTrimmed = cmdRaw.trim();
        if (cmdTrimmed === '') return;
        
        const args = cmdTrimmed.split(' ');
        const primaryCmd = args[0].toLowerCase();
        
        this.writeLine(`visitor@portfolio-cli:~$ ${cmdRaw}`, 'command-sent');
        this.playSound();
        
        switch (primaryCmd) {
            case 'help':
                this.printHelp();
                break;
            case 'about':
            case 'bio':
                this.printAbout();
                break;
            case 'skills':
            case 'tech':
                this.printSkills();
                break;
            case 'projects':
            case 'deployments':
                this.printProjects();
                break;
            case 'achievements':
            case 'records':
                this.printAchievements();
                break;
            case 'contact':
            case 'mail':
                this.printContact();
                break;
            case 'warp':
                this.executeWarp(args[1]);
                break;
            case 'system-check':
            case 'diagnostics':
                this.executeDiagnostics();
                break;
            case 'clear':
                this.screen.innerHTML = '';
                break;
            default:
                this.writeLine(`ERR: Command '${primaryCmd}' not recognized. Type 'help' for available subsystems.`, 'text-pink');
                this.playError();
        }
        
        setTimeout(() => {
            this.screen.scrollTop = this.screen.scrollHeight;
        }, 50);
    }
    
    writeLine(text, className = '') {
        const row = document.createElement('div');
        row.className = `terminal-output-row ${className}`;
        
        const line = document.createElement('span');
        line.className = 'line-content';
        line.innerHTML = text;
        
        row.appendChild(line);
        this.screen.appendChild(row);
    }
    
    printHelp() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('AVAILABLE PORTFOLIO TERMINAL COMMANDS:', 'text-cyan');
        this.writeLine('  about        - View developer biographical details');
        this.writeLine('  skills       - Query tech stack configurations & skills');
        this.writeLine('  projects     - Query software engineering project databases');
        this.writeLine('  achievements - Read academic logs & hackathon records');
        this.writeLine('  contact      - Display communication email & links');
        this.writeLine('  diagnostics  - Launch complete systems self-diagnostics');
        this.writeLine('  warp <val>   - Set background starfield warp speed (E.g. warp 5.0)');
        this.writeLine('  clear        - Flush local console log buffer');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printAbout() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('DEVELOPER BIO: PANTH HAVELIWALA', 'text-purple');
        this.writeLine('ROLE: B.Tech Computer Engineering Student (Class of 2028)');
        this.writeLine('STATION: SVKM\'s NMIMS MPSTME, Shirpur Campus');
        this.writeLine('LOCATION: Valsad, Gujarat, India');
        this.writeLine('STATUS: Academic Batch Topper (Rank 1, CGPA 8.54 / 3rd Sem GPA: 9.41)');
        this.writeLine('');
        this.writeLine('CAREER FOCUS: Building scalable AI-driven cybersecurity models, lightweight edge neural networks, and high-performance full-stack dashboards. Actively serving as Technical Lead during Hackathons.', 'text-blue');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printSkills() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('CAPABILITY LOGS:', 'text-cyan');
        this.writeLine('  [LANGUAGES]:  Python, C++, C, Java, JavaScript, SQL, HTML5, CSS3', 'text-white');
        this.writeLine('  [FRAMEWORKS]: React, Django, Flask, Streamlit, Flutter, TensorFlow Lite', 'text-white');
        this.writeLine('  [LIBRARIES]:  Pandas, Scikit-Learn, Folium, TF-IDF Vectorizers', 'text-white');
        this.writeLine('  [DATA STORAGE]: MongoDB, Firebase Firestore / Realtime DB', 'text-white');
        this.writeLine('  [OPERATIONAL]: Git/Github, Vercel, Render Cloud, Edge Deployments', 'text-white');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printProjects() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('PROJECT DEPLOYMENT HISTORY:', 'text-pink');
        this.writeLine('');
        this.writeLine('1. GUARDIAN AI: Real-Time Fall Detection System (Jan 2026)', 'text-cyan');
        this.writeLine('   - Objective: Monitor & detect falls to protect elderly individuals.');
        this.writeLine('   - Tech: TensorFlow Lite neural net + Flask API + React dashboard + Firebase FCM notifications.');
        this.writeLine('');
        this.writeLine('2. CLOUD ANOMALY DETECTOR: Geofencing Security Shield (Sep 2025)', 'text-purple');
        this.writeLine('   - Objective: Stop account takeovers by identifying anomalous access events.');
        this.writeLine('   - Tech: Python, Scikit-learn, Pandas, AI Classifier models.');
        this.writeLine('');
        this.writeLine('3. LOC-TRACER: Location Tracking Dashboard (Oct 2025)', 'text-pink');
        this.writeLine('   - Objective: Index multi-point coordinates logs and overlay visual layers.');
        this.writeLine('   - Tech: Streamlit interface, Pandas dataset manipulation, Folium maps.');
        this.writeLine('');
        this.writeLine('4. RECOMMENDER CORE: Semantic Recommendation Engine (Mar 2025)', 'text-blue');
        this.writeLine('   - Objective: Solve descriptions matches with movie databases.');
        this.writeLine('   - Tech: Python, TF-IDF Vectorization, Cosine Similarity, Streamlit.');
        this.writeLine('');
        this.writeLine('5. PLANT DISEASE DETECTION: Crop Health Identification System (Mar 2025)', 'text-green');
        this.writeLine('   - Objective: Identify crop leaf diseases to assist farming operations.');
        this.writeLine('   - Tech: Python, TensorFlow CNN models, Image Processing.');
        this.writeLine('');
        this.writeLine('6. URBAN ORBIT: Citizen Reporting & Government Dashboard (Apr 2026)', 'text-cyan');
        this.writeLine('   - Objective: Connect citizens with municipal systems to report and coordinate issues.');
        this.writeLine('   - Tech: React, Vite, Firebase Auth/Firestore, Tailwind CSS.');
        this.writeLine('');
        this.writeLine('7. SPACE SCOPE: Astronomy Catalog Telemetry Interface (May 2026)', 'text-purple');
        this.writeLine('   - Objective: Render planetary catalogs and track cosmic satellite paths.');
        this.writeLine('   - Tech: MERN Stack (Node, Express, React, MongoDB), Google Auth.');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printAchievements() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('OFFICIAL ACADEMIC & HACKATHON LOG:', 'text-cyan');
        this.writeLine('  - [BATCH TOPPER]: Ranked 1st in B.Tech CE (3rd sem) with a 9.41 GPA.', 'text-white');
        this.writeLine('  - [HACKATHON LEAD]: Led engineering squads to a Top 3 finish in Inter-College Hackathon.', 'text-white');
        this.writeLine('  - [DSA CERTIFICATION]: Earned NPTEL Data Structures & Algorithms verification (Nov 2025).', 'text-white');
        this.writeLine('  - [HACKERRANK SHIELDS]: 5-Star ratings in both Python & C++ compilers.', 'text-white');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printContact() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('COMMUNICATION FREQUENCIES:', 'text-pink');
        this.writeLine('  - EMAIL ADDRESS : panthhaveliwala@gmail.com');
        this.writeLine('  - LINKEDIN NODE : linkedin.com/in/panth-haveliwala-06811131a');
        this.writeLine('  - GITHUB HUBS   : github.com/PANTH2517');
        this.writeLine('  - BASE LOCATION : Valsad, Gujarat, India');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    executeWarp(factorStr) {
        if (!factorStr) {
            this.writeLine('ERR: Warp requires a speed parameter. Usage: warp <factor> (E.g. warp 5.0)', 'text-pink');
            this.playError();
            return;
        }
        
        const factor = parseFloat(factorStr);
        if (isNaN(factor) || factor < 0.1 || factor > 30) {
            this.writeLine('ERR: Starfield warp factor must be between 0.1 and 30.0.', 'text-pink');
            this.playError();
            return;
        }
        
        this.writeLine(`STARFIELD PROPULSION ONLINE: ACCELERATING WARP FACTOR TO ${factor.toFixed(1)}...`, 'text-green');
        this.onWarp(factor);
    }
    
    executeDiagnostics() {
        this.writeLine('LAUNCHING MAIN SYSTEM DIAGNOSTICS...', 'text-cyan');
        
        const stages = [
            { text: '  [0.4s] Querying background starfield warp factor...', style: 'text-muted' },
            { text: '  [0.8s] STARFIELD BACKGROUND ENGINE: ACTIVE & STABLE', style: 'text-white' },
            { text: '  [1.2s] Querying cognitive technical skills databases...', style: 'text-muted' },
            { text: '  [1.6s] PYTHON ENGINE VERIFICATION: 95% ATTRIBUTE LOADED', style: 'text-white' },
            { text: '  [2.0s] ALGOS CORE (NPTEL CERT): ONLINE [NOMINAL]', style: 'text-white' },
            { text: '  [2.4s] Establishing link with database arrays (MongoDB, Firebase)...', style: 'text-muted' },
            { text: '  [2.8s] STORAGE CONNECTION: ESTABLISHED', style: 'text-white' },
            { text: '  [3.2s] CORE COMPUTATION UNITS: ALL NODES FUNCTIONING AT 60 FPS', style: 'text-green' },
            { text: 'SYSTEM CHECK COMPLETE. PORTFOLIO SECURITY INTEGRITY NOMINAL.', style: 'text-green' }
        ];
        
        stages.forEach((stage, idx) => {
            setTimeout(() => {
                this.writeLine(stage.text, stage.style);
                this.screen.scrollTop = this.screen.scrollHeight;
                this.playSound();
            }, (idx + 1) * 400);
        });
    }
}

// ==========================================
// 4. Cockpit HUD Controller
// ==========================================
class HudController {
    constructor(soundSynth) {
        this.soundSynth = soundSynth;
        
        this.projectsDb = {
            'guardian-ai': {
                title: 'GUARDIAN AI - PROJECT REPORT',
                score: 94,
                threads: '8 PROCESSORS',
                impact: 'HIGH PRIORITY [LIFE-SAFETY]',
                logs: [
                    'SYSTEM: Powering up fall classification networks...',
                    'MODEL WEIGHTS: Loaded (Lightweight MobileNet Backbone)',
                    'BACKEND: Flask API service status [NOMINAL] // Ping: 12ms',
                    'NOTIFIER: Firebase Cloud Messaging connection online',
                    'EDGE ENGINE: TensorFlow Lite model running at 30ms inference latency',
                    'PROJECT OUTCOME: 100% telemetry routing achieved. Verified in real-time environments to secure prompt alert times.',
                ]
            },
            'cloud-security': {
                title: 'CLOUD LOGIN ANOMALY DETECTION',
                score: 89,
                threads: '4 CORE ENGINES',
                impact: 'MEDIUM PRIORITY [ACCESS CONTROL]',
                logs: [
                    'SYSTEM: Geofencing classifier parameters established...',
                    'ANOMALY VECTOR: Scikit-learn random forest model active',
                    'DATASET: Indexing geo-coordinates logs using Pandas...',
                    'IMPOSSIBLE TRAVEL ALGO: Tracking user access log timestamps...',
                    'MITIGATION ENGINE: Flagging dictionary scans & geolocation anomalies',
                    'PROJECT OUTCOME: 98.4% malicious authentication attempts deflected. Secured DA-IICT Hackathon database logs.',
                ]
            },
            'loc-tracer': {
                title: 'LOC-TRACER STATUS REPORT',
                score: 87,
                threads: '2 VISUAL CORES',
                impact: 'UTILITY [GEOSPATIAL]',
                logs: [
                    'SYSTEM: Loading interactive visual mapping overlays...',
                    'UI SHELL: Streamlit dashboards loading assets...',
                    'DATA PIPELINE: Cleaning coordinate sheets in Pandas formats',
                    'MAP MATRIX: Folium Leaflet mapping canvas initialized',
                    'PROJECT OUTCOME: Zero anomalies detected in coordinate tracks. 100% path resolution rendering completed.',
                ]
            },
            'recommender': {
                title: 'MOVIE RECOMMENDATION SYSTEM',
                score: 91,
                threads: '16 THREADS',
                impact: 'UTILITY [SEARCH]',
                logs: [
                    'SYSTEM: Scanning semantic database clusters...',
                    'TF-IDF MATRIX: Document term frequencies vectors created',
                    'CORRELATION: Cosine similarity indices computed',
                    'RESOLVER: Streamlit web console online',
                    'PROJECT OUTCOME: Semantic recommendation complete. Successfully bypassed cold-start index blockages.',
                ]
            },
            'plant-disease': {
                title: 'ECOROUTE DIAGNOSTICS REPORT',
                score: 92,
                threads: '12 COMPUTE UNIT CORES',
                impact: 'MEDIUM PRIORITY [GREEN NAVIGATION]',
                logs: [
                    'SYSTEM: Powering up greenest pathway optimization matrix...',
                    'MAP LAYERS: Fetching carbon footprint index feeds...',
                    'ROUTING ENGINE: Calculating eco-friendly paths via Leaflet...',
                    'UI SHELL: Initializing React-based map container overlays...',
                    'PROJECT OUTCOME: 100% path resolution rendering completed. Successfully calculated minimal carbon paths.',
                ]
            },
            'urban-orbit': {
                title: 'ROOMFIX COMPLAINT DATABASE LOGS',
                score: 95,
                threads: 'SECURE DBMS RULES',
                impact: 'HIGH PRIORITY [HOSTEL MANAGEMENT]',
                logs: [
                    'SYSTEM: Initiating RoomFix complaint dashboard queries...',
                    'DATABASE NODE: Connecting hostel maintenance tables...',
                    'RESOLVER ENGINE: Assigning room repair priority queues...',
                    'UI SHELL: Loading Angular web interface templates...',
                    'PROJECT OUTCOME: RoomFix hostel DBMS platform online. Bypassed database connection bottlenecks.',
                ]
            },
            'space-scope': {
                title: 'SPACE SCOPE TELEMETRY LOGS',
                score: 93,
                threads: 'MERN STACK DATA PIPELINE',
                impact: 'HIGH PRIORITY [CELESTIAL OBS]',
                logs: [
                    'SYSTEM: Initiating astronomical data feeds...',
                    'FRONTEND: Vite SPA production build completed...',
                    'BACKEND: Express API server active on Render cloud...',
                    'OAUTH HANDLER: Authenticating credentials via Google Auth...',
                    'PROJECT OUTCOME: Completed planetary catalog indexing and satellite path visuals.',
                ]
            }
        };

        this.initClock();
        this.initMiniMonitor();
        this.initSkillsTabs();
        this.initProjectFilters();
        this.initDiagnosticsModal();
        this.initContactForm();
    }
    
    initClock() {
        const clockEl = document.getElementById('hud-clock');
        if (!clockEl) return;
        
        const updateTime = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const istOffset = 5.5 * 3600000;
            const istTime = new Date(utc + istOffset);
            
            const hours = String(istTime.getHours()).padStart(2, '0');
            const minutes = String(istTime.getMinutes()).padStart(2, '0');
            const seconds = String(istTime.getSeconds()).padStart(2, '0');
            
            clockEl.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initMiniMonitor() {
        const canvas = document.getElementById('hud-minimonitor');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const points = Array(35).fill(40);
        let timeOffset = 0;
        
        const drawMonitor = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            points.shift();
            
            timeOffset += 0.15;
            const baseValue = 50 + Math.sin(timeOffset) * 15;
            const spike = Math.random() > 0.92 ? (Math.random() - 0.5) * 30 : 0;
            const newValue = Math.max(10, Math.min(90, baseValue + spike));
            points.push(newValue);
            
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 20; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let j = 20; j < canvas.height; j += 20) {
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(canvas.width, j);
                ctx.stroke();
            }
            
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
            grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            
            const step = canvas.width / (points.length - 1);
            for (let i = 0; i < points.length; i++) {
                const x = i * step;
                const y = canvas.height - (points[i] / 100) * canvas.height;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
            
            ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                const x = i * step;
                const y = canvas.height - (points[i] / 100) * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            requestAnimationFrame(drawMonitor);
        };
        
        drawMonitor();
    }
    
    triggerTypewriter(elementId, text, speed = 12) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        el.textContent = '';
        let index = 0;
        
        const type = () => {
            if (index < text.length) {
                el.textContent += text.charAt(index);
                index++;
                if (index % 3 === 0) {
                    this.soundSynth.playHover();
                }
                setTimeout(type, speed);
            }
        };
        
        type();
    }
    
    initSkillsTabs() {
        const tabBtns = document.querySelectorAll('.skill-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.soundSynth.playClick();
                
                document.querySelectorAll('.skill-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.skills-tab-content').forEach(c => c.classList.remove('active'));
                
                const tabName = btn.getAttribute('data-tab');
                const contentEl = document.getElementById(`skills-${tabName}`);
                if (contentEl) {
                    contentEl.classList.add('active');
                    
                    const progressBars = contentEl.querySelectorAll('.progress-fill');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 50);
                    });
                }
            });
        });
    }
    
    initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.soundSynth.playClick();
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                cards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');
                    if (filter === 'all' || categories.includes(filter)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    initDiagnosticsModal() {
        const modal = document.getElementById('diagnostic-modal');
        const closeBtn = document.getElementById('modal-close');
        const titleEl = document.getElementById('modal-project-title');
        const detailsEl = document.getElementById('modal-project-details');
        const threadsEl = document.getElementById('modal-project-threads');
        const impactEl = document.getElementById('modal-project-impact');
        const gaugeScore = document.getElementById('modal-project-score-text');
        const gaugePath = document.getElementById('modal-project-score-path');
        
        const diagnoseBtns = document.querySelectorAll('.btn-diagnose');
        
        diagnoseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const projectId = btn.getAttribute('data-project');
                const project = this.projectsDb[projectId];
                if (!project) return;
                
                this.soundSynth.playClick();
                
                titleEl.textContent = project.title;
                threadsEl.textContent = project.threads;
                impactEl.textContent = project.impact;
                gaugeScore.textContent = `${project.score}%`;
                
                gaugePath.setAttribute('stroke-dasharray', `${project.score}, 100`);
                
                detailsEl.innerHTML = '';
                project.logs.forEach((log, idx) => {
                    setTimeout(() => {
                        const row = document.createElement('div');
                        row.className = 'diag-row';
                        row.innerHTML = `<span class="diag-label">&gt;&gt;</span> ${log}`;
                        detailsEl.appendChild(row);
                        detailsEl.scrollTop = detailsEl.scrollHeight;
                        this.soundSynth.playHover();
                    }, (idx + 1) * 300);
                });
                
                modal.classList.remove('hidden');
            });
        });
        
        const closeModal = () => {
            this.soundSynth.playClick();
            modal.classList.add('hidden');
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    initContactForm() {
        const form = document.getElementById('comm-signal-form');
        const submitBtn = document.getElementById('comms-submit-btn');
        const telemetryFooter = document.getElementById('footer-telemetry-stream');
        
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.soundSynth.playClick();
            
            const name = document.getElementById('comms-name').value;
            const email = document.getElementById('comms-email').value;
            const msg = document.getElementById('comms-msg').value;
            
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            btnText.textContent = 'TRANSMITTING SIGNAL...';
            submitBtn.disabled = true;
            
            const radarSweep = document.querySelector('.radar-sweep');
            if (radarSweep) {
                radarSweep.style.background = 'conic-gradient(from 0deg, rgba(255, 0, 127, 0.4) 0deg, transparent 90deg)';
            }
            
            // Send email directly to inbox in the background using FormSubmit API
            fetch("https://formsubmit.co/ajax/panthhaveliwala@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: msg,
                    _subject: `New Portfolio Message from ${name}`
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("FormSubmit direct response:", data);
                btnText.textContent = 'SIGNAL SENT';
                this.soundSynth.playClick();
                
                if (telemetryFooter) {
                    telemetryFooter.textContent = 'SECURE EMAIL TRANSMISSION INITIATED';
                    telemetryFooter.classList.add('text-green');
                }
                
                alert(`TRANSMISSION SUCCESSFUL!\nYour message has been sent directly to Panth Haveliwala.`);
                
                form.reset();
                btnText.textContent = originalText;
                submitBtn.disabled = false;
                
                if (radarSweep) {
                    radarSweep.style.background = 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.15) 0deg, transparent 90deg)';
                }
            })
            .catch(error => {
                console.warn("Direct transmission failed. Falling back to Gmail Compose tab.", error);
                
                // Fallback: Open Gmail Web Compose tab prefilled
                const subject = encodeURIComponent(`Portfolio Message from ${name}`);
                const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=panthhaveliwala@gmail.com&su=${subject}&body=${body}`;
                window.open(gmailUrl, '_blank');
                
                btnText.textContent = originalText;
                submitBtn.disabled = false;
                if (radarSweep) {
                    radarSweep.style.background = 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.15) 0deg, transparent 90deg)';
                }
            });
        });
    }
}

// ==========================================
// 5. Main Orchestration & Boot sequence
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const starfield = new Starfield('starfield-canvas');
    if (starfield) {
        starfield.start();
    }
    
    const soundSynth = new SoundSynthesizer();
    
    const bioTransmission = 
`DEVELOPER PROFILE SUMMARY:
I am a highly motivated B.Tech student in Computer Engineering at SVKM's NMIMS Shirpur.
Specializing in building AI/ML applications, full-stack systems, and cybersecurity solutions.
Frequently lead technical teams in hackathons, turning complex problems into functional, high-performance software.

PORTFOLIO HIGHLIGHTS:
- Approach: Modular clean code, security-first development, agile prototyping.
- Core Specialties: Python, JavaScript, React.js, Flask, Django, TF Lite, Scikit-learn.
- Current Status: Batch Topper (GPA: 9.41 / Overall CGPA: 8.54)`;

    let hudController = null;
    let terminalInstance = null;
    
    const bootProgress = document.getElementById('boot-progress');
    const bootStatus = document.getElementById('boot-status');
    const bootBtn = document.getElementById('boot-btn');
    const bootScreen = document.getElementById('boot-screen');
    
    let progress = 0;
    const loadStages = [
        { limit: 20, status: 'ESTABLISHING DATA LINK CONNECTION...' },
        { limit: 45, status: 'INITIALIZING PORTFOLIO ENGINE...' },
        { limit: 70, status: 'PARSING TECHNICAL CAPABILITY STACKS...' },
        { limit: 90, status: 'LOADING PROJECT DATABASES...' },
        { limit: 100, status: 'PORTFOLIO COCKPIT SYSTEM READY.' }
    ];
    
    const runBootSequence = () => {
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                if (bootProgress) bootProgress.style.width = '100%';
                if (bootStatus) {
                    bootStatus.textContent = loadStages[4].status;
                    bootStatus.classList.add('text-green');
                }
                
                if (bootBtn) {
                    bootBtn.classList.remove('disabled');
                    bootBtn.disabled = false;
                }
            } else {
                if (bootProgress) bootProgress.style.width = `${progress}%`;
                
                if (bootStatus) {
                    const stage = loadStages.find(s => progress <= s.limit) || loadStages[4];
                    bootStatus.textContent = `${stage.status} (${progress}%)`;
                }
            }
        }, 80);
    };
    
    runBootSequence();
    
    if (bootBtn) {
        bootBtn.addEventListener('click', () => {
            soundSynth.initContext();
            soundSynth.playBootSequence();
            
            // Start continuous background hum automatically
            soundSynth.toggleAmbientHum();
            const ambientToggle = document.getElementById('ambient-toggle');
            if (ambientToggle) {
                ambientToggle.classList.add('active');
            }
            
            if (bootScreen) {
                bootScreen.classList.add('fade-out');
            }
            document.body.classList.remove('hud-booting');
            
            hudController = new HudController(soundSynth);
            
            setTimeout(() => {
                if (hudController) {
                    hudController.triggerTypewriter('hero-typewriter', bioTransmission, 15);
                }
            }, 1200);
            
            terminalInstance = new InteractiveTerminal('terminal-screen', 'terminal-cli-input', {
                onWarp: (factor) => {
                    if (starfield) {
                        starfield.setWarpFactor(factor);
                    }
                    
                    const warpValEl = document.getElementById('warp-factor-display');
                    const warpBarEl = document.getElementById('warp-factor-bar');
                    if (warpValEl) {
                        warpValEl.textContent = `FACTOR ${factor.toFixed(1)}`;
                    }
                    if (warpBarEl) {
                        const pct = Math.min(100, (factor / 15) * 100);
                        warpBarEl.style.width = `${pct}%`;
                        if (factor > 8) {
                            warpBarEl.className = 'stat-bar bg-pink';
                            warpValEl.className = 'stat-value text-pink';
                        } else if (factor > 3) {
                            warpBarEl.className = 'stat-bar bg-purple';
                            warpValEl.className = 'stat-value text-purple';
                        } else {
                            warpBarEl.className = 'stat-bar bg-cyan';
                            warpValEl.className = 'stat-value text-cyan';
                        }
                    }
                },
                playSound: () => soundSynth.playHover(),
                playError: () => soundSynth.playError()
            });
        });
    }
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.hud-view');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            
            soundSynth.playClick();
            
            const targetId = btn.getAttribute('data-target');
            
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            views.forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(`view-${targetId}`);
            if (targetView) {
                targetView.classList.add('active');
                
                if (targetId === 'home') {
                    if (hudController) {
                        hudController.triggerTypewriter('hero-typewriter', bioTransmission, 15);
                    }
                } else if (targetId === 'about') {
                    const activeContent = document.querySelector('.skills-tab-content.active');
                    if (activeContent) {
                        const progressBars = activeContent.querySelectorAll('.progress-fill');
                        progressBars.forEach(bar => {
                            const w = bar.style.width;
                            bar.style.width = '0%';
                            setTimeout(() => { bar.style.width = w; }, 100);
                        });
                    }
                } else if (targetId === 'terminal') {
                    const cliInput = document.getElementById('terminal-cli-input');
                    if (cliInput) setTimeout(() => cliInput.focus(), 200);
                }
            }
        });
        
        btn.addEventListener('mouseenter', () => soundSynth.playHover());
    });
    
    const soundToggle = document.getElementById('sound-toggle');
    const ambientToggle = document.getElementById('ambient-toggle');
    
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const isMuted = soundSynth.toggleMute();
            const onIcon = soundToggle.querySelector('.audio-icon.on');
            const offIcon = soundToggle.querySelector('.audio-icon.off');
            
            if (isMuted) {
                soundToggle.classList.remove('sound-on');
                onIcon.classList.add('hidden');
                offIcon.classList.remove('hidden');
            } else {
                soundToggle.classList.add('sound-on');
                onIcon.classList.remove('hidden');
                offIcon.classList.add('hidden');
                soundSynth.playClick();
            }
        });
    }
    
    if (ambientToggle) {
        ambientToggle.addEventListener('click', () => {
            const isHumming = soundSynth.toggleAmbientHum();
            if (isHumming) {
                ambientToggle.classList.add('active');
                soundSynth.playClick();
            } else {
                ambientToggle.classList.remove('active');
            }
        });
    }
    
    const setupInteractivity = () => {
        const hoverables = document.querySelectorAll('a, button, .project-card, .achievement-card');
        hoverables.forEach(item => {
            if (item.id === 'boot-btn' || item.classList.contains('boot-btn')) return;
            
            item.addEventListener('mouseenter', () => {
                soundSynth.playHover();
            });
        });
    };
    
    setTimeout(setupInteractivity, 2000);
});
