import React from 'react';

interface FlightTrailProps {
  svgPathD: string;
  totalLength: number;
  width: number;
  height: number;
  trailPathRef: React.RefObject<SVGPathElement | null>;
  trailGlowPathRef: React.RefObject<SVGPathElement | null>;
  startMarkerPos?: { x: number; y: number };
}

export const FlightTrail: React.FC<FlightTrailProps> = ({
  svgPathD,
  totalLength,
  width,
  height,
  trailPathRef,
  trailGlowPathRef,
  startMarkerPos,
}) => {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 480);
  const dashLen = Math.max(totalLength, 1);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      viewBox={`0 0 ${safeW} ${safeH}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Faint architectural draft guide showing planned trajectory */}
      {svgPathD && (
        <path
          d={svgPathD}
          stroke="#141413"
          strokeOpacity="0.075"
          strokeWidth="1"
          strokeDasharray="3 7"
        />
      )}

      {/* Subtle warm halo under the active ink trail */}
      {svgPathD && (
        <path
          ref={trailGlowPathRef}
          d={svgPathD}
          stroke="#C85A32"
          strokeOpacity="0.16"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: dashLen,
            strokeDashoffset: dashLen,
          }}
        />
      )}

      {/* Crisp ink/pencil flight path drawn progressively behind the paper airplane */}
      {svgPathD && (
        <path
          ref={trailPathRef}
          d={svgPathD}
          stroke="#C85A32"
          strokeOpacity="0.72"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: dashLen,
            strokeDashoffset: dashLen,
          }}
        />
      )}

      {/* Subtle launch origin registration ring at 0% position */}
      {startMarkerPos && (
        <g transform={`translate(${startMarkerPos.x}, ${startMarkerPos.y})`}>
          <circle
            r="14"
            stroke="#C85A32"
            strokeOpacity="0.32"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <circle r="2.5" fill="#C85A32" fillOpacity="0.65" />
        </g>
      )}
    </svg>
  );
};
