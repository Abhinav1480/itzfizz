import React from 'react';
import { HEADLINE_LETTERS } from '../../data/heroData';

interface HeroHeadlineProps {
  letterRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  letterTickRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  headlineContainerRef: React.RefObject<HTMLDivElement | null>;
  supportingCopyRef: React.RefObject<HTMLDivElement | null>;
  scrollBadgeRef: React.RefObject<HTMLDivElement | null>;
  progressTextRef: React.RefObject<HTMLSpanElement | null>;
}

export const HeroHeadline: React.FC<HeroHeadlineProps> = ({
  letterRefs,
  letterTickRefs,
  headlineContainerRef,
  supportingCopyRef,
  scrollBadgeRef,
  progressTextRef,
}) => {
  const welcomeLetters = HEADLINE_LETTERS.filter((l) => l.wordIndex === 0);
  const itzfizzLetters = HEADLINE_LETTERS.filter((l) => l.wordIndex === 1);

  return (
    <div
      ref={headlineContainerRef}
      className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-4 pt-16 pb-4 sm:px-8 md:px-12"
    >
      {/* Top micro-row: Editorial Coordinate + Upper-Right Rocket Launch Caption */}
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="font-mono-tech flex items-center gap-2.5 text-[11px] tracking-[0.14em] text-[#57544E]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
          <span>EDITION 2026</span>
          <span aria-hidden="true">·</span>
          <span>INTERACTIVE IDENTITY</span>
        </div>

        {/* Scroll to Explore + Live Scrub Readout */}
        <div
          ref={scrollBadgeRef}
          className="font-mono-tech flex items-center gap-3 text-[11px] tracking-[0.16em] text-[#57544E]"
        >
          <span>SCROLL TO EXPLORE</span>
          <span aria-hidden="true" className="text-[#141413]/25">
            /
          </span>
          <span
            ref={progressTextRef}
            className="min-w-[3.2ch] text-right font-medium text-[#C85A32]"
          >
            00%
          </span>
        </div>
      </div>

      {/* Main Letter-Spaced Headline: W E L C O M E / I T Z F I Z Z */}
      <h1
        aria-label="WELCOME ITZFIZZ"
        className="font-display relative flex flex-col gap-3 select-none sm:gap-4 md:gap-5"
      >
        {/* Row 1: W E L C O M E (Positioned across left-to-center field) */}
        <span className="flex w-full items-center justify-between md:w-[62%] lg:w-[58%]">
          {welcomeLetters.map((item) => (
            <span
              key={item.id}
              ref={(el) => {
                letterRefs.current[item.globalIndex] = el;
              }}
              data-letter-index={item.globalIndex}
              className="will-change-transform relative inline-flex flex-col items-center font-extrabold tracking-tight text-[clamp(2.35rem,6.6vw,6.2rem)] leading-[0.94] text-[#D2CDC2] transition-none"
            >
              <span>{item.char}</span>
              {/* Subtle registration indicator below each letter that illuminates on activation */}
              <span
                ref={(el) => {
                  letterTickRefs.current[item.globalIndex] = el;
                }}
                className="mt-1.5 h-1 w-1 rounded-full bg-[#C85A32] opacity-0 will-change-transform"
              />
            </span>
          ))}
        </span>

        {/* Row 2: I T Z F I Z Z (Stepped right on tablet/desktop so the airplane glides continuously across all 14 letters) */}
        <span className="flex w-full items-center justify-between md:ml-auto md:w-[60%] lg:w-[56%]">
          {itzfizzLetters.map((item) => (
            <span
              key={item.id}
              ref={(el) => {
                letterRefs.current[item.globalIndex] = el;
              }}
              data-letter-index={item.globalIndex}
              className="will-change-transform relative inline-flex flex-col items-center font-extrabold tracking-tight text-[clamp(2.35rem,6.6vw,6.2rem)] leading-[0.94] text-[#D2CDC2] transition-none"
            >
              <span>{item.char}</span>
              <span
                ref={(el) => {
                  letterTickRefs.current[item.globalIndex] = el;
                }}
                className="mt-1.5 h-1 w-1 rounded-full bg-[#C85A32] opacity-0 will-change-transform"
              />
            </span>
          ))}
        </span>
      </h1>

      {/* Supporting Editorial Copy + Scroll Direction Cue */}
      <div
        ref={supportingCopyRef}
        className="mt-6 flex flex-col justify-between gap-4 pt-3 sm:flex-row sm:items-end md:mt-8"
      >
        <p className="font-sans-body max-w-md text-[15px] leading-[1.6] font-normal text-[#45423D] sm:text-base [text-wrap:balance]">
          Digital experiences engineered to move people, brands, and businesses
          forward.
        </p>

        <div className="font-mono-tech flex items-center gap-3 text-[11px] tracking-[0.14em] text-[#57544E]">
          <span>FLIGHT PATH</span>
          <span aria-hidden="true">·</span>
          <span>14 WAYPOINTS</span>
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-px bg-[#141413]/20"
          />
          <span className="text-[#141413]">DIRECT SCROLL SCRUB</span>
        </div>
      </div>
    </div>
  );
};
