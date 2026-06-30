// particles.js - Manages weather, wildlife, and interactive floating elements

export class ParticleManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Mouse position for interactive particles (Updated via main.js)
        this.mouse = { x: -1000, y: -1000 };
        
        // Performance check: reduce particles on mobile devices
        this.isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.multiplier = this.isMobile ? 0.4 : 1.0;

        // Particle Arrays
        this.fireflies = [];
        this.leaves = [];
        this.snowflakes = [];
        this.raindrops = [];
        this.birds = [];

        this.initParticles();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    // Called by main.js to pass mouse coordinates
    updateMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    initParticles() {
        const m = this.multiplier;
        
        // Fireflies (Summer)
        for (let i = 0; i < Math.floor(25 * m); i++) this.fireflies.push(this.createFirefly());
        // Leaves (Autumn)
        for (let i = 0; i < Math.floor(40 * m); i++) this.leaves.push(this.createLeaf());
        // Snow (Winter)
        for (let i = 0; i < Math.floor(100 * m); i++) this.snowflakes.push(this.createSnowflake());
        // Rain (Spring)
        for (let i = 0; i < Math.floor(80 * m); i++) this.raindrops.push(this.createRaindrop());
        // Birds (Occasional, all seasons but mostly spring/summer)
        for (let i = 0; i < 3; i++) this.birds.push(this.createBird());
    }

    // --- PARTICLE FACTORIES ---
    createFirefly() {
        return { x: Math.random() * this.width, y: Math.random() * this.height * 0.8, size: 2 + Math.random() * 2, speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.5, pulse: Math.random() * Math.PI * 2 };
    }
    createLeaf() {
        return { x: Math.random() * this.width, y: -20 - Math.random() * this.height, size: 4 + Math.random() * 6, speedY: 0.5 + Math.random() * 1.5, wobbleSpeed: 0.02 + Math.random() * 0.02, wobbleAmount: 30 + Math.random() * 40, rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 2, color: [`rgb(210, 105, 30)`, `rgb(180, 80, 20)`, `rgb(230, 150, 50)`, `rgb(160, 50, 20)`][Math.floor(Math.random() * 4)] };
    }
    createSnowflake() {
        return { x: Math.random() * this.width, y: -10 - Math.random() * this.height, size: 1 + Math.random() * 3, speedY: 0.3 + Math.random() * 1, speedX: (Math.random() - 0.5) * 0.5, opacity: 0.4 + Math.random() * 0.6 };
    }
    createRaindrop() {
        return { x: Math.random() * this.width, y: -20 - Math.random() * this.height, length: 10 + Math.random() * 15, speedY: 8 + Math.random() * 12, speedX: -1, opacity: 0.2 + Math.random() * 0.3 };
    }
    createBird() {
        return { x: -50, y: 50 + Math.random() * (this.height * 0.3), speed: 1 + Math.random() * 2, wingPhase: Math.random() * Math.PI * 2, size: 3 + Math.random() * 3, active: false };
    }

    // --- MAIN UPDATE & DRAW LOOP ---
    updateAndDraw(ctx, progress) {
        // Determine season intensities (0 to 1) for smooth blending between particle types
        // Summer: 0.0 - 0.25
        const summerIntensity = this.getSeasonIntensity(progress, 0.0);
        // Autumn: 0.25 - 0.5
        const autumnIntensity = this.getSeasonIntensity(progress, 0.25);
        // Winter: 0.5 - 0.75
        const winterIntensity = this.getSeasonIntensity(progress, 0.5);
        // Spring: 0.75 - 1.0
        const springIntensity = this.getSeasonIntensity(progress, 0.75);

        if (summerIntensity > 0) this.drawFireflies(ctx, summerIntensity);
        if (autumnIntensity > 0) this.drawLeaves(ctx, autumnIntensity);
        if (winterIntensity > 0) this.drawSnowflakes(ctx, winterIntensity);
        if (springIntensity > 0) this.drawRain(ctx, springIntensity);
        
        // Birds appear mostly in Spring/Summer
        if (summerIntensity > 0.5 || springIntensity > 0.5) this.drawBirds(ctx);
    }

    // Helper to calculate how strong a season's particles should be
    getSeasonIntensity(progress, seasonStart) {
        const distance = Math.abs(progress - seasonStart);
        // Intensity fades as you move away from the season's peak
        return Math.max(0, 1 - (distance * 4)); 
    }

    // --- REPEL LOGIC (Leaves & Snow) ---
    applyMouseRepulsion(particle, radius, force) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < radius) {
            const angle = Math.atan2(dy, dx);
            const strength = (radius - dist) / radius * force;
            particle.x += Math.cos(angle) * strength;
            particle.y += Math.sin(angle) * strength;
        }
    }

    // --- DRAWING FUNCTIONS ---

    drawFireflies(ctx, intensity) {
        const time = performance.now() * 0.001;
        ctx.save();
        this.fireflies.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off edges gently
            if (p.x < 0 || p.x > this.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.height * 0.8) p.speedY *= -1;

            const pulse = Math.sin(time * 2 + p.pulse) * 0.5 + 0.5;
            ctx.globalAlpha = pulse * intensity;
            ctx.fillStyle = '#ffffaa';
            ctx.shadowColor = '#ffffaa';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0; // Reset
        ctx.restore();
    }

    drawLeaves(ctx, intensity) {
        const time = performance.now() * 0.001;
        ctx.save();
        ctx.globalAlpha = intensity;
        
        this.leaves.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(time * p.wobbleSpeed * 100 + p.y * 0.01) * 0.5;
            p.rotation += p.rotSpeed;

            // Interactive swirl around cursor
            this.applyMouseRepulsion(p, 100, 3);

            // Recycle if off screen
            if (p.y > this.height + 20) { p.y = -20; p.x = Math.random() * this.width; }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            // Draw a simple leaf shape
            ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    }

    drawSnowflakes(ctx, intensity) {
        ctx.save();
        ctx.globalAlpha = intensity;
        ctx.fillStyle = '#fff';
        
        this.snowflakes.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;

            // Interactive push away from cursor
            this.applyMouseRepulsion(p, 80, 2);

            // Recycle
            if (p.y > this.height + 10) { p.y = -10; p.x = Math.random() * this.width; }
            if (p.x > this.width + 10) p.x = -10;
            if (p.x < -10) p.x = this.width + 10;

            ctx.globalAlpha = p.opacity * intensity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawRain(ctx, intensity) {
        ctx.save();
        ctx.strokeStyle = `rgba(180, 200, 255, ${0.5 * intensity})`;
        ctx.lineWidth = 1;
        
        this.raindrops.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX; // Slight wind

            // Recycle
            if (p.y > this.height + 20) { p.y = -20; p.x = Math.random() * this.width; }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawBirds(ctx) {
        const time = performance.now() * 0.001;
        ctx.save();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        this.birds.forEach(p => {
            // Randomly activate birds
            if (!p.active && Math.random() < 0.002) p.active = true;

            if (p.active) {
                p.x += p.speed;
                p.wingPhase += 0.1;
                const wingY = Math.sin(p.wingPhase) * p.size;

                // Draw simple "V" or "M" bird shape
                ctx.beginPath();
                ctx.moveTo(p.x - p.size, p.y + wingY);
                ctx.quadraticCurveTo(p.x - p.size/2, p.y, p.x, p.y);
                ctx.quadraticCurveTo(p.x + p.size/2, p.y, p.x + p.size, p.y + wingY);
                ctx.stroke();

                // Deactivate and reset when off screen
                if (p.x > this.width + 50) {
                    p.active = false;
                    p.x = -50;
                    p.y = 50 + Math.random() * (this.height * 0.3);
                }
            }
        });
        ctx.restore();
    }
}