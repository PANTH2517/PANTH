/**
 * Cockpit HUD Controller Module
 * Manages stats simulation, clocks, tab changes, dynamic modals, and forms
 */
export class HudController {
    constructor(soundSynth) {
        this.soundSynth = soundSynth;
        
        // Project Diagnostic Database
        this.projectsDb = {
            'guardian-ai': {
                title: 'GUARDIAN AI - DIAGNOSTIC REPORT',
                score: 94,
                threads: '8 PROCESSORS',
                impact: 'HIGH PRIORITY [LIFE-SAFETY]',
                logs: [
                    'SYSTEM: Powering up fall classification networks...',
                    'MODEL WEIGHTS: Loaded (Lightweight MobileNet Backbone)',
                    'BACKEND: Flask API service status [NOMINAL] // Ping: 12ms',
                    'NOTIFIER: Firebase Cloud Messaging connection online',
                    'EDGE ENGINE: TensorFlow Lite model running at 30ms inference latency',
                    'DIAGNOSTIC RESOLUTION: 100% telemetry routing achieved. Verified in real-time environments to secure prompt alert times.',
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
                    'DIAGNOSTIC RESOLUTION: 98.4% malicious authentication attempts deflected. Secured DA-IICT Hackathon database logs.',
                ]
            },
            'loc-tracer': {
                title: 'LOC-TRACER SYSTEMS STATUS',
                score: 87,
                threads: '2 VISUAL CORES',
                impact: 'UTILITY [GEOSPATIAL]',
                logs: [
                    'SYSTEM: Loading interactive visual mapping overlays...',
                    'UI SHELL: Streamlit dashboards loading assets...',
                    'DATA PIPELINE: Cleaning coordinate sheets in Pandas formats',
                    'MAP MATRIX: Folium Leaflet mapping canvas initialized',
                    'DIAGNOSTIC RESOLUTION: Zero anomalies detected in coordinate tracks. 100% path resolution rendering completed.',
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
                    'DIAGNOSTIC RESOLUTION: Semantic recommendation complete. Successfully bypassed cold-start index blockages.',
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
                    'DIAGNOSTIC RESOLUTION: 100% path resolution rendering completed. Successfully calculated minimal carbon paths.',
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
                    'DIAGNOSTIC RESOLUTION: RoomFix hostel DBMS platform online. Bypassed database connection bottlenecks.',
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
                    'DIAGNOSTIC RESOLUTION: Completed planetary catalog indexing and satellite path visuals.',
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
    
    // Animate a ship clock matching UTC+5:30
    initClock() {
        const clockEl = document.getElementById('hud-clock');
        if (!clockEl) return;
        
        const updateTime = () => {
            // Get local date/time of user adjusted to UTC+5:30
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
    
    // Draw scrolling telemetry graph in the bottom right corner
    initMiniMonitor() {
        const canvas = document.getElementById('hud-minimonitor');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const points = Array(35).fill(40);
        let timeOffset = 0;
        
        const drawMonitor = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Shift points and add new simulated telemetry point
            points.shift();
            
            // Generate standard sine graph with periodic spikes
            timeOffset += 0.15;
            const baseValue = 50 + Math.sin(timeOffset) * 15;
            const spike = Math.random() > 0.92 ? (Math.random() - 0.5) * 30 : 0;
            const newValue = Math.max(10, Math.min(90, baseValue + spike));
            points.push(newValue);
            
            // Draw grid backdrop
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
            
            // Draw gradient area chart
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
            grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            
            const step = canvas.width / (points.length - 1);
            for (let i = 0; i < points.length; i++) {
                // Map coordinates
                const x = i * step;
                const y = canvas.height - (points[i] / 100) * canvas.height;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();
            
            // Draw line border
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
            
            // Reset shadows
            ctx.shadowBlur = 0;
            
            requestAnimationFrame(drawMonitor);
        };
        
        drawMonitor();
    }
    
    // Typwriting effect for the main telemetry panel
    triggerTypewriter(elementId, text, speed = 12) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        el.textContent = '';
        let index = 0;
        
        const type = () => {
            if (index < text.length) {
                el.textContent += text.charAt(index);
                index++;
                
                // Play tiny typing sound every few characters to sound cool but quiet
                if (index % 3 === 0) {
                    this.soundSynth.playHover();
                }
                
                setTimeout(type, speed);
            }
        };
        
        type();
    }
    
    // Skill tab selectors
    initSkillsTabs() {
        const tabBtns = document.querySelectorAll('.skill-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.soundSynth.playClick();
                
                // Reset active tab button
                document.querySelectorAll('.skill-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Reset active contents
                document.querySelectorAll('.skills-tab-content').forEach(c => c.classList.remove('active'));
                
                const tabName = btn.getAttribute('data-tab');
                const contentEl = document.getElementById(`skills-${tabName}`);
                if (contentEl) {
                    contentEl.classList.add('active');
                    
                    // Retrigger progress bar animation from 0%
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
    
    // Project filter buttons
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
    
    // Details diagnostic modal configuration
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
                
                // Set details
                titleEl.textContent = project.title;
                threadsEl.textContent = project.threads;
                impactEl.textContent = project.impact;
                gaugeScore.textContent = `${project.score}%`;
                
                // Animate circular gauge path (circumference = 100 in SVG coordinates)
                gaugePath.setAttribute('stroke-dasharray', `${project.score}, 100`);
                
                // Clear and print log rows sequentially
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
                
                // Show modal
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
    
    // Comm-Link Contact Form
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
            
            // Animate radar sweep colors as warning/active state
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
                    telemetryFooter.textContent = 'ENCRYPTED SMTP TRANSMISSION RECEIVED';
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
