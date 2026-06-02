/**
 * 3D Starfield Engine Module
 * Simulates flying through space with warp effects on speed increase
 */
export class Starfield {
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
        
        // Create stars with random initial positions
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
        // 70% chance of white, 30% chance of color accent
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
        
        // Steer with mouse coordinates
        window.addEventListener('mousemove', (e) => {
            // Normalize coordinates between -0.5 and 0.5
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            
            // Set drift targets
            this.targetOffsetX = -x * 8;
            this.targetOffsetY = -y * 8;
        });
        
        // Scroll velocity increases speed temporarily (warp factor)
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
        // Interpolate speed for smooth accelerations
        this.speed += (this.targetSpeed - this.speed) * 0.05;
        
        // Interpolate offset/steering angles
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.05;
        this.offsetY += (this.targetOffsetY - this.offsetY) * 0.05;
        
        // Update star depths
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // Move stars closer (decrease z)
            star.z -= this.speed;
            
            // Add steering drift
            star.x += this.offsetX * (this.speed * 0.15);
            star.y += this.offsetY * (this.speed * 0.15);
            
            // Recycle stars that move past the screen depth boundary
            if (star.z <= 0) {
                star.z = this.maxDepth;
                star.x = (Math.random() - 0.5) * this.canvas.width * 2;
                star.y = (Math.random() - 0.5) * this.canvas.height * 2;
            }
        }
    }
    
    draw() {
        // Dark space tail clearing (adds a trail effect during warp speeds)
        const alpha = this.speed > 5 ? 0.15 : 0.45;
        this.ctx.fillStyle = `rgba(4, 4, 12, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const fov = 180; // Field of view depth projection modifier
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // Projected screen coordinates
            const px = (star.x / star.z) * fov + centerX;
            const py = (star.y / star.z) * fov + centerY;
            
            // Ignore if coordinates fall outside viewport bounds
            if (px < 0 || px > this.canvas.width || py < 0 || py > this.canvas.height) {
                continue;
            }
            
            // Fade stars as they are further away (opacity based on depth z)
            const opacity = Math.min(1, (1 - star.z / this.maxDepth) * 1.5);
            this.ctx.strokeStyle = star.color + opacity + ')';
            this.ctx.fillStyle = star.color + opacity + ')';
            
            // If speed is high, draw light trails (hyperdrive effect)
            if (this.speed > 2.5) {
                // Calculate trailing tail from previous coordinates
                const prevZ = star.z + this.speed * 1.8;
                const ppx = (star.x / prevZ) * fov + centerX;
                const ppy = (star.y / prevZ) * fov + centerY;
                
                this.ctx.beginPath();
                this.ctx.lineWidth = Math.min(2.5, (1 - star.z / this.maxDepth) * 3);
                this.ctx.moveTo(ppx, ppy);
                this.ctx.lineTo(px, py);
                this.ctx.stroke();
            } else {
                // Regular starlight dots
                this.ctx.beginPath();
                const radius = Math.min(2.0, (1 - star.z / this.maxDepth) * 2.5);
                this.ctx.arc(px, py, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Render sector border guides on the side of the cockpit screen (futuristic line grid)
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(30, 30, this.canvas.width - 60, this.canvas.height - 60);
    }
}
