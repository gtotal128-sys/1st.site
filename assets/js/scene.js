// scene.js - Draws the living landscape (Mountains, Ground, River, Trees, Grass)

export class SceneManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundY = height * 0.65; // Where the horizon meets the valley floor
        
        // Pre-generate random positions for trees and grass so they don't jitter on redraw
        this.trees = this.generateTrees(12);
        this.grassBlades = this.generateGrass(150);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.groundY = height * 0.65;
        // Regenerate positions based on new dimensions
        this.trees = this.generateTrees(12);
        this.grassBlades = this.generateGrass(150);
    }

    generateTrees(count) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            trees.push({
                x: (this.width / (count - 1)) * i + (Math.random() * 40 - 20),
                baseY: this.groundY + Math.random() * 20,
                height: 80 + Math.random() * 60,
                width: 40 + Math.random() * 30,
                depth: Math.random() // 0 = far back, 1 = very front
            });
        }
        // Sort by depth so far trees are drawn first
        return trees.sort((a, b) => a.depth - b.depth);
    }

    generateGrass(count) {
        const blades = [];
        for (let i = 0; i < count; i++) {
            blades.push({
                x: Math.random() * this.width,
                y: this.groundY + Math.random() * (this.height - this.groundY),
                height: 10 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2 // For wind animation offset
            });
        }
        return blades;
    }

    // Main draw call from main.js
    draw(ctx, progress) {
        const colors = this.getSeasonColors(progress);
        const time = performance.now() * 0.001; // For wind/sway animations

        this.drawMountains(ctx, colors);
        this.drawGround(ctx, colors);
        this.drawRiver(ctx, colors, time);
        this.drawGrass(ctx, colors, time);
        this.drawTrees(ctx, colors, time);
    }

    // --- COLOR INTERPOLATION ENGINE ---
    // Maps 0.0-1.0 progress into the 4 seasons and smoothly blends them
    getSeasonColors(progress) {
        const seasons = [
            { // 0.00 - Summer
                mountain: [120, 140, 160], ground: [86, 160, 72], 
                river: [100, 180, 255], leaf: [50, 140, 50], leafOpacity: 1
            },
            { // 0.25 - Autumn
                mountain: [140, 120, 110], ground: [180, 140, 60], 
                river: [80, 130, 180], leaf: [210, 105, 30], leafOpacity: 0.9
            },
            { // 0.50 - Winter
                mountain: [200, 210, 220], ground: [220, 225, 230], 
                river: [180, 200, 220], leaf: [100, 100, 100], leafOpacity: 0 // Bare
            },
            { // 0.75 - Spring
                mountain: [140, 170, 150], ground: [140, 200, 120], 
                river: [110, 190, 240], leaf: [255, 180, 200], leafOpacity: 1 // Blossoms
            }
        ];

        // Calculate loop position (handles the seamless jump from Spring back to Summer)
        const p = progress * 4;
        const index = Math.floor(p) % 4;
        const nextIndex = (index + 1) % 4;
        const localProgress = p - Math.floor(p);

        const lerp = (a, b, t) => a + (b - a) * t;
        const lerpColor = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));

        return {
            mountain: lerpColor(seasons[index].mountain, seasons[nextIndex].mountain, localProgress),
            ground: lerpColor(seasons[index].ground, seasons[nextIndex].ground, localProgress),
            river: lerpColor(seasons[index].river, seasons[nextIndex].river, localProgress),
            leaf: lerpColor(seasons[index].leaf, seasons[nextIndex].leaf, localProgress),
            leafOpacity: lerp(seasons[index].leafOpacity, seasons[nextIndex].leafOpacity, localProgress)
        };
    }

    // --- DRAWING COMPONENTS ---

    drawMountains(ctx, colors) {
        const [r, g, b] = colors.mountain;
        
        // Back Mountain (Lighter/Hazier)
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.bezierCurveTo(this.width * 0.2, this.groundY - 200, this.width * 0.4, this.groundY - 250, this.width * 0.6, this.groundY - 180);
        ctx.bezierCurveTo(this.width * 0.8, this.groundY - 120, this.width * 0.9, this.groundY - 160, this.width, this.groundY - 100);
        ctx.lineTo(this.width, this.groundY);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r+40}, ${g+40}, ${b+40}, 0.6)` // Pushed towards white for atmospheric depth
        ctx.fill();

        // Front Mountain (Darker)
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.bezierCurveTo(this.width * 0.1, this.groundY - 120, this.width * 0.3, this.groundY - 180, this.width * 0.5, this.groundY - 140);
        ctx.bezierCurveTo(this.width * 0.7, this.groundY - 100, this.width * 0.9, this.groundY - 150, this.width, this.groundY - 80);
        ctx.lineTo(this.width, this.groundY);
        ctx.closePath();
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
    }

    drawGround(ctx, colors) {
        const [r, g, b] = colors.ground;
        const gradient = ctx.createLinearGradient(0, this.groundY, 0, this.height);
        gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
        gradient.addColorStop(1, `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`); // Darker at bottom

        ctx.beginPath();
        // Slightly rolling ground line
        ctx.moveTo(0, this.groundY + 10);
        ctx.bezierCurveTo(this.width * 0.3, this.groundY - 10, this.width * 0.7, this.groundY + 20, this.width, this.groundY);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawRiver(ctx, colors, time) {
        const [r, g, b] = colors.river;
        ctx.beginPath();
        ctx.moveTo(this.width * 0.4, this.groundY + 20);
        
        // Winding river using sine waves for gentle flow
        for (let y = this.groundY + 20; y < this.height; y += 5) {
            const xOffset = Math.sin((y * 0.02) + time) * 30;
            ctx.lineTo(this.width * 0.45 + xOffset, y);
        }
        
        // Return path to close the shape
        for (let y = this.height; y > this.groundY + 20; y -= 5) {
            const xOffset = Math.sin((y * 0.02) + time) * 30;
            ctx.lineTo(this.width * 0.55 + xOffset, y);
        }
        ctx.closePath();

        // Add shimmer/reflection effect
        const riverGradient = ctx.createLinearGradient(this.width * 0.4, 0, this.width * 0.6, 0);
        riverGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
        riverGradient.addColorStop(0.5, `rgba(${Math.min(255, r+40)}, ${Math.min(255, g+40)}, ${Math.min(255, b+40)}, 0.9)`);
        riverGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.6)`);

        ctx.fillStyle = riverGradient;
        ctx.fill();
    }

    drawTrees(ctx, colors, time) {
        const [r, g, b] = colors.leaf;
        const opacity = colors.leafOpacity;

        this.trees.forEach(tree => {
            const scale = 0.5 + tree.depth * 0.5; // Far trees are smaller
            const windSway = Math.sin(time * 2 + tree.x) * (3 * scale); // Subtle sway

            ctx.save();
            ctx.translate(tree.x + windSway, tree.baseY);
            ctx.scale(scale, scale);

            // Trunk
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(-8, -tree.height);
            ctx.lineTo(8, -tree.height);
            ctx.lineTo(5, 0);
            ctx.closePath();
            ctx.fillStyle = `rgb(80, 50, 30)`;
            ctx.fill();

            // Canopy / Leaves
            if (opacity > 0.01) {
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                // Organic, slightly lumpy circle for canopy
                ctx.ellipse(0, -tree.height - (tree.width/2), tree.width/2, tree.width/1.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                
                // Soft shadow for painterly depth
                ctx.shadowColor = `rgba(0,0,0,0.2)`;
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;
                
                ctx.fill();
                ctx.shadowColor = 'transparent'; // Reset shadow
                ctx.globalAlpha = 1.0;
            } else {
                // Draw bare winter branches if no leaves
                this.drawBranches(ctx, tree.height, tree.width);
            }

            ctx.restore();
        });
    }

    drawBranches(ctx, height, width) {
        ctx.strokeStyle = 'rgb(60, 40, 20)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        const startY = -height;
        const branchLength = width * 0.6;

        // Left branch
        ctx.beginPath();
        ctx.moveTo(0, startY);
        ctx.quadraticCurveTo(-branchLength/2, startY - 10, -branchLength, startY - 30);
        ctx.stroke();

        // Right branch
        ctx.beginPath();
        ctx.moveTo(0, startY + 15);
        ctx.quadraticCurveTo(branchLength/2, startY + 5, branchLength * 0.8, startY - 15);
        ctx.stroke();
    }

    drawGrass(ctx, colors, time) {
        const [r, g, b] = colors.ground;
        // Make grass slightly darker than the ground
        const grassColor = `rgb(${Math.max(0, r-20)}, ${Math.max(0, g-20)}, ${Math.max(0, b-10)})`;
        
        ctx.strokeStyle = grassColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        this.grassBlades.forEach(blade => {
            const windEffect = Math.sin(time * 1.5 + blade.phase) * 5;
            
            ctx.beginPath();
            ctx.moveTo(blade.x, blade.y);
            ctx.quadraticCurveTo(
                blade.x + windEffect, 
                blade.y - blade.height / 2, 
                blade.x + windEffect * 1.5, 
                blade.y - blade.height
            );
            ctx.stroke();
        });
    }
}