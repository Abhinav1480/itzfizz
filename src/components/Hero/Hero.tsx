import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  buildFlightPathData,
  FlightPathData,
  ScreenPoint,
} from '../../animations/flightPathMath';
import { createHeroIntroAnimation } from '../../animations/heroIntro';
import { createHeroMasterScrollTimeline } from '../../animations/heroScroll';
import { BlueprintBackground } from './BlueprintBackground';
import { FlightTrail } from './FlightTrail';
import { HeroHeadline } from './HeroHeadline';
import { HeroStats } from './HeroStats';
import { PaperRocket, PaperRocketHandle } from './PaperRocket';

interface HeroProps {
  brandRef: React.RefObject<HTMLAnchorElement | null>;
  navLinksRef: React.RefObject<HTMLElement | null>;
  topLabelRef: React.RefObject<HTMLDivElement | null>;
  isReducedMotion: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  brandRef,
  navLinksRef,
  topLabelRef,
  isReducedMotion,
}) => {
  const pinSectionRef = useRef<HTMLElement | null>(null);
  const headlineContainerRef = useRef<HTMLDivElement | null>(null);
  const supportingCopyRef = useRef<HTMLDivElement | null>(null);
  const scrollBadgeRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLSpanElement | null>(null);
  const compassSvgRef = useRef<SVGSVGElement | null>(null);

  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const letterTickRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const statCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const statValueRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const statBarRefs = useRef<Array<HTMLDivElement | null>>([]);
  const statDotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const trailPathRef = useRef<SVGPathElement | null>(null);
  const trailGlowPathRef = useRef<SVGPathElement | null>(null);

  const paperRocketRef = useRef<PaperRocketHandle | null>(null);
  const flightPathRef = useRef<FlightPathData | null>(null);
  const currentScrollProgressRef = useRef<number>(0);
  const hasPlayedIntroRef = useRef<boolean>(false);

  const [viewportState, setViewportState] = useState<{
    width: number;
    height: number;
    svgPathD: string;
    totalSvgLength: number;
    startPos: { x: number; y: number };
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
    svgPathD: '',
    totalSvgLength: 1000,
    startPos: { x: 1180, y: 198 },
  });

  /**
   * Measures the exact bounding-box center of each of the 14 headline letters
   * relative to the pinned Hero viewport and recomputes the flight spline.
   */
  const measureAndBuildFlightPath = useCallback(() => {
    const heroEl = pinSectionRef.current;
    if (!heroEl) return null;

    const heroRect = heroEl.getBoundingClientRect();
    const w = Math.max(heroEl.clientWidth || heroRect.width, 320);
    const h = Math.max(heroEl.clientHeight || heroRect.height, 480);

    const measuredCenters: ScreenPoint[] = [];
    for (let i = 0; i < 14; i++) {
      const span = letterRefs.current[i];
      if (span) {
        const r = span.getBoundingClientRect();
        measuredCenters.push({
          x: r.left - heroRect.left + r.width * 0.5,
          y: r.top - heroRect.top + r.height * 0.44,
        });
      }
    }

    const pathData = buildFlightPathData(w, h, measuredCenters, isReducedMotion);
    flightPathRef.current = pathData;

    const initialPose = pathData.samplePoseAt(0);
    setViewportState({
      width: w,
      height: h,
      svgPathD: pathData.svgPathD,
      totalSvgLength: pathData.totalSvgLength,
      startPos: { x: initialPose.x, y: initialPose.y },
    });

    return { pathData, w, h };
  }, [isReducedMotion]);

  // Run initial entrance animation once on mount
  useEffect(() => {
    if (hasPlayedIntroRef.current) return;
    hasPlayedIntroRef.current = true;

    const introCtx = createHeroIntroAnimation({
      brandEl: brandRef.current,
      topLabelEl: topLabelRef.current,
      navLinksEl: navLinksRef.current,
      letterEls: letterRefs.current,
      supportingCopyEl: supportingCopyRef.current,
      scrollBadgeEl: scrollBadgeRef.current,
      statCardEls: statCardRefs.current,
      paperRocketRef,
      getScrollProgress: () => currentScrollProgressRef.current,
      isReducedMotion,
    });

    return () => {
      introCtx.revert();
    };
  }, [brandRef, navLinksRef, topLabelRef, isReducedMotion]);

  // Build flight path & master ScrollTrigger timeline on mount, resize, and reduced-motion change
  useEffect(() => {
    const heroEl = pinSectionRef.current;
    if (!heroEl) return;

    let scrollCtx: ReturnType<typeof createHeroMasterScrollTimeline> | null = null;

    const setupScrollExperience = () => {
      if (scrollCtx) {
        scrollCtx.revert();
        scrollCtx = null;
      }

      const result = measureAndBuildFlightPath();
      if (!result) return;

      scrollCtx = createHeroMasterScrollTimeline({
        pinTriggerEl: heroEl,
        letterEls: letterRefs.current,
        letterTickEls: letterTickRefs.current,
        statValueEls: statValueRefs.current,
        statBarEls: statBarRefs.current,
        statDotEls: statDotRefs.current,
        trailPathEl: trailPathRef.current,
        trailGlowPathEl: trailGlowPathRef.current,
        compassSvgEl: compassSvgRef.current,
        progressTextEl: progressTextRef.current,
        flightPathData: result.pathData,
        paperRocketRef,
        onProgressUpdate: (p) => {
          currentScrollProgressRef.current = p;
        },
        isReducedMotion,
      });

      // Ensure 3D rocket renders immediately at current scroll progress
      paperRocketRef.current?.updateFlightState(
        currentScrollProgressRef.current,
        1
      );
    };

    // Initial setup + font-ready recalculation so letter positions are pixel-accurate
    setupScrollExperience();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setupScrollExperience();
        ScrollTrigger.refresh();
      });
    }

    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setupScrollExperience();
        ScrollTrigger.refresh();
      }, 120);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (scrollCtx) {
        scrollCtx.revert();
      }
    };
  }, [measureAndBuildFlightPath, isReducedMotion]);

  return (
    <section
      id="hero-top"
      ref={pinSectionRef}
      aria-label="ITZFIZZ Interactive Paper Rocket Hero"
      className="relative flex h-screen min-h-[600px] w-full flex-col justify-between overflow-hidden bg-[#F6F3EC]"
    >
      {/* 1. Subtle Blueprint Grid & Technical Coordinates */}
      <BlueprintBackground ref={compassSvgRef} />

      {/* 2. Scroll-Controlled Flight Trail behind the Paper Airplane */}
      <FlightTrail
        svgPathD={viewportState.svgPathD}
        totalLength={viewportState.totalSvgLength}
        width={viewportState.width}
        height={viewportState.height}
        trailPathRef={trailPathRef}
        trailGlowPathRef={trailGlowPathRef}
        startMarkerPos={viewportState.startPos}
      />

      {/* 3. Main Letter-Spaced Headline (W E L C O M E / I T Z F I Z Z) */}
      <HeroHeadline
        letterRefs={letterRefs}
        letterTickRefs={letterTickRefs}
        headlineContainerRef={headlineContainerRef}
        supportingCopyRef={supportingCopyRef}
        scrollBadgeRef={scrollBadgeRef}
        progressTextRef={progressTextRef}
      />

      {/* 4. 3D Folded Paper Airplane (Three.js WebGL Layer) */}
      <PaperRocket
        ref={paperRocketRef}
        flightPathRef={flightPathRef}
        containerSize={{
          width: viewportState.width,
          height: viewportState.height,
        }}
        isReducedMotion={isReducedMotion}
      />

      {/* 5. Bottom Editorial Statistics (Sequentially revealed & scroll-emphasized) */}
      <HeroStats
        statCardRefs={statCardRefs}
        statValueRefs={statValueRefs}
        statBarRefs={statBarRefs}
        statDotRefs={statDotRefs}
      />
    </section>
  );
};
