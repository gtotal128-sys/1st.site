// main.js - The orchestrator for the endless cycle

import { ScrollManager } from './scroll.js';
import { SkyManager } from './sky.js';
import { SceneManager } from './scene.js';
import { ParticleManager } from './particles.js';

// ==================== DOM ELEMENTS ====================
const entryScreen = document.querySelector('.entry-screen');
const canvas = document.getElementById('landscape-canvas');
const ctx = canvas.getContext('2d');
const storyQuote = document.querySelector('.story-quote');
const muteBtn = document.querySelector('.audio-toggle'); // Assuming we add this to HTML later

// ==================== STATE ====================
let isExperienceActive = false;
let animationFrameId = null;
let audioCtx = null;
let isMuted = false;
let lastQuoteIndex = -1;

// Audio specific state
let audioGains = [];
let audioSources = [];
let audioLoaded = false;

// ==================== MANAGERS ====================
let scrollManager;
let skyManager;
let sceneManager;
let particleManager;

// ==================== STORY DATA ====================
const seasonalQuotes = [
    { start: 0.00, end: 0.25, text: "Every bright day slowly welcomes a new tomorrow." },
    { start: 0.25, end: 0.50, text: "Every falling leaf makes room for new beginnings." },
    { start: 0.50, end: 0.75, text: "Even in stillness, life never stops growing." },
    { start: 0.75, end: 1.00, text: "Every ending quietly becomes a new beginning." }
];

// Audio track paths matching our plan structure
const audioTracks = [
    'assets/audio/summer-ambience.mp3',
    'assets/audio/autumn-ambience.mp3',
    'assets/audio/winter-ambience.mp3',
    'assets/audio/spring-ambience.mp3'
];

// ==================== CANVAS SETUP ====================
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    ctx.scale(dpr, dpr);
    
    canvas.logicalWidth = width;
    canvas.logicalHeight = height;
}

// ==================== AUDIO LOGIC ====================
function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn("Web Audio API is not supported.");
    }
}

async function loadAndPlayAudio() {
    if (!audioCtx) return;

    try {
        // Fetch all audio files concurrently
        const promises = audioTracks.map(url => fetch(url).then(res => res.arrayBuffer()));
        const arrayBuffers = await Promise.all(promises);

        // Decode and setup nodes for each track
        arrayBuffers.forEach((buffer, index) => {
            audioCtx.decodeAudioData(buffer, (decodedData) => {
                // Create a source that loops infinitely
                const source = audioCtx.createBufferSource();
                source.buffer = decodedData;
                source.loop = true;

                // Create a gain node to control volume for crossfading
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 0; // Start silent

                // Connect source -> gain -> destination
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                source.start(0); // Start playing immediately (but silent)

                audioSources.push(source);
                audioGains.push(gainNode);

                // If all 4 are loaded, flag as ready
                if (audioGains.length === 4) audioLoaded = true;
            });
        });
    } catch (error) {
        console.warn("Could not load ambient audio files.", error);
    }
}

function updateAudio(progress) {
    if (!audioLoaded || isMuted) return;

    // Calculate target volume for each season based on scroll progress
    // Peaks at 0.0, 0.25, 0.5, and 0.75
    const seasons = [0.0, 0.25, 0.5, 0.75];
    
    seasons.forEach((peak, index) => {
        const distance = Math.abs(progress - peak);
        // Volume fades down as you move away from the season's peak
        let targetVolume = Math.max(0, 1 - (distance * 4)); 
        targetVolume *= 0.6; // Keep overall volume calm and not overpowering

        // Smoothly ramp the volume to prevent audio clicks
        const currentTime = audioCtx.currentTime;
        audioGains[index].gain.cancelScheduledValues(currentTime);
        audioGains[index].gain.setValueAtTime(audioGains[index].gain.value, currentTime);
        audioGains[index].gain.linearRampToValueAtTime(targetVolume, currentTime + 0.5); // 0.5s crossfade
    });
}

function toggleMute() {
    if (!audioCtx) return;
    isMuted = !isMuted;
    
    audioGains.forEach(gain => {
        const currentTime = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(currentTime);
        gain.gain.setValueAtTime(gain.gain.value, currentTime);
        gain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.6, currentTime + 0.5);
    });
}

// ==================== ENTRY POINT ====================
function startExperience() {
    if (isExperienceActive) return;
    isExperienceActive = true;

    initAudio();
    entryScreen.classList.add('hidden');

    scrollManager = new ScrollManager();
    skyManager = new SkyManager(canvas.logicalWidth, canvas.logicalHeight);
    sceneManager = new SceneManager(canvas.logicalWidth, canvas.logicalHeight);
    particleManager = new ParticleManager(canvas.logicalWidth, canvas.logicalHeight);

    // Start loading and playing audio in the background
    loadAndPlayAudio();

    // Mouse interaction listener
    window.addEventListener('mousemove', (e) => {
        if (particleManager) {
            particleManager.updateMouse(e.clientX, e.clientY);
        }
    });

    window.addEventListener('mouseleave', () => {
        if (particleManager) {
            particleManager.updateMouse(-1000, -1000);
        }
    });

    // Mute button listener (if it exists in HTML)
    if (muteBtn) {
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger entry screen click
            toggleMute();
        });
    }

    animate();
}

// ==================== STORY QUOTE LOGIC ====================
function updateStoryQuote(progress) {
    let currentIndex = -1;

    for (let i = 0; i < seasonalQuotes.length; i++) {
        if (progress >= seasonalQuotes[i].start && progress < seasonalQuotes[i].end) {
            currentIndex = i;
            break;
        }
    }

    if (currentIndex !== lastQuoteIndex) {
        lastQuoteIndex = currentIndex;

        if (currentIndex >= 0) {
            storyQuote.classList.remove('visible');
            
            setTimeout(() => {
                storyQuote.textContent = `"${seasonalQuotes[currentIndex].text}"`;
                storyQuote.classList.add('visible');
            }, 800);
        } else {
            storyQuote.classList.remove('visible');
        }
    }
}

// ==================== THE HEARTBEAT (RENDER LOOP) ====================
function animate() {
    if (!isExperienceActive) return;

    const progress = scrollManager.getProgress();

    ctx.clearRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);

    skyManager.draw(ctx, progress);
    sceneManager.draw(ctx, progress);
    particleManager.updateAndDraw(ctx, progress);

    updateStoryQuote(progress);
    updateAudio(progress); // NEW: Crossfade audio every frame

    animationFrameId = requestAnimationFrame(animate);
}

// ==================== EVENT LISTENERS ====================
window.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    entryScreen.addEventListener('click', startExperience);
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setupCanvas();
        
        if (isExperienceActive) {
            skyManager.resize(canvas.logicalWidth, canvas.logicalHeight);
            sceneManager.resize(canvas.logicalWidth, canvas.logicalHeight);
            particleManager.resize(canvas.logicalWidth, canvas.logicalHeight);
        }
    }, 100);
});