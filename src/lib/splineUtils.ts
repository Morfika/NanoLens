export interface SplinePoint {
  id: string;
  nm: number;
  H: number;
  S: number;
  V: number;
  hex: string;
}

export const SPLINE_RAW: SplinePoint[] = [
  { id: "M5", nm: 20.70, H: 30, S: 10, V: 71, hex: "#B4ABA2" },
  { id: "M4", nm: 29.04, H: 33, S: 24, V: 69, hex: "#B19E86" },
  { id: "M1", nm: 32.74, H: 39, S: 31, V: 73, hex: "#B9A57F" },
  { id: "M2", nm: 35.40, H: 44, S: 57, V: 75, hex: "#C8A352" },
  { id: "M3", nm: 42.46, H: 40, S: 77, V: 78, hex: "#C6932E" },
  { id: "M6", nm: 49.18, H: 35, S: 32, V: 51, hex: "#827159" },
  { id: "M7", nm: 83.40, H: 38, S: 29, V: 43, hex: "#6D614D" },
];

/**
 * Catmull-Rom cubic spline interpolation
 */
export function catmullRom(points: [number, number][], t: number): number {
  const n = points.length;
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[n - 1][0]) return points[n - 1][1];
  
  let i = 1;
  while (i < n - 1 && points[i][0] < t) i++;
  i = Math.min(i, n - 2);
  
  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(n - 1, i + 2)];
  
  const tt = (t - p1[0]) / (p2[0] - p1[0]);
  const tt2 = tt * tt;
  const tt3 = tt2 * tt;
  
  return 0.5 * (
    p0[1] * (-tt3 + 2 * tt2 - tt) +
    p1[1] * (3 * tt3 - 5 * tt2 + 2) +
    p2[1] * (-3 * tt3 + 4 * tt2 + tt) +
    p3[1] * (tt3 - tt2)
  );
}

/**
 * Converts HSV values to Hex string representation
 */
export function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  const toH = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return ("#" + toH(r) + toH(g) + toH(b)).toUpperCase();
}

export interface SplineEstimation {
  estimatedDiameter: number;
  splineHex: string;
  distance: number;
}

/**
 * Estimates the nanoparticle diameter from target HSV values using inverse Catmull-Rom search
 */
export function estimateDiameterFromHSV(targetH: number, targetS: number, targetV: number): SplineEstimation {
  const minD = 20.70;
  const maxD = 83.40;
  const steps = 1000;
  
  let bestD = minD;
  let minDistance = Infinity;
  let bestH = 0;
  let bestS = 0;
  let bestV = 0;
  
  const hueDiff = (h1: number, h2: number) => {
    const diff = Math.abs(h1 - h2) % 360;
    return diff > 180 ? 360 - diff : diff;
  };

  const ptH: [number, number][] = SPLINE_RAW.map(d => [d.nm, d.H]);
  const ptS: [number, number][] = SPLINE_RAW.map(d => [d.nm, d.S]);
  const ptV: [number, number][] = SPLINE_RAW.map(d => [d.nm, d.V]);

  for (let i = 0; i <= steps; i++) {
    const d = minD + (i * (maxD - minD)) / steps;
    const h = catmullRom(ptH, d);
    const s = catmullRom(ptS, d);
    const v = catmullRom(ptV, d);
    
    // HSV weighted distance (Hue weight = 2.0 to prioritize color tone)
    const dh = hueDiff(h, targetH);
    const ds = s - targetS;
    const dv = v - targetV;
    const dist = 2.0 * dh * dh + ds * ds + dv * dv;
    
    if (dist < minDistance) {
      minDistance = dist;
      bestD = d;
      bestH = h;
      bestS = s;
      bestV = v;
    }
  }
  
  // Clamp computed HSV components before hex conversion
  const Hc = Math.max(0, Math.min(360, bestH));
  const Sc = Math.max(0, Math.min(100, bestS));
  const Vc = Math.max(0, Math.min(100, bestV));
  const splineHex = hsvToHex(Hc, Sc, Vc);
  
  return {
    estimatedDiameter: parseFloat(bestD.toFixed(2)),
    splineHex,
    distance: Math.sqrt(minDistance)
  };
}
