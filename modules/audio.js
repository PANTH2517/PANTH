/**
 * Web Audio API Sound Synthesizer Module
 * Generates futuristic spaceship sound effects procedurally
 */
export class SoundSynthesizer {
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