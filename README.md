# Seasons — An Endless Cycle

An award-worthy interactive storytelling website that captures the beauty of nature through a continuous, living landscape. Instead of a conventional website, this experience feels like walking through an animated painting where time quietly changes everything.

## The Experience

The website follows one beautiful valley through the four seasons. Instead of loading separate scenes, the same landscape transforms naturally as the visitor scrolls. Every tree, flower, cloud, river, mountain, and beam of sunlight evolves with time, creating one endless journey.

The experience begins in **Summer**, transitions into **Autumn**, rests in **Winter**, blossoms into **Spring**, and finally returns seamlessly to Summer, creating an infinite loop.

### Key Features

- **Infinite Scroll Loop:** Custom scroll-jacking math creates a seamless, unbreakable loop through the seasons with native browser momentum.
- **Living Canvas:** HTML5 Canvas renders a painterly world with dynamic skies, winding rivers, swaying grass, and evolving trees.
- **Interactive Particles:** 
  - Summer evenings glow with fireflies.
  - Autumn leaves swirl around your cursor.
  - Winter snowflakes are pushed away by your mouse.
  - Spring brings unexpected rain.
- **Cinematic Audio Crossfade:** 4 separate ambient tracks seamlessly blend into one another as the landscape changes, unlocked gracefully on the first click.
- **Invisible UI:** No scrollbars, no page breaks, no jarring transitions. Only nature and poetic storytelling.

## Local Setup

Because this project uses modern JavaScript Modules (`type="module"`) and the `fetch` API for audio loading, **you cannot just double-click `index.html` to open it.** It requires a local web server to prevent CORS errors.

**Option 1: VS Code Live Server (Recommended)**
1. Open this folder in Visual Studio Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and select "Open with Live Server".

**Option 2: Python**
If you have Python installed, open your terminal in the project root and run:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

**Option 3: Node.js**
If you have Node installed, run:
```bash
npx serve .
```

## Project Structure

```text
├── assets/
│   ├── css/
│   │   ├── style.css          (Typography, UI, resets)
│   │   └── layout.css         (Canvas locking, invisible scroll track)
│   ├── js/
│   │   ├── main.js            (Orchestrator, audio, quotes, mouse events)
│   │   ├── scene.js           (Mountains, trees, river, ground)
│   │   ├── scroll.js          (Infinite loop math)
│   │   ├── particles.js       (Leaves, snow, rain, fireflies, birds)
│   │   ├── sky.js             (Sun trajectory, clouds, gradients)
│   │   └── utils.js           (Math and color interpolation helpers)
│   ├── audio/
│   │   ├── summer-ambience.mp3
│   │   ├── autumn-ambience.mp3
│   │   ├── winter-ambience.mp3
│   │   └── spring-ambience.mp3
│   └── textures/
│       └── (Optional: noise.png for painterly grain)
├── index.html                  (Single page entry point)
└── README.md
```

## Note on Assets

To complete the immersion, you will need to add your own audio files to the `assets/audio/` folder. If you want the subtle painterly grain overlay to work, add a seamless `noise.png` to `assets/textures/`. If these files are missing, the experience will still run perfectly, just without those specific layers.

---

*Designed to leave visitors feeling peaceful, nostalgic, and inspired—as though they have just taken a quiet walk through nature itself.*
```

*(This is the final file in our required plan structure. Tell me if you would like to make any adjustments or if you are ready to test!)*