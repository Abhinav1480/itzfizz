# ITZFIZZ Digital — Scroll-Driven Hero Section Animation

**Assignment:** Web Development Internship — Scroll-Driven Hero Section Animation  
**Company:** ITZFIZZ Digital  

---

## 1. Concept & Creative Direction

This project delivers an original, scroll-controlled hero experience designed around **one tactile 3D folded paper airplane** gliding through an editorial studio composition.

The narrative follows a single continuous scroll-controlled sequence:

1. **Page Load Intro:** The `ITZFIZZ` brand mark, studio classification label, letter-spaced `W E L C O M E  I T Z F I Z Z` headline, supporting copy, and four editorial metrics sequentially reveal while the 3D folded paper airplane enters from depth and settles in the upper-right launch zone.
2. **Direct Scroll Control (`0% → 100%`):** As the user scrolls, the paper airplane lifts slightly, curves across the upper field, dips toward the left of `W`, and glides directly through the visual region of `W E L C O M E` and `I T Z F I Z Z`.
3. **Cause-and-Effect Letter Activation:** Each of the 14 headline characters (`W-E-L-C-O-M-E-I-T-Z-F-I-Z-Z`) is individually measured in the DOM and tied to the exact scroll progress where the paper airplane reaches its coordinates.
4. **Progressive Flight Trail & Metrics:** A delicate warm sienna ink trail draws behind the airplane while the four bottom statistics (`+58%`, `+32%`, `+41%`, `+27%`) progressively emphasize along the same master timeline.
5. **Hero Release:** At `100%` flight completion, the airplane gently climbs and settles before the pinned hero releases smoothly into the minimal architectural continuation section.

---

## 2. Key Features

- **Authentic 3D Folded Paper Airplane (`Three.js`):**
  - Constructed from multi-layered `BufferGeometry` panels representing a folded sheet of warm ivory cotton paper (`#FAF6EE`).
  - Features a raised center spine ridge, deep V-keel, double-folded nose layers (Nakamura lock geometry), upturned wingtip stabilizers, subtle handmade asymmetry, and a procedural cotton-fiber bump texture under 3-point soft studio lighting.
  - Strictly proportioned to remain small (`~13%–19%` of viewport width) so typography remains the dominant anchor.
- **Single Master ScrollTrigger Timeline (`GSAP` + `ScrollTrigger`):**
  - 100% scroll-scrubbed (`scrub: 0.65`, `end: '+=560%'`) with zero autonomous autoplay loops.
  - Stopping scroll immediately halts the airplane; scrolling backward reverses the airplane trajectory, retracts the SVG flight trail, and de-activates characters and metrics in reverse order.
- **DOM-Calibrated Trajectory Spline:**
  - Measures actual bounding boxes of all 14 headline letter spans on mount and resize to construct a `THREE.CatmullRomCurve3` trajectory that physically passes through every letter across Desktop, Tablet, and Mobile viewports.

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript (Vite)
- **Styling:** Tailwind CSS v4
- **Animation:** GSAP (`gsap` + `ScrollTrigger`)
- **3D Rendering:** Three.js (`WebGLRenderer`, custom `BufferGeometry`, procedural `CanvasTexture`, `PCFSoftShadowMap`)
- **Typography:** `Syne` (Display), `Plus Jakarta Sans` (Editorial Body), `JetBrains Mono` (Tabular Numerals & Technical Coordinates)

---

## 4. Project Structure

```text
src/
  animations/
    flightPathMath.ts       # Catmull-Rom 3D spline + DOM letter threshold solver
    heroIntro.ts            # Initial page-load GSAP timeline
    heroScroll.ts           # Single master ScrollTrigger scrub timeline
  components/
    Hero/
      BlueprintBackground.tsx # Architectural grid, datum lines, and drafting arcs
      FlightTrail.tsx         # Progressive SVG ink flight path behind the rocket
      Hero.tsx                # Pin container, DOM measurement, and lifecycle management
      HeroHeadline.tsx        # Individually targetable W E L C O M E / I T Z F I Z Z letters
      HeroStats.tsx           # 4 bottom placeholder metrics with scroll progress bars
      PaperRocket.tsx         # Three.js folded paper airplane model & studio lighting
    Navigation/
      Navigation.tsx          # Top bar with brand mark, stage jump links, & motion toggle
    Studio/
      StudioSection.tsx       # Minimal second section demonstrating smooth hero release
  data/
    heroData.ts             # Headline character definitions & placeholder metrics
  App.tsx
  index.css
  main.tsx
```

---

## 5. Installation & Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Type-Check & Lint
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 6. Responsive Behavior & Accessibility

- **Responsive Re-Composition:**
  - **Desktop (`1440px`, `1280px`, `1024px`):** Full stepped two-row headline lockup with sweeping aerodynamic curve and 4-column bottom statistics.
  - **Tablet (`768px`) & Mobile (`430px`, `390px`):** Dynamically recomputes the 3D spline around stacked/compact letter coordinates, scales down rotation banking, and arranges metrics into a clean 2×2 editorial grid with zero horizontal overflow.
- **Reduced Motion (`prefers-reduced-motion: reduce`):**
  - Automatically detects OS reduced-motion preferences and provides an interactive `MOTION: FULL / REDUCED` toggle in the header.
  - Simplifies the flight curve, removes banking/pitch rotations, and preserves immediate readability and high-contrast typography.
- **WebGL Resilience:**
  - Includes `webglcontextlost` / `webglcontextrestored` listeners and a graceful 2D folded-paper SVG fallback if WebGL is unavailable.

---

## 7. Deployment & Links

- **Live Demo:** `[Insert Live Demo URL / GitHub Pages URL Here]`
- **GitHub Repository:** `[Insert GitHub Repository URL Here]`
