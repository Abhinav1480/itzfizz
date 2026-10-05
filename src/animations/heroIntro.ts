import gsap from 'gsap';
import { PaperRocketHandle } from '../components/Hero/PaperRocket';

export interface HeroIntroTargets {
  brandEl: HTMLElement | null;
  topLabelEl: HTMLElement | null;
  navLinksEl: HTMLElement | null;
  letterEls: Array<HTMLSpanElement | null>;
  supportingCopyEl: HTMLElement | null;
  scrollBadgeEl: HTMLElement | null;
  statCardEls: Array<HTMLDivElement | null>;
  paperRocketRef: React.RefObject<PaperRocketHandle | null>;
  getScrollProgress: () => number;
  isReducedMotion: boolean;
}

/**
 * Runs the initial premium page-load entrance sequence:
 * 1. ITZFIZZ branding appears
 * 2. Small top label appears
 * 3. Headline reveals with subtle translateY + stagger
 * 4. Supporting text appears
 * 5. Statistics appear one by one sequentially
 * 6. Paper rocket enters from right/depth and settles into starting position
 */
export function createHeroIntroAnimation(targets: HeroIntroTargets): gsap.Context {
  return gsap.context(() => {
    const {
      brandEl,
      topLabelEl,
      navLinksEl,
      letterEls,
      supportingCopyEl,
      scrollBadgeEl,
      statCardEls,
      paperRocketRef,
      getScrollProgress,
      isReducedMotion,
    } = targets;

    const validLetters = letterEls.filter((el): el is HTMLSpanElement => el !== null);
    const validStats = statCardEls.filter((el): el is HTMLDivElement => el !== null);

    if (isReducedMotion) {
      // Instant accessible visibility with gentle fade when reduced motion is active
      gsap.set([brandEl, topLabelEl, navLinksEl, supportingCopyEl, scrollBadgeEl], {
        opacity: 1,
        y: 0,
      });
      gsap.set(validLetters, { opacity: 1, y: 0 });
      gsap.set(validStats, { opacity: 1, y: 0 });
      paperRocketRef.current?.updateFlightState(getScrollProgress(), 1);
      return;
    }

    const introState = { factor: 0 };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    // 1. ITZFIZZ branding appears
    if (brandEl) {
      tl.fromTo(
        brandEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45 },
        0.05
      );
    }

    // 2. Small top label & nav links appear
    const headerSecondary = [navLinksEl, topLabelEl].filter(Boolean);
    if (headerSecondary.length > 0) {
      tl.fromTo(
        headerSecondary,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 },
        0.14
      );
    }

    // 3. Headline letters reveal with subtle translateY & stagger
    if (validLetters.length > 0) {
      tl.fromTo(
        validLetters,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.024,
          ease: 'power3.out',
        },
        0.2
      );
    }

    // 4. Supporting text & scroll indicator appear
    const midElements = [supportingCopyEl, scrollBadgeEl].filter(Boolean);
    if (midElements.length > 0) {
      tl.fromTo(
        midElements,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 },
        0.44
      );
    }

    // 5. Statistics appear sequentially one by one
    if (validStats.length > 0) {
      tl.fromTo(
        validStats,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.08,
          ease: 'power2.out',
        },
        0.52
      );
    }

    // 6. Paper rocket enters from right/depth and settles smoothly into starting position
    tl.fromTo(
      introState,
      { factor: 0 },
      {
        factor: 1,
        duration: 0.95,
        ease: 'power3.out',
        onUpdate: () => {
          paperRocketRef.current?.updateFlightState(
            getScrollProgress(),
            introState.factor
          );
        },
      },
      0.22
    );
  });
}
