import * as THREE from 'three';

export interface ScreenPoint {
  x: number;
  y: number;
  z?: number;
}

export interface FlightPose2D {
  x: number;
  y: number;
  z: number;
  tangentX: number;
  tangentY: number;
  tangentZ: number;
  angleRad: number;
  bankRad: number;
  pitchRad: number;
}

export interface FlightPathData {
  svgPathD: string;
  totalSvgLength: number;
  letterThresholds: number[];
  samplePoseAt: (progress: number) => FlightPose2D;
  controlPoints: ScreenPoint[];
}

/**
 * Builds a unified, smooth Catmull-Rom flight path anchored to the hero viewport
 * and the real measured DOM positions of the 14 headline characters:
 * W E L C O M E (0..6) and I T Z F I Z Z (7..13).
 *
 * This guarantees:
 * 1. The 3D paper rocket starts in its poised upper-right position at 0% scroll.
 * 2. It lifts slightly, arcs gracefully across the upper canvas, dips toward 'W',
 *    glides through every character of WELCOME and ITZFIZZ with natural aerodynamic
 *    undulation, and finishes with a gentle climb.
 * 3. Every letter's activation threshold `letterThresholds[i]` matches the exact
 *    scroll progress when the paper rocket reaches that letter.
 */
export function buildFlightPathData(
  width: number,
  height: number,
  letterCenters: ScreenPoint[],
  isReducedMotion: boolean
): FlightPathData {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 480);
  const isMobile = safeW < 768;

  // Fallback synthetic letter positions if DOM refs haven't measured yet
  const letters: ScreenPoint[] =
    letterCenters.length === 14
      ? letterCenters
      : Array.from({ length: 14 }, (_, i) => {
          if (i < 7) {
            const t = i / 6;
            return {
              x: safeW * (0.09 + t * 0.42),
              y: safeH * 0.39,
            };
          } else {
            const t = (i - 7) / 6;
            return {
              x: safeW * (0.45 + t * 0.42),
              y: safeH * 0.54,
            };
          }
        });

  const firstW = letters[0];
  const lastWelcomeE = letters[6];
  const firstItzfizzI = letters[7];
  const lastItzfizzZ = letters[13];

  // Construct key waypoints in screen pixel space (with normalized depth z in [-0.35, 0.45])
  const waypoints: Array<{ pt: THREE.Vector3; letterIdx?: number }> = [];

  if (isReducedMotion) {
    // Simplified, calm glide path for prefers-reduced-motion
    waypoints.push({
      pt: new THREE.Vector3(safeW * 0.82, safeH * 0.25, 0.15),
    });
    waypoints.push({
      pt: new THREE.Vector3(firstW.x - 24, firstW.y, 0.05),
    });
    letters.forEach((l, idx) => {
      waypoints.push({
        pt: new THREE.Vector3(l.x, l.y, 0.05),
        letterIdx: idx,
      });
    });
    waypoints.push({
      pt: new THREE.Vector3(
        Math.min(safeW * 0.91, lastItzfizzZ.x + safeW * 0.06),
        lastItzfizzZ.y - safeH * 0.06,
        0.12
      ),
    });
  } else {
    // Full natural paper-glider trajectory:
    // 1. Poised resting start on upper-right
    const startX = isMobile ? safeW * 0.81 : safeW * 0.83;
    const startY = isMobile ? safeH * 0.20 : safeH * 0.22;
    waypoints.push({
      pt: new THREE.Vector3(startX, startY, 0.28),
    });

    // 2. Slight upward lift + gentle sweeping arc toward the left entry
    waypoints.push({
      pt: new THREE.Vector3(
        safeW * (isMobile ? 0.54 : 0.56),
        safeH * (isMobile ? 0.14 : 0.15),
        0.38
      ),
    });

    waypoints.push({
      pt: new THREE.Vector3(
        Math.max(safeW * 0.06, firstW.x - (isMobile ? 18 : 42)),
        Math.min(firstW.y - (isMobile ? 36 : 56), safeH * 0.26),
        0.22
      ),
    });

    // 3. Subtle entry dip approaching 'W'
    waypoints.push({
      pt: new THREE.Vector3(
        Math.max(safeW * 0.04, firstW.x - (isMobile ? 16 : 36)),
        firstW.y + (isMobile ? 6 : 12),
        0.12
      ),
    });

    // 4. Glide through W E L C O M E (indices 0..6) with gentle aerodynamic wave
    for (let i = 0; i < 7; i++) {
      const l = letters[i];
      // Subtle wave offset so the plane glides gracefully through the letterforms
      const waveY = Math.sin((i / 6) * Math.PI * 1.35) * (isMobile ? -6 : -11);
      const waveZ = 0.08 + Math.sin((i / 6) * Math.PI) * 0.16;
      waypoints.push({
        pt: new THREE.Vector3(l.x, l.y + waveY, waveZ),
        letterIdx: i,
      });
    }

    // 5. Smooth transition between 'E' of WELCOME and 'I' of ITZFIZZ
    const dxRow = firstItzfizzI.x - lastWelcomeE.x;
    const dyRow = firstItzfizzI.y - lastWelcomeE.y;
    if (dxRow < -safeW * 0.12) {
      // Stacked rows (mobile / narrow screens): smooth sweeping S-curve from right of row 1 to left of row 2
      waypoints.push({
        pt: new THREE.Vector3(
          (lastWelcomeE.x + firstItzfizzI.x) * 0.5,
          lastWelcomeE.y + dyRow * 0.52,
          0.26
        ),
      });
    } else {
      // Stepped editorial rows (desktop): subtle aerodynamic dip between row 1 and row 2
      waypoints.push({
        pt: new THREE.Vector3(
          lastWelcomeE.x + dxRow * 0.5,
          lastWelcomeE.y + dyRow * 0.58 + 6,
          0.22
        ),
      });
    }

    // 6. Glide + smooth rise through I T Z F I Z Z (indices 7..13)
    for (let i = 7; i < 14; i++) {
      const l = letters[i];
      const localIdx = i - 7;
      const waveY = Math.cos((localIdx / 6) * Math.PI * 1.2) * (isMobile ? 5 : 9);
      const waveZ = 0.1 + Math.sin((localIdx / 6) * Math.PI) * 0.18;
      waypoints.push({
        pt: new THREE.Vector3(l.x, l.y + waveY, waveZ),
        letterIdx: i,
      });
    }

    // 7. Final gentle climb & settle after the last 'Z'
    const endX = isMobile
      ? Math.min(safeW * 0.91, lastItzfizzZ.x + safeW * 0.06)
      : Math.min(safeW * 0.93, lastItzfizzZ.x + safeW * 0.07);
    const endY = isMobile
      ? Math.max(safeH * 0.24, lastItzfizzZ.y - safeH * 0.08)
      : Math.max(safeH * 0.26, lastItzfizzZ.y - safeH * 0.15);

    waypoints.push({
      pt: new THREE.Vector3(endX, endY, 0.32),
    });
  }

  const curvePoints = waypoints.map((w) => w.pt);
  const spline = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.45);

  // Sample 500 arc-length points to build the SVG path and locate exact letter thresholds
  const SAMPLE_COUNT = 500;
  const sampledPoints: THREE.Vector3[] = [];
  for (let s = 0; s <= SAMPLE_COUNT; s++) {
    const u = s / SAMPLE_COUNT;
    sampledPoints.push(spline.getPointAt(u));
  }

  // Find the exact scroll progress u in [0, 1] where the rocket reaches each letter 0..13
  // Search in monotonically increasing windows after the initial arc (u >= 0.14)
  const letterThresholds: number[] = [];
  let minSearchIdx = isReducedMotion ? Math.floor(SAMPLE_COUNT * 0.05) : Math.floor(SAMPLE_COUNT * 0.15);

  for (let i = 0; i < 14; i++) {
    const target = letters[i];
    let bestIdx = minSearchIdx;
    let bestDistSq = Infinity;

    // Limit search window so thresholds stay strictly ordered
    const maxSearchIdx = Math.floor(SAMPLE_COUNT * (0.24 + (i / 13) * 0.72));
    const searchEnd = Math.max(minSearchIdx + 6, Math.min(SAMPLE_COUNT - 5, maxSearchIdx));

    for (let s = minSearchIdx; s <= searchEnd; s++) {
      const pt = sampledPoints[s];
      const dx = pt.x - target.x;
      const dy = pt.y - target.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestIdx = s;
      }
    }

    const threshold = bestIdx / SAMPLE_COUNT;
    letterThresholds.push(threshold);
    minSearchIdx = Math.max(minSearchIdx + 4, bestIdx);
  }

  // Build smooth SVG path string from sampled points
  let svgPathD = '';
  let totalSvgLength = 0;
  const SVG_SAMPLES = 180;
  let prevPt = spline.getPointAt(0);
  svgPathD = `M ${prevPt.x.toFixed(1)} ${prevPt.y.toFixed(1)}`;

  for (let s = 1; s <= SVG_SAMPLES; s++) {
    const pt = spline.getPointAt(s / SVG_SAMPLES);
    totalSvgLength += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
    svgPathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    prevPt = pt;
  }

  const samplePoseAt = (rawProgress: number): FlightPose2D => {
    const u = THREE.MathUtils.clamp(rawProgress, 0, 1);
    const pos = spline.getPointAt(u);
    const tangent = spline.getTangentAt(u).normalize();

    // Sample slightly ahead and behind to calculate natural banking (roll) on curves
    const delta = 0.025;
    const uPrev = Math.max(0, u - delta);
    const uNext = Math.min(1, u + delta);
    const tanPrev = spline.getTangentAt(uPrev);
    const tanNext = spline.getTangentAt(uNext);

    const anglePrev = Math.atan2(tanPrev.y, tanPrev.x);
    const angleNext = Math.atan2(tanNext.y, tanNext.x);

    // Shortest angular difference for curvature banking
    let dAngle = angleNext - anglePrev;
    while (dAngle > Math.PI) dAngle -= Math.PI * 2;
    while (dAngle < -Math.PI) dAngle += Math.PI * 2;

    const angleRad = Math.atan2(tangent.y, tangent.x);
    const bankRad = isReducedMotion
      ? 0
      : THREE.MathUtils.clamp(dAngle * 1.15, -0.52, 0.52);
    const pitchRad = isReducedMotion
      ? 0
      : THREE.MathUtils.clamp(-tangent.y * 0.45, -0.35, 0.35);

    return {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      tangentX: tangent.x,
      tangentY: tangent.y,
      tangentZ: tangent.z,
      angleRad,
      bankRad,
      pitchRad,
    };
  };

  return {
    svgPathD,
    totalSvgLength,
    letterThresholds,
    samplePoseAt,
    controlPoints: curvePoints.map((v) => ({ x: v.x, y: v.y, z: v.z })),
  };
}
