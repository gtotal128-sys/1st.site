// scroll.js - Handles the infinite scroll loop and progress calculation

export class ScrollManager {
    constructor() {
        this.isTeleporting = false;
        this.calculateDimensions();
    }

    // Recalculate on window resize
    calculateDimensions() {
        const vh = window.innerHeight;
        
        // The buffer is 1 full viewport height. 
        // Because progress 0.0 (Summer) and 1.0 (Summer again) look identical,
        // jumping instantly across 1 viewport height is completely invisible to the user.
        this.buffer = vh; 
        
        // The actual distance required to scroll through all 4 seasons
        this.cycleDistance = vh * 4; 
        
        // The absolute maximum scroll position before we trigger the loop reset
        this.maxScrollBeforeReset = this.buffer + this.cycleDistance;
    }

    // Called by main.js on every animation frame
    getProgress() {
        // If we just teleported, ignore scroll jank for 1 frame
        if (this.isTeleporting) {
            this.isTeleporting = false;
            return 0; // Default to summer during the micro-second jump
        }

        let scrollY = window.scrollY;

        // --- INFINITE LOOP LOGIC ---

        // 1. Scrolled past the bottom (Spring -> Summer transition)
        if (scrollY >= this.maxScrollBeforeReset) {
            this.isTeleporting = true;
            // Jump back to the top of the cycle seamlessly
            window.scrollTo(0, this.buffer + 1); 
            scrollY = this.buffer + 1;
        }

        // 2. Scrolled past the top (Summer -> Spring backwards transition)
        if (scrollY <= this.buffer) {
            this.isTeleporting = true;
            // Jump to the bottom of the cycle seamlessly
            window.scrollTo(0, this.maxScrollBeforeReset - 1);
            scrollY = this.maxScrollBeforeReset - 1;
        }

        // --- PROGRESS CALCULATION ---
        // Subtract the buffer, divide by cycle distance to get a 0.0 to 1.0 value
        const rawProgress = (scrollY - this.buffer) / this.cycleDistance;

        // Clamp between 0 and 1 just to be absolutely safe against browser quirks
        return Math.max(0, Math.min(1, rawProgress));
    }

    // Optional: Allow programmatic scrolling if needed later (e.g., skip to winter)
    scrollToProgress(targetProgress) {
        const targetY = this.buffer + (targetProgress * this.cycleDistance);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
}