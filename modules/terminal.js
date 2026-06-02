/**
 * Subspace Terminal CLI Module
 * Parses interactive commands and prints styled console readouts
 */
export class InteractiveTerminal {
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
        
        // Print echo line
        this.writeLine(`visitor@space-dossier:~$ ${cmdRaw}`, 'command-sent');
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
        
        // Scroll screen to bottom
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
        this.writeLine('AVAILABLE SUBSPACE COMMAND CORE COMMANDS:', 'text-cyan');
        this.writeLine('  about        - View Commanding Officer biographical dossier');
        this.writeLine('  skills       - Query tech stack configurations & credentials');
        this.writeLine('  projects     - Query neural & full-stack code deployments');
        this.writeLine('  achievements - Read academic logs & hackathon records');
        this.writeLine('  contact      - Display subspace communication frequencies');
        this.writeLine('  diagnostics  - Launch complete telemetry systems self-diagnostics');
        this.writeLine('  warp <val>   - Set spaceship warp speed factor (E.g. warp 5.0)');
        this.writeLine('  clear        - Flush local console log buffer');
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printAbout() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('CREW DOSSIER: PANTH HAVELIWALA', 'text-purple');
        this.writeLine('ROLE: B.Tech Computer Engineering Student (Class of 2028)');
        this.writeLine('STATION: SVKM\'s NMIMS MPSTME, Shirpur Campus');
        this.writeLine('ORBIT COORDS: Valsad, Gujarat, India');
        this.writeLine('STATUS: Academic Batch Topper (Rank 1, CGPA 8.54 / 3rd Sem GPA: 9.41)');
        this.writeLine('');
        this.writeLine('MISSION FOCUS: Building scalable AI-driven cybersecurity models, lightweight edge neural networks, and high-performance full-stack dashboards. Actively serving as Technical Lead during Hackathons.', 'text-blue');
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
        this.writeLine('----------------------------------------------------', 'text-muted');
    }
    
    printAchievements() {
        this.writeLine('----------------------------------------------------', 'text-muted');
        this.writeLine('OFFICIAL COMMENDATIONS LOG:', 'text-cyan');
        this.writeLine('  - [BATCH TOPPER]: Ranked 1st in B.Tech CE (3rd sem) with a 9.41 GPA.', 'text-white');
        this.writeLine('  - [HACKATHON CAPTAIN]: Led engineering squads to a Top 3 finish in Inter-College Hackathon.', 'text-white');
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
            this.writeLine('ERR: Warp requires a velocity parameter. Usage: warp <factor> (E.g. warp 5.0)', 'text-pink');
            this.playError();
            return;
        }
        
        const factor = parseFloat(factorStr);
        if (isNaN(factor) || factor < 0.1 || factor > 30) {
            this.writeLine('ERR: Warp velocity must be between 0.1 and 30.0.', 'text-pink');
            this.playError();
            return;
        }
        
        this.writeLine(`WARP CORE ONLINE: THROTTLING ENGINES TO WARP FACTOR ${factor.toFixed(1)}...`, 'text-green');
        this.onWarp(factor);
    }
    
    executeDiagnostics() {
        this.writeLine('LAUNCHING MAIN SYSTEM DIAGNOSTICS...', 'text-cyan');
        
        const stages = [
            { text: '  [0.4s] Querying warp core reactor parameters...', style: 'text-muted' },
            { text: '  [0.8s] WARP ENGINE SHIELDS: 100% (STATUS: STABLE)', style: 'text-white' },
            { text: '  [1.2s] Querying cognitive subsystem registers...', style: 'text-muted' },
            { text: '  [1.6s] PYTHON ENGINE VERIFICATION: 95% ATTRIBUTE LOADED', style: 'text-white' },
            { text: '  [2.0s] ALGOS CORE (NPTEL CERT): ONLINE [NOMINAL]', style: 'text-white' },
            { text: '  [2.4s] Establishing link with database arrays (MongoDB, Firebase)...', style: 'text-muted' },
            { text: '  [2.8s] STORAGE CONNECTION: ESTABLISHED', style: 'text-white' },
            { text: '  [3.2s] CORE COMPUTATION UNITS: ALL NODES FUNCTIONING AT 60 FPS', style: 'text-green' },
            { text: 'SYSTEM CHECK COMPLETE. COCKPIT SECURITY INTEGRITY NOMINAL.', 'text-green' }
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
