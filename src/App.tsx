import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from './components/Navigation/Navigation';
import { Hero } from './components/Hero/Hero';
import { StudioSection } from './components/Studio/StudioSection';

export default function App() {
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const navLinksRef = useRef<HTMLElement | null>(null);
  const topLabelRef = useRef<HTMLDivElement | null>(null);

  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Sync with OS prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Jump to any normalized scroll progress [0..1] within the pinned Hero ScrollTrigger
  const handleNavigateToProgress = useCallback(
    (targetFraction: number) => {
      const triggers = ScrollTrigger.getAll();
      const heroTrigger = triggers[0];
      if (heroTrigger) {
        const targetY =
          heroTrigger.start +
          (heroTrigger.end - heroTrigger.start) *
            Math.max(0, Math.min(1, targetFraction));
        window.scrollTo({
          top: targetY,
          behavior: isReducedMotion ? 'auto' : 'smooth',
        });
      }
    },
    [isReducedMotion]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F3EC] text-[#141413]">
      <Navigation
        brandRef={brandRef}
        navLinksRef={navLinksRef}
        topLabelRef={topLabelRef}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={() => setIsReducedMotion((prev) => !prev)}
        onNavigateToProgress={handleNavigateToProgress}
      />

      <main>
        <Hero
          brandRef={brandRef}
          navLinksRef={navLinksRef}
          topLabelRef={topLabelRef}
          isReducedMotion={isReducedMotion}
        />

        <StudioSection
          onNavigateToProgress={handleNavigateToProgress}
          isReducedMotion={isReducedMotion}
        />
      </main>
    </div>
  );
}
