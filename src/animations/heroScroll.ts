import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlightPathData } from './flightPathMath';
import { HERO_STATS } from '../data/heroData';
import { PaperRocketHandle } from '../components/Hero/PaperRocket';

gsap.registerPlugin(ScrollTrigger);

export interface HeroScrollTargets {
  pinTriggerEl: HTMLElement;
  letterEls: Array<HTMLSpanElement | null>;
  letterTickEls: Array<HTMLSpanElement | null>;
  statValueEls: Array<HTMLSpanElement | null>;
  statBarEls: Array<HTMLDivElement | null>;
  statDotEls: Array<HTMLSpanElement | null>;
  trailPathEl: SVGPathElement | null;
  trailGlowPathEl: SVGPathElement | null;
  compassSvgEl: SVGSVGElement | null;
  progressTextEl: HTMLSpanElement | null;
  flightPathData: FlightPathData;
  paperRocketRef: React.RefObject<PaperRocketHandle | null>;
  onProgressUpdate?: (progress: number) => void;
  isReducedMotion: boolean;
}

/**
 * Creates the SINGLE master GSAP + ScrollTrigger scrub timeline that directly
 * controls the entire hero experience:
 * - Paper rocket flight path & aerodynamic banking/pitch
 * - Progressive SVG flight trail drawing
 * - Sequential letter-by-letter activation (W E L C O M E  I T Z F I Z Z)
 *   synchronized with the exact scroll progress when the rocket reaches each letter
 * - Progressive emphasis of the 4 bottom editorial statistics
 * - Subtle blueprint background response
 */
export function createHeroMasterScrollTimeline(
  targets: HeroScrollTargets
): gsap.Context {
  return gsap.context(() => {
    const {
      pinTriggerEl,
      letterEls,
      letterTickEls,
      statValueEls,
      statBarEls,
      statDotEls,
      trailPathEl,
      trailGlowPathEl,
      compassSvgEl,
      progressTextEl,
      flightPathData,
      paperRocketRef,
      onProgressUpdate,
      isReducedMotion,
    } = targets;

    const totalLen = Math.max(flightPathData.totalSvgLength, 1);
    const playhead = { progress: 0 };

    // Ensure initial states before timeline scrubbing
    if (trailPathEl) {
      gsap.set(trailPathEl, {
        strokeDasharray: totalLen,
        strokeDashoffset: totalLen,
      });
    }
    if (trailGlowPathEl) {
      gsap.set(trailGlowPathEl, {
        strokeDasharray: totalLen,
        strokeDashoffset: totalLen,
      });
    }

    letterEls.forEach((el) => {
      if (el) {
        gsap.set(el, { color: '#D2CDC2', y: 0, scale: 1 });
      }
    });
    letterTickEls.forEach((el) => {
      if (el) {
        gsap.set(el, { opacity: 0, scale: 0.4 });
      }
    });

    statBarEls.forEach((bar) => {
      if (bar) {
        gsap.set(bar, { scaleX: 0 });
      }
    });
    statValueEls.forEach((val) => {
      if (val) {
        gsap.set(val, { color: '#9E988E', y: 0 });
      }
    });
    statDotEls.forEach((dot) => {
      if (dot) {
        gsap.set(dot, { backgroundColor: '#CFCAC0', scale: 1 });
      }
    });

    // ONE Master Timeline bound directly to user scroll with slower, more deliberate scroll distance
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: pinTriggerEl,
        start: 'top top',
        end: isReducedMotion ? '+=320%' : '+=560%',
        pin: true,
        scrub: isReducedMotion ? 0.25 : 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // 1. Master 0 -> 1 normalized progress driver for the 3D Paper Airplane & live readout
    masterTl.to(
      playhead,
      {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => {
          const p = playhead.progress;
          paperRocketRef.current?.updateFlightState(p, 1);
          if (progressTextEl) {
            const pct = Math.round(p * 100);
            progressTextEl.textContent = `${pct.toString().padStart(2, '0')}%`;
          }
          onProgressUpdate?.(p);
        },
      },
      0
    );

    // 2. Subtle Flight Trail behind the paper airplane (0 -> 1 duration)
    if (trailPathEl) {
      masterTl.to(
        trailPathEl,
        {
          strokeDashoffset: 0,
          duration: 1,
          ease: 'none',
        },
        0
      );
    }
    if (trailGlowPathEl) {
      masterTl.to(
        trailGlowPathEl,
        {
          strokeDashoffset: 0,
          duration: 1,
          ease: 'none',
        },
        0
      );
    }

    // 3. Letter-by-letter activation synchronized to the exact scroll progress
    //    when the paper rocket reaches each character
    flightPathData.letterThresholds.forEach((threshold, idx) => {
      const letterEl = letterEls[idx];
      const tickEl = letterTickEls[idx];
      const startAt = Math.max(0, threshold - 0.022);
      const dur = 0.042;

      if (letterEl) {
        masterTl.to(
          letterEl,
          {
            color: '#141413',
            y: isReducedMotion ? 0 : -4,
            scale: isReducedMotion ? 1 : 1.025,
            duration: dur,
            ease: 'power2.out',
          },
          startAt
        );
      }

      if (tickEl) {
        masterTl.to(
          tickEl,
          {
            opacity: 1,
            scale: 1,
            duration: dur,
            ease: 'back.out(2)',
          },
          startAt + 0.008
        );
      }
    });

    // 4. Progressive Statistics activation along the same master timeline
    HERO_STATS.forEach((stat, idx) => {
      const valEl = statValueEls[idx];
      const barEl = statBarEls[idx];
      const dotEl = statDotEls[idx];
      const statStart = Math.max(0, stat.activationProgress - 0.1);
      const statDur = 0.14;

      if (barEl) {
        masterTl.to(
          barEl,
          {
            scaleX: 1,
            duration: statDur,
            ease: 'power1.inOut',
          },
          statStart
        );
      }

      if (valEl) {
        masterTl.to(
          valEl,
          {
            color: '#141413',
            y: isReducedMotion ? 0 : -2,
            duration: statDur * 0.85,
            ease: 'power2.out',
          },
          statStart + 0.02
        );
      }

      if (dotEl) {
        masterTl.to(
          dotEl,
          {
            backgroundColor: '#C85A32',
            scale: isReducedMotion ? 1 : 1.25,
            duration: statDur * 0.7,
            ease: 'power2.out',
          },
          statStart + 0.02
        );
      }
    });

    // 5. Very subtle blueprint background response
    if (compassSvgEl && !isReducedMotion) {
      masterTl.to(
        compassSvgEl,
        {
          y: -16,
          rotation: 1.8,
          transformOrigin: '50% 50%',
          duration: 1,
          ease: 'none',
        },
        0
      );
    }
  });
}
