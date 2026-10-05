import React from 'react';
import { STUDIO_PRINCIPLES } from '../../data/heroData';

interface StudioSectionProps {
  onNavigateToProgress: (targetFraction: number) => void;
  isReducedMotion: boolean;
}

export const StudioSection: React.FC<StudioSectionProps> = ({
  onNavigateToProgress,
  isReducedMotion,
}) => {
  return (
    <section
      id="studio-architecture"
      aria-label="Engineering Architecture and Continuation"
      className="relative z-20 border-t border-[#141413]/12 bg-[#EFECE4] text-[#141413]"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 md:px-12 md:py-28">
        {/* Top Row: Section Kicker + Interactive Flight Scrubber Checkpoints */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#141413]/10 pb-12 lg:flex-row lg:items-end">
          <div>
            <div className="font-mono-tech mb-3 flex items-center gap-2.5 text-xs tracking-[0.14em] text-[#57544E]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C85A32]" />
              <span>CONTINUATION</span>
              <span aria-hidden="true">·</span>
              <span>HERO RELEASED AT 100% FLIGHT COMPLETION</span>
            </div>
            <h2 className="font-display max-w-2xl text-2xl font-bold tracking-tight text-[#141413] sm:text-3xl md:text-4xl [text-wrap:balance]">
              Crafted with deliberate motion, tactile geometry, and deterministic scroll control.
            </h2>
          </div>

          {/* Interactive Flight Checkpoints so reviewers can inspect any stage of the trajectory */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-tech mr-2 text-[11px] tracking-[0.12em] text-[#57544E]">
              INSPECT FLIGHT STAGE:
            </span>
            {[
              { label: '0% Launch', val: 0 },
              { label: '25% Welcome', val: 0.28 },
              { label: '60% Itzfizz', val: 0.62 },
              { label: '100% Complete', val: 0.98 },
            ].map((stage) => (
              <button
                key={stage.label}
                type="button"
                onClick={() => onNavigateToProgress(stage.val)}
                className="font-mono-tech cursor-pointer rounded border border-[#141413]/15 bg-[#F6F3EC] px-3 py-1.5 text-xs font-medium text-[#141413] whitespace-nowrap transition-colors duration-150 hover:border-[#C85A32] hover:text-[#C85A32]"
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Architectural Pillars */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {STUDIO_PRINCIPLES.map((item) => (
            <article
              key={item.index}
              className="flex flex-col justify-between border-l border-[#141413]/12 pl-5"
            >
              <div>
                <div className="font-mono-tech text-xs font-medium tracking-[0.08em] text-[#C85A32]">
                  {item.index}
                </div>
                <h3 className="font-display mt-2 text-lg font-bold text-[#141413] sm:text-xl">
                  {item.title}
                </h3>
                <p className="font-sans-body mt-3 text-[15px] leading-[1.65] text-[#45423D]">
                  {item.summary}
                </p>
              </div>

              <div className="font-mono-tech mt-6 pt-4 text-[11px] tracking-[0.1em] text-[#57544E]">
                {item.specification}
              </div>
            </article>
          ))}
        </div>

        {/* Quiet Editorial Footer */}
        <footer className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-[#141413]/10 pt-8 text-xs text-[#57544E] sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold tracking-[0.12em] text-[#141413]">
              ITZFIZZ DIGITAL
            </span>
            <span aria-hidden="true">·</span>
            <span>Web Development Internship Assignment</span>
            <span aria-hidden="true">·</span>
            <span>Metrics shown in hero are illustrative design placeholders</span>
          </div>

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: isReducedMotion ? 'auto' : 'smooth',
              })
            }
            className="font-mono-tech cursor-pointer text-xs font-medium tracking-[0.12em] text-[#141413] underline decoration-[#C85A32] underline-offset-4 transition-colors duration-150 hover:text-[#C85A32] whitespace-nowrap"
          >
            RETURN TO TOP ↑
          </button>
        </footer>
      </div>
    </section>
  );
};
