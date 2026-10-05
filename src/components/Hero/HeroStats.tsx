import React from 'react';
import { HERO_STATS } from '../../data/heroData';

interface HeroStatsProps {
  statCardRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  statValueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  statBarRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  statDotRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
}

export const HeroStats: React.FC<HeroStatsProps> = ({
  statCardRefs,
  statValueRefs,
  statBarRefs,
  statDotRefs,
}) => {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1440px] border-t border-[#141413]/10 px-4 pt-4 pb-5 sm:px-8 md:px-12 md:pt-5 md:pb-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4 lg:gap-x-8">
        {HERO_STATS.map((stat, idx) => (
          <div
            key={stat.id}
            ref={(el) => {
              statCardRefs.current[idx] = el;
            }}
            className="will-change-transform relative flex flex-col justify-between border-l border-[#141413]/10 pl-3.5 sm:pl-4"
          >
            {/* Top progress hairline bar that fills as the rocket reaches this metric's threshold */}
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-tech text-[10px] tracking-[0.14em] text-[#57544E]/75">
                {stat.coordCode}
              </span>
              <span
                ref={(el) => {
                  statDotRefs.current[idx] = el;
                }}
                className="h-1.5 w-1.5 rounded-full bg-[#CFCAC0] will-change-transform"
              />
            </div>

            {/* Large Tabular Percentage Value */}
            <div className="flex items-baseline gap-2">
              <span
                ref={(el) => {
                  statValueRefs.current[idx] = el;
                }}
                className="font-mono-tech text-2xl font-medium tracking-tight text-[#9E988E] sm:text-3xl md:text-[34px] will-change-transform"
              >
                {stat.value}
              </span>
            </div>

            {/* Editorial Label & Concise Context */}
            <div className="mt-1">
              <div className="font-mono-tech text-[11px] font-medium tracking-[0.11em] text-[#141413]">
                {stat.label}
              </div>
              <p className="mt-0.5 hidden text-xs text-[#57544E] sm:block">
                {stat.detail}
              </p>
            </div>

            {/* Subtle horizontal progress indicator driven by master scroll timeline */}
            <div className="mt-2.5 h-[1.5px] w-full overflow-hidden bg-[#141413]/[0.07]">
              <div
                ref={(el) => {
                  statBarRefs.current[idx] = el;
                }}
                className="h-full w-full origin-left scale-x-0 bg-[#C85A32] will-change-transform"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
