import React from 'react';

interface NavigationProps {
  brandRef: React.RefObject<HTMLAnchorElement | null>;
  navLinksRef: React.RefObject<HTMLElement | null>;
  topLabelRef: React.RefObject<HTMLDivElement | null>;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onNavigateToProgress: (targetFraction: number) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  brandRef,
  navLinksRef,
  topLabelRef,
  isReducedMotion,
  onToggleReducedMotion,
  onNavigateToProgress,
}) => {
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-30 border-b border-[#141413]/[0.07] bg-[#F6F3EC]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8 md:h-16 md:px-12">
        {/* Zone 1: Single text element wordmark */}
        <a
          ref={brandRef}
          href="#hero-top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' });
          }}
          className="font-display text-lg font-extrabold tracking-[0.14em] text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C85A32]"
        >
          ITZFIZZ
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          ref={navLinksRef}
          aria-label="Primary Navigation"
          className="hidden items-center gap-7 text-xs font-medium tracking-[0.06em] text-[#57544E] lg:flex"
        >
          <button
            type="button"
            onClick={() => onNavigateToProgress(0)}
            className="cursor-pointer whitespace-nowrap transition-colors duration-150 hover:text-[#141413]"
          >
            Origin (0%)
          </button>
          <button
            type="button"
            onClick={() => onNavigateToProgress(0.42)}
            className="cursor-pointer whitespace-nowrap transition-colors duration-150 hover:text-[#141413]"
          >
            Mid-Flight (42%)
          </button>
          <button
            type="button"
            onClick={() => onNavigateToProgress(0.88)}
            className="cursor-pointer whitespace-nowrap transition-colors duration-150 hover:text-[#141413]"
          >
            Metrics (88%)
          </button>
          <a
            href="#studio-architecture"
            onClick={(e) => handleScrollToSection(e, 'studio-architecture')}
            className="whitespace-nowrap transition-colors duration-150 hover:text-[#141413]"
          >
            Architecture
          </a>
        </nav>

        {/* Zone 3: Top Right Studio Label + Accessible Motion Toggle */}
        <div ref={topLabelRef} className="flex items-center gap-4">
          <span className="font-mono-tech hidden text-[11px] tracking-[0.14em] text-[#57544E] sm:inline-block whitespace-nowrap">
            DIGITAL EXPERIENCES / CREATIVE DEVELOPMENT
          </span>

          <button
            type="button"
            onClick={onToggleReducedMotion}
            aria-pressed={isReducedMotion}
            title="Toggle Reduced Motion accessibility mode"
            className="font-mono-tech cursor-pointer rounded border border-[#141413]/15 bg-[#EFECE4]/80 px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-[#141413] whitespace-nowrap transition-colors duration-150 hover:border-[#C85A32] hover:text-[#C85A32] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C85A32]"
          >
            {isReducedMotion ? 'MOTION: REDUCED' : 'MOTION: FULL'}
          </button>
        </div>
      </div>
    </header>
  );
};
