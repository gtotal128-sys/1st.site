// sky.js - Draws the dynamic sky, sun trajectory, and atmospheric clouds

export class SkyManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.horizonY = height * 0.65; // Matches the scene.js ground line
        
        // Pre-generate cloud data so they don't randomly jump on frame updates
        this.clouds = this.generateClouds(6);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.horizonY = height * 0.65;
        this.clouds = this.generateClouds(6);
    }

    generateClouds(count) {
        const clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random() * this.width * 1.5 - this.width * 0.25, // Start some off-screen
                y: 30 + Math.random() * (this.horizonY * 0.5), // Keep in upper half
                width: 150 + Math.random() * 200,
                height: 40 + Math.random() * 40,
                speed: 0.1 + Math.random() * 0.3,
                opacity: 0.4 + Math.random() * 0.4
            });
        }
        return clouds;
    }

    // Main draw call from main.js
    draw(ctx, progress) {
        const time = performance.now() * 0.001;
        const colors = this.getSkyColors(progress);
        
        this.drawSkyGradient(ctx, colors);
        this.drawSun(ctx, progress, colors);
        this.drawClouds(ctx, colors, time);
    }

    // --- COLOR INTERPOLATION ENGINE ---
    getSkyColors(progress) {
        const palettes = [
            { // 0.00 - Summer (Vibrant blue, warm horizon)
                top: [100, 180, 235], 
                bottom: [255, 240, 210],
                sun: [255, 250, 220],
                sunGlow: [255, 200, 100]
            },
            { // 0.25 - Autumn (Golden hour, hazy orange)
                top: [170, 130, 100], 
                bottom: [240, 170, 90],
                sun: [240, 150, 50],
                sunGlow: [200, 100, 50]
            },
            { // 0.50 - Winter (Overcast, pale gray, no distinct sun)
                top: [180, 190, 200], 
                bottom: [210, 215, 220],
                sun: [220, 220, 225],
                sunGlow: [200, 200, 210]
            },
            { // 0.75 - Spring (Soft pastel blue, gentle warmth)
                top: [150, 200, 235], 
                bottom: [255, 235, 225],
                sun: [255, 240, 200],
                sunGlow: [255, 210, 150]
            }
        ];

        const p = progress * 4;
        const index = Math.floor(p) % 4;
        const nextIndex = (index + 1) % 4;
        const localProgress = p - Math.floor(p);

        const lerp = (a, b, t) => a + (b - a) * t;
        const lerpColor = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));

        return {
            top: lerpColor(palettes[index].top, palettes[nextIndex].top, localProgress),
            bottom: lerpColor(palettes[index].bottom, palettes[nextIndex].bottom, localProgress),
            sun: lerpColor(palettes[index].sun, palettes[nextIndex].sun, localProgress),
            sunGlow: lerpColor(palettes[index].sunGlow, palettes[nextIndex].sunGlow, localProgress)
        };
    }

    // --- DRAWING COMPONENTS ---

    drawSkyGradient(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.horizonY);
        const [r1, g1, b1] = colors.top;
        const [r2, g2, b2] = colors.bottom;
        
        gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
        gradient.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.horizonY + 20); // Slight overlap to prevent gaps
    }

    drawSun(ctx, progress, colors) {
        // Sun trajectory: High in summer, sets in autumn, hidden in winter, rises in spring
        // Y position logic
        let sunY;
        if (progress <= 0.25) { // Summer to Autumn
            sunY = this.lerp(this.height * 0.15, this.horizonY * 0.7, progress / 0.25);
        } else if (progress <= 0.5) { // Autumn to Winter (Drops below horizon)
            sunY = this.lerp(this.horizonY * 0.7, this.horizonY + 50, (progress - 0.25) / 0.25);
        } else if (progress <= 0.75) { // Winter to Spring (Below horizon, then rises)
            sunY = this.lerp(this.horizonY + 50, this.horizonY * 0.6, (progress - 0.5) / 0.25);
        } else { // Spring to Summer (Rises high)
            sunY = this.lerp(this.horizonY * 0.6, this.height * 0.15, (progress - 0.75) / 0.25);
        }

        // X position logic (Travels slowly across the screen)
        const sunX = this.width * 0.2 + (progress * this.width * 0.6);
        const sunRadius = 30 + Math.sin(progress * Math.PI * 2) * 10; // Pulses slightly

        // If the sun is below the mountains, don't draw it
        if (sunY > this.horizonY) return;

        // Determine intensity (fades out as it sets or in winter)
        let intensity = 1.0;
        if (progress > 0.4 && progress < 0.6) intensity = 0.3; // Dim in winter

        // Draw Outer Glow (Atmospheric scattering)
        const [gr, gg, gb] = colors.sunGlow;
        const glowRadius = sunRadius * 8;
        const glow = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, glowRadius);
        glow.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, ${0.4 * intensity})`);
        glow.addColorStop(0.5, `rgba(${gr}, ${gg}, ${gb}, ${0.1 * intensity})`);
        glow.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        
        ctx.fillStyle = glow;
        ctx.fillRect(sunX - glowRadius, sunY - glowRadius, glowRadius * 2, glowRadius * 2);

        // Draw Sun Core
        const [sr, sg, sb] = colors.sun;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${0.9 * intensity})`;
        ctx.fill();
    }

    drawClouds(ctx, colors, time) {
        ctx.save();
        
        this.clouds.forEach(cloud => {
            // Move cloud
            cloud.x += cloud.speed;
            
            // Wrap around screen
            if (cloud.x > this.width + cloud.width) {
                cloud.x = -cloud.width;
            }

            // Cloud color: Blend between white and the sky's top color for depth
            const [tr, tg, tb] = colors.top;
            const cloudR = Math.min(255, tr + 60);
            const cloudG = Math.min(255, tg + 60);
            const cloudB = Math.min(255, tb + 60);

            ctx.fillStyle = `rgba(${cloudR}, ${cloudG}, ${cloudB}, ${cloud.opacity * 0.6})`;
            
            // Draw cloud as a cluster of soft overlapping ellipses
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cloud.x - cloud.width * 0.25, cloud.y + 5, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.25, cloud.y + 5, cloud.width / 3.5, cloud.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // Simple linear interpolation helper
    lerp(start, end, t) {
        return start + (end - start) * Math.max(0, Math.min(1, t));
    }
}