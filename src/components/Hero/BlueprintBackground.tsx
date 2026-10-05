import React, { forwardRef } from 'react';

export const BlueprintBackground = forwardRef<SVGSVGElement>((_, compassRef) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Ultra-thin architectural column and row grid lines */}
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-4 border-x border-[#141413]/[0.055] px-4 sm:px-8 md:grid-cols-12 md:px-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`h-full border-r border-[#141413]/[0.04] last:border-r-0 ${
              i >= 4 ? 'hidden md:block' : ''
            }`}
          />
        ))}
      </div>

      {/* Horizontal datum guide lines */}
      <div className="absolute inset-x-0 top-[22%] h-px bg-[#141413]/[0.05]" />
      <div className="absolute inset-x-0 top-[50%] h-px bg-[#141413]/[0.045]" />
      <div className="absolute inset-x-0 bottom-[23%] h-px bg-[#141413]/[0.06]" />

      {/* Delicate geometric arcs, circles, and registration marks */}
      <svg
        ref={compassRef}
        className="absolute inset-0 h-full w-full will-change-transform"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Upper-right launch zone calibration rings */}
        <circle
          cx="1180"
          cy="198"
          r="112"
          stroke="#141413"
          strokeOpacity="0.065"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <circle
          cx="1180"
          cy="198"
          r="195"
          stroke="#141413"
          strokeOpacity="0.045"
          strokeWidth="1"
        />
        <path
          d="M 1180 70 L 1180 326 M 1052 198 L 1308 198"
          stroke="#141413"
          strokeOpacity="0.05"
          strokeWidth="1"
        />

        {/* Large subtle editorial drafting arc across the hero field */}
        <path
          d="M 90 540 A 680 680 0 0 1 1320 260"
          stroke="#141413"
          strokeOpacity="0.055"
          strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Left entry datum arc */}
        <circle
          cx="170"
          cy="355"
          r="84"
          stroke="#141413"
          strokeOpacity="0.05"
          strokeWidth="1"
        />

        {/* Small precision crosshair marks (+) */}
        {[
          [170, 198],
          [720, 198],
          [170, 450],
          [720, 450],
          [1180, 450],
          [445, 685],
          [995, 685],
        ].map(([cx, cy], idx) => (
          <g key={idx} stroke="#141413" strokeOpacity="0.18" strokeWidth="1">
            <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} />
            <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} />
          </g>
        ))}
      </svg>

      {/* Tiny technical coordinate annotations in corners */}
      <div className="font-mono-tech absolute top-20 left-6 hidden text-[10px] tracking-[0.18em] text-[#141413]/35 lg:block">
        GRID REF · 48.1351° N / 11.5820° E
      </div>
      <div className="font-mono-tech absolute top-20 right-6 hidden text-[10px] tracking-[0.18em] text-[#141413]/35 lg:block">
        AERO-PATH · SCRUB 1:1
      </div>
    </div>
  );
});

BlueprintBackground.displayName = 'BlueprintBackground';
